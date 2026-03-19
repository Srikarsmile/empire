import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getVehicleById } from '@/lib/vehicleData';
import { prisma } from '@/lib/prisma';
import { getBookedSet, getStayNights } from '@/lib/dateUtils';

interface SiteFees {
  taxRate: number;
  taxEnabled: boolean;
  airportEnabled: boolean;
  insuranceEnabled: boolean;
  insuranceFee: number;
  airports: { id: string; name: string; city: string; fee: number }[];
}

async function getSiteFees(): Promise<SiteFees> {
  const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  const data = (content?.data ?? {}) as Record<string, unknown>;
  return {
    taxRate: typeof data.taxRate === 'number' ? data.taxRate : 14,
    taxEnabled: data.taxEnabled !== false,
    airportEnabled: data.airportEnabled !== false,
    insuranceEnabled: data.insuranceEnabled === true,
    insuranceFee: typeof data.insuranceFee === 'number' ? data.insuranceFee : 0,
    airports: (data.airports as SiteFees['airports']) ?? [],
  };
}

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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
      airportFee?: number;
      dropoffLocation?: string;
      insuranceFee?: number;
    };

    const vehicle = await getVehicleById(body.vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Prevent double-booking: reject if requested dates overlap any existing booked range
    const bookedSet = getBookedSet(vehicle.bookedRanges);
    const requestedNights = getStayNights(body.checkIn, body.checkOut);
    if (requestedNights.some((day) => bookedSet.has(day))) {
      return NextResponse.json(
        { error: 'These dates are no longer available. Please choose different dates.' },
        { status: 409 }
      );
    }

    const fees = await getSiteFees();
    const nights = requestedNights.length; // derived from checkIn/checkOut, not client-supplied
    const dropoffLocation = body.dropoffLocation ?? '';

    // Compute airport fee server-side by matching dropoffLocation against DB config
    let airportFee = 0;
    if (fees.airportEnabled && dropoffLocation) {
      const match = fees.airports.find(
        (a) => `${a.name}, ${a.city}` === dropoffLocation,
      );
      airportFee = match?.fee ?? 0;
    }

    // Compute insurance fee server-side
    const insuranceFee = fees.insuranceEnabled && body.insuranceFee ? fees.insuranceFee : 0;

    const subtotal = vehicle.price * nights;
    const taxes = fees.taxEnabled ? Math.round(subtotal * (fees.taxRate / 100)) : 0;
    const total = subtotal + taxes + airportFee + insuranceFee;
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
              description: `Pickup: ${body.checkIn}  •  Return: ${body.checkOut}${dropoffLocation ? `  •  Drop-off: ${dropoffLocation}` : ''}`,
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
        airportFee: String(airportFee),
        dropoffLocation,
        insuranceFee: String(insuranceFee),
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
