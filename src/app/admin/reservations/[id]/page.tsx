'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface Reservation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleTitle: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  status: string;
  createdAt: string;
  notes: string;
}

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/reservations/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setReservation(data);
          setNotes(data.notes ?? '');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  async function saveNotes() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 text-sm">Loading...</div>
    );
  }

  if (notFound || !reservation) {
    return (
      <div className="space-y-4">
        <Link href="/admin/reservations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to reservations
        </Link>
        <p className="text-gray-500 text-sm">Reservation not found.</p>
      </div>
    );
  }

  const bookingRef = reservation.id.slice(-8).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/reservations"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {reservation.firstName} {reservation.lastName}
          </h1>
          <p className="text-sm text-gray-500">Ref #{bookingRef}</p>
        </div>
      </div>

      {/* Booking summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Booking Details</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-gray-500">Vehicle</p>
            <p className="font-medium text-gray-900">{reservation.vehicleTitle}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium text-gray-900 capitalize">{reservation.status.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-gray-500">Check-in</p>
            <p className="font-medium text-gray-900">{reservation.checkIn}</p>
          </div>
          <div>
            <p className="text-gray-500">Check-out</p>
            <p className="font-medium text-gray-900">{reservation.checkOut}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{reservation.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{reservation.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Nights</p>
            <p className="font-medium text-gray-900">{reservation.nights}</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-medium text-gray-900">${reservation.total}</p>
          </div>
        </div>
      </div>

      {/* Internal notes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Internal Notes</h2>
          <p className="text-xs text-gray-500 mt-0.5">Only visible to admins — not shown to customers.</p>
        </div>
        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this reservation (special requests, payment issues, etc.)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={saveNotes}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving…' : 'Save notes'}
          </button>
          {saveStatus === 'saved' && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
          {saveStatus === 'error' && <span className="text-sm text-red-600 font-medium">Failed to save</span>}
        </div>
      </div>
    </div>
  );
}
