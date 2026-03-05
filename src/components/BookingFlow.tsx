'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import type { DateRange } from '@/data/propertyMeta';

interface Property {
  id: string;
  title: string;
  price: number;
  images: string[];
  location: string;
  minNights: number;
  bookedRanges: DateRange[];
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateToKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function keyToDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getBookedSet(bookedRanges: DateRange[]) {
  const set = new Set<string>();

  bookedRanges.forEach((range) => {
    const start = keyToDate(range.start);
    const end = keyToDate(range.end);
    let cursor = normalizeDate(start);

    while (cursor <= end) {
      set.add(dateToKey(cursor));
      cursor = addDays(cursor, 1);
    }
  });

  return set;
}

function getStayNights(checkIn: string, checkOut: string) {
  const nights: string[] = [];
  let cursor = normalizeDate(keyToDate(checkIn));
  const end = normalizeDate(keyToDate(checkOut));

  while (cursor < end) {
    nights.push(dateToKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return nights;
}

function findFirstAvailableWindow(bookedRanges: DateRange[], minNights: number) {
  const bookedSet = getBookedSet(bookedRanges);
  let start = addDays(normalizeDate(new Date()), 2);

  for (let i = 0; i < 180; i += 1) {
    const startKey = dateToKey(start);
    const end = addDays(start, minNights);
    const endKey = dateToKey(end);
    const nights = getStayNights(startKey, endKey);
    const hasBlocked = nights.some((day) => bookedSet.has(day));

    if (!hasBlocked) {
      return { checkIn: startKey, checkOut: endKey };
    }

    start = addDays(start, 1);
  }

  const fallbackStart = dateToKey(addDays(normalizeDate(new Date()), 2));
  const fallbackEnd = dateToKey(addDays(normalizeDate(new Date()), 2 + minNights));
  return { checkIn: fallbackStart, checkOut: fallbackEnd };
}

export default function BookingFlow({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [dateSelectionNotice, setDateSelectionNotice] = useState('');

  useEffect(() => {
    fetch(`/api/properties/${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        setProperty(data);
        const defaults = findFirstAvailableWindow(data.bookedRanges ?? [], data.minNights ?? 2);
        setCheckIn(defaults.checkIn);
        setCheckOut(defaults.checkOut);
      });
  }, [propertyId]);

  const formErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';

    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(formData.phone)) errors.phone = 'Invalid phone format';

    return errors;
  }, [formData]);

  const isFormValid = Object.keys(formErrors).length === 0;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = keyToDate(checkIn);
    const end = keyToDate(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }, [checkIn, checkOut]);

  const dateError = useMemo(() => {
    if (!property || !checkIn || !checkOut) return 'Pick both check-in and check-out dates.';
    if (checkOut <= checkIn) return 'Check-out must be after check-in.';
    if (nights < property.minNights) return `Minimum stay is ${property.minNights} nights.`;

    const bookedSet = getBookedSet(property.bookedRanges);
    const hasBookedConflict = getStayNights(checkIn, checkOut).some((day) => bookedSet.has(day));

    if (hasBookedConflict) {
      return 'Selected dates include unavailable nights.';
    }

    return '';
  }, [checkIn, checkOut, nights, property]);

  const subtotal = (property?.price ?? 0) * nights;
  const taxes = Math.round(subtotal * 0.14);
  const total = subtotal + taxes;

  const markTouched = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const confirmBooking = useCallback(async () => {
    setTouched({ firstName: true, lastName: true, email: true, phone: true });
    if (!isFormValid || !property || dateError) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyId,
          propertyTitle: property.title,
          propertyImage: property.images[0],
          price: property.price,
          checkIn,
          checkOut,
          nights,
          total,
        }),
      });

      if (response.ok) setBookingSuccess(true);
    } catch {
      alert('Booking failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  }, [checkIn, checkOut, dateError, formData, isFormValid, nights, property, propertyId, total]);

  if (!property) {
    return (
      <div className="page-shell">
        <div className="shell loading-stack" style={{ paddingTop: '7rem' }}>
          <div className="skeleton" style={{ height: '2rem', width: '12rem' }} />
          <div className="skeleton" style={{ height: '26rem', width: '100%', borderRadius: '1.5rem' }} />
          <div className="skeleton" style={{ height: '18rem', width: '100%', borderRadius: '1.5rem' }} />
        </div>
      </div>
    );
  }

  const bookingBlocked = !isFormValid || Boolean(dateError);

  return (
    <>
      <div className="page-shell booking-page">
        <div className="shell">
          <Link href={`/property/${propertyId}`} className="btn-back">
            <i className="ph ph-arrow-left" /> Back to property
          </Link>

          <div className="booking-heading">
            <h1>Confirm and Book</h1>
            <p>Dates below are live with unavailable nights blocked.</p>
          </div>

          <div className="booking-layout">
            <section className="booking-forms">
              <div className="info-card">
                <h2>Guest details</h2>
                <div className="form-grid">
                  {([
                    ['firstName', 'First name', 'text', 'John'],
                    ['lastName', 'Last name', 'text', 'Doe'],
                    ['email', 'Email', 'email', 'john@example.com'],
                    ['phone', 'Phone', 'tel', '+1 234 567 8900'],
                  ] as const).map(([field, label, type, placeholder]) => (
                    <label key={field} className="field-block">
                      <span>{label}</span>
                      <input
                        suppressHydrationWarning
                        type={type}
                        placeholder={placeholder}
                        value={formData[field]}
                        onChange={(event) => setFormData({ ...formData, [field]: event.target.value })}
                        onBlur={() => markTouched(field)}
                        className={touched[field] && formErrors[field] ? 'input-error' : ''}
                      />
                      {touched[field] && formErrors[field] ? (
                        <small className="error-text">{formErrors[field]}</small>
                      ) : null}
                    </label>
                  ))}
                </div>
              </div>

              <div className="info-card">
                <h2>Availability calendar</h2>
                <AvailabilityCalendar
                  bookedRanges={property.bookedRanges}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onCheckInChange={(value) => {
                    setCheckIn(value);
                    setDateSelectionNotice('');
                  }}
                  onCheckOutChange={(value) => {
                    setCheckOut(value);
                    setDateSelectionNotice('');
                  }}
                  onInvalidSelection={setDateSelectionNotice}
                />

                <div className="booking-date-summary">
                  <p>
                    <strong>Check in:</strong> {checkIn ? formatDate(checkIn) : 'Select a date'}
                  </p>
                  <p>
                    <strong>Check out:</strong> {checkOut ? formatDate(checkOut) : 'Select a date'}
                  </p>
                  <p>
                    <strong>Nights:</strong> {nights || 0}
                  </p>
                </div>

                {dateSelectionNotice ? <p className="error-text">{dateSelectionNotice}</p> : null}
                {dateError ? <p className="error-text">{dateError}</p> : null}
              </div>
            </section>

            <aside className="booking-side">
              <div className="booking-card sticky">
                <div className="booking-place">
                  <Image src={property.images[0]} alt={property.title} width={86} height={86} />
                  <div>
                    <h3>{property.title}</h3>
                    <p>{property.location}</p>
                  </div>
                </div>

                <p className="min-stay-line">Minimum stay: {property.minNights} nights</p>

                <div className="price-lines">
                  <div>
                    <span>
                      ${property.price} x {nights} nights
                    </span>
                    <strong>${subtotal}</strong>
                  </div>
                  <div>
                    <span>Taxes and fees</span>
                    <strong>${taxes}</strong>
                  </div>
                  <div className="total-row">
                    <span>Total</span>
                    <strong>${total}</strong>
                  </div>
                </div>

                <button
                  className="btn-primary full-width"
                  onClick={confirmBooking}
                  disabled={isSubmitting || bookingBlocked}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm reservation'}
                </button>
                <p className="muted-label">You will only be charged after confirmation.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {bookingSuccess ? (
          <motion.div
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="success-card"
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <i className="ph-fill ph-check-circle" />
              <h2>Booking confirmed</h2>
              <p>Your stay is locked in. Manage it anytime from trips.</p>
              <Link href="/bookings" className="btn-primary">
                Go to my bookings
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
