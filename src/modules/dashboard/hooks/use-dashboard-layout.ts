// src/modules/dashboard/hooks/use-dashboard-layout.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import {
  TabId,
  MODULES_REGISTRY,
  DEFAULT_TAB_WIDGETS,
  DEFAULT_TAB_LAYOUTS,
  getModuleMeta,
} from "../config/modules-registry";

export type Layouts = Record<string, any[]>;
export type Layout = any;

const STORAGE_KEY_TAB_LAYOUTS = "dashboard_tab_layouts_v6";
const STORAGE_KEY_TAB_WIDGETS = "dashboard_tab_widgets_v6";

const enforceItemConstraints = (item: any) => {
  const meta = getModuleMeta(item.i);
  const minW = meta ? meta.minW : 2;
  const minH = meta ? meta.minH : 2;
  return {
    ...item,
    minW,
    minH,
  };
};

const enforceLayoutConstraints = (layouts: Layouts): Layouts => {
  const result: Layouts = {};
  for (const bp in layouts) {
    result[bp] = (layouts[bp] || []).map(enforceItemConstraints);
  }
  return result;
};

export function useDashboardLayout(initialTab: TabId = "tasks") {
  const [currentTab, setCurrentTab] = useState<TabId>(initialTab);

  // Tab widgets (which widgets are present in each tab's center grid)
  const [tabWidgets, setTabWidgets] = useState<Record<TabId, string[]>>(() => {
    if (typeof window === "undefined") return DEFAULT_TAB_WIDGETS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAB_WIDGETS);
      if (!saved) return DEFAULT_TAB_WIDGETS;
      const parsed = JSON.parse(saved);
      return {
        tasks: parsed.tasks || DEFAULT_TAB_WIDGETS.tasks,
        custom: parsed.custom || DEFAULT_TAB_WIDGETS.custom,
        administrative: parsed.administrative || DEFAULT_TAB_WIDGETS.administrative,
        market: parsed.market || DEFAULT_TAB_WIDGETS.market,
      };
    } catch {
      return DEFAULT_TAB_WIDGETS;
    }
  });

  // Tab layouts (coordinates for widgets in each tab)
  const [tabLayouts, setTabLayouts] = useState<Record<TabId, Layouts>>(() => {
    if (typeof window === "undefined") {
      const init: Record<TabId, Layouts> = {
        tasks: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.tasks),
        custom: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.custom),
        administrative: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.administrative),
        market: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.market),
      };
      return init;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAB_LAYOUTS);
      if (!saved) {
        return {
          tasks: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.tasks),
          custom: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.custom),
          administrative: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.administrative),
          market: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.market),
        };
      }
      const parsed = JSON.parse(saved);
      return {
        tasks: enforceLayoutConstraints(parsed.tasks || DEFAULT_TAB_LAYOUTS.tasks),
        custom: enforceLayoutConstraints(parsed.custom || DEFAULT_TAB_LAYOUTS.custom),
        administrative: enforceLayoutConstraints(parsed.administrative || DEFAULT_TAB_LAYOUTS.administrative),
        market: enforceLayoutConstraints(parsed.market || DEFAULT_TAB_LAYOUTS.market),
      };
    } catch {
      return {
        tasks: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.tasks),
        custom: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.custom),
        administrative: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.administrative),
        market: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.market),
      };
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TAB_WIDGETS, JSON.stringify(tabWidgets));
    } catch {}
  }, [tabWidgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TAB_LAYOUTS, JSON.stringify(tabLayouts));
    } catch {}
  }, [tabLayouts]);

  // Layout change from react-grid-layout for current tab
  const onLayoutChange = useCallback(
    (currentLayout: any, allLayouts: any) => {
      setTabLayouts((prev) => {
        const currentTabLayout = prev[currentTab] || {};
        const merged: Layouts = {};
        const breakpoints = ["lg", "md", "sm"] as const;

        breakpoints.forEach((bp) => {
          const newLayoutForBp = allLayouts[bp] || [];
          const existingLayoutForBp = currentTabLayout[bp] || [];

          const newLayoutIds = new Set(newLayoutForBp.map((l: any) => l.i));
          const preservedLayouts = existingLayoutForBp.filter(
            (l: any) => !newLayoutIds.has(l.i)
          );

          merged[bp] = [...newLayoutForBp, ...preservedLayouts].map(
            enforceItemConstraints
          );
        });

        return {
          ...prev,
          [currentTab]: merged,
        };
      });
    },
    [currentTab]
  );

  // Add widget to a specific tab
  const addWidgetToTab = useCallback(
    (tabId: TabId, widgetId: string) => {
      if (tabId === "tasks") return; // Tasks tab is fixed and non-editable
      setTabWidgets((prev) => {
        const currentList = prev[tabId] || [];
        if (currentList.includes(widgetId)) return prev;
        return {
          ...prev,
          [tabId]: [...currentList, widgetId],
        };
      });

      setTabLayouts((prev) => {
        const currentTabLayout = prev[tabId] || {};
        const meta = getModuleMeta(widgetId);
        const breakpoints = ["lg", "md", "sm"] as const;
        const updated: Layouts = {};

        breakpoints.forEach((bp) => {
          const bpItems = currentTabLayout[bp] || [];
          // If already in layout, keep it
          if (bpItems.some((it) => it.i === widgetId)) {
            updated[bp] = bpItems;
            return;
          }

          const maxY = bpItems.reduce((acc, it) => Math.max(acc, (it.y || 0) + (it.h || 0)), 0);
          const maxCols = bp === "lg" ? 12 : bp === "md" ? 10 : 6;
          const w = meta ? Math.min(meta.defaultW, maxCols) : maxCols;
          const h = meta ? meta.defaultH : 8;
          const minW = meta ? meta.minW : 3;
          const minH = meta ? meta.minH : 4;

          updated[bp] = [
            ...bpItems,
            {
              i: widgetId,
              x: 0,
              y: maxY,
              w,
              h,
              minW,
              minH,
            },
          ];
        });

        return {
          ...prev,
          [tabId]: updated,
        };
      });
    },
    []
  );

  // Remove widget from a specific tab
  const removeWidgetFromTab = useCallback(
    (tabId: TabId, widgetId: string) => {
      if (tabId === "tasks") return; // Tasks tab is fixed and non-editable
      setTabWidgets((prev) => {
        const currentList = prev[tabId] || [];
        return {
          ...prev,
          [tabId]: currentList.filter((id) => id !== widgetId),
        };
      });

      setTabLayouts((prev) => {
        const currentTabLayout = prev[tabId] || {};
        const breakpoints = ["lg", "md", "sm"] as const;
        const updated: Layouts = {};

        breakpoints.forEach((bp) => {
          const bpItems = currentTabLayout[bp] || [];
          updated[bp] = bpItems.filter((it) => it.i !== widgetId);
        });

        return {
          ...prev,
          [tabId]: updated,
        };
      });
    },
    []
  );

  // Toggle widget in a specific tab
  const toggleWidgetInTab = useCallback(
    (tabId: TabId, widgetId: string) => {
      if (tabId === "tasks") return; // Tasks tab is fixed and non-editable
      const isVisible = (tabWidgets[tabId] || []).includes(widgetId);
      if (isVisible) {
        removeWidgetFromTab(tabId, widgetId);
      } else {
        addWidgetToTab(tabId, widgetId);
      }
    },
    [tabWidgets, addWidgetToTab, removeWidgetFromTab]
  );

  // Reset a specific tab
  const resetTab = useCallback((tabId: TabId) => {
    if (tabId === "tasks") {
      setTabWidgets((prev) => ({ ...prev, tasks: ["tasks"] }));
      setTabLayouts((prev) => ({
        ...prev,
        tasks: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.tasks),
      }));
      return;
    }

    setTabWidgets((prev) => ({
      ...prev,
      [tabId]: DEFAULT_TAB_WIDGETS[tabId] || [],
    }));

    setTabLayouts((prev) => ({
      ...prev,
      [tabId]: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS[tabId] || {}),
    }));
  }, []);

  // Reset all tabs to factory defaults
  const resetAllTabs = useCallback(() => {
    setTabWidgets(DEFAULT_TAB_WIDGETS);
    setTabLayouts({
      tasks: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.tasks),
      custom: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.custom),
      administrative: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.administrative),
      market: enforceLayoutConstraints(DEFAULT_TAB_LAYOUTS.market),
    });
    try {
      localStorage.removeItem(STORAGE_KEY_TAB_WIDGETS);
      localStorage.removeItem(STORAGE_KEY_TAB_LAYOUTS);
    } catch {}
  }, []);

  // Apply a preset of widgets to a specific tab
  const applyPreset = useCallback(
    (tabId: TabId, presetWidgetIds: string[]) => {
      if (tabId === "tasks") return; // Tasks tab is fixed and non-editable
      setTabWidgets((prev) => ({
        ...prev,
        [tabId]: presetWidgetIds,
      }));

      // Rebuild layouts for the preset
      setTabLayouts((prev) => {
        const breakpoints = ["lg", "md", "sm"] as const;
        const updated: Layouts = {};

        breakpoints.forEach((bp) => {
          let currentY = 0;
          const maxCols = bp === "lg" ? 12 : bp === "md" ? 10 : 6;

          const items = presetWidgetIds.map((wId) => {
            const meta = getModuleMeta(wId);
            const w = meta ? Math.min(meta.defaultW, maxCols) : maxCols;
            const h = meta ? meta.defaultH : 8;
            const minW = meta ? meta.minW : 3;
            const minH = meta ? meta.minH : 4;

            const item = {
              i: wId,
              x: 0,
              y: currentY,
              w,
              h,
              minW,
              minH,
            };
            currentY += h;
            return item;
          });

          updated[bp] = items;
        });

        return {
          ...prev,
          [tabId]: updated,
        };
      });
    },
    []
  );

  // Active and Hidden widgets for the CURRENT tab
  const activeWidgets = tabWidgets[currentTab] || [];
  const hiddenWidgets = MODULES_REGISTRY.map((m) => m.id).filter(
    (id) => !activeWidgets.includes(id)
  );

  const currentLayouts = tabLayouts[currentTab] || { lg: [], md: [], sm: [] };

  return {
    currentTab,
    setCurrentTab,
    layouts: currentLayouts,
    tabLayouts,
    tabWidgets,
    visibleWidgets: activeWidgets,
    hiddenWidgets,
    onLayoutChange,
    addWidgetToTab,
    removeWidgetFromTab,
    toggleWidgetInTab,
    toggleVisible: (widgetId: string) => toggleWidgetInTab(currentTab, widgetId),
    resetTab: () => resetTab(currentTab),
    resetAllTabs,
    reset: () => resetTab(currentTab),
    applyPreset: (tabId: TabId, presetIds: string[]) => applyPreset(tabId, presetIds),
  };
}
