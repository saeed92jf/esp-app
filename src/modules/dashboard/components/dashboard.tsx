// src/modules/dashboard/components/dashboard.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "../../auth/hooks/use-auth";
import { useDashboard } from "../hooks/use-dashboard";
import { useDashboardLayout } from "../hooks/use-dashboard-layout";
import { TabId, getModuleMeta, DASHBOARD_TABS } from "../config/modules-registry";

import { StatsOverviewWidget } from "./stats-overview-widget";
import { MiniChart } from "./mini-chart";
import { ActivityFeed } from "./activity-feed";
import { CalendarWidget } from "./calendar-widget";
import { ChecklistWidget } from "./checklist-widget";
import { WidgetShell } from "./widget-shell";
import { WorldClockWidget } from "./world-clock-widget";
import { UnitConverterWidget } from "./unit-converter-widget";
import { AppIcon } from "@/components/ui/app-icon";
import { CommoditiesWidget } from "./commodities-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { DashboardHeader } from "./dashboard-header";
import { useCommodities } from "../hooks/use-commodities";
import { MarketControlBar } from "./market-control-bar";
import { SourcesWidget } from "./sources-widget";
import { EngineeringToolsWidget } from "./engineering-tools-widget";
import { EventsManagerWidget } from "./events-manager-widget";
import { BourseWidget } from "./bourse-widget";

// Unified feature components
import { TaskWidget } from "@/modules/tasks/components/task-widget";
import { ProjectWidget } from "@/modules/projects/components/project-widget";
import { PeriodicChecklistWidget } from "./tasks/periodic-checklist-widget";
import { DailyRoutinesWidget } from "./tasks/daily-routines-widget";
import { NotesWidget } from "./notes/notes-widget";
import { CustomLinksWidget } from "./links/custom-links-widget";
import { DashboardSchematicStudioModal } from "./schematic/dashboard-schematic-studio-modal";
import {
  ALL_SLIDE_ITEMS,
  DEFAULT_SLIDE_ITEMS,
} from "./slide-menu/slide-menu-customizer-modal";
import { SlideSettingsDrawer } from "./slide-menu/slide-settings-drawer";
import { ProjectsSlideWidget } from "@/modules/projects/components/slide-drawer/projects-slide-widget";

import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  SlidersHorizontal,
  X,
  Lock,
  LayoutDashboard,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ResponsiveGridLayout = WidthProvider(Responsive);

const SLIDE_STORAGE_KEY = "dashboard_slide_rail_items_v5";

const CustomResizeHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "react-resizable-handle react-resizable-handle-se",
        "absolute bottom-2.5 right-2.5 z-40 flex items-center justify-center size-5 cursor-se-resize select-none",
        className
      )}
      title="تغییر اندازه"
    >
      <span className="size-2 rounded-full bg-muted-foreground/45 hover:bg-primary hover:scale-125 transition-all duration-150 shadow-2xs pointer-events-none" />
    </div>
  );
});
CustomResizeHandle.displayName = "CustomResizeHandle";

