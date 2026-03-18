'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';

function TaxRateManager() {
  const [taxRate, setTaxRate] = useState<string>('14');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/tax-rate')
      .then((r) => r.json())
      .then((d) => { setTaxRate(String(d.taxRate ?? 14)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/tax-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taxRate: Number(taxRate) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Tax &amp; Service Fee</h2>
        <p className="text-sm text-gray-500 mb-5">Applied to every booking as a percentage of the rental subtotal.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : (
          <form onSubmit={handleSave} className="flex items-end gap-3 max-w-xs">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-gray-600">Rate (%)</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save'}
            </button>
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

      <TaxRateManager />

      <AirportManager />
    </div>
  );
}
