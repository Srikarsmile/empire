"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ImageManager from "@/components/admin/ImageManager";

type Airport = { id: string; name: string; city: string; fee: number };

interface VehicleRecord {
  id: string;
  title: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  location: string;
}

export default function EditVehicle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);

  const [form, setForm] = useState({
    title: "",
    price: "",
    capacity: "",
    description: "",
    location: "",
    amenities: "",
  });

  useEffect(() => {
    fetch('/api/admin/airports')
      .then((r) => r.json())
      .then((data) => setAirports(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then((r) => r.json())
      .then((v: VehicleRecord) => {
        setForm({
          title: v.title ?? "",
          price: String(v.price ?? ""),
          capacity: String(v.capacity ?? ""),
          description: v.description ?? "",
          location: v.location ?? "",
          amenities: (v.amenities ?? []).join(', '),
        });
        setImages(v.images ?? []);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load vehicle.');
        setIsLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        price: Number(form.price),
        capacity: Number(form.capacity),
        description: form.description,
        location: form.location,
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        images,
      }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setError('Failed to save changes. Please try again.');
      return;
    }

    router.push('/admin/fleet');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/fleet" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Vehicle</h1>
          <p className="text-sm text-gray-500">Update the details for this vehicle.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input required name="title" type="text" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Daily Price ($)</label>
              <input required name="price" type="number" value={form.price} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Capacity (Seats)</label>
              <input required name="capacity" type="number" value={form.capacity} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location</label>
            {airports.length > 0 ? (
              <select
                name="location"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all bg-white"
              >
                <option value="">Select location...</option>
                {airports.map((a) => (
                  <option key={a.id} value={`${a.name}, ${a.city}`}>
                    {a.name}, {a.city}
                  </option>
                ))}
              </select>
            ) : (
              <input name="location" type="text" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea required name="description" rows={4} value={form.description} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amenities</label>
            <input name="amenities" type="text" value={form.amenities} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            <p className="text-xs text-gray-400">Comma-separated list</p>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <ImageManager images={images} onChange={setImages} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/admin/fleet" className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-black transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
