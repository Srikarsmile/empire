"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

interface VehicleRecord {
  id: string;
  title: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  location: string;
  transmission?: string;
}

export default function FleetManagement() {
  const [cars, setCars] = useState<VehicleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/vehicles')
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

  const filteredCars = cars.filter((car) =>
    car.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Fleet Management</h1>
          <p className="mt-2 text-sm text-gray-500">Add, update, or remove vehicles from your rental inventory.</p>
        </div>

        <Link
          href="/admin/fleet/new"
          className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm w-full sm:w-auto mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          Add New Vehicle
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-2 shadow-sm w-full sm:max-w-md">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 placeholder:text-gray-400"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {filteredCars.map((car) => (
          <div key={car.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            {/* Image Container */}
            <div className="aspect-[4/3] bg-gray-100 relative">
              {car.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                  No Image Available
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm backdrop-blur-md">
                  Available
                </span>
              </div>

              {/* Action Menu (Visible on hover) */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
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
              <div className="flex justify-between items-start mb-4">
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
