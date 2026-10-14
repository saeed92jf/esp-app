"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AnimatedHamburgerProps {
  /** Whether the menu is currently open */
  isOpen: boolean;
  /** Optional class name for the outer container */
  className?: string;
  /** Custom line/color class (default: "text-current") */
  lineClassName?: string;
}

/** Snappy, organic fluid spring physics */
const fluidSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 25,
  mass: 0.85,
};

const membraneSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 26,
};

const nucleolusTransition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1] as const,
};

/**
 * Organic Cell Nucleus -> Metaballs morphing menu trigger icon.
 * - Closed: Single biological cell nucleus with glowing nucleolus & delicate membrane.
 * - Open: Fluid mitosis into 4 corner satellite metaballs tethered by viscous liquid bridges forming an organic "X".
 * - Close: Instant spring pull that collapses the metaballs back into a single cell with surface tension bounce.
 */
export function AnimatedHamburger({
  isOpen,
  className,
  lineClassName,
}: AnimatedHamburgerProps) {
  const rawId = React.useId();
  // Sanitize React ID for standard SVG URL referencing
  const filterId = React.useMemo(
    () => `cell-goo-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawId]
  );

  return (
    <div
      className={cn(
        "relative size-[20px] sm:size-[22px] flex items-center justify-center select-none pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        className={cn("w-full h-full overflow-visible", lineClassName)}
      >
        <defs>
          {/* High-fidelity Metaball / Gooey Threshold Filter */}
          <filter
            id={filterId}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 19 -8"
              result="goo"
            />
          </filter>
        </defs>

        {/* 1. Outer Cell Membrane (delicate organic orbital envelope) */}
        <motion.circle
          cx={16}
          cy={16}
          r={11.5}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="2.5 3"
          initial={false}
          animate={{
            r: isOpen ? 14 : 11.5,
            opacity: isOpen ? 0 : 0.35,
          }}
          transition={membraneSpring}
        />

        {/* 2. Fluid Metaball System (Morphs between 1 Cell Nucleus and 4 Satellite Metaballs) */}
        <motion.g
          filter={`url(#${filterId})`}
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={fluidSpring}
          style={{ transformBox: "view-box", transformOrigin: "16px 16px" }}
        >
          {/* Central Mother Droplet (Main Nucleus Body) */}
          <motion.circle
            cx={16}
            cy={16}
            r={6.2}
            fill="currentColor"
            initial={false}
            animate={{
              r: isOpen ? 3.8 : 6.2,
            }}
            transition={fluidSpring}
          />

          {/* Satellite Droplet 1: Top-Left */}
          <motion.circle
            cx={16}
            cy={16}
            r={4.2}
            fill="currentColor"
            initial={false}
            animate={{
              cx: isOpen ? 8.8 : 16,
              cy: isOpen ? 8.8 : 16,
              r: isOpen ? 3.6 : 4.2,
            }}
            transition={fluidSpring}
          />

          {/* Satellite Droplet 2: Top-Right */}
          <motion.circle
            cx={16}
            cy={16}
            r={4.2}
            fill="currentColor"
            initial={false}
            animate={{
              cx: isOpen ? 23.2 : 16,
              cy: isOpen ? 8.8 : 16,
              r: isOpen ? 3.6 : 4.2,
            }}
            transition={fluidSpring}
          />

          {/* Satellite Droplet 3: Bottom-Right */}
          <motion.circle
            cx={16}
            cy={16}
            r={4.2}
            fill="currentColor"
            initial={false}
            animate={{
              cx: isOpen ? 23.2 : 16,
              cy: isOpen ? 23.2 : 16,
              r: isOpen ? 3.6 : 4.2,
            }}
            transition={fluidSpring}
          />

          {/* Satellite Droplet 4: Bottom-Left */}
          <motion.circle
            cx={16}
            cy={16}
            r={4.2}
            fill="currentColor"
            initial={false}
            animate={{
              cx: isOpen ? 8.8 : 16,
              cy: isOpen ? 23.2 : 16,
              r: isOpen ? 3.6 : 4.2,
            }}
            transition={fluidSpring}
          />
        </motion.g>

        {/* 3. Glowing Nucleolus Dot (هستک داخل هسته) - Visible only in closed single-cell state */}
        <motion.circle
          cx={16}
          cy={16}
          r={2.2}
          fill="var(--color-primary-500, #3b82f6)"
          initial={false}
          animate={{
            r: isOpen ? 0 : 2.2,
            opacity: isOpen ? 0 : 0.95,
          }}
          transition={nucleolusTransition}
        />
      </svg>
    </div>
  );
}

// Alias export for explicit naming
export { AnimatedHamburger as CellNucleusMenuIcon };

