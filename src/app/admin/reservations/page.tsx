"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Download } from "lucide-react";
import Link from "next/link";

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
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reservations')
      .then((r) => r.json())
      .then((data) => { setReservations(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  }

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      r.vehicleTitle.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reservations</h1>
          <p className="mt-1 text-sm text-gray-500">All bookings from your customers.</p>
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

      {/* Filter bar */}
      <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-2 shadow-sm w-full sm:max-w-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search guest, vehicle, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 placeholder:text-gray-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {search ? 'No reservations match your search.' : 'No reservations yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Guest', 'Email', 'Vehicle', 'Check-in', 'Check-out', 'Nights', 'Total', 'Status', 'Booked'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
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
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10 ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}
                      >
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
    </div>
  );
}
