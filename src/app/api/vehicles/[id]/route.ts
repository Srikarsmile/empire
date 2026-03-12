import { NextResponse } from 'next/server';
import { getVehicleById } from '@/lib/vehicleData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const vehicle = getVehicleById(id);

  if (vehicle) {
    return NextResponse.json(vehicle);
  }

  return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
}