export function Dashboard() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboard(user?.role);
  const { isFetching: isFetchingMarket, refetch: refetchMarket } = useCommodities();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [linksSidebarOpen, setLinksSidebarOpen] = React.useState(false);

  // Active slide drawer tool
  const [toolsTab, setToolsTab] = React.useState<string>("projects");

  // Tabs: tasks (1st), custom (2nd), administrative (3rd), market (4th)
  const [dashboardTab, setDashboardTab] = React.useState<TabId>("tasks");
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Modals state
  const [isSchematicOpen, setIsSchematicOpen] = React.useState(false);

  // Slide rail items (customizable per user)
  const [slideRailItems, setSlideRailItems] = React.useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SLIDE_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SLIDE_ITEMS;
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(SLIDE_STORAGE_KEY, JSON.stringify(slideRailItems));
      } catch {}
    }, 250);
    return () => clearTimeout(timer);
  }, [slideRailItems]);

  const handleToggleSlideRailItem = (id: string) => {
    setSlideRailItems((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((it) => it !== id);
      }
      return [...prev, id];
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  React.useEffect(() => {
    const onWindowScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, []);

  const handleRefreshAll = React.useCallback(async () => {
    setIsRefreshing(true);
    refetch();
    refetchMarket();
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [refetch, refetchMarket]);

  // Unified Multi-Tab Layout Engine
  const {
    currentTab,
    setCurrentTab,
    layouts,
    tabLayouts,
    tabWidgets,
    visibleWidgets,
    hiddenWidgets,
    onLayoutChange,
    addWidgetToTab,
    removeWidgetFromTab,
    toggleWidgetInTab,
    resetTab,
    resetAllTabs,
    applyPreset,
  } = useDashboardLayout(dashboardTab);

  const handleTabChange = (tabId: TabId) => {
    setDashboardTab(tabId);
    setCurrentTab(tabId);
  };

  // Toggle on click / Double-click toggles slide drawer
  const handleRailTabClick = (tabId: string) => {
    if (linksSidebarOpen && toolsTab === tabId) {
      setLinksSidebarOpen(false);
    } else {
      setToolsTab(tabId);
      setLinksSidebarOpen(true);
    }
  };

  // ── Auth Check ──
  if (!user) return null;

  // ── Render Widget Content by ID ───────────────────────────────────────────
  const renderWidgetContent = (id: string) => {
    if (!data) return null;
    switch (id) {
      case "projects":
        return (
          <div className="h-full min-h-0 fa-num">
            <ProjectWidget />
          </div>
        );

      case "tasks":
        return (
          <div className="h-full min-h-0 fa-num">
            <TaskWidget />
          </div>
        );

      case "checklist":
        return (
          <div className="h-full min-h-0 fa-num">
            <PeriodicChecklistWidget initialItems={data.detailedChecklist} />
          </div>
        );

      case "routines":
        return (
          <div className="h-full min-h-0 fa-num">
            <DailyRoutinesWidget initialRoutines={data.routines} />
          </div>
        );

      case "notes":
        return (
          <div className="h-full min-h-0">
            <NotesWidget initialNotes={data.notes} />
          </div>
        );

      case "custom-links":
        return (
          <div className="h-full min-h-0">
            <CustomLinksWidget initialLinks={data.customLinks} />
          </div>
        );

      case "calendar":
        return (
          <div className="h-full min-h-0 fa-num">
            <CalendarWidget events={data.calendarEvents} />
          </div>
        );

      case "unit-converter":
        return (
          <div className="h-full min-h-0">
            <UnitConverterWidget />
          </div>
        );

      case "events-manager":
        return (
          <div className="h-full min-h-0">
            <EventsManagerWidget events={data.calendarEvents} />
          </div>
        );

      case "commodities":
        return (
          <div className="h-full min-h-0">
            <CommoditiesWidget />
          </div>
        );

      case "chart":
        return (
          <div className="fa-num h-full min-h-0">
            <MiniChart data={data.chart} />
          </div>
        );

      case "world-clock":
        return (
          <div className="h-full min-h-0">
            <WorldClockWidget />
          </div>
        );

      case "stats-overview":
        return (
          <div className="h-full min-h-0">
            <StatsOverviewWidget
              stats={data.stats}
              allStats={data.allStats || data.stats}
            />
          </div>
        );

      case "bourse":
        return (
          <div className="h-full min-h-0">
            <BourseWidget />
          </div>
        );

      case "engineering-tools":
        return (
          <div className="h-full min-h-0">
            <EngineeringToolsWidget locale={locale} />
          </div>
        );

      case "sources":
        return (
          <div className="h-full min-h-0">
            <SourcesWidget locale={locale} />
          </div>
        );

      case "activity":
        return (
          <div className="h-full min-h-0 fa-num">
            <ActivityFeed items={data.activities} />
          </div>
        );

      default:
        return null;
    }
  };

  // Render content in the slide drawer
  const renderSlideDrawerContent = (tabId: string) => {
    if (!data) return null;
    switch (tabId) {
      case "projects":
        return (
          <div className="h-full fa-num">
            <ProjectsSlideWidget />
          </div>
        );
      case "tasks":
        return (
          <div className="h-full fa-num">
            <TaskWidget />
          </div>
        );
      case "checklist":
        return (
          <div className="h-full fa-num">
            <PeriodicChecklistWidget initialItems={data.detailedChecklist} />
          </div>
        );
      case "routines":
        return (
          <div className="h-full fa-num">
            <DailyRoutinesWidget initialRoutines={data.routines} isCompact />
          </div>
        );
      case "notes":
        return (
          <div className="h-full">
            <NotesWidget initialNotes={data.notes} isCompact />
          </div>
        );
      case "links":
      case "custom-links":
        return (
          <div className="h-full">
            <CustomLinksWidget initialLinks={data.customLinks} isCompact />
          </div>
        );
      case "activity":
        return (
          <div className="h-full fa-num">
            <ActivityFeed items={data.activities} />
          </div>
        );
      case "calendar":
        return (
          <div className="h-full fa-num">
            <CalendarWidget events={data.calendarEvents} />
          </div>
        );
      case "converter":
      case "unit-converter":
        return (
          <div className="h-full">
            <UnitConverterWidget />
          </div>
        );
      case "commodities":
        return (
          <div className="h-full">
            <CommoditiesWidget />
          </div>
        );
      case "chart":
        return (
          <div className="fa-num h-full">
            <MiniChart data={data.chart} />
          </div>
        );
      case "world-clock":
        return (
          <div className="h-full">
            <WorldClockWidget />
          </div>
        );
      case "events-manager":
        return (
          <div className="h-full">
            <EventsManagerWidget events={data.calendarEvents} />
          </div>
        );
      case "bourse":
        return (
          <div className="h-full">
            <BourseWidget />
          </div>
        );
      case "engineering-tools":
        return (
          <div className="h-full">
            <EngineeringToolsWidget locale={locale} />
          </div>
        );

      case "slide-settings":
        return (
          <SlideSettingsDrawer
            slideRailItems={slideRailItems}
            onChangeSlideRailItems={setSlideRailItems}
          />
        );
      default:
        return (
          <div className="h-full fa-num">
            <ChecklistWidget items={data.checklist} />
          </div>
        );
    }
  };

  const normalizedDrawerToolId =
    toolsTab === "links"
      ? "custom-links"
      : toolsTab === "converter"
      ? "unit-converter"
      : toolsTab;

  const currentToolMeta = getModuleMeta(normalizedDrawerToolId);

  const unreadCount = data?.notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="flex flex-col flex-1 min-h-full w-full relative group/dashboard bg-white dark:bg-background">
      <DashboardHeader
        isScrolled={isScrolled}
        sidebarOpen={linksSidebarOpen}
        setSidebarOpen={setLinksSidebarOpen}
        notifications={data?.notifications}
        tasks={data?.tasks}
        unreadNotificationsCount={unreadCount}
      />

      {loading ? (
        <div className="flex flex-1 w-full relative overflow-hidden">
          <div className="flex-1 w-full h-full min-w-0 pb-8 px-6 sm:px-12 lg:px-20 pt-6">
            <div className="mx-auto w-full max-w-[1280px]">
              {/* Tabs Skeleton */}
              <div className="flex items-center justify-start gap-8 mb-6 border-b border-border/40 pb-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="col-span-1 md:col-span-2 lg:col-span-4 h-40 rounded-xl" />
                <Skeleton className="col-span-1 lg:col-span-2 h-72 rounded-xl" />
                <Skeleton className="col-span-1 lg:col-span-2 h-72 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ) : error || !data ? (
        <div className="flex flex-1 w-full relative overflow-hidden items-center justify-center">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="bg-destructive/10 text-destructive rounded-xl border border-dashed p-6 text-center">
              <p className="font-medium">
                {error?.message ?? "خطا در بارگذاری داشبورد"}
              </p>
              <button
                onClick={refetch}
                className="text-primary mt-2 text-sm underline cursor-pointer"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 w-full relative bg-white dark:bg-background">
          {/* ── Utility Sidebar ── */}
          <aside
            className="flex-shrink-0 flex sticky top-16 self-start z-20 border-r border-border/10 rtl:border-r-0 rtl:border-l bg-transparent"
            style={{
              top: 'var(--header-height, 4rem)',
              height: 'calc(100dvh - var(--header-height, 4rem))',
              maxHeight: 'calc(100dvh - var(--header-height, 4rem))',
            }}
          >
            {/* ── Side Rail (Icons) with Independent Scrolling ── */}
            <TooltipProvider>
              <div className="w-[52px] sm:w-[64px] shrink-0 flex flex-col items-center py-3.5 h-full relative z-20 overflow-y-auto no-scrollbar">
                {/* 1. Slide Rail Settings Button (FIRST ICON AT TOP) */}
                <div className="shrink-0 pb-2.5 mb-1.5 border-b border-border/20 w-full flex items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleRailTabClick("slide-settings")}
                        className={cn(
                          "relative rounded-full transition-colors duration-150 size-[34px] sm:size-[42px] flex items-center justify-center outline-none cursor-pointer select-none shrink-0",
                          linksSidebarOpen && toolsTab === "slide-settings"
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 hover:border-border/80"
                        )}
                        aria-label={t("slideCustomizer.title")}
                      >
                        {linksSidebarOpen && toolsTab === "slide-settings" && (
                          <motion.div
                            layoutId="active-tool-tab"
                            className="absolute inset-0 bg-primary shadow-xs rounded-full"
                            transition={{
                              type: "spring",
                              stiffness: 520,
                              damping: 32,
                              mass: 0.5,
                            }}
                          />
                        )}
                        <SlidersHorizontal className="size-4 sm:size-4.5 relative z-10 transition-transform duration-150 active:scale-95" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side={locale === "fa" ? "left" : "right"}
                      className="text-xs font-medium"
                    >
                      {t("slideCustomizer.title")}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* 2. Scrollable Icon List */}
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center gap-2.5 py-1 px-1 min-h-0">
                  {slideRailItems.map((itemId) => {
                    const itemDef = ALL_SLIDE_ITEMS.find((it) => it.id === itemId);
                    if (!itemDef) return null;
                    const isActive = linksSidebarOpen && toolsTab === itemDef.id;
                    const Icon = itemDef.icon;
                    const tooltipSide = locale === "fa" ? "left" : "right";
                    const itemTitle = t(`slideCustomizer.items.${itemDef.titleKey}`);

                    return (
                      <motion.div
                        key={itemDef.id}
                        layout="position"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 32,
                          mass: 0.75,
                        }}
                        className="shrink-0 flex items-center justify-center w-full"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleRailTabClick(itemDef.id)}
                              className={cn(
                                "relative rounded-full transition-colors duration-150 size-[34px] sm:size-[42px] flex items-center justify-center outline-none cursor-pointer select-none shrink-0",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 hover:border-border/80"
                              )}
                              aria-label={itemTitle}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="active-tool-tab"
                                  className="absolute inset-0 bg-primary shadow-xs rounded-full"
                                  transition={{
                                    type: "spring",
                                    stiffness: 520,
                                    damping: 32,
                                    mass: 0.5,
                                  }}
                                />
                              )}
                              <AppIcon
                                icon={Icon as any}
                                className="size-5 relative z-10 transition-transform duration-150 active:scale-95"
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side={tooltipSide}
                            className="text-xs font-medium"
                          >
                            {itemTitle}
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </TooltipProvider>

            {/* ── Expanding Drawer Content ── */}
            <motion.div
              initial={false}
              animate={{
                width: linksSidebarOpen
                  ? typeof window !== "undefined" && window.innerWidth < 640
                    ? Math.min(360, window.innerWidth - 56)
                    : 480
                  : 0,
                opacity: linksSidebarOpen ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden h-full flex flex-col bg-card sm:bg-transparent max-w-[calc(100vw-54px)] z-20"
            >
              <div className="w-[calc(100vw-56px)] max-w-[480px] sm:w-[480px] h-full overflow-y-auto custom-scrollbar p-2.5 sm:p-3 ps-1 sm:ps-1.5 pe-2.5 sm:pe-3 pb-6 flex flex-col">
                {/* Clean Drawer Close Header (Title & Add-to-grid removed) */}
                <div className="flex items-center justify-end pb-2 mb-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLinksSidebarOpen(false)}
                    className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 min-h-0">
                  {renderSlideDrawerContent(toolsTab)}
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Mobile backdrop for drawer */}
          {linksSidebarOpen && (
            <div
              onClick={() => setLinksSidebarOpen(false)}
              className="fixed inset-0 z-15 bg-black/40 backdrop-blur-xs sm:hidden"
              aria-hidden="true"
            />
          )}

          {/* ── Center Content ── */}
          <div
            className="flex-1 w-full min-w-0 bg-white dark:bg-background"
          >
            <div className="min-w-0 pb-8 pt-6 px-3 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-[1240px]">
                {/* ── Tabs Row (Tasks 1st, Administrative 2nd, Market 3rd, Custom 4th) & Tab Settings Button ── */}
                <div className="flex items-center justify-between mb-6 border-b border-border/40 fa-num gap-4">
                  {/* Tabs List */}
                  <div className="flex items-center justify-start gap-6 sm:gap-8 overflow-x-auto overflow-y-hidden no-scrollbar">
                    {DASHBOARD_TABS.map((tabId) => {
                      const isActive = dashboardTab === tabId;
                      return (
                        <button
                          key={tabId}
                          onClick={() => handleTabChange(tabId)}
                          className={cn(
                            "relative pb-3 text-sm font-semibold transition-colors outline-none cursor-pointer select-none whitespace-nowrap shrink-0",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>{t(`tabs.${tabId}`)}</span>
                          {isActive && (
                            <motion.div
                              layoutId="dashboard-main-tab-line"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full"
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Settings Button on the opposite side to edit active tab modules (ICON ONLY) */}
                  <div className="ms-auto shrink-0 mb-1.5">
                    <TooltipProvider>
                      {dashboardTab === "tasks" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block cursor-not-allowed">
                              <button
                                type="button"
                                disabled
                                className="flex items-center justify-center size-8 rounded-lg text-muted-foreground/40 border border-border/30 bg-muted/10 opacity-50 pointer-events-none"
                                aria-label={t("schematic.settingsButton")}
                              >
                                <Lock className="size-3.5" />
                              </button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs font-medium">
                            {t("schematic.tasksTabFixedTooltip")}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setIsSchematicOpen(true)}
                              className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 hover:border-border/80 transition-colors cursor-pointer shadow-2xs"
                              aria-label={t("schematic.settingsButton")}
                            >
                              <SlidersHorizontal className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs font-medium">
                            {t("schematic.editTabModules")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </div>
                </div>



                {/* ── Market Control Bar (ONLY on Market Tab) ── */}
                {dashboardTab === "market" && (
                  <div className="mb-4">
                    <MarketControlBar
                      onRefreshAll={handleRefreshAll}
                      isRefreshing={isRefreshing || isFetchingMarket}
                    />
                  </div>
                )}

                {/* ── Unified React Grid Layout for Current Tab ── */}
                <motion.div
                  key={dashboardTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                  dir="ltr"
                >
                  {visibleWidgets.length > 0 ? (
                    <ResponsiveGridLayout
                      key={`rgl-${dashboardTab}-${visibleWidgets.join("-")}-${locale}`}
                      className="layout"
                      layouts={layouts as any}
                      breakpoints={{ lg: 1024, md: 768, sm: 640 }}
                      cols={{ lg: 12, md: 10, sm: 6 }}
                      rowHeight={40}
                      onLayoutChange={onLayoutChange}
                      draggableHandle=".widget-drag-handle"
                      margin={[16, 16]}
                      containerPadding={[0, 0]}
                      isDroppable={true}
                      isResizable={true}
                      resizeHandles={["se"]}
                      resizeHandle={(axis, ref) => (
                        <CustomResizeHandle ref={ref as any} />
                      )}
                      useCSSTransforms={true}
                      compactType="vertical"
                    >
                      {visibleWidgets.map((id) => (
                        <WidgetShell
                          key={id}
                          id={id}
                          onToggleVisible={(widgetId) =>
                            removeWidgetFromTab(dashboardTab, widgetId)
                          }
                          onPinToRail={(widgetId) =>
                            handleToggleSlideRailItem(widgetId)
                          }
                        >
                          <div
                            dir={locale === "fa" ? "rtl" : "ltr"}
                            className="w-full h-full min-h-0 flex flex-col"
                          >
                            {renderWidgetContent(id)}
                          </div>
                        </WidgetShell>
                      ))}
                    </ResponsiveGridLayout>
                  ) : (
                    <div className="p-12 rounded-2xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center text-center my-6">
                      <LayoutDashboard className="size-12 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {t("schematic.emptyTabTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm mb-4">
                        {t("schematic.emptyTabDesc")}
                      </p>
                      <Button
                        onClick={() => setIsSchematicOpen(true)}
                        className="gap-2 text-xs font-semibold h-9 px-4 rounded-xl cursor-pointer"
                      >
                        <SlidersHorizontal className="size-3.5" />
                        <span>{t("schematic.openStudio")}</span>
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>
              {/* /max-w-[1240px] */}
            </div>
            {/* /min-w-0 */}
          </div>
          {/* /center container */}
        </div>
      )}

      {/* ── Modals ── */}

      <DashboardSchematicStudioModal
        open={isSchematicOpen}
        onOpenChange={setIsSchematicOpen}
        currentTab={dashboardTab}
        onChangeTab={handleTabChange}
        tabWidgets={tabWidgets}
        onToggleWidgetInTab={toggleWidgetInTab}
        onAddWidgetToTab={addWidgetToTab}
        onRemoveWidgetFromTab={removeWidgetFromTab}
        slideRailItems={slideRailItems}
        onToggleSlideRailItem={handleToggleSlideRailItem}
        onResetCurrentTab={resetTab}
        onResetAllTabs={resetAllTabs}
        onApplyPreset={applyPreset}
      />
    </div>
  );
}
