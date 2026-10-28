// src/modules/projects/components/project-widget.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  FolderKanban,
  Building2,
  ArrowUpRight,
  Plus,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useRouter } from "@/i18n/navigation";
import { useProjects } from "../hooks/use-projects";
import { ProjectStatus } from "../types/projects.types";
import { cn } from "@/lib/utils";

type ProjectFilterTab = "all" | "active" | "export" | "internal" | "rd" | "completed";

export function ProjectWidget() {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const router = useRouter();
  const { projects, isLoading, stats } = useProjects();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<ProjectFilterTab>("all");

  const displayedProjects = useMemo(() => {
    let list = projects;
    if (filterTab === "active") {
      list = list.filter((p) => p.status !== "completed" && p.status !== "on_hold");
    } else if (filterTab === "export") {
      list = list.filter((p) => p.projectType === "export");
    } else if (filterTab === "internal") {
      list = list.filter((p) => p.projectType === "internal");
    } else if (filterTab === "rd") {
      list = list.filter((p) => p.projectType === "rd");
    } else if (filterTab === "completed") {
      list = list.filter((p) => p.status === "completed");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q) ||
          (p.organization && p.organization.toLowerCase().includes(q))
      );
    }
    return list;
  }, [projects, filterTab, searchQuery]);

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "fabrication":
      case "qc_testing":
      case "detailed_engineering":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "tendering":
      case "basic_engineering":
      case "procurement":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "on_hold":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 fa-num bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4 @container">
      {/* ── Widget Header ── */}
      <div className="flex items-center justify-between gap-2 px-1 mb-3 pe-18 sm:pe-20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl shrink-0 text-primary">
            <FolderKanban className="size-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm sm:text-base text-foreground/90 shrink-0">
              {t("widget.title")}
            </h3>
            <span className="text-[10px] text-muted-foreground">
              {stats.active} {t("widget.activeProjects")} • {t("widget.avgProgress")} {stats.avgProgress}%
            </span>
          </div>
        </div>

        {/* Link to Full Project Management Page */}
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors border border-primary/20 shrink-0"
        >
          <span>{t("widget.manageAll")}</span>
          <ArrowUpRight className="size-3.5 rtl:rotate-270" />
        </Link>
      </div>

      {/* ── Compact Filter Pills ── */}
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("widget.filterAll")} ({stats.total})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("active")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "active"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("widget.filterActive")} ({stats.active})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("export")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "export"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("widget.filterExport")} ({stats.exportCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("internal")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "internal"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("widget.filterInternal")} ({stats.internalCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("rd")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "rd"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("widget.filterRd")} ({stats.rdCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("completed")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "completed"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          {t("widget.filterCompleted")} ({stats.completed})
        </button>
      </div>

      {/* ── Quick Search & Action Bar ── */}
      <div className="mb-3 flex items-center gap-1.5">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("widget.quickSearch")}
            className="h-8.5 text-xs rounded-xl bg-muted/20 border-border/60 pe-8 ps-8"
          />
          <Search className="size-3.5 text-muted-foreground absolute top-1/2 -translate-y-1/2 ps-1 start-2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 -translate-y-1/2 end-2 size-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
        <Button
          asChild
          size="sm"
          className="h-8.5 px-3 rounded-xl gap-1 text-xs font-medium cursor-pointer shadow-2xs shrink-0"
        >
          <Link href="/dashboard/projects?new=true">
            <Plus className="size-3.5" />
            <span>{t("widget.newProject")}</span>
          </Link>
        </Button>
      </div>

      {/* ── Scrollable Projects List / Grid ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pe-1 min-h-[160px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground/60 py-8">
            در حال بارگذاری پروژه‌ها...
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-muted-foreground/60 select-none py-8 gap-2">
            <FolderKanban className="size-8 text-muted-foreground/30" />
            <span>{t("widget.empty")}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-2.5">
            {displayedProjects.map((project) => {
              const isCompleted = project.status === "completed";

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/dashboard/projects?id=${project.id}`)}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-colors cursor-pointer shadow-2xs group select-none",
                    isCompleted
                      ? "bg-muted/20 border-border/30 opacity-75"
                      : "bg-white/80 dark:bg-card/70 border-border/50 hover:border-primary/40 hover:bg-white dark:hover:bg-card"
                  )}
                >
                  {/* Top Line: Title & Org Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </div>
                    {project.organization && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 border-primary/20 text-primary font-normal shrink-0"
                      >
                        {project.organization}
                      </Badge>
                    )}
                  </div>

                  {/* Client & Code */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <Building2 className="size-3 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{project.clientName}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                      {project.code}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{t("widget.progress")}</span>
                      <span className="font-semibold text-foreground fa-num">
                        %{project.progressPercent}
                      </span>
                    </div>
                    <Progress value={project.progressPercent} className="h-1.5" />
                  </div>

                  {/* Footer: Status badge & Enter workspace action */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded font-medium border",
                        getStatusBadgeClass(project.status)
                      )}
                    >
                      {t(`statuses.${project.status}`)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-primary group-hover:underline">
                      <span>{t("widget.enterWorkspace")}</span>
                      <ArrowUpRight className="size-3 rtl:rotate-270" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
