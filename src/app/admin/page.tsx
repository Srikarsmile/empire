import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalReservations, upcomingCount, revenueAgg, recent] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'upcoming' } }),
    prisma.reservation.aggregate({ _sum: { total: true } }),
    prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalRevenue = revenueAgg._sum.total ?? 0;

  const stats = [
    { label: 'Total Reservations', value: totalReservations.toString() },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
    { label: 'Upcoming', value: upcomingCount.toString() },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Overview</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your fleet, view reservations, and update pricing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-gray-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reservations</h2>
          <Link href="/admin/reservations" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No reservations yet.
          </div>
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
