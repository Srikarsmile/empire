import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantsAll = searchParams.get('all') === '1';

  if (wantsAll) {
    const authError = await requireAdmin();
    if (authError instanceof NextResponse) return authError;
  }

  const vehicles = await prisma.vehicle.findMany({
    where: wantsAll ? undefined : { paused: false },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  try {
    const body = await request.json();

    const title = (body.title || `${body.make || ''} ${body.model || ''}`.trim());
    const price = Number(body.price) || 0;
    const capacity = Number(body.capacity) || 5;

    if (!title || title.length > 200) {
      return NextResponse.json({ error: 'Title is required and must be 200 characters or fewer' }, { status: 400 });
    }
    if (price < 0 || price > 100000) {
      return NextResponse.json({ error: 'Price must be between 0 and 100000' }, { status: 400 });
    }
    if (capacity < 1 || capacity > 20) {
      return NextResponse.json({ error: 'Capacity must be between 1 and 20' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        title,
        price,
        capacity,
        description: body.description || '',
        amenities: body.amenities ?? [],
        images: body.images ?? [],
        imageBlurs: body.imageBlurs ?? [],
        location: body.location || 'Sosua and Puerto Plata Airport',
        rating: body.rating ?? 4.7,
        reviewCount: body.reviewCount ?? 0,
        minNights: body.minNights ?? 2,
        bookedRanges: body.bookedRanges ?? [],
        reviews: body.reviews ?? [],
        websiteUrl: body.websiteUrl || '',
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (err) {
    console.error('Failed to create vehicle:', err);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
