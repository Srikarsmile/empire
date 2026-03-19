'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard } from 'lucide-react';

type ReservationStatus = 'upcoming' | 'completed' | 'payment_pending' | 'cancelled';

interface Reservation {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleImage: string;
  status: ReservationStatus;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  total?: number;
  price: number;
  stripeSessionId?: string | null;
}

/** Convert CUID to human-readable ref: EC-XXXXXX */
function toRef(id: string): string {
  return `EC-${id.slice(-6).toUpperCase()}`;
}

/** Format ISO date string to readable format: Mar 20, 2026 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Status display config */
const STATUS_CONFIG: Record<ReservationStatus, { label: string; className: string }> = {
  upcoming: { label: 'Confirmed', className: 'confirmed' },
  payment_pending: { label: 'Awaiting Payment', className: 'payment-pending' },
  completed: { label: 'Completed', className: 'completed-status' },
  cancelled: { label: 'Cancelled', className: 'cancelled' },
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = () => {
    setIsLoading(true);
    setError(null);

    fetch('/api/reservations')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load reservations');
        return res.json();
      })
      .then((data) => {
        setReservations(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReservations = useMemo(() => {
    if (activeTab === 'upcoming') {
      // Show both confirmed (upcoming) and payment_pending under the Upcoming tab
      return reservations.filter(
        (r) => r.status === 'upcoming' || r.status === 'payment_pending',
      );
    }
    return reservations.filter((r) => r.status === 'completed');
  }, [activeTab, reservations]);

  // Count payment_pending to show a badge on the Upcoming tab
  const pendingCount = useMemo(
    () => reservations.filter((r) => r.status === 'payment_pending').length,
    [reservations],
  );

  return (
    <div className="page-shell bookings-page">
      <div className="shell">
        <div className="bookings-head">
          <h1>Reservations</h1>
          <p>Track upcoming rentals and review completed ones.</p>
        </div>

        <div className="tab-row" role="tablist">
          {(['upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
            >
              {tab === 'upcoming' ? 'Upcoming' : 'Completed'}
              {tab === 'upcoming' && pendingCount > 0 && (
                <span className="tab-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="loading-stack">
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton" style={{ height: '9rem', borderRadius: '1.2rem' }} />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="error-state" style={{ minHeight: '20rem' }}>
            <h3>Unable to load reservations</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchReservations}>
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={`panel-${activeTab}`}
              className="bookings-list"
              role="tabpanel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {filteredReservations.length === 0 ? (
                <div className="no-results bookings-empty">
                  <h3>No {activeTab} rentals yet</h3>
                  <p>
                    {activeTab === 'upcoming'
                      ? 'Reserve a vehicle and it will appear here.'
                      : 'Completed rentals will appear after return.'}
                  </p>
                  {activeTab === 'upcoming' ? (
                    <Link href="/" className="btn-primary">
                      Explore fleet
                    </Link>
                  ) : null}
                </div>
              ) : (
                filteredReservations.map((reservation, index) => {
                  const statusConfig = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.upcoming;
                  const isPending = reservation.status === 'payment_pending';

                  return (
                    <motion.article
                      className={`booking-item ${isPending ? 'booking-item--pending' : ''}`}
                      key={reservation.id}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Image
                        src={reservation.vehicleImage || '/icon.png'}
                        alt={reservation.vehicleTitle}
                        width={160}
                        height={110}
                      />
                      <div className="booking-item-content">
                        <span className={`status-pill ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                        <h3>{reservation.vehicleTitle}</h3>
                        <p>
                          {reservation.checkIn && reservation.checkOut
                            ? `${formatDate(reservation.checkIn)} → ${formatDate(reservation.checkOut)}`
                            : 'Pickup and return dates will be finalized soon'}
                        </p>
                        <small>Ref: {toRef(reservation.id)}</small>
                      </div>
                      <div className="booking-item-side">
                        <strong>${reservation.total ?? Math.round(reservation.price * 4 * 1.14)}</strong>
                        {isPending ? (
                          <a
                            href={`/api/reservations/pay?id=${reservation.id}`}
                            className="btn-primary pay-now-btn"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </a>
                        ) : (
                          <Link href={`/fleet/${reservation.vehicleId}`} className="btn-outline">
                            View vehicle
                          </Link>
                        )}
                        {reservation.status === 'completed' && (
                          <Link
                            href={`/fleet/${reservation.vehicleId}#reviews`}
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', textAlign: 'center' }}
                          >
                            Leave a review
                          </Link>
                        )}
                      </div>
                    </motion.article>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
