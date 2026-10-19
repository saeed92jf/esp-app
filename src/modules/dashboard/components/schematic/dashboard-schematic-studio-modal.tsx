// src/modules/dashboard/components/schematic/dashboard-schematic-studio-modal.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Lock,
  LayoutGrid,
  CheckSquare,
} from "lucide-react";
import {
  MODULES_REGISTRY,
  TabId,
  DashboardModuleMeta,
  DASHBOARD_TABS,
} from "../../config/modules-registry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSchematicStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTab: TabId;
  onChangeTab?: (tab: TabId) => void;
  tabWidgets: Record<TabId, string[]>;
  onToggleWidgetInTab: (tabId: TabId, widgetId: string) => void;
  onAddWidgetToTab?: (tabId: TabId, widgetId: string) => void;
  onRemoveWidgetFromTab?: (tabId: TabId, widgetId: string) => void;
  slideRailItems?: string[];
  onToggleSlideRailItem?: (widgetId: string) => void;
  onResetCurrentTab: () => void;
  onResetAllTabs: () => void;
  onApplyPreset?: (tabId: TabId, presetIds: string[]) => void;
}

export function DashboardSchematicStudioModal({
  open,
  onOpenChange,
  currentTab,
  tabWidgets,
  onToggleWidgetInTab,
  onResetCurrentTab,
  onResetAllTabs,
}: DashboardSchematicStudioModalProps) {
  const t = useTranslations("Dashboard.schematic");
  const tTabs = useTranslations("Dashboard.tabs");
  const locale = useLocale();

  const [activeTabSelection, setActiveTabSelection] = React.useState<TabId>(currentTab);

  React.useEffect(() => {
    if (open) {
      setActiveTabSelection(currentTab);
    }
  }, [open, currentTab]);

  if (!open) return null;

  const tabs: TabId[] = DASHBOARD_TABS;
  const isTasksTab = activeTabSelection === "tasks";
  const currentTabActiveWidgets = tabWidgets[activeTabSelection] || [];
  const activeSet = new Set(currentTabActiveWidgets);

  const getModuleTitle = (mod: DashboardModuleMeta | undefined) => {
    if (!mod) return "";
    return locale === "fa" ? mod.titleFa : mod.titleEn;
  };

  const getTabCount = (tabId: TabId) => (tabWidgets[tabId] || []).length;

  // Active (checked) modules automatically rise to the top!
  const sortedModules = [...MODULES_REGISTRY].sort((a, b) => {
    const aActive = activeSet.has(a.id);
    const bActive = activeSet.has(b.id);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return 0;
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={() => onOpenChange(false)}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <div
        className="w-[94vw] max-w-xl sm:max-w-2xl bg-card border border-border/70 rounded-2xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Compact Header with Primary Accents & Reset Actions ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-7.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-2xs">
              <SlidersHorizontal className="size-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">
                {t("tabModulesManager")}
              </h2>
              {!isTasksTab && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 fa-num">
                  {currentTabActiveWidgets.length} / {MODULES_REGISTRY.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Reset Current Tab (moved to top header) */}
            {!isTasksTab && (
              <button
                type="button"
                onClick={onResetCurrentTab}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 bg-muted/40 hover:bg-muted border border-border/40 transition-colors cursor-pointer shadow-2xs"
                title={t("resetCurrentTab")}
              >
                <RotateCcw className="size-3 text-muted-foreground" />
                <span>{t("resetCurrentTab")}</span>
              </button>
            )}

            {/* Reset All Tabs */}
            <button
              type="button"
              onClick={onResetAllTabs}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 bg-muted/40 hover:bg-muted border border-border/40 transition-colors cursor-pointer shadow-2xs"
              title={t("resetAllTabs")}
            >
              <RotateCcw className="size-3 text-muted-foreground" />
              <span>{t("resetAllTabs")}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors border border-border/40 cursor-pointer ms-1"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* ── 2. Tabs Navigation Bar (Internal selection only - does NOT switch active background tab) ── */}
        <div className="px-4 py-2 border-b border-border/30 bg-muted/5 shrink-0 flex items-center gap-1.5 overflow-x-auto overflow-y-hidden no-scrollbar">
          {tabs.map((tabId) => {
            const isSelected = activeTabSelection === tabId;
            const isLocked = tabId === "tasks";

            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTabSelection(tabId)}
                className={cn(
                  "h-7.5 px-3 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-normal"
                )}
              >
                {isLocked && (
                  <Lock
                    className={cn(
                      "size-2.5 shrink-0",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  />
                )}
                <span>{tTabs(tabId as any)}</span>
                {!isLocked && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] fa-num",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground font-normal"
                    )}
                  >
                    {getTabCount(tabId)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── 3. Main Body: For Tasks tab, NO modules shown. For others, simple checkbox + name only ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-4 min-h-0 space-y-2">
          {isTasksTab ? (
            /* Dedicated notice for Tasks Tab — NO module cards shown */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3 shadow-xs">
                <CheckSquare className="size-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1.5">
                {t("tasksTabFixedTooltip")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                {t("tasksTabLockedNotice")}
              </p>
            </div>
          ) : (
            /* Simple Module Items Grid (Checkbox + Name only, NO icons) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sortedModules.map((mod) => {
                const isChecked = activeSet.has(mod.id);

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => onToggleWidgetInTab(activeTabSelection, mod.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-start transition-all duration-150 shadow-2xs select-none cursor-pointer",
                      isChecked
                        ? "bg-primary/[0.04] border-primary/40 shadow-xs"
                        : "bg-muted/15 border-border/40 hover:bg-muted/30 hover:border-border/70 opacity-75 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Checkbox indicator with primary accent */}
                      <div
                        className={cn(
                          "size-4 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground shadow-2xs"
                            : "border-border/60 bg-background"
                        )}
                      >
                        {isChecked && <Check className="size-2.5 stroke-[2.5]" />}
                      </div>

                      {/* Title ONLY (simple, clean and compact) */}
                      <span
                        className={cn(
                          "text-xs truncate transition-colors",
                          isChecked
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground/80"
                        )}
                      >
                        {getModuleTitle(mod)}
                      </span>
                    </div>

                    {/* Active dot badge */}
                    {isChecked && (
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 4. Compact Footer ── */}
        <div className="px-4 py-2.5 border-t border-border/40 shrink-0 bg-muted/15 flex items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground fa-num text-[11px] font-normal">
            <LayoutGrid className="size-3 text-muted-foreground shrink-0" />
            <span>{tTabs(activeTabSelection as any)}:</span>
            <strong className="text-foreground font-semibold">
              {isTasksTab
                ? "۱ ماژول اختصاصی"
                : `${getTabCount(activeTabSelection)} ${t("cardsCount")}`}
            </strong>
          </div>

          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-4 h-7.5 text-xs font-semibold shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("confirmAndSave")}
          </Button>
        </div>
      </div>
    </div>
  );
}
