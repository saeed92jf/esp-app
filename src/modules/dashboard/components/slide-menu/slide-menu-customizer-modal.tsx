// src/modules/dashboard/components/slide-menu/slide-menu-customizer-modal.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
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
  Sidebar,
  ListTodo,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlideMenuItemDef {
  id: string;
  icon: React.ElementType;
  titleKey: string;
}

export const ALL_SLIDE_ITEMS: SlideMenuItemDef[] = [
  { id: "projects", icon: FolderKanban, titleKey: "projects" },
  { id: "tasks", icon: ListTodo, titleKey: "tasks" },
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
  "tasks",
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
  const locale = useLocale();

  if (!open) return null;

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...activeItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onChangeActiveItems(newItems);
  };

  const addItem = (id: string) => {
    if (!activeItems.includes(id)) {
      onChangeActiveItems([...activeItems, id]);
    }
  };

  const removeItem = (id: string) => {
    if (activeItems.length <= 1) return; // keep at least 1 item
    onChangeActiveItems(activeItems.filter((i) => i !== id));
  };

  const handleReset = () => {
    onChangeActiveItems(DEFAULT_SLIDE_ITEMS);
  };

  const unpinnedItems = ALL_SLIDE_ITEMS.filter(
    (item) => !activeItems.includes(item.id)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <div
        className="w-full max-w-lg bg-card border border-border/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/40 shrink-0 bg-muted/15">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <Sidebar className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {t("title")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border/40 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content (Active items reorder & unpinned items) */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Section 1: Active Items with Reordering */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {t("activeItemsTitle")}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold fa-num">
                {activeItems.length}
              </span>
            </div>

            <div className="space-y-2">
              {activeItems.map((id, index) => {
                const itemDef = ALL_SLIDE_ITEMS.find((it) => it.id === id);
                if (!itemDef) return null;
                const Icon = itemDef.icon as any;
                const title = t(`items.${itemDef.titleKey}` as any);

                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors shadow-2xs"
                  >
                    {/* Item info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {title}
                      </span>
                    </div>

                    {/* Actions: Move Up, Move Down, Remove */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        title={t("moveUp")}
                        className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none border border-border/40 transition-colors cursor-pointer"
                      >
                        <ChevronUp className="size-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === activeItems.length - 1}
                        title={t("moveDown")}
                        className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none border border-border/40 transition-colors cursor-pointer"
                      >
                        <ChevronDown className="size-3.5" />
                      </button>

                      {/* Remove from Rail */}
                      <button
                        type="button"
                        onClick={() => removeItem(id)}
                        disabled={activeItems.length <= 1}
                        title={t("removeFromRail")}
                        className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-30 disabled:pointer-events-none border border-border/40 hover:border-rose-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Available Unpinned Tools to Add */}
          {unpinnedItems.length > 0 && (
            <div className="pt-2 border-t border-border/30">
              <div className="mb-2.5">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {t("availableItemsTitle")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {unpinnedItems.map((item) => {
                  const Icon = item.icon as any;
                  const title = t(`items.${item.titleKey}` as any);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItem(item.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-start transition-colors cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-7.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {title}
                        </span>
                      </div>
                      <Plus className="size-4 text-primary shrink-0 opacity-80 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/15 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-background hover:bg-muted/50 border border-border/50 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("reset")}</span>
          </button>

          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-5 h-9 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            {t("done")}
          </Button>
        </div>
      </div>
    </div>
  );
}
