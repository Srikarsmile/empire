"use client";

import { ChevronRight, Instagram, Twitter, Facebook } from "lucide-react";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to convert any CSS color to rgba
export const getRGBA = (
  cssColor: React.CSSProperties["color"],
  fallback: string = "rgba(180, 180, 180)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    // Handle CSS variables
    if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }

    return Color.formatRGBA(Color.parse(cssColor));
  } catch (e) {
    console.error("Color parsing failed:", e);
    return fallback;
  }
};

// Helper function to add opacity to an RGB color string
export const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith("rgb")) return color;
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.2,
  color = "#B4B4B4",
  width,
  height,
  className,
  maxOpacity = 0.15,
  text = "",
  fontSize = 140,
  fontWeight = 800,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    return getRGBA(color);
  }, [color]);

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!maskCtx) return;

      if (text) {
        maskCtx.save();
        maskCtx.scale(dpr, dpr);
        maskCtx.fillStyle = "white";
        maskCtx.font = `${fontWeight} ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
        maskCtx.textAlign = "center";
        maskCtx.textBaseline = "middle";
        maskCtx.fillText(text, width / (2 * dpr), height / (2 * dpr));
        maskCtx.restore();
      }

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * (squareSize + gridGap) * dpr;
          const y = j * (squareSize + gridGap) * dpr;
          const squareWidth = squareSize * dpr;
          const squareHeight = squareSize * dpr;

          const maskData = maskCtx.getImageData(
            x,
            y,
            squareWidth,
            squareHeight,
          ).data;
          const hasText = maskData.some(
            (value, index) => index % 4 === 0 && value > 0,
          );

          const opacity = squares[i * rows + j];
          const finalOpacity = hasText
            ? Math.min(1, opacity * 3 + 0.4)
            : opacity;

          ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity);
          ctx.fillRect(x, y, squareWidth, squareHeight);
        }
      }
    },
    [memoizedColor, squareSize, gridGap, text, fontSize, fontWeight],
  );

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.ceil(width / (squareSize + gridGap));
      const rows = Math.ceil(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div
      ref={containerRef}
      className={cn(`h-full w-full ${className}`)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function checkQuery() {
      const result = window.matchMedia(query);
      setValue(result.matches);
    }

    checkQuery();
    window.addEventListener("resize", checkQuery);
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", checkQuery);

    return () => {
      window.removeEventListener("resize", checkQuery);
      mediaQuery.removeEventListener("change", checkQuery);
    };
  }, [query]);

  return value;
}

export const siteConfig = {
  hero: {
    description:
      "Daily rentals, direct support, and vehicle handoff that matches your arrival time securely in Sosua, Cabarete, and Puerto Plata.",
  },
  footerLinks: [
    {
      title: "Support",
      links: [
        { id: 1, title: "Airport pickup", url: "#" },
        { id: 2, title: "Insurance support", url: "#" },
        { id: 3, title: "Roadside help", url: "#" },
      ],
    },
    {
      title: "Rental Info",
      links: [
        { id: 5, title: "Driver requirements", url: "#" },
        { id: 6, title: "Fuel policy", url: "#" },
        { id: 7, title: "Long-stay pricing", url: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { id: 9, title: "Privacy Policy", url: "#" },
        { id: 10, title: "Terms of Service", url: "#" },
        { id: 11, title: "Sitemap", url: "#" },
      ],
    },
  ],
};

export const FlickeringFooter = ({ currentYear }: { currentYear?: number }) => {
  const tablet = useMediaQuery("(max-width: 1024px)");
  const mobile = useMediaQuery("(max-width: 640px)");
  const year = currentYear ?? new Date().getFullYear();

  return (
    <footer id="footer" className="w-full relative bg-white pb-0 overflow-hidden pt-8 border-t border-neutral-100">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-start md:justify-between px-6 lg:px-8 pb-4 z-10 relative">
        <div className="flex flex-col items-start justify-start gap-y-5 max-w-sm mx-0">
          <Link href="/" className="flex items-center gap-3">
             <div className="flex h-16 w-auto p-2 bg-white rounded-xl border-2 border-neutral-200/20 shadow-sm items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Empire Cars Logo" className="h-full w-auto object-contain" />
             </div>
          </Link>
          <p className="text-neutral-500 font-medium leading-relaxed">
            {siteConfig.hero.description}
          </p>
          <div className="flex gap-4 mt-2">
             <a href="#" className="h-10 w-10 bg-neutral-100 text-black flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors">
               <Instagram className="w-5 h-5" />
             </a>
             <a href="#" className="h-10 w-10 bg-neutral-100 text-black flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors">
               <Twitter className="w-5 h-5" />
             </a>
             <a href="#" className="h-10 w-10 bg-neutral-100 text-black flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors">
               <Facebook className="w-5 h-5" />
             </a>
          </div>
        </div>
        <div className="pt-12 md:pt-4 md:w-1/2 lg:w-7/12">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {siteConfig.footerLinks.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-y-4">
                <li className="mb-1 text-sm font-bold tracking-widest uppercase text-black">
                  {column.title}
                </li>
                {column.links.map((link) => (
                  <li
                    key={link.id}
                    className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[15px]/snug text-neutral-500 font-medium hover:text-black transition-colors"
                  >
                    <Link href={link.url}>{link.title}</Link>
                    <div className="flex size-4 items-center justify-center translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright line */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-4 z-10 relative">
        <p className="text-sm text-neutral-400 font-medium">
          © {year} Empire Cars Sosua. All rights reserved.
        </p>
      </div>
      
      <div className="w-full h-48 md:h-64 lg:h-72 relative mt-4 z-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/80 to-white z-10 from-20% lg:from-30%" />
        <div className="absolute inset-0 mx-6">
          <FlickeringGrid
            text={mobile ? "Empire Cars" : tablet ? "Empire Cars" : "Empire Cars"}
            fontSize={mobile ? 80 : tablet ? 150 : 200}
            className="h-full w-full opacity-60"
            squareSize={3}
            gridGap={tablet ? 2 : 3}
            color="#000000"
            maxOpacity={0.10}
            flickerChance={0.08}
          />
        </div>
      </div>
    </footer>
  );
};
