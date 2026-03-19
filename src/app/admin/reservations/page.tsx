"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";

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
}

const STATUS_COLORS: Record<string, string> = {
  upcoming:         'bg-blue-100 text-blue-700',
  completed:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
  payment_pending:  'bg-amber-100 text-amber-700',
};

const PAGE_SIZE = 20;

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast]       = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Confirm dialog for cancelling a booking
  const [confirmCancel, setConfirmCancel] = useState<{ id: string; name: string } | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ id: string; status: string } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Clear selection whenever the reservation list changes
  useEffect(() => { setSelected(new Set()); }, [reservations]);

  const allSelected = reservations.length > 0 && selected.size === reservations.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(reservations.map((r) => r.id)));
  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const bulkUpdateStatus = async (status: string) => {
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => fetch(`/api/admin/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })));
    setSelected(new Set());
    loadPage(page, search, statusFilter);
    showToast(`${ids.length} booking${ids.length !== 1 ? 's' : ''} marked as ${status}.`);
  };

  const loadPage = useCallback(async (p: number, q: string, st: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (q)  params.set('search', q);
      if (st) params.set('status', st);
      const res = await fetch(`/api/admin/reservations?${params}`);
      const json = await res.json();
      setReservations(json.data ?? []);
      setTotal(json.total ?? 0);
      setPages(json.pages ?? 1);
      setPage(json.page ?? 1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadPage(1, search, statusFilter), 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, loadPage]);

  const handleStatusChange = (id: string, firstName: string, lastName: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      setPendingStatus({ id, status: newStatus });
      setConfirmCancel({ id, name: `${firstName} ${lastName}` });
    } else {
      applyStatus(id, newStatus);
    }
  };

  const applyStatus = async (id: string, status: string) => {
    const previous = reservations.find((r) => r.id === id)?.status;
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      showToast(`Booking marked as ${status}.`);
    } catch {
      // Revert optimistic update
      if (previous !== undefined) {
        setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: previous } : r));
      }
      showToast('Failed to update status. Please try again.');
    }
  };

  const handleCancelConfirm = async () => {
    if (!pendingStatus) return;
    await applyStatus(pendingStatus.id, pendingStatus.status);
    setConfirmCancel(null);
    setPendingStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Confirm cancel */}
      <ConfirmDialog
        isOpen={!!confirmCancel}
        title={`Cancel booking for ${confirmCancel?.name}?`}
        message="This will mark the reservation as cancelled. The guest will not be automatically refunded — you must handle that separately."
        confirmLabel="Cancel Booking"
        danger
        onConfirm={handleCancelConfirm}
        onCancel={() => { setConfirmCancel(null); setPendingStatus(null); }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reservations</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total > 0 ? `${total} booking${total !== 1 ? 's' : ''}` : 'All bookings from your customers.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/api/admin/reservations/export"
            download
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <Link
            href="/admin/reservations/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Manual booking
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-2 shadow-sm flex-1 sm:max-w-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search guest, vehicle, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 placeholder:text-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 text-sm text-gray-700 font-medium rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="">All statuses</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bulk action toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium">
          <span>{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => bulkUpdateStatus('upcoming')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Mark Upcoming</button>
            <button onClick={() => bulkUpdateStatus('completed')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Mark Completed</button>
            <button onClick={() => bulkUpdateStatus('cancelled')} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Cancel</button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Clear</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading...</div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {search || statusFilter ? 'No reservations match your filters.' : 'No reservations yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="w-10 pl-6 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300 cursor-pointer" aria-label="Select all" />
                  </th>
                  {['Guest', 'Email', 'Vehicle', 'Check-in', 'Check-out', 'Nights', 'Total', 'Status', 'Booked'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservations.map((r) => (
                  <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${selected.has(r.id) ? 'bg-blue-50/60' : ''}`}>
                    <td className="pl-6 py-4">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} className="rounded border-gray-300 cursor-pointer" aria-label={`Select ${r.firstName} ${r.lastName}`} />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{r.firstName} {r.lastName}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{r.email}</td>
                    <td className="px-6 py-4 text-gray-600">{r.vehicleTitle}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.checkIn}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.checkOut}</td>
                    <td className="px-6 py-4 text-gray-600">{r.nights}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${r.total}</td>
                    <td className="px-6 py-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, r.firstName, r.lastName, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10 ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        <option value="payment_pending">Payment Pending</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {pages} &nbsp;·&nbsp; {total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadPage(page - 1, search, statusFilter)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p = Math.max(1, Math.min(pages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => loadPage(p, search, statusFilter)}
                  className={`w-9 h-9 text-sm rounded-xl border transition-colors font-medium ${
                    p === page
                      ? 'bg-black text-white border-black'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => loadPage(page + 1, search, statusFilter)}
              disabled={page >= pages}
              aria-label="Next page"
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
