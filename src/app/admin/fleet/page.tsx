"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, PauseCircle, PlayCircle } from "lucide-react";

interface VehicleRecord {
  id: string;
  title: string;
  price: number;
  capacity: number;
  images: string[];
  transmission?: string;
  paused: boolean;
}

export default function FleetManagement() {
  const [cars, setCars] = useState<VehicleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/vehicles?all=1')
      .then((r) => r.json())
      .then(setCars)
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCars((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('Failed to delete vehicle.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePause = async (id: string, currentlyPaused: boolean) => {
    setTogglingId(id);
    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paused: !currentlyPaused }),
    });
    if (res.ok) {
      setCars((prev) => prev.map((c) => c.id === id ? { ...c, paused: !currentlyPaused } : c));
    }
    setTogglingId(null);
  };

  const filteredCars = cars.filter((car) =>
    car.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Fleet</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your rental vehicles.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-2 shadow-sm flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 placeholder:text-gray-400"
            />
          </div>
          <Link
            href="/admin/fleet/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div
            key={car.id}
            className={`group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${
              car.paused ? 'border-amber-200 opacity-70' : 'border-gray-200'
            }`}
          >
            {/* Image */}
            <div className="aspect-[4/3] bg-gray-100 relative">
              {car.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={car.images[0]} alt={car.title} className={`w-full h-full object-cover ${car.paused ? 'grayscale' : ''}`} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Image</div>
              )}

              {/* Status badge */}
              <div className="absolute top-3 left-3">
                {car.paused ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 shadow-sm">
                    <PauseCircle className="w-3 h-3" /> Paused
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm">
                    Available
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => handleTogglePause(car.id, car.paused)}
                  disabled={togglingId === car.id}
                  title={car.paused ? 'Resume listing' : 'Pause listing'}
                  className={`p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 ${
                    car.paused
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-amber-500 hover:bg-amber-50'
                  }`}
                >
                  {car.paused
                    ? <PlayCircle className="w-4 h-4" />
                    : <PauseCircle className="w-4 h-4" />
                  }
                </button>
                <Link
                  href={`/admin/fleet/${car.id}/edit`}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-sm hover:text-black hover:bg-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(car.id, car.title)}
                  disabled={deletingId === car.id}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg shadow-sm hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="pr-4">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{car.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{car.capacity} Seats • {car.transmission ?? "Auto"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-lg text-gray-900">${car.price}</span>
                  <span className="text-xs text-gray-500 block">/day</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCars.length === 0 && cars.length > 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            No vehicles found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
