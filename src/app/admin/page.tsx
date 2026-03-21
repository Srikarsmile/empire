import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalReservations, upcomingCount, revenueAgg, recent, pendingCount, vehicles] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'upcoming' } }),
    prisma.reservation.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
    prisma.reservation.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.reservation.count({ where: { status: 'payment_pending' } }),
    prisma.vehicle.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, title: true, paused: true, bookedRanges: true } }),
  ]);

  // Monthly revenue — last 6 months (using server-side filtering per month)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyReservations = await prisma.reservation.findMany({
    where: { status: { not: 'cancelled' }, createdAt: { gte: sixMonthsAgo } },
    select: { total: true, createdAt: true },
  });

  // Top vehicles — aggregate from non-cancelled reservations
  const topVehicleData = await prisma.reservation.findMany({
    where: { status: { not: 'cancelled' } },
    select: { vehicleTitle: true, total: true },
  });

  const totalRevenue = revenueAgg._sum.total ?? 0;

  // Monthly revenue — last 6 months (using pre-filtered DB query)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    const monthRes = monthlyReservations.filter((r) => {
      const t = new Date(r.createdAt);
      return t >= monthStart && t <= monthEnd;
    });
    return { label, revenue: monthRes.reduce((s, r) => s + r.total, 0), count: monthRes.length };
  });

  // Top vehicles by revenue
  const vehicleMap: Record<string, { revenue: number; count: number }> = {};
  for (const r of topVehicleData) {
    if (!vehicleMap[r.vehicleTitle]) vehicleMap[r.vehicleTitle] = { revenue: 0, count: 0 };
    vehicleMap[r.vehicleTitle].revenue += r.total;
    vehicleMap[r.vehicleTitle].count += 1;
  }
  const topVehicles = Object.entries(vehicleMap)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([title, data]) => ({ title, ...data }));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    return { key, label };
  });

  const stats = [
    { label: 'Total Bookings', value: totalReservations.toString(), sub: 'All time' },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, sub: 'Excluding cancelled' },
    { label: 'Upcoming', value: upcomingCount.toString(), sub: 'Active reservations' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-400 mb-1">{today}</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Your fleet at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-gray-900">{stat.value}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="bg-white rounded-2xl border-2 border-orange-300 p-4 flex items-center gap-4 shadow-sm">
          <span className="text-orange-500 text-xl">⚠</span>
          <p className="text-sm font-medium text-gray-700 flex-1">
            <strong>{pendingCount}</strong> {pendingCount === 1 ? 'reservation' : 'reservations'} awaiting payment
          </p>
          <a href="/admin/reservations?status=payment_pending" className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
            View →
          </a>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Fleet Availability — This Week</h2>
          <p className="text-xs text-gray-400 mt-0.5">Green = available · Red = booked · Gray = paused</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[10rem]">Vehicle</th>
                {weekDays.map((d) => (
                  <th key={d.key} className="text-center px-2 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[3.5rem]">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.map((v) => {
                const bookedSet = new Set<string>();
                const ranges = (v.bookedRanges as unknown as Array<{start: string; end: string}>) ?? [];
                ranges.forEach((r) => {
                  let cur = new Date(r.start + 'T00:00:00');
                  const end = new Date(r.end + 'T00:00:00');
                  while (cur < end) {
                    const k = cur.toISOString().split('T')[0];
                    bookedSet.add(k);
                    cur = new Date(cur.getTime() + 86400000);
                  }
                });
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[12rem]">
                      {v.paused ? <span className="text-gray-400">{v.title}</span> : v.title}
                    </td>
                    {weekDays.map((d) => {
                      const dot = v.paused
                        ? 'bg-gray-300'
                        : bookedSet.has(d.key)
                        ? 'bg-red-400'
                        : 'bg-green-400';
                      return (
                        <td key={d.key} className="px-2 py-3 text-center">
                          <span className={`inline-block w-3 h-3 rounded-full ${dot}`} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months, excluding cancelled</p>
          </div>
          <div className="p-6 space-y-3">
            {months.map((m) => {
              const maxRevenue = Math.max(...months.map((x) => x.revenue), 1);
              const pct = (m.revenue / maxRevenue) * 100;
              return (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 w-12 shrink-0">{m.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-black rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right shrink-0">
                    ${m.revenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400 w-12 text-right shrink-0">{m.count} bk</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Vehicles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Top Vehicles</h2>
            <p className="text-xs text-gray-400 mt-0.5">By total revenue generated</p>
          </div>
          {topVehicles.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No data yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topVehicles.map((v, i) => (
                <div key={v.title} className="px-6 py-3 flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{v.title}</span>
                  <span className="text-xs text-gray-400">{v.count} bookings</span>
                  <span className="text-sm font-bold text-gray-900">${v.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reservations</h2>
          <Link href="/admin/reservations" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No reservations yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Guest</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-in</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.firstName} {r.lastName}</td>
                    <td className="px-6 py-4 text-gray-600">{r.vehicleTitle}</td>
                    <td className="px-6 py-4 text-gray-600">{r.checkIn}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${r.total}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
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
