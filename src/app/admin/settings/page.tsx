export default function AdminSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your admin preferences and notification settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Phone Number</label>
              <input
                type="text"
                disabled
                value="+91 86 398 85 985"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 shadow-sm sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">This number is set by the system administrator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
