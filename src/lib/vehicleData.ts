import { prisma } from '@/lib/prisma';
import type { ReviewItem, DateRange } from '@/data/vehicleMeta';

export interface VehicleBase {
  id: string;
  title: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  location: string;
}

export interface EnrichedVehicle extends VehicleBase {
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: DateRange[];
  reviews: ReviewItem[];
}

function toEnriched(v: {
  id: string;
  title: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  location: string;
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: unknown;
  reviews: unknown;
}): EnrichedVehicle {
  return {
    ...v,
    bookedRanges: v.bookedRanges as DateRange[],
    reviews: v.reviews as ReviewItem[],
  };
}

export async function getAllVehicles(): Promise<EnrichedVehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { paused: false },
    orderBy: { createdAt: 'asc' },
  });
  return vehicles.map(toEnriched);
}

export async function getVehicleById(id: string): Promise<EnrichedVehicle | null> {
  const v = await prisma.vehicle.findUnique({ where: { id } });
  if (!v || v.paused) return null;
  return toEnriched(v);
}
