import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { findBySessionId, addReservation } from '@/lib/reservationStore';
import { prisma } from '@/lib/prisma';
import type { DateRange } from '@/data/vehicleMeta';

export const runtime = 'nodejs';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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

    // Send confirmation email to customer
    await resend.emails.send({
      from: 'Empire Cars <noreply@empirerentcar.com>',
      to: meta.email,
      subject: `Booking confirmed — ${meta.vehicleTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;padding:24px">
          <h2 style="margin-bottom:4px">Your rental is confirmed ✓</h2>
          <p style="color:#555;margin-top:0">Hi ${meta.firstName}, here are your booking details.</p>
          <p style="font-size:0.85em;color:#888;margin-top:-8px">Booking reference: <strong style="color:#111">#${bookingRef}</strong></p>

          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Vehicle</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${meta.vehicleTitle}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Pickup</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${formatDate(meta.checkIn)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Return</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${formatDate(meta.checkOut)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Days</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${meta.nights}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Subtotal</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee">$${meta.subtotal}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Taxes</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee">$${meta.taxes}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-weight:700">Total paid</td>
              <td style="padding:10px 0;font-weight:700;font-size:1.1em">$${meta.total}</td>
            </tr>
          </table>

          <div style="background:#f9f9f9;border-radius:10px;padding:16px;margin-bottom:24px">
            <p style="font-weight:600;margin:0 0 10px">What to bring at pickup</p>
            <p style="margin:4px 0;color:#555;font-size:0.9em">🪪 &nbsp;Valid driving licence</p>
            <p style="margin:4px 0;color:#555;font-size:0.9em">📘 &nbsp;Passport or national ID</p>
            <p style="margin:4px 0;color:#555;font-size:0.9em">💳 &nbsp;Payment card used for booking</p>
          </div>

          <a href="${appUrl}/reservations" style="display:block;background:#111;color:#fff;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:600;margin-bottom:20px">
            View my booking
          </a>

          <p style="color:#888;font-size:0.85em">
            Our team will contact you 24 hours before pickup to confirm the exact location and time.
            ${phone ? `Questions? Call or WhatsApp us at <a href="tel:${phone}" style="color:#111">${phone}</a>.` : 'Questions? Reply to this email.'}
          </p>
          <p style="color:#aaa;font-size:0.8em">— Empire Cars Sosua &nbsp;·&nbsp; <a href="${appUrl}" style="color:#aaa">${appUrl}</a></p>
        </div>
      `,
    });

    console.log('Webhook: reservation created', reservation.id);
  }

  return NextResponse.json({ received: true });
}
