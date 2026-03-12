"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InteractiveHoverButton from "@/components/ui/interactive-hover-button";

export default function HeroBookingWidget() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);

    const query = params.toString();
    const target = query ? `/#fleet?${query}` : "/#fleet";

    // Use native scroll for same-page navigation
    router.push(target);

    // Scroll to fleet section
    setTimeout(() => {
      document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="bg-white border-2 border-neutral-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">
          Pick-up Location
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black" />
          <input
            type="text"
            placeholder="POP Airport, Sosua Villa..."
            className="w-full bg-neutral-100 rounded-xl h-14 pl-10 pr-4 font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">
            Pick-up Date
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-neutral-100 rounded-xl h-14 px-4 font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">
            Return Date
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-neutral-100 rounded-xl h-14 px-4 font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="mt-2 w-full">
        <InteractiveHoverButton
          text="Search Fleet"
          loadingText="Searching..."
          successText="Found vehicles!"
          classes="w-full h-14 rounded-xl text-lg font-bold shadow-md"
          onClick={handleSearch}
        />
      </div>
    </div>
  );
}
