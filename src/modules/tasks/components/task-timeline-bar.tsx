// src/modules/tasks/components/task-timeline-bar.tsx
"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ChevronsUp,
  ArrowUpRight,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskItem, TaskPriority } from "../types/tasks.types";
import { cn } from "@/lib/utils";

interface TaskTimelineBarProps {
  tasks: TaskItem[];
  selectedTaskId?: string | null;
  onSelectTask: (task: TaskItem) => void;
}

interface MilestonePoint {
  dateKey: string;
  dayNumber: number;
  weekdayLabel: string;
  dateLabel: string;
  tasks: TaskItem[];
  color: string;
  isToday?: boolean;
}

export function TaskTimelineBar({
  tasks,
  selectedTaskId,
  onSelectTask,
}: TaskTimelineBarProps) {
  const t = useTranslations("Tasks.timeline");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Timeline date markers matching the reference design:
  // 28 Feb (1), 7 Mar (4), 14 Mar (11, 15), 21 Mar (18), 28 Mar (29, 30), 4 Apr (4), 11 Apr
  const milestones: MilestonePoint[] = [
    {
      dateKey: "28-feb",
      dayNumber: 1,
      weekdayLabel: isRtl ? "پ" : "T",
      dateLabel: isRtl ? "۲۸ بهمن" : "28 Feb",
      tasks: tasks.filter((t) => t.status === "completed").slice(0, 1),
      color: "bg-emerald-500 text-white ring-emerald-200 dark:ring-emerald-900/50",
    },
    {
      dateKey: "4-mar",
      dayNumber: 4,
      weekdayLabel: isRtl ? "د" : "M",
      dateLabel: isRtl ? "۴ اسفند" : "4 Mar",
      tasks: tasks.filter((t) => t.id === "task-usr-201" || t.timelineDate?.includes("4")),
      color: "bg-emerald-500 text-white ring-emerald-200 dark:ring-emerald-900/50",
    },
    {
      dateKey: "8-mar",
      dayNumber: 8,
      weekdayLabel: isRtl ? "ج" : "F",
      dateLabel: isRtl ? "۸ اسفند" : "8 Mar",
      tasks: [],
      color: "bg-primary text-primary-foreground",
      isToday: true,
    },
    {
      dateKey: "11-mar",
      dayNumber: 11,
      weekdayLabel: isRtl ? "د" : "M",
      dateLabel: isRtl ? "۱۱ اسفند" : "11 Mar",
      tasks: tasks.filter((t) => t.id === "task-mgr-103" || t.timelineDate?.includes("11")),
      color: "bg-indigo-600 text-white ring-indigo-200 dark:ring-indigo-900/50",
    },
    {
      dateKey: "15-mar",
      dayNumber: 15,
      weekdayLabel: isRtl ? "ج" : "F",
      dateLabel: isRtl ? "۱۵ اسفند" : "15 Mar",
      tasks: tasks.filter((t) => t.id === "task-mgr-102" || t.timelineDate?.includes("15")),
      color: "bg-pink-500 text-white ring-pink-200 dark:ring-pink-900/50",
    },
    {
      dateKey: "18-mar",
      dayNumber: 18,
      weekdayLabel: isRtl ? "د" : "M",
      dateLabel: isRtl ? "۱۸ اسفند" : "18 Mar",
      tasks: tasks.filter((t) => t.id === "task-mgr-101" || t.timelineDate?.includes("18")),
      color: "bg-amber-500 text-white ring-amber-200 dark:ring-amber-900/50",
    },
    {
      dateKey: "21-mar",
      dayNumber: 21,
      weekdayLabel: isRtl ? "پ" : "T",
      dateLabel: isRtl ? "۲۱ اسفند" : "21 Mar",
      tasks: tasks.filter((t) => t.id === "task-usr-202" || t.timelineDate?.includes("21")),
      color: "bg-violet-600 text-white ring-violet-200 dark:ring-violet-900/50",
    },
    {
      dateKey: "28-mar",
      dayNumber: 28,
      weekdayLabel: isRtl ? "پ" : "T",
      dateLabel: isRtl ? "۲۸ اسفند" : "28 Mar",
      tasks: tasks.filter((t) => t.id === "task-usr-203" || t.timelineDate?.includes("28")),
      color: "bg-sky-500 text-white ring-sky-200 dark:ring-sky-900/50",
    },
    {
      dateKey: "4-apr",
      dayNumber: 4,
      weekdayLabel: isRtl ? "س" : "W",
      dateLabel: isRtl ? "۴ فروردین" : "4 Apr",
      tasks: tasks.filter((t) => t.timelineDate?.includes("فروردین")),
      color: "bg-amber-400 text-slate-900 ring-amber-200 dark:ring-amber-900/50",
    },
  ];

  // Default active milestone is the 18th (matching reference UI yellow card) or the milestone of selected task
  const [activeDateKey, setActiveDateKey] = useState<string>("18-mar");

  const currentMilestone =
    milestones.find((m) => m.dateKey === activeDateKey) || milestones[5];

  const highlightedTask =
    currentMilestone.tasks.length > 0 ? currentMilestone.tasks[0] : null;

  const navigateMilestone = (direction: "prev" | "next") => {
    const currentIndex = milestones.findIndex((m) => m.dateKey === activeDateKey);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === "next"
        ? Math.min(milestones.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
    setActiveDateKey(milestones[nextIndex].dateKey);
  };

  return (
    <div className="w-full bg-white dark:bg-card/70 border border-border/60 rounded-2xl p-4 sm:p-5 shadow-xs fa-num flex flex-col gap-3 relative overflow-visible">
      {/* ── Top Bar Controls: Navigation Arrows + Overview ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateMilestone("prev")}
            className="size-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label={t("prev")}
          >
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            <span>{t("title")}</span>
          </span>
          <button
            type="button"
            onClick={() => navigateMilestone("next")}
            className="size-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label={t("next")}
          >
            {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </div>

        {/* Milestone Quick Jump Notice */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span>
            {t("milestoneNotice", {
              date: currentMilestone.dateLabel,
            })}
          </span>
        </div>
      </div>

      {/* ── Active Milestone Floating Card (matching reference image) ── */}
      {highlightedTask && (
        <div
          onClick={() => onSelectTask(highlightedTask)}
          className="self-center sm:self-auto sm:ms-auto w-full max-w-sm p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 shadow-xs cursor-pointer hover:border-amber-300 transition-colors flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 line-clamp-1">
                {highlightedTask.title}
              </span>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                {highlightedTask.progressPercent || 0}% {t("completed")}
              </span>
            </div>
            <ArrowUpRight className="size-3.5 text-amber-700 dark:text-amber-300 rtl:rotate-90 shrink-0" />
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-amber-200/70 dark:bg-amber-900/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${highlightedTask.progressPercent || 0}%` }}
            />
          </div>

          {/* Card footer: priority + avatars */}
          <div className="flex items-center justify-between text-[10px] text-amber-800 dark:text-amber-300 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="size-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                <CheckCircle2 className="size-2.5" />
              </span>
              <ChevronsUp className="size-3.5 text-rose-500" />
              {highlightedTask.company && (
                <span className="px-1.5 py-0.2 rounded bg-amber-200/50 dark:bg-amber-900/50 text-[9px] font-semibold">
                  {highlightedTask.company}
                </span>
              )}
            </div>

            {/* Overlapping Collaborators stack */}
            <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
              {highlightedTask.assignees?.slice(0, 2).map((a, idx) => (
                <Avatar
                  key={a.id || idx}
                  className="size-5 border border-white dark:border-card shrink-0"
                >
                  <AvatarFallback className="text-[8px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold">
                    {a.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {(highlightedTask.assignees?.length || 0) > 2 && (
                <div className="size-5 rounded-full bg-amber-300 dark:bg-amber-700 text-amber-950 dark:text-amber-100 text-[8px] font-bold flex items-center justify-center border border-white dark:border-card">
                  +{highlightedTask.assignees.length - 2}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Timeline Axis with Nodes and Dates ── */}
      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div className="min-w-[680px] w-full flex flex-col relative px-4">
          {/* Top Date labels row */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground pb-2">
            {milestones.map((m) => (
              <div
                key={m.dateKey}
                className={cn(
                  "text-center transition-colors cursor-pointer",
                  activeDateKey === m.dateKey
                    ? "text-foreground font-bold"
                    : "hover:text-foreground"
                )}
                onClick={() => {
                  setActiveDateKey(m.dateKey);
                  if (m.tasks.length > 0) onSelectTask(m.tasks[0]);
                }}
              >
                {m.dateLabel}
              </div>
            ))}
          </div>

          {/* Central Horizontal Axis Line */}
          <div className="relative h-10 flex items-center justify-between">
            {/* Background line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border/80" />

            {/* Ticks & Milestone Circles */}
            {milestones.map((m) => {
              const isActive = activeDateKey === m.dateKey;
              const hasTask = m.tasks.length > 0;

              return (
                <div
                  key={m.dateKey}
                  className="relative z-10 flex flex-col items-center justify-center"
                >
                  {/* Today Pill Pin Marker */}
                  {m.isToday && (
                    <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[9px] font-bold shadow-2xs whitespace-nowrap flex items-center gap-1">
                      <span>{t("today")}</span>
                    </div>
                  )}

                  {/* Node Circle */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDateKey(m.dateKey);
                      if (hasTask) onSelectTask(m.tasks[0]);
                    }}
                    className={cn(
                      "size-6 sm:size-6.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs transition-all duration-150 cursor-pointer ring-2",
                      m.color,
                      isActive
                        ? "scale-115 ring-4 ring-primary/40 ring-offset-1"
                        : "hover:opacity-90"
                    )}
                    aria-label={m.dateLabel}
                  >
                    {m.dayNumber}
                  </button>

                  {/* Weekday Label */}
                  <span className="text-[10px] text-muted-foreground/80 mt-1 font-medium">
                    {m.weekdayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
