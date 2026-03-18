'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Reservation {
  id: string;
  firstName: string;
  lastName: string;
  vehicleTitle: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

const STATUS_COLOR: Record<string, string> = {
  upcoming: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
};

export default function CalendarPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [date, setDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reservations')
      .then((r) => r.json())
      .then((data) => { setReservations(data); setLoading(false); });
  }, []);

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();

  function pad(n: number) { return String(n).padStart(2, '0'); }
  function dayStr(d: number) { return `${year}-${pad(month + 1)}-${pad(d)}`; }

  function getEvents(day: number) {
    const ds = dayStr(day);
    return reservations.flatMap((r) => {
      const events = [];
      if (r.checkIn === ds) events.push({ ...r, type: 'in' });
      if (r.checkOut === ds && r.checkIn !== ds) events.push({ ...r, type: 'out' });
      return events;
    });
  }

  const monthLabel = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">Reservations by date.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Month header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDate(new Date(year, month - 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDate(new Date())}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setDate(new Date(year, month + 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="min-h-[90px] border-b border-r border-gray-50 bg-gray-50/40" />;
              }
              const events = getEvents(day);
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`min-h-[90px] border-b border-r border-gray-50 p-1.5 ${isToday ? 'bg-blue-50/60' : ''}`}
                >
                  <div className="flex justify-end mb-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-black text-white' : 'text-gray-500'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((ev, ei) => (
                      <div
                        key={`${ev.id}-${ev.type}-${ei}`}
                        className={`text-[10px] leading-tight rounded px-1 py-0.5 text-white truncate ${STATUS_COLOR[ev.status] ?? 'bg-gray-400'}`}
                        title={`${ev.type === 'in' ? '→' : '←'} ${ev.firstName} ${ev.lastName} — ${ev.vehicleTitle}`}
                      >
                        {ev.type === 'in' ? '→' : '←'} {ev.firstName} {ev.lastName[0]}.
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">+{events.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="px-6 py-3 border-t border-gray-100 flex flex-wrap items-center gap-5 text-xs text-gray-500">
          {[
            { color: 'bg-blue-500', label: 'Upcoming' },
            { color: 'bg-green-500', label: 'Completed' },
            { color: 'bg-red-400', label: 'Cancelled' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              {label}
            </div>
          ))}
          <span className="ml-auto text-gray-400">→ check-in &nbsp; ← check-out</span>
        </div>
      </div>
    </div>
  );
}
