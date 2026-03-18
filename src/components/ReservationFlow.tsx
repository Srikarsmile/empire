'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import type { DateRange } from '@/data/vehicleMeta';

interface Vehicle {
  id: string;
  title: string;
  price: number;
  capacity: number;
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

type Airport = { id: string; name: string; city: string; fee: number };

export default function ReservationFlow({ vehicleId }: { vehicleId: string }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirportId, setSelectedAirportId] = useState<string>('');
  const [taxRate, setTaxRate] = useState(14);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [airportEnabled, setAirportEnabled] = useState(true);
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);
  const [insuranceFee, setInsuranceFee] = useState(0);

  useEffect(() => {
    fetch(`/api/vehicles/${vehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicle(data);
        const defaults = findFirstAvailableWindow(data.bookedRanges ?? [], data.minNights ?? 2);
        setCheckIn(defaults.checkIn);
        setCheckOut(defaults.checkOut);
      });
    fetch('/api/admin/airports')
      .then((res) => res.json())
      .then((data) => setAirports(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch('/api/admin/fees-config')
      .then((res) => res.json())
      .then((d) => {
        if (typeof d.taxRate === 'number') setTaxRate(d.taxRate);
        if (typeof d.taxEnabled === 'boolean') setTaxEnabled(d.taxEnabled);
        if (typeof d.airportEnabled === 'boolean') setAirportEnabled(d.airportEnabled);
        if (typeof d.insuranceEnabled === 'boolean') setInsuranceEnabled(d.insuranceEnabled);
        if (typeof d.insuranceFee === 'number') setInsuranceFee(d.insuranceFee);
      })
      .catch(() => {});
  }, [vehicleId]);

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
    if (!vehicle || !checkIn || !checkOut) return 'Pick both pickup and return dates.';
    if (checkOut <= checkIn) return 'Return must be after pickup.';
    if (nights < vehicle.minNights) return `Minimum rental is ${vehicle.minNights} day${vehicle.minNights > 1 ? 's' : ''}.`;

    const bookedSet = getBookedSet(vehicle.bookedRanges);
    const hasBookedConflict = getStayNights(checkIn, checkOut).some((day) => bookedSet.has(day));

    if (hasBookedConflict) {
      return 'Selected dates include unavailable rental days.';
    }

    return '';
  }, [checkIn, checkOut, nights, vehicle]);

  const selectedAirport = (airportEnabled ? airports.find((a) => a.id === selectedAirportId) : null) ?? null;
  const airportFee = selectedAirport?.fee ?? 0;
  const subtotal = (vehicle?.price ?? 0) * nights;
  const taxes = taxEnabled ? Math.round(subtotal * (taxRate / 100)) : 0;
  const appliedInsuranceFee = insuranceEnabled ? insuranceFee : 0;
  const total = subtotal + taxes + airportFee + appliedInsuranceFee;

  const markTouched = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const confirmReservation = useCallback(async () => {
    setTouched({ firstName: true, lastName: true, email: true, phone: true });
    if (!isFormValid || !vehicle || dateError) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicleId,
          checkIn,
          checkOut,
          nights,
          airportFee,
          dropoffLocation: selectedAirport ? `${selectedAirport.name}, ${selectedAirport.city}` : '',
          insuranceFee: appliedInsuranceFee,
        }),
      });

      if (response.ok) {
        const { url } = (await response.json()) as { url: string };
        window.location.href = url;
      } else {
        alert('Could not start checkout. Please retry.');
        setIsSubmitting(false);
      }
    } catch {
      alert('Rental request failed. Please retry.');
      setIsSubmitting(false);
    }
  }, [checkIn, checkOut, dateError, formData, isFormValid, nights, vehicle, vehicleId]);

  if (!vehicle) {
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

  const reservationBlocked = !isFormValid || Boolean(dateError);

  return (
    <>
      <div className="page-shell booking-page">
        <div className="shell">
          <Link href={`/fleet/${vehicleId}`} className="btn-back">
            <ArrowLeft className="inline w-4 h-4" /> Back to vehicle
          </Link>

          <div className="booking-heading">
            <h1>Confirm your rental</h1>
            <p>Pickup and return dates below are live with unavailable days blocked.</p>
          </div>

          <div className="booking-layout">
            <section className="booking-forms">
              <div className="info-card">
                <h2>Driver details</h2>
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

              {airportEnabled && airports.length > 0 && (
                <div className="info-card">
                  <h2>Airport drop-off <span style={{ fontSize: '0.8em', fontWeight: 400, color: 'var(--ink-500)' }}>(optional)</span></h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginBottom: '1rem' }}>
                    Need the car delivered to an airport? Select a location below.
                  </p>
                  <div className="field-block">
                    <select
                      value={selectedAirportId}
                      onChange={(e) => setSelectedAirportId(e.target.value)}
                      style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '0.625rem 1rem', fontSize: '0.875rem', background: 'white' }}
                    >
                      <option value="">No airport drop-off</option>
                      {airports.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}, {a.city} — +${a.fee}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="info-card">
                <h2>Rental calendar</h2>
                <AvailabilityCalendar
                  bookedRanges={vehicle.bookedRanges}
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
                    <strong>Pickup:</strong> {checkIn ? formatDate(checkIn) : 'Select a date'}
                  </p>
                  <p>
                    <strong>Return:</strong> {checkOut ? formatDate(checkOut) : 'Select a date'}
                  </p>
                  <p>
                    <strong>Rental days:</strong> {nights || 0}
                  </p>
                </div>

                {dateSelectionNotice ? <p className="error-text">{dateSelectionNotice}</p> : null}
                {dateError ? <p className="error-text">{dateError}</p> : null}
              </div>
            </section>

            <aside className="booking-side">
              <div className="booking-card sticky">
                <div className="booking-place">
                  <Image src={vehicle.images[0]} alt={vehicle.title} width={86} height={86} />
                  <div>
                    <h3>{vehicle.title}</h3>
                    <p>{vehicle.capacity} seats • {vehicle.location}</p>
                  </div>
                </div>

                <p className="min-stay-line">Minimum rental: {vehicle.minNights} day{vehicle.minNights > 1 ? 's' : ''}</p>

                <div className="price-lines">
                  <div>
                    <span>
                      ${vehicle.price} x {nights} days
                    </span>
                    <strong>${subtotal}</strong>
                  </div>
                  {taxEnabled && (
                    <div>
                      <span>Taxes and service ({taxRate}%)</span>
                      <strong>${taxes}</strong>
                    </div>
                  )}
                  {airportFee > 0 && (
                    <div>
                      <span>Airport drop-off</span>
                      <strong>${airportFee}</strong>
                    </div>
                  )}
                  {insuranceEnabled && appliedInsuranceFee > 0 && (
                    <div>
                      <span>Insurance</span>
                      <strong>${appliedInsuranceFee}</strong>
                    </div>
                  )}
                  <div className="total-row">
                    <span>Total</span>
                    <strong>${total}</strong>
                  </div>
                </div>

                <button
                  className="btn-primary full-width"
                  onClick={confirmReservation}
                  disabled={isSubmitting || reservationBlocked}
                >
                  {isSubmitting ? 'Redirecting...' : 'Continue to payment'}
                </button>
                <p className="muted-label">You will only be charged after your rental is confirmed.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

    </>
  );
}
