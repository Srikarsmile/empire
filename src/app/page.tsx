import Image from 'next/image';
import Link from 'next/link';
import { HeroText } from '@/components/animations/HeroText';
import GeniePromptSurface from '@/components/GeniePromptSurface';
import PropertyExplorer from '@/components/PropertyExplorer';
import { getAllProperties } from '@/lib/propertyData';

export default function Home() {
  const properties = getAllProperties();
  const featured = properties[0];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker">Empire Residential Collection</span>
            <HeroText
              title="Welcome to Empire Residential Apartments"
              subtitle="Explore curated stays, compare options, and book in minutes. Need help choosing? Genie can guide you."
            />

            <div className="hero-mobile-media" aria-hidden="true">
              <Image
                src={featured.images[0]}
                alt=""
                fill
                sizes="100vw"
              />
              <div className="hero-mobile-media-badge">
                <strong>150+ stays verified</strong>
              </div>
            </div>

            <div className="hero-cta-row">
              <a href="#stays" className="btn-primary">
                Browse all stays
              </a>
              <Link href="/bookings" className="hero-text-link">
                Manage trips
              </Link>
            </div>

            <GeniePromptSurface variant="hero" />
          </div>

          <div className="hero-visual-wrap">
            <div className="hero-visual">
              <Image
                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2200&auto=format&fit=crop"
                alt="Modern apartment interior"
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 45vw"
              />
            </div>

            <div className="hero-float-card">
              <p className="muted-label">Featured this week</p>
              <h3>{featured.title}</h3>
              <div>
                <strong>${featured.price}</strong>
                <span> per night</span>
              </div>
              <p>{featured.location}</p>
            </div>
          </div>
        </div>
      </section>

      <GeniePromptSurface variant="sticky" />

      <div id="stays">
        <PropertyExplorer properties={properties} />
      </div>
    </div>
  );
}
