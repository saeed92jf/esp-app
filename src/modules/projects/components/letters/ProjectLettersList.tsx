// src/modules/projects/components/letters/ProjectLettersList.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Download,
  Trash2,
  Search,
  Filter,
  Building2,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  MessageSquare,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import type { SimplifiedProject } from "../../types/simplified-projects.types";
import type {
  ProjectLetter,
  LetterStatus,
} from "../../types/project-letters.types";
import { projectLettersService } from "../../services/project-letters.service";
import { downloadAttachment } from "@/modules/tasks/components/TaskAttachmentList";
import { UploadProjectLetterModal } from "./UploadProjectLetterModal";
import { ManagerLetterReviewModal } from "./ManagerLetterReviewModal";
import { ProjectLetterDetailsModal } from "./ProjectLetterDetailsModal";

interface ProjectLettersListProps {
  projects: SimplifiedProject[];
  scopedProjectId?: string;
  onLettersChange?: () => void;
}

const STATUS_FILTERS: { id: string; labelFa: string; labelEn: string }[] = [
  { id: "all", labelFa: "همه نامه‌ها", labelEn: "All Letters" },
  { id: "pending_approval", labelFa: "در انتظار بررسی مدیر", labelEn: "Awaiting Review" },
  { id: "approved", labelFa: "تایید شده جهت ارسال", labelEn: "Approved" },
  { id: "rejected", labelFa: "رد شده / اصلاحیه", labelEn: "Rejected" },
  { id: "sent", labelFa: "ارسال رسمی شده", labelEn: "Sent" },
];

function isManagerOrAdmin(role?: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return ["superadmin", "admin", "manager", "dept_admin"].includes(r);
}

