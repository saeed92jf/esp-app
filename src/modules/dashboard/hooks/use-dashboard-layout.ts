// src/modules/dashboard/hooks/use-dashboard-layout.ts
"use client";

import { useState, useCallback, useEffect } from "react";
export type Layouts = Record<string, any>;
export type Layout = any;

// ─── Types ────────────────────────────────────────────────────────────────────

export type WidgetId =
  | "stat-0"
  | "stat-1"
  | "stat-2"
  | "stat-3"
  | "stat-4"
  | "stat-5"
  | "chart"
  | "activity"
  | "checklist"
  | "commodities"
  | "settings";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const MIN_SIZES: Record<WidgetId, { minW: number; minH: number }> = {
  "stat-0": { minW: 1, minH: 1 },
  "stat-1": { minW: 1, minH: 1 },
  "stat-2": { minW: 1, minH: 1 },
  "stat-3": { minW: 1, minH: 1 },
  "stat-4": { minW: 1, minH: 1 },
  "stat-5": { minW: 1, minH: 1 },
  chart: { minW: 4, minH: 3 },
  activity: { minW: 3, minH: 3 },
  checklist: { minW: 3, minH: 3 }, // Matching activity min sizes
  commodities: { minW: 3, minH: 3 },
  settings: { minW: 2, minH: 2 },
};

const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: "stat-0", x: 0, y: 0, w: 2, h: 2 },
    { i: "stat-1", x: 2, y: 0, w: 2, h: 2 },
    { i: "stat-2", x: 4, y: 0, w: 2, h: 2 },
    { i: "stat-3", x: 6, y: 0, w: 2, h: 2 },
    { i: "stat-4", x: 8, y: 0, w: 2, h: 2 },
    { i: "stat-5", x: 10, y: 0, w: 2, h: 2 },
    { i: "chart", x: 0, y: 2, w: 12, h: 4 }, // Full width
    { i: "activity", x: 0, y: 6, w: 6, h: 4 }, // Next row, side-by-side
    { i: "checklist", x: 6, y: 6, w: 6, h: 4 },
    { i: "settings", x: 0, y: 10, w: 12, h: 4 },
    { i: "commodities", x: 0, y: 14, w: 12, h: 4 },
  ],
  md: [
    { i: "stat-0", x: 0, y: 0, w: 2, h: 2 },
    { i: "stat-1", x: 2, y: 0, w: 2, h: 2 },
    { i: "stat-2", x: 4, y: 0, w: 2, h: 2 },
    { i: "stat-3", x: 6, y: 0, w: 2, h: 2 },
    { i: "stat-4", x: 8, y: 0, w: 2, h: 2 },
    { i: "stat-5", x: 0, y: 2, w: 2, h: 2 },
    { i: "chart", x: 0, y: 4, w: 10, h: 4 }, // Full width (10 cols)
    { i: "activity", x: 0, y: 8, w: 5, h: 4 }, // Side-by-side
    { i: "checklist", x: 5, y: 8, w: 5, h: 4 },
    { i: "settings", x: 0, y: 12, w: 10, h: 4 },
    { i: "commodities", x: 0, y: 16, w: 10, h: 4 },
  ],
  sm: [
    { i: "stat-0", x: 0, y: 0, w: 3, h: 2 },
    { i: "stat-1", x: 3, y: 0, w: 3, h: 2 },
    { i: "stat-2", x: 0, y: 2, w: 3, h: 2 },
    { i: "stat-3", x: 3, y: 2, w: 3, h: 2 },
    { i: "stat-4", x: 0, y: 4, w: 3, h: 2 },
    { i: "stat-5", x: 3, y: 4, w: 3, h: 2 },
    { i: "chart", x: 0, y: 6, w: 6, h: 4 },
    { i: "activity", x: 0, y: 10, w: 6, h: 4 },
    { i: "checklist", x: 0, y: 14, w: 6, h: 4 },
    { i: "settings", x: 0, y: 18, w: 6, h: 3 },
    { i: "commodities", x: 0, y: 21, w: 6, h: 4 },
  ],
};

const enforceConstraints = (layouts: Layouts): Layouts => {
  const result: Layouts = {};
  for (const bp in layouts) {
    result[bp] = layouts[bp].map((item: any) => {
      const constraints = MIN_SIZES[item.i as WidgetId] || { minW: 2, minH: 2 };
      return {
        ...item,
        minW: constraints.minW,
        minH: constraints.minH,
      };
    });
  }
  return result;
};

