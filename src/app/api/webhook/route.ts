import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { findBySessionId, addReservation } from '@/lib/reservationStore';
import { prisma } from '@/lib/prisma';
import type { DateRange } from '@/lib/dateUtils';
import { buildConfirmationEmail } from '@/lib/emailTemplates';

export const runtime = 'nodejs';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    // Dedup — confirm route may have already created it
    const existing = await findBySessionId(session.id);
    if (existing) {
      // If this was a payment_pending manual booking, upgrade it now
      if (existing.status === 'payment_pending') {
        await prisma.reservation.update({ where: { id: existing.id }, data: { status: 'upcoming' } });
        const veh = await prisma.vehicle.findUnique({ where: { id: existing.vehicleId } });
        if (veh) {
          const ranges = (veh.bookedRanges as unknown as DateRange[]) ?? [];
          await prisma.vehicle.update({
            where: { id: existing.vehicleId },
            data: { bookedRanges: JSON.parse(JSON.stringify([...ranges, { start: existing.checkIn, end: existing.checkOut }])) },
          });
        }
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
        const sc = await prisma.siteContent.findFirst();
        const scData = (sc?.data as Record<string, unknown>) ?? {};
        const adminPhone = (scData.companyPhone as string) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);
        const bookingRef = existing.id.slice(-8).toUpperCase();
        const { subject, html: confirmHtml } = buildConfirmationEmail({
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
          phone: existing.phone,
          vehicleTitle: existing.vehicleTitle,
          vehicleImage: existing.vehicleImage,
          checkIn: existing.checkIn,
          checkOut: existing.checkOut,
          nights: existing.nights,
          subtotal: existing.subtotal,
          taxes: existing.taxes,
          airportFee: existing.airportFee,
          insuranceFee: existing.insuranceFee,
          dropoffLocation: existing.dropoffLocation,
          total: existing.total,
          bookingRef,
          appUrl,
          adminPhone,
        });
        try {
          await resend.emails.send({
            from: 'Empire Cars <noreply@empirerentcar.com>',
            to: existing.email,
            subject,
            html: confirmHtml,
          });
        } catch (err) {
          console.error('Webhook: failed to send confirmation for payment_pending upgrade:', err);
        }
        console.log('Webhook: payment_pending reservation confirmed', existing.id);
      }
      return NextResponse.json({ received: true });
    }

    const meta = session.metadata ?? {};

    const reservation = await addReservation({
      stripeSessionId: session.id,
      vehicleId: meta.vehicleId,
      vehicleTitle: meta.vehicleTitle,
      vehicleImage: meta.vehicleImage,
      checkIn: meta.checkIn,
      checkOut: meta.checkOut,
      nights: Number(meta.nights),
      price: Number(meta.price),
      subtotal: Number(meta.subtotal),
      taxes: Number(meta.taxes),
      airportFee: Number(meta.airportFee ?? 0),
      dropoffLocation: meta.dropoffLocation ?? '',
      insuranceFee: Number(meta.insuranceFee ?? 0),
      total: Number(meta.total),
      firstName: meta.firstName,
      lastName: meta.lastName,
      email: meta.email,
      phone: meta.phone,
    });

    // Block dates on the vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { id: meta.vehicleId } });
    if (vehicle) {
      const existing = (vehicle.bookedRanges as unknown as DateRange[]) ?? [];
      const updated: DateRange[] = [...existing, { start: meta.checkIn, end: meta.checkOut }];
      await prisma.vehicle.update({
        where: { id: meta.vehicleId },
        data: { bookedRanges: JSON.parse(JSON.stringify(updated)) },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
    const phone = process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null;
    const bookingRef = reservation.id.slice(-8).toUpperCase();

    // Send professional confirmation email to customer
    const { subject, html: confirmHtml } = buildConfirmationEmail({
      firstName: meta.firstName,
      lastName: meta.lastName,
      email: meta.email,
      phone: meta.phone,
      vehicleTitle: meta.vehicleTitle,
      vehicleImage: meta.vehicleImage,
      checkIn: meta.checkIn,
      checkOut: meta.checkOut,
      nights: meta.nights,
      subtotal: meta.subtotal,
      taxes: meta.taxes,
      airportFee: meta.airportFee,
      insuranceFee: meta.insuranceFee,
      dropoffLocation: meta.dropoffLocation,
      total: meta.total,
      bookingRef,
      appUrl,
      adminPhone: phone,
    });

    try {
      await resend.emails.send({
        from: 'Empire Cars <noreply@empirerentcar.com>',
        to: meta.email,
        subject,
        html: confirmHtml,
      });
    } catch (err) {
      console.error('Failed to send customer confirmation email:', err);
    }

    // Send notification email to admin(s)
    const adminEmails = String(process.env.ADMIN_EMAIL ?? '').split(',').map((e) => e.trim()).filter(Boolean);
    if (adminEmails.length > 0) {
      try {
        await resend.emails.send({
          from: 'Empire Cars <noreply@empirerentcar.com>',
          to: adminEmails,
          subject: `New booking — ${meta.vehicleTitle} ($${meta.total})`,
          text: [
            `New reservation #${bookingRef}`,
            ``,
            `Guest: ${meta.firstName} ${meta.lastName}`,
            `Email: ${meta.email}`,
            `Phone: ${meta.phone}`,
            `Vehicle: ${meta.vehicleTitle}`,
            `Pickup: ${formatDate(meta.checkIn)}`,
            `Return: ${formatDate(meta.checkOut)}`,
            `Days: ${meta.nights}`,
            `Total: $${meta.total}`,
            ``,
            `View in admin: ${appUrl}/admin/reservations`,
          ].join('\n'),
        });
      } catch (err) {
        console.error('Failed to send admin notification email:', err);
      }
    }

    console.log('Webhook: reservation created', reservation.id);
  }

  return NextResponse.json({ received: true });
}
