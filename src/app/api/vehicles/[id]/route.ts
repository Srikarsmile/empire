import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request, { params }: Params) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const { id } = await params;
  const body = await request.json();

  if (body.title !== undefined && (!body.title || String(body.title).length > 200)) {
    return NextResponse.json({ error: 'Title is required and must be 200 characters or fewer' }, { status: 400 });
  }
  if (body.price !== undefined) {
    const p = Number(body.price);
    if (p < 0 || p > 100000) {
      return NextResponse.json({ error: 'Price must be between 0 and 100000' }, { status: 400 });
    }
  }
  if (body.capacity !== undefined) {
    const c = Number(body.capacity);
    if (c < 1 || c > 20) {
      return NextResponse.json({ error: 'Capacity must be between 1 and 20' }, { status: 400 });
    }
  }

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.capacity !== undefined && { capacity: Number(body.capacity) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amenities !== undefined && { amenities: body.amenities }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.imageBlurs !== undefined && { imageBlurs: body.imageBlurs }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.rating !== undefined && { rating: Number(body.rating) }),
        ...(body.minNights !== undefined && { minNights: Number(body.minNights) }),
        ...(body.bookedRanges !== undefined && { bookedRanges: body.bookedRanges }),
        ...(body.paused !== undefined && { paused: Boolean(body.paused) }),
      },
    });
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const { id } = await params;
  try {
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
}
