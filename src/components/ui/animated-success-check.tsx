"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedSuccessCheckProps {
  /** Diameter of the checkmark in pixels (default: 72) */
  size?: number;
  /** Custom extra classes for outer container */
  className?: string;
  /** Color class for the stroke (default: emerald) */
  color?: string;
}

/**
 * AnimatedSuccessCheck
 *
 * Premium SVG success indicator that draws a circular outer ring clockwise
 * followed by a crisp animated checkmark path in the center with a gentle
 * ambient glow pulse.
 */
export function AnimatedSuccessCheck({
  size = 72,
  className,
  color = "text-emerald-500 dark:text-emerald-400",
}: AnimatedSuccessCheckProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 select-none",
        className
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Success"
    >
      {/* 1. Ambient Glow Pulse */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.25, 1.05], opacity: [0, 0.45, 0.2] }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl pointer-events-none"
      />

      {/* 2. Soft Tinted Circular Backing */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 shadow-inner"
      />

      {/* 3. SVG with Animated Ring & Checkmark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("relative z-10", color)}
      >
        {/* Animated Circular Ring (drawn clockwise from 12 o'clock) */}
        <motion.circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
          }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.15 },
          }}
        />

        {/* Animated Checkmark Path (draws fluidly right after the circle sweep) */}
        <motion.path
          d="M20 33 L28 41 L44 23"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              duration: 0.38,
              delay: 0.38,
              ease: [0.16, 1, 0.3, 1],
            },
            opacity: {
              duration: 0.1,
              delay: 0.38,
            },
          }}
        />
      </svg>
    </div>
  );
}
