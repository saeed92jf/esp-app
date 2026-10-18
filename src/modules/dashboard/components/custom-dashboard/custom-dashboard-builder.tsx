"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Check,
  Calendar as CalendarIcon,
  ArrowRightLeft,
  FileText,
  Link as LinkIcon,
  CheckSquare,
  Flame,
  Activity,
  BarChart3,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../../services/dashboard.service";
import { NotesWidget } from "../notes/notes-widget";
import { CustomLinksWidget } from "../links/custom-links-widget";
import { CalendarWidget } from "../calendar-widget";
import { UnitConverterWidget } from "../unit-converter-widget";
import { PeriodicChecklistWidget } from "../tasks/periodic-checklist-widget";
import { DailyRoutinesWidget } from "../tasks/daily-routines-widget";
import { CommoditiesWidget } from "../commodities-widget";
import { MiniChart } from "../mini-chart";
import { WorldClockWidget } from "../world-clock-widget";
import { EventsManagerWidget } from "../events-manager-widget";

interface CustomDashboardBuilderProps {
  data: DashboardData;
}

interface CustomWidgetMeta {
  id: string;
  labelKey: string;
  descKey: string;
  icon: React.ElementType;
  defaultColSpan: string;
}

const AVAILABLE_WIDGETS: CustomWidgetMeta[] = [
  {
    id: "notes",
    labelKey: "notes",
    descKey: "notesDesc",
    icon: FileText,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "custom-links",
    labelKey: "links",
    descKey: "linksDesc",
    icon: LinkIcon,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "calendar",
    labelKey: "calendar",
    descKey: "calendarDesc",
    icon: CalendarIcon,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "unit-converter",
    labelKey: "converter",
    descKey: "converterDesc",
    icon: ArrowRightLeft,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "periodic-checklist",
    labelKey: "checklist",
    descKey: "checklistDesc",
    icon: CheckSquare,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "daily-routines",
    labelKey: "routines",
    descKey: "routinesDesc",
    icon: Flame,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "commodities",
    labelKey: "commodities",
    descKey: "commoditiesDesc",
    icon: Activity,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "chart",
    labelKey: "chart",
    descKey: "chartDesc",
    icon: BarChart3,
    defaultColSpan: "col-span-1 md:col-span-6 lg:col-span-6",
  },
  {
    id: "world-clock",
    labelKey: "worldClock",
    descKey: "worldClockDesc",
    icon: Clock,
    defaultColSpan: "col-span-1 md:col-span-12 lg:col-span-12",
  },
  {
    id: "events-manager",
    labelKey: "events",
    descKey: "eventsDesc",
    icon: CalendarIcon,
    defaultColSpan: "col-span-1 md:col-span-12 lg:col-span-12",
  },
];

const DEFAULT_ACTIVE = ["notes", "custom-links", "calendar", "unit-converter"];
const STORAGE_KEY = "dashboard_user_custom_active_widgets_v1";

export function CustomDashboardBuilder({ data }: CustomDashboardBuilderProps) {
  const t = useTranslations("Dashboard.customBuilder");
  const locale = useLocale();

  const [activeWidgets, setActiveWidgets] = React.useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_ACTIVE;
  });

  const [isCatalogOpen, setIsCatalogOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeWidgets));
    } catch {}
  }, [activeWidgets]);

  const toggleWidget = (id: string) => {
    setActiveWidgets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setActiveWidgets(DEFAULT_ACTIVE);
  };

  const renderWidgetContent = (id: string) => {
    switch (id) {
      case "notes":
        return <NotesWidget initialNotes={data.notes} />;
      case "custom-links":
        return <CustomLinksWidget initialLinks={data.customLinks} />;
      case "calendar":
        return <CalendarWidget events={data.calendarEvents} />;
      case "unit-converter":
        return <UnitConverterWidget />;
      case "periodic-checklist":
        return <PeriodicChecklistWidget initialItems={data.detailedChecklist} />;
      case "daily-routines":
        return <DailyRoutinesWidget initialRoutines={data.routines} />;
      case "commodities":
        return <CommoditiesWidget />;
      case "chart":
        return (
          <div className="h-full fa-num bg-panel dark:bg-card/40 rounded-xl border border-border/50 p-4">
            <MiniChart data={data.chart} />
          </div>
        );
      case "world-clock":
        return <WorldClockWidget />;
      case "events-manager":
        return <EventsManagerWidget events={data.calendarEvents} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-12">
      {/* ── Builder Action Toolbar ── */}
      <div className="p-4 rounded-xl border border-border/50 bg-panel dark:bg-card/40 flex items-center justify-between gap-3 flex-wrap shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <LayoutDashboard className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground leading-none">
              {t("title")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("subtitle", { count: activeWidgets.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="h-8.5 text-xs gap-1.5 font-medium"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("reset")}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className="h-8.5 text-xs gap-1.5 px-3.5 font-medium shadow-xs"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>{isCatalogOpen ? t("closeCatalog") : t("manageWidgets")}</span>
          </Button>
        </div>
      </div>

      {/* ── Widget Catalog Drawer ── */}
      <AnimatePresence>
        {isCatalogOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl border border-border/60 bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-md overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
              <h4 className="font-semibold text-xs sm:text-sm text-foreground/90">
                {t("catalogTitle")}
              </h4>
              <span className="text-xs text-muted-foreground">
                {t("catalogHint")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVAILABLE_WIDGETS.map((widget) => {
                const isActive = activeWidgets.includes(widget.id);
                const Icon = widget.icon as any;

                return (
                  <div
                    key={widget.id}
                    onClick={() => toggleWidget(widget.id)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none",
                      isActive
                        ? "bg-primary/5 border-primary/40 shadow-xs"
                        : "bg-muted/20 border-border/40 hover:border-border/70 opacity-70"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center shrink-0 border",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted border-border/50 text-muted-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-xs sm:text-sm text-foreground block truncate">
                          {t(`widgets.${widget.labelKey}` as any)}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate block">
                          {t(`widgets.${widget.descKey}` as any)}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "size-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border/60 bg-card"
                      )}
                    >
                      {isActive && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Widgets Grid ── */}
      {activeWidgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {activeWidgets.map((widgetId) => {
            const meta = AVAILABLE_WIDGETS.find((w) => w.id === widgetId);
            const colSpan = meta?.defaultColSpan || "col-span-1 md:col-span-6 lg:col-span-6";

            return (
              <div
                key={widgetId}
                className={cn(
                  colSpan,
                  "h-[440px] flex flex-col relative group/custom-card transition-all"
                )}
              >
                {/* Remove Widget Quick Action Floating Badge */}
                <button
                  type="button"
                  onClick={() => toggleWidget(widgetId)}
                  title={t("removeWidget")}
                  className="absolute top-2 end-2 z-20 p-1.5 rounded-lg bg-background/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/40 shadow-xs backdrop-blur-xs opacity-0 group-hover/custom-card:opacity-100 transition-opacity"
                >
                  <X className="size-3.5" />
                </button>

                {renderWidgetContent(widgetId)}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 rounded-2xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center text-center text-muted-foreground">
          <LayoutDashboard className="size-12 mb-3 opacity-25" />
          <h4 className="font-semibold text-base text-foreground mb-1">
            {t("noActiveWidgets")}
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
            {t("noActiveWidgetsDesc")}
          </p>
          <Button
            size="sm"
            onClick={() => setIsCatalogOpen(true)}
            className="text-xs gap-1.5 h-8.5 px-4 font-medium shadow-xs"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>{t("openCatalog")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
