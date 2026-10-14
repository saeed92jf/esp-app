// src/components/dashboard/dashboard.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "../../auth/hooks/use-auth";
import { useDashboard } from "../hooks/use-dashboard";
import { useDashboardLayout } from "../hooks/use-dashboard-layout";
import { StatsOverviewWidget } from "./stats-overview-widget";
import { MiniChart } from "./mini-chart";
import { ActivityFeed } from "./activity-feed";
import { CalendarWidget } from "./calendar-widget";
import { ChecklistWidget } from "./checklist-widget";
import { WidgetShell } from "./widget-shell";
import { WorldClockWidget } from "./world-clock-widget";
import { UnitConverterWidget } from "./unit-converter-widget";
import { DashboardToolbar } from "./dashboard-toolbar";
import { AppIcon } from "@/components/ui/app-icon";
import { CommoditiesWidget } from "./commodities-widget";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardHeader } from "./dashboard-header";
import { DashboardMenuSidebar } from "./dashboard-menu-sidebar";
import { useCommodities } from "../hooks/use-commodities";
import { MarketControlBar } from "./market-control-bar";
import { SourcesWidget } from "./sources-widget";
import { EngineeringToolsWidget } from "./engineering-tools-widget";
import { EventsManagerWidget } from "./events-manager-widget";

