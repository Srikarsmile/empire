import { prisma } from './prisma';

export interface FeatureCard {
  title: string;
  description: string;
}

export interface FooterLink {
  title: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface HowToRentStep {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
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
  footer: {
    description: string;
    instagram: string;
    twitter: string;
    facebook: string;
    columns: FooterColumn[];
  };
  howToRent: {
    headline: string;
    description: string;
    steps: HowToRentStep[];
  };
  cancellationPolicy: string;
  faqs: FaqItem[];
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
      { title: 'Airport Delivery', description: 'We deliver directly to POP airport, Sosua hotels, or your villa so you avoid taxi coordination on arrival.' },
      { title: 'Clear Pricing', description: 'Vehicle rate, taxes, and rental window confirmed before checkout. Absolute transparency.' },
      { title: 'Built for the Coast', description: 'SUVs for beach days, fuel savers for city errands, and vans for groups. Maintained flawlessly.' },
    ],
  },
  fleet: {
    badge: 'Explore our collection',
    title: 'The Empire Fleet',
    description: 'Hand-picked vehicles perfect for Dominican Republic roads. Maintained to the highest standards for your peace of mind.',
  },
  business: {
    phone: '+1(849) 536-0261',
    hours: 'Mo-Su 08:00-20:00',
  },
  footer: {
    description: 'Daily rentals, direct support, and vehicle handoff that matches your arrival time securely in Sosua, Cabarete, and Puerto Plata.',
    instagram: '#',
    twitter: '#',
    facebook: '#',
    columns: [
      { title: 'Support', links: [{ title: 'Airport pickup', url: '#' }, { title: 'Insurance support', url: '#' }, { title: 'Roadside help', url: '#' }] },
      { title: 'Rental Info', links: [{ title: 'Driver requirements', url: '#' }, { title: 'Fuel policy', url: '#' }, { title: 'Long-stay pricing', url: '#' }] },
      { title: 'Legal', links: [{ title: 'Privacy Policy', url: '/privacy' }, { title: 'Terms of Service', url: '/terms' }, { title: 'Sitemap', url: '#' }] },
    ],
  },
  howToRent: {
    headline: 'From landing to driving in 3 simple steps',
    description: 'Empire Car Rental keeps the Sosua rental process direct. Choose the right car, confirm dates, and get a clean handoff without the usual airport scramble.',
    steps: [
      { title: '1. Choose the right vehicle', body: 'Browse compact cars, SUVs, convertibles, and group vans based on seats, daily price, and airport pickup options.' },
      { title: '2. Lock in your dates', body: 'Select pickup and return days, review availability, and confirm the rental window that fits your flight or villa check-in.' },
      { title: '3. Arrive and drive', body: 'Review clear totals, submit your driver details, and meet the Empire team at the airport, hotel, villa, or agreed pickup point for handoff.' },
    ],
  },
  cancellationPolicy: 'Free cancellation up to 48 hours before pickup. After that, cancellations are non-refundable.',
  faqs: [
    { question: 'Do I need an international driving license?', answer: 'A valid driving license from your home country is accepted. An international driving permit (IDP) is recommended but not required for most nationalities.' },
    { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 48 hours before pickup. After that, the booking is non-refundable.' },
    { question: 'Is airport delivery available?', answer: 'Yes, we deliver directly to Gregorio Luperón International Airport (POP), Sosua hotels, and villas. Select the airport drop-off option at checkout.' },
    { question: 'What documents do I need at pickup?', answer: 'Bring a valid driving license, passport or national ID, and the payment card used for the booking.' },
    { question: 'Is insurance included?', answer: 'Basic coverage is available as an optional add-on at checkout. All vehicles are fully maintained and road-ready.' },
  ],
};

export async function getSiteContent(): Promise<SiteContentData> {
  const row = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  if (!row) return defaultContent;
  const stored = row.data as Partial<SiteContentData>;
  return {
    hero: { ...defaultContent.hero, ...stored.hero },
    features: { ...defaultContent.features, ...stored.features, cards: stored.features?.cards ?? defaultContent.features.cards },
    fleet: { ...defaultContent.fleet, ...stored.fleet },
    business: { ...defaultContent.business, ...stored.business },
    footer: { ...defaultContent.footer, ...stored.footer, columns: stored.footer?.columns ?? defaultContent.footer.columns },
    howToRent: { ...defaultContent.howToRent, ...stored.howToRent, steps: stored.howToRent?.steps ?? defaultContent.howToRent.steps },
    cancellationPolicy: stored.cancellationPolicy ?? defaultContent.cancellationPolicy,
    faqs: stored.faqs ?? defaultContent.faqs,
  };
}

export async function setSiteContent(data: SiteContentData): Promise<void> {
  await prisma.siteContent.upsert({
    where: { id: 'main' },
    create: { id: 'main', data: JSON.parse(JSON.stringify(data)) },
    update: { data: JSON.parse(JSON.stringify(data)) },
  });
}
