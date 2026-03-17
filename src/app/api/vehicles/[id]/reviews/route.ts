import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ReviewItem } from '@/data/vehicleMeta';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { guestName, rating, comment } = await request.json();

  if (!guestName?.trim() || !comment?.trim() || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid review data' }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const newReview: ReviewItem = {
    id: crypto.randomUUID(),
    guestName: guestName.trim(),
    rating: Number(rating),
    comment: comment.trim(),
    date: new Date().toISOString(),
    photos: [],
  };

  const currentReviews = (vehicle.reviews as ReviewItem[]) ?? [];
  const updatedReviews = [...currentReviews, newReview];

  const newRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

  await prisma.vehicle.update({
    where: { id },
    data: {
      reviews: updatedReviews,
      reviewCount: updatedReviews.length,
      rating: Math.round(newRating * 10) / 10,
    },
  });

  return NextResponse.json({ ok: true, review: newReview });
}
