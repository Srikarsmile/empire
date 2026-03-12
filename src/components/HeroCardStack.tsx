"use client";

import { useState, useEffect } from "react";
import { CardStack, CardStackItem } from "./ui/card-stack";

interface HeroCardStackProps {
  items: CardStackItem[];
}

export default function HeroCardStack({ items }: HeroCardStackProps) {
  const [dimensions, setDimensions] = useState({ width: 300, height: 400, overlap: 0.6, spreadDeg: 30 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- subscribing to window resize is a valid effect pattern
    setMounted(true);
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 380 : 440,
        height: window.innerWidth < 640 ? 380 : window.innerWidth < 1024 ? 460 : 520,
        overlap: window.innerWidth < 640 ? 0.5 : window.innerWidth < 1024 ? 0.72 : 0.8,
        spreadDeg: window.innerWidth < 640 ? 40 : 25,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

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