import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Home, Calendar as CalendarIcon, Settings, Link as LinkIcon, CheckSquare, Activity, ArrowRightLeft } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Dashboard ────────────────────────────────────────────────────────────────

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Dashboard() {
  const t = useTranslations("Dashboard");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboard(user?.role);
  const { isFetching: isFetchingMarket, refetch: refetchMarket } = useCommodities();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [linksSidebarOpen, setLinksSidebarOpen] = React.useState(false);
  const [toolsTab, setToolsTab] = React.useState<'calendar' | 'converter' | 'links' | 'checklist' | 'activity'>('calendar');
  const [dashboardTab, setDashboardTab] = React.useState<'market' | 'admin'>('admin');
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  const handleRefreshAll = React.useCallback(async () => {
    setIsRefreshing(true);
    refetch();
    refetchMarket();
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [refetch, refetchMarket]);

  const {
    layouts,
    visibleWidgets,
    hiddenWidgets,
    onLayoutChange,
    toggleVisible,
    setWidgetExpanded,
    reset,
  } = useDashboardLayout(isAdmin);

  // ── Auth Check ──
  if (!user) return null;

  const displayName =
    locale === "fa" && user?.fullNameFa ? user.fullNameFa : user?.fullName;

  // ─── Filter by Tab ────────────────────────────────────────────────────────
  const MARKET_WIDGETS = ['stats-overview', 'commodities', 'chart'];
  const ADMIN_WIDGETS = ['events-manager', 'world-clock'];

  const tabFilteredWidgets = visibleWidgets.filter(id => 
    dashboardTab === 'market' ? MARKET_WIDGETS.includes(id) : ADMIN_WIDGETS.includes(id)
  );
  
  // ─── Render widget content by id ─────────────────────────────────────────

  const renderWidgetContent = (id: string) => {
    if (!data) return null;
    switch (id) {
      case "stats-overview": {
        return (
          <div className="h-full">
            <StatsOverviewWidget 
              stats={data.stats} 
              allStats={data.allStats || data.stats} 
              onToggleExpand={(expanded) => setWidgetExpanded("stats-overview", expanded)}
            />
          </div>
        );
      }

      case "chart":
        return <div className="fa-num h-full"><MiniChart data={data.chart} /></div>;

      case "events-manager":
        return <div className="h-full"><EventsManagerWidget events={data.calendarEvents} /></div>;

      case "world-clock":
        return <div className="h-full"><WorldClockWidget /></div>;

      case "commodities":
        return <div className="h-full"><CommoditiesWidget /></div>;

      case "sources":
        return <div className="h-full"><SourcesWidget locale={locale} /></div>;

      case "engineering-tools":
        return <div className="h-full"><EngineeringToolsWidget locale={locale} /></div>;



      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden relative group/dashboard bg-white dark:bg-background">
      {/* Edge Handles have been moved into the sidebar wrappers */}

      <DashboardHeader 
        isScrolled={isScrolled}
        sidebarOpen={linksSidebarOpen}
        setSidebarOpen={setLinksSidebarOpen}
      />

      {loading ? (
        <div className="flex flex-1 w-full relative overflow-hidden pt-[72px]">
          <div className="flex-1 w-full h-full min-w-0 pb-8 px-6 sm:px-12 lg:px-20 pt-6">
            <div className="mx-auto w-full max-w-[1280px]">
              {/* Tabs Skeleton */}
              <div className="flex items-center justify-start gap-8 mb-6 border-b border-border/40 pb-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Toolbar Skeleton */}
              <div className="flex items-center justify-between mb-4">
                 <Skeleton className="h-8 w-40 rounded-lg" />
                 <Skeleton className="h-8 w-8 rounded-md hidden sm:block" />
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Skeleton className="col-span-1 md:col-span-2 lg:col-span-4 h-40 rounded-xl" />
                 <Skeleton className="col-span-1 lg:col-span-2 h-72 rounded-xl" />
                 <Skeleton className="col-span-1 lg:col-span-2 h-72 rounded-xl" />
                 <Skeleton className="col-span-1 lg:col-span-2 h-72 rounded-xl" />
                 <Skeleton className="col-span-1 lg:col-span-2 h-72 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ) : error || !data ? (
        <div className="flex flex-1 w-full relative overflow-hidden pt-[72px] items-center justify-center">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="bg-destructive/10 text-destructive rounded-xl border border-dashed p-6 text-center">
              <p className="font-medium">
                {error?.message ?? "خطا در بارگذاری داشبورد"}
              </p>
              <button onClick={refetch} className="text-primary mt-2 text-sm underline">
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 w-full h-full relative pt-[72px] overflow-hidden bg-white dark:bg-background">
        {/* ── Utility Sidebar ── */}
        <div className="flex-shrink-0 flex h-full z-20 border-r border-border/10 rtl:border-r-0 rtl:border-l bg-transparent">
          {/* ── Side Rail (Icons) ── */}
          <TooltipProvider delayDuration={150}>
            <div className="w-[58px] sm:w-[90px] shrink-0 flex flex-col items-center py-4 gap-2.5 h-full relative z-20">
              {/* Tool Icons */}
              {[
                { id: 'calendar', icon: CalendarIcon, title: t("header.calendar") },
                { id: 'converter', icon: ArrowRightLeft, title: locale === 'fa' ? "مبدل واحد" : "Unit Converter" },
                { id: 'links', icon: LinkIcon, title: t("calendar.usefulLinks") },
                { id: 'checklist', icon: CheckSquare, title: t("checklist.title") },
                { id: 'activity', icon: Activity, title: t("activity.title") }
              ].map((tab) => {
                const isActive = linksSidebarOpen && toolsTab === tab.id;
                const Icon = tab.icon;
                const tooltipSide = locale === "fa" ? "left" : "right";
                return (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button 
                        type="button"
                        onClick={() => {
                          setToolsTab(tab.id as any);
                          setLinksSidebarOpen(true);
                        }}
                        className={cn(
                          "relative rounded-full transition-colors duration-150 size-[34px] sm:size-[42px] flex items-center justify-center outline-none cursor-pointer select-none",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 hover:border-border/80"
                        )}
                        aria-label={tab.title}
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
                        <AppIcon icon={Icon} className="size-5 relative z-10 transition-transform duration-150 active:scale-95" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side={tooltipSide} className="text-xs font-medium">
                      {tab.title}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>

          {/* ── Expanding Drawer Content ── */}
          <motion.div
            initial={false}
            animate={{ 
              width: linksSidebarOpen ? 400 : 0,
              opacity: linksSidebarOpen ? 1 : 0
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden h-full flex flex-col bg-transparent"
          >
            <div className="w-[400px] h-full overflow-y-auto custom-scrollbar p-3.5 pe-2.5 pb-6 flex flex-col">
              {toolsTab === 'calendar' && (
                <div className="h-full fa-num"><CalendarWidget events={data.calendarEvents} /></div>
              )}
              {toolsTab === 'links' && (
                <div className="flex flex-col h-full min-h-0 bg-panel dark:bg-card/40 rounded-xl border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4">
                  <div className="flex items-center gap-2 px-1 mb-4 shrink-0">
                    <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                      <LinkIcon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground/80 shrink-0">{t("calendar.usefulLinks")}</h3>
                  </div>
                  <Accordion type="single" collapsible defaultValue="sources" className="w-full flex-1 overflow-y-auto custom-scrollbar pe-1">
                    <SourcesWidget locale={locale} />
                    <EngineeringToolsWidget locale={locale} />
                  </Accordion>
                </div>
              )}
              {toolsTab === 'converter' && (
                <div className="h-full"><UnitConverterWidget /></div>
              )}
              {toolsTab === 'checklist' && (
                <div className="h-full fa-num"><ChecklistWidget items={data.checklist} /></div>
              )}
              {toolsTab === 'activity' && (
                <div className="h-full fa-num"><ActivityFeed items={data.activities} /></div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Center Content (Scrollable) ── */}
        <div 
          className="flex-1 w-full h-full overflow-y-auto custom-scrollbar bg-white dark:bg-background"
          onScroll={handleScroll}
        >
          <div className="min-w-0 pb-8 pt-6 px-3 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1240px]">



      {/* ── Tabs ── */}
      <div className="flex items-center justify-start gap-8 mb-6 border-b border-border/40 pb-[2px] fa-num">
        {['administrative', 'market'].map((tabId) => {
          const isActive = dashboardTab === (tabId === 'market' ? 'market' : 'admin');
          return (
            <button
              key={tabId}
              onClick={() => setDashboardTab(tabId === 'market' ? 'market' : 'admin')}
              className={cn(
                "relative pb-3 text-sm font-semibold transition-colors outline-none",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="dashboard-main-tab-line"
                  className="absolute bottom-[-3px] left-0 right-0 h-[2px] bg-primary rounded-t-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span>{t(`tabs.${tabId}`)}</span>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar (Hidden widgets + reset) ── */}
      <AnimatePresence>
        {hiddenWidgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-2 bg-panel dark:bg-card/40 border border-border/50 rounded-xl"
            dir={locale === 'fa' ? 'rtl' : 'ltr'}
          >
            <DashboardToolbar
              hiddenWidgets={hiddenWidgets}
              locale={locale}
              onShow={toggleVisible}
              onReset={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reset button (always visible, subtle) ── */}
      {hiddenWidgets.length === 0 && (
        <div 
          className="mb-4 p-2 bg-panel dark:bg-card/40 border border-border/50 rounded-xl"
          dir={locale === 'fa' ? 'rtl' : 'ltr'}
        >
          <DashboardToolbar
            hiddenWidgets={[]}
            locale={locale}
            onShow={toggleVisible}
            onReset={reset}
          />
        </div>
      )}

      {/* ── Market Control Bar (Rates & Settings ONLY) ── */}
      {dashboardTab === 'market' && (
        <div className="mb-4">
          <MarketControlBar 
            onRefreshAll={handleRefreshAll}
            isRefreshing={isRefreshing || isFetchingMarket}
          />
        </div>
      )}

      {/* ── Main Content + Sidebar ── */}
      {/* ── React Grid Layout ── */}
      <motion.div
        key={dashboardTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
        dir="ltr"
      >
        <ResponsiveGridLayout
          key={`rgl-${dashboardTab}`}
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
          useCSSTransforms={true}
          compactType="vertical"
        >
          {tabFilteredWidgets.map((id) => (
            <WidgetShell key={id} id={id} onToggleVisible={toggleVisible}>
              <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="w-full h-full">
                {renderWidgetContent(id)}
              </div>
            </WidgetShell>
          ))}
        </ResponsiveGridLayout>
      </motion.div>

      </div>{/* /max-w-[1280px] */}
          </div>{/* /min-w-0 */}

        </div>{/* /center container */}
      </div>
      )}

    </div>
  );
}

