import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FadeInUp } from '@/components/animations/MotionWrapper';
import { getVehicleById } from '@/lib/vehicleData';
import { ArrowLeft, MapPin, Star, CheckCircle2, Plane, ShieldCheck, Headset } from 'lucide-react';
import GalleryLightbox from './GalleryLightbox';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function FleetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  const nextBlockedWindow = vehicle.bookedRanges[0];

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

        <GalleryLightbox images={vehicle.images} title={vehicle.title} />

        <div className="property-layout">
          <FadeInUp className="property-content">
            <section className="info-card">
              <h2>About this vehicle</h2>
              <p>{vehicle.description}</p>
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
                <p>
                  <Star className="inline w-4 h-4 fill-current" /> {vehicle.rating.toFixed(2)} ({vehicle.reviewCount})
                </p>
              </div>

              <div className="reviews-list">
                {vehicle.reviews.map((review) => (
                  <article key={review.id} className="review-item">
                    <div className="review-top-row">
                      <div>
                        <strong>{review.guestName}</strong>
                        <p>{formatDate(review.date)}</p>
                      </div>
                      <span>
                        <Star className="inline w-4 h-4 fill-current" /> {review.rating.toFixed(1)}
                      </span>
                    </div>

                    <p className="review-comment">{review.comment}</p>

                    <div className="review-photos">
                      {review.photos.map((photo, index) => (
                        <div key={`${review.id}-${index}`} className="review-photo">
                          <Image src={photo} alt={`Guest photo ${index + 1}`} fill sizes="140px" />
                        </div>
                      ))}
                    </div>

                    {review.hostResponse ? (
                      <div className="host-response">
                        <strong>{review.hostResponse.hostName} replied</strong>
                        <small>{formatDate(review.hostResponse.date)}</small>
                        <p>{review.hostResponse.message}</p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </FadeInUp>

          <FadeInUp delay={0.2} className="booking-side">
            <aside className="booking-card sticky">
              <div className="booking-price">
                <strong>${vehicle.price}</strong>
                <span>per day</span>
              </div>

              <div className="availability-pill">
                <CheckCircle2 className="inline w-4 h-4" />
                Minimum rental: {vehicle.minNights} day{vehicle.minNights > 1 ? 's' : ''}
              </div>

              {nextBlockedWindow ? (
                <p className="next-blocked-note">
                  Next unavailable window: {formatDate(nextBlockedWindow.start)} - {formatDate(nextBlockedWindow.end)}
                </p>
              ) : null}

              <ul className="booking-notes">
                <li>
                  <Plane className="w-4 h-4 shrink-0" /> Airport and villa handoff
                </li>
                <li>
                  <ShieldCheck className="w-4 h-4 shrink-0" /> Insurance support available
                </li>
                <li>
                  <Headset className="w-4 h-4 shrink-0" /> 24/7 roadside help
                </li>
              </ul>

              <Link href={`/reserve/${vehicle.id}`} className="btn-primary full-width">
                Reserve this vehicle
              </Link>
            </aside>
          </FadeInUp>
        </div>
      </div>
    </div>
  );
}
