import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const [totalReservations, upcomingCount, revenueAgg, recent] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'upcoming' } }),
    prisma.reservation.aggregate({ _sum: { total: true } }),
    prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    totalReservations,
    totalRevenue: revenueAgg._sum.total ?? 0,
    upcomingCount,
    recent,
  });
}
