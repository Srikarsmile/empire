import { prisma } from './prisma';

export interface FeatureCard {
  title: string;
  description: string;
}

export interface SiteContentData {
  hero: {
    headline: string;
    subheading: string;
  };
  features: {
    title: string;
    subtitle: string;
    cards: FeatureCard[];
  };
  fleet: {
    badge: string;
    title: string;
    description: string;
  };
  business: {
    phone: string;
    hours: string;
  };
}

export const defaultContent: SiteContentData = {
  hero: {
    headline: 'Get there faster.',
    subheading: 'Reserve your vehicle for Sosua, Cabarete, and Puerto Plata. Transparent pricing, no hassle.',
  },
  features: {
    title: 'Why choose Empire?',
    subtitle: 'Straightforward process. No surprises.',
    cards: [
      {
        title: 'Airport Delivery',
        description: 'We deliver directly to POP airport, Sosua hotels, or your villa so you avoid taxi coordination on arrival.',
      },
      {
        title: 'Clear Pricing',
        description: 'Vehicle rate, taxes, and rental window confirmed before checkout. Absolute transparency.',
      },
      {
        title: 'Built for the Coast',
        description: 'SUVs for beach days, fuel savers for city errands, and vans for groups. Maintained flawlessly.',
      },
    ],
  },
  fleet: {
    badge: 'Explore our collection',
    title: 'The Empire Fleet',
    description: 'Hand-picked vehicles perfect for Dominican Republic roads. Maintained to the highest standards for your peace of mind.',
  },
  business: {
    phone: '+1-809-000-0000',
    hours: 'Mo-Su 08:00-20:00',
  },
};

export async function getSiteContent(): Promise<SiteContentData> {
  const row = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  if (!row) return defaultContent;
  const stored = row.data as Partial<SiteContentData>;
  return {
    hero: { ...defaultContent.hero, ...stored.hero },
    features: {
      ...defaultContent.features,
      ...stored.features,
      cards: stored.features?.cards ?? defaultContent.features.cards,
    },
    fleet: { ...defaultContent.fleet, ...stored.fleet },
    business: { ...defaultContent.business, ...stored.business },
  };
}

export async function setSiteContent(data: SiteContentData): Promise<void> {
  await prisma.siteContent.upsert({
    where: { id: 'main' },
    create: { id: 'main', data: JSON.parse(JSON.stringify(data)) },
    update: { data: JSON.parse(JSON.stringify(data)) },
  });
}
