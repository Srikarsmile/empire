'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

interface Reservation {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleImage: string;
  status: 'upcoming' | 'completed';
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  total?: number;
  price: number;
}

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
    // Initial fetch — isLoading is already true from the initializer,
    // so we skip synchronous setState and go straight to the async fetch.
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
  }, []);

  const filteredReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status === activeTab),
    [activeTab, reservations],
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
              {tab[0].toUpperCase() + tab.slice(1)}
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
                filteredReservations.map((reservation, index) => (
                  <motion.article
                    className="booking-item"
                    key={reservation.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Image src={reservation.vehicleImage || '/icon.png'} alt={reservation.vehicleTitle} width={160} height={110} />
                    <div className="booking-item-content">
                      <span className={`status-pill ${reservation.status}`}>{reservation.status}</span>
                      <h3>{reservation.vehicleTitle}</h3>
                      <p>
                        {reservation.checkIn && reservation.checkOut
                          ? `${reservation.checkIn} to ${reservation.checkOut}`
                          : 'Pickup and return dates will be finalized soon'}
                      </p>
                      <small>Reservation ref: {reservation.id}</small>
                    </div>
                    <div className="booking-item-side">
                      <strong>${reservation.total ?? Math.round(reservation.price * 4 * 1.14)}</strong>
                      <Link href={`/fleet/${reservation.vehicleId}`} className="btn-outline">
                        View vehicle
                      </Link>
                    </div>
                  </motion.article>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
