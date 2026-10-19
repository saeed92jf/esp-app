// src/modules/projects/components/workspace/project-workspace-page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useProjectDetail } from "../../hooks/use-project-detail";
import {
  FileText,
  Layers,
  Kanban,
  Send,
  AlertTriangle,
  Compass,
  Target,
  BarChart3,
  ArrowRight,
  FolderTree,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Workspace Tabs
import { ProjectOverviewTab } from "./tabs/project-overview-tab";
import { ProjectPhasesWbsTab } from "./tabs/project-phases-wbs-tab";
import { ProjectBoardsTab } from "./tabs/project-boards-tab";
import { ProjectVdisTransmittalTab } from "./tabs/project-vdis-transmittal-tab";
import { ProjectRisksTab } from "./tabs/project-risks-tab";
import { ProjectMiroRoadmapTab } from "./tabs/project-miro-roadmap-tab";
import { ProjectStrategicOkrsTab } from "./tabs/project-strategic-okrs-tab";
import { ProjectReportsAnalyticsTab } from "./tabs/project-reports-analytics-tab";

type TabKey =
  | "overview"
  | "phases"
  | "boards"
  | "vdis"
  | "risks"
  | "roadmap"
  | "strategic"
  | "reports";

interface ProjectWorkspacePageProps {
  projectId: string;
  initialTab?: TabKey;
  roleMode?: "admin" | "user";
  currentUserName?: string;
}

export function ProjectWorkspacePage({
  projectId,
  initialTab = "overview",
  roleMode: propRoleMode,
  currentUserName: propCurrentUserName,
}: ProjectWorkspacePageProps) {
  const t = useTranslations("Projects");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const [internalRoleMode, setInternalRoleMode] = useState<"admin" | "user">(
    propRoleMode || "admin"
  );
  const [internalCurrentUserName, setInternalCurrentUserName] = useState<string>(
    propCurrentUserName || "سعید جلیلی"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("esp_role_perspective") as "admin" | "user" | null;
      const savedPersona = localStorage.getItem("esp_persona_name");
      if (savedRole && (savedRole === "admin" || savedRole === "user")) {
        setInternalRoleMode(savedRole);
      }
      if (savedPersona) {
        setInternalCurrentUserName(savedPersona);
      }
    }
  }, []);

  const activeRoleMode = propRoleMode || internalRoleMode;
  const activeCurrentUserName = propCurrentUserName || internalCurrentUserName;

  const {
    project,
    isLoading,
    error,
    refreshProject,
    addPhase,
    updatePhase,
    addTeamMember,
    uploadVdisDocument,
    createTransmittal,
    managerApproveTransmittal,
    managerRejectTransmittal,
    addRisk,
    updateRiskStatus,
    addTask,
    updateTaskStatus,
  } = useProjectDetail(projectId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">در حال بارگذاری اطلاعات پروژه...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center p-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h3 className="font-semibold text-lg text-foreground">خطا در بارگذاری پروژه</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {error || "پروژه مورد نظر یافت نشد یا دسترسی به آن امکان‌پذیر نیست."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/fa/dashboard/projects")}
        >
          بازگشت به لیست پروژه‌ها
        </Button>
      </div>
    );
  }

  const isManager =
    activeRoleMode === "admin" ||
    (project?.team || []).some(
      (m) =>
        m.name.toLowerCase().includes(activeCurrentUserName.toLowerCase()) &&
        m.isManager
    );

  const pendingApprovalsCount = (project.transmittals || []).filter(
    (tr) => tr.status === "pending_manager"
  ).length;

  const criticalRisksCount = (project.risks || []).filter(
    (r) => r.severity === "high" || r.severity === "critical"
  ).length;

  const tabsConfig: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { key: "overview", label: t("tabs.overview"), icon: FileText },
    { key: "phases", label: t("tabs.phases"), icon: Layers },
    {
      key: "boards",
      label: t("tabs.boards"),
      icon: Kanban,
      badge: project.tasks?.length,
    },
    {
      key: "vdis",
      label: t("tabs.vdis"),
      icon: Send,
      badge: pendingApprovalsCount,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      key: "risks",
      label: t("tabs.risks"),
      icon: AlertTriangle,
      badge: criticalRisksCount,
      badgeColor: "bg-rose-500 text-white",
    },
    { key: "roadmap", label: t("tabs.roadmap"), icon: Compass },
    { key: "strategic", label: t("tabs.strategic"), icon: Target },
    { key: "reports", label: t("tabs.reports"), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Header Banner */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-md p-6 space-y-6 shadow-xs">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => router.push("/fa/dashboard/projects")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فهرست پروژه‌ها</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {activeRoleMode === "admin" ? (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                {t("roles.workspaceAdminBadge")}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                {t("roles.workspaceUserBadge")} {activeCurrentUserName} {isManager ? t("roles.managerRoleBadge") : t("roles.memberRoleBadge")}
              </Badge>
            )}
            <Badge variant="outline" className="border-primary/20 text-primary text-xs">
              <Building2 className="w-3 h-3 ml-1" />
              {project.organization}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {t(`types.${project.projectType}`)}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-mono bg-background/50 border-border/80 fa-num"
            >
              {project.code}
            </Badge>
          </div>
        </div>

        {/* Project Title and Stats Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {project.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                {t("workspace.client")}:{" "}
                <strong className="text-foreground font-medium">
                  {project.clientName}
                </strong>
              </span>
              <span>•</span>
              <span className="fa-num">
                {t("workspace.quotation")}:{" "}
                <strong className="text-foreground font-mono font-medium">
                  {project.quotationNumber}
                </strong>
              </span>
              <span>•</span>
              <span className="fa-num">
                {t("workspace.targetDate")}:{" "}
                <strong className="text-foreground font-medium">
                  {project.targetEndDate}
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Progress Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-background/60 border border-border/40 p-3.5 rounded-xl min-w-[280px]">
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  پیشرفت کلی فیزیکی
                </span>
                <span className="font-bold text-foreground fa-num">
                  %{project.progressPercent}
                </span>
              </div>
              <Progress value={project.progressPercent} className="h-2" />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground fa-num">
                <span>برنامه‌ای: %{project.plannedProgressPercent}</span>
                <span>
                  واریانس:{" "}
                  {project.progressPercent >= project.plannedProgressPercent
                    ? "+ "
                    : "- "}
                  %{Math.abs(project.progressPercent - project.plannedProgressPercent)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-border/40 no-scrollbar">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold fa-num ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : tab.badgeColor || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents View */}
      <div className="transition-opacity duration-150">
        {activeTab === "overview" && (
          <ProjectOverviewTab
            project={project}
            onAddTeamMember={isManager ? addTeamMember : undefined}
          />
        )}
        {activeTab === "phases" && (
          <ProjectPhasesWbsTab
            project={project}
            onAddPhase={isManager ? addPhase : undefined}
            onUpdatePhase={isManager ? updatePhase : undefined}
          />
        )}
        {activeTab === "boards" && (
          <ProjectBoardsTab
            project={project}
            roleMode={activeRoleMode}
            currentUserName={activeCurrentUserName}
            isManager={isManager}
            onAddTask={addTask}
            onUpdateTaskStatus={updateTaskStatus}
          />
        )}
        {activeTab === "vdis" && (
          <ProjectVdisTransmittalTab
            project={project}
            roleMode={activeRoleMode}
            currentUserName={activeCurrentUserName}
            isManager={isManager}
            onManagerApproveTransmittal={managerApproveTransmittal}
            onManagerRejectTransmittal={managerRejectTransmittal}
            onCreateTransmittal={createTransmittal}
            onUploadVdisDocument={uploadVdisDocument}
          />
        )}
        {activeTab === "risks" && (
          <ProjectRisksTab
            project={project}
            onAddRisk={addRisk}
            onUpdateRiskStatus={updateRiskStatus}
          />
        )}
        {activeTab === "roadmap" && (
          <ProjectMiroRoadmapTab project={project} />
        )}
        {activeTab === "strategic" && (
          <ProjectStrategicOkrsTab project={project} />
        )}
        {activeTab === "reports" && (
          <ProjectReportsAnalyticsTab project={project} />
        )}
      </div>
    </div>
  );
}
