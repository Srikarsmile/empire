import { NextResponse } from 'next/server';
import { getAllReservations, addReservation } from '@/lib/reservationStore';

export async function GET() {
  const reservations = await getAllReservations();
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const newReservation = await addReservation(data as Parameters<typeof addReservation>[0]);
    return NextResponse.json(newReservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid reservation data' }, { status: 400 });
  }
}
