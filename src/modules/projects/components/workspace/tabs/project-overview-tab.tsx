// src/modules/projects/components/workspace/tabs/project-overview-tab.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProjectItem,
  ProjectSubPackage,
  ProjectTeamMember,
  ProjectPhase,
  ProjectTaskItem,
  VdisDocumentItem,
  TransmittalLetter,
  ProjectRiskItem,
} from "../../../types/projects.types";
import {
  Building2,
  FileText,
  DollarSign,
  FolderTree,
  Users,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Calendar,
  Briefcase,
  Server,
  Kanban,
  Send,
  AlertTriangle,
  Compass,
  Target,
  BarChart3,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  segmentedAccordionMotion,
  getSegmentedAccordionHeaderClass,
} from "@/lib/animations/segmented-accordion";

// Sub-Tab Components for Accordion Segments
import { ProjectPhasesWbsTab } from "./project-phases-wbs-tab";
import { ProjectBoardsTab } from "./project-boards-tab";
import { ProjectVdisTransmittalTab } from "./project-vdis-transmittal-tab";
import { ProjectRisksTab } from "./project-risks-tab";
import { ProjectStrategicOkrsTab } from "./project-strategic-okrs-tab";
import { ProjectReportsAnalyticsTab } from "./project-reports-analytics-tab";

export interface ProjectOverviewTabProps {
  project: ProjectItem;
  roleMode?: "admin" | "user";
  currentUserName?: string;
  isManager?: boolean;
  onAddTeamMember?: (member: ProjectTeamMember) => void;
  onAddSubPackage?: (pkg: ProjectSubPackage) => void;
  onAddPhase?: (phase: Omit<ProjectPhase, "id">) => Promise<void>;
  onUpdatePhase?: (phase: ProjectPhase) => Promise<void>;
  onAddTask?: (task: Omit<ProjectTaskItem, "id">) => Promise<void>;
  onUpdateTaskStatus?: (taskId: string, status: "backlog" | "todo" | "in_progress" | "review" | "done") => Promise<void>;
  onUploadVdisDocument?: (doc: Omit<VdisDocumentItem, "id">) => Promise<void>;
  onCreateTransmittal?: (transmittal: Omit<TransmittalLetter, "id" | "activities">) => Promise<void>;
  onManagerApproveTransmittal?: (transmittalId: string, managerName: string, comment?: string) => Promise<void>;
  onManagerRejectTransmittal?: (transmittalId: string, managerName: string, reason: string) => Promise<void>;
  onAddRisk?: (risk: Omit<ProjectRiskItem, "id">) => Promise<void>;
  onUpdateRiskStatus?: (riskId: string, status: "identified" | "mitigating" | "controlled" | "closed") => Promise<void>;
}

type SegmentKey =
  | "overview"
  | "phases"
  | "boards"
  | "vdis"
  | "risks"
  | "strategic"
  | "reports";

