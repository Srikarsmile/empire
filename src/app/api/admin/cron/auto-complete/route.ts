import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { buildReviewRequestEmail } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const token = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || token !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mark any "upcoming" reservations whose checkOut date has already passed as "completed"
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  // Find reservations to complete so we can send review emails
  const toComplete = await prisma.reservation.findMany({
    where: { status: 'upcoming', checkOut: { lte: yesterdayKey } },
  });

  if (toComplete.length > 0) {
    await prisma.reservation.updateMany({
      where: { id: { in: toComplete.map((r) => r.id) } },
      data: { status: 'completed' },
    });
  }

  // Send post-trip review request emails (best-effort)
  if (toComplete.length > 0 && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';

    for (const reservation of toComplete) {
      try {
        const bookingRef = reservation.id.slice(-8).toUpperCase();
        const { subject, html } = buildReviewRequestEmail({
          firstName: reservation.firstName,
          vehicleTitle: reservation.vehicleTitle,
          vehicleId: reservation.vehicleId,
          bookingRef,
          appUrl,
        });
        await resend.emails.send({
          from: 'Empire Cars <noreply@empirerentcar.com>',
          to: reservation.email,
          subject,
          html,
        });
      } catch (err) {
        console.error(`Cron: failed to send review email for reservation ${reservation.id}:`, err);
      }
    }
  }

  return NextResponse.json({ updated: toComplete.length });
}
