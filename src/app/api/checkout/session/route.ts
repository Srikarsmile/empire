import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getVehicleById } from '@/lib/vehicleData';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      vehicleId: string;
      checkIn: string;
      checkOut: string;
      nights: number;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };

    const vehicle = await getVehicleById(body.vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const nights = Number(body.nights);
    const subtotal = vehicle.price * nights;
    const taxes = Math.round(subtotal * 0.14);
    const total = subtotal + taxes;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: body.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: total * 100,
            product_data: {
              name: `${vehicle.title} — ${nights} day${nights !== 1 ? 's' : ''}`,
              description: `Pickup: ${body.checkIn}  •  Return: ${body.checkOut}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/reserve/${body.vehicleId}`,
      metadata: {
        vehicleId: body.vehicleId,
        vehicleTitle: vehicle.title,
        vehicleImage: vehicle.images[0] ?? '',
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        nights: String(nights),
        price: String(vehicle.price),
        subtotal: String(subtotal),
        taxes: String(taxes),
        total: String(total),
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
