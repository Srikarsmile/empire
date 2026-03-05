import baseProperties from '@/data/properties.json';
import propertyMeta, { PropertyMeta } from '@/data/propertyMeta';

export interface PropertyBase {
  id: string;
  title: string;
  price: number;
  description: string;
  amenities: string[];
  images: string[];
  location: string;
}

export interface EnrichedProperty extends PropertyBase, PropertyMeta {}
export interface GeniePropertyLite {
  id: string;
  title: string;
  location: string;
  image: string;
  amenities: string[];
  price: number;
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: PropertyMeta['bookedRanges'];
}

const defaultMeta: PropertyMeta = {
  rating: 4.7,
  reviewCount: 0,
  minNights: 2,
  bookedRanges: [],
  reviews: [],
};

export function getAllProperties(): EnrichedProperty[] {
  return (baseProperties as PropertyBase[]).map((property) => ({
    ...property,
    ...(propertyMeta[property.id] ?? defaultMeta),
  }));
}

export function getPropertyById(id: string): EnrichedProperty | null {
  return getAllProperties().find((property) => property.id === id) ?? null;
}

export function getGenieProperties(): GeniePropertyLite[] {
  return getAllProperties().map((property) => ({
    id: property.id,
    title: property.title,
    location: property.location,
    image: property.images[0],
    amenities: property.amenities,
    price: property.price,
    rating: property.rating,
    reviewCount: property.reviewCount,
    minNights: property.minNights,
    bookedRanges: property.bookedRanges,
  }));
}
