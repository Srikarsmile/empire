import { NextResponse } from 'next/server';

type ReservationRecord = {
  id: string;
  status: 'upcoming';
  createdAt: string;
  [key: string]: unknown;
};

const reservations: ReservationRecord[] = [];

export async function GET() {
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const newReservation: ReservationRecord = {
      ...data,
      id: `reservation-${Date.now()}`,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    reservations.push(newReservation);
    return NextResponse.json(newReservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid reservation data' }, { status: 400 });
  }
}
