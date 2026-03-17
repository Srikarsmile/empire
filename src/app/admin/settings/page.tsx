export const dynamic = 'force-dynamic';

export default function AdminSettings() {
  const adminEmail = process.env.ADMIN_EMAIL ?? '(not set)';
  const env = process.env.NODE_ENV ?? 'unknown';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-500">System configuration and environment info.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Email</label>
              <input
                type="text"
                disabled
                value={adminEmail}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 shadow-sm sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">Set via ADMIN_EMAIL environment variable.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <input
                type="text"
                disabled
                value={env}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 shadow-sm sm:text-sm capitalize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">App URL</label>
              <input
                type="text"
                disabled
                value={appUrl}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
