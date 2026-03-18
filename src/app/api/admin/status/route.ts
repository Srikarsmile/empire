import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  const start = Date.now();
  try {
    const total = await prisma.reservation.count();
    const latencyMs = Date.now() - start;
    return NextResponse.json({
      db: { connected: true, latencyMs },
      reservations: { total },
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    });
  } catch {
    return NextResponse.json({
      db: { connected: false, latencyMs: null },
      reservations: { total: null },
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    });
  }
}
