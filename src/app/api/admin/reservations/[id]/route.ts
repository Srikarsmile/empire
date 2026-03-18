import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  const { id } = await params;
  const { status } = await request.json();

  if (!['upcoming', 'completed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(reservation);
}
