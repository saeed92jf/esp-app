// src/modules/tasks/components/task-timeline-bar.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar,
  Layers,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  Flame,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileCheck2,
  Hammer,
  ShieldCheck,
  Search,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskItem, CompanyName } from "../types/tasks.types";
import { cn } from "@/lib/utils";

interface TaskTimelineBarProps {
  tasks: TaskItem[];
  selectedTaskId?: string | null;
  onSelectTask: (task: TaskItem) => void;
  searchQuery?: string;
}

// 6 Core Engineering Lifecycle Phases
const ENGINEERING_PHASES = [
  {
    id: "p1",
    phaseFa: "فاز ۱: دیاگرام P&ID و فرآیند",
    phaseEn: "Phase 1: Process & P&ID",
    icon: Layers,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "p2",
    phaseFa: "فاز ۲: طراحی مکانیک و کد ASME/API",
    phaseEn: "Phase 2: ASME / API Mechanical Design",
    icon: FileCheck2,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
  },
  {
    id: "p3",
    phaseFa: "فاز ۳: ساخت کارگاهی و وِج وایر",
    phaseEn: "Phase 3: Workshop Fabrication & Wedge Wire",
    icon: Hammer,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "p4",
    phaseFa: "فاز ۴: کنترل کیفیت و بازرسی NDT",
    phaseEn: "Phase 4: QC & Non-Destructive Testing (NDT)",
    icon: ShieldCheck,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "p5",
    phaseFa: "فاز ۵: تست هیدرواستاتیک و نشتی",
    phaseEn: "Phase 5: Hydrostatic Pressure & Leak Test",
    icon: Flame,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  },
  {
    id: "p6",
    phaseFa: "فاز ۶: بسته‌بندی، گواهی MTC و تحویل",
    phaseEn: "Phase 6: MTC 3.1 Certification & Dispatch",
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
];

// Helper to highlight matching search term
function HighlightMatch({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <span>{text}</span>;
  const q = query.trim();
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  const before = text.substring(0, index);
  const match = text.substring(index, index + q.length);
  const after = text.substring(index + q.length);

  return (
    <span>
      {before}
      <mark className="bg-amber-300 dark:bg-amber-600/60 text-foreground rounded-xs px-0.5 font-bold">
        {match}
      </mark>
      {after}
    </span>
  );
}

export function TaskTimelineBar({
  tasks,
  selectedTaskId,
  onSelectTask,
  searchQuery = "",
}: TaskTimelineBarProps) {
  const t = useTranslations("Tasks.timeline");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  // Filter tasks to show on the roadmap (focusing on team/corporate tasks with roadmap milestones)
  const roadmapTasks = useMemo(() => {
    return tasks
      .filter((task) => !task.isPersonal && task.scope !== "personal")
      .filter((task) => {
        if (companyFilter !== "all" && task.company !== companyFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const title = isRtl ? task.title : (task.titleEn || task.title);
          const desc = isRtl ? (task.description || "") : (task.descriptionEn || task.description || "");
          const matchTitle = title.toLowerCase().includes(q);
          const matchDesc = desc.toLowerCase().includes(q);
          const matchAssignee = task.assignedToName?.toLowerCase().includes(q);
          const matchComp = task.company?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchAssignee && !matchComp) return false;
        }
        return true;
      });
  }, [tasks, companyFilter, searchQuery, isRtl]);

  // Determine engineering phase based on category or tags
  const getPhaseForTask = (task: TaskItem) => {
    const text = `${task.category} ${task.tags?.join(" ")} ${task.title}`.toLowerCase();
    if (text.includes("p&id") || text.includes("flow") || text.includes("فرآیند")) {
      return ENGINEERING_PHASES[0];
    }
    if (text.includes("asme") || text.includes("طراحی") || text.includes("محاسبات")) {
      return ENGINEERING_PHASES[1];
    }
    if (text.includes("ساخت") || text.includes("اسلات") || text.includes("3d") || text.includes("مدل")) {
      return ENGINEERING_PHASES[2];
    }
    if (text.includes("ndt") || text.includes("بازرسی") || text.includes("qc")) {
      return ENGINEERING_PHASES[3];
    }
    if (text.includes("هیدروتست") || text.includes("فشار") || text.includes("نشتی")) {
      return ENGINEERING_PHASES[4];
    }
    return ENGINEERING_PHASES[5];
  };

  return (
    <div className="w-full flex flex-col gap-5 fa-num">
      {/* ── 1. Timeline Explanation & Mission Statement Box ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/5 via-sky-500/5 to-emerald-500/5 border border-primary/15 dark:border-primary/20 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>
                  {isRtl
                    ? "نقشه راه زمان‌بندی مهندسی و توالی اجرای مایلستون‌ها"
                    : "Engineering Delivery Roadmap & Phase Milestones"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  ASME Sec VIII / API 650
                </span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {isRtl
                  ? "تایم‌لاین دقیقاً نشان‌دهنده ۶ فاز اجرایی استاندارد (طراحی P&ID، محاسبات کد، ساخت کارگاهی، بازرسی NDT، هیدروتست، و تحویل نهایی) برای دو شرکت «یورو اسلات پارس» و «نانو پالایش سرام» است."
                  : "Tracks the 6 standard engineering phases (P&ID Design, ASME Code Calculation, Fabrication, NDT Inspection, Hydro-test, and Final Dispatch) across Euroslot Pars & Nano Palayesh Ceram."}
              </p>
            </div>
          </div>

          {/* Company Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/60 self-start sm:self-auto shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setCompanyFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer",
                companyFilter === "all"
                  ? "bg-primary text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRtl ? "همه شرکت‌ها" : "All Companies"}
            </button>
            <button
              type="button"
              onClick={() => setCompanyFilter("یورو اسلات پارس")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                companyFilter === "یورو اسلات پارس"
                  ? "bg-blue-600 text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="size-2 rounded-full bg-blue-400" />
              <span>{isRtl ? "یورو اسلات پارس" : "Euroslot"}</span>
            </button>
            <button
              type="button"
              onClick={() => setCompanyFilter("نانو پالایش سرام")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                companyFilter === "نانو پالایش سرام"
                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>{isRtl ? "نانو پالایش سرام" : "Nano Ceram"}</span>
            </button>
          </div>
        </div>

        {/* Phase Legend Badges Row */}
        <div className="pt-2 border-t border-border/40 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
          {ENGINEERING_PHASES.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium truncate",
                  p.color
                )}
                title={isRtl ? p.phaseFa : p.phaseEn}
              >
                <Icon className="size-3 shrink-0" />
                <span className="truncate">{isRtl ? p.phaseFa : p.phaseEn}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Multi-Track Gantt Roadmap Rows (Zero Overlapping, Clean Lanes) ── */}
      <div className="flex flex-col gap-3">
        {roadmapTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/60">
            {isRtl
              ? "هیچ تسک سازمانی برای نمایش در این فیلتر زمانی یافت نشد."
              : "No engineering tasks found for the selected timeline filter."}
          </div>
        ) : (
          roadmapTasks.map((task) => {
            const phase = getPhaseForTask(task);
            const isSelected = selectedTaskId === task.id;
            const PhaseIcon = phase.icon;
            const isEuroslot = task.company === "یورو اسلات پارس";

            const displayTitle = isRtl
              ? task.title
              : (task.titleEn || task.title);

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-3 group relative overflow-hidden",
                  isSelected
                    ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30"
                    : "bg-white/80 dark:bg-card/70 border-border/60 hover:border-primary/50 hover:bg-white dark:hover:bg-card shadow-2xs"
                )}
              >
                {/* Top Task Row: Company Tag + Phase + Title + Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Company Pill */}
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
                        isEuroslot
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      <Building2 className="size-2.5" />
                      <span>{task.company}</span>
                    </span>

                    {/* Phase Badge */}
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1",
                        phase.color
                      )}
                    >
                      <PhaseIcon className="size-2.5" />
                      <span>{isRtl ? phase.phaseFa : phase.phaseEn}</span>
                    </span>

                    {/* Status Badge */}
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        task.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : task.status === "in_progress"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : task.status === "review"
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {task.status === "completed"
                        ? isRtl ? "تکمیل شده ✓" : "Completed ✓"
                        : task.status === "in_progress"
                        ? isRtl ? "در حال اقدام" : "In Progress"
                        : task.status === "review"
                        ? isRtl ? "بازبینی مهندسی" : "Review"
                        : isRtl ? "برنامه‌ریزی اولیه" : "Pending"}
                    </span>
                  </div>

                  {/* Dates & Lead Engineer */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="size-3 text-primary" />
                      <span>{task.startDate || "۱۴۰۳/۰۸/۰۱"}</span>
                      <span>←</span>
                      <span className="font-bold text-foreground">{task.dueDate}</span>
                    </span>

                    {/* Responsible Lead Engineer */}
                    <div className="flex items-center gap-1.5 ps-2 border-s border-border/50">
                      <Avatar className="size-5 border border-border">
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                          {task.assignedToName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-medium text-foreground">
                        {task.assignedToName}
                      </span>
                    </div>

                    <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-90 shrink-0" />
                  </div>
                </div>

                {/* Title & Description with Highlight Search */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                    <HighlightMatch text={displayTitle} query={searchQuery} />
                  </h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      <HighlightMatch
                        text={isRtl ? task.description : (task.descriptionEn || task.description)}
                        query={searchQuery}
                      />
                    </p>
                  )}
                </div>

                {/* ── Visual Gantt Duration Track (No text overlapping) ── */}
                <div className="pt-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <span>
                        {isRtl ? "درصد تحقق مایلستون:" : "Milestone Progress:"}{" "}
                        <strong className="text-foreground">{task.progressPercent}%</strong>
                      </span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {task.milestoneLabel || task.timelineDate || task.dueDate}
                    </span>
                  </div>

                  {/* High Quality Styled Progress Lane */}
                  <div className="w-full h-2.5 rounded-full bg-muted/60 dark:bg-muted/30 overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isEuroslot
                          ? "bg-gradient-to-r from-blue-600 to-indigo-500"
                          : "bg-gradient-to-r from-emerald-600 to-teal-500"
                      )}
                      style={{ width: `${Math.max(5, task.progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Subtask Milestones Progress Preview */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-border/30 flex-wrap text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground/80">
                      {isRtl ? "مراحل فرعی تایید شده:" : "Approved Checklist:"}
                    </span>
                    {task.subtasks.map((st) => (
                      <span
                        key={st.id}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px]",
                          st.completed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {st.completed ? <Check className="size-2.5" /> : <Clock className="size-2.5" />}
                        <span>{st.title}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
