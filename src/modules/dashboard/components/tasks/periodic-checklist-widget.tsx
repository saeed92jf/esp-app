"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  Circle,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  DetailedChecklistItem,
  ChecklistPeriod,
} from "../../services/dashboard.service";

interface PeriodicChecklistWidgetProps {
  initialItems?: DetailedChecklistItem[];
  className?: string;
}

const STORAGE_KEY = "dashboard_user_periodic_checklist_v1";

export function PeriodicChecklistWidget({
  initialItems = [],
  className,
}: PeriodicChecklistWidgetProps) {
  const t = useTranslations("Dashboard.checklist");
  const locale = useLocale();

  const [items, setItems] = React.useState<DetailedChecklistItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialItems;
  });

  const [activePeriod, setActivePeriod] =
    React.useState<ChecklistPeriod | "all">("all");
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("");
  const [newPriority, setNewPriority] =
    React.useState<"low" | "medium" | "high">("medium");
  const [newPeriod, setNewPeriod] = React.useState<ChecklistPeriod>("daily");
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetPeriod =
      activePeriod !== "all" ? activePeriod : newPeriod;

    const newItem: DetailedChecklistItem = {
      id: `chk-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      period: targetPeriod,
      category: newCategory.trim() || t("defaultCat"),
      priority: newPriority,
      createdAt:
        locale === "fa"
          ? new Intl.DateTimeFormat("fa-IR").format(new Date())
          : new Date().toLocaleDateString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setNewTitle("");
    setNewCategory("");
    setIsAdding(false);
  };

  const filteredItems = React.useMemo(() => {
    if (activePeriod === "all") return items;
    return items.filter((it) => it.period === activePeriod);
  }, [items, activePeriod]);

  // Completion calculation for current period
  const totalCount = filteredItems.length;
  const completedCount = filteredItems.filter((i) => i.completed).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative p-3.5 sm:p-4 gap-3 @container",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 shrink-0 pe-18 sm:pe-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-primary/10 rounded-xl shrink-0 text-primary">
            <CheckSquare className="size-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground/90 leading-none truncate">
              {t("periodicTitle")}
            </h3>
            <span className="text-[11px] text-muted-foreground truncate block">
              {t("periodicSubtitle")}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant={isAdding ? "outline" : "default"}
          onClick={() => setIsAdding(!isAdding)}
          className="h-8 text-xs gap-1.5 px-2.5 font-medium shadow-xs shrink-0"
        >
          {isAdding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          <span>{isAdding ? t("cancel") : t("addItem")}</span>
        </Button>
      </div>

      {/* ── Progress Bar ── */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white/60 dark:bg-card/40 border border-border/40 shrink-0">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">{t("progressLabel")}</span>
          <span className="font-semibold text-primary fa-num">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* ── Period Selector Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs shrink-0">
        {(
          [
            { id: "all", label: t("all") },
            { id: "daily", label: t("daily") },
            { id: "weekly", label: t("weekly") },
            { id: "monthly", label: t("monthly") },
            { id: "periodic", label: t("periodic") },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivePeriod(tab.id as any)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0",
              activePeriod === tab.id
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Add Item Form ── */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddItem}
            className="flex flex-col gap-2 p-3 rounded-xl bg-white dark:bg-card border border-border/70 shadow-sm shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("itemPlaceholder")}
                className="h-8.5 text-xs bg-muted/30 border-border/50 flex-1"
                autoFocus
              />
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t("categoryPlaceholder")}
                className="h-8.5 text-xs bg-muted/30 border-border/50 w-28"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs">
                {(["daily", "weekly", "monthly", "periodic"] as const).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPeriod(p)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-medium border transition-colors",
                        newPeriod === p
                          ? "bg-primary/10 border-primary text-primary font-semibold"
                          : "border-border/40 text-muted-foreground"
                      )}
                    >
                      {t(p)}
                    </button>
                  )
                )}
              </div>

              <Button
                type="submit"
                size="sm"
                className="h-7 text-xs px-3 shadow-xs"
                disabled={!newTitle.trim()}
              >
                {t("save")}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pe-1">
        {filteredItems.length > 0 ? (
          <ul className="grid grid-cols-1 @[520px]:grid-cols-2 gap-1.5">
            {filteredItems.map((item) => (
              <li
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "flex items-center justify-between gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer group/item select-none shadow-2xs",
                  item.completed
                    ? "bg-muted/20 border-border/30 opacity-70"
                    : "bg-white/80 dark:bg-card/70 border-border/50 hover:border-border/80"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="shrink-0 transition-transform active:scale-90">
                    {item.completed ? (
                      <CheckCircle2 className="size-4.5 text-emerald-500" />
                    ) : (
                      <Circle className="size-4.5 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-medium transition-all truncate",
                        item.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground/90"
                      )}
                    >
                      {item.title}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-muted/60 font-medium">
                        {t(item.period)}
                      </span>
                      {item.category && <span>• {item.category}</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => deleteItem(item.id, e)}
                  title={t("delete")}
                  className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/item:opacity-100 shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <CheckSquare className="size-8 mb-2 opacity-25" />
            <p className="text-xs font-medium">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
