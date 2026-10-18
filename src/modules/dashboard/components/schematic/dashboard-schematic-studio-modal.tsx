// src/modules/dashboard/components/schematic/dashboard-schematic-studio-modal.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  X,
  Search,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Sidebar,
  LayoutGrid,
  Layers,
  ArrowRightLeft,
  LayoutDashboard,
  Sparkles,
  Info,
  ChevronDown,
  CheckSquare2,
  Building2,
  TrendingUp,
  Boxes,
} from "lucide-react";
import {
  MODULES_REGISTRY,
  TabId,
  ModuleCategory,
  DashboardModuleMeta,
  getModuleMeta,
} from "../../config/modules-registry";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DashboardSchematicStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTab: TabId;
  onChangeTab: (tab: TabId) => void;
  tabWidgets: Record<TabId, string[]>;
  onToggleWidgetInTab: (tabId: TabId, widgetId: string) => void;
  onAddWidgetToTab: (tabId: TabId, widgetId: string) => void;
  onRemoveWidgetFromTab: (tabId: TabId, widgetId: string) => void;
  slideRailItems: string[];
  onToggleSlideRailItem: (widgetId: string) => void;
  onResetCurrentTab: () => void;
  onResetAllTabs: () => void;
  onApplyPreset: (tabId: TabId, presetIds: string[]) => void;
}

type StudioViewMode = "schematic" | "matrix";

