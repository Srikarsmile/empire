'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';

type FeesConfig = {
  taxRate: number;
  taxEnabled: boolean;
  airportEnabled: boolean;
  insuranceEnabled: boolean;
  insuranceFee: number;
};

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-black' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function FeesManager() {
  const [config, setConfig] = useState<FeesConfig>({
    taxRate: 14, taxEnabled: true, airportEnabled: true, insuranceEnabled: false, insuranceFee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/fees-config')
      .then((r) => r.json())
      .then((d) => { setConfig(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/fees-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = 'rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none w-28';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Price Breakdown</h2>
        <p className="text-sm text-gray-500 mb-5">Toggle each fee on/off and set its value. Changes apply to all new bookings.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Tax row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Toggle enabled={config.taxEnabled} onChange={(v) => setConfig((p) => ({ ...p, taxEnabled: v }))} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Taxes &amp; Service Fee</p>
                  <p className="text-xs text-gray-400">Percentage of rental subtotal</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={config.taxRate}
                  disabled={!config.taxEnabled}
                  onChange={(e) => setConfig((p) => ({ ...p, taxRate: Number(e.target.value) }))}
                  className={`${inputCls} pr-8 disabled:opacity-40`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>

            {/* Airport row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Toggle enabled={config.airportEnabled} onChange={(v) => setConfig((p) => ({ ...p, airportEnabled: v }))} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Airport Drop-off</p>
                  <p className="text-xs text-gray-400">Show drop-off option during booking</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 italic">Fees set per airport in section below</span>
            </div>

            {/* Insurance row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Toggle enabled={config.insuranceEnabled} onChange={(v) => setConfig((p) => ({ ...p, insuranceEnabled: v }))} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Insurance</p>
                  <p className="text-xs text-gray-400">Fixed fee added to every booking</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number" min="0" step="1"
                  value={config.insuranceFee}
                  disabled={!config.insuranceEnabled}
                  onChange={(e) => setConfig((p) => ({ ...p, insuranceFee: Number(e.target.value) }))}
                  className={`${inputCls} pl-7 disabled:opacity-40`}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

type Airport = {
  id: string;
  name: string;
  city: string;
  fee: number;
};

function AirportManager() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', fee: '' });

  useEffect(() => {
    fetch('/api/admin/airports')
      .then((r) => r.json())
      .then((data) => { setAirports(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.fee) return;
    setSaving(true);
    const res = await fetch('/api/admin/airports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name.trim(), city: form.city.trim(), fee: Number(form.fee) }),
    });
    if (res.ok) {
      const airport = await res.json();
      setAirports((prev) => [...prev, airport]);
      setForm({ name: '', city: '', fee: '' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this airport?')) return;
    await fetch('/api/admin/airports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setAirports((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Airport Drop-off Locations</h2>
        <p className="text-sm text-gray-500 mb-5">These appear as drop-off options during booking. Customers pay the extra fee on top of the rental.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : (
          <>
            {airports.length > 0 && (
              <div className="mb-5 space-y-2">
                {airports.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.city} — <strong>${a.fee}</strong> drop-off fee</p>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px_auto] gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Airport name</label>
                <input
                  required
                  type="text"
                  placeholder="Puerto Plata Airport"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">City</label>
                <input
                  required
                  type="text"
                  placeholder="Puerto Plata"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Fee ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="30"
                  value={form.fee}
                  onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [adminEmail, setAdminEmail] = useState('');
  const [env, setEnv] = useState('');
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings-info')
      .then((r) => r.json())
      .then((d) => { setAdminEmail(d.adminEmail); setEnv(d.env); setAppUrl(d.appUrl); })
      .catch(() => {});
  }, []);

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
              <input type="text" disabled value={adminEmail} className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 shadow-sm sm:text-sm" />
              <p className="mt-1 text-xs text-gray-400">Set via ADMIN_EMAIL environment variable.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <input type="text" disabled value={env} className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 shadow-sm sm:text-sm capitalize" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">App URL</label>
              <input type="text" disabled value={appUrl} className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 shadow-sm sm:text-sm" />
            </div>
          </div>
        </div>
      </div>

      <FeesManager />

      <AirportManager />
    </div>
  );
}
