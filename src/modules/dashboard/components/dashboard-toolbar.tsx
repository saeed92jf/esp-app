// src/modules/dashboard/components/dashboard-toolbar.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, LayoutDashboard, Users, Wallet, Package, Activity, Wrench, CheckCircle2, Clock, FileText, MessageSquare, BarChart3, Settings, ListTodo } from "lucide-react";
import { HiddenWidgetBadge } from "./widget-shell";

// ─── Widget labels & icons ────────────────────────────────────────────────────

const WIDGET_META: Record<string, { label: string; labelEn: string; icon: React.ElementType }> = {
  "stat-0":  { label: "کارت آمار ۱",       labelEn: "Stat Card 1",    icon: Users },
  "stat-1":  { label: "کارت آمار ۲",       labelEn: "Stat Card 2",    icon: Wallet },
  "stat-2":  { label: "کارت آمار ۳",       labelEn: "Stat Card 3",    icon: Package },
  "stat-3":  { label: "کارت آمار ۴",       labelEn: "Stat Card 4",    icon: Activity },
  "stat-4":  { label: "کارت آمار ۵",       labelEn: "Stat Card 5",    icon: Wrench },
  "stat-5":  { label: "کارت آمار ۶",       labelEn: "Stat Card 6",    icon: CheckCircle2 },
  chart:     { label: "نمودار",           labelEn: "Chart",          icon: BarChart3 },
  activity:  { label: "فعالیت‌های اخیر", labelEn: "Recent Activity", icon: Activity },
  checklist: { label: "چک‌لیست",         labelEn: "Checklist",      icon: ListTodo },
  settings:  { label: "تنظیمات",         labelEn: "Settings",       icon: Settings },
};

// ─── DashboardToolbar ─────────────────────────────────────────────────────────

interface DashboardToolbarProps {
  hiddenWidgets: string[];
  locale?: string;
  onShow: (id: string) => void;
  onReset: () => void;
}

export function DashboardToolbar({
  hiddenWidgets,
  locale = "fa",
  onShow,
  onReset,
}: DashboardToolbarProps) {
  const hasHidden = hiddenWidgets.length > 0;

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* ── Left: hidden widget restore pills ── */}
      <AnimatePresence mode="popLayout">
        {hasHidden && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <LayoutDashboard className="size-3.5" />
              {locale === "fa" ? "مخفی:" : "Hidden:"}
            </span>
            {hiddenWidgets.map((id) => {
              const meta = WIDGET_META[id];
              if (!meta) return null;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {(() => {
                    const Icon = meta.icon as any;
                    return (
                      <HiddenWidgetBadge
                        label={locale === "fa" ? meta.label : meta.labelEn}
                        icon={<Icon className="size-3.5" />}
                        onShow={() => onShow(id)}
                      />
                    );
                  })()}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right: reset button ── */}
      <motion.button
        type="button"
        onClick={onReset}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title={locale === "fa" ? "بازنشانی داشبورد" : "Reset Dashboard"}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/80 hover:bg-muted/40 transition-all duration-200 font-medium ms-auto"
      >
        <RotateCcw className="size-3" />
        {locale === "fa" ? "بازنشانی" : "Reset"}
      </motion.button>
    </div>
  );
}
