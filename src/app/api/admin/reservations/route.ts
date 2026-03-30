import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { addReservation } from '@/lib/reservationStore';
import { requireAdmin } from '@/lib/adminAuth';
import type { DateRange } from '@/lib/dateUtils';
import { Resend } from 'resend';
import { buildConfirmationEmail, buildPaymentRequestEmail } from '@/lib/emailTemplates';

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const { searchParams } = new URL(request.url);
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit  = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const search = searchParams.get('search')?.trim() ?? '';
  const status = searchParams.get('status')?.trim() ?? '';

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName:  { contains: search, mode: 'insensitive' as const } },
            { email:     { contains: search, mode: 'insensitive' as const } },
            { vehicleTitle: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const body = await request.json();

  const requestedStatus = ['upcoming', 'completed', 'cancelled', 'payment_pending'].includes(body.status)
    ? (body.status as string)
    : 'upcoming';

  // Resolve vehicle image from DB if not provided in form
  let vehicleImage: string = body.vehicleImage ?? '';
  if (!vehicleImage && body.vehicleId) {
    const veh = await prisma.vehicle.findUnique({
      where: { id: body.vehicleId },
      select: { images: true },
    });
    vehicleImage = (veh?.images as string[])?.[0] ?? '';
  }

  // For payment_pending: create Stripe session first, then create the reservation with stripeSessionId
  if (requestedStatus === 'payment_pending') {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';

    let stripeSession: Stripe.Checkout.Session;
    try {
      stripeSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: body.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Number(body.total) * 100,
              product_data: {
                name: `${body.vehicleTitle} — ${body.nights} day${Number(body.nights) !== 1 ? 's' : ''}`,
                description: `Pickup: ${body.checkIn}  •  Return: ${body.checkOut}${body.dropoffLocation ? `  •  Drop-off: ${body.dropoffLocation}` : ''}`,
                ...(vehicleImage ? { images: [vehicleImage] } : {}),
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/fleet/${body.vehicleId}`,
        metadata: {
          vehicleId: body.vehicleId,
          vehicleTitle: body.vehicleTitle,
          vehicleImage,
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          nights: String(body.nights),
          price: String(body.price),
          subtotal: String(body.subtotal),
          taxes: String(body.taxes),
          airportFee: String(body.airportFee ?? 0),
          dropoffLocation: body.dropoffLocation ?? '',
          insuranceFee: String(body.insuranceFee ?? 0),
          total: String(body.total),
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
        },
      });
    } catch (err) {
      console.error('Failed to create Stripe payment session for manual booking:', err);
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    // Create the reservation in payment_pending state with the Stripe session ID
    const reservation = await addReservation({
      stripeSessionId: stripeSession.id,
      vehicleId: body.vehicleId,
      vehicleTitle: body.vehicleTitle,
      vehicleImage,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      nights: Number(body.nights),
      price: Number(body.price),
      subtotal: Number(body.subtotal),
      taxes: Number(body.taxes),
      airportFee: Number(body.airportFee ?? 0),
      dropoffLocation: body.dropoffLocation ?? '',
      insuranceFee: Number(body.insuranceFee ?? 0),
      promoCode: '',
      promoDiscount: 0,
      total: Number(body.total),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    });

    // Set payment_pending status
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'payment_pending' },
    });
    reservation.status = 'payment_pending';

    // Dates are NOT blocked — they get blocked only after payment succeeds

    // Email customer the payment link
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const sc = await prisma.siteContent.findFirst();
      const scData = (sc?.data as Record<string, unknown>) ?? {};
      const adminPhone = (scData.companyPhone as string) || ((scData.business as Record<string, string>)?.phone) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);
      const bookingRef = reservation.id.slice(-8).toUpperCase();
      const { subject, html } = buildPaymentRequestEmail({
        firstName: body.firstName,
        vehicleTitle: body.vehicleTitle,
        vehicleImage,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        nights: body.nights,
        total: body.total,
        paymentUrl: stripeSession.url!,
        bookingRef,
        appUrl,
        adminPhone,
      });
      await resend.emails.send({
        from: 'Empire Cars <noreply@empirerentcar.com>',
        to: body.email,
        subject,
        html,
      });
    } catch (err) {
      console.error('Failed to send payment request email:', err);
    }

    return NextResponse.json(reservation);
  }

  // Normal manual booking (upcoming / completed / cancelled)
  const reservation = await addReservation({
    stripeSessionId: null,
    vehicleId: body.vehicleId,
    vehicleTitle: body.vehicleTitle,
    vehicleImage,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    nights: Number(body.nights),
    price: Number(body.price),
    subtotal: Number(body.subtotal),
    taxes: Number(body.taxes),
    airportFee: Number(body.airportFee ?? 0),
    dropoffLocation: body.dropoffLocation ?? '',
    insuranceFee: Number(body.insuranceFee ?? 0),
    promoCode: '',
    promoDiscount: 0,
    total: Number(body.total),
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
  });

  // Apply non-default status
  if (requestedStatus !== 'upcoming') {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: requestedStatus },
    });
    reservation.status = requestedStatus;
  }

  // Block the booked dates on the vehicle only for active bookings
  const vehicle = requestedStatus !== 'cancelled'
    ? await prisma.vehicle.findUnique({ where: { id: body.vehicleId } })
    : null;
  if (vehicle) {
    const existing = (vehicle.bookedRanges as unknown as DateRange[]) ?? [];
    await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: {
        bookedRanges: JSON.parse(JSON.stringify([
          ...existing,
          { start: body.checkIn, end: body.checkOut },
        ])),
      },
    });
  }

  // Send confirmation email to customer (best-effort, skip for cancelled bookings)
  if (requestedStatus !== 'cancelled') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
      const sc = await prisma.siteContent.findFirst();
      const scData = (sc?.data as Record<string, unknown>) ?? {};
      const adminPhone = (scData.companyPhone as string) || ((scData.business as Record<string, string>)?.phone) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);
      const bookingRef = reservation.id.slice(-8).toUpperCase();
      const { subject, html: confirmHtml } = buildConfirmationEmail({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        vehicleTitle: body.vehicleTitle,
        vehicleImage,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        nights: body.nights,
        subtotal: body.subtotal,
        taxes: body.taxes,
        airportFee: body.airportFee ?? 0,
        insuranceFee: body.insuranceFee ?? 0,
        dropoffLocation: body.dropoffLocation ?? '',
        total: body.total,
        bookingRef,
        appUrl,
        adminPhone,
      });
      await resend.emails.send({
        from: 'Empire Cars <noreply@empirerentcar.com>',
        to: body.email,
        subject,
        html: confirmHtml,
      });
    } catch (err) {
      console.error('Failed to send manual booking confirmation email:', err);
    }
  }

  return NextResponse.json(reservation);
}
