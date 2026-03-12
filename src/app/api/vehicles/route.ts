import { NextResponse } from 'next/server';
import { getAllVehicles } from '@/lib/vehicleData';

export async function GET() {
  return NextResponse.json(getAllVehicles());
}
