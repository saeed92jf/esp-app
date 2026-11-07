// src/modules/projects/components/project-widget.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  FolderKanban,
  Building2,
  ArrowUpRight,
  Plus,
  Search,
  X,
  User,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { simplifiedProjectsService } from "../services/simplified-projects.service";
import type { SimplifiedProject, ProjectStatus } from "../types/simplified-projects.types";
import { cn } from "@/lib/utils";

type ProjectFilterTab = "all" | "my" | "in_progress" | "review" | "done";

export function ProjectWidget() {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [projects, setProjects] = useState<SimplifiedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<ProjectFilterTab>("all");

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await simplifiedProjectsService.getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error("Failed to load projects in ProjectWidget:", err);
      setError(err?.message || "خطا در دریافت پروژه‌ها");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    const handleSync = () => {
      fetchProjects();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("esp_projects_change", handleSync);
      window.addEventListener("storage", handleSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("esp_projects_change", handleSync);
        window.removeEventListener("storage", handleSync);
      }
    };
  }, [fetchProjects]);

  // Check if a project is managed by or assigned to the current user
  const isUserProject = useCallback(
    (p: SimplifiedProject) => {
      if (!user) return false;
      const uid = String(user.id || "").toLowerCase();
      const uNameFa = (user.fullNameFa || "").toLowerCase();
      const uName = (user.fullName || "").toLowerCase();
      const mId = String(p.managerId || "").toLowerCase();
      const mName = String(p.managerName || "").toLowerCase();

      return (
        (mId && mId === uid) ||
        (uNameFa && mName.includes(uNameFa)) ||
        (uName && mName.includes(uName))
      );
    },
    [user]
  );

  // Compute live statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === "in_progress").length;
    const review = projects.filter((p) => p.status === "review").length;
    const done = projects.filter((p) => p.status === "done").length;
    const myCount = projects.filter(isUserProject).length;
    const totalProgress = projects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0);
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return {
      total,
      active: inProgress + review,
      inProgress,
      review,
      done,
      myCount,
      avgProgress,
    };
  }, [projects, isUserProject]);

  // Filtered and searched projects
  const displayedProjects = useMemo(() => {
    let list = projects;

    if (filterTab === "my") {
      list = list.filter(isUserProject);
    } else if (filterTab === "in_progress") {
      list = list.filter((p) => p.status === "in_progress");
    } else if (filterTab === "review") {
      list = list.filter((p) => p.status === "review");
    } else if (filterTab === "done") {
      list = list.filter((p) => p.status === "done");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.espNumber.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.managerName && p.managerName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [projects, filterTab, searchQuery, isUserProject]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "done":
        return {
          label: "تکمیل شده",
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "review":
        return {
          label: "در حال بازبینی",
          className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
          icon: FileCheck2,
        };
      case "in_progress":
        return {
          label: "در حال اجرا",
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          icon: Clock,
        };
      case "on_hold":
        return {
          label: "متوقف شده",
          className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          icon: AlertCircle,
        };
      case "todo":
      default:
        return {
          label: "شروع نشده",
          className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
          icon: Clock,
        };
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

        {/* Link to Full Projects Page */}
        <Link
          href="/projects"
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
          onClick={() => setFilterTab("my")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "my"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          پروژه‌های من ({stats.myCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("in_progress")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "in_progress"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          در حال اجرا ({stats.inProgress})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("review")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "review"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          بازبینی ({stats.review})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("done")}
          className={cn(
            "px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border shrink-0",
            filterTab === "done"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
          )}
        >
          تکمیل‌شده ({stats.done})
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

        {isAdmin && (
          <Button
            asChild
            size="sm"
            className="h-8.5 px-3 rounded-xl gap-1 text-xs font-medium cursor-pointer shadow-2xs shrink-0"
          >
            <Link href="/projects?new=true">
              <Plus className="size-3.5" />
              <span>{t("widget.newProject")}</span>
            </Link>
          </Button>
        )}
      </div>

      {/* ── Scrollable Projects List / Grid ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pe-1 min-h-[160px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground/60 py-8 gap-2">
            <RefreshCw className="size-4 animate-spin text-primary" />
            <span>در حال بارگذاری پروژه‌ها...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-rose-500 py-8 gap-2">
            <AlertCircle className="size-6 text-rose-500" />
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              className="text-xs h-7 rounded-lg mt-1"
            >
              تلاش مجدد
            </Button>
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-muted-foreground/60 select-none py-8 gap-2">
            <FolderKanban className="size-8 text-muted-foreground/30" />
            <span>{t("widget.empty")}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-2.5">
            {displayedProjects.map((project) => {
              const isCompleted = project.status === "done";
              const statusMeta = getStatusBadge(project.status);

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects?id=${project.id}`)}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all duration-150 cursor-pointer shadow-2xs group select-none",
                    isCompleted
                      ? "bg-muted/20 border-border/30 opacity-80"
                      : "bg-white/80 dark:bg-card/70 border-border/50 hover:border-primary/40 hover:bg-white dark:hover:bg-card hover:shadow-xs"
                  )}
                >
                  {/* Top Line: Title & Category Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {project.name}
                    </div>
                    {project.category && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 border-primary/20 text-primary font-normal shrink-0"
                      >
                        {project.category}
                      </Badge>
                    )}
                  </div>

                  {/* Client & Code */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <Building2 className="size-3 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{project.client}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground/90 bg-muted/40 px-1.5 py-0.5 rounded border border-border/40 shrink-0 font-medium">
                      {project.espNumber}
                    </span>
                  </div>

                  {/* Manager Name */}
                  {project.managerName && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                      <User className="size-2.5 shrink-0" />
                      <span className="truncate">{project.managerName}</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground text-[10px]">پیشرفت فیزیکی</span>
                      <span className="font-semibold text-foreground fa-num text-xs">
                        %{project.progressPercentage}
                      </span>
                    </div>
                    <Progress value={project.progressPercentage} className="h-1.5" />
                  </div>

                  {/* Footer: Status badge & Enter workspace action */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded font-medium border flex items-center gap-1",
                        statusMeta.className
                      )}
                    >
                      <span>{statusMeta.label}</span>
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
