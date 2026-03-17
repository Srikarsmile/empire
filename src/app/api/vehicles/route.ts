import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const body = await request.json();

  const vehicle = await prisma.vehicle.create({
    data: {
      title: body.title || `${body.make || ''} ${body.model || ''}`.trim(),
      price: Number(body.price) || 0,
      capacity: Number(body.capacity) || 5,
      description: body.description || '',
      amenities: body.amenities ?? [],
      images: body.images ?? [],
      location: body.location || 'Sosua and Puerto Plata Airport',
      rating: body.rating ?? 4.7,
      reviewCount: body.reviewCount ?? 0,
      minNights: body.minNights ?? 2,
      bookedRanges: body.bookedRanges ?? [],
      reviews: body.reviews ?? [],
    },
  });

  return NextResponse.json(vehicle, { status: 201 });
}
