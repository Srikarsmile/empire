"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InteractiveHoverButton from "@/components/ui/interactive-hover-button";
import { cn } from "@/lib/utils";

export default function HeroBookingWidget() {
  const [pickup, setPickup] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [useTwoColumns, setUseTwoColumns] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateLayout = (width: number) => {
      // Native date inputs need more room than standard text inputs on mobile.
      setUseTwoColumns(width >= 560);
    };

    updateLayout(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateLayout(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    if (checkOut && checkOut <= value) {
      setCheckOut("");
    }
  };

  const handleCheckOutChange = (value: string) => {
    if (checkIn && value <= checkIn) return;
    setCheckOut(value);
  };

  const handleSearch = () => {
    if (!pickup) {
      setLocationError(true);
      return;
    }
    setLocationError(false);

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
    <div
      ref={containerRef}
      className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 w-full"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold tracking-widest uppercase text-[var(--ink-500)]">
          Pick-up Location
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent)]" />
          <select
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              setLocationError(false);
            }}
            className={cn(
              "w-full bg-[var(--surface-soft)] rounded-xl h-14 pl-10 pr-4 font-semibold text-[var(--ink-900)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] appearance-none",
              locationError && "ring-2 ring-[var(--danger)]",
            )}
          >
            <option value="" disabled>Select a location</option>
            <option value="PUJ">Punta Cana International Airport (PUJ)</option>
            <option value="SDQ">Las Américas International Airport (SDQ)</option>
            <option value="STI">Cibao International Airport (STI)</option>
            <option value="POP">Gregorio Luperón International Airport (POP)</option>
            <option value="LRM">La Romana (LRM)</option>
            <option value="AZS">Samaná El Catey International Airport (AZS)</option>
          </select>
        </div>
        {locationError && (
          <p className="error-text">Please select a location</p>
        )}
      </div>

      <div
        className={cn(
          "grid gap-3",
          useTwoColumns ? "grid-cols-2 gap-4" : "grid-cols-1",
        )}
      >
        <div className="min-w-0 flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-widest uppercase text-[var(--ink-500)]">
            Pick-up Date
          </label>
          <div className="hero-booking-date-wrap min-w-0 w-full overflow-hidden rounded-xl bg-[var(--surface-soft)]">
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className={cn(
                "hero-booking-date-input block h-14 w-full min-w-0 max-w-full border-0 bg-transparent px-4 font-semibold text-[var(--ink-900)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                useTwoColumns ? "text-sm" : "text-[15px]",
              )}
            />
          </div>
        </div>
        <div className="min-w-0 flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-widest uppercase text-[var(--ink-500)]">
            Return Date
          </label>
          <div className="hero-booking-date-wrap min-w-0 w-full overflow-hidden rounded-xl bg-[var(--surface-soft)]">
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className={cn(
                "hero-booking-date-input block h-14 w-full min-w-0 max-w-full border-0 bg-transparent px-4 font-semibold text-[var(--ink-900)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                useTwoColumns ? "text-sm" : "text-[15px]",
              )}
            />
          </div>
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
