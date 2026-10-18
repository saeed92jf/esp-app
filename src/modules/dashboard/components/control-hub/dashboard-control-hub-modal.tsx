// src/modules/dashboard/components/control-hub/dashboard-control-hub-modal.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Sidebar,
  LayoutGrid,
  Sparkles,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import {
  MODULES_REGISTRY,
  TabId,
  ModuleCategory,
  DashboardModuleMeta,
} from "../../config/modules-registry";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardControlHubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTab: TabId;
  onChangeTab: (tab: TabId) => void;
  activeWidgetsInTab: string[];
  onToggleWidgetInTab: (tabId: TabId, widgetId: string) => void;
  onAddWidgetToTab: (tabId: TabId, widgetId: string) => void;
  onRemoveWidgetFromTab: (tabId: TabId, widgetId: string) => void;
  slideRailItems: string[];
  onToggleSlideRailItem: (widgetId: string) => void;
  onResetCurrentTab: () => void;
  onResetAllTabs: () => void;
  onApplyPreset: (tabId: TabId, presetIds: string[]) => void;
}

export function DashboardControlHubModal({
  open,
  onOpenChange,
  currentTab,
  onChangeTab,
  activeWidgetsInTab,
  onToggleWidgetInTab,
  onAddWidgetToTab,
  onRemoveWidgetFromTab,
  slideRailItems,
  onToggleSlideRailItem,
  onResetCurrentTab,
  onResetAllTabs,
  onApplyPreset,
}: DashboardControlHubModalProps) {
  const t = useTranslations("Dashboard.controlHub");
  const tTabs = useTranslations("Dashboard.tabs");
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<"all" | ModuleCategory>("all");

  if (!open) return null;

  // Filter modules
  const filteredModules = MODULES_REGISTRY.filter((mod) => {
    const title = locale === "fa" ? mod.titleFa : mod.titleEn;
    const desc = locale === "fa" ? mod.descFa : mod.descEn;
    const matchesSearch =
      searchQuery.trim() === "" ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || mod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories: Array<{ id: "all" | ModuleCategory; label: string }> = [
    { id: "all", label: t("categories.all") },
    { id: "tasks", label: t("categories.tasks") },
    { id: "tools", label: t("categories.tools") },
    { id: "market", label: t("categories.market") },
    { id: "administrative", label: t("categories.administrative") },
  ];

  const tabs: TabId[] = ["tasks", "custom", "administrative", "market"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <div
        className="w-full max-w-4xl bg-card border border-border/60 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/40 shrink-0 bg-muted/15">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {t("title")}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary fa-num">
                  {MODULES_REGISTRY.length} {t("allModulesCount")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border/40 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Target Tab Selector Bar ── */}
        <div className="px-5 sm:px-6 py-3.5 bg-muted/25 border-b border-border/30 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <LayoutGrid className="size-3.5 text-primary" />
              {t("activeTab")}:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-background rounded-xl border border-border/40 shadow-2xs">
              {tabs.map((tabId) => {
                const isActive = currentTab === tabId;
                return (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => onChangeTab(tabId)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    {tTabs(tabId as any)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onApplyPreset(currentTab, ["tasks", "checklist", "routines", "notes"])}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-background border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer font-medium"
            >
              {t("presetDefaultTasks")}
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset(currentTab, ["commodities", "chart", "stats-overview", "bourse"])}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-background border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer font-medium"
            >
              {t("presetMarketAnalysis")}
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset(currentTab, ["events-manager", "calendar", "unit-converter", "custom-links"])}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-background border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer font-medium"
            >
              {t("presetAdminTools")}
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset(currentTab, [])}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer font-medium"
            >
              {t("presetCleanSlate")}
            </button>
          </div>
        </div>

        {/* ── Search & Category Filters ── */}
        <div className="p-5 sm:p-6 pb-3 flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchModules")}
              className="ps-10 h-10 rounded-xl bg-background border-border/60 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border",
                    isSelected
                      ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/50"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Modules List Grid (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredModules.map((module) => {
              const Icon = module.icon as any;
              const title = locale === "fa" ? module.titleFa : module.titleEn;
              const desc = locale === "fa" ? module.descFa : module.descEn;

              const isInActiveTab = activeWidgetsInTab.includes(module.id);
              const isInSlideRail = slideRailItems.includes(module.id);

              return (
                <div
                  key={module.id}
                  className={cn(
                    "p-4 rounded-2xl border transition-colors flex flex-col justify-between gap-3 bg-panel/70 dark:bg-card/40",
                    isInActiveTab
                      ? "border-primary/40 shadow-xs"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  {/* Top: Icon, Title, Description */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                        isInActiveTab
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-foreground/80 border-border/40"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {title}
                        </h3>
                        {isInActiveTab && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                            {t("inCurrentTab")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Placement Actions: Center Content vs Side Rail */}
                  <div className="pt-2.5 border-t border-border/30 flex items-center justify-between gap-2 flex-wrap">
                    {/* Center Grid Toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleWidgetInTab(currentTab, module.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs",
                        isInActiveTab
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {isInActiveTab ? (
                        <>
                          <Check className="size-3.5" />
                          <span>{t("centerContent")}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          <span>{t("addToTab")}</span>
                        </>
                      )}
                    </button>

                    {/* Side Rail Toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleSlideRailItem(module.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border",
                        isInSlideRail
                          ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/25"
                          : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/60"
                      )}
                    >
                      <Sidebar className="size-3.5" />
                      <span>
                        {isInSlideRail ? t("slideRail") : t("addToRail")}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 sm:p-5 border-t border-border/40 shrink-0 bg-muted/15 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-muted-foreground fa-num">
            <span>
              <strong>{activeWidgetsInTab.length}</strong> ماژول در تب {tTabs(currentTab as any)}
            </span>
            <span>•</span>
            <span>
              <strong>{slideRailItems.length}</strong> ابزار در سایدبار اسلایدی
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetCurrentTab}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-muted/50 border border-border/50 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("resetCurrentTab")}</span>
            </button>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-5 h-9 text-xs font-semibold shadow-xs"
            >
              ذخیره و تایید
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
