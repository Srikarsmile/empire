export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Overview</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your fleet, view reservations, and update pricing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        {[
          { label: "Total Vehicles", value: "24", trend: "+2 this month" },
          { label: "Active Rentals", value: "11", trend: "45% utilization" },
          { label: "Pending Issues", value: "0", trend: "All clear" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-gray-900">{stat.value}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-green-600">{stat.trend}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          No recent activity to show. Once bookings start coming in or cars are updated, they will appear here.
        </p>
      </div>
    </div>
  );
}
