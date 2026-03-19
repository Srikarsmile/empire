'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBookedSet, getStayNights } from '@/lib/dateUtils';

interface Vehicle {
  id: string;
  title: string;
  price: number;
  bookedRanges?: { start: string; end: string }[];
}

interface Airport { id: string; name: string; city: string; fee: number; }

export default function ManualBookingPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [saving, setSaving] = useState(false);
  const [taxRate, setTaxRate] = useState(14);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    vehicleId: '', firstName: '', lastName: '', email: '', phone: '',
    checkIn: '', checkOut: '', status: 'upcoming', dropoffLocation: '',
  });

  useEffect(() => {
    fetch('/api/vehicles?all=1').then((r) => r.json()).then(setVehicles);
    fetch('/api/admin/fees-config')
      .then((r) => r.json())
      .then((d) => { if (typeof d.taxRate === 'number') setTaxRate(d.taxRate); })
      .catch(() => {});
    fetch('/api/admin/airports').then((r) => r.json()).then(setAirports).catch(() => {});
  }, []);

  const vehicle = vehicles.find((v) => v.id === form.vehicleId);
  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000))
    : 0;
  const subtotal = (vehicle?.price ?? 0) * nights;
  const taxes = Math.round(subtotal * (taxRate / 100));
  const selectedAirport = airports.find((a) => `${a.name}, ${a.city}` === form.dropoffLocation);
  const airportFee = selectedAirport?.fee ?? 0;
  const total = subtotal + taxes + airportFee;

  const dateConflict = (() => {
    if (!vehicle || !form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) return false;
    const bookedSet = getBookedSet(vehicle.bookedRanges ?? []);
    return getStayNights(form.checkIn, form.checkOut).some((n) => bookedSet.has(n));
  })();

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle || nights < 1) return;
    if (form.checkOut <= form.checkIn) {
      setFormError('Check-out date must be after check-in date.');
      return;
    }
    if (dateConflict) {
      setFormError('These dates overlap with an existing booking. Please choose different dates.');
      return;
    }
    setFormError('');
    setSaving(true);
    const res = await fetch('/api/admin/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form, status: form.status, vehicleTitle: vehicle.title,
        vehicleImage: '', nights, price: vehicle.price,
        subtotal, taxes, total, dropoffLocation: form.dropoffLocation, airportFee,
      }),
    });
    if (res.ok) router.push('/admin/reservations');
    else { alert('Failed to create booking'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/reservations" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to reservations
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Manual Booking</h1>
        <p className="text-sm text-gray-500 mt-1">Create a reservation directly without Stripe.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
          <select required value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black">
            <option value="">Select vehicle...</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.title} — ${v.price}/day</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[['firstName', 'First name'], ['lastName', 'Last name']].map(([f, l]) => (
            <label key={f} className="block">
              <span className="text-sm font-medium text-gray-700">{l}</span>
              <input required type="text" value={form[f as keyof typeof form]}
                onChange={(e) => set(f, e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black" />
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Phone</span>
            <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Check-in</span>
            <input required type="date" value={form.checkIn} onChange={(e) => set('checkIn', e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Check-out</span>
            <input required type="date" value={form.checkOut} onChange={(e) => set('checkOut', e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <select value={form.status} onChange={(e) => set('status', e.target.value)}
            className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black">
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Airport Drop-off (optional)</span>
          <select value={form.dropoffLocation} onChange={(e) => set('dropoffLocation', e.target.value)}
            className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black">
            <option value="">No airport drop-off</option>
            {airports.map((a) => (
              <option key={a.id} value={`${a.name}, ${a.city}`}>
                {a.name}, {a.city} — +${a.fee}
              </option>
            ))}
          </select>
        </label>

        {nights > 0 && vehicle && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between text-gray-600"><span>${vehicle.price} × {nights} days</span><span>${subtotal}</span></div>
            <div className="flex justify-between text-gray-600"><span>Taxes ({taxRate}%)</span><span>${taxes}</span></div>
            {airportFee > 0 && (
              <div className="flex justify-between text-gray-600"><span>Airport drop-off</span><span>${airportFee}</span></div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200 mt-1"><span>Total</span><span>${total}</span></div>
          </div>
        )}

        {dateConflict && (
          <p className="text-sm text-red-600">
            These dates overlap with an existing booking for this vehicle.
          </p>
        )}

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button type="submit" disabled={saving || nights < 1 || !vehicle || dateConflict}
          className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition text-sm">
          {saving ? 'Creating...' : 'Create booking'}
        </button>
      </form>
    </div>
  );
}
