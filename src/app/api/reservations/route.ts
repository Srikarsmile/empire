import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllReservations, addReservation } from '@/lib/reservationStore';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get('empire_role')?.value;
  const email = cookieStore.get('empire_email')?.value;

  if (role === 'admin') {
    const reservations = await getAllReservations();
    return NextResponse.json(reservations);
  }

  if (!email) {
    return NextResponse.json([], { status: 200 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { email: email.toLowerCase().trim() },
    orderBy: { createdAt: 'desc' },
  });
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
