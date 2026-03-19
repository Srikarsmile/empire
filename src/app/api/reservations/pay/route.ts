import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reservations/pay?id=<reservationId>
 *
 * Looks up a payment_pending reservation, retrieves (or re-creates) the Stripe
 * checkout session, and redirects the customer to the payment page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get('id');

  if (!reservationId) {
    return NextResponse.json({ error: 'Missing reservation id' }, { status: 400 });
  }

  // Verify the logged-in user owns this reservation
  const cookieStore = await cookies();
  const email = cookieStore.get('empire_email')?.value;
  const role = cookieStore.get('empire_role')?.value;

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
  }

  // Only the reservation owner or an admin can access the payment link
  if (role !== 'admin' && (!email || reservation.email.toLowerCase() !== email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (reservation.status !== 'payment_pending') {
    // Already paid — redirect to reservations page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
    return NextResponse.redirect(`${appUrl}/reservations`);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';

  // Try to retrieve the existing Stripe session
  if (reservation.stripeSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId);

      // Session is still open — redirect to payment
      if (session.status === 'open' && session.url) {
        return NextResponse.redirect(session.url);
      }

      // Session was paid — update reservation status
      if (session.payment_status === 'paid') {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { status: 'upcoming' },
        });
        return NextResponse.redirect(`${appUrl}/reservations`);
      }
    } catch {
      // Session expired or invalid — fall through to create new one
    }
  }

  // Create a new Stripe checkout session with the same reservation data
  const vehicleImage = reservation.vehicleImage || '';
  try {
    const newSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: reservation.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: reservation.total * 100,
            product_data: {
              name: `${reservation.vehicleTitle} — ${reservation.nights} day${reservation.nights !== 1 ? 's' : ''}`,
              description: `Pickup: ${reservation.checkIn}  •  Return: ${reservation.checkOut}${reservation.dropoffLocation ? `  •  Drop-off: ${reservation.dropoffLocation}` : ''}`,
              ...(vehicleImage ? { images: [vehicleImage] } : {}),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/reservations`,
      metadata: {
        vehicleId: reservation.vehicleId,
        vehicleTitle: reservation.vehicleTitle,
        vehicleImage,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        nights: String(reservation.nights),
        price: String(reservation.price),
        subtotal: String(reservation.subtotal),
        taxes: String(reservation.taxes),
        airportFee: String(reservation.airportFee),
        dropoffLocation: reservation.dropoffLocation,
        insuranceFee: String(reservation.insuranceFee),
        total: String(reservation.total),
        firstName: reservation.firstName,
        lastName: reservation.lastName,
        email: reservation.email,
        phone: reservation.phone,
      },
    });

    // Update the reservation with the new session ID
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { stripeSessionId: newSession.id },
    });

    if (newSession.url) {
      return NextResponse.redirect(newSession.url);
    }
  } catch (err) {
    console.error('Failed to create new Stripe session for pay-now:', err);
  }

  return NextResponse.json({ error: 'Unable to generate payment link' }, { status: 500 });
}
