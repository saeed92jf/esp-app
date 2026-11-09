// src/modules/projects/components/simplified/ProjectRoadmapView.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import {
  Clock,
  UserCheck,
  Building2,
  Paperclip,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPersonName } from "@/lib/person-names";
import type {
  SimplifiedProject,
  ProjectCategory,
  ProjectStatus,
} from "../../types/simplified-projects.types";
import { ProjectCategoryBadge } from "./ProjectCategoryBadge";

interface ProjectRoadmapViewProps {
  projects: SimplifiedProject[];
  onSelectProject: (project: SimplifiedProject) => void;
  onCreateNewClick: () => void;
}

const KANBAN_COLUMNS: {
  key: ProjectStatus;
  labelFa: string;
  labelEn: string;
  color: string;
  headerColor: string;
  dot: string;
}[] = [
  {
    key: "todo",
    labelFa: "برای شروع و برنامه‌ریزی",
    labelEn: "To Start",
    color: "border-slate-300 bg-slate-50/70 dark:bg-slate-900/30",
    headerColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  {
    key: "in_progress",
    labelFa: "در حال مهندسی و ساخت",
    labelEn: "In Progress",
    color: "border-amber-300 bg-amber-50/50 dark:bg-amber-900/10",
    headerColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  {
    key: "review",
    labelFa: "بازبینی و تاییدیه کارفرما",
    labelEn: "Review & Approval",
    color: "border-pink-300 bg-pink-50/50 dark:bg-pink-900/10",
    headerColor: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  {
    key: "done",
    labelFa: "تکمیل و تحویل نهایی",
    labelEn: "Completed",
    color: "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10",
    headerColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
];

export function ProjectRoadmapView({
  projects,
  onSelectProject,
  onCreateNewClick,
}: ProjectRoadmapViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const hay = [
          p.name,
          p.espNumber,
          p.client,
          p.service,
          p.managerName,
          p.category,
          ...(p.projectTypes || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [projects, search, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      inProgress: projects.filter((p) => p.status === "in_progress").length,
      review: projects.filter((p) => p.status === "review").length,
      done: projects.filter((p) => p.status === "done").length,
    };
  }, [projects]);

  return (
    <div className="space-y-8">
      {/* ── 1. Top Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-2xs">
          <span className="text-xs text-muted-foreground block">{isRtl ? "کل پروژه‌ها" : "Total Projects"}</span>
          <p className="text-2xl font-extrabold text-foreground mt-1 fa-num">{stats.total}</p>
        </div>
        <div className="bg-card rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-2xs">
          <span className="text-xs text-amber-600 dark:text-amber-400 block font-semibold">
            {isRtl ? "در حال مهندسی و ساخت" : "In Progress"}
          </span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 fa-num">
            {stats.inProgress}
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4 shadow-2xs">
          <span className="text-xs text-pink-600 dark:text-pink-400 block font-semibold">
            {isRtl ? "در انتظار تایید کارفرما" : "Under Review"}
          </span>
          <p className="text-2xl font-extrabold text-pink-600 dark:text-pink-400 mt-1 fa-num">
            {stats.review}
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-2xs">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">
            {isRtl ? "تکمیل و تحویل‌شده" : "Completed"}
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 fa-num">
            {stats.done}
          </p>
        </div>
      </div>

      {/* ── 2. Visual High-Level Roadmap Section (نقشه راه کلی) ── */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <span>{isRtl ? "نقشه راه کلی پروژه‌ها (Overall Roadmap)" : "Overall Project Roadmap"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "موقعیت زمانی پروژه‌های جاری در فازهای ۵ گانه (مهندسی ➔ DFA ➔ تایید کارفرما ➔ ساخت ➔ بارگیری)"
                : "Current stage of each contract across the 5 project execution phases"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRtl ? "جستجوی پروژه، کارفرما..." : "Search projects..."}
                className="ps-9 h-9 text-xs rounded-xl bg-background"
              />
            </div>
          </div>
        </div>

        {/* Phase Header Labels */}
        <div className="hidden lg:grid grid-cols-5 gap-2 px-4 py-2 bg-muted/30 rounded-xl text-center text-[11px] font-bold text-muted-foreground">
          <span>{isRtl ? "۱. مهندسی (Engineering)" : "1. Engineering"}</span>
          <span>{isRtl ? "۲. نقشه‌های ارسالی (DFA)" : "2. Drawing for Approval (DFA)"}</span>
          <span>{isRtl ? "۳. تاییدیه کارفرما (Approval)" : "3. Customer Approval"}</span>
          <span>{isRtl ? "۴. تامین و ساخت (Fabrication)" : "4. Procurement & Fabrication"}</span>
          <span>{isRtl ? "۵. بسته‌بندی و بارگیری (Loading)" : "5. Packaging & Loading"}</span>
        </div>

        {/* Project Roadmap Rows */}
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              {isRtl ? "پروژه‌ای برای نمایش یافت نشد." : "No projects found."}
            </div>
          ) : (
            filteredProjects.map((p) => {
              const phasesList = p.schedule?.phases || [];
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="p-4 rounded-2xl border border-border/60 bg-background hover:bg-muted/30 transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:border-primary/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <ProjectCategoryBadge category={p.category} size="sm" />
                      <h4 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                        {p.name}
                      </h4>
                      <span className="font-mono text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60">
                        {p.espNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Building2 className="size-3.5 text-primary" />
                        <span>{p.client}</span>
                      </span>
                      <span>•</span>
                      <span className="fa-num font-semibold text-primary">
                        {p.schedule?.totalDays || 0} {isRtl ? "روز" : "days"}
                      </span>
                    </div>
                  </div>

                  {/* 5-Phase Horizontal Stepper Tracker */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-1">
                    {phasesList.map((ph, idx) => {
                      const isCompleted = ph.status === "completed" || ph.progress === 100;
                      const isInProgress = ph.status === "in_progress" || (ph.progress > 0 && ph.progress < 100);
                      return (
                        <div
                          key={ph.id || idx}
                          className={cn(
                            "p-2 rounded-xl text-center border transition-all text-xs flex flex-col justify-center",
                            isCompleted
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold"
                              : isInProgress
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/20"
                              : "bg-muted/20 border-border/40 text-muted-foreground"
                          )}
                        >
                          <span className="text-[11px] truncate leading-tight">{ph.title.split("(")[0]}</span>
                          <span className="text-[10px] font-mono fa-num opacity-80 mt-0.5">
                            {ph.durationDays} {isRtl ? "روز" : "d"}
                            {isInProgress && ` (${ph.progress}%)`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 3. Kanban Board of Projects ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isRtl ? "تخته کانبان پروژه‌ها" : "Projects Kanban Board"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl ? "دسته‌بندی پروژه‌ها بر اساس وضعیت گردش کار" : "Grouped by workflow execution status"}
            </p>
          </div>

          <Button
            onClick={onCreateNewClick}
            size="sm"
            className="rounded-xl gap-1.5 font-bold h-9 bg-primary text-white"
          >
            <span>{isRtl ? "ایجاد پروژه جدید" : "New Project"}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((col) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.key);
            return (
              <div
                key={col.key}
                className={cn("rounded-2xl border-2 overflow-hidden flex flex-col", col.color)}
              >
                {/* Column header */}
                <div className={cn("px-4 py-3 flex items-center justify-between", col.headerColor)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", col.dot)} />
                    <span className="text-sm font-bold">
                      {isRtl ? col.labelFa : col.labelEn}
                    </span>
                  </div>
                  <span className="text-xs font-bold fa-num">{colProjects.length}</span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-2.5 min-h-[200px] flex-1">
                  {colProjects.length === 0 ? (
                    <div className="flex items-center justify-center h-28 text-xs text-muted-foreground">
                      {isRtl ? "پروژه‌ای در این مرحله نیست" : "No projects"}
                    </div>
                  ) : (
                    colProjects.map((p) => (
                      <motion.div
                        key={p.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => onSelectProject(p)}
                        className="bg-card rounded-xl border border-border/50 p-3.5 cursor-pointer hover:shadow-sm transition-all space-y-2.5 select-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <ProjectCategoryBadge category={p.category} size="sm" />
                          <span className="text-[11px] font-mono font-bold text-muted-foreground">
                            {p.espNumber}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                          {p.name}
                        </h4>

                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                          <Building2 className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">{p.client}</span>
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <UserCheck className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{formatPersonName(p.managerName, locale)}</span>
                          </span>

                          {p.documents && p.documents.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-primary font-bold fa-num">
                              <Paperclip className="size-3" />
                              <span>{p.documents.length}</span>
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

