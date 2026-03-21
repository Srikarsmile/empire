import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FadeInUp } from '@/components/animations/MotionWrapper';
import { getVehicleById } from '@/lib/vehicleData';
import { ArrowLeft, MapPin, Star, CheckCircle2, Plane, ShieldCheck, Headset, Users } from 'lucide-react';
import GalleryLightbox from './GalleryLightbox';
import ReviewForm from './ReviewForm';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) return {};
  const description = vehicle.description.slice(0, 155);
  const image = vehicle.images[0] ?? '/og-image.jpg';
  return {
    title: `${vehicle.title} | Empire Cars Sosua`,
    description,
    openGraph: {
      title: `${vehicle.title} | Empire Cars Sosua`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: vehicle.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${vehicle.title} | Empire Cars Sosua`,
      description,
      images: [image],
    },
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function FleetDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
}) {
  const { id } = await params;
  const { checkIn, checkOut } = await searchParams;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  const today = new Date().toISOString().split('T')[0];
  const nextBlockedWindow = vehicle.bookedRanges.find(r => r.end >= today) ?? null;

  return (
    <div className="page-shell property-page">
      <div className="shell">
        <Link href="/" className="btn-back">
          <ArrowLeft className="inline w-4 h-4" /> Back to fleet
        </Link>

        <FadeInUp>
          <div className="property-heading">
            <h1>{vehicle.title}</h1>
            <p>
              <MapPin className="inline w-4 h-4" />
              {vehicle.location}
            </p>
            <div className="property-rating-line">
              <span>
                <Star className="inline w-4 h-4 fill-current" /> {vehicle.rating.toFixed(2)}
              </span>
              <span>{vehicle.reviewCount} reviews</span>
            </div>
          </div>
        </FadeInUp>

        <GalleryLightbox images={vehicle.images} imageBlurs={vehicle.imageBlurs} title={vehicle.title} />

        <div className="property-layout">
          <FadeInUp className="property-content">
            <section className="info-card">
              <h2>About this vehicle</h2>
              <p>{vehicle.description}</p>
              {vehicle.websiteUrl && (
                <a
                  href={vehicle.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-[var(--accent)] hover:underline font-medium"
                >
                  Visit website →
                </a>
              )}
            </section>

            <section className="info-card">
              <h2>Included with this rental</h2>
              <ul className="amenities-grid">
                {vehicle.amenities.map((amenity) => (
                  <li key={amenity}>
                    <CheckCircle2 className="inline w-4 h-4" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>

            <section className="info-card reviews-card">
              <div className="reviews-header-row">
                <h2>Driver Reviews</h2>
                {vehicle.reviewCount > 0 && (
                  <p>
                    <Star className="inline w-4 h-4 fill-current" /> {vehicle.rating.toFixed(2)} ({vehicle.reviewCount})
                  </p>
                )}
              </div>

              <div className="reviews-list">
                {vehicle.reviews.length === 0 ? (
                  <p className="muted-label">No reviews yet. Be the first to leave one below.</p>
                ) : [...vehicle.reviews].reverse().map((review) => (
                  <article key={review.id} className="review-item">
                    <div className="review-top-row">
                      <div>
                        <strong>{review.guestName}</strong>
                        <p>{formatDate(review.date)}</p>
                      </div>
                      <span className="review-stars" aria-label={`${review.rating} out of 5`}>
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`inline w-3.5 h-3.5 ${s <= Math.round(review.rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </span>
                    </div>

                    <p className="review-comment">{review.comment}</p>
                    <span className="verified-badge"><ShieldCheck className="inline w-3.5 h-3.5" /> Verified Renter</span>
                  </article>
                ))}
              </div>

              <ReviewForm vehicleId={vehicle.id} />
            </section>
          </FadeInUp>

          <FadeInUp delay={0.2} className="booking-side">
            <aside className="booking-card sticky">
              <div className="booking-price">
                <strong>${vehicle.price}</strong>
                <span>per day</span>
              </div>

              <p className="sidebar-capacity"><Users className="inline w-4 h-4" /> Up to {vehicle.capacity} passengers</p>

              <div className="availability-pill">
                <CheckCircle2 className="inline w-4 h-4" />
                Minimum rental: {vehicle.minNights} day{vehicle.minNights > 1 ? 's' : ''}
              </div>

              {(() => {
                if (!nextBlockedWindow) {
                  return <span className="available-pill"><CheckCircle2 className="inline w-4 h-4" /> Available now</span>;
                }
                const nextStart = new Date(nextBlockedWindow.start + 'T00:00:00');
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                if (nextStart <= sevenDaysFromNow) {
                  return <span className="status-pill confirmed">Booked until {formatDate(nextBlockedWindow.end)}</span>;
                }
                return <p className="next-blocked-note">Next unavailable: {formatDate(nextBlockedWindow.start)} – {formatDate(nextBlockedWindow.end)}</p>;
              })()}

              <div className="trust-grid">
                <div className="trust-item">
                  <span className="trust-icon"><Plane className="w-4 h-4" /></span>
                  <p>Airport &amp; villa handoff</p>
                </div>
                <div className="trust-item">
                  <span className="trust-icon"><ShieldCheck className="w-4 h-4" /></span>
                  <p>Optional insurance</p>
                </div>
                <div className="trust-item">
                  <span className="trust-icon"><Headset className="w-4 h-4" /></span>
                  <p>24/7 direct support</p>
                </div>
              </div>

              <Link
                href={checkIn && checkOut ? `/reserve/${vehicle.id}?checkIn=${checkIn}&checkOut=${checkOut}` : `/reserve/${vehicle.id}`}
                className="btn-primary full-width"
              >
                Reserve this vehicle
              </Link>
            </aside>
          </FadeInUp>
        </div>
      </div>
    </div>
  );
}
