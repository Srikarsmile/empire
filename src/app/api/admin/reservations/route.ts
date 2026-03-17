import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(reservations);
}
