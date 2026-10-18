// src/modules/dashboard/components/slide-menu/slide-menu-customizer-modal.tsx
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  SlidersHorizontal,
  CheckSquare,
  Flame,
  FileText,
  Link as LinkIcon,
  Activity,
  Calendar,
  ArrowRightLeft,
  RotateCcw,
  BarChart3,
  Clock,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlideMenuItemDef {
  id: string;
  icon: React.ElementType;
  titleKey: string;
}

export const ALL_SLIDE_ITEMS: SlideMenuItemDef[] = [
  { id: "checklist", icon: CheckSquare, titleKey: "checklist" },
  { id: "routines", icon: Flame, titleKey: "routines" },
  { id: "notes", icon: FileText, titleKey: "notes" },
  { id: "links", icon: LinkIcon, titleKey: "links" },
  { id: "activity", icon: Activity, titleKey: "activity" },
  { id: "calendar", icon: Calendar, titleKey: "calendar" },
  { id: "converter", icon: ArrowRightLeft, titleKey: "converter" },
  { id: "commodities", icon: Activity, titleKey: "commodities" },
  { id: "chart", icon: BarChart3, titleKey: "chart" },
  { id: "world-clock", icon: Clock, titleKey: "worldClock" },
  { id: "events-manager", icon: Calendar, titleKey: "events" },
  { id: "bourse", icon: TrendingUp, titleKey: "bourse" },
  { id: "engineering-tools", icon: Wrench, titleKey: "tools" },
];

export const DEFAULT_SLIDE_ITEMS = [
  "checklist",
  "routines",
  "notes",
  "links",
  "activity",
  "calendar",
  "converter",
];

interface SlideMenuCustomizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeItems: string[];
  onChangeActiveItems: (items: string[]) => void;
}

export function SlideMenuCustomizerModal({
  open,
  onOpenChange,
  activeItems,
  onChangeActiveItems,
}: SlideMenuCustomizerModalProps) {
  const t = useTranslations("Dashboard.slideCustomizer");

  if (!open) return null;

  const toggleItem = (id: string) => {
    if (activeItems.includes(id)) {
      if (activeItems.length <= 1) return; // keep at least 1
      onChangeActiveItems(activeItems.filter((i) => i !== id));
    } else {
      onChangeActiveItems([...activeItems, id]);
    }
  };

  const handleReset = () => {
    onChangeActiveItems(DEFAULT_SLIDE_ITEMS);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <SlidersHorizontal className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t("title")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Item List (Scrollable) */}
        <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
          {ALL_SLIDE_ITEMS.map((item) => {
            const Icon = item.icon as any;
            const isSelected = activeItems.includes(item.id);
            const title = t(`items.${item.titleKey}` as any);

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer select-none",
                  isSelected
                    ? "bg-primary/10 border-primary/40 text-foreground"
                    : "bg-muted/20 border-border/40 text-muted-foreground hover:border-border hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium">{title}</span>
                </div>

                <div
                  className={cn(
                    "size-5 rounded-md border flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border/60 bg-background"
                  )}
                >
                  {isSelected && <Check className="size-3" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3.5 border-t border-border/40 bg-muted/20 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>{t("reset")}</span>
          </button>

          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            size="sm"
            className="text-xs h-8 px-4"
          >
            {t("done")}
          </Button>
        </div>
      </div>
    </div>
  );
}
