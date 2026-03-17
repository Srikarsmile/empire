import { MetadataRoute } from 'next';
import { getAllVehicles } from '@/lib/vehicleData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getAllVehicles();
  const base = 'https://empirerentcar.com';

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/how-to-rent`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/reservations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    ...vehicles.map((v) => ({
      url: `${base}/fleet/${v.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
