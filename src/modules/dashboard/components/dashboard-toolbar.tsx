// src/modules/dashboard/components/dashboard-toolbar.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  LayoutDashboard,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { HiddenWidgetBadge } from "./widget-shell";
import { getModuleMeta } from "../config/modules-registry";
import { cn } from "@/lib/utils";

interface DashboardToolbarProps {
  hiddenWidgets: string[];
  locale?: string;
  onShow: (id: string) => void;
  onReset: () => void;
  onOpenControlHub?: () => void;
}

export function DashboardToolbar({
  hiddenWidgets,
  locale = "fa",
  onShow,
  onReset,
  onOpenControlHub,
}: DashboardToolbarProps) {
  const t = useTranslations("Dashboard.toolbar");

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap min-h-[36px] w-full">
      {/* ── Left: Hidden widget restore pills ─────── */}
      <div className="flex-1 flex items-center gap-2.5 flex-wrap min-w-0">
        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 shrink-0 select-none">
          <LayoutDashboard className="size-3.5 text-primary" />
          <span>{t("hidden")}:</span>
        </span>

        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          <AnimatePresence mode="popLayout">
            {hiddenWidgets.length === 0 ? (
              <motion.span
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-xs text-muted-foreground/60 italic self-center"
              >
                {locale === "fa" ? "تمام ماژول‌ها فعال هستند" : "All modules are active"}
              </motion.span>
            ) : (
              hiddenWidgets.map((id) => {
                const meta = getModuleMeta(id);
                if (!meta) return null;
                const Icon = meta.icon as any;
                const label = locale === "fa" ? meta.titleFa : meta.titleEn;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  >
                    <HiddenWidgetBadge
                      label={label}
                      icon={<Icon className="size-3.5" />}
                      onShow={() => onShow(id)}
                    />
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right: Master Control Hub & Reset buttons ─────── */}
      <div className="flex items-center gap-2 shrink-0 ms-auto">
        {onOpenControlHub && (
          <button
            type="button"
            onClick={onOpenControlHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-colors duration-150 shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>{t("controlHubBtn")}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          title={t("resetDashboard")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-white/70 dark:bg-card/60 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-card/90 border border-border/50 transition-colors duration-150 font-medium shadow-2xs cursor-pointer"
        >
          <RotateCcw className="size-3" />
          <span>{t("reset")}</span>
        </button>
      </div>
    </div>
  );
}
