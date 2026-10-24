// src/modules/projects/components/workspace/tabs/project-overview-tab.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ProjectItem,
  ProjectSubPackage,
  ProjectTeamMember,
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
  ShieldAlert,
  Server,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProjectOverviewTabProps {
  project: ProjectItem;
  onAddTeamMember?: (member: ProjectTeamMember) => void;
  onAddSubPackage?: (pkg: ProjectSubPackage) => void;
}

export function ProjectOverviewTab({
  project,
}: ProjectOverviewTabProps) {
  const t = useTranslations("Projects");
  const [copiedDms, setCopiedDms] = useState(false);

  const handleCopyDms = () => {
    if (project.dmsNetworkPath) {
      navigator.clipboard.writeText(project.dmsNetworkPath);
      setCopiedDms(true);
      setTimeout(() => setCopiedDms(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Client & Organization */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
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
            {t("organization")}: <span className="text-foreground/90 font-medium">{project.organization}</span>
          </div>
        </div>

        {/* Quotation & Contract */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
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
            {project.contractNumber ? `${t("workspace.contract")}: ${project.contractNumber}` : t("types." + project.projectType)}
          </div>
        </div>

        {/* Budget & Currency */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              {t("workspace.budget")}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              {project.currency}
            </span>
          </div>
          <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400 truncate fa-num">
            {project.budgetAmount}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("workspace.progress")}:</span>
            <span className="font-semibold text-foreground fa-num">%{project.progressPercent}</span>
          </div>
        </div>

        {/* Schedule & Duration */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {t("workspace.targetDate")}
            </span>
            <span className="text-[10px] text-muted-foreground fa-num">
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

      {/* DMS Storage & Network Path Banner */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>{t("workspace.dmsPath")}</span>
              <span className="text-[10px] bg-secondary/80 px-1.5 py-0.2 rounded text-secondary-foreground">
                DMS / Shared Network
              </span>
            </div>
            <code className="text-sm font-mono text-foreground select-all break-all dir-ltr text-left inline-block mt-0.5">
              {project.dmsNetworkPath}
            </code>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={handleCopyDms}
          >
            {copiedDms ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی مسیر</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              window.open(project.dmsNetworkPath, "_blank");
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>باز کردن پوشه</span>
          </Button>
        </div>
      </div>

      {/* Description & Technical Scope */}
      {project.description && (
        <div className="rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span>شرح دامنه کاری و مشخصات فنی مهندسی</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
            {project.description}
          </p>
        </div>
      )}

      {/* Multi-tier Hierarchy (Sub-packages / Modules) */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-base text-foreground">
                {t("subPackages.title")}
              </h3>
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
              className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-3 hover:border-primary/40 transition-colors"
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
                  <span>مسئول پکیج:</span>
                  <div className="font-medium text-foreground truncate mt-0.5">
                    {pkg.leadName}
                  </div>
                </div>
                <div>
                  <span>وزن تخمینی:</span>
                  <div className="font-medium text-foreground truncate mt-0.5 fa-num">
                    {pkg.weightTon ? `${pkg.weightTon} تن` : "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">پیشرفت فیزیکی:</span>
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

      {/* Team RACI Matrix */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-base text-foreground">
                {t("team.title")}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("team.subtitle")}
            </p>
          </div>
          <Badge variant="secondary" className="fa-num text-xs">
            {project.team?.length || 0} نفر متخصص
          </Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-xs text-right">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/60 font-medium">
              <tr>
                <th className="p-3 text-right">عضو تیم</th>
                <th className="p-3 text-right">نقش در پروژه</th>
                <th className="p-3 text-right">دپارتمان</th>
                <th className="p-3 text-center">ماتریس RACI</th>
                <th className="p-3 text-right">اطلاعات تماس</th>
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
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {member.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {member.name}
                        </div>
                        {member.isManager && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            مدیر پروژه / تصمیم‌گیرنده
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
                      {member.phone && <div className="fa-num">{member.phone}</div>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
