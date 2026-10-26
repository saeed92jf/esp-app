// src/modules/projects/components/projects-list-page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useProjects } from "../hooks/use-projects";
import { ProjectItem, ProjectType, ProjectStatus } from "../types/projects.types";
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  Layers,
  Send,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  List as ListIcon,
  LayoutGrid,
  CheckCircle2,
  Globe2,
  Cpu,
  DollarSign,
  TrendingUp,
  X,
  ChevronRight,
  ChevronDown,
  Calendar,
  ShieldCheck,
  UserCheck,
  FileText,
  PieChart,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { ProjectCreateView } from "./project-create-view";
import { cn } from "@/lib/utils";

export type ProjectsListTab = "projects" | "analytics" | "companies" | "settings" | "create";

interface ProjectsListPageProps {
  onSelectProject: (projectId: string) => void;
  activeTab?: ProjectsListTab;
  onTabChange?: (tab: ProjectsListTab) => void;
  isCreateOpen?: boolean;
  onOpenCreateChange?: (open: boolean) => void;
}

export function ProjectsListPage({
  onSelectProject,
  activeTab = "projects",
  onTabChange,
  isCreateOpen: externalIsCreateOpen,
  onOpenCreateChange,
}: ProjectsListPageProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const {
    filteredProjects,
    projects,
    isLoading,
    filters,
    setFilters,
    roleMode,
    setRoleMode,
    currentUserName,
    setCurrentUserName,
    organizations,
    stats,
    createProject,
    refreshProjects,
  } = useProjects();

  const [internalIsCreateOpen, setInternalIsCreateOpen] = useState(false);
  const isCreateOpen = externalIsCreateOpen !== undefined ? externalIsCreateOpen : internalIsCreateOpen;
  const setIsCreateOpen = (open: boolean) => {
    if (onOpenCreateChange) {
      onOpenCreateChange(open);
    } else {
      setInternalIsCreateOpen(open);
    }
  };

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [scopeFilter, setScopeFilter] = useState<"all" | "active" | "export" | "internal" | "rd" | "completed">("all");

  // Filtered projects according to scope filter
  const displayedProjects = useMemo(() => {
    let result = filteredProjects;
    if (scopeFilter === "active") {
      result = result.filter((p) => p.status !== "completed");
    } else if (scopeFilter === "export") {
      result = result.filter((p) => p.projectType === "export");
    } else if (scopeFilter === "internal") {
      result = result.filter((p) => p.projectType === "internal");
    } else if (scopeFilter === "rd") {
      result = result.filter((p) => p.projectType === "rd");
    } else if (scopeFilter === "completed") {
      result = result.filter((p) => p.status === "completed");
    }
    return result;
  }, [filteredProjects, scopeFilter]);

  // Options for Organization Combobox
  const organizationOptions: ComboboxOption[] = useMemo(() => {
    const list: ComboboxOption[] = [
      { value: "all", label: t("allOrganizations") },
    ];
    organizations.forEach((org) => {
      list.push({ value: org, label: org });
    });
    return list;
  }, [organizations, t]);

  // Options for Status Combobox
  const statusOptions: ComboboxOption[] = useMemo(() => [
    { value: "all", label: t("allStatuses") },
    { value: "tendering", label: t("statuses.tendering") },
    { value: "basic_engineering", label: t("statuses.basic_engineering") },
    { value: "detailed_engineering", label: t("statuses.detailed_engineering") },
    { value: "procurement", label: t("statuses.procurement") },
    { value: "fabrication", label: t("statuses.fabrication") },
    { value: "qc_testing", label: t("statuses.qc_testing") },
    { value: "completed", label: t("statuses.completed") },
  ], [t]);

  // Status color resolver
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "completed":
        return {
          label: t("statuses.completed"),
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        };
      case "qc_testing":
        return {
          label: t("statuses.qc_testing"),
          className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
        };
      case "fabrication":
        return {
          label: t("statuses.fabrication"),
          className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        };
      case "procurement":
        return {
          label: t("statuses.procurement"),
          className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
        };
      case "detailed_engineering":
        return {
          label: t("statuses.detailed_engineering"),
          className: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
        };
      case "basic_engineering":
        return {
          label: t("statuses.basic_engineering"),
          className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
        };
      case "tendering":
      default:
        return {
          label: t("statuses.tendering"),
          className: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
        };
    }
  };

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 1: MAIN PROJECTS WORKFLOW & SEGMENTED LIST VIEW         */
  /* ──────────────────────────────────────────────────────────── */
  const renderProjectsView = () => (
    <div className="space-y-4">
      {/* ── 1. Interactive KPI Summary Ribbon ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setScopeFilter("all")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer fa-num",
            scopeFilter === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-card border border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderKanban className="size-3.5" />
          <span>{t("stats.total")}:</span>
          <strong className="font-bold">{stats.total}</strong>
        </button>

        <button
          type="button"
          onClick={() => setScopeFilter("active")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer fa-num",
            scopeFilter === "active"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-card border border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="size-3.5 text-blue-500" />
          <span>{t("stats.active")}:</span>
          <strong className="font-bold">{stats.active}</strong>
        </button>

        <button
          type="button"
          onClick={() => setScopeFilter("export")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer fa-num",
            scopeFilter === "export"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-card border border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe2 className="size-3.5 text-purple-500" />
          <span>{t("stats.export")}:</span>
          <strong className="font-bold">{stats.exportCount}</strong>
        </button>

        <button
          type="button"
          onClick={() => setScopeFilter("internal")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer fa-num",
            scopeFilter === "internal"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-card border border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="size-3.5 text-amber-500" />
          <span>{t("stats.internal")}:</span>
          <strong className="font-bold">{stats.internalCount}</strong>
        </button>

        <button
          type="button"
          onClick={() => setScopeFilter("rd")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer fa-num",
            scopeFilter === "rd"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-card border border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <Cpu className="size-3.5 text-emerald-500" />
          <span>{t("stats.rd")}:</span>
          <strong className="font-bold">{stats.rdCount}</strong>
        </button>

        <div className="ms-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold fa-num">
          <TrendingUp className="size-3.5" />
          <span>{t("stats.avgProgress")}:</span>
          <span>%{stats.avgProgress}</span>
        </div>
      </div>

      {/* ── 2. Top Controls: Search, Filter Pills & View Switcher ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 shadow-xs">
        {/* Left Side: Search & Scope Filter */}
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder={t("search")}
              className="h-10 ps-9 pe-8 text-xs rounded-xl bg-background border-border/70 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters({ search: "" })}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Combobox Dropdowns with RTL support */}
          <div className="w-[170px] shrink-0">
            <Combobox
              options={organizationOptions}
              value={filters.organization}
              onChange={(val) => setFilters({ organization: val })}
              placeholder={t("allOrganizations")}
              size="sm"
              variant="outline"
              allowClear={false}
              className="w-full text-xs rounded-xl"
            />
          </div>

          <div className="w-[150px] shrink-0">
            <Combobox
              options={statusOptions}
              value={filters.status}
              onChange={(val) => setFilters({ status: val as any })}
              placeholder={t("allStatuses")}
              size="sm"
              variant="outline"
              allowClear={false}
              className="w-full text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Right Side: Two-Icon Mode Toggle, Refresh, New Project */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto flex-wrap">
          {/* Segmented List vs Cards Toggle with Animated Sliding Pill */}
          <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/50 relative">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer z-10",
                viewMode === "list" ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
              title={t("views.switchToList")}
              aria-label={t("views.switchToList")}
            >
              {viewMode === "list" && (
                <motion.div
                  layoutId="projectsViewModePill"
                  className="absolute inset-0 rounded-lg bg-primary shadow-xs z-[-1]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <ListIcon className="size-4" />
              <span className="hidden sm:inline">{t("views.switchToList")}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer z-10",
                viewMode === "grid" ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
              title={t("views.switchToGrid")}
              aria-label={t("views.switchToGrid")}
            >
              {viewMode === "grid" && (
                <motion.div
                  layoutId="projectsViewModePill"
                  className="absolute inset-0 rounded-lg bg-primary shadow-xs z-[-1]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <LayoutGrid className="size-4" />
              <span className="hidden sm:inline">{t("views.switchToGrid")}</span>
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={refreshProjects}
            className="size-10 rounded-xl shadow-2xs hover:bg-muted/70 bg-card border-border/60"
            title={isRtl ? "بروزرسانی داده‌ها" : "Refresh"}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          </Button>

          {/* New Project Button */}
          {roleMode === "admin" && (
            <Button
              onClick={() => {
                if (onTabChange) {
                  onTabChange("create");
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="rounded-xl h-10 px-4 text-xs font-semibold gap-2 shadow-2xs cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{t("newProject")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 3. Display Content (Segmented List View or Cards Grid) ── */}
      {displayedProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-12 text-center space-y-3">
          <FolderKanban className="size-12 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-semibold text-base text-foreground">
            {isRtl ? "هیچ پروژه‌ای با این مشخصات یافت نشد" : "No projects found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isRtl
              ? "می‌توانید فیلترهای جستجو را پاک کنید یا یک پروژه مهندسی جدید تعریف نمایید."
              : "You can clear search filters or define a new engineering project."}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="text-xs mt-2 rounded-full cursor-pointer"
            onClick={() => {
              setFilters({
                search: "",
                organization: "all",
                status: "all",
                projectType: "all",
              });
              setScopeFilter("all");
            }}
          >
            {isRtl ? "پاک کردن فیلترها" : "Clear Filters"}
          </Button>
        </div>
      ) : viewMode === "list" ? (
        /* ======================================================== */
        /* SEGMENTED LIST VIEW (Global .segmented-list Pattern)     */
        /* ======================================================== */
        <div className="segmented-list flex flex-col gap-[2px] w-full">
          {displayedProjects.map((project, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === displayedProjects.length - 1;
            const statusBadge = getStatusBadge(project.status);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  "segmented-item group relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 w-full outline-none cursor-pointer select-none transition-colors",
                  isFirst && "rounded-t-[32px]",
                  isLast && "rounded-b-[32px]"
                )}
              >
                {/* 1. Left/Start Section: Icon, Title, Client, Code */}
                <div className="relative z-10 flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="size-11 sm:size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                    <FolderKanban className="size-5 sm:size-6" />
                  </div>

                  <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap w-full">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-md fa-num">
                        {project.code}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {project.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px] py-0 px-2 border-primary/20 text-primary hidden sm:inline-flex">
                        {project.organization}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] py-0 px-2 hidden md:inline-flex">
                        {t(`types.${project.projectType}`)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3 text-muted-foreground/75" />
                        <span>{project.clientName}</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] fa-num">
                        کوتیشن: {project.quotationNumber}
                      </span>
                      <span>•</span>
                      <span className="text-[11px] fa-num">
                        تحویل: {project.targetEndDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Middle Section: Progress & Package Counts */}
                <div className="relative z-10 flex items-center gap-6 shrink-0 flex-wrap lg:flex-nowrap">
                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1 w-32 sm:w-40 shrink-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">پیشرفت فیزیکی:</span>
                      <span className="font-bold text-foreground fa-num">
                        %{project.progressPercent}
                      </span>
                    </div>
                    <Progress value={project.progressPercent} className="h-2 rounded-full" />
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/75 fa-num">
                      <span>برنامه‌ای: %{project.plannedProgressPercent}</span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground fa-num hidden sm:flex">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/40 border border-border/40" title="پکیج‌های WBS">
                      <Layers className="size-3.5 text-primary" />
                      <span>{project.subPackages?.length || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/40 border border-border/40" title="اسناد VDIS">
                      <Send className="size-3.5 text-blue-500" />
                      <span>{project.vdisDocuments?.length || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/40 border border-border/40" title="ریسک‌ها">
                      <AlertTriangle className="size-3.5 text-rose-500" />
                      <span>{project.risks?.length || 0}</span>
                    </span>
                  </div>
                </div>

                {/* 3. Right/End Section: Status Badge & Workspace Action Button */}
                <div className="relative z-10 flex items-center gap-3 shrink-0 justify-between lg:justify-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 fa-num hidden xl:inline-block">
                      {project.budgetAmount}
                    </span>
                    <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-1", statusBadge.className)}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    className="h-8.5 px-3.5 gap-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0 shadow-2xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project.id);
                    }}
                  >
                    <span>{t("openWorkspace")}</span>
                    {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================================================== */
        /* CARDS GRID VIEW                                          */
        /* ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedProjects.map((project) => {
            const statusBadge = getStatusBadge(project.status);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="group relative flex flex-col justify-between gap-4 p-5 rounded-3xl bg-card/70 hover:bg-card border border-border/60 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer select-none"
              >
                <div className="space-y-3.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md fa-num">
                        {project.code}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                        {project.organization}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold", statusBadge.className)}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  {/* Title & Client */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="size-3.5 text-muted-foreground/80 shrink-0" />
                      <span className="truncate">{project.clientName}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs fa-num">
                      <span className="text-muted-foreground">پیشرفت فیزیکی:</span>
                      <span className="font-bold text-foreground">%{project.progressPercent}</span>
                    </div>
                    <Progress value={project.progressPercent} className="h-1.5 rounded-full" />
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground fa-num">
                      <span>برنامه‌ای: %{project.plannedProgressPercent}</span>
                      <span>تحویل: {project.targetEndDate}</span>
                    </div>
                  </div>

                  {/* Budget & Quotation */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs fa-num">
                    <span className="text-muted-foreground">کوتیشن: {project.quotationNumber}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {project.budgetAmount}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground fa-num">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3.5 text-primary" />
                      {project.subPackages?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Send className="size-3.5 text-blue-500" />
                      {project.vdisDocuments?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="size-3.5 text-rose-500" />
                      {project.risks?.length || 0}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="h-8 px-3 gap-1 rounded-full text-xs font-semibold cursor-pointer shadow-2xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project.id);
                    }}
                  >
                    <span>{t("openWorkspace")}</span>
                    {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 2: ROADMAP & ANALYTICS                                  */
  /* ──────────────────────────────────────────────────────────── */
  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              {isRtl ? "شاخص‌های عملکرد کلان سبد پروژه‌ها" : "Portfolio KPI & Performance Analytics"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isRtl
                ? "ارزیابی یکپارچه پیشرفت فیزیکی، توزیع بودجه و نرخ ریسک در پروژه‌های فعال"
                : "Holistic evaluation of progress, budget allocation, and risk rates"}
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
            {stats.total} پروژه ثبت‌شده
          </Badge>
        </div>

        {/* 6-stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 fa-num">
          <div className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-1">
            <span className="text-xs text-muted-foreground block">{t("stats.total")}</span>
            <span className="text-2xl font-bold text-foreground">{stats.total}</span>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-1">
            <span className="text-xs text-muted-foreground block">{t("stats.active")}</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</span>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-1">
            <span className="text-xs text-muted-foreground block">{t("stats.export")}</span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.exportCount}</span>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-1">
            <span className="text-xs text-muted-foreground block">{t("stats.internal")}</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.internalCount}</span>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-1">
            <span className="text-xs text-muted-foreground block">{t("stats.rd")}</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.rdCount}</span>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-1">
            <span className="text-xs text-muted-foreground block">{t("stats.avgProgress")}</span>
            <span className="text-2xl font-bold text-primary">%{stats.avgProgress}</span>
          </div>
        </div>
      </div>

      {/* Progress Breakdown list */}
      <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-base text-foreground">
          {isRtl ? "رتبه‌بندی پیشرفت پروژه‌ها" : "Project Progress Rankings"}
        </h3>
        <div className="segmented-list flex flex-col gap-[2px]">
          {projects.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={cn(
                "segmented-item flex items-center justify-between gap-4 p-4 cursor-pointer select-none",
                idx === 0 && "rounded-t-[32px]",
                idx === projects.length - 1 && "rounded-b-[32px]"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-muted-foreground fa-num">
                  {p.code}
                </span>
                <span className="font-bold text-sm text-foreground">{p.title}</span>
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                  {p.organization}
                </Badge>
              </div>

              <div className="flex items-center gap-4 fa-num">
                <div className="w-32 hidden sm:block">
                  <Progress value={p.progressPercent} className="h-1.5" />
                </div>
                <span className="font-bold text-sm text-foreground">%{p.progressPercent}</span>
                {isRtl ? <ArrowLeft className="size-4 text-muted-foreground" /> : <ArrowRight className="size-4 text-muted-foreground" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 3: COMPANY PORTFOLIO                                    */
  /* ──────────────────────────────────────────────────────────── */
  const renderCompaniesView = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md p-6 space-y-3 shadow-xs">
        <h2 className="text-lg font-bold text-foreground">
          {isRtl ? "پورتفولیو و تفکیک سازمانی پروژه‌ها" : "Subsidiary & Corporate Portfolio"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isRtl
            ? "دسته‌بندی قراردادها و ظرفیت‌های فعال مهندسی بر اساس شرکت‌های تابعه و کارفرمایان"
            : "Project allocation and active capacity across corporate subsidiaries and clients"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {organizations.map((org) => {
          const orgProjects = projects.filter((p) => p.organization === org);
          const avgProg =
            orgProjects.length > 0
              ? Math.round(
                  orgProjects.reduce((acc, p) => acc + p.progressPercent, 0) / orgProjects.length
                )
              : 0;

          return (
            <div
              key={org}
              className="rounded-3xl border border-border/60 bg-card/60 p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{org}</h3>
                    <span className="text-xs text-muted-foreground fa-num">
                      {orgProjects.length} پروژه تخصیص‌یافته
                    </span>
                  </div>
                </div>

                <div className="text-end fa-num">
                  <span className="text-[11px] text-muted-foreground block">میانگین پیشرفت</span>
                  <span className="font-bold text-sm text-primary">%{avgProg}</span>
                </div>
              </div>

              <div className="segmented-list flex flex-col gap-[2px]">
                {orgProjects.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className={cn(
                      "segmented-item flex items-center justify-between p-3 text-xs cursor-pointer select-none",
                      idx === 0 && "rounded-t-[20px]",
                      idx === orgProjects.length - 1 && "rounded-b-[20px]"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] text-muted-foreground fa-num">
                        {p.code}
                      </span>
                      <span className="font-medium text-foreground truncate">{p.title}</span>
                    </div>
                    <span className="font-bold text-primary fa-num shrink-0">
                      %{p.progressPercent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 4: SETTINGS & PERSPECTIVE                               */
  /* ──────────────────────────────────────────────────────────── */
  const renderSettingsView = () => (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md p-6 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">
              {isRtl ? "تنظیمات پرسپکتیو و سطح دسترسی" : "Perspective & Access Settings"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isRtl
                ? "سوئیچ بین دیدگاه مدیر ارشد سیستم و کارشناسان فرآیند"
                : "Toggle between admin oversight and engineering team perspectives"}
            </p>
          </div>
        </div>

        {/* Role toggle */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-foreground block">
            {isRtl ? "نقش فعال در ماژول پروژه‌ها:" : "Active Role:"}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRoleMode("admin")}
              className={cn(
                "p-4 rounded-2xl border text-start transition-all cursor-pointer",
                roleMode === "admin"
                  ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                  : "border-border/60 bg-background/50 hover:bg-muted/50 text-foreground"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">مدیر سیستم (Admin)</span>
                {roleMode === "admin" && <CheckCircle2 className="size-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                دسترسی کامل به تعریف پروژه، تخصیص بودجه و تاییدات
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRoleMode("user")}
              className={cn(
                "p-4 rounded-2xl border text-start transition-all cursor-pointer",
                roleMode === "user"
                  ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                  : "border-border/60 bg-background/50 hover:bg-muted/50 text-foreground"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">کارشناس مهندسی (User)</span>
                {roleMode === "user" && <CheckCircle2 className="size-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-muted-foreground">
                مشاهده اسناد و وظایف تخصیص داده شده به کارشناس
              </p>
            </button>
          </div>
        </div>

        {/* Persona Selector when in user mode */}
        {roleMode === "user" && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <label className="text-xs font-semibold text-foreground block">
              {isRtl ? "انتخاب کارشناس / پرسونای شبیه‌سازی:" : "Active Member Persona:"}
            </label>
            <div className="segmented-list flex flex-col gap-[2px]">
              {[
                { name: "سعید جلیلی", role: "سرپرست فرآیند و پایپینگ" },
                { name: "مهندس فرهمند", role: "متخصص نانو و متالورژی" },
                { name: "سارا محمدی", role: "کنترل کیفیت و بازرسی فنی" },
                { name: "مهندس کاظمی", role: "طراحی مکانیک و پایپینگ" },
              ].map((persona, idx, arr) => (
                <div
                  key={persona.name}
                  onClick={() => setCurrentUserName(persona.name)}
                  className={cn(
                    "segmented-item flex items-center justify-between p-3.5 cursor-pointer select-none",
                    idx === 0 && "rounded-t-[20px]",
                    idx === arr.length - 1 && "rounded-b-[20px]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="size-4 text-muted-foreground" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">
                        {persona.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {persona.role}
                      </span>
                    </div>
                  </div>
                  {currentUserName === persona.name && (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-10">
      {activeTab === "projects" && renderProjectsView()}
      {activeTab === "analytics" && renderAnalyticsView()}
      {activeTab === "companies" && renderCompaniesView()}
      {activeTab === "settings" && renderSettingsView()}
      {activeTab === "create" && (
        <ProjectCreateView
          onCreateProject={createProject}
          onCancel={() => {
            if (onTabChange) onTabChange("projects");
          }}
          onSuccess={(created) => {
            if (onTabChange) onTabChange("projects");
            onSelectProject(created.id);
          }}
          organizations={organizations}
        />
      )}
    </div>
  );
}
