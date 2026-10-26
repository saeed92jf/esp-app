// src/components/ui/animated-hamburger.tsx
"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export interface AnimatedHamburgerProps {
  /** Whether the menu is currently open */
  isOpen: boolean;
  /** Optional class name for the outer container */
  className?: string;
  /** Custom line/color class (default: "text-current") */
  lineClassName?: string;
}

/** Snappy spring physics for smooth morphing of dots */
const dotSpring = {
  type: "spring" as const,
  stiffness: 460,
  damping: 28,
  mass: 0.7,
};

/** Staggered line spring transitions */
const createLineTransition = (delayOpen: number, delayClose: number, isOpen: boolean) => ({
  type: "spring" as const,
  stiffness: 420,
  damping: 26,
  mass: 0.65,
  delay: isOpen ? delayOpen : delayClose,
});

/**
 * Animated Side Menu Trigger Icon:
 * - Closed: Three vertical dots ("سه تا نقطه عمودی") centered and balanced.
 * - Open: The 3 dots slide to the side, and 3 horizontal lines smoothly shoot out in front of them
 *   with an energetic cascading spring animation ("با باز شدن سه تا خط جلوش با انیمیت خفن ظاهر بشه").
 */
export function AnimatedHamburger({
  isOpen,
  className,
  lineClassName,
}: AnimatedHamburgerProps) {
  let isRtl = true;
  try {
    const locale = useLocale();
    isRtl = locale === "fa";
  } catch {
    if (typeof document !== "undefined") {
      isRtl = document.documentElement.dir === "rtl";
    }
  }

  // Row vertical positions in 24x24 SVG
  const yTop = 5.5;
  const yMid = 12;
  const yBot = 18.5;

  // Horizontal positions based on RTL/LTR reading direction:
  // In RTL, drawer is on the right, so dots anchor at x=18.5 and lines extend to the left (x=4.5).
  // In LTR, drawer is on the left, so dots anchor at x=5.5 and lines extend to the right (x=19.5).
  const dotClosedX = 12;
  const dotOpenX = isRtl ? 18.5 : 5.5;
  const lineStartX = isRtl ? 14.5 : 9.5;
  const lineEndX = isRtl ? 4.5 : 19.5;

  return (
    <div
      className={cn(
        "relative size-[20px] sm:size-[22px] flex items-center justify-center select-none pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("w-full h-full overflow-visible", lineClassName)}
        fill="none"
        shapeRendering="geometricPrecision"
      >
        {/* ── Row 1: Top Dot & Line ── */}
        <motion.circle
          initial={false}
          animate={{
            cx: isOpen ? dotOpenX : dotClosedX,
            cy: yTop,
            r: isOpen ? 1.85 : 2.15,
            opacity: 1,
          }}
          transition={dotSpring}
          fill="currentColor"
        />
        <motion.line
          initial={false}
          animate={{
            x1: isOpen ? lineStartX : dotClosedX,
            x2: isOpen ? lineEndX : dotClosedX,
            y1: yTop,
            y2: yTop,
            opacity: isOpen ? 1 : 0,
          }}
          transition={createLineTransition(0.04, 0.08, isOpen)}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* ── Row 2: Middle Dot & Line ── */}
        <motion.circle
          initial={false}
          animate={{
            cx: isOpen ? dotOpenX : dotClosedX,
            cy: yMid,
            r: isOpen ? 1.85 : 2.15,
            opacity: 1,
          }}
          transition={dotSpring}
          fill="currentColor"
        />
        <motion.line
          initial={false}
          animate={{
            x1: isOpen ? lineStartX : dotClosedX,
            x2: isOpen ? lineEndX : dotClosedX,
            y1: yMid,
            y2: yMid,
            opacity: isOpen ? 1 : 0,
          }}
          transition={createLineTransition(0.09, 0.04, isOpen)}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* ── Row 3: Bottom Dot & Line ── */}
        <motion.circle
          initial={false}
          animate={{
            cx: isOpen ? dotOpenX : dotClosedX,
            cy: yBot,
            r: isOpen ? 1.85 : 2.15,
            opacity: 1,
          }}
          transition={dotSpring}
          fill="currentColor"
        />
        <motion.line
          initial={false}
          animate={{
            x1: isOpen ? lineStartX : dotClosedX,
            x2: isOpen ? lineEndX : dotClosedX,
            y1: yBot,
            y2: yBot,
            opacity: isOpen ? 1 : 0,
          }}
          transition={createLineTransition(0.14, 0.0, isOpen)}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Keep export alias
export { AnimatedHamburger as CellNucleusMenuIcon };
