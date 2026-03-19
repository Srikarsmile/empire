import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { Resend } from 'resend';
import { buildCancellationEmail } from '@/lib/emailTemplates';
import type { DateRange } from '@/lib/dateUtils';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  const { id } = await params;
  const { status } = await request.json();

  if (!['upcoming', 'completed', 'cancelled', 'payment_pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status },
  });

  // When cancelling, release the blocked dates back so the calendar shows them as available
  if (status === 'cancelled') {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: reservation.vehicleId } });
    if (vehicle) {
      const existing = (vehicle.bookedRanges as unknown as DateRange[]) ?? [];
      const updated = existing.filter(
        (r) => !(r.start === reservation.checkIn && r.end === reservation.checkOut),
      );
      await prisma.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { bookedRanges: JSON.parse(JSON.stringify(updated)) },
      });
    }
  }

  // Send cancellation email to customer (best-effort)
  if (status === 'cancelled') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
      const sc = await prisma.siteContent.findFirst();
      const scData = (sc?.data as Record<string, unknown>) ?? {};
      const adminPhone = (scData.companyPhone as string) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);
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
  }

  return NextResponse.json(reservation);
}
