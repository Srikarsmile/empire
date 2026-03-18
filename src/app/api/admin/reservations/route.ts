import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addReservation } from '@/lib/reservationStore';

export async function GET(request: Request) {
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
  const body = await request.json();
  const reservation = await addReservation({
    stripeSessionId: null,
    vehicleId: body.vehicleId,
    vehicleTitle: body.vehicleTitle,
    vehicleImage: body.vehicleImage ?? '',
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    nights: Number(body.nights),
    price: Number(body.price),
    subtotal: Number(body.subtotal),
    taxes: Number(body.taxes),
    airportFee: Number(body.airportFee ?? 0),
    dropoffLocation: body.dropoffLocation ?? '',
    insuranceFee: Number(body.insuranceFee ?? 0),
    total: Number(body.total),
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
  });
  return NextResponse.json(reservation);
}
