"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Reservation {
  id: string;
  firstName: string;
  lastName: string;
  vehicleTitle: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  status: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const cls = colors[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reservations')
      .then((r) => r.json())
      .then((data) => {
        setReservations(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      r.vehicleTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reservations</h1>
          <p className="mt-2 text-sm text-gray-500">All bookings from your customers.</p>
        </div>

        <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-2 shadow-sm w-full sm:max-w-sm">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search guest or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 placeholder:text-gray-400"
          />
        </div>
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Guest</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-in</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-out</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nights</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{r.firstName} {r.lastName}</td>
                    <td className="px-6 py-4 text-gray-600">{r.vehicleTitle}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.checkIn}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.checkOut}</td>
                    <td className="px-6 py-4 text-gray-600">{r.nights}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${r.total}</td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
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
