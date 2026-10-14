// src/modules/dashboard/components/dashboard-toolbar.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw, LayoutDashboard, Users, Wallet, Package, Activity,
  Wrench, CheckCircle2, Clock, FileText, MessageSquare, BarChart3,
  Settings, ListTodo, TrendingUp, Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { HiddenWidgetBadge } from "./widget-shell";
import { cn } from "@/lib/utils";

// ── Widget meta ───────────────────────────────────────────────────────────────

const WIDGET_META: Record<string, { label: string; labelEn: string; icon: React.ElementType }> = {
  "stats-overview": { label: "نمای کلی آمارها", labelEn: "Stats Overview", icon: BarChart3 },
  chart:     { label: "نمودار",             labelEn: "Chart",          icon: BarChart3 },
  activity:  { label: "فعالیت‌های اخیر",   labelEn: "Recent Activity", icon: Activity },
  checklist: { label: "چک‌لیست",           labelEn: "Checklist",      icon: ListTodo },
  commodities: { label: "نرخ لحظه‌ای",       labelEn: "Commodities",    icon: Activity },
  sources:   { label: "منابع آمار",          labelEn: "Sources",        icon: Wrench },
  "engineering-tools": { label: "ابزار مهندسی", labelEn: "Eng Tools",      icon: Wrench },
  "events-manager": { label: "رویدادهای رسمی", labelEn: "Events",         icon: Calendar },
  bourse:    { label: "بورس",              labelEn: "Bourse",         icon: TrendingUp },
  "world-clock": { label: "ساعت جهانی",    labelEn: "World Clock",    icon: Clock },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface DashboardToolbarProps {
  hiddenWidgets: string[];
  locale?: string;
  onShow: (id: string) => void;
  onReset: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardToolbar({
  hiddenWidgets,
  locale = "fa",
  onShow,
  onReset,
}: DashboardToolbarProps) {
  const t = useTranslations("Dashboard.toolbar");

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap min-h-[32px]">
      
      {/* ── Left: hidden widget restore pills ─────── */}
      <div className="flex-1 flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-semibold flex items-center gap-1.5 shrink-0">
          <LayoutDashboard className="size-4 text-primary/70" />
          {t("hidden")}:
        </span>
        <div className="flex items-center gap-2 flex-wrap flex-1 min-h-[32px]">
          <AnimatePresence mode="popLayout">
            {hiddenWidgets.length === 0 ? (
              <motion.span
                key="empty"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs text-muted-foreground/60 italic self-center"
              >
                {locale === "fa" ? "موردی مخفی نیست" : "None"}
              </motion.span>
            ) : (
              hiddenWidgets.map((id) => {
                const meta = WIDGET_META[id];
                if (!meta) return null;
                const Icon = meta.icon as any;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <HiddenWidgetBadge
                      label={locale === "fa" ? meta.label : meta.labelEn}
                      icon={<Icon className="size-4" />}
                      onShow={() => onShow(id)}
                    />
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right: reset button ─────── */}
      <motion.button
        type="button"
        onClick={onReset}
        whileTap={{ scale: 0.97 }}
        title={t("resetDashboard")}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-white/70 dark:bg-card/60 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-card/90 border border-border/50 transition-colors duration-150 font-medium shrink-0 ms-auto shadow-xs"
      >
        <RotateCcw className="size-3" />
        {t("reset")}
      </motion.button>
    </div>
  );
}

