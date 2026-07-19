// src/components/aparat/sliding-tabs.tsx
'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

/**
 * A single tab definition.
 * - `value`  : the unique Radix value used to switch panels.
 * - `label`  : the visible text. Fully caller-controlled, so the
 *              parent decides every label (e.g. translated strings).
 * - `icon`   : optional leading icon node.
 */
export interface SlidingTabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SlidingTabsProps {
  /** Tab definitions (value/label/icon), fully controlled by the caller. */
  items: SlidingTabItem[];
  /** Read-only active value, used solely to align the sliding pill. */
  value: string;
  /** Extra classes for the root element. */
  className?: string;
}
/**
 * SlidingTabs
 * ----------------------------------------------------------------------------
 * A self-contained, theme-aware tab rail with an animated background pill that
 * slides horizontally to sit under the active tab.
 *
 * Design notes:
 * - Built on Radix `Tabs.List` / `Tabs.Trigger` so keyboard + a11y come free.
 * - The sliding "pill" is a single absolutely-positioned element. We animate
 *   ONLY `transform` (translateX) and `width`, which are GPU-friendly and avoid
 *   layout thrashing, so the motion stays smooth.
 * - Triggers are laid out with an equal-width CSS grid (`auto-cols-fr`), making
 *   the rail fully responsive: every tab grows/shrinks together with the rail.
 * - All colors come from theme tokens (bg-background / bg-card / text-*), so it
 *   adapts to light/dark automatically.
 */
export function SlidingTabs({ items, value, className }: SlidingTabsProps) {
  // Holds the <TabsList> rail element so we can measure trigger offsets
  // relative to it (offsetLeft is relative to the offsetParent).
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // One ref per trigger, keyed by tab value, so we can read each one's
  // live geometry (offsetLeft / offsetWidth) after layout.
  const triggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );

  // The computed pixel geometry of the sliding pill.
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  // Avoids playing the slide animation on the very first paint, so the pill
  // simply "appears" under the initial tab instead of flying in from x=0.
  const [ready, setReady] = React.useState(false);

  /**
   * Recompute the pill position/width for the currently active trigger.
   * Wrapped in useCallback so the ResizeObserver effect can depend on it.
   */
  const syncIndicator = React.useCallback(() => {
    const activeEl = triggerRefs.current[value];
    if (!activeEl) return;
    setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
  }, [value]);

  // Re-measure whenever the active value changes (covers click + keyboard).
  React.useLayoutEffect(() => {
    syncIndicator();
    // Defer enabling the transition until after the first measurement so the
    // initial position is not animated.
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [syncIndicator]);

  // Keep the pill aligned when the rail resizes (responsive / font load / RTL
  // direction flips), because trigger widths change without a value change.
  React.useEffect(() => {
    const rail = listRef.current;
    if (!rail) return;
    const ro = new ResizeObserver(() => syncIndicator());
    ro.observe(rail);
    return () => ro.disconnect();
  }, [syncIndicator]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      className={cn(
        // Equal-width columns => every trigger shares the rail evenly and the
        // whole thing is responsive by default.
        'relative grid w-full auto-cols-fr grid-flow-col',
        // Subtle rail container so the sliding pill reads as a moving surface.
        'bg-muted/60 rounded-lg p-1',
        className,
      )}
    >
      {/* The sliding background pill. It sits BEHIND the triggers (z-0) while
          trigger text sits above it (z-10). Only transform + width animate. */}
      <span
        aria-hidden
        className={cn(
          'bg-background pointer-events-none absolute inset-y-1 z-0 rounded-md shadow-sm',
          // Only animate when ready, so the first render is instant.
          ready ? 'transition-[transform,width] duration-300 ease-out' : '',
        )}
        style={{
          width: `${indicator.width}px`,
          transform: `translateX(${indicator.left}px)`,
        }}
      />

      {items.map((item) => (
        <TabsPrimitive.Trigger
          key={item.value}
          value={item.value}
          // Store the live DOM node so we can measure its geometry later.
          ref={(node) => {
            triggerRefs.current[item.value] = node;
          }}
          // We control selection through Radix's own value/onValueChange on the
          // parent <Tabs> wrapper, so no extra onClick is needed here.
          className={cn(
            // Sit above the sliding pill.
            'relative z-10 flex items-center justify-center gap-2',
            'rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap',
            'cursor-pointer select-none',
            // Theme-aware text: muted when idle, full contrast when active.
            'text-muted-foreground data-[state=active]:text-foreground',
            'transition-colors duration-200',
            // Accessible focus ring using theme ring token.
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          )}
        >
          {item.icon}
          {item.label}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  );
}
