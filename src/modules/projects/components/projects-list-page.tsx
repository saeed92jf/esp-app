// src/modules/projects/components/projects-list-page.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useProjects } from "../hooks/use-projects";
import { ProjectItem } from "../types/projects.types";
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  FileText,
  Layers,
  Send,
  AlertTriangle,
  ArrowLeft,
  Server,
  DollarSign,
  TrendingUp,
  Globe2,
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectCreateDialog } from "./project-create-dialog";

interface ProjectsListPageProps {
  onSelectProject: (projectId: string) => void;
}

export function ProjectsListPage({ onSelectProject }: ProjectsListPageProps) {
  const t = useTranslations("Projects");
  const {
    filteredProjects,
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
  } = useProjects();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-md p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {roleMode === "admin" ? t("roles.adminTitle") : t("roles.userTitle")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {roleMode === "admin" ? t("roles.adminSubtitle") : t("roles.userSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {/* Role Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-muted/40 border border-border/50">
              <button
                type="button"
                onClick={() => setRoleMode("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  roleMode === "admin"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>مدیر سیستم (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleMode("user")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  roleMode === "user"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>کاربر / کارشناس (User)</span>
              </button>
            </div>

            {/* Persona Switcher in User Mode */}
            {roleMode === "user" && (
              <div className="flex items-center gap-1.5 bg-muted/30 border border-border/50 rounded-xl px-2.5 py-1 text-xs">
                <span className="text-[11px] text-muted-foreground">دید کارشناس:</span>
                <select
                  value={currentUserName}
                  onChange={(e) => setCurrentUserName(e.target.value)}
                  className="h-6 rounded-md bg-background border border-border/60 px-1.5 text-xs font-semibold cursor-pointer text-foreground"
                >
                  <option value="سعید جلیلی">سعید جلیلی (سرپرست فرآیند)</option>
                  <option value="مهندس فرهمند">مهندس فرهمند (متخصص نانو)</option>
                  <option value="سارا محمدی">سارا محمدی (کنترل کیفیت)</option>
                  <option value="مهندس کاظمی">مهندس کاظمی (متالورژی)</option>
                </select>
              </div>
            )}

            {/* Define Project Button (only visible or prominent in Admin mode) */}
            {roleMode === "admin" && (
              <Button
                size="sm"
                className="h-9 px-4 gap-2 text-xs font-semibold cursor-pointer shadow-2xs"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>{t("newProject")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Total */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{t("stats.total")}</span>
              <FolderKanban className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="font-bold text-xl text-foreground fa-num">
              {stats.total}
            </div>
          </div>

          {/* Active */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{t("stats.active")}</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="font-bold text-xl text-blue-500 fa-num">
              {stats.active}
            </div>
          </div>

          {/* Export */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{t("stats.export")}</span>
              <Globe2 className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="font-bold text-xl text-purple-500 fa-num">
              {stats.exportCount}
            </div>
          </div>

          {/* Internal */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{t("stats.internal")}</span>
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="font-bold text-xl text-amber-500 fa-num">
              {stats.internalCount}
            </div>
          </div>

          {/* R&D */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{t("stats.rd")}</span>
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="font-bold text-xl text-emerald-500 fa-num">
              {stats.rdCount}
            </div>
          </div>

          {/* Avg Progress */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{t("stats.avgProgress")}</span>
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="font-bold text-xl text-foreground fa-num">
              %{stats.avgProgress}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder={t("search")}
              className="pr-9 text-xs h-9 bg-background/70"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Organization */}
            <select
              value={filters.organization}
              onChange={(e) => setFilters({ organization: e.target.value })}
              className="h-9 rounded-md border border-input bg-background/70 px-3 text-xs"
            >
              <option value="all">{t("allOrganizations")}</option>
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>

            {/* Project Type */}
            <select
              value={filters.projectType}
              onChange={(e) => setFilters({ projectType: e.target.value })}
              className="h-9 rounded-md border border-input bg-background/70 px-3 text-xs"
            >
              <option value="all">{t("allTypes")}</option>
              <option value="internal">{t("types.internal")}</option>
              <option value="export">{t("types.export")}</option>
              <option value="joint_venture">{t("types.joint_venture")}</option>
              <option value="rd">{t("types.rd")}</option>
              <option value="epc">{t("types.epc")}</option>
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="h-9 rounded-md border border-input bg-background/70 px-3 text-xs"
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="tendering">{t("statuses.tendering")}</option>
              <option value="basic_engineering">{t("statuses.basic_engineering")}</option>
              <option value="detailed_engineering">{t("statuses.detailed_engineering")}</option>
              <option value="procurement">{t("statuses.procurement")}</option>
              <option value="fabrication">{t("statuses.fabrication")}</option>
              <option value="qc_testing">{t("statuses.qc_testing")}</option>
              <option value="completed">{t("statuses.completed")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-12 text-center space-y-3">
          <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <h3 className="font-semibold text-base text-foreground">
            هیچ پروژه‌ای با این مشخصات یافت نشد
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            می‌توانید فیلترهای جستجو را پاک کنید یا یک پروژه مهندسی جدید تعریف نمایید.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="text-xs mt-2"
            onClick={() =>
              setFilters({
                search: "",
                organization: "all",
                status: "all",
                projectType: "all",
              })
            }
          >
            پاک کردن فیلترها
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Card Header: Badges & Code */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant="outline"
                      className="border-primary/20 text-primary text-[10px]"
                    >
                      {project.organization}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {t(`types.${project.projectType}`)}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground fa-num">
                    {project.code}
                  </span>
                </div>

                {/* Title & Client */}
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>کارفرما:</span>
                    <strong className="text-foreground/90 font-medium">
                      {project.clientName}
                    </strong>
                  </div>
                </div>

                {/* Quotation & Budget Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <div>
                    <span className="text-[11px] block text-muted-foreground/80">
                      شماره کوتیشن:
                    </span>
                    <span className="font-mono font-medium text-foreground fa-num">
                      {project.quotationNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] block text-muted-foreground/80">
                      برآورد بودجه:
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 fa-num">
                      {project.budgetAmount}
                    </span>
                  </div>
                </div>

                {/* Physical Progress */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">پیشرفت فیزیکی:</span>
                    <span className="font-bold text-foreground fa-num">
                      %{project.progressPercent}
                    </span>
                  </div>
                  <Progress value={project.progressPercent} className="h-1.5" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground fa-num">
                    <span>برنامه‌ای: %{project.plannedProgressPercent}</span>
                    <span>تحویل: {project.targetEndDate}</span>
                  </div>
                </div>

                {/* DMS Storage Network Path Snippet */}
                <div className="rounded-lg bg-background/50 border border-border/40 p-2 text-[11px] flex items-center gap-2 text-muted-foreground">
                  <Server className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-mono truncate dir-ltr text-left">
                    {project.dmsNetworkPath}
                  </span>
                </div>
              </div>

              {/* Card Footer: Metadata counts & Open Workspace Action */}
              <div className="pt-3 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3 fa-num">
                    <span
                      className="flex items-center gap-1"
                      title="پکیج‌های WBS"
                    >
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      {project.subPackages?.length || 0} پکیج
                    </span>
                    <span
                      className="flex items-center gap-1"
                      title="مدارک مهندسی VDIS"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-500" />
                      {project.vdisDocuments?.length || 0} سند
                    </span>
                    <span
                      className="flex items-center gap-1"
                      title="ریسک‌های مهندسی شناسایی شده"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      {project.risks?.length || 0} ریسک
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2 text-xs font-semibold cursor-pointer"
                  onClick={() => onSelectProject(project.id)}
                >
                  <span>{t("openWorkspace")}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={createProject}
      />
    </div>
  );
}
