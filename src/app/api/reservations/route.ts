import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllReservations, addReservation } from '@/lib/reservationStore';
import { prisma } from '@/lib/prisma';

/** Fill in vehicleImage from the Vehicle record when the reservation has none */
async function enrichImages<T extends { vehicleImage: string; vehicleId: string }>(
  reservations: T[],
): Promise<T[]> {
  // Collect IDs that need enrichment
  const needsImage = reservations.filter((r) => !r.vehicleImage && r.vehicleId);
  if (needsImage.length === 0) return reservations;

  // Batch-fetch all vehicles at once instead of N+1 queries
  const vehicleIds = [...new Set(needsImage.map((r) => r.vehicleId))];
  const vehicles = await prisma.vehicle.findMany({
    where: { id: { in: vehicleIds } },
    select: { id: true, images: true },
  });
  const imageMap = new Map(
    vehicles.map((v) => [v.id, (v.images as string[])?.[0] ?? '']),
  );

  return reservations.map((r) => {
    if (!r.vehicleImage && imageMap.has(r.vehicleId)) {
      return { ...r, vehicleImage: imageMap.get(r.vehicleId)! };
    }
    return r;
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get('empire_role')?.value;
  const email = cookieStore.get('empire_email')?.value;

  if (role === 'admin') {
    const reservations = await getAllReservations();
    return NextResponse.json(await enrichImages(reservations));
  }

  if (!email) {
    return NextResponse.json([], { status: 200 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { email: email.toLowerCase().trim() },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(await enrichImages(reservations));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('empire_email')?.value;
  const role = cookieStore.get('empire_role')?.value;

  if (!email && role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = (await request.json()) as Record<string, unknown>;
    const newReservation = await addReservation(data as Parameters<typeof addReservation>[0]);
    return NextResponse.json(newReservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid reservation data' }, { status: 400 });
  }
}
