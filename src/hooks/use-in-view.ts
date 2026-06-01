'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Configuration for the IntersectionObserver-based visibility hook.
 * - threshold: how much of the element must be visible (0..1) to count as "in view"
 * - once: if true, stops observing after the first time it becomes visible
 * - rootMargin: CSS-like margin to grow/shrink the root's bounding box
 */
export interface UseInViewOptions {
  threshold?: number | number[];
  once?: boolean;
  rootMargin?: string;
}

/**
 * Hook that reports whether the referenced element is within the viewport.
 *
 * @param options - observer configuration
 * @returns { ref, inView } - attach `ref` to the target element
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
): { ref: React.RefObject<T>; inView: boolean } {
  const { threshold = 0, once = true, rootMargin = '0px' } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    // Guard: nothing to observe yet
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // When `once` is set, disconnect after the first reveal
          if (once) observer.disconnect();
        } else if (!once) {
          // Allow toggling back to false only in repeating mode
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    // Cleanup on unmount or dependency change
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
