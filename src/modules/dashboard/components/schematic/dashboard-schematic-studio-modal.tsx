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
  ChevronDown,
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
    const matchesSearch =
      searchQuery.trim() === "" ||
      title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || mod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getModuleTitle = (mod: DashboardModuleMeta | undefined) => {
    if (!mod) return "";
    return locale === "fa" ? mod.titleFa : mod.titleEn;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={() => onOpenChange(false)}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <div
        className="w-[96vw] max-w-5xl xl:max-w-6xl bg-card border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[88vh] max-h-[700px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Compact Unified Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-border/40 shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center border border-border/50 shrink-0">
              <Layers className="size-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-foreground">
                {t("title")}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/50 fa-num">
                {MODULES_REGISTRY.length} {t("allModulesCount")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Minimalist View Mode Switcher */}
            <div className="flex items-center p-0.5 bg-muted/50 rounded-xl border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("schematic")}
                className={cn(
                  "flex items-center gap-1.5 h-7.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "schematic"
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutDashboard className="size-3.5" />
                <span>{t("schematicView")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={cn(
                  "flex items-center gap-1.5 h-7.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "matrix"
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowRightLeft className="size-3.5" />
                <span>{t("matrixView")}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 sm:size-7.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors border border-border/40 cursor-pointer"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* ── 2. Compact Subheader (Search & Presets in a single sleek row) ── */}
        <div className="px-4 sm:px-5 py-2 bg-muted/10 border-b border-border/30 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="relative w-52 sm:w-64">
            <Search className="size-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchModules")}
              className="ps-8.5 h-8.5 rounded-lg bg-background border-border/60 text-xs shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 ms-auto">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 shrink-0">
              <Sparkles className="size-3.5 text-muted-foreground" />
              <span className="hidden xs:inline">{t("presetWorkspace")}:</span>
            </span>
            <div className="w-48 sm:w-60">
              <Combobox
                options={workspacePresetOptions}
                value={selectedPresetVal}
                onChange={handleApplyPresetOption}
                placeholder={t("selectPresetWorkspace")}
                className="h-8.5 text-xs rounded-lg bg-background border-border/60 shadow-2xs"
                popoverClassName="z-[120]"
                showSearch={false}
              />
            </div>
          </div>
        </div>

        {/* ── 3. Main Body Content ── */}
        <div className="flex-1 overflow-hidden p-3 sm:p-4 flex flex-col min-h-0">
          {viewMode === "schematic" ? (
            /* ══════════════════════════════════════════════════════════════
               COMPACT SCHEMATIC VIEW (Monochromatic & Clean)
               ══════════════════════════════════════════════════════════════ */
            <div className="flex-1 flex gap-3 sm:gap-4 overflow-hidden min-h-0">
              {/* ── Side Rail (سایدبار عمودی ابزارها در کنار - تک‌رنگ و جمع‌وجور) ── */}
              <div className="w-56 sm:w-64 shrink-0 rounded-xl border border-border/60 bg-muted/20 flex flex-col p-3 gap-2 overflow-hidden">
                {/* Side Rail Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/30 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="size-6.5 rounded-md bg-muted text-foreground border border-border/50 flex items-center justify-center shrink-0">
                      <Sidebar className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {t("slideRail")}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-foreground fa-num border border-border/50">
                    {slideRailItems.length}
                  </span>
                </div>

                {/* Vertical Stack of Pinned Tools */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pe-1 min-h-0">
                  {slideRailItems.length === 0 ? (
                    <div className="py-8 px-3 text-center rounded-lg border border-dashed border-border/50 bg-card/30 flex flex-col items-center justify-center gap-1.5">
                      <Sidebar className="size-6 text-muted-foreground/30" />
                      <p className="text-[11px] text-muted-foreground font-medium">
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
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border/60 text-xs font-semibold shadow-2xs hover:border-foreground/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center shrink-0 border border-border/40">
                              <Icon className="size-3" />
                            </div>
                            <span className="font-semibold text-foreground text-xs truncate">
                              {getModuleTitle(meta)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleSlideRailItem(id)}
                            title={t("unpinTooltip")}
                            className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pin Tool Button */}
                <button
                  type="button"
                  onClick={() =>
                    setAddingToTarget(addingToTarget === "rail" ? null : "rail")
                  }
                  className="w-full h-8 rounded-lg text-xs font-semibold bg-muted hover:bg-foreground hover:text-background text-foreground border border-border/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <Plus className="size-3.5" />
                  <span>{t("addToolToRail")}</span>
                </button>

                {/* Inline Quick Selector for Side Rail */}
                {addingToTarget === "rail" && (
                  <div className="p-2.5 rounded-xl bg-card border border-border/70 shadow-lg animate-in fade-in duration-150 shrink-0">
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-border/30">
                      <span className="text-[11px] font-bold text-foreground">
                        {t("selectToolToPin")}:
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingToTarget(null)}
                        className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 max-h-36 overflow-y-auto custom-scrollbar pe-1">
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
                              className="flex items-center gap-2 p-1.5 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted text-start transition-colors cursor-pointer"
                            >
                              <div className="size-5.5 rounded-md bg-muted text-foreground flex items-center justify-center shrink-0">
                                <Icon className="size-3" />
                              </div>
                              <span className="text-xs font-medium text-foreground truncate">
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

              {/* ── Main Tab Workspace (بدون توضیحات اضافه و کاملاً فشرده) ── */}
              <div className="flex-1 min-w-0 rounded-xl border border-border/60 bg-muted/10 p-3 sm:p-3.5 flex flex-col gap-2.5 overflow-hidden">
                {/* Tab Selector Buttons */}
                <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-2.5 shrink-0 flex-wrap">
                  <div className="flex items-center gap-1.5 p-0.5 bg-muted/40 rounded-xl border border-border/40">
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
                            "h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                            isSelected
                              ? "bg-card text-foreground shadow-2xs border border-border/70 font-bold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          )}
                        >
                          <span>{tTabs(tabId as any)}</span>
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded-full text-[10px] fa-num font-bold",
                              isSelected
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {getTabCount(tabId)}
                          </span>
                          {isCurrentOpen && (
                            <span
                              className="size-1.5 rounded-full bg-foreground shrink-0"
                              title={t("activeTabNow")}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compact Monochromatic Module Cards Grid (NO extra descriptions) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pe-1 min-h-0">
                  {currentTabActiveWidgets.length === 0 ? (
                    <div className="h-full py-8 px-4 rounded-xl border border-dashed border-border/50 bg-card/30 flex flex-col items-center justify-center text-center">
                      <LayoutGrid className="size-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        {t("noModulesInTab")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddingToTarget(activeTabSelection)}
                        className="mt-2.5 h-8 px-3.5 rounded-lg text-xs font-semibold bg-muted hover:bg-foreground hover:text-background text-foreground border border-border/60 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>{t("addFirstModule")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                      {currentTabActiveWidgets.map((widgetId) => {
                        const meta = getModuleMeta(widgetId);
                        if (!meta) return null;
                        const Icon = meta.icon as any;
                        const isPinnedToRail = slideRailItems.includes(widgetId);

                        return (
                          <div
                            key={widgetId}
                            className="px-3 py-2 rounded-xl border border-border/60 bg-card hover:border-foreground/30 hover:bg-muted/20 transition-all flex items-center justify-between gap-2.5 shadow-2xs group"
                          >
                            {/* Left: Icon & Title (No descriptions) */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="size-7.5 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 border border-border/50">
                                <Icon className="size-3.5" />
                              </div>
                              <span className="text-xs sm:text-[13px] font-semibold text-foreground truncate">
                                {getModuleTitle(meta)}
                              </span>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Move to another Tab with Popover */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    title={t("moveToTab")}
                                    className="h-7 px-2 rounded-lg text-[11px] font-medium bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <ArrowRightLeft className="size-3" />
                                    <span className="hidden xs:inline">{t("moveToTab")}</span>
                                    <ChevronDown className="size-2.5 opacity-60" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="start"
                                  className="w-44 p-1 rounded-xl border border-border/60 shadow-lg z-[120]"
                                >
                                  <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 border-b border-border/30 mb-0.5">
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
                                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer text-start"
                                        >
                                          <span>{tTabs(otherTabId as any)}</span>
                                          <span className="text-[10px] text-muted-foreground fa-num">
                                            {getTabCount(otherTabId)}
                                          </span>
                                        </button>
                                      ))}
                                  </div>
                                </PopoverContent>
                              </Popover>

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
                                  "size-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer",
                                  isPinnedToRail
                                    ? "bg-foreground text-background border-foreground font-bold"
                                    : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/50 hover:bg-muted"
                                )}
                              >
                                <Sidebar className="size-3.5" />
                              </button>

                              {/* Remove from Tab */}
                              <button
                                type="button"
                                onClick={() =>
                                  onRemoveWidgetFromTab(activeTabSelection, widgetId)
                                }
                                title={t("removeTooltip")}
                                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border border-border/40"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Module to this Tab Button */}
                <div className="shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setAddingToTarget(
                        addingToTarget === activeTabSelection ? null : activeTabSelection
                      )
                    }
                    className="w-full h-8.5 rounded-xl border border-dashed border-border/80 hover:border-foreground/40 hover:bg-muted/30 text-xs font-semibold text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="size-3.5" />
                    <span>{t("addModule")}</span>
                  </button>

                  {/* Inline Module Picker (Without extra descriptions) */}
                  {addingToTarget === activeTabSelection && (
                    <div className="mt-2 p-2.5 rounded-xl bg-card border border-border/70 shadow-lg animate-in fade-in duration-150">
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-border/30">
                        <span className="text-xs font-bold text-foreground">
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

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
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
                              className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted hover:border-foreground/30 text-start transition-colors cursor-pointer group shadow-2xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="size-6.5 rounded-md bg-muted text-foreground flex items-center justify-center shrink-0 border border-border/40">
                                  <Icon className="size-3" />
                                </div>
                                <span className="text-xs font-semibold text-foreground truncate">
                                  {getModuleTitle(mod)}
                                </span>
                              </div>
                              <Plus className="size-3 text-muted-foreground group-hover:text-foreground shrink-0" />
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
               COMPACT MATRIX VIEW (Monochromatic)
               ══════════════════════════════════════════════════════════════ */
            <div className="flex-1 flex flex-col gap-2.5 overflow-hidden min-h-0">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 shrink-0">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "h-7.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border",
                        isSelected
                          ? "bg-foreground text-background border-foreground font-bold shadow-2xs"
                          : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted/60"
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Matrix Table */}
              <div className="flex-1 border border-border/60 rounded-xl overflow-hidden bg-card shadow-xs min-h-0">
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <table className="w-full text-start text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xs border-b border-border/40 text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-2.5 px-3.5 text-start min-w-[200px]">
                          {t("moduleName")}
                        </th>
                        {tabs.map((tabId) => (
                          <th key={tabId} className="py-2.5 px-2.5 text-center min-w-[90px]">
                            {tTabs(tabId as any)}
                          </th>
                        ))}
                        <th className="py-2.5 px-2.5 text-center min-w-[100px]">
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
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-2 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="size-6.5 rounded-md bg-muted text-foreground flex items-center justify-center shrink-0 border border-border/40">
                                  <Icon className="size-3" />
                                </div>
                                <span className="font-semibold text-foreground text-xs truncate">
                                  {getModuleTitle(module)}
                                </span>
                              </div>
                            </td>

                            {tabs.map((tabId) => {
                              const isInTab = (tabWidgets[tabId] || []).includes(
                                module.id
                              );
                              return (
                                <td key={tabId} className="py-1.5 px-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onToggleWidgetInTab(tabId, module.id)
                                    }
                                    className={cn(
                                      "inline-flex items-center justify-center gap-1 h-6.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border shadow-2xs",
                                      isInTab
                                        ? "bg-foreground text-background border-foreground font-bold"
                                        : "bg-muted/20 text-muted-foreground/60 hover:text-foreground border-border/40 hover:bg-muted/50"
                                    )}
                                  >
                                    {isInTab ? (
                                      <>
                                        <Check className="size-3" />
                                        <span>{t("active")}</span>
                                      </>
                                    ) : (
                                      <span>-</span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}

                            <td className="py-1.5 px-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => onToggleSlideRailItem(module.id)}
                                className={cn(
                                  "inline-flex items-center justify-center gap-1 h-6.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border shadow-2xs",
                                  isPinnedRail
                                    ? "bg-foreground text-background border-foreground font-bold"
                                    : "bg-muted/20 text-muted-foreground/60 hover:text-foreground border-border/40 hover:bg-muted/50"
                                )}
                              >
                                {isPinnedRail ? (
                                  <>
                                    <Sidebar className="size-3" />
                                    <span>{t("pinned")}</span>
                                  </>
                                ) : (
                                  <span>-</span>
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

        {/* ── 4. Compact Monochromatic Footer ── */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-border/40 shrink-0 bg-muted/15 flex items-center justify-between gap-3 text-xs flex-wrap">
          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground fa-num flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/60 text-foreground font-medium shadow-2xs">
              <LayoutGrid className="size-3.5 text-muted-foreground shrink-0" />
              <span>{tTabs(activeTabSelection as any)}:</span>
              <strong className="text-foreground font-bold">
                {getTabCount(activeTabSelection)}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/60 text-foreground font-medium shadow-2xs">
              <Sidebar className="size-3.5 text-muted-foreground shrink-0" />
              <span>{t("slideRail")}:</span>
              <strong className="text-foreground font-bold">
                {slideRailItems.length}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/60 text-foreground font-medium shadow-2xs hidden xs:flex">
              <LayoutDashboard className="size-3.5 text-muted-foreground shrink-0" />
              <span>{t("totalPlacements")}:</span>
              <strong className="text-foreground font-bold">
                {totalActivePlacements}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ms-auto">
            <button
              type="button"
              onClick={onResetCurrentTab}
              className="flex items-center gap-1 px-3 h-8.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground bg-background hover:bg-muted/50 border border-border/60 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("resetCurrentTab")}</span>
            </button>

            <button
              type="button"
              onClick={onResetAllTabs}
              className="flex items-center gap-1 px-3 h-8.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground bg-background hover:bg-muted/50 border border-border/60 transition-colors cursor-pointer shadow-2xs hidden sm:flex"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("resetAllTabs")}</span>
            </button>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-4 h-8.5 text-xs font-bold shadow-xs cursor-pointer bg-foreground text-background hover:bg-foreground/90"
            >
              {t("confirmAndSave")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
