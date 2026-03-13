"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InteractiveHoverButton from "@/components/ui/interactive-hover-button";
import { cn } from "@/lib/utils";

export default function HeroBookingWidget() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [useTwoColumns, setUseTwoColumns] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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
    <div
      ref={containerRef}
      className="bg-white border-2 border-neutral-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 w-full"
    >
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

      <div
        className={cn(
          "grid gap-3",
          useTwoColumns ? "grid-cols-2 gap-4" : "grid-cols-1",
        )}
      >
        <div className="min-w-0 flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">
            Pick-up Date
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={cn(
              "block h-14 w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-neutral-100 px-4 font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black",
              useTwoColumns ? "text-sm" : "text-[15px]",
            )}
          />
        </div>
        <div className="min-w-0 flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-widest uppercase text-neutral-500">
            Return Date
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={cn(
              "block h-14 w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-neutral-100 px-4 font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black",
              useTwoColumns ? "text-sm" : "text-[15px]",
            )}
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
