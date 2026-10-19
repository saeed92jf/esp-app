// src/modules/projects/components/workspace/tabs/project-vdis-transmittal-tab.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  Send,
  Inbox,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCode,
  Paperclip,
  Clock,
  User,
  Building2,
  Check,
  X,
  Plus,
  Download,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ProjectItem,
  VdisDocumentItem,
  TransmittalLetter,
  VdisDocumentStatus,
} from "../../../types/projects.types";
import { cn } from "@/lib/utils";

interface ProjectVdisTransmittalTabProps {
  project: ProjectItem;
  roleMode?: "admin" | "user";
  currentUserName?: string;
  isManager?: boolean;
  onUploadVdisDocument: (doc: Omit<VdisDocumentItem, "id">) => Promise<void>;
  onCreateTransmittal: (
    transmittal: Omit<TransmittalLetter, "id" | "activities">
  ) => Promise<void>;
  onManagerApproveTransmittal: (
    transmittalId: string,
    managerName: string,
    comment?: string
  ) => Promise<void>;
  onManagerRejectTransmittal: (
    transmittalId: string,
    managerName: string,
    reason: string
  ) => Promise<void>;
}

export function ProjectVdisTransmittalTab({
  project,
  roleMode = "admin",
  currentUserName = "سعید جلیلی",
  isManager = true,
  onUploadVdisDocument,
  onCreateTransmittal,
  onManagerApproveTransmittal,
  onManagerRejectTransmittal,
}: ProjectVdisTransmittalTabProps) {
  const t = useTranslations("Projects.vdis");

  const [activeFolder, setActiveFolder] = useState<
    "inbox" | "ready" | "sent" | "allDocs"
  >("inbox");
  const [selectedTransmittalId, setSelectedTransmittalId] = useState<string | null>(
    project.transmittals[0]?.id || null
  );

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [transmittalNo, setTransmittalNo] = useState(
    `TR-${project.code.replace("PRJ-", "")}-${Math.floor(Math.random() * 80) + 20}`
  );
  const [subject, setSubject] = useState(
    `ارسال مدارک پکیج مهندسی - ${project.title.slice(0, 40)}`
  );
  const [recipientCompany, setRecipientCompany] = useState(project.clientName);
  const [recipientEmail, setRecipientEmail] = useState("pmt@client-corp.ir");
  const [ccEmails, setCcEmails] = useState("rezaei@petroespadana.com, dms@company.com");
  const [coverLetter, setCoverLetter] = useState(
    `احتراماً پیرو قرارداد شماره ${project.contractNumber || "قرارداد منعقده"}، اسناد و نقشه‌های تفصیلی فهرست‌شده طبق شاخص VDIS جهت بررسی و صدور فرم نظرخواهی کارفرما به پیوست ارسال می‌گردد.`
  );
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload Doc Modal State
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [docNumber, setDocNumber] = useState(
    `ESP-${project.code.split("-").pop() || "01"}-PID-${Math.floor(Math.random() * 900) + 100}`
  );
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("P&ID");
  const [docRevision, setDocRevision] = useState("Rev 0");
  const [docFormat, setDocFormat] = useState("PDF");

  const transmittals = project.transmittals || [];
  const vdisDocs = project.vdisDocuments || [];

  const pendingTransmittals = transmittals.filter((tr) => tr.status === "pending_manager");
  const approvedTransmittals = transmittals.filter((tr) => tr.status === "approved_sent");
  const rejectedTransmittals = transmittals.filter((tr) => tr.status === "rejected");

  const selectedTransmittal =
    transmittals.find((tr) => tr.id === selectedTransmittalId) ||
    transmittals[0] ||
    null;

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const attachedDocs = vdisDocs.filter((d) => selectedDocIds.includes(d.id));
      await onCreateTransmittal({
        transmittalNo,
        subject: subject.trim(),
        recipientCompany,
        recipientEmail,
        ccEmails: ccEmails.split(",").map((s) => s.trim()).filter(Boolean),
        senderName: "سعید جلیلی",
        senderRole: "سرپرست مهندسی فرآیند",
        coverLetterText: coverLetter,
        status: "pending_manager",
        documents: attachedDocs,
      });

      setIsComposeOpen(false);
      setActiveFolder("inbox");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    await onUploadVdisDocument({
      docNumber,
      title: docTitle.trim(),
      phase: "Engineering",
      revision: docRevision,
      category: docCategory,
      status: "pending_approval",
      fileFormat: docFormat,
      fileSize: "4.5 MB",
      filePathUrl: `${project.dmsNetworkPath}${docNumber}.${docFormat.toLowerCase()}`,
      preparedBy: "سعید جلیلی",
      preparedDate: new Intl.DateTimeFormat("fa-IR").format(new Date()),
    });

    setDocTitle("");
    setIsUploadDocOpen(false);
  };

  const getStatusBadge = (status: VdisDocumentStatus) => {
    switch (status) {
      case "code_1_approved":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "code_2_approved_comm":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "code_3_rejected":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "transmitted":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "approved_by_manager":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30";
      case "pending_approval":
      default:
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 fa-num">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {t("title")}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {t("subtitle")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsUploadDocOpen(true)}
            className="rounded-xl text-xs gap-1.5 h-8.5 cursor-pointer shadow-2xs"
          >
            <Plus className="size-3.5" />
            <span>{t("uploadDoc")}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsComposeOpen(true)}
            className="rounded-xl text-xs font-semibold gap-1.5 h-8.5 cursor-pointer shadow-2xs"
          >
            <Send className="size-3.5 rtl:rotate-180" />
            <span>{t("composeTransmittal")}</span>
          </Button>
        </div>
      </div>

      {/* ── Main Outlook-Style Multi-Panel Layout ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[560px]">
        {/* ── Panel 1: Outlook Navigation Sidebar (3 Cols) ── */}
        <div className="lg:col-span-3 rounded-2xl border border-border/60 bg-white dark:bg-card p-3 shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
            پوشه‌ها و کارتابل ترنسمیتال
          </span>

          <button
            type="button"
            onClick={() => setActiveFolder("inbox")}
            className={cn(
              "w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-start",
              activeFolder === "inbox"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-amber-500" />
              <span>{t("inboxTab")}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              {pendingTransmittals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder("ready")}
            className={cn(
              "w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-start",
              activeFolder === "ready"
                ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-teal-500" />
              <span>{t("readyTab")}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {approvedTransmittals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder("sent")}
            className={cn(
              "w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-start",
              activeFolder === "sent"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <div className="flex items-center gap-2">
              <Send className="size-4 text-primary rtl:rotate-180" />
              <span>{t("sentTab")}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {approvedTransmittals.length}
            </span>
          </button>

          <div className="h-px bg-border/50 my-1" />

          <button
            type="button"
            onClick={() => setActiveFolder("allDocs")}
            className={cn(
              "w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-start",
              activeFolder === "allDocs"
                ? "bg-slate-100 dark:bg-slate-800 text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-sky-500" />
              <span>{t("allDocsTab")}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {vdisDocs.length}
            </span>
          </button>

          {/* DMS Path Quick Info */}
          <div className="mt-4 p-2.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground">
              مسیر شبکه آرشیو DMS:
            </span>
            <span className="text-[10px] font-mono text-primary truncate" title={project.dmsNetworkPath}>
              {project.dmsNetworkPath}
            </span>
          </div>
        </div>

        {/* ── Panel 2 & 3: Email Items List + Preview (9 Cols) ── */}
        <div className="lg:col-span-9 rounded-2xl border border-border/60 bg-white dark:bg-card shadow-xs overflow-hidden flex flex-col min-h-[560px]">
          {activeFolder === "allDocs" ? (
            /* ── Master Document Register (VDIS Full Table) ── */
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">
                  فهرست ماتریس مستندات وندور (VDIS / MDR)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {vdisDocs.length} مدرک ثبت‌شده
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground">
                      <th className="p-2.5 text-start">{t("docNumber")}</th>
                      <th className="p-2.5 text-start">{t("docTitle")}</th>
                      <th className="p-2.5 text-start">{t("revision")}</th>
                      <th className="p-2.5 text-start">{t("category")}</th>
                      <th className="p-2.5 text-start">{t("status")}</th>
                      <th className="p-2.5 text-end">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {vdisDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/15 transition-colors">
                        <td className="p-2.5 font-mono text-primary font-bold">
                          {doc.docNumber}
                        </td>
                        <td className="p-2.5 font-medium text-foreground max-w-[220px] truncate">
                          {doc.title}
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold">
                            {doc.revision}
                          </span>
                        </td>
                        <td className="p-2.5 text-muted-foreground">{doc.category}</td>
                        <td className="p-2.5">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                              getStatusBadge(doc.status)
                            )}
                          >
                            {t(`statuses.${doc.status}`)}
                          </span>
                        </td>
                        <td className="p-2.5 text-end">
                          <button
                            type="button"
                            onClick={() => alert(`دانلود سند: ${doc.docNumber}`)}
                            className="size-7 rounded-lg border border-border/60 inline-flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Download className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ── Transmittals Mailbox View (Split: List on left, Email Reader on right) ── */
            <div className="grid grid-cols-1 md:grid-cols-12 h-full flex-1 divide-y md:divide-y-0 md:divide-x md:rtl:divide-x-reverse divide-border/60">
              {/* Mail Items List (5 Cols) */}
              <div className="md:col-span-5 flex flex-col p-2.5 gap-2 overflow-y-auto max-h-[560px]">
                {transmittals.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    ترنسمیتالی در این بخش وجود ندارد.
                  </div>
                ) : (
                  transmittals.map((tr) => {
                    const isSelected = selectedTransmittal?.id === tr.id;
                    const isPending = tr.status === "pending_manager";

                    return (
                      <div
                        key={tr.id}
                        onClick={() => setSelectedTransmittalId(tr.id)}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5",
                          isSelected
                            ? "bg-primary/5 border-primary/40 shadow-xs"
                            : "bg-white dark:bg-card border-border/60 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-primary">
                            {tr.transmittalNo}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {tr.sentDate || tr.activities[0]?.timestamp}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-foreground line-clamp-1">
                          {tr.subject}
                        </h4>

                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          گیرنده: {tr.recipientCompany}
                        </span>

                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full font-semibold border",
                              isPending
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            )}
                          >
                            {isPending
                              ? t("statuses.pending_approval")
                              : t("statuses.transmitted")}
                          </span>

                          <span className="text-muted-foreground">
                            {tr.documents?.length || 2} سند ضمیمه
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Email / Transmittal Reader View (7 Cols) */}
              <div className="md:col-span-7 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[560px]">
                {selectedTransmittal ? (
                  <div className="flex flex-col gap-4">
                    {/* Notice for Manager Approval */}
                    {selectedTransmittal.status === "pending_manager" ? (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                        <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">
                            {t("managerPendingNotice")}
                          </span>
                          <span className="text-[11px] opacity-80">
                            این مدرک توسط مهندس پروژه آماده شده و برای ارسال به ایمیل کارفرما نیاز به امضا و تایید مدیر دارد.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                        <span className="font-semibold">
                          {t("managerApprovedNotice")} (تاییدکننده: {selectedTransmittal.approverManagerName || "مدیر ارشد"})
                        </span>
                      </div>
                    )}

                    {/* Transmittal Formal Header */}
                    <div className="p-3.5 rounded-xl bg-muted/15 border border-border/50 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-semibold">
                            کد ترنسمیتال:
                          </span>
                          <span className="font-mono font-bold text-primary text-sm">
                            {selectedTransmittal.transmittalNo}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-[11px]">
                          تاریخ تنظیم: {selectedTransmittal.sentDate || "امروز"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-[11px]">
                        <div>
                          <span className="text-muted-foreground font-semibold">به (To): </span>
                          <span className="font-bold text-foreground">
                            {selectedTransmittal.recipientCompany} ({selectedTransmittal.recipientEmail})
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-semibold">رونوشت (CC): </span>
                          <span className="text-muted-foreground">
                            {selectedTransmittal.ccEmails?.join("، ") || "مدیر مهندسی"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-semibold">فرستنده: </span>
                          <span className="font-bold text-foreground">
                            {selectedTransmittal.senderName} ({selectedTransmittal.senderRole})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        موضوع (Subject):
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-foreground">
                        {selectedTransmittal.subject}
                      </h3>
                    </div>

                    {/* Cover Letter Body */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-card border border-border/40 text-xs sm:text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {selectedTransmittal.coverLetterText}
                    </div>

                    {/* Attached VDIS Documents */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Paperclip className="size-3.5 text-primary" />
                        <span>مدارک و نقشه‌های ضمیمه این ترنسمیتال:</span>
                      </span>

                      <div className="flex flex-col gap-1.5">
                        {(selectedTransmittal.documents?.length > 0
                          ? selectedTransmittal.documents
                          : vdisDocs.slice(0, 2)
                        ).map((doc) => (
                          <div
                            key={doc.id}
                            className="p-2.5 rounded-xl border border-border/60 bg-white dark:bg-card flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCode className="size-4 text-amber-500 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-primary font-bold text-xs">
                                    {doc.docNumber}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-muted text-[9px] font-bold">
                                    {doc.revision}
                                  </span>
                                </div>
                                <span className="text-[11px] text-foreground truncate">
                                  {doc.title}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => alert(`دانلود فایل: ${doc.docNumber}`)}
                              className="size-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Download className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Upstream Manager Approval Actions ── */}
                    {selectedTransmittal.status === "pending_manager" && (
                      isManager || roleMode === "admin" ? (
                        <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                          <div className="flex flex-col text-xs">
                            <span className="font-bold text-foreground">
                              {t("managerActionTitle")}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {t("managerActionDesc")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const reason = prompt("علت عدم تایید ترنسمیتال را بنویسید:");
                                if (reason) {
                                  onManagerRejectTransmittal(
                                    selectedTransmittal.id,
                                    currentUserName || "مدیر مهندسی",
                                    reason
                                  );
                                }
                              }}
                              className="rounded-xl text-xs gap-1 cursor-pointer flex-1 sm:flex-none"
                            >
                              <X className="size-3.5" />
                              <span>{t("rejectByManager")}</span>
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                onManagerApproveTransmittal(
                                  selectedTransmittal.id,
                                  currentUserName || "مدیر مهندسی",
                                  "مستندات کنترل و جهت ارسال رسمی به کارفرما تایید گردید."
                                )
                              }
                              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-2xs flex-1 sm:flex-none"
                            >
                              <Check className="size-3.5" />
                              <span>{t("approveByManager")}</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3 mt-2 text-xs text-amber-800 dark:text-amber-300">
                          <Clock className="size-4 shrink-0 text-amber-600 animate-pulse" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold">{t("pendingManagerNoticeForUser")}</span>
                            <span className="text-[11px] opacity-80">{t("pendingManagerNoticeForUserDesc")}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-xs text-muted-foreground">
                    یک ترنسمیتال را از لیست انتخاب کنید.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Compose Transmittal Modal (Outlook-like) ── */}
      {isComposeOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none"
          onClick={() => setIsComposeOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-card border border-border shadow-2xl overflow-hidden fa-num"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="size-4 text-primary rtl:rotate-180" />
                <h3 className="text-sm font-bold text-foreground">
                  تنظیم ترنسمیتال مهندسی جدید (Outlook Dispatch)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={handleComposeSubmit}
              className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">
                    شماره ترنسمیتال:
                  </label>
                  <Input
                    value={transmittalNo}
                    onChange={(e) => setTransmittalNo(e.target.value)}
                    className="font-mono text-xs rounded-xl"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">
                    شرکت کارفرما:
                  </label>
                  <Input
                    value={recipientCompany}
                    onChange={(e) => setRecipientCompany(e.target.value)}
                    className="text-xs rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">
                    ایمیل کارفرما (To):
                  </label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="text-xs rounded-xl font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">
                    رونوشت مدیران و آرشیو (CC):
                  </label>
                  <Input
                    value={ccEmails}
                    onChange={(e) => setCcEmails(e.target.value)}
                    className="text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">موضوع:</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-xs rounded-xl font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">
                  متن کاور لتر (Cover Letter):
                </label>
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="text-xs rounded-xl min-h-[75px] resize-none"
                  required
                />
              </div>

              {/* Select VDIS Documents to Attach */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/20 border border-border/50">
                <span className="font-bold text-foreground">
                  انتخاب اسناد VDIS جهت الحاق به این ترنسمیتال:
                </span>
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                  {vdisDocs.map((doc) => {
                    const isChecked = selectedDocIds.includes(doc.id);
                    return (
                      <label
                        key={doc.id}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/40 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocIds([...selectedDocIds, doc.id]);
                              } else {
                                setSelectedDocIds(selectedDocIds.filter((id) => id !== doc.id));
                              }
                            }}
                            className="size-3.5 rounded accent-primary cursor-pointer"
                          />
                          <span className="font-mono font-bold text-primary">
                            {doc.docNumber}
                          </span>
                          <span className="truncate max-w-[200px]">{doc.title}</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded bg-muted text-[9px] font-bold">
                          {doc.revision}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComposeOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="font-bold gap-1.5"
                >
                  <Send className="size-3.5 rtl:rotate-180" />
                  <span>ارسال به کارتابل مدیر بالادستی</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Upload Doc Modal ── */}
      {isUploadDocOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none"
          onClick={() => setIsUploadDocOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-card border border-border shadow-2xl p-4 fa-num flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="text-sm font-bold text-foreground">
                بارگذاری سند مهندسی در شاخص VDIS
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadDocOpen(false)}
                className="size-6 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocSubmit} className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">کد مدرک:</label>
                <Input
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="font-mono text-xs rounded-xl"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">عنوان مدرک:</label>
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="مثلا: P&ID Diagram or Stress Analysis"
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">رده مدرک:</label>
                  <Input
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">نگارش (Rev):</label>
                  <Input
                    value={docRevision}
                    onChange={(e) => setDocRevision(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUploadDocOpen(false)}
                >
                  انصراف
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  ثبت در سامانه VDIS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
