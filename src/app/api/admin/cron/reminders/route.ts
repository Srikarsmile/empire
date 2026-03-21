import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { buildReminderEmail } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const token = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || token !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const tomorrowKey = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

  const reservations = await prisma.reservation.findMany({
    where: { status: 'upcoming', checkIn: tomorrowKey },
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
  const sc = await prisma.siteContent.findFirst();
  const scData = (sc?.data as Record<string, unknown>) ?? {};
  const adminPhone = (scData.companyPhone as string) || ((scData.business as Record<string, string>)?.phone) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);

  let sent = 0;
  for (const r of reservations) {
    try {
      const bookingRef = r.id.slice(-8).toUpperCase();
      const { subject, html } = buildReminderEmail({
        firstName: r.firstName,
        vehicleTitle: r.vehicleTitle,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        nights: r.nights,
        bookingRef,
        appUrl,
        adminPhone,
      });
      await resend.emails.send({
        from: 'Empire Cars <noreply@empirerentcar.com>',
        to: r.email,
        subject,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Reminder email failed for reservation ${r.id}:`, err);
    }
  }

  return NextResponse.json({ sent, total: reservations.length });
}
