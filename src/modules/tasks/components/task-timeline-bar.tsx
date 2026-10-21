// src/modules/tasks/components/task-timeline-bar.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  Search,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Timer,
  ChevronDown,
  PieChart,
  Users as UsersIcon,
  BarChart3,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TaskItem, TaskPriority, TaskStatus, CompanyName } from "../types/tasks.types";
import { getJalaliDate } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { matchesSmartSearch, HighlightMatch } from "../utils/task-search";
import {
  segmentedAccordionMotion,
  getSegmentedAccordionHeaderClass,
} from "@/lib/animations/segmented-accordion";

export interface TaskRoadmapAnalyticsProps {
  tasks: TaskItem[];
  selectedTaskId?: string | null;
  onSelectTask: (task: TaskItem) => void;
  searchQuery?: string;
  allAssignees?: { name: string; role: string; avatar?: string; company?: CompanyName }[];
  userInvolvedProjects?: { id: string; title: string; organization: string; code: string; progressPercent: number }[];
  isAdmin?: boolean;
  roleMode?: "admin" | "user";
}

// Keep backward compatible alias
export type TaskTimelineBarProps = TaskRoadmapAnalyticsProps;

type TimelineHorizon = "all" | "overdue" | "this_week" | "this_month" | "upcoming" | "completed";

// Calculate day difference relative to today (supports both Jalali e.g. 1403/08/15 and Gregorian dates)
function getDaysDifference(dueDateStr?: string): number | null {
  if (!dueDateStr || !dueDateStr.trim()) return null;

  const parts = dueDateStr.split(/[\/\-]/).map((p) => parseInt(p.trim(), 10));
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return null;
  }

  const [y, m, d] = parts;
  const now = new Date();

  // If year < 1600, it's Jalali
  if (y < 1600) {
    const nowJ = getJalaliDate(now);
    const targetDays = y * 365.25 + (m <= 6 ? m * 31 : 6 * 31 + (m - 6) * 30) + d;
    const nowDays = nowJ.year * 365.25 + (nowJ.month <= 6 ? nowJ.month * 31 : 6 * 31 + (nowJ.month - 6) * 30) + nowJ.day;
    return Math.round(targetDays - nowDays);
  }

  // Otherwise Gregorian
  const targetDate = new Date(y, m - 1, d);
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((targetDate.getTime() - nowStart.getTime()) / (1000 * 60 * 60 * 24));
}

