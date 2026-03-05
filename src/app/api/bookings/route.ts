import { NextResponse } from 'next/server';

type BookingRecord = {
  id: string;
  status: 'upcoming';
  createdAt: string;
  [key: string]: unknown;
};

const bookings: BookingRecord[] = [];

export async function GET() {
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const newBooking: BookingRecord = {
      ...data,
      id: `booking-${Date.now()}`,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    return NextResponse.json(newBooking, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 });
  }
}
