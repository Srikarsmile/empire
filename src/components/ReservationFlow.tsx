'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import type { DateRange } from '@/lib/dateUtils';
import {
  normalizeDate,
  dateToKey,
  keyToDate,
  addDays,
  getStayNights,
  getBookedSet,
  formatDateShort,
} from '@/lib/dateUtils';
import Toast from '@/components/Toast';

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

// Date utilities imported from @/lib/dateUtils

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

export default function ReservationFlow({ vehicleId, cancellationPolicy }: { vehicleId: string; cancellationPolicy?: string }) {
  const searchParams = useSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? '');
  const [dateSelectionNotice, setDateSelectionNotice] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirportId, setSelectedAirportId] = useState<string>('');
  const [taxRate, setTaxRate] = useState(14);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [airportEnabled, setAirportEnabled] = useState(true);
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);
  const [insuranceFee, setInsuranceFee] = useState(0);
  const [wantsInsurance, setWantsInsurance] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplying, setPromoApplying] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicles/${vehicleId}`).then((r) => r.json()),
      fetch('/api/admin/airports').then((r) => r.json()).catch(() => []),
      fetch('/api/admin/fees-config').then((r) => r.json()).catch(() => ({})),
    ]).then(([vehicleData, airportsData, feesData]: [Vehicle, Airport[], Record<string, unknown>]) => {
      setVehicle(vehicleData);
      setCheckIn((prev) => {
        if (prev) return prev;
        return findFirstAvailableWindow(vehicleData.bookedRanges ?? [], vehicleData.minNights ?? 2).checkIn;
      });
      setCheckOut((prev) => {
        if (prev) return prev;
        return findFirstAvailableWindow(vehicleData.bookedRanges ?? [], vehicleData.minNights ?? 2).checkOut;
      });
      if (Array.isArray(airportsData)) setAirports(airportsData);
      if (typeof feesData.taxRate === 'number') setTaxRate(feesData.taxRate);
      if (typeof feesData.taxEnabled === 'boolean') setTaxEnabled(feesData.taxEnabled);
      if (typeof feesData.airportEnabled === 'boolean') setAirportEnabled(feesData.airportEnabled);
      if (typeof feesData.insuranceEnabled === 'boolean') setInsuranceEnabled(feesData.insuranceEnabled);
      if (typeof feesData.insuranceFee === 'number') setInsuranceFee(feesData.insuranceFee);
    });
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

    const MAX_NIGHTS = 30;
    if (nights > MAX_NIGHTS) return `Maximum rental is ${MAX_NIGHTS} days.`;

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
  const appliedInsuranceFee = insuranceEnabled && wantsInsurance ? insuranceFee : 0;
  const total = subtotal + taxes + airportFee + appliedInsuranceFee - promoDiscount;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoApplying(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      });
      const data = (await res.json()) as { code?: string; discount?: number; error?: string };
      if (res.ok && data.code && data.discount !== undefined) {
        setPromoCode(data.code);
        setPromoDiscount(data.discount);
        setPromoError('');
      } else {
        setPromoError(data.error ?? 'Invalid promo code');
        setPromoCode('');
        setPromoDiscount(0);
      }
    } catch {
      setPromoError('Could not apply code. Please retry.');
    } finally {
      setPromoApplying(false);
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoInput('');
    setPromoError('');
  };

  const markTouched = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const confirmReservation = useCallback(async () => {
    if (isSubmitting) return;
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
          promoCode: promoCode || undefined,
        }),
      });

      if (response.ok) {
        const { url } = (await response.json()) as { url: string };
        window.location.href = url;
      } else {
        setErrorToast('Could not start checkout. Please retry.');
        setIsSubmitting(false);
      }
    } catch {
      setErrorToast('Rental request failed. Please retry.');
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

  const reservationBlocked = !isFormValid || Boolean(dateError) || !agreedToTerms;

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

          <div className="booking-progress">
            <span className={`step-dot ${dateError === '' ? 'done' : 'active'}`}>1</span>
            <span className="step-line" />
            <span className={`step-dot ${isFormValid && dateError === '' ? 'done' : isFormValid ? 'active' : ''}`}>2</span>
            <span className="step-line" />
            <span className="step-dot">3</span>
          </div>

          <div className="booking-layout">
            <section className="booking-forms">
              <div className="info-card">
                <h2 id="driver-heading">Driver information</h2>
                <div className="form-grid">
                  {([
                    ['firstName', 'First name', 'text', 'John'],
                    ['lastName', 'Last name', 'text', 'Doe'],
                    ['email', 'Email', 'email', 'john@example.com'],
                    ['phone', 'Phone', 'tel', '+1 234 567 8900'],
                  ] as const).map(([field, label, type, placeholder]) => (
                    <label key={field} className="field-block">
                      <span>{label} <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span></span>
                      <input
                        suppressHydrationWarning
                        type={type}
                        placeholder={placeholder}
                        required
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

              {insuranceEnabled && insuranceFee > 0 && (
                <div className="info-card">
                  <h2>Insurance <span style={{ fontSize: '0.8em', fontWeight: 400, color: 'var(--ink-500)' }}>(optional)</span></h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginBottom: '1rem' }}>
                    Cover damage and theft for the duration of your rental.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.75rem', background: wantsInsurance ? 'var(--accent-surface)' : '#fff' }}>
                    <input
                      type="checkbox"
                      checked={wantsInsurance}
                      onChange={(e) => setWantsInsurance(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Add insurance cover</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--accent)' }}>+${insuranceFee}</span>
                  </label>
                </div>
              )}

              <div className="info-card">
                <h2 id="dates-heading">Rental dates</h2>
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
                    <strong>Pickup:</strong> {checkIn ? formatDateShort(checkIn) : 'Select a date'}
                  </p>
                  <p>
                    <strong>Return:</strong> {checkOut ? formatDateShort(checkOut) : 'Select a date'}
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
                  <Image src={vehicle.images[0]} alt={vehicle.title} width={86} height={86} unoptimized={vehicle.images[0]?.startsWith('/uploads/')} />
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
                  {promoDiscount > 0 && (
                    <div style={{ color: 'var(--success, #16a34a)' }}>
                      <span>Promo ({promoCode})</span>
                      <strong>-${promoDiscount}</strong>
                    </div>
                  )}
                  <div className="total-row">
                    <span>Total</span>
                    <strong>${total}</strong>
                  </div>
                </div>

                {/* Promo code input */}
                {!promoCode ? (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }}
                        style={{ flex: 1, borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoApplying || !promoInput.trim()}
                        style={{ borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '0.5rem 0.875rem', fontSize: '0.875rem', fontWeight: 600, background: 'white', cursor: 'pointer', opacity: promoApplying || !promoInput.trim() ? 0.5 : 1 }}
                      >
                        {promoApplying ? '...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <small style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{promoError}</small>}
                  </div>
                ) : (
                  <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-soft, #f9fafb)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--success, #16a34a)', fontWeight: 600 }}>✓ {promoCode} applied</span>
                    <button type="button" onClick={removePromo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-400, #9ca3af)', fontSize: '0.8rem' }}>Remove</button>
                  </div>
                )}

                {cancellationPolicy && (
                  <div style={{
                    background: 'var(--surface-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: '0.85rem', flexShrink: 0, marginTop: '0.05rem' }}>ⓘ</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-700)', lineHeight: '1.5' }}>
                      <strong>Cancellation policy:</strong> {cancellationPolicy}
                    </span>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: '0.2rem', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: '1.5' }}>
                    I agree to the{' '}
                    <Link href="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms &amp; Conditions</Link>
                    {' '}and{' '}
                    <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</Link>.
                  </span>
                </label>
                <button
                  className="btn-primary full-width"
                  onClick={confirmReservation}
                  disabled={isSubmitting || reservationBlocked}
                >
                  <Lock className="w-4 h-4" />
                  {isSubmitting ? 'Redirecting…' : `Reserve · $${total} total`}
                </button>
                <p className="muted-label" style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                  <Lock className="inline w-3 h-3" /> Secured by Stripe · Charged after confirmation
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {errorToast && (
        <Toast
          message={errorToast}
          onClose={() => setErrorToast('')}
        />
      )}
    </>
  );
}
