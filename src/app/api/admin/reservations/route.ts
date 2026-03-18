import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addReservation } from '@/lib/reservationStore';

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(reservations);
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
    total: Number(body.total),
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
  });
  return NextResponse.json(reservation);
}
