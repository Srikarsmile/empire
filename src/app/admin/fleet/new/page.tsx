"use client";

import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AddVehicle() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      // In a real app we would route back or show success
      alert("Vehicle added successfully! (Mock)");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/fleet" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Vehicle</h1>
          <p className="text-sm text-gray-500">Enter the details and upload images for the new car.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Make</label>
              <input required type="text" placeholder="e.g. Toyota" className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Model</label>
              <input required type="text" placeholder="e.g. RAV4" className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Daily Price ($)</label>
              <input required type="number" placeholder="85" className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Capacity (Seats)</label>
              <input required type="number" placeholder="5" className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea required rows={4} placeholder="Describe the vehicle and its best features..." className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none"></textarea>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-gray-700">Vehicle Images</label>
             <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
               <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                 <UploadCloud className="w-6 h-6 text-gray-500" />
               </div>
               <p className="text-sm font-medium text-gray-900">Click to upload images</p>
               <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
             </div>
          </div>

        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/fleet" className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-black transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
