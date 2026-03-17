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

    // Send confirmation email to customer
    await resend.emails.send({
      from: 'Empire Cars <noreply@empirerentcar.com>',
      to: meta.email,
      subject: `Booking confirmed — ${meta.vehicleTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
          <h2 style="margin-bottom:4px">Your rental is confirmed ✓</h2>
          <p style="color:#555;margin-top:0">Hi ${meta.firstName}, here are your booking details.</p>

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

          <p style="color:#555">We'll be in touch to arrange pickup. Questions? Reply to this email or contact us at <a href="https://empirerentcar.com">empirerentcar.com</a>.</p>
          <p style="color:#555">— The Empire Cars Team</p>
        </div>
      `,
    });

    console.log('Webhook: reservation created', reservation.id);
  }

  return NextResponse.json({ received: true });
}
