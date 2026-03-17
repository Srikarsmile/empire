import { PrismaClient } from '@prisma/client';
import vehiclesData from '../src/data/vehicles.json';
import vehicleMeta from '../src/data/vehicleMeta';

const prisma = new PrismaClient();

const defaultMeta = {
  rating: 4.7,
  reviewCount: 0,
  minNights: 2,
  bookedRanges: [] as object[],
  reviews: [] as object[],
};

async function main() {
  console.log('Seeding vehicles...');

  for (const vehicle of vehiclesData) {
    const meta = vehicleMeta[vehicle.id as keyof typeof vehicleMeta] ?? defaultMeta;

    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: {},
      create: {
        id: vehicle.id,
        title: vehicle.title,
        price: vehicle.price,
        capacity: vehicle.capacity,
        description: vehicle.description,
        amenities: vehicle.amenities,
        images: vehicle.images,
        location: vehicle.location,
        rating: meta.rating,
        reviewCount: meta.reviewCount,
        minNights: meta.minNights,
        bookedRanges: JSON.parse(JSON.stringify(meta.bookedRanges)),
        reviews: JSON.parse(JSON.stringify(meta.reviews)),
      },
    });

    console.log(`  ✓ ${vehicle.title}`);
  }

  console.log(`Done — seeded ${vehiclesData.length} vehicles.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