const CONSTRAINED_DEFAULT = enforceConstraints(DEFAULT_LAYOUTS);

const DEFAULT_VISIBILITY: Record<WidgetId, boolean> = {
  "stat-0": true,
  "stat-1": true,
  "stat-2": true,
  "stat-3": true,
  "stat-4": true,
  "stat-5": false, // explicitly hide the 6th stat card by default
  chart: true,
  activity: true,
  checklist: true,
  commodities: true,
  settings: true,
};

const STORAGE_KEY_LAYOUTS = "dashboard-layouts-v12"; // bumped version for fully packed layout
const STORAGE_KEY_VISIBILITY = "dashboard-visibility-v12";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardLayout(adminMode = false) {
  const [layouts, setLayouts] = useState<Layouts>(() => {
    if (typeof window === "undefined") return CONSTRAINED_DEFAULT;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAYOUTS);
      if (!saved) return CONSTRAINED_DEFAULT;
      const parsed = JSON.parse(saved);
      return enforceConstraints({ ...CONSTRAINED_DEFAULT, ...parsed });
    } catch {
      return CONSTRAINED_DEFAULT;
    }
  });

  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return DEFAULT_VISIBILITY;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VISIBILITY);
      if (!saved) return DEFAULT_VISIBILITY;
      return { ...DEFAULT_VISIBILITY, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_VISIBILITY;
    }
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(layouts));
    } catch {}
  }, [layouts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VISIBILITY, JSON.stringify(visibility));
    } catch {}
  }, [visibility]);


  // Update layouts from react-grid-layout
  const onLayoutChange = useCallback((currentLayout: any, allLayouts: any) => {
    setLayouts(prev => {
      const merged: Layouts = {};
      const breakpoints = ['lg', 'md', 'sm'] as const;
      
      breakpoints.forEach(bp => {
        const newLayoutForBp = allLayouts[bp] || [];
        const existingLayoutForBp = prev[bp] || [];
        
        // Keep widgets that were in prev but are missing in allLayouts (because they are hidden)
        const newLayoutIds = new Set(newLayoutForBp.map((l: any) => l.i));
        const preservedLayouts = existingLayoutForBp.filter((l: any) => !newLayoutIds.has(l.i));
        
        merged[bp] = [...newLayoutForBp, ...preservedLayouts];
      });
      return merged;
    });
  }, []);

  // Toggle widget visibility — when re-showing, restore default layout size
  const toggleVisible = useCallback((id: string) => {
    setVisibility((prev) => {
      const wasHidden = prev[id] === false;
      const next = { ...prev, [id]: !prev[id] };

      // If we're showing a previously hidden widget, restore its default size
      if (wasHidden) {
        setLayouts((prevLayouts) => {
          const restored: Layouts = {};
          const breakpoints = ['lg', 'md', 'sm'] as const;
          breakpoints.forEach(bp => {
            const current = prevLayouts[bp] || [];
            const defaultForBp = CONSTRAINED_DEFAULT[bp] || [];
            const defaultItem = defaultForBp.find((l: any) => l.i === id);
            // Remove old entry for this widget and add the default one
            const filtered = current.filter((l: any) => l.i !== id);
            if (defaultItem) {
              restored[bp] = [...filtered, { ...defaultItem }];
            } else {
              restored[bp] = filtered;
            }
          });
          return restored;
        });
      }

      return next;
    });
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    setVisibility(DEFAULT_VISIBILITY);
    try {
      localStorage.removeItem(STORAGE_KEY_LAYOUTS);
      localStorage.removeItem(STORAGE_KEY_VISIBILITY);
    } catch {}
  }, []);

  // Lists of widget IDs based on visibility and admin rules
  const allWidgetIds = Object.keys(DEFAULT_VISIBILITY) as WidgetId[];
  
  const visibleWidgets = allWidgetIds.filter((id) => {
    if (id === "settings" && !adminMode) return false;
    return visibility[id] !== false;
  });

  const hiddenWidgets = allWidgetIds.filter((id) => {
    if (id === "settings" && !adminMode) return false;
    return visibility[id] === false;
  });

  return {
    layouts,
    visibleWidgets,
    hiddenWidgets,
    onLayoutChange,
    toggleVisible,
    reset,
  };
}
