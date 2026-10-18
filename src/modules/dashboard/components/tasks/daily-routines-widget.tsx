"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sun,
  Sunset,
  Sunrise,
  X,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DailyRoutine } from "../../services/dashboard.service";

interface DailyRoutinesWidgetProps {
  initialRoutines?: DailyRoutine[];
  className?: string;
}

const STORAGE_KEY = "dashboard_user_daily_routines_v1";

export function DailyRoutinesWidget({
  initialRoutines = [],
  className,
}: DailyRoutinesWidgetProps) {
  const t = useTranslations("Dashboard.routines");

  const [routines, setRoutines] = React.useState<DailyRoutine[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialRoutines;
  });

  const [activeSlot, setActiveSlot] = React.useState<
    "all" | "morning" | "midday" | "evening"
  >("all");
  const [newTitle, setNewTitle] = React.useState("");
  const [newTime, setNewTime] = React.useState("09:00");
  const [newPeriod, setNewPeriod] =
    React.useState<DailyRoutine["period"]>("morning");
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
    } catch {}
  }, [routines]);

  const toggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextCompleted = !r.completedToday;
          return {
            ...r,
            completedToday: nextCompleted,
            streakDays: nextCompleted ? r.streakDays + 1 : Math.max(0, r.streakDays - 1),
          };
        }
        return r;
      })
    );
  };

  const deleteRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRoutine: DailyRoutine = {
      id: `rtn-${Date.now()}`,
      title: newTitle.trim(),
      timeSlot: newTime.trim() || "09:00",
      period: newPeriod,
      streakDays: 1,
      completedToday: false,
    };

    setRoutines((prev) => [...prev, newRoutine]);
    setNewTitle("");
    setIsAdding(false);
  };

  const filteredRoutines = React.useMemo(() => {
    if (activeSlot === "all") return routines;
    return routines.filter((r) => r.period === activeSlot);
  }, [routines, activeSlot]);

  const total = filteredRoutines.length;
  const completed = filteredRoutines.filter((r) => r.completedToday).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const slotIcons = {
    morning: Sunrise,
    midday: Sun,
    evening: Sunset,
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-panel dark:bg-card/40 rounded-xl rounded-br-none border border-border/50 overflow-hidden relative p-3.5 sm:p-4 gap-3 @container",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-xl shrink-0 text-amber-500">
            <Flame className="size-4.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground/90 leading-none">
              {t("title")}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {t("subtitle")}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant={isAdding ? "outline" : "default"}
          onClick={() => setIsAdding(!isAdding)}
          className="h-8 text-xs gap-1.5 px-2.5 font-medium shadow-xs"
        >
          {isAdding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          <span>{isAdding ? t("cancel") : t("addRoutine")}</span>
        </Button>
      </div>

      {/* ── Completion Progress ── */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white/60 dark:bg-card/40 border border-border/40 shrink-0">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">{t("todayProgress")}</span>
          <span className="font-semibold text-amber-500 fa-num">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* ── Slot Selector Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs shrink-0">
        {(
          [
            { id: "all", label: t("all") },
            { id: "morning", label: t("morning") },
            { id: "midday", label: t("midday") },
            { id: "evening", label: t("evening") },
          ] as const
        ).map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => setActiveSlot(slot.id as any)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0",
              activeSlot === slot.id
                ? "bg-amber-500 text-white shadow-xs font-semibold"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* ── Add Routine Form ── */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddRoutine}
            className="flex flex-col gap-2 p-3 rounded-xl bg-white dark:bg-card border border-border/70 shadow-sm shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("routinePlaceholder")}
                className="h-8.5 text-xs bg-muted/30 border-border/50 flex-1"
                autoFocus
              />
              <Input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="09:00"
                className="h-8.5 text-xs bg-muted/30 border-border/50 w-20 text-center font-mono"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs">
                {(["morning", "midday", "evening"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewPeriod(s)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium border transition-colors",
                      newPeriod === s
                        ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-semibold"
                        : "border-border/40 text-muted-foreground"
                    )}
                  >
                    {t(s)}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                size="sm"
                className="h-7 text-xs px-3 shadow-xs bg-amber-500 hover:bg-amber-600 text-white"
                disabled={!newTitle.trim()}
              >
                {t("save")}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pe-1">
        {filteredRoutines.length > 0 ? (
          <ul className="grid grid-cols-1 @[520px]:grid-cols-2 gap-1.5">
            {filteredRoutines.map((routine) => {
              const SlotIcon = slotIcons[routine.period] || Clock;

              return (
                <li
                  key={routine.id}
                  onClick={() => toggleRoutine(routine.id)}
                  className={cn(
                    "flex items-center justify-between gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer group/routine select-none shadow-2xs",
                    routine.completedToday
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : "bg-white/80 dark:bg-card/70 border-border/50 hover:border-border/80"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="shrink-0 transition-transform active:scale-90">
                      {routine.completedToday ? (
                        <CheckCircle2 className="size-4.5 text-emerald-500" />
                      ) : (
                        <Circle className="size-4.5 text-muted-foreground group-hover/routine:text-amber-500 transition-colors" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-xs sm:text-sm font-medium transition-all truncate",
                          routine.completedToday
                            ? "line-through text-muted-foreground"
                            : "text-foreground/90"
                        )}
                      >
                        {routine.title}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1 font-mono fa-num">
                          <Clock className="size-3 opacity-60" />
                          <span>{routine.timeSlot}</span>
                        </span>

                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold fa-num">
                          <Flame className="size-3 fill-current" />
                          <span>{routine.streakDays} {t("streakDays")}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => deleteRoutine(routine.id, e)}
                    title={t("delete")}
                    className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/routine:opacity-100 shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <Flame className="size-8 mb-2 opacity-25" />
            <p className="text-xs font-medium">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