export function ProjectLettersList({
  projects,
  scopedProjectId,
  onLettersChange,
}: ProjectLettersListProps) {
  const { user } = useAuth();
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [letters, setLetters] = useState<ProjectLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState(scopedProjectId || "all");

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [reviewLetter, setReviewLetter] = useState<ProjectLetter | null>(null);
  const [detailsLetter, setDetailsLetter] = useState<ProjectLetter | null>(null);

  const fetchLetters = useCallback(async () => {
    setIsLoading(true);
    try {
      if (scopedProjectId) {
        const data = await projectLettersService.getProjectLetters(scopedProjectId);
        setLetters(data);
      } else {
        const data = await projectLettersService.getLetters({
          status: statusFilter !== "all" ? statusFilter : undefined,
          projectId: selectedProjectFilter !== "all" ? selectedProjectFilter : undefined,
          search: searchQuery.trim() || undefined,
        });
        setLetters(data);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load letters");
    } finally {
      setIsLoading(false);
    }
  }, [scopedProjectId, statusFilter, selectedProjectFilter, searchQuery]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLetters();
    setIsRefreshing(false);
  };

  const handleLetterCreated = (newLetter: ProjectLetter) => {
    setLetters((prev) => [newLetter, ...prev]);
    onLettersChange?.();
  };

  const handleLetterReviewed = (updatedLetter: ProjectLetter) => {
    setLetters((prev) => prev.map((l) => (l.id === updatedLetter.id ? updatedLetter : l)));
    if (detailsLetter?.id === updatedLetter.id) {
      setDetailsLetter(updatedLetter);
    }
    onLettersChange?.();
  };

  const handleMarkSent = async (letter: ProjectLetter) => {
    const tracking = prompt(
      isRtl
        ? "شماره نامه دبیرخانه یا کد رهگیری ارسال به کارفرما را وارد فرمایید (اختیاری):"
        : "Enter dispatch tracking code (optional):"
    );
    try {
      const updated = await projectLettersService.markLetterSent(letter.id, {
        trackingNumber: tracking || undefined,
        sentBy: user?.name || "بخش اداری",
      });
      toast.success(isRtl ? "وضعیت نامه به «ارسال رسمی شده» تغییر یافت." : "Letter marked as sent.");
      handleLetterReviewed(updated);
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark letter sent");
    }
  };

  const handleDeleteLetter = async (letterId: string, letterNumber: string) => {
    if (!confirm(isRtl ? `آیا از حذف نامه "${letterNumber}" اطمینان دارید؟` : `Delete letter "${letterNumber}"?`)) {
      return;
    }
    try {
      await projectLettersService.deleteLetter(letterId);
      toast.success(isRtl ? "نامه حذف گردید." : "Letter deleted.");
      setLetters((prev) => prev.filter((l) => l.id !== letterId));
      if (detailsLetter?.id === letterId) setDetailsLetter(null);
      onLettersChange?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete letter");
    }
  };

  // Filtered letters
  const filteredLetters = useMemo(() => {
    return letters.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (selectedProjectFilter !== "all" && l.projectId !== selectedProjectFilter && l.espNumber !== selectedProjectFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          (l.letterNumber || "").toLowerCase().includes(q) ||
          (l.subject || "").toLowerCase().includes(q) ||
          (l.recipient || "").toLowerCase().includes(q) ||
          (l.projectName || "").toLowerCase().includes(q) ||
          (l.espNumber || "").toLowerCase().includes(q) ||
          (l.description || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [letters, statusFilter, selectedProjectFilter, searchQuery]);

  // Metrics counts
  const stats = useMemo(() => {
    const total = letters.length;
    const pending = letters.filter((l) => l.status === "pending_approval").length;
    const approved = letters.filter((l) => l.status === "approved").length;
    const rejected = letters.filter((l) => l.status === "rejected").length;
    const sent = letters.filter((l) => l.status === "sent").length;
    return { total, pending, approved, rejected, sent };
  }, [letters]);

  const userCanReview = isManagerOrAdmin(user?.role);

  return (
    <div className="space-y-6">
      {/* ── 1. Top Metrics Banner ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total */}
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-2xs flex flex-col justify-between min-h-[80px]">
          <span className="text-xs text-muted-foreground">{isRtl ? "کل مکاتبات" : "Total Letters"}</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-foreground fa-num">{stats.total}</span>
            <FileText className="size-4 text-muted-foreground" />
          </div>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => setStatusFilter("pending_approval")}
          className={cn(
            "p-4 rounded-2xl border shadow-2xs flex flex-col justify-between min-h-[80px] cursor-pointer transition-all",
            statusFilter === "pending_approval"
              ? "bg-amber-500/15 border-amber-500/60 ring-2 ring-amber-500/20"
              : "bg-card border-border/60 hover:border-amber-500/40"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              {isRtl ? "در انتظار تایید مدیر" : "Pending Review"}
            </span>
            {stats.pending > 0 && <span className="size-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 fa-num">
              {stats.pending}
            </span>
            <Clock className="size-4 text-amber-600" />
          </div>
        </div>

        {/* Approved */}
        <div
          onClick={() => setStatusFilter("approved")}
          className={cn(
            "p-4 rounded-2xl border shadow-2xs flex flex-col justify-between min-h-[80px] cursor-pointer transition-all",
            statusFilter === "approved"
              ? "bg-emerald-500/15 border-emerald-500/60 ring-2 ring-emerald-500/20"
              : "bg-card border-border/60 hover:border-emerald-500/40"
          )}
        >
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
            {isRtl ? "تایید شده جهت ارسال" : "Approved"}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 fa-num">
              {stats.approved}
            </span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setStatusFilter("rejected")}
          className={cn(
            "p-4 rounded-2xl border shadow-2xs flex flex-col justify-between min-h-[80px] cursor-pointer transition-all",
            statusFilter === "rejected"
              ? "bg-rose-500/15 border-rose-500/60 ring-2 ring-rose-500/20"
              : "bg-card border-border/60 hover:border-rose-500/40"
          )}
        >
          <span className="text-xs text-rose-700 dark:text-rose-400 font-bold">
            {isRtl ? "رد شده / اصلاحیه" : "Rejected"}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-700 dark:text-rose-400 fa-num">
              {stats.rejected}
            </span>
            <XCircle className="size-4 text-rose-600" />
          </div>
        </div>

        {/* Sent */}
        <div
          onClick={() => setStatusFilter("sent")}
          className={cn(
            "p-4 rounded-2xl border shadow-2xs flex flex-col justify-between min-h-[80px] cursor-pointer transition-all col-span-2 sm:col-span-1",
            statusFilter === "sent"
              ? "bg-sky-500/15 border-sky-500/60 ring-2 ring-sky-500/20"
              : "bg-card border-border/60 hover:border-sky-500/40"
          )}
        >
          <span className="text-xs text-sky-700 dark:text-sky-400 font-bold">
            {isRtl ? "ارسال رسمی شده" : "Dispatched / Sent"}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-sky-700 dark:text-sky-400 fa-num">
              {stats.sent}
            </span>
            <Send className="size-4 text-sky-600" />
          </div>
        </div>
      </div>

      {/* ── 2. Filter Toolbar & Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="size-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "جستجو در شماره نامه، موضوع، کارفرما..." : "Search letters, subject, client..."}
              className="h-10 ps-9 rounded-xl text-xs sm:text-sm bg-card"
            />
          </div>

          {/* Project selector (only if not scoped) */}
          {!scopedProjectId && (
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="h-10 rounded-xl bg-card border border-border/60 px-3 text-xs font-medium text-foreground outline-none"
            >
              <option value="all">{isRtl ? "همه پروژه‌ها" : "All Projects"}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.espNumber} — {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Status filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.id}
                type="button"
                onClick={() => setStatusFilter(sf.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all",
                  statusFilter === sf.id
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {isRtl ? sf.labelFa : sf.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="rounded-xl h-10 gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCw className={cn("size-3.5", (isRefreshing || isLoading) && "animate-spin")} />
            <span className="hidden sm:inline">{isRtl ? "به‌روزرسانی" : "Refresh"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="rounded-xl h-10 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-2 shadow-xs cursor-pointer"
          >
            <UploadCloud className="size-4" />
            <span>{isRtl ? "ثبت و آپلود نامه جدید" : "Upload New Letter"}</span>
          </Button>
        </div>
      </div>

      {/* ── 3. Letters Cards List ── */}
      {isLoading && !isRefreshing ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="text-xs sm:text-sm font-medium">{isRtl ? "در حال دریافت نامه‌های پروژه‌ها..." : "Loading letters..."}</p>
        </div>
      ) : filteredLetters.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-border/80 bg-muted/10 p-8 space-y-3">
          <FileText className="size-10 text-muted-foreground mx-auto opacity-50" />
          <h4 className="text-sm font-bold text-foreground">
            {isRtl ? "هیچ نامه‌ای با این مشخصات یافت نشد." : "No letters found."}
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {isRtl
              ? "برای ارسال مکاتبات رسمی، ترانسمیتال مهندسی یا استعلام‌ها، دکمه «ثبت و آپلود نامه جدید» را بزنید."
              : "Click 'Upload New Letter' to submit project correspondence for manager approval."}
          </p>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            size="sm"
            className="rounded-full px-5 text-xs font-bold bg-primary text-white gap-1.5"
          >
            <PlusCircle className="size-4" />
            <span>{isRtl ? "ثبت اولین نامه" : "Upload First Letter"}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLetters.map((letter) => {
            const isPending = letter.status === "pending_approval";
            const isApproved = letter.status === "approved";
            const isRejected = letter.status === "rejected";
            const isSent = letter.status === "sent";

            return (
              <div
                key={letter.id}
                className={cn(
                  "p-5 rounded-3xl border transition-all bg-card shadow-xs space-y-4 hover:border-primary/40",
                  isPending && "border-amber-500/30 bg-amber-500/[0.01]",
                  isApproved && "border-emerald-500/30",
                  isRejected && "border-rose-500/30",
                  isSent && "border-sky-500/30"
                )}
              >
                {/* Header row: Project & ESP badge + Letter Number + Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      {letter.letterNumber}
                    </span>

                    <span className="text-xs font-bold text-foreground">
                      {letter.projectName}
                    </span>

                    <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {letter.espNumber}
                    </span>

                    {letter.priority === "urgent" && (
                      <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 text-[10px] font-bold">
                        {isRtl ? "فوری" : "Urgent"}
                      </Badge>
                    )}
                    {letter.priority === "confidential" && (
                      <Badge variant="outline" className="border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/10 text-[10px] font-bold">
                        {isRtl ? "آنی / محرمانه" : "Confidential"}
                      </Badge>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        <Clock className="size-3.5 animate-pulse" />
                        <span>{isRtl ? "در انتظار بررسی مدیر" : "Awaiting Manager Review"}</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="size-3.5" />
                        <span>{isRtl ? "تایید شده جهت ارسال" : "Approved"}</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                        <XCircle className="size-3.5" />
                        <span>{isRtl ? "رد شده / نیازمند اصلاح" : "Rejected"}</span>
                      </span>
                    )}
                    {isSent && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                        <Send className="size-3.5" />
                        <span>{isRtl ? "ارسال رسمی شده" : "Dispatched"}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject & Recipient */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                    {letter.subject}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>
                      {isRtl ? "گیرنده: " : "Recipient: "}
                      <span className="font-semibold text-foreground">{letter.recipient}</span>
                    </span>
                    <span>•</span>
                    <span className="fa-num">
                      {isRtl ? `تاریخ: ${letter.date}` : `Date: ${letter.date}`}
                    </span>
                    <span>•</span>
                    <span>
                      {isRtl ? "ثبت اداری: " : "Draft by: "}
                      <span className="font-medium text-foreground">{letter.draftBy?.userName || "بخش اداری"}</span>
                    </span>
                  </div>
                </div>

                {/* Description if present */}
                {letter.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-2xl">
                    {letter.description}
                  </p>
                )}

                {/* Manager Review Box (Comments & Manager file if reviewed) */}
                {letter.managerReview && (
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl border space-y-2 text-xs",
                      letter.managerReview.decision === "approved"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-rose-500/10 border-rose-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={cn(
                            "size-4 shrink-0",
                            letter.managerReview.decision === "approved" ? "text-emerald-600" : "text-rose-600"
                          )}
                        />
                        <span className="font-bold text-foreground">
                          {isRtl ? "تصمیم و کامنت مدیر: " : "Manager Review: "}
                          <span className={letter.managerReview.decision === "approved" ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
                            {letter.managerReview.decision === "approved"
                              ? isRtl ? "تایید شده جهت ارسال" : "Approved"
                              : isRtl ? "رد شده / نیازمند اصلاح" : "Rejected"}
                          </span>
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {isRtl ? `بررسی توسط ${letter.managerReview.reviewerName}` : `Reviewed by ${letter.managerReview.reviewerName}`}
                      </span>
                    </div>

                    {letter.managerReview.comment && (
                      <p className="text-foreground leading-relaxed p-2.5 rounded-xl bg-background/80 border border-border/40 whitespace-pre-wrap">
                        {letter.managerReview.comment}
                      </p>
                    )}

                    {/* Manager's attached signed file */}
                    {letter.managerReview.attachmentFile && (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-xs text-foreground font-semibold truncate">
                          <Paperclip className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">{letter.managerReview.attachmentFile.fileName}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            ({letter.managerReview.attachmentFile.fileSize})
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            downloadAttachment({
                              name: letter.managerReview!.attachmentFile!.fileName,
                              url: letter.managerReview!.attachmentFile!.url,
                            })
                          }
                          className="rounded-xl h-7 px-2.5 text-xs gap-1 bg-background"
                        >
                          <Download className="size-3" />
                          <span>{isRtl ? "دانلود فایل ارسالی مدیر" : "Download File"}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Row: File chips & Action buttons */}
                <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Draft file chip */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {letter.draftFile && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          downloadAttachment({
                            name: letter.draftFile!.fileName,
                            url: letter.draftFile!.url,
                          })
                        }
                        className="rounded-xl h-8 px-3 text-xs gap-1.5 font-medium hover:border-primary/50 cursor-pointer"
                      >
                        <Download className="size-3.5 text-primary" />
                        <span className="truncate max-w-[180px]">{letter.draftFile.fileName}</span>
                        <span className="text-[10px] text-muted-foreground">({letter.draftFile.fileSize})</span>
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {/* View Details */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailsLetter(letter)}
                      className="rounded-xl h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>{isRtl ? "مشاهده جزئیات" : "View"}</span>
                    </Button>

                    {/* Manager Review Action */}
                    {userCanReview && isPending && (
                      <Button
                        size="sm"
                        onClick={() => setReviewLetter(letter)}
                        className="rounded-xl h-8 px-3.5 text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ShieldCheck className="size-3.5" />
                        <span>{isRtl ? "بررسی و تایید/رد توسط مدیر" : "Review as Manager"}</span>
                      </Button>
                    )}

                    {/* Mark Sent Action */}
                    {isApproved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkSent(letter)}
                        className="rounded-xl h-8 px-3.5 text-xs font-bold border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 gap-1.5 cursor-pointer"
                      >
                        <Send className="size-3.5" />
                        <span>{isRtl ? "ثبت ارسال به کارفرما" : "Mark Sent"}</span>
                      </Button>
                    )}

                    {/* Delete button (only if admin or pending draft) */}
                    {(userCanReview || isPending) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLetter(letter.id, letter.letterNumber)}
                        className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title={isRtl ? "حذف نامه" : "Delete Letter"}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <UploadProjectLetterModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        projects={projects}
        defaultProjectId={scopedProjectId}
        onLetterCreated={handleLetterCreated}
      />

      {/* Manager Review Modal */}
      <ManagerLetterReviewModal
        open={Boolean(reviewLetter)}
        onOpenChange={(open) => !open && setReviewLetter(null)}
        letter={reviewLetter}
        onLetterReviewed={handleLetterReviewed}
      />

      {/* Details Modal */}
      <ProjectLetterDetailsModal
        open={Boolean(detailsLetter)}
        onOpenChange={(open) => !open && setDetailsLetter(null)}
        letter={detailsLetter}
        canReview={userCanReview}
        onOpenReviewModal={() => {
          if (detailsLetter) {
            setReviewLetter(detailsLetter);
          }
        }}
        canSend={Boolean(detailsLetter && detailsLetter.status === "approved")}
        onMarkSent={() => {
          if (detailsLetter) {
            handleMarkSent(detailsLetter);
          }
        }}
      />
    </div>
  );
}
