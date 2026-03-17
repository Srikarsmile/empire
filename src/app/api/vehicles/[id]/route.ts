import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  const { id } = await params;
  const body = await request.json();

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
        ...(body.location !== undefined && { location: body.location }),
        ...(body.rating !== undefined && { rating: Number(body.rating) }),
        ...(body.minNights !== undefined && { minNights: Number(body.minNights) }),
        ...(body.bookedRanges !== undefined && { bookedRanges: body.bookedRanges }),
      },
    });
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
}
