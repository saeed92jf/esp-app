'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Configuration for the count-up animation.
 * - active: animation runs only while this is true
 * - duration: total animation length in milliseconds
 * - easing: maps linear progress (0..1) to eased progress (0..1)
 */
export interface UseCountUpOptions {
  active?: boolean;
  duration?: number;
  easing?: (t: number) => number;
}

/**
 * Ease-out cubic: starts fast and decelerates toward the end.
 */
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Animate an integer from 0 up to `end` using requestAnimationFrame.
 *
 * @param end - target value
 * @param options - animation configuration
 * @returns the current animated integer value
 */
export function useCountUp(
  end: number,
  options: UseCountUpOptions = {},
): number {
  const { active = true, duration = 2000, easing = easeOutCubic } = options;

  const [value, setValue] = useState(0);
  // Keep the latest frame id so we can cancel it on cleanup
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset and stop when inactive
    if (!active) {
      setValue(0);
      return;
    }

    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easing(progress) * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, easing, active]);

  return value;
}
