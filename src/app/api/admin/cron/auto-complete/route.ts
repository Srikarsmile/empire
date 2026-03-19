import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const token = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || token !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mark any "upcoming" reservations whose checkOut date has already passed as "completed"
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  const result = await prisma.reservation.updateMany({
    where: { status: 'upcoming', checkOut: { lte: yesterdayKey } },
    data: { status: 'completed' },
  });

  return NextResponse.json({ updated: result.count });
}
