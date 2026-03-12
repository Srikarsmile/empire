import baseVehicles from '@/data/vehicles.json';
import vehicleMeta, { VehicleMeta } from '@/data/vehicleMeta';

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

export interface EnrichedVehicle extends VehicleBase, VehicleMeta {}

const defaultMeta: VehicleMeta = {
  rating: 4.7,
  reviewCount: 0,
  minNights: 2,
  bookedRanges: [],
  reviews: [],
};

export function getAllVehicles(): EnrichedVehicle[] {
  return (baseVehicles as VehicleBase[]).map((vehicle) => ({
    ...vehicle,
    ...(vehicleMeta[vehicle.id] ?? defaultMeta),
  }));
}

export function getVehicleById(id: string): EnrichedVehicle | null {
  return getAllVehicles().find((vehicle) => vehicle.id === id) ?? null;
}
