import FleetExplorer from '@/components/FleetExplorer';
import { getAllVehicles } from '@/lib/vehicleData';
import { Plane, BadgeDollarSign, CarFront } from 'lucide-react';
import { CardStackItem } from '@/components/ui/card-stack';
import HeroCardStack from '@/components/HeroCardStack';
import HeroBookingWidget from '@/components/HeroBookingWidget';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const vehicles = await getAllVehicles();

  const cardStackItems: CardStackItem[] = vehicles.slice(0, 5).map(v => ({
    id: v.id,
    title: v.title,
    description: v.description,
    imageSrc: v.images[0],
    href: `/reserve/${v.id}`,
    ctaLabel: `$${v.price}/day`
  }));

  return (
    <div className="min-h-screen selection:bg-black/10 overflow-x-hidden">

      {/* Stark Utility Hero (Uber Style) */}
      <section className="relative pt-36 pb-16 md:pt-40 md:pb-32 overflow-visible px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col-reverse xl:flex-row gap-16 xl:gap-8 items-center xl:items-start justify-between">
          
          <div className="flex flex-col gap-8 w-full xl:w-1/2 max-w-xl shrink-0 z-10 relative">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--ink-900)]">
                Get there <br />
                faster.
              </h1>
              <p className="text-xl text-[var(--ink-700)] font-medium">
                Reserve your vehicle for Sosua, Cabarete, and Puerto Plata. Transparent pricing, no hassle.
              </p>
            </div>

            {/* Instant Booking Widget */}
            <HeroBookingWidget />
          </div>

          <div className="relative w-full xl:w-1/2 h-[360px] sm:h-[520px] lg:h-[650px] pt-10 sm:pt-6 xl:pt-0 flex items-center justify-center xl:justify-end xl:pl-12 xl:-mt-12">
             <HeroCardStack items={cardStackItems} />
          </div>

        </div>
      </section>
      {/* Flat Grid Features - Uber Redesign */}
      <section className="py-24 bg-[var(--surface-soft)] border-t border-[var(--border)]">
        <div className="px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--ink-900)] mb-4">
             Why choose Empire?
          </h2>
          <p className="text-lg text-[var(--ink-700)] font-medium">
            Straightforward process. No surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-start gap-5 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(232,96,60,0.08)] transition-all duration-300">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-surface)] text-[var(--accent)]">
                 <Plane size={24} />
             </div>
             <div>
               <h3 className="feature-heading mb-2 text-xl font-semibold text-[var(--ink-900)]">Airport Delivery</h3>
               <p className="text-[var(--ink-700)] font-medium text-base">
                 We deliver directly to POP airport, Sosua hotels, or your villa so you avoid taxi coordination on arrival.
               </p>
             </div>
          </div>

          <div className="flex flex-col items-start gap-5 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(232,96,60,0.08)] transition-all duration-300">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-surface)] text-[var(--accent)]">
                 <BadgeDollarSign size={24} />
             </div>
             <div>
               <h3 className="feature-heading mb-2 text-xl font-semibold text-[var(--ink-900)]">Clear Pricing</h3>
               <p className="text-[var(--ink-700)] font-medium text-base">
                 Vehicle rate, taxes, and rental window confirmed before checkout. Absolute transparency.
               </p>
             </div>
          </div>

          <div className="flex flex-col items-start gap-5 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(232,96,60,0.08)] transition-all duration-300">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-surface)] text-[var(--accent)]">
                 <CarFront size={24} />
             </div>
             <div>
               <h3 className="feature-heading mb-2 text-xl font-semibold text-[var(--ink-900)]">Built for the Coast</h3>
               <p className="text-[var(--ink-700)] font-medium text-base">
                 SUVs for beach days, fuel savers for city errands, and vans for groups. Maintained flawlessly.
               </p>
             </div>
          </div>
        </div>
        </div>
      </section>

      {/* Fleet Section Wrapper */}
      <div id="fleet" className="pt-28 pb-24 mt-4 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-16 text-center max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent-surface)]/60 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-[var(--accent-strong)] mb-6 shadow-sm">
             Explore our collection
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--ink-900)] mb-6">
             The Empire Fleet
          </h2>
          <p className="text-xl text-[var(--ink-700)] font-medium leading-relaxed">
             Hand-picked vehicles perfect for Dominican Republic roads. Maintained to the highest standards for your peace of mind.
          </p>
        </div>
        <Suspense>
          <FleetExplorer vehicles={vehicles} />
        </Suspense>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Empire Cars Sosua",
            "description": "Premium car rentals in Sosua and Puerto Plata. Straightforward pricing, airport delivery, and a well-maintained fleet.",
            "url": "https://empirecarsosua.com",
            "telephone": "+1-809-000-0000",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Sosua",
              "addressRegion": "Puerto Plata",
              "addressCountry": "DO"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "19.7552",
              "longitude": "-70.5140"
            },
            "openingHours": "Mo-Su 08:00-20:00",
            "priceRange": "$$",
            "image": "https://empirecarsosua.com/og-image.jpg",
            "sameAs": []
          }),
        }}
      />
    </div>
  );
}