export function DashboardSchematicStudioModal({
  open,
  onOpenChange,
  currentTab,
  onChangeTab,
  tabWidgets,
  onToggleWidgetInTab,
  onAddWidgetToTab,
  onRemoveWidgetFromTab,
  slideRailItems,
  onToggleSlideRailItem,
  onResetCurrentTab,
  onResetAllTabs,
  onApplyPreset,
}: DashboardSchematicStudioModalProps) {
  const t = useTranslations("Dashboard.schematic");
  const tTabs = useTranslations("Dashboard.tabs");
  const locale = useLocale();

  const [viewMode, setViewMode] = React.useState<StudioViewMode>("schematic");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<"all" | ModuleCategory>("all");
  const [activeTabSelection, setActiveTabSelection] = React.useState<TabId>(currentTab);
  const [addingToTarget, setAddingToTarget] = React.useState<TabId | "rail" | null>(null);
  const [selectedPresetVal, setSelectedPresetVal] = React.useState<string>("");

  React.useEffect(() => {
    if (open) {
      setActiveTabSelection(currentTab);
      setAddingToTarget(null);
      setSelectedPresetVal("");
    }
  }, [open, currentTab]);

  if (!open) return null;

  const tabs: TabId[] = ["tasks", "custom", "administrative", "market"];

  const categories: Array<{ id: "all" | ModuleCategory; label: string }> = [
    { id: "all", label: t("categories.all") },
    { id: "tasks", label: t("categories.tasks") },
    { id: "tools", label: t("categories.tools") },
    { id: "market", label: t("categories.market") },
    { id: "administrative", label: t("categories.administrative") },
  ];

  // Combobox Options for Ready-made Workspaces
  const workspacePresetOptions: ComboboxOption[] = [
    {
      value: "tasks",
      label: t("presetDefaultTasks"),
      hint: locale === "fa" ? "وظایف، چک‌لیست، روتین‌ها و نوت‌ها" : "Tasks, Checklist, Routines & Notes",
    },
    {
      value: "market",
      label: t("presetMarketAnalysis"),
      hint: locale === "fa" ? "نرخ کالاها، نمودار، آمار و بورس" : "Commodities, Chart, Stats & Bourse",
    },
    {
      value: "admin",
      label: t("presetAdminTools"),
      hint: locale === "fa" ? "رویدادها، تقویم، مبدل و لینک‌ها" : "Events, Calendar, Converter & Links",
    },
    {
      value: "all",
      label: t("presetAllInOne"),
      hint: locale === "fa" ? "ترکیب متوازن ماژول‌های پرکاربرد" : "Balanced combination of widgets",
    },
    {
      value: "clean",
      label: t("presetCleanSlate"),
      hint: locale === "fa" ? "پاکسازی کامل و صفحه خالی" : "Empty workspace canvas",
    },
  ];

  const handleApplyPresetOption = (val: string) => {
    setSelectedPresetVal(val);
    if (val === "tasks") {
      onApplyPreset(activeTabSelection, ["tasks", "checklist", "routines", "notes"]);
    } else if (val === "market") {
      onApplyPreset(activeTabSelection, ["commodities", "chart", "stats-overview", "bourse"]);
    } else if (val === "admin") {
      onApplyPreset(activeTabSelection, ["events-manager", "calendar", "unit-converter", "custom-links"]);
    } else if (val === "all") {
      onApplyPreset(activeTabSelection, ["tasks", "checklist", "commodities", "chart", "calendar", "notes"]);
    } else if (val === "clean") {
      onApplyPreset(activeTabSelection, []);
    }
  };

  // Filtered modules
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

  const getModuleTitle = (mod: DashboardModuleMeta | undefined) => {
    if (!mod) return "";
    return locale === "fa" ? mod.titleFa : mod.titleEn;
  };

  const getModuleDesc = (mod: DashboardModuleMeta | undefined) => {
    if (!mod) return "";
    return locale === "fa" ? mod.descFa : mod.descEn;
  };

  const getCategoryBadgeColor = (cat: ModuleCategory) => {
    switch (cat) {
      case "tasks":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "tools":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "market":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "administrative":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    }
  };

  const getCategoryLabel = (cat: ModuleCategory) => {
    switch (cat) {
      case "tasks":
        return t("categories.tasks");
      case "tools":
        return t("categories.tools");
      case "market":
        return t("categories.market");
      case "administrative":
        return t("categories.administrative");
    }
  };

  const handleMoveModule = (fromTab: TabId, toTab: TabId, widgetId: string) => {
    onAddWidgetToTab(toTab, widgetId);
    onRemoveWidgetFromTab(fromTab, widgetId);
  };

  const getTabCount = (tabId: TabId) => (tabWidgets[tabId] || []).length;
  const currentTabActiveWidgets = tabWidgets[activeTabSelection] || [];
  const totalActivePlacements = Object.values(tabWidgets).reduce(
    (acc, it) => acc + it.length,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <div
        className="w-full max-w-6xl xl:max-w-7xl bg-card border border-border/70 rounded-2xl shadow-2xl flex flex-col h-[90vh] max-h-[840px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Header (Normal comfortable height & spacing) ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0 bg-muted/15">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <Layers className="size-5" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {t("title")}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary fa-num">
                {MODULES_REGISTRY.length} {t("allModulesCount")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => setViewMode("schematic")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                  viewMode === "schematic"
                    ? "bg-card text-primary shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutDashboard className="size-4" />
                <span>{t("schematicView")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                  viewMode === "matrix"
                    ? "bg-card text-primary shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowRightLeft className="size-4" />
                <span>{t("matrixView")}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border/40 cursor-pointer"
              aria-label="Close"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        {/* ── 2. Subheader Bar (Search & Combobox Workspaces) ── */}
        <div className="px-6 py-3 bg-muted/10 border-b border-border/30 flex items-center justify-between gap-4 flex-wrap shrink-0">
          {/* Search Box with comfortable width */}
          <div className="relative w-64 sm:w-72">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchModules")}
              className="ps-9.5 h-10 rounded-xl bg-background border-border/60 text-xs sm:text-sm"
            />
          </div>

          {/* Combobox: Preset Ready Workspaces */}
          <div className="flex items-center gap-3 ms-auto">
            <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5 shrink-0">
              <Sparkles className="size-4 text-amber-500" />
              <span>{t("presetWorkspace")}:</span>
            </span>
            <div className="w-68 sm:w-80">
              <Combobox
                options={workspacePresetOptions}
                value={selectedPresetVal}
                onChange={handleApplyPresetOption}
                placeholder={t("selectPresetWorkspace")}
                className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/60 shadow-2xs"
                popoverClassName="z-[110]"
                showSearch={false}
              />
            </div>
          </div>
        </div>

        {/* ── 3. Main Body Content ── */}
        <div className="flex-1 overflow-hidden p-4 sm:p-5 flex flex-col min-h-0">
          {viewMode === "schematic" ? (
            /* ══════════════════════════════════════════════════════════════
               AUTHENTIC SCHEMATIC BLUEPRINT VIEW
               Vertical Side Rail on edge + Tabs & Content Workspace beside it
               ══════════════════════════════════════════════════════════════ */
            <div className="flex-1 flex gap-4 sm:gap-5 overflow-hidden min-h-0">
              {/* ── Realistic Vertical Side Rail (سایدبار عمودی ابزارها در کنار) ── */}
              <div className="w-72 sm:w-80 lg:w-84 shrink-0 rounded-2xl border border-sky-500/30 bg-sky-500/5 flex flex-col p-4 gap-3 overflow-hidden">
                {/* Side Rail Header */}
                <div className="flex items-center justify-between pb-3 border-b border-sky-500/20 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                      <Sidebar className="size-4.5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-sky-950 dark:text-sky-100">
                        {t("slideRail")}
                      </div>
                      <div className="text-[11px] text-sky-700/80 dark:text-sky-300/80">
                        {t("slideRailSubtitle")}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-200 fa-num border border-sky-500/30">
                    {slideRailItems.length}
                  </span>
                </div>

                {/* Vertical Stack of Pinned Tools */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pe-1 min-h-0">
                  {slideRailItems.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-xl border border-dashed border-sky-500/20 bg-sky-500/5 flex flex-col items-center justify-center gap-2">
                      <Sidebar className="size-8 text-sky-500/40" />
                      <p className="text-xs text-muted-foreground font-medium">
                        {t("noPinnedTools")}
                      </p>
                    </div>
                  ) : (
                    slideRailItems.map((id) => {
                      const meta = getModuleMeta(id);
                      if (!meta) return null;
                      const Icon = meta.icon as any;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70 text-xs sm:text-sm text-foreground font-semibold shadow-2xs group hover:border-sky-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                                {getModuleTitle(meta)}
                              </div>
                              <span
                                className={cn(
                                  "inline-block text-[10px] px-1.5 py-0.2 rounded border font-semibold mt-0.5",
                                  getCategoryBadgeColor(meta.category)
                                )}
                              >
                                {getCategoryLabel(meta.category)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleSlideRailItem(id)}
                            title={t("unpinTooltip")}
                            className="size-7.5 flex items-center justify-center rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 border border-border/40 hover:border-rose-500/30 transition-colors cursor-pointer shrink-0"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pin Tool Trigger Button */}
                <button
                  type="button"
                  onClick={() =>
                    setAddingToTarget(addingToTarget === "rail" ? null : "rail")
                  }
                  className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold bg-sky-500/15 text-sky-800 dark:text-sky-200 hover:bg-sky-500/25 border border-sky-500/30 transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-2xs"
                >
                  <Plus className="size-4" />
                  <span>{t("addToolToRail")}</span>
                </button>

                {/* Inline Quick Selector for Side Rail */}
                {addingToTarget === "rail" && (
                  <div className="p-3 rounded-xl bg-card border border-sky-500/40 shadow-lg animate-in fade-in duration-150 shrink-0">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-border/30">
                      <span className="text-xs font-bold text-foreground">
                        {t("selectToolToPin")}:
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingToTarget(null)}
                        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pe-1">
                      {MODULES_REGISTRY.filter((m) => !slideRailItems.includes(m.id)).map(
                        (mod) => {
                          const Icon = mod.icon as any;
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() => {
                                onToggleSlideRailItem(mod.id);
                                setAddingToTarget(null);
                              }}
                              className="flex items-center gap-2.5 p-2 rounded-lg border border-border/50 bg-muted/20 hover:bg-sky-500/10 hover:border-sky-500/30 text-start transition-colors cursor-pointer"
                            >
                              <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Icon className="size-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-foreground truncate">
                                {getModuleTitle(mod)}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Main Tab Workspace beside Side Rail ── */}
              <div className="flex-1 min-w-0 rounded-2xl border border-border/60 bg-muted/10 p-4 sm:p-5 flex flex-col gap-3.5 overflow-hidden">
                {/* Tab Selector Buttons */}
                <div className="flex items-center justify-between gap-3 border-b border-border/30 pb-3 shrink-0 flex-wrap">
                  <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/40">
                    {tabs.map((tabId) => {
                      const isSelected = activeTabSelection === tabId;
                      const isCurrentOpen = currentTab === tabId;
                      return (
                        <button
                          key={tabId}
                          type="button"
                          onClick={() => {
                            setActiveTabSelection(tabId);
                            onChangeTab(tabId);
                          }}
                          className={cn(
                            "h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5",
                            isSelected
                              ? "bg-card text-primary shadow-2xs border border-border/60"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          )}
                        >
                          <span>{tTabs(tabId as any)}</span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs fa-num font-bold",
                              isSelected
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {getTabCount(tabId)}
                          </span>
                          {isCurrentOpen && (
                            <span
                              className="size-2 rounded-full bg-emerald-500 shrink-0"
                              title={t("activeTabNow")}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground ms-auto">
                    <Info className="size-4 text-primary shrink-0" />
                    <span className="hidden md:inline font-medium">
                      {t("schematicInstruction")}
                    </span>
                  </div>
                </div>

                {/* Module Cards Grid for Active Tab */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pe-1.5 min-h-0">
                  {currentTabActiveWidgets.length === 0 ? (
                    <div className="h-full py-12 px-6 rounded-2xl border border-dashed border-border/60 bg-card/40 flex flex-col items-center justify-center text-center">
                      <LayoutGrid className="size-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm sm:text-base font-bold text-foreground">
                        {t("noModulesInTab")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddingToTarget(activeTabSelection)}
                        className="mt-3.5 h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Plus className="size-4" />
                        <span>{t("addFirstModule")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {currentTabActiveWidgets.map((widgetId) => {
                        const meta = getModuleMeta(widgetId);
                        if (!meta) return null;
                        const Icon = meta.icon as any;
                        const isPinnedToRail = slideRailItems.includes(widgetId);

                        return (
                          <div
                            key={widgetId}
                            className="p-4 rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-colors flex flex-col justify-between gap-3.5 shadow-2xs group"
                          >
                            {/* Module Info Top Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                                  <Icon className="size-5" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm sm:text-base font-bold text-foreground truncate">
                                    {getModuleTitle(meta)}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {getModuleDesc(meta)}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "inline-block text-[11px] px-2.5 py-0.5 rounded-md border font-semibold shrink-0",
                                  getCategoryBadgeColor(meta.category)
                                )}
                              >
                                {getCategoryLabel(meta.category)}
                              </span>
                            </div>

                            {/* Action Toolbar with Normal Sizing and Spacious Layout */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                              {/* Move to another Tab with Popover Dropdown */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="h-8.5 px-3 rounded-lg text-xs font-semibold bg-muted/40 hover:bg-primary/10 hover:text-primary text-muted-foreground hover:border-primary/30 border border-border/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <ArrowRightLeft className="size-3.5 text-primary" />
                                    <span>{t("moveToTab")}</span>
                                    <ChevronDown className="size-3 opacity-60" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="start"
                                  className="w-48 p-1.5 rounded-xl border border-border/60 shadow-lg z-[110]"
                                >
                                  <div className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 border-b border-border/30 mb-1">
                                    {t("moveToTargetTab")}:
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    {tabs
                                      .filter((tId) => tId !== activeTabSelection)
                                      .map((otherTabId) => (
                                        <button
                                          key={otherTabId}
                                          type="button"
                                          onClick={() =>
                                            handleMoveModule(
                                              activeTabSelection,
                                              otherTabId,
                                              widgetId
                                            )
                                          }
                                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-start"
                                        >
                                          <span>{tTabs(otherTabId as any)}</span>
                                          <span className="text-[10px] text-muted-foreground fa-num">
                                            {getTabCount(otherTabId)} ماژول
                                          </span>
                                        </button>
                                      ))}
                                  </div>
                                </PopoverContent>
                              </Popover>

                              <div className="flex items-center gap-2">
                                {/* Pin to Side Rail */}
                                <button
                                  type="button"
                                  onClick={() => onToggleSlideRailItem(widgetId)}
                                  title={
                                    isPinnedToRail
                                      ? t("unpinTooltip")
                                      : t("pinTooltip")
                                  }
                                  className={cn(
                                    "h-8.5 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs",
                                    isPinnedToRail
                                      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
                                      : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted/60"
                                  )}
                                >
                                  <Sidebar className="size-3.5" />
                                  <span>
                                    {isPinnedToRail ? t("pinned") : t("slideRail")}
                                  </span>
                                </button>

                                {/* Remove from Tab */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    onRemoveWidgetFromTab(activeTabSelection, widgetId)
                                  }
                                  title={t("removeTooltip")}
                                  className="size-8.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer border border-border/40 hover:border-rose-500/30 shadow-2xs"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Module to this Tab Trigger */}
                <div className="shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setAddingToTarget(
                        addingToTarget === activeTabSelection ? null : activeTabSelection
                      )
                    }
                    className="w-full h-10 rounded-xl border border-dashed border-primary/40 hover:bg-primary/5 text-xs sm:text-sm font-bold text-primary transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Plus className="size-4" />
                    <span>{t("addModule")}</span>
                  </button>

                  {/* Inline Module Picker */}
                  {addingToTarget === activeTabSelection && (
                    <div className="mt-2.5 p-3.5 rounded-2xl bg-card border border-primary/30 shadow-lg animate-in fade-in duration-150">
                      <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-border/30">
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                          {t("pickModuleForTab")}:
                        </span>
                        <button
                          type="button"
                          onClick={() => setAddingToTarget(null)}
                          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {t("cancel")}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {MODULES_REGISTRY.filter(
                          (m) => !currentTabActiveWidgets.includes(m.id)
                        ).map((mod) => {
                          const Icon = mod.icon as any;
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() => {
                                onAddWidgetToTab(activeTabSelection, mod.id);
                                setAddingToTarget(null);
                              }}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-start transition-colors cursor-pointer group shadow-2xs"
                            >
                              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {getModuleTitle(mod)}
                                </div>
                                <span
                                  className={cn(
                                    "inline-block text-[10px] px-1.5 py-0.2 rounded border font-semibold mt-0.5",
                                    getCategoryBadgeColor(mod.category)
                                  )}
                                >
                                  {getCategoryLabel(mod.category)}
                                </span>
                              </div>
                              <Plus className="size-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════════
               COMPACT MATRIX VIEW
               ══════════════════════════════════════════════════════════════ */
            <div className="flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 shrink-0">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "h-8.5 px-3.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border",
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

              {/* Matrix Table */}
              <div className="flex-1 border border-border/60 rounded-2xl overflow-hidden bg-card shadow-xs min-h-0">
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <table className="w-full text-start text-xs sm:text-sm border-collapse">
                    <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xs border-b border-border/40 text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-start min-w-[220px]">
                          {t("moduleName")}
                        </th>
                        {tabs.map((tabId) => (
                          <th key={tabId} className="py-3 px-3 text-center min-w-[100px]">
                            {tTabs(tabId as any)}
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center min-w-[110px]">
                          {t("slideRail")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredModules.map((module) => {
                        const Icon = module.icon as any;
                        const isPinnedRail = slideRailItems.includes(module.id);

                        return (
                          <tr
                            key={module.id}
                            className="hover:bg-muted/15 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                                    {getModuleTitle(module)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {tabs.map((tabId) => {
                              const isInTab = (tabWidgets[tabId] || []).includes(
                                module.id
                              );
                              return (
                                <td key={tabId} className="py-2.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onToggleWidgetInTab(tabId, module.id)
                                    }
                                    className={cn(
                                      "inline-flex items-center justify-center gap-1.5 h-7.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer border shadow-2xs",
                                      isInTab
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                                        : "bg-muted/20 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted/50"
                                    )}
                                  >
                                    {isInTab ? (
                                      <>
                                        <Check className="size-3.5" />
                                        <span>{t("active")}</span>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground/50">
                                        -
                                      </span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}

                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => onToggleSlideRailItem(module.id)}
                                className={cn(
                                  "inline-flex items-center justify-center gap-1.5 h-7.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer border shadow-2xs",
                                  isPinnedRail
                                    ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/25"
                                    : "bg-muted/20 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted/50"
                                )}
                              >
                                {isPinnedRail ? (
                                  <>
                                    <Sidebar className="size-3.5" />
                                    <span>{t("pinned")}</span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground/50">
                                    -
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Footer with Distinct Module Metric Icons Across Different Locations ── */}
        <div className="px-6 py-3.5 border-t border-border/40 shrink-0 bg-muted/15 flex items-center justify-between gap-4 flex-wrap">
          {/* Module Distribution Stats with Distinct Icons */}
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground fa-num flex-wrap">
            {/* Stat 1: Active Tab Modules */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-foreground font-medium shadow-2xs">
              <LayoutGrid className="size-4 text-emerald-500 shrink-0" />
              <span>{tTabs(activeTabSelection as any)}:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                {getTabCount(activeTabSelection)}
              </strong>
            </div>

            {/* Stat 2: Tools in Vertical Side Rail */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-foreground font-medium shadow-2xs">
              <Sidebar className="size-4 text-sky-500 shrink-0" />
              <span>{t("slideRail")}:</span>
              <strong className="text-sky-600 dark:text-sky-400 font-bold">
                {slideRailItems.length}
              </strong>
            </div>

            {/* Stat 3: Distribution Breakdown across other tabs */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-muted-foreground font-medium shadow-2xs">
              <div className="flex items-center gap-1.5">
                <CheckSquare2 className="size-3.5 text-amber-500 shrink-0" />
                <span className="text-foreground font-bold">{getTabCount("tasks")}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-purple-500 shrink-0" />
                <span className="text-foreground font-bold">{getTabCount("custom")}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <Building2 className="size-3.5 text-blue-500 shrink-0" />
                <span className="text-foreground font-bold">{getTabCount("administrative")}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-teal-500 shrink-0" />
                <span className="text-foreground font-bold">{getTabCount("market")}</span>
              </div>
            </div>

            {/* Stat 4: Total active placements across dashboard */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-foreground font-medium shadow-2xs">
              <LayoutDashboard className="size-4 text-primary shrink-0" />
              <span>{t("totalPlacements")}:</span>
              <strong className="text-primary font-bold">
                {totalActivePlacements}
              </strong>
            </div>

            {/* Stat 5: All catalog modules */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-foreground font-medium shadow-2xs">
              <Boxes className="size-4 text-slate-500 shrink-0" />
              <span>{t("allCatalogStats")}:</span>
              <strong className="text-foreground font-bold">
                {MODULES_REGISTRY.length}
              </strong>
            </div>
          </div>

          {/* Action Buttons with comfortable normal heights */}
          <div className="flex items-center gap-2.5 ms-auto">
            <button
              type="button"
              onClick={onResetCurrentTab}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground bg-background hover:bg-muted/50 border border-border/60 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="size-4" />
              <span>{t("resetCurrentTab")}</span>
            </button>

            <button
              type="button"
              onClick={onResetAllTabs}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground bg-background hover:bg-muted/50 border border-border/60 transition-colors cursor-pointer shadow-2xs hidden sm:flex"
            >
              <RotateCcw className="size-4" />
              <span>{t("resetAllTabs")}</span>
            </button>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 h-10 text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              {t("confirmAndSave")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
