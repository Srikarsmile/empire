"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CardStack, CardStackItem } from "./ui/card-stack";

function getDimensions() {
  if (typeof window === "undefined") {
    return { width: 300, height: 400, overlap: 0.6, spreadDeg: 30 };
  }
  return {
    width: window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 380 : 440,
    height: window.innerWidth < 640 ? 380 : window.innerWidth < 1024 ? 460 : 520,
    overlap: window.innerWidth < 640 ? 0.5 : window.innerWidth < 1024 ? 0.72 : 0.8,
    spreadDeg: window.innerWidth < 640 ? 40 : 25,
  };
}

const serverSnapshot = { width: 300, height: 400, overlap: 0.6, spreadDeg: 30 };

function subscribeToDimensions(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

interface HeroCardStackProps {
  items: CardStackItem[];
}

export default function HeroCardStack({ items }: HeroCardStackProps) {
  const dimensions = useSyncExternalStore(
    subscribeToDimensions,
    getDimensions,
    useCallback(() => serverSnapshot, []),
  );

  const isClient = useSyncExternalStore(
    useCallback((cb: () => void) => { cb(); return () => {}; }, []),
    () => true,
    () => false,
  );

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <CardStack
      items={items}
      initialIndex={0}
      autoAdvance={true}
      intervalMs={3000}
      pauseOnHover={true}
      showDots={true}
      cardWidth={dimensions.width}
      cardHeight={dimensions.height}
      overlap={dimensions.overlap}
      spreadDeg={dimensions.spreadDeg}
      maxVisible={5}
    />
  );
}
