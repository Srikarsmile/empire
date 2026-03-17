'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface ReservationRecord {
  id: string;
  vehicleTitle: string;
  vehicleImage: string;
  vehicleId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  price: number;
  subtotal: number;
  taxes: number;
  total: number;
  firstName: string;
  lastName: string;
  email: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [reservation, setReservation] = useState<ReservationRecord | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError(true);
      return;
    }

    fetch(`/api/checkout/confirm?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Payment not confirmed');
        return res.json() as Promise<ReservationRecord>;
      })
      .then(setReservation)
      .catch(() => setError(true));
  }, [sessionId]);

  if (error) {
    return (
      <div className="page-shell">
        <div className="shell" style={{ paddingTop: '7rem', maxWidth: '32rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--ink-500)' }}>
            We could not confirm your payment. If you were charged, contact support with your email.
          </p>
          <Link href="/fleet" className="btn-outline">
            Back to fleet
          </Link>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="page-shell">
        <div className="shell loading-stack" style={{ paddingTop: '7rem', maxWidth: '32rem' }}>
          <div className="skeleton" style={{ height: '2rem', width: '14rem' }} />
          <div className="skeleton" style={{ height: '22rem', width: '100%', borderRadius: '1.5rem' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="shell" style={{ paddingTop: '7rem', maxWidth: '32rem' }}>
        <div className="booking-card" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <CheckCircle2
            style={{ width: '2.8rem', height: '2.8rem', margin: '0 auto 1rem', color: 'var(--accent)' }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Rental confirmed</h1>
          <p className="muted-label" style={{ marginBottom: '1.75rem' }}>
            Booking #{reservation.id}
          </p>

          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{reservation.vehicleTitle}</h3>

            <div className="booking-date-summary" style={{ marginBottom: '1rem' }}>
              <p>
                <strong>Pickup:</strong> {formatDate(reservation.checkIn)}
              </p>
              <p>
                <strong>Return:</strong> {formatDate(reservation.checkOut)}
              </p>
              <p>
                <strong>Rental days:</strong> {reservation.nights}
              </p>
            </div>

            <div className="price-lines" style={{ marginBottom: '1.5rem' }}>
              <div>
                <span>
                  ${reservation.price} × {reservation.nights} days
                </span>
                <strong>${reservation.subtotal}</strong>
              </div>
              <div>
                <span>Taxes and service</span>
                <strong>${reservation.taxes}</strong>
              </div>
              <div className="total-row">
                <span>Total paid</span>
                <strong>${reservation.total}</strong>
              </div>
            </div>

            <p className="muted-label" style={{ marginBottom: '1.5rem' }}>
              Confirmation sent to {reservation.email} for {reservation.firstName} {reservation.lastName}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/reservations" className="btn-primary" style={{ textAlign: 'center' }}>
                View my reservations
              </Link>
              <Link href="/fleet" className="btn-outline" style={{ textAlign: 'center' }}>
                Back to fleet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell">
          <div className="shell loading-stack" style={{ paddingTop: '7rem', maxWidth: '32rem' }}>
            <div className="skeleton" style={{ height: '2rem', width: '14rem' }} />
            <div className="skeleton" style={{ height: '22rem', width: '100%', borderRadius: '1.5rem' }} />
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
