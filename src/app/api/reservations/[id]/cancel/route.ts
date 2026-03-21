import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { buildCancellationEmail } from '@/lib/emailTemplates';
import type { DateRange } from '@/lib/dateUtils';

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get('empire_email')?.value;

  if (!cookieEmail) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
  }

  if (reservation.email.toLowerCase().trim() !== cookieEmail.toLowerCase().trim()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (reservation.status !== 'upcoming') {
    return NextResponse.json({ error: 'Only upcoming reservations can be cancelled' }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'cancelled' },
  });

  // Release the blocked dates back so the calendar shows them as available
  const vehicle = await prisma.vehicle.findUnique({ where: { id: reservation.vehicleId } });
  if (vehicle) {
    const existing = (vehicle.bookedRanges as unknown as DateRange[]) ?? [];
    const filtered = existing.filter(
      (r) => !(r.start === reservation.checkIn && r.end === reservation.checkOut),
    );
    await prisma.vehicle.update({
      where: { id: reservation.vehicleId },
      data: { bookedRanges: JSON.parse(JSON.stringify(filtered)) },
    });
  }

  // Send cancellation email (best-effort)
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
    const sc = await prisma.siteContent.findFirst();
    const scData = (sc?.data as Record<string, unknown>) ?? {};
    const adminPhone = (scData.companyPhone as string) || ((scData.business as Record<string, string>)?.phone) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);
    const bookingRef = reservation.id.slice(-8).toUpperCase();
    const { subject, html } = buildCancellationEmail({
      firstName: reservation.firstName,
      vehicleTitle: reservation.vehicleTitle,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      bookingRef,
      appUrl,
      adminPhone,
    });
    await resend.emails.send({
      from: 'Empire Cars <noreply@empirerentcar.com>',
      to: reservation.email,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send cancellation email:', err);
  }

  return NextResponse.json(updated);
}
