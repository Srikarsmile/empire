"use client";

/**
 * @author: @emerald-ui
 * @description: Interactive Hover Button Component
 * @version: 1.0.0
 * @date: 2026-01-28
 * @license: MIT
 * @website: https://emerald-ui.com
 */
import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface InteractiveHoverButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  text?: string;
  loadingText?: string;
  successText?: string;
  classes?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export default function InteractiveHoverButton({
  text = "Button",
  loadingText = "Processing...",
  successText = "Complete!",
  classes,
  onClick,
  type = "button",
  ...props
}: InteractiveHoverButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const isIdle = status === "idle";

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== "idle") return;

    if (onClick) {
      setStatus("loading");
      try {
        await onClick(e);
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
        }, 3000); 
      } catch {
        setStatus("idle");
      }
    } else {
      // Demo mode
      setStatus("loading");
      setTimeout(() => {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }, 2000);
    }
  };

  return (
    <button
      type={type}
      className={cn(
        "group bg-[var(--ink-900)] relative flex min-w-40 items-center justify-center overflow-hidden rounded-full border border-[var(--ink-900)] p-2 px-6 font-semibold shadow-sm text-white transition-colors",
        status === "loading" && "px-2", // Circle shape when loading
        classes
      )}
      onClick={handleClick}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key="idle"
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div
            className={cn(
              "bg-[var(--accent)] h-2 w-2 rounded-full transition-all duration-500 group-hover:scale-[150]",
              !isIdle && "scale-[150]"
            )}
          />
          <span
            className={cn(
              "inline-block transition-all duration-500 group-hover:translate-x-20 group-hover:opacity-0",
              !isIdle && "translate-x-20 opacity-0"
            )}
          >
            {text}
          </span>
          <div
            className={cn(
              "text-white absolute top-0 left-0 z-10 flex h-full w-full -translate-x-16 items-center justify-center gap-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100",
              !isIdle && "translate-x-0 opacity-100"
            )}
          >
            {status === "idle" ? (
              <>
                <span>{text}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : status === "loading" ? (
              <>
                <div className="border-gray-500 border-t-white h-4 w-4 animate-spin rounded-full border-2" />
                <span className="text-white">{loadingText}</span>
              </>
            ) : (
              // success
              <>
                <Check className="h-4 w-4" />
                <span>{successText}</span>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
