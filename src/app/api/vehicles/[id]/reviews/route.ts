import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { ReviewItem } from '@/data/vehicleMeta';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { guestName, rating, comment } = await request.json();

  // Read email from auth cookie — never trust client-supplied email
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get('empire_email')?.value;
  if (!cookieEmail) {
    return NextResponse.json(
      { error: 'You must be logged in to leave a review.' },
      { status: 401 },
    );
  }
  const normalizedEmail = cookieEmail.toLowerCase().trim();

  if (!guestName?.trim() || !comment?.trim() || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  // Check they have a completed reservation for this vehicle
  const reservation = await prisma.reservation.findFirst({
    where: {
      vehicleId: id,
      email: { equals: normalizedEmail, mode: 'insensitive' },
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: 'No reservation found for this email and vehicle. Only verified renters can leave reviews.' },
      { status: 403 }
    );
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });

  const currentReviews = (vehicle.reviews as unknown as ReviewItem[]) ?? [];

  // Block duplicate reviews from same email
  const alreadyReviewed = currentReviews.some(
    (r) => r.reviewerEmail?.toLowerCase() === normalizedEmail
  );
  if (alreadyReviewed) {
    return NextResponse.json(
      { error: 'You have already submitted a review for this vehicle.' },
      { status: 409 }
    );
  }

  const newReview: ReviewItem = {
    id: crypto.randomUUID(),
    guestName: guestName.trim(),
    reviewerEmail: normalizedEmail,
    rating: Number(rating),
    comment: comment.trim(),
    date: new Date().toISOString(),
    photos: [],
  };

  const updatedReviews = [...currentReviews, newReview];
  const newRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

  await prisma.vehicle.update({
    where: { id },
    data: {
      reviews: JSON.parse(JSON.stringify(updatedReviews)),
      reviewCount: updatedReviews.length,
      rating: Math.round(newRating * 10) / 10,
    },
  });

  return NextResponse.json({ ok: true, review: newReview });
}
