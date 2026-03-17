import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { findBySessionId, addReservation } from '@/lib/reservationStore';

export async function GET(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ status: 'pending' }, { status: 402 });
    }

    // Deduplication guard — don't write twice on refresh
    const existing = await findBySessionId(sessionId);
    if (existing) {
      return NextResponse.json(existing);
    }

    const meta = session.metadata ?? {};
    const reservation = await addReservation({
      stripeSessionId: sessionId,
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

    return NextResponse.json(reservation);
  } catch (err) {
    console.error('Stripe confirm error:', err);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
