// src/components/dashboard/dashboard.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "../../auth/hooks/use-auth";
import { useDashboard } from "../hooks/use-dashboard";
import { useDashboardLayout } from "../hooks/use-dashboard-layout";
import { StatCard } from "./stat-card";
import { MiniChart } from "./mini-chart";
import { ActivityFeed } from "./activity-feed";
import { CalendarWidget } from "./calendar-widget";
import { ChecklistWidget } from "./checklist-widget";
import { WidgetShell } from "./widget-shell";
import { DashboardToolbar } from "./dashboard-toolbar";
import { CommoditiesWidget } from "./commodities-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsSection } from "@/components/layout/settings-section";
import { DashboardHeader } from "./dashboard-header";
import { DashboardMenuSidebar } from "./dashboard-menu-sidebar";

import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Menu, Home, Calendar as CalendarIcon } from "lucide-react";

// ─── Dashboard ────────────────────────────────────────────────────────────────

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Dashboard() {
  const t = useTranslations("Dashboard");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboard(user?.role);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [menuSidebarOpen, setMenuSidebarOpen] = React.useState(false);

  const {
    layouts,
    visibleWidgets,
    hiddenWidgets,
    onLayoutChange,
    toggleVisible,
    reset,
  } = useDashboardLayout(isAdmin);

  // ── Loading ──
  if (!user) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-12 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="col-span-3 h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-4">
          <Skeleton className="col-span-8 h-56 rounded-xl" />
          <Skeleton className="col-span-4 h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
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
    );
  }

  const displayName =
    locale === "fa" && user?.fullNameFa ? user.fullNameFa : user?.fullName;

  // ─── Render widget content by id ─────────────────────────────────────────

  const renderWidgetContent = (id: string) => {
    switch (id) {
      case "stat-0":
      case "stat-1":
      case "stat-2":
      case "stat-3":
      case "stat-4":
      case "stat-5": {
        const statIndex = parseInt(id.split("-")[1], 10);
        const stat = data.stats[statIndex];
        if (!stat) return null;
        return (
          <div className="fa-num h-full">
            <StatCard stat={stat} />
          </div>
        );
      }

      case "chart":
        return <div className="fa-num h-full"><MiniChart data={data.chart} /></div>;

      case "activity":
        return <div className="fa-num h-full"><ActivityFeed items={data.activities} /></div>;

      case "checklist":
        return <div className="fa-num h-full"><ChecklistWidget items={data.checklist} /></div>;

      case "commodities":
        return <div className="h-full"><CommoditiesWidget /></div>;

      case "settings":
        return (
          <div className="bg-card rounded-xl rounded-br-none border border-border/50 p-4 @sm:p-5 h-full flex flex-col">
            <h3 className="font-semibold text-sm mb-3">{t("themeSettings")}</h3>
            <div className="flex-1">
              <SettingsSection />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1800px] pb-8 relative px-4 sm:px-6">
      <DashboardHeader 
        displayName={displayName}
        userRole={user.role}
        tAuth={tAuth}
        tDashboard={t}
        menuSidebarOpen={menuSidebarOpen}
        setMenuSidebarOpen={setMenuSidebarOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ── Toolbar (hidden widgets + reset) ── */}
      <AnimatePresence>
        {hiddenWidgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-2 bg-card border border-border/50 rounded-xl"
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
          className="mb-4 p-2 bg-card border border-border/50 rounded-xl"
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

      {/* ── Main Content + Sidebar ── */}
      {/* ── React Grid Layout ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
        dir="ltr"
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts as any}
          breakpoints={{ lg: 1024, md: 768, sm: 640 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={80}
          onLayoutChange={onLayoutChange}
          draggableHandle=".widget-drag-handle"
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDroppable={true}
          isResizable={true}
          useCSSTransforms={true}
          compactType="vertical"
        >
          {visibleWidgets.map((id) => (
            <WidgetShell key={id} id={id} onToggleVisible={toggleVisible}>
              <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="w-full h-full">
                {renderWidgetContent(id)}
              </div>
            </WidgetShell>
          ))}
        </ResponsiveGridLayout>
      </motion.div>

      {/* ── Calendar Sidebar (fixed from monitor edge) ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ x: locale === "fa" ? "-100%" : "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: locale === "fa" ? "-100%" : "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 bottom-0 w-80 sm:w-[340px] bg-card border-x border-border/50 z-[60] overflow-y-auto rounded-none",
              locale === "fa" ? "left-0" : "right-0"
            )}
          >
            <div className="h-full">
              <CalendarWidget events={data.calendarEvents} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Menu Sidebar (opposite to calendar) ── */}
      <AnimatePresence initial={false}>
        {menuSidebarOpen && (
          <>
            {/* Mobile/Tablet Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[50]"
            />
            <motion.div
              initial={{ x: locale === "fa" ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: locale === "fa" ? "100%" : "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed top-0 bottom-0 w-80 sm:w-[340px] bg-card border-x border-border/50 z-[60] overflow-y-auto custom-scrollbar rounded-none",
                locale === "fa" ? "right-0" : "left-0"
              )}
            >
              <DashboardMenuSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* ── Calendar Sidebar Backdrop for Mobile/Tablet ── */}
      <AnimatePresence>
        {sidebarOpen && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setSidebarOpen(false)}
             className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[50]"
           />
        )}
      </AnimatePresence>
    </div>
  );
}