export function TaskRoadmapAnalytics({
  tasks,
  selectedTaskId,
  onSelectTask,
  searchQuery = "",
  allAssignees = [],
  userInvolvedProjects = [],
  isAdmin = true,
  roleMode = "admin",
}: TaskRoadmapAnalyticsProps) {
  const t = useTranslations("Tasks.timeline");
  const tTasks = useTranslations("Tasks");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeHorizon, setActiveHorizon] = useState<TimelineHorizon>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "personal" | "team">("all");
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isWorkloadOpen, setIsWorkloadOpen] = useState(true);

  // ────────────────────────────────────────────────────────────
  // 1. STATISTICAL CALCULATIONS ACROSS ALL ACCESSIBLE TASKS
  // ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const review = tasks.filter((t) => t.status === "review").length;
    const pending = tasks.filter((t) => t.status === "pending").length;

    let overdueCount = 0;
    let dueThisWeekCount = 0;
    let upcomingCount = 0;
    let noDeadlineCount = 0;
    let totalEstimated = 0;
    let totalLogged = 0;

    tasks.forEach((task) => {
      if (task.estimatedHours) totalEstimated += task.estimatedHours;
      if (task.loggedHours) totalLogged += task.loggedHours;

      if (task.status === "completed") return;

      const diff = getDaysDifference(task.dueDate);
      if (diff === null) {
        noDeadlineCount++;
      } else if (diff < 0) {
        overdueCount++;
      } else if (diff <= 7) {
        dueThisWeekCount++;
      } else {
        upcomingCount++;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const hoursRate = totalEstimated > 0 ? Math.round((totalLogged / totalEstimated) * 100) : 0;

    const urgentCount = tasks.filter((t) => t.priority === "urgent").length;
    const highCount = tasks.filter((t) => t.priority === "high").length;
    const mediumCount = tasks.filter((t) => t.priority === "medium").length;
    const lowCount = tasks.filter((t) => t.priority === "low").length;

    return {
      total,
      completed,
      inProgress,
      review,
      pending,
      overdueCount,
      dueThisWeekCount,
      upcomingCount,
      noDeadlineCount,
      completionRate,
      totalEstimated,
      totalLogged,
      hoursRate,
      urgentCount,
      highCount,
      mediumCount,
      lowCount,
    };
  }, [tasks]);

  // Fallback assignees derived from tasks if not provided
  const specialists = useMemo(() => {
    if (allAssignees && allAssignees.length > 0) return allAssignees;
    const set = new Map<string, { name: string; role: string }>();
    tasks.forEach((t) => {
      if (t.assignedToName) {
        set.set(t.assignedToName, { name: t.assignedToName, role: t.assignedToRole || "Specialist" });
      }
      t.assignees?.forEach((a) => {
        set.set(a.name, { name: a.name, role: a.role });
      });
    });
    return Array.from(set.values());
  }, [allAssignees, tasks]);

  // ────────────────────────────────────────────────────────────
  // 2. FILTER TASKS BY HORIZON, COMPANY, SCOPE, AND SEARCH
  // ────────────────────────────────────────────────────────────
  const filteredTimelineTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Company filter
      if (companyFilter !== "all" && task.company !== companyFilter) return false;

      // Scope filter
      if (scopeFilter === "personal" && !task.isPersonal && task.scope !== "personal") return false;
      if (scopeFilter === "team" && (task.isPersonal || task.scope === "personal")) return false;

      // Horizon filter
      const diff = getDaysDifference(task.dueDate);
      if (activeHorizon === "completed") {
        if (task.status !== "completed") return false;
      } else if (activeHorizon === "overdue") {
        if (task.status === "completed" || diff === null || diff >= 0) return false;
      } else if (activeHorizon === "this_week") {
        if (task.status === "completed" || diff === null || diff < 0 || diff > 7) return false;
      } else if (activeHorizon === "this_month") {
        if (task.status === "completed" || diff === null || diff < 0 || diff > 30) return false;
      } else if (activeHorizon === "upcoming") {
        if (task.status === "completed" || diff === null || diff <= 7) return false;
      }

      // Search query
      const currentQuery = (localSearch || searchQuery).trim();
      if (currentQuery) {
        const candidateFields = [
          task.title,
          task.description,
          task.category,
          task.assignedToName,
          task.company,
        ];
        if (!matchesSmartSearch(candidateFields, currentQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, companyFilter, scopeFilter, activeHorizon, localSearch, searchQuery]);

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "low":
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  const getCompanyColor = (company?: string) => {
    if (company?.includes("یورو اسلات") || company?.includes("Euroslot")) {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
    }
    if (company?.includes("نانو پالایش") || company?.includes("Nano")) {
      return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30";
    }
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
  };

  return (
    <div className="w-full flex flex-col gap-8 fa-num select-none">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. SECTION 1: EXECUTIVE KPI & PERFORMANCE (Pure Segmented)   */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="segmented-list w-full">
        {/* Item 1 (Header): Overall Progress Bar with large percent & Telemetry */}
        <div className="segmented-item no-hover-bg p-5 sm:p-6 w-full flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight flex items-center gap-2">
                  <span>{t("executiveKpis")}</span>
                  <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/30 text-primary">
                    {t("telemetryLive")}
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("roadmapSubtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 self-start sm:self-auto">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                {stats.completionRate}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({stats.completed} {isRtl ? "از" : "of"} {stats.total} {t("tasksCount")})
              </span>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full bg-muted/60 dark:bg-muted/30 rounded-full h-2.5 overflow-hidden border border-border/30">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Item 2: Status Breakdown Row (Pending, In Progress, Review, Completed) */}
        <div className="segmented-item no-hover-bg p-4 sm:p-5 w-full flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span>{t("statusDistribution")}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {stats.total} {t("tasksCount")}
            </span>
          </div>

          {/* Proportional Segment Bar */}
          <div className="w-full h-2.5 rounded-full bg-muted/50 overflow-hidden flex gap-0.5 p-0.5 border border-border/40">
            {stats.total > 0 ? (
              <>
                <div
                  className="bg-indigo-500 rounded-s-full transition-all"
                  style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                  title={`${tTasks("status.pending")}: ${stats.pending}`}
                />
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                  title={`${tTasks("status.in_progress")}: ${stats.inProgress}`}
                />
                <div
                  className="bg-pink-500 transition-all"
                  style={{ width: `${(stats.review / stats.total) * 100}%` }}
                  title={`${tTasks("status.review")}: ${stats.review}`}
                />
                <div
                  className="bg-emerald-500 rounded-e-full transition-all"
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  title={`${tTasks("status.completed")}: ${stats.completed}`}
                />
              </>
            ) : (
              <div className="w-full bg-muted" />
            )}
          </div>

          {/* Status Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-indigo-500" />
                <span className="text-muted-foreground font-medium">{tTasks("status.pending")}</span>
              </div>
              <span className="font-bold text-foreground">{stats.pending}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground font-medium">{tTasks("status.in_progress")}</span>
              </div>
              <span className="font-bold text-foreground">{stats.inProgress}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-pink-500/5 border border-pink-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-pink-500" />
                <span className="text-muted-foreground font-medium">{tTasks("status.review")}</span>
              </div>
              <span className="font-bold text-foreground">{stats.review}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground font-medium">{tTasks("status.completed")}</span>
              </div>
              <span className="font-bold text-foreground">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Item 3: Deadline Health & Hours Row */}
        <div className="segmented-item no-hover-bg p-4 sm:p-5 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Left: Deadline health indicators */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-amber-500" />
              <span>{t("deliveryHealth")}</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-between">
                <span className="text-[11px] font-semibold">{t("overdue")}</span>
                <span className="font-extrabold text-sm">{stats.overdueCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <span className="text-[11px] font-semibold">{t("dueThisWeek")}</span>
                <span className="font-extrabold text-sm">{stats.dueThisWeekCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-between">
                <span className="text-[11px] font-semibold">{t("upcoming")}</span>
                <span className="font-extrabold text-sm">{stats.upcomingCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="text-[11px] font-semibold">{t("noDeadline")}</span>
                <span className="font-extrabold text-sm">{stats.noDeadlineCount}</span>
              </div>
            </div>
          </div>

          {/* Right: Hours logged vs estimated */}
          <div className="sm:w-72 sm:ps-4 sm:border-s sm:border-border/50 flex flex-col justify-center gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                <Timer className="size-3.5 text-emerald-500" />
                <span>{t("workloadHours")}</span>
              </span>
              <span className="font-extrabold text-foreground">{stats.hoursRate}%</span>
            </div>

            <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden border border-border/30">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.hoursRate)}%` }}
              />
            </div>

            <span className="text-[10px] text-muted-foreground">
              {t("hoursLoggedOfEst", { logged: stats.totalLogged, estimated: stats.totalEstimated })}
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. SECTION 2: TEAM WORKLOAD & PRIORITIES (Pure Segmented)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="segmented-list w-full">
        {/* Accordion Header as segmented-item */}
        <button
          type="button"
          onClick={() => setIsWorkloadOpen(!isWorkloadOpen)}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 px-6 py-4.5 w-full outline-none cursor-pointer text-start",
            getSegmentedAccordionHeaderClass(isWorkloadOpen, { isTopRounded: false })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
            <UsersIcon className="size-5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight truncate">
                {t("workloadAndPriorities")}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {specialists.length} {isRtl ? "کارشناس" : "specialists"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted/80 text-foreground border border-border/40">
                {stats.total} {t("activeTasks")}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <ChevronDown
              className={cn(
                "size-5 text-zinc-900 dark:text-zinc-100 transition-transform duration-300 ease-out",
                isWorkloadOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Collapsible Content with Synchronized Sequenced Exit */}
        <AnimatePresence initial={false}>
          {isWorkloadOpen && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              {/* Item: Priority Distribution */}
              <div className="segmented-item no-hover-bg p-5 sm:p-6 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <PieChart className="size-4 text-primary" />
                    <span>{t("priorityBreakdown")}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: "urgent", label: tTasks("priority.urgent"), color: "bg-rose-500", count: stats.urgentCount },
                    { key: "high", label: tTasks("priority.high"), color: "bg-amber-500", count: stats.highCount },
                    { key: "medium", label: tTasks("priority.medium"), color: "bg-sky-500", count: stats.mediumCount },
                    { key: "low", label: tTasks("priority.low"), color: "bg-slate-400", count: stats.lowCount },
                  ].map((item) => {
                    const percent = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                    return (
                      <div key={item.key} className="p-3 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{item.label}</span>
                          <span className="text-muted-foreground">
                            {item.count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items: Specialists Matrix */}
              {specialists.map((member, index) => {
                const memberTasks = tasks.filter(
                  (t) => t.assignedToName === member.name || t.assignees?.some((a) => a.name === member.name)
                );
                const completedCount = memberTasks.filter((t) => t.status === "completed").length;
                const memberRate = memberTasks.length > 0 ? Math.round((completedCount / memberTasks.length) * 100) : 0;
                const isLast = index === specialists.length - 1;

                return (
                  <div
                    key={member.name}
                    className={cn(
                      "segmented-item no-hover-bg p-4 sm:p-5 w-full flex items-center justify-between flex-wrap gap-3",
                      isLast && "rounded-b-[32px]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border/60">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-bold text-sm text-foreground block">{member.name}</span>
                        <span className="text-[11px] text-muted-foreground">{member.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        {memberTasks.length} {isRtl ? "تسک محوله" : "assigned tasks"}
                      </span>
                      <div className="w-24 sm:w-32 bg-muted/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${memberRate}%` }}
                        />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-2 py-0 border-border/60 font-semibold">
                        {memberRate}% {isRtl ? "تکمیل" : "done"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. SECTION 3: ROADMAP TIMELINE TASK STREAM (Pure Segmented)  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="segmented-list w-full">
        {/* Item 1: Unified Filters & Search Controls */}
        <div className="segmented-item no-hover-bg p-4 sm:p-5 w-full flex flex-col gap-4">
          {/* Top Row: Horizon Pills + Quick Search */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/60 overflow-x-auto no-scrollbar max-w-full">
              {[
                { id: "all", label: t("allHorizons") },
                { id: "overdue", label: `${t("filterOverdue")} (${stats.overdueCount})` },
                { id: "this_week", label: `${t("filterThisWeek")} (${stats.dueThisWeekCount})` },
                { id: "this_month", label: t("filterThisMonth") },
                { id: "upcoming", label: `${t("filterUpcoming")} (${stats.upcomingCount})` },
                { id: "completed", label: `${t("filterDone")} (${stats.completed})` },
              ].map((hz) => {
                const isActive = activeHorizon === hz.id;
                return (
                  <button
                    key={hz.id}
                    type="button"
                    onClick={() => setActiveHorizon(hz.id as TimelineHorizon)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-primary text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                    )}
                  >
                    {hz.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Search with smart highlight */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={isRtl ? "جستجوی زنده در نقشه راه..." : "Filter roadmap tasks..."}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 ps-8 pe-3 text-xs rounded-xl bg-card border-border/70"
              />
            </div>
          </div>

          {/* Bottom Row: Company & Scope Filters */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40 flex-wrap text-xs">
            {/* Company Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground font-semibold me-1">
                {tTasks("company")}:
              </span>
              <button
                type="button"
                onClick={() => setCompanyFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer",
                  companyFilter === "all"
                    ? "bg-primary text-white border-primary font-bold shadow-2xs"
                    : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {isRtl ? "همه" : "All"}
              </button>
              <button
                type="button"
                onClick={() => setCompanyFilter("یورو اسلات پارس")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer flex items-center gap-1.5",
                  companyFilter === "یورو اسلات پارس"
                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-2xs"
                    : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <span className="size-2 rounded-full bg-blue-400" />
                <span>{isRtl ? "یورو اسلات پارس" : "Euroslot"}</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanyFilter("نانو پالایش سرام")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer flex items-center gap-1.5",
                  companyFilter === "نانو پالایش سرام"
                    ? "bg-teal-600 text-white border-teal-600 font-bold shadow-2xs"
                    : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <span className="size-2 rounded-full bg-teal-400" />
                <span>{isRtl ? "نانو پالایش سرام" : "Nano Ceram"}</span>
              </button>
            </div>

            {/* Scope Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-semibold me-1">
                {isRtl ? "نوع تسک:" : "Scope:"}
              </span>
              <button
                type="button"
                onClick={() => setScopeFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer",
                  scopeFilter === "all"
                    ? "bg-primary text-white border-primary font-bold shadow-2xs"
                    : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {t("allScopes")}
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("personal")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer",
                  scopeFilter === "personal"
                    ? "bg-primary text-white border-primary font-bold shadow-2xs"
                    : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {t("myTasks")}
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("team")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer",
                  scopeFilter === "team"
                    ? "bg-primary text-white border-primary font-bold shadow-2xs"
                    : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {t("teamTasks")}
              </button>
            </div>
          </div>
        </div>

        {/* Items 2..N: Roadmap Tasks Stream as authentic segmented-items */}
        {filteredTimelineTasks.length === 0 ? (
          <div className="segmented-item no-hover-bg p-12 text-center text-xs text-muted-foreground space-y-2 rounded-b-[32px]">
            <Calendar className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-sm text-foreground/80">{t("emptyState")}</p>
            <p className="text-xs text-muted-foreground">
              {isRtl ? "فیلترهای زمانی یا جستجو را تغییر دهید." : "Try adjusting your filters or search term."}
            </p>
          </div>
        ) : (
          filteredTimelineTasks.map((task, index) => {
            const diff = getDaysDifference(task.dueDate);
            const isCompleted = task.status === "completed";
            const isSelected = selectedTaskId === task.id;
            const isLast = index === filteredTimelineTasks.length - 1;

            // Health Pill Text & Color
            let healthLabel = t("noDeadline");
            let healthClass = "bg-muted text-muted-foreground border-border/50";

            if (isCompleted) {
              healthLabel = isRtl ? "تکمیل شده ✓" : "Completed ✓";
              healthClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
            } else if (diff !== null) {
              if (diff < 0) {
                healthLabel = t("daysOverdue", { days: Math.abs(diff) });
                healthClass = "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold";
              } else if (diff === 0) {
                healthLabel = t("dueToday");
                healthClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold";
              } else if (diff <= 7) {
                healthLabel = t("daysLeft", { days: diff });
                healthClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
              } else {
                healthLabel = t("daysLeft", { days: diff });
                healthClass = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
              }
            }

            const subtasks = task.subtasks || [];
            const completedSubCount = subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={cn(
                  "segmented-item flex flex-col gap-3 p-4 sm:p-5 cursor-pointer relative group",
                  isSelected && "ring-2 ring-primary/40",
                  isLast && "rounded-b-[32px]"
                )}
              >
                {/* Header Row: Badges & Deadlines */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Priority Badge */}
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-lg border",
                        getPriorityBadgeClass(task.priority)
                      )}
                    >
                      {tTasks(`priority.${task.priority}`)}
                    </span>

                    {/* Category Pill */}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border/40">
                      {task.category}
                    </span>

                    {/* Company Pill */}
                    {task.company && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1",
                          getCompanyColor(task.company)
                        )}
                      >
                        <Building2 className="size-2.5" />
                        <span>{task.company}</span>
                      </span>
                    )}

                    {/* Scope Pill */}
                    {task.isPersonal ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        {isRtl ? "شخصی" : "Personal"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {isRtl ? "سازمانی" : "Team"}
                      </span>
                    )}

                    {/* Deadline Health Badge */}
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2.5 py-0.5 rounded-lg border flex items-center gap-1",
                        healthClass
                      )}
                    >
                      {diff !== null && diff < 0 && !isCompleted && (
                        <AlertTriangle className="size-3 text-rose-500 shrink-0" />
                      )}
                      <span>{healthLabel}</span>
                    </span>
                  </div>

                  {/* Dates & Lead Engineer */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    {task.dueDate && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Calendar className="size-3.5 text-primary" />
                        <span className="font-bold text-foreground">{task.dueDate}</span>
                      </span>
                    )}

                    {/* Assignee */}
                    <div className="flex items-center gap-1.5 ps-2 border-s border-border/50">
                      <Avatar className="size-5 border border-border">
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                          {task.assignedToName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-semibold text-foreground truncate max-w-[120px]">
                        {task.assignedToName}
                      </span>
                    </div>

                    <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-90 shrink-0" />
                  </div>
                </div>

                {/* Task Title & Description */}
                <div className="relative z-10">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                    <HighlightMatch text={task.title} query={localSearch || searchQuery} />
                  </h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Progress Track & Subtasks Indicator */}
                <div className="relative z-10 pt-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          task.status === "completed"
                            ? "bg-emerald-500"
                            : task.status === "in_progress"
                            ? "bg-amber-500"
                            : task.status === "review"
                            ? "bg-pink-500"
                            : "bg-indigo-500"
                        )}
                      />
                      <span className="font-semibold text-foreground">
                        {tTasks(`status.${task.status}`)}
                      </span>
                      <span className="text-muted-foreground">
                        ({task.progressPercent || 0}%)
                      </span>
                    </span>

                    {subtasks.length > 0 && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-primary" />
                        <span>
                          {completedSubCount} / {subtasks.length} {isRtl ? "اقدام تکمیل شده" : "subtasks"}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-muted/60 dark:bg-muted/30 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        task.status === "completed"
                          ? "bg-emerald-500"
                          : task.status === "in_progress"
                          ? "bg-amber-500"
                          : task.status === "review"
                          ? "bg-pink-500"
                          : "bg-indigo-500"
                      )}
                      style={{ width: `${Math.max(4, task.progressPercent || 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Backward-compatible export
export const TaskTimelineBar = TaskRoadmapAnalytics;
