'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';

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
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState('');

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

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to cancel');
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setSuccessToast('Reservation cancelled successfully.');
    } catch {
      setSuccessToast('');
      // Keep reservation in list on error
    } finally {
      setCancellingId(null);
      setCancelConfirmId(null);
    }
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
    <>
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
                  {activeTab === 'upcoming' ? (
                    <>
                      <h3>No upcoming rentals</h3>
                      <p>Reserve a vehicle and it will appear here.</p>
                      <Link href="/#fleet" className="btn-primary">Browse our fleet →</Link>
                    </>
                  ) : (
                    <>
                      <h3>No completed rentals yet</h3>
                      <p>Completed rentals will appear here after your return.</p>
                    </>
                  )}
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
                        <small>Ref: <code style={{ fontFamily: 'monospace', background: 'var(--surface-soft)', padding: '0.1rem 0.3rem', borderRadius: '0.3rem' }}>{toRef(reservation.id)}</code></small>
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
                        {reservation.status === 'upcoming' && (
                          <button
                            className="btn-outline"
                            style={{ fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)', minHeight: '2.25rem', padding: '0.4rem 0.85rem' }}
                            onClick={() => setCancelConfirmId(reservation.id)}
                            disabled={cancellingId === reservation.id}
                          >
                            {cancellingId === reservation.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                        {reservation.status === 'completed' && (
                          <Link
                            href={`/fleet/${reservation.vehicleId}#reviews`}
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', textAlign: 'center' }}
                          >
                            Leave a review →
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

      <ConfirmDialog
        isOpen={cancelConfirmId !== null}
        title="Cancel reservation?"
        message="This will release your dates and send a cancellation confirmation email. This action cannot be undone."
        confirmLabel="Yes, cancel booking"
        danger
        onConfirm={() => cancelConfirmId && handleCancel(cancelConfirmId)}
        onCancel={() => setCancelConfirmId(null)}
      />

      {successToast && (
        <Toast message={successToast} onClose={() => setSuccessToast('')} />
      )}
    </>
  );
}
