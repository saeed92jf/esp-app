// src/modules/projects/components/simplified/ProjectDetailView.tsx
"use client";

import React, { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  UserCheck,
  Clock,
  Paperclip,
  CheckCircle2,
  Trash2,
  Download,
  Plus,
  X,
  FileText,
  UploadCloud,
  Loader2,
  AlertCircle,
  Calendar,
  MailCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPersonName } from "@/lib/person-names";
import { toast } from "sonner";
import type {
  SimplifiedProject,
  ProjectDocument,
  ProjectStatus,
} from "../../types/simplified-projects.types";
import { simplifiedProjectsService } from "../../services/simplified-projects.service";
import { ProjectCategoryBadge } from "./ProjectCategoryBadge";
import { ProjectLettersList } from "../letters/ProjectLettersList";
import {
  getAttachmentIcon,
  readAttachmentFile,
  downloadAttachment,
} from "@/modules/tasks/components/TaskAttachmentList";

interface ProjectDetailViewProps {
  project: SimplifiedProject;
  isAdmin: boolean;
  onProjectUpdated: (project: SimplifiedProject) => void;
  onProjectDeleted: (projectId: string) => void;
  onBack: () => void;
}

const STATUS_CONFIG: Record<ProjectStatus, { labelFa: string; labelEn: string; color: string }> = {
  todo: { labelFa: "برای شروع و برنامه‌ریزی", labelEn: "To Start", color: "text-slate-600 bg-slate-100 dark:bg-slate-800" },
  in_progress: { labelFa: "در حال مهندسی و ساخت", labelEn: "In Progress", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  review: { labelFa: "بازبینی و تایید کارفرما", labelEn: "Review & Approval", color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30" },
  done: { labelFa: "تکمیل و تحویل نهایی", labelEn: "Completed", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  on_hold: { labelFa: "متوقف شده", labelEn: "On Hold", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
};

export function ProjectDetailView({
  project,
  isAdmin,
  onProjectUpdated,
  onProjectDeleted,
  onBack,
}: ProjectDetailViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.todo;

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await simplifiedProjectsService.updateProject(project.id, {
        status: newStatus,
      });
      onProjectUpdated(updated);
      toast.success(isRtl ? "وضعیت پروژه تغییر یافت." : "Project status updated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update project status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePhaseToggle = async (phaseIndex: number) => {
    const phases = [...(project.schedule?.phases || [])];
    const ph = phases[phaseIndex];
    if (!ph) return;

    // Toggle: pending -> in_progress -> completed -> pending
    let nextStatus: "pending" | "in_progress" | "completed" = "in_progress";
    let nextProgress = 50;

    if (ph.status === "in_progress") {
      nextStatus = "completed";
      nextProgress = 100;
    } else if (ph.status === "completed") {
      nextStatus = "pending";
      nextProgress = 0;
    }

    phases[phaseIndex] = {
      ...ph,
      status: nextStatus,
      progress: nextProgress,
    };

    // Principled automated calculation of overall project status
    const totalPhases = phases.length;
    const completedPhases = phases.filter((p) => p.status === "completed" || p.progress >= 100).length;
    const totalProgress = phases.reduce((acc, p) => acc + (p.progress || 0), 0);
    const avgProgress = totalPhases > 0 ? Math.round(totalProgress / totalPhases) : 0;

    let computedStatus: ProjectStatus = "in_progress";
    if (completedPhases === totalPhases || avgProgress >= 100) {
      computedStatus = "done";
    } else if (phases.every((p) => p.status === "pending" && p.progress === 0)) {
      computedStatus = "todo";
    } else {
      const activePhases = phases.filter((p) => p.status === "in_progress");
      const hasReview = activePhases.some((p) => {
        const titleStr = ((p.title || "") + " " + (p.titleEn || "")).toLowerCase();
        return titleStr.includes("approval") || titleStr.includes("review") || titleStr.includes("تایید") || titleStr.includes("بازبینی");
      });
      computedStatus = hasReview ? "review" : "in_progress";
    }

    try {
      const updated = await simplifiedProjectsService.updateProject(project.id, {
        status: computedStatus,
        progressPercentage: avgProgress,
        schedule: {
          ...project.schedule,
          phases,
        },
      });
      onProjectUpdated(updated);
      toast.success(isRtl ? "وضعیت فاز به‌روزرسانی و وضعیت کلی پروژه به صورت خودکار محاسبه شد." : "Phase updated and project status recalculated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update phase");
    }
  };

  const handleAddDocument = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const title = newDocTitle.trim() || (isRtl ? "مستند تکمیلی" : "Supplementary Document");
    setIsUploadingDoc(true);

    try {
      const newDocs: ProjectDocument[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const item = await readAttachmentFile(f);
        newDocs.push({
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: files.length > 1 ? `${title} (${i + 1})` : title,
          fileName: item.name,
          fileSize: item.size,
          fileType: item.type,
          url: item.url,
          uploadedAt: new Date().toISOString(),
          uploadedBy: isRtl ? "مدیر سیستم" : "System Admin",
        });
      }

      const updatedDocs = [...(project.documents || []), ...newDocs];
      const updated = await simplifiedProjectsService.updateProject(project.id, {
        documents: updatedDocs,
      });

      onProjectUpdated(updated);
      setNewDocTitle("");
      toast.success(isRtl ? "مستندات با موفقیت پیوست شدند." : "Documents uploaded.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload document");
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (docIndex: number) => {
    if (!confirm(isRtl ? "آیا از حذف این مستند اطمینان دارید؟" : "Delete document?")) return;
    const updatedDocs = (project.documents || []).filter((_, idx) => idx !== docIndex);
    try {
      const updated = await simplifiedProjectsService.updateProject(project.id, {
        documents: updatedDocs,
      });
      onProjectUpdated(updated);
      toast.success(isRtl ? "مستند حذف شد." : "Document removed.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete document");
    }
  };

  const handleDeleteProject = async () => {
    if (
      !confirm(
        isRtl
          ? `آیا از حذف کامل پروژه "${project.name}" اطمینان دارید؟`
          : `Permanently delete project "${project.name}"?`
      )
    )
      return;

    try {
      await simplifiedProjectsService.deleteProject(project.id);
      toast.success(isRtl ? "پروژه حذف شد." : "Project deleted.");
      onProjectDeleted(project.id);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ── Back button ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="rounded-xl gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        {isRtl ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
        <span>{isRtl ? "بازگشت به نقشه راه پروژه‌ها" : "Back to Roadmap"}</span>
      </Button>

      {/* ── 1. Project Main Card ── */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <ProjectCategoryBadge category={project.category} size="md" />
              <span className={cn("text-xs font-bold px-3 py-1 rounded-full", statusCfg.color)}>
                {isRtl ? statusCfg.labelFa : statusCfg.labelEn}
              </span>
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                {project.espNumber}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
              {project.name}
            </h1>
          </div>

          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteProject}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl shrink-0"
              title={isRtl ? "حذف پروژه" : "Delete Project"}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-1">
            {project.description}
          </p>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/40 text-xs">
          <div className="flex items-start gap-2">
            <Building2 className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground block">{isRtl ? "کارفرما:" : "Client:"}</span>
              <span className="font-bold text-foreground text-sm">{project.client}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <UserCheck className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground block">{isRtl ? "مدیر پروژه:" : "PM:"}</span>
              <span className="font-bold text-foreground text-sm">{formatPersonName(project.managerName, locale)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground block">{isRtl ? "توتال تایم:" : "Total Time:"}</span>
              <span className="font-bold text-primary text-sm fa-num">
                {project.schedule?.totalDays || 0} {isRtl ? "روز" : "days"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">{isRtl ? "سرویس فرآیندی:" : "Service:"}</span>
            <span className="font-bold text-foreground text-xs">{project.service || "-"}</span>
          </div>
        </div>

        {/* Project Types Chips */}
        {project.projectTypes?.length > 0 && (
          <div className="pt-2 border-t border-border/40 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{isRtl ? "نوع پروژه:" : "Types:"}</span>
            {project.projectTypes.map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Automated Project Lifecycle Tracker */}
        <div className="pt-3 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span>{isRtl ? "چرخه عمر و وضعیت خودکار پروژه:" : "Automated Project Lifecycle:"}</span>
            </span>
            <span className="text-[11px] font-bold text-primary fa-num bg-primary/10 px-2.5 py-0.5 rounded-full">
              {isRtl ? `پیشرفت کل: ${project.progressPercentage}%` : `Overall: ${project.progressPercentage}%`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { key: "todo", labelFa: "۱. برای شروع و برنامه‌ریزی", labelEn: "1. To Start", descFa: "آماده‌سازی مدارک اولیه" },
              { key: "in_progress", labelFa: "۲. مهندسی و ساخت", labelEn: "2. In Progress", descFa: "طراحی، تامین و تولید" },
              { key: "review", labelFa: "۳. بازبینی و تایید کارفرما", labelEn: "3. Under Review", descFa: "بررسی نقشه‌ها و بازرسی" },
              { key: "done", labelFa: "۴. تکمیل و تحویل نهایی", labelEn: "4. Completed", descFa: "تحویل بسته به کارفرما" },
            ] as const).map((step) => {
              const isActive = project.status === step.key;
              const isPast =
                (step.key === "todo" && project.status !== "todo") ||
                (step.key === "in_progress" && (project.status === "review" || project.status === "done")) ||
                (step.key === "review" && project.status === "done");

              return (
                <div
                  key={step.key}
                  className={cn(
                    "p-3 rounded-2xl border transition-all text-start flex flex-col justify-between min-h-[74px]",
                    isActive
                      ? "bg-primary/10 border-primary text-primary font-bold shadow-xs ring-2 ring-primary/20"
                      : isPast
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                      : "bg-muted/20 border-border/40 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold leading-tight truncate">
                      {isRtl ? step.labelFa : step.labelEn}
                    </span>
                    {isPast && <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />}
                    {isActive && <span className="size-2 rounded-full bg-primary animate-pulse shrink-0" />}
                  </div>
                  <span className="text-[10px] opacity-75 truncate">{step.descFa}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
            <AlertCircle className="size-3.5 text-primary shrink-0" />
            <span>
              {isRtl
                ? "وضعیت پروژه بر اساس پیشرفت واقعی فازهای ۵‌گانه در بخش اسکجول زیر به صورت خودکار محاسبه می‌شود و دستی تغییر نمی‌کند."
                : "Project status is automatically updated based on the actual progress of the execution phases below."}
            </span>
          </p>
        </div>
      </div>

      {/* ── 2. Schedule & Execution Phases ── */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <span>{isRtl ? "اسکجول و وضعیت فازهای ۵ گانه" : "Project Schedule & Phases"}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "برای تغییر وضعیت هر فاز (در انتظار / در حال انجام / تکمیل شده) روی آن کلیک کنید."
                : "Click on any phase to toggle progress status."}
            </p>
          </div>

          {project.schedule?.startDate && (
            <span className="text-xs text-muted-foreground fa-num">
              {isRtl ? "شروع: " : "Start: "} {project.schedule.startDate}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {(project.schedule?.phases || []).map((ph, idx) => {
            const isCompleted = ph.status === "completed" || ph.progress === 100;
            const isInProgress = ph.status === "in_progress" || (ph.progress > 0 && ph.progress < 100);

            return (
              <div
                key={ph.id || idx}
                onClick={() => handlePhaseToggle(idx)}
                className={cn(
                  "p-3.5 rounded-2xl border text-center transition-all cursor-pointer select-none flex flex-col justify-between min-h-[90px] shadow-2xs hover:scale-[1.02]",
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    : isInProgress
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60"
                )}
              >
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <span className="size-2 rounded-full bg-current" />
                    )}
                    <span className="text-xs font-extrabold truncate">{ph.title.split("(")[0]}</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono block truncate">{ph.titleEn}</span>
                </div>

                <div className="pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-bold fa-num">
                  <span>{ph.durationDays} {isRtl ? "روز" : "d"}</span>
                  <span>{isCompleted ? (isRtl ? "تکمیل" : "Done") : isInProgress ? (isRtl ? "در حال اجرا" : "Active") : (isRtl ? "در انتظار" : "Pending")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Documents & Technical Drawings ── */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span>{isRtl ? "مستندات، نقشه‌ها و مدارک مهندسی" : "Documents & Technical Drawings"}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "نقشه‌های تاییدشده، فرم‌های بازرسی، گواهی متریال و گزارشات پروژه"
                : "Technical drawings, DFA submissions, MTCs, and inspections"}
            </p>
          </div>

          <span className="text-xs font-bold text-primary fa-num bg-primary/10 px-3 py-1 rounded-full self-start sm:self-auto">
            {project.documents?.length || 0} {isRtl ? "مستند ثبت‌شده" : "documents"}
          </span>
        </div>

        {/* Upload Additional Document Bar */}
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 flex flex-col sm:flex-row gap-2.5 items-center">
          <Input
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            placeholder={isRtl ? "عنوان مستند جدید (مثال: نقشه نهایی، گزارش QC...)" : "New document title..."}
            className="h-10 rounded-xl text-xs sm:text-sm bg-background flex-1"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleAddDocument(e.target.files)}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingDoc}
            size="sm"
            className="rounded-xl gap-2 h-10 px-4 shrink-0 font-bold bg-primary text-white"
          >
            {isUploadingDoc ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            <span>{isRtl ? "آپلود فایل مستند" : "Upload File"}</span>
          </Button>
        </div>

        {/* Documents Grid */}
        {(!project.documents || project.documents.length === 0) ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl bg-muted/10">
            {isRtl ? "هنوز مستندی برای این پروژه ثبت نشده است." : "No documents attached."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.documents.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="p-3.5 rounded-2xl border border-border/60 bg-background hover:bg-muted/20 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 border border-border/40">
                    {getAttachmentIcon(doc.fileType, doc.fileName, "size-5")}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-foreground truncate" title={doc.title}>
                      {doc.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate" title={doc.fileName}>
                      {doc.fileName} {doc.fileSize ? `• ${doc.fileSize}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {doc.url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadAttachment({ name: doc.fileName, url: doc.url })}
                      className="size-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title={isRtl ? "دانلود فایل" : "Download"}
                    >
                      <Download className="size-4" />
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDocument(idx)}
                      className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title={isRtl ? "حذف" : "Remove"}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Project Letters & Correspondence (مکاتبات و تایید نامه‌ها) ── */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MailCheck className="size-4.5 text-primary" />
              <span>{isRtl ? "نامه‌ها، مکاتبات و تاییدات اداری پروژه" : "Project Letters & Correspondence"}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "ثبت و آپلود پیش‌نویس توسط بخش اداری، بررسی، تایید/رد و کامنت‌گذاری توسط مدیر پروژه، و ارسال نهایی"
                : "Office letter drafting, manager review & approval with comments and file attachments, and dispatch tracking"}
            </p>
          </div>
        </div>

        <ProjectLettersList
          projects={[project]}
          scopedProjectId={project.id}
          onLettersChange={() => {
            // Project updated
          }}
        />
      </div>
    </div>
  );
}

