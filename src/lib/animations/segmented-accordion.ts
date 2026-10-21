// src/lib/animations/segmented-accordion.ts
"use client";

import { cn } from "@/lib/utils";

/**
 * Global Motion Variants for Segmented Accordion Collapsible Content.
 *
 * Requirements:
 * - On open: Expands smoothly with height and opacity.
 * - On close: Opacity drops to 0 rapidly (duration: 0.1s, items hide first),
 *   while height collapses cleanly (duration: 0.22s).
 *   This ensures inner items are already invisible before the header finishes morphing its fillet.
 */
export const segmentedAccordionMotion = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.16, ease: "easeOut" as const },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      opacity: { duration: 0.09, ease: "easeIn" as const }, // Inner items vanish in ~90ms
      height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const, delay: 0.02 },
    },
  },
};

/**
 * Helper to generate class names for accordion header buttons.
 *
 * When open: flattens bottom radius to 6px immediately (delay: 0, duration: 120ms).
 * When closed: delays bottom radius morphing to 32px (delay: 100ms, duration: 220ms)
 * so that inner items have faded out before the bottom corners round out.
 */
export function getSegmentedAccordionHeaderClass(
  isOpen: boolean,
  options?: {
    isTopRounded?: boolean;
    fullCapsuleWhenClosed?: boolean;
    extraClass?: string;
  }
) {
  const isTopRounded = options?.isTopRounded ?? true;
  const fullCapsule = options?.fullCapsuleWhenClosed ?? false;
  const extra = options?.extraClass || "";

  if (isOpen) {
    return cn(
      "segmented-accordion-trigger is-open",
      isTopRounded ? "rounded-t-[32px] rounded-b-[6px]" : "rounded-b-[6px]",
      "transition-[border-radius] duration-120 delay-0 ease-out",
      extra
    );
  }

  return cn(
    "segmented-accordion-trigger is-closed",
    fullCapsule || isTopRounded ? "!rounded-[32px]" : "!rounded-b-[32px]",
    "transition-[border-radius] duration-220 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)]",
    extra
  );
}
