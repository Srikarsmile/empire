'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  status: 'upcoming' | 'completed';
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  total?: number;
  price: number;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = () => {
    setIsLoading(true);
    setError(null);

    fetch('/api/bookings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load bookings');
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let active = true;

    fetch('/api/bookings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load bookings');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setBookings(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => booking.status === activeTab),
    [activeTab, bookings],
  );

  return (
    <div className="page-shell bookings-page">
      <div className="shell">
        <div className="bookings-head">
          <h1>Trips and Reservations</h1>
          <p>Track upcoming stays and revisit completed ones.</p>
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
            <i className="ph ph-warning-circle" />
            <h3>Unable to load bookings</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchBookings}>
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
              {filteredBookings.length === 0 ? (
                <div className="no-results bookings-empty">
                  <i className="ph ph-calendar-blank" />
                  <h3>No {activeTab} trips yet</h3>
                  <p>
                    {activeTab === 'upcoming'
                      ? 'Pick your next stay and it will appear here.'
                      : 'Completed trips will appear after checkout.'}
                  </p>
                  {activeTab === 'upcoming' ? (
                    <Link href="/" className="btn-primary">
                      Explore homes
                    </Link>
                  ) : null}
                </div>
              ) : (
                filteredBookings.map((booking, index) => (
                  <motion.article
                    className="booking-item"
                    key={booking.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Image src={booking.propertyImage || '/logo.png'} alt={booking.propertyTitle} width={160} height={110} />
                    <div className="booking-item-content">
                      <span className={`status-pill ${booking.status}`}>{booking.status}</span>
                      <h3>{booking.propertyTitle}</h3>
                      <p>
                        {booking.checkIn && booking.checkOut
                          ? `${booking.checkIn} to ${booking.checkOut}`
                          : 'Dates will be finalized with host'}
                      </p>
                      <small>Booking ref: {booking.id}</small>
                    </div>
                    <div className="booking-item-side">
                      <strong>${booking.total ?? Math.round(booking.price * 4 * 1.14)}</strong>
                      <Link href={`/property/${booking.propertyId}`} className="btn-outline">
                        View stay
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
