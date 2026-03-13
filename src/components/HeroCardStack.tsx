"use client";

import { useState, useEffect } from "react";
import { CardStack, CardStackItem } from "./ui/card-stack";

interface HeroCardStackProps {
  items: CardStackItem[];
}

function getDimensions(viewportWidth?: number) {
  const width = viewportWidth ?? 1280;

  if (width < 640) {
    return {
      width: 244,
      height: 320,
      overlap: 0.78,
      spreadDeg: 10,
      maxVisible: 3,
      depthPx: 36,
      tiltXDeg: 0,
      activeLiftPx: 10,
    };
  }

  if (width < 1024) {
    return {
      width: 360,
      height: 440,
      overlap: 0.72,
      spreadDeg: 14,
      maxVisible: 5,
      depthPx: 56,
      tiltXDeg: 4,
      activeLiftPx: 16,
    };
  }

  return {
    width: 440,
    height: 520,
    overlap: 0.76,
    spreadDeg: 14,
    maxVisible: 5,
    depthPx: 72,
    tiltXDeg: 6,
    activeLiftPx: 18,
  };
}

export default function HeroCardStack({ items }: HeroCardStackProps) {
  const [dimensions, setDimensions] = useState(() => getDimensions());

  useEffect(() => {
    let frameId = 0;

    const updateDimensions = () => {
      const nextDimensions = getDimensions(window.innerWidth);

      setDimensions((current) => {
        if (
          current.width === nextDimensions.width &&
          current.height === nextDimensions.height &&
          current.overlap === nextDimensions.overlap &&
          current.spreadDeg === nextDimensions.spreadDeg &&
          current.maxVisible === nextDimensions.maxVisible &&
          current.depthPx === nextDimensions.depthPx &&
          current.tiltXDeg === nextDimensions.tiltXDeg &&
          current.activeLiftPx === nextDimensions.activeLiftPx
        ) {
          return current;
        }

        return nextDimensions;
      });
    };

    const onResize = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateDimensions);
    };

    updateDimensions();
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <CardStack
      items={items}
      initialIndex={0}
      autoAdvance={true}
      intervalMs={4200}
      pauseOnHover={true}
      showDots={true}
      cardWidth={dimensions.width}
      cardHeight={dimensions.height}
      overlap={dimensions.overlap}
      spreadDeg={dimensions.spreadDeg}
      depthPx={dimensions.depthPx}
      tiltXDeg={dimensions.tiltXDeg}
      activeLiftPx={dimensions.activeLiftPx}
      springStiffness={180}
      springDamping={24}
      maxVisible={dimensions.maxVisible}
    />
  );
}
