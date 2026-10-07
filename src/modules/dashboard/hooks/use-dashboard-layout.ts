// src/modules/dashboard/hooks/use-dashboard-layout.ts
"use client";

import { useState, useCallback, useEffect } from "react";
export type Layouts = Record<string, any>;
export type Layout = any;

// ─── Types ────────────────────────────────────────────────────────────────────

export type WidgetId =
  | "stats-overview"
  | "chart"
  | "commodities"
  | "bourse"
  | "events-manager"
  | "world-clock"
  | "system-status"
  | "settings";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const MIN_SIZES: Record<WidgetId, { minW: number; minH: number }> = {
  "stats-overview": { minW: 3, minH: 4 },
  chart: { minW: 4, minH: 6 },
  commodities: { minW: 3, minH: 6 },
  bourse: { minW: 4, minH: 8 },
  "events-manager": { minW: 6, minH: 10 },
  "world-clock": { minW: 3, minH: 4 },
  "system-status": { minW: 3, minH: 4 },
  settings: { minW: 2, minH: 4 },
};

const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: "events-manager", x: 0, y: 0, w: 12, h: 10 },
    { i: "world-clock", x: 0, y: 10, w: 6, h: 7 },
    { i: "system-status", x: 6, y: 10, w: 6, h: 7 },
    { i: "stats-overview", x: 0, y: 17, w: 12, h: 5 },
    { i: "commodities", x: 0, y: 22, w: 12, h: 8 },
    { i: "bourse", x: 0, y: 30, w: 12, h: 10 },
    { i: "chart", x: 0, y: 40, w: 12, h: 6 },
  ],
  md: [
    { i: "events-manager", x: 0, y: 0, w: 10, h: 10 },
    { i: "world-clock", x: 0, y: 10, w: 5, h: 7 },
    { i: "system-status", x: 5, y: 10, w: 5, h: 7 },
    { i: "stats-overview", x: 0, y: 17, w: 10, h: 5 },
    { i: "commodities", x: 0, y: 22, w: 10, h: 8 },
    { i: "bourse", x: 0, y: 30, w: 10, h: 10 },
    { i: "chart", x: 0, y: 40, w: 10, h: 6 },
  ],
  sm: [
    { i: "world-clock", x: 0, y: 0, w: 3, h: 7 },
    { i: "settings", x: 3, y: 0, w: 3, h: 7 },
    { i: "stats-overview", x: 0, y: 7, w: 6, h: 7 },
    { i: "events-manager", x: 0, y: 14, w: 6, h: 12 },
    { i: "commodities", x: 0, y: 26, w: 6, h: 8 },
    { i: "bourse", x: 0, y: 34, w: 6, h: 10 },
    { i: "chart", x: 0, y: 44, w: 6, h: 6 },
  ],
  xs: [
    { i: "world-clock", x: 0, y: 0, w: 4, h: 7 },
    { i: "settings", x: 0, y: 7, w: 4, h: 7 },
    { i: "stats-overview", x: 0, y: 14, w: 4, h: 8 },
    { i: "events-manager", x: 0, y: 22, w: 4, h: 12 },
    { i: "commodities", x: 0, y: 34, w: 4, h: 10 },
    { i: "bourse", x: 0, y: 44, w: 4, h: 12 },
    { i: "chart", x: 0, y: 56, w: 4, h: 6 },
  ],
  xxs: [
    { i: "world-clock", x: 0, y: 0, w: 2, h: 7 },
    { i: "settings", x: 0, y: 7, w: 2, h: 7 },
    { i: "stats-overview", x: 0, y: 14, w: 2, h: 10 },
    { i: "events-manager", x: 0, y: 24, w: 2, h: 14 },
    { i: "commodities", x: 0, y: 38, w: 2, h: 12 },
    { i: "bourse", x: 0, y: 50, w: 2, h: 14 },
    { i: "chart", x: 0, y: 64, w: 2, h: 6 },
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
  "stats-overview": true,
  chart: true,
  commodities: true,
  bourse: true,
  "events-manager": true,
  "world-clock": true,
  "system-status": true,
  settings: true,
};

const STORAGE_KEY_LAYOUTS = "dashboard-layouts-v34"; 
const STORAGE_KEY_VISIBILITY = "dashboard-visibility-v30";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardLayout(adminMode = false) {
  const [layouts, setLayouts] = useState<Layouts>(() => {
    if (typeof window === "undefined") return CONSTRAINED_DEFAULT;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAYOUTS);
      if (!saved) return CONSTRAINED_DEFAULT;
      const parsed = JSON.parse(saved);
      const merged: Layouts = {};
      const breakpoints = ['lg', 'md', 'sm'];
      
      breakpoints.forEach(bp => {
        const savedBp = parsed[bp] || [];
        const defaultBp = CONSTRAINED_DEFAULT[bp] || [];
        const savedIds = new Set(savedBp.map((l: any) => l.i));
        const missingDefs = defaultBp.filter((l: any) => !savedIds.has(l.i));
        merged[bp] = [...savedBp, ...missingDefs];
      });
      
      return enforceConstraints(merged);
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

  const [expandedWidgets, setExpandedWidgets] = useState<Record<string, boolean>>({});

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
        
        // Strip out the dynamic expansion offset before saving to our pure base layout
        const normalizedLayoutForBp = newLayoutForBp.map((l: any) => {
          if (expandedWidgets[l.i]) {
            return { ...l, h: Math.max(1, l.h - 4) };
          }
          return l;
        });

        const existingLayoutForBp = prev[bp] || [];
        
        // Keep widgets that were in prev but are missing in allLayouts (because they are hidden)
        const newLayoutIds = new Set(normalizedLayoutForBp.map((l: any) => l.i));
        const preservedLayouts = existingLayoutForBp.filter((l: any) => !newLayoutIds.has(l.i));
        
        merged[bp] = [...normalizedLayoutForBp, ...preservedLayouts];
      });
      return merged;
    });
  }, [expandedWidgets]);

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

  const updateWidgetHeight = useCallback((id: string, height: number) => {
    setLayouts((prev) => {
      const updated: Layouts = {};
      const breakpoints = ['lg', 'md', 'sm'] as const;
      breakpoints.forEach(bp => {
        updated[bp] = (prev[bp] || []).map((l: any) => 
          l.i === id ? { ...l, h: height } : l
        );
      });
      return updated;
    });
  }, []);

  const setWidgetExpanded = useCallback((id: string, expanded: boolean) => {
    setExpandedWidgets(prev => ({ ...prev, [id]: expanded }));
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

  const dynamicLayouts: Layouts = {};
  for (const bp in layouts) {
    dynamicLayouts[bp] = (layouts[bp] || []).map((l: any) => {
      if (expandedWidgets[l.i]) {
        return { ...l, h: l.h + 4 }; 
      }
      return l;
    });
  }

  return {
    layouts: dynamicLayouts,
    visibleWidgets,
    hiddenWidgets,
    onLayoutChange,
    toggleVisible,
    setWidgetExpanded,
    reset,
  };
}
