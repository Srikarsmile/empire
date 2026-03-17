import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ReviewItem } from '@/data/vehicleMeta';

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, title: true, reviews: true },
  });

  const all = vehicles.flatMap((v) =>
    ((v.reviews as unknown as ReviewItem[]) ?? []).map((r) => ({
      ...r,
      vehicleId: v.id,
      vehicleTitle: v.title,
    }))
  );

  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(all);
}

export async function DELETE(request: Request) {
  const { vehicleId, reviewId } = await request.json();

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const reviews = (vehicle.reviews as unknown as ReviewItem[]) ?? [];
  const updated = reviews.filter((r) => r.id !== reviewId);

  const newRating = updated.length
    ? Math.round((updated.reduce((s, r) => s + r.rating, 0) / updated.length) * 10) / 10
    : 0;

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      reviews: JSON.parse(JSON.stringify(updated)),
      reviewCount: updated.length,
      rating: newRating,
    },
  });

  return NextResponse.json({ ok: true });
}
