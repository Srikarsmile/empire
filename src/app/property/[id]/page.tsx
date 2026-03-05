import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FadeInUp, ScaleIn } from '@/components/animations/MotionWrapper';
import { getPropertyById } from '@/lib/propertyData';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  const nextBlockedWindow = property.bookedRanges[0];

  return (
    <div className="page-shell property-page">
      <div className="shell">
        <Link href="/" className="btn-back">
          <i className="ph ph-arrow-left" /> Back to homes
        </Link>

        <FadeInUp>
          <div className="property-heading">
            <h1>{property.title}</h1>
            <p>
              <i className="ph ph-map-pin" />
              {property.location}
            </p>
            <div className="property-rating-line">
              <span>
                <i className="ph-fill ph-star" /> {property.rating.toFixed(2)}
              </span>
              <span>{property.reviewCount} reviews</span>
            </div>
          </div>
        </FadeInUp>

        <ScaleIn delay={0.1}>
          <div className="gallery-grid">
            <div className="gallery-main">
              <Image src={property.images[0]} alt={property.title} fill priority sizes="(max-width: 900px) 100vw, 60vw" />
            </div>
            {property.images.slice(1, 5).map((image, index) => (
              <div key={image} className="gallery-thumb">
                <Image src={image} alt={`${property.title} view ${index + 2}`} fill sizes="(max-width: 900px) 50vw, 20vw" />
              </div>
            ))}
          </div>
        </ScaleIn>

        <div className="property-layout">
          <FadeInUp className="property-content">
            <section className="info-card">
              <h2>About this stay</h2>
              <p>{property.description}</p>
            </section>

            <section className="info-card">
              <h2>What you get</h2>
              <ul className="amenities-grid">
                {property.amenities.map((amenity) => (
                  <li key={amenity}>
                    <i className="ph ph-check-circle" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>

            <section className="info-card reviews-card">
              <div className="reviews-header-row">
                <h2>Guest Reviews</h2>
                <p>
                  <i className="ph-fill ph-star" /> {property.rating.toFixed(2)} ({property.reviewCount})
                </p>
              </div>

              <div className="reviews-list">
                {property.reviews.map((review) => (
                  <article key={review.id} className="review-item">
                    <div className="review-top-row">
                      <div>
                        <strong>{review.guestName}</strong>
                        <p>{formatDate(review.date)}</p>
                      </div>
                      <span>
                        <i className="ph-fill ph-star" /> {review.rating.toFixed(1)}
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
                <strong>${property.price}</strong>
                <span>per night</span>
              </div>

              <div className="availability-pill">
                <i className="ph-fill ph-check-circle" />
                Minimum stay: {property.minNights} nights
              </div>

              {nextBlockedWindow ? (
                <p className="next-blocked-note">
                  Next unavailable window: {formatDate(nextBlockedWindow.start)} - {formatDate(nextBlockedWindow.end)}
                </p>
              ) : null}

              <ul className="booking-notes">
                <li>
                  <i className="ph ph-lightning" /> Instant confirmation
                </li>
                <li>
                  <i className="ph ph-shield-check" /> Secure payment
                </li>
                <li>
                  <i className="ph ph-headset" /> 24/7 host support
                </li>
              </ul>

              <Link href={`/book/${property.id}`} className="btn-primary full-width">
                Reserve this stay
              </Link>
            </aside>
          </FadeInUp>
        </div>
      </div>
    </div>
  );
}
