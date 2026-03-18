"use client";

import { useEffect, useState } from "react";
import { Database, Server, BookOpen, Globe } from "lucide-react";

interface StatusData {
  db: { connected: boolean; latencyMs: number | null };
  reservations: { total: number | null };
  uptime: number;
  env: string;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-32 bg-gray-100 rounded" />
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/status");
      if (!res.ok) throw new Error();
      const json: StatusData = await res.json();
      setData(json);
      setLastChecked(new Date());
      setError(false);
    } catch {
      setError(true);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  const cards = data
    ? [
        {
          label: "Database",
          icon: Database,
          status: data.db.connected,
          value: data.db.connected ? "Connected" : "Error",
          sub: data.db.latencyMs !== null ? `${data.db.latencyMs} ms latency` : "Unavailable",
        },
        {
          label: "Server",
          icon: Server,
          status: true,
          value: formatUptime(data.uptime),
          sub: "Uptime",
        },
        {
          label: "Reservations",
          icon: BookOpen,
          status: data.reservations.total !== null,
          value: data.reservations.total !== null ? String(data.reservations.total) : "—",
          sub: "Total in database",
        },
        {
          label: "Environment",
          icon: Globe,
          status: true,
          value: data.env ?? "unknown",
          sub: "NODE_ENV",
        },
      ]
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Status</h1>
        <p className="mt-1 text-sm text-gray-500">Live health check — auto-refreshes every 30s.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards
          ? cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <Icon className="h-4 w-4" />
                      {card.label}
                    </div>
                    <StatusDot ok={card.status} />
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">{card.value}</p>
                  <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
                </div>
              );
            })
          : Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {error && !data && (
        <p className="text-sm text-red-500">Failed to reach the status endpoint.</p>
      )}

      {lastChecked && (
        <p className="text-xs text-gray-400">
          Last checked: {lastChecked.toLocaleTimeString()} — auto-refreshes every 30 s
        </p>
      )}
    </div>
  );
}