export function ProjectOverviewTab({
  project,
  roleMode = "admin",
  currentUserName = "سعید جلیلی",
  isManager = true,
  onAddTeamMember,
  onAddSubPackage,
  onAddPhase,
  onUpdatePhase,
  onAddTask,
  onUpdateTaskStatus,
  onUploadVdisDocument,
  onCreateTransmittal,
  onManagerApproveTransmittal,
  onManagerRejectTransmittal,
  onAddRisk,
  onUpdateRiskStatus,
}: ProjectOverviewTabProps) {
  const t = useTranslations("Projects");
  const [copiedDms, setCopiedDms] = useState(false);
  const defaultAsync = async () => {};

  // Accordion open/close state for all segments (overview open by default)
  const [openSegments, setOpenSegments] = useState<Record<SegmentKey, boolean>>({
    overview: true,
    phases: false,
    boards: false,
    vdis: false,
    risks: false,
    strategic: false,
    reports: false,
  });

  const toggleSegment = (key: SegmentKey) => {
    setOpenSegments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allOpen = Object.values(openSegments).every(Boolean);

  const toggleAll = () => {
    const nextVal = !allOpen;
    setOpenSegments({
      overview: nextVal,
      phases: nextVal,
      boards: nextVal,
      vdis: nextVal,
      risks: nextVal,
      strategic: nextVal,
      reports: nextVal,
    });
  };

  const handleCopyDms = () => {
    if (project.dmsNetworkPath) {
      navigator.clipboard.writeText(project.dmsNetworkPath);
      setCopiedDms(true);
      setTimeout(() => setCopiedDms(false), 2000);
    }
  };

  const openCount = Object.values(openSegments).filter(Boolean).length;

  return (
    <div className="space-y-4 sm:space-y-5 fa-num">
      {/* ── Top Segment Accordion Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[28px] border border-border/50 bg-white dark:bg-[#121212] shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <ChevronsUpDown className="size-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {t("accordion.overviewTitle")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {openCount} / 8 {t("accordion.totalSegments")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAll}
            className="h-8 text-xs font-semibold gap-1.5 rounded-xl border-border/70 hover:bg-muted/40 cursor-pointer"
          >
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            <span>
              {allOpen
                ? t("accordion.collapseAll")
                : t("accordion.expandAll")}
            </span>
          </Button>
        </div>
      </div>

      {/* ── Segment 1: Overview & Key Specifications ── */}
      <div className="segmented-list w-full">
        <button
          type="button"
          onClick={() => toggleSegment("overview")}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer text-start select-none bg-white dark:bg-[#121212]",
            getSegmentedAccordionHeaderClass(openSegments.overview, {
              isTopRounded: true,
              fullCapsuleWhenClosed: true,
            })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0 bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {t("accordion.overviewTitle")}
                </h3>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-primary/30 text-primary">
                  {project.organization}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono fa-num">
                  {project.code}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-xl">
                {t("accordion.overviewSubtitle")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                openSegments.overview && "rotate-180"
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSegments.overview && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-4 sm:p-6 space-y-6 w-full bg-white dark:bg-[#121212]">
                {/* 1.1 Specification Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Client & Organization */}
                  <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-4 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building2 className="size-3.5 text-primary" />
                        {t("workspace.client")}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                        {project.organization}
                      </Badge>
                    </div>
                    <div className="font-semibold text-base text-foreground truncate">
                      {project.clientName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("organization")}:{" "}
                      <span className="text-foreground/90 font-medium">
                        {project.organization}
                      </span>
                    </div>
                  </div>

                  {/* Quotation & Contract */}
                  <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-4 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <FileText className="size-3.5 text-amber-500" />
                        {t("workspace.quotation")}
                      </span>
                      {project.contractNumber && (
                        <span className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded text-foreground/80">
                          {t("workspace.contract")}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-base font-mono text-foreground truncate fa-num">
                      {project.quotationNumber}
                    </div>
                    <div className="text-xs text-muted-foreground truncate fa-num">
                      {project.contractNumber
                        ? `${t("workspace.contract")}: ${project.contractNumber}`
                        : t("types." + project.projectType)}
                    </div>
                  </div>

                  {/* Budget & Currency */}
                  <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-4 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <DollarSign className="size-3.5 text-emerald-500" />
                        {t("workspace.budget")}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {project.currency}
                      </span>
                    </div>
                    <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400 truncate fa-num">
                      {project.budgetAmount}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t("workspace.progress")}:</span>
                      <span className="font-semibold text-foreground fa-num">
                        %{project.progressPercent}
                      </span>
                    </div>
                  </div>

                  {/* Schedule & Duration */}
                  <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-4 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="size-3.5 text-blue-500" />
                        {t("workspace.targetDate")}
                      </span>
                      <span className="text-[10px] text-muted-foreground fa-num font-medium">
                        %{project.plannedProgressPercent} {t("workspace.planned")}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-foreground fa-num">
                      {project.targetEndDate}
                    </div>
                    <div className="text-xs text-muted-foreground fa-num">
                      {t("workspace.startDate")}: {project.startDate}
                    </div>
                  </div>
                </div>

                {/* 1.2 DMS Storage & Network Path Banner */}
                <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Server className="size-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="font-medium">{t("accordion.dmsSubtitle")}</span>
                        <span className="text-[10px] bg-secondary/80 px-1.5 py-0.2 rounded text-secondary-foreground font-mono">
                          DMS / Shared Network
                        </span>
                      </div>
                      <code className="text-sm font-mono text-foreground select-all break-all dir-ltr text-left inline-block mt-0.5">
                        {project.dmsNetworkPath}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs rounded-lg cursor-pointer"
                      onClick={handleCopyDms}
                    >
                      {copiedDms ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          <span>{t("accordion.copied")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>{t("accordion.copyPath")}</span>
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 gap-1.5 text-xs rounded-lg cursor-pointer"
                      onClick={() => {
                        window.open(project.dmsNetworkPath, "_blank");
                      }}
                    >
                      <ExternalLink className="size-3.5" />
                      <span>{t("accordion.openFolder")}</span>
                    </Button>
                  </div>
                </div>

                {/* 1.3 Description & Technical Scope */}
                {project.description && (
                  <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-5 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="size-3.5 text-primary" />
                      <span>{t("accordion.scopeSubtitle")}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                )}

                {/* 1.4 Multi-tier Hierarchy (Sub-packages / Modules) */}
                <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FolderTree className="size-4 text-primary" />
                        <h4 className="font-semibold text-base text-foreground">
                          {t("accordion.packagesSubtitle")}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("subPackages.subtitle")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="fa-num text-xs">
                      {project.subPackages?.length || 0} پکیج تجهیزاتی
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.subPackages?.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="rounded-xl border border-border/50 bg-white dark:bg-[#1a1a1a] p-4 space-y-3 shadow-2xs hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono text-xs text-primary font-medium">
                              {pkg.code}
                            </div>
                            <div className="font-semibold text-sm text-foreground mt-0.5">
                              {pkg.name}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {pkg.equipmentType}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                          <div>
                            <span>{t("accordion.leadResponsible")}:</span>
                            <div className="font-medium text-foreground truncate mt-0.5">
                              {pkg.leadName}
                            </div>
                          </div>
                          <div>
                            <span>{t("accordion.estWeight")}:</span>
                            <div className="font-medium text-foreground truncate mt-0.5 fa-num">
                              {pkg.weightTon ? `${pkg.weightTon} تن` : "-"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {t("accordion.physicalProgress")}:
                            </span>
                            <span className="font-semibold text-foreground fa-num">
                              %{pkg.progressPercent}
                            </span>
                          </div>
                          <Progress value={pkg.progressPercent} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1.5 Team RACI Matrix */}
                <div className="rounded-2xl border border-border/50 bg-white dark:bg-[#1a1a1a] shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-primary" />
                        <h4 className="font-semibold text-base text-foreground">
                          {t("accordion.teamSubtitle")}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("team.subtitle")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="fa-num text-xs">
                      {project.team?.length || 0} نفر متخصص
                    </Badge>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/50 bg-white dark:bg-[#1a1a1a]">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-muted/50 text-muted-foreground border-b border-border/60 font-medium">
                        <tr>
                          <th className="p-3 text-right">{t("accordion.member")}</th>
                          <th className="p-3 text-right">{t("accordion.projectRole")}</th>
                          <th className="p-3 text-right">{t("accordion.department")}</th>
                          <th className="p-3 text-center">{t("accordion.raciMatrix")}</th>
                          <th className="p-3 text-right">{t("accordion.contactInfo")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {project.team?.map((member) => (
                          <tr
                            key={member.id}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                  {member.name.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">
                                    {member.name}
                                  </div>
                                  {member.isManager && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                                      {t("accordion.managerBadge")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-foreground/90 font-medium">
                              {member.role}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {member.department}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                  member.raci === "Responsible"
                                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                    : member.raci === "Accountable"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : member.raci === "Consulted"
                                    ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                }`}
                              >
                                {member.raci === "Responsible"
                                  ? "R (مسئول)"
                                  : member.raci === "Accountable"
                                  ? "A (پاسخگو)"
                                  : member.raci === "Consulted"
                                  ? "C (مشاور)"
                                  : "I (مطلع)"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="space-y-0.5 font-sans text-[11px] text-muted-foreground dir-ltr text-right">
                                <div>{member.email}</div>
                                {member.phone && (
                                  <div className="fa-num">{member.phone}</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Segment 2: Phases & WBS ── */}
      <div className="segmented-list w-full">
        <button
          type="button"
          onClick={() => toggleSegment("phases")}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer text-start select-none bg-white dark:bg-[#121212]",
            getSegmentedAccordionHeaderClass(openSegments.phases, {
              isTopRounded: true,
              fullCapsuleWhenClosed: true,
            })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0 bg-indigo-500/10 text-indigo-500">
              <Layers className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {t("accordion.phasesTitle")}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 fa-num">
                  {project.phases?.length || 0} فاز
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-xl">
                {t("accordion.phasesSubtitle")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                openSegments.phases && "rotate-180"
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSegments.phases && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-4 sm:p-6 w-full bg-white dark:bg-[#121212]">
                <ProjectPhasesWbsTab
                  project={project}
                  onAddPhase={onAddPhase}
                  onUpdatePhase={onUpdatePhase}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Segment 3: Boards & Tasks ── */}
      <div className="segmented-list w-full">
        <button
          type="button"
          onClick={() => toggleSegment("boards")}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer text-start select-none bg-white dark:bg-[#121212]",
            getSegmentedAccordionHeaderClass(openSegments.boards, {
              isTopRounded: true,
              fullCapsuleWhenClosed: true,
            })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0 bg-cyan-500/10 text-cyan-500">
              <Kanban className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {t("accordion.boardsTitle")}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 fa-num">
                  {project.tasks?.length || 0} وظیفه
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-xl">
                {t("accordion.boardsSubtitle")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                openSegments.boards && "rotate-180"
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSegments.boards && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-4 sm:p-6 w-full bg-white dark:bg-[#121212]">
                <ProjectBoardsTab
                  project={project}
                  roleMode={roleMode}
                  currentUserName={currentUserName}
                  isManager={isManager}
                  onAddTask={onAddTask}
                  onUpdateTaskStatus={onUpdateTaskStatus}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Segment 4: VDIS Documents & Transmittal ── */}
      <div className="segmented-list w-full">
        <button
          type="button"
          onClick={() => toggleSegment("vdis")}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer text-start select-none bg-white dark:bg-[#121212]",
            getSegmentedAccordionHeaderClass(openSegments.vdis, {
              isTopRounded: true,
              fullCapsuleWhenClosed: true,
            })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0 bg-amber-500/10 text-amber-500">
              <Send className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {t("accordion.vdisTitle")}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 fa-num">
                  {(project.vdisDocuments || []).length} سند مهندسی
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-xl">
                {t("accordion.vdisSubtitle")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                openSegments.vdis && "rotate-180"
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSegments.vdis && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-4 sm:p-6 w-full bg-white dark:bg-[#121212]">
                <ProjectVdisTransmittalTab
                  project={project}
                  roleMode={roleMode}
                  currentUserName={currentUserName}
                  isManager={isManager}
                  onManagerApproveTransmittal={onManagerApproveTransmittal || defaultAsync}
                  onManagerRejectTransmittal={onManagerRejectTransmittal || defaultAsync}
                  onCreateTransmittal={onCreateTransmittal || defaultAsync}
                  onUploadVdisDocument={onUploadVdisDocument || defaultAsync}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Segment 5: Risks & Issues Matrix ── */}
      <div className="segmented-list w-full">
        <button
          type="button"
          onClick={() => toggleSegment("risks")}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer text-start select-none bg-white dark:bg-[#121212]",
            getSegmentedAccordionHeaderClass(openSegments.risks, {
              isTopRounded: true,
              fullCapsuleWhenClosed: true,
            })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0 bg-rose-500/10 text-rose-500">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {t("accordion.risksTitle")}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 fa-num">
                  {project.risks?.length || 0} ریسک ثبت‌شده
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-xl">
                {t("accordion.risksSubtitle")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                openSegments.risks && "rotate-180"
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSegments.risks && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-4 sm:p-6 w-full bg-white dark:bg-[#121212]">
                <ProjectRisksTab
                  project={project}
                  onAddRisk={onAddRisk || defaultAsync}
                  onUpdateRiskStatus={onUpdateRiskStatus || defaultAsync}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Segment 6: Strategic OKRs ── */}
      <div className="segmented-list w-full">
        <button
          type="button"
          onClick={() => toggleSegment("strategic")}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer text-start select-none bg-white dark:bg-[#121212]",
            getSegmentedAccordionHeaderClass(openSegments.strategic, {
              isTopRounded: true,
              fullCapsuleWhenClosed: true,
            })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0 bg-purple-500/10 text-purple-500">
              <Target className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {t("accordion.strategicTitle")}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 fa-num">
                  {project.strategicGoals?.length || 0} هدف راهبردی
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-xl">
                {t("accordion.strategicSubtitle")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                openSegments.strategic && "rotate-180"
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSegments.strategic && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-4 sm:p-6 w-full bg-white dark:bg-[#121212]">
                <ProjectStrategicOkrsTab project={project} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Segment 7: Reports & Analytics ── */}
      <div className="segmented-list w-full">
        <button
          type="button"
          onClick={() => toggleSegment("reports")}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer text-start select-none bg-white dark:bg-[#121212]",
            getSegmentedAccordionHeaderClass(openSegments.reports, {
              isTopRounded: true,
              fullCapsuleWhenClosed: true,
            })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl shrink-0 bg-blue-500/10 text-blue-500">
              <BarChart3 className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {t("accordion.reportsTitle")}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  KPI & S-Curve
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-xl">
                {t("accordion.reportsSubtitle")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                openSegments.reports && "rotate-180"
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSegments.reports && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-4 sm:p-6 w-full bg-white dark:bg-[#121212]">
                <ProjectReportsAnalyticsTab project={project} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
