// src/modules/bug-reports/components/BugReportDetailView.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Shield,
  Monitor,
  Camera,
  Download,
  MessageSquare,
  Lock,
  Send,
  Loader2,
  FileText,
  Activity,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { bugReportsService } from "../services/bug-reports.service";
import type { BugReport, BugStatus, BugPriority } from "../types";

interface BugReportDetailViewProps {
  report: BugReport;
  onBack: () => void;
  onUpdated: (updated: BugReport) => void;
}

const ALL_STATUSES: BugStatus[] = [
  "New",
  "Under Review",
  "Confirmed",
  "Assigned",
  "In Progress",
  "Testing",
  "Resolved",
  "Closed",
  "Rejected",
  "Reopened",
];

const ALL_PRIORITIES: BugPriority[] = ["Low", "Medium", "High", "Urgent"];

export function BugReportDetailView({
  report,
  onBack,
  onUpdated,
}: BugReportDetailViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user } = useAuth();

  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);

  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);

  const isStaff =
    user?.role === "superadmin" ||
    user?.role === "admin" ||
    user?.role === "dept_admin" ||
    user?.role === "office_admin";

  const handleStatusChange = async (newStatus: BugStatus) => {
    if (newStatus === report.status) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await bugReportsService.updateStatus(
        report.id,
        newStatus,
        undefined,
        {
          id: user?.id || "u-staff",
          name: user?.fullName || user?.name || "Staff",
        }
      );
      onUpdated(updated);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: BugPriority) => {
    if (newPriority === report.priority) return;
    setIsUpdatingPriority(true);
    try {
      const updated = await bugReportsService.changePriority(
        report.id,
        newPriority,
        {
          id: user?.id || "u-staff",
          name: user?.fullName || user?.name || "Staff",
        }
      );
      onUpdated(updated);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssignSelf = async () => {
    setIsUpdatingAssignee(true);
    try {
      const updated = await bugReportsService.assignReport(
        report.id,
        {
          id: user?.id,
          name: user?.fullName || user?.name,
          email: user?.email,
        },
        {
          id: user?.id || "u-staff",
          name: user?.fullName || user?.name || "Staff",
        }
      );
      onUpdated(updated);
    } finally {
      setIsUpdatingAssignee(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await bugReportsService.addComment(
        report.id,
        commentText.trim(),
        isInternal,
        {
          id: user?.id || "u-guest",
          name: user?.fullName || user?.name || "User",
          role: user?.role,
          avatar: user?.avatar,
        }
      );
      // Refresh report
      const fresh = await bugReportsService.getBugReportById(report.id);
      onUpdated(fresh);
      setCommentText("");
      setIsInternal(false);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl h-9 px-3 gap-1.5 cursor-pointer shrink-0"
          >
            <BackIcon className="size-4" />
            <span>{isRtl ? "بازگشت" : "Back"}</span>
          </Button>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary">
                {report.ticketNumber}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                {report.category}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
              {report.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-bold border",
              report.severity === "Critical"
                ? "bg-red-500/10 text-red-600 border-red-500/30"
                : report.severity === "High"
                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            {report.severity}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-lg px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary border-primary/20"
          >
            {report.status}
          </Badge>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Section */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span>{isRtl ? "شرح خطا و گزارش ارسالی" : "Description & Reproduction"}</span>
            </h3>
            <div className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-muted/20 border border-border/50">
              {report.description}
            </div>
          </div>

          {/* Screenshot Preview */}
          {report.screenshotDataUrl && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Camera className="size-4 text-primary" />
                <span>{isRtl ? "تصویر پیوست صفحه (Screenshot)" : "Page Screenshot"}</span>
              </h3>
              <div
                onClick={() => setScreenshotModalOpen(true)}
                className="relative rounded-xl overflow-hidden border border-border/70 cursor-pointer group"
              >
                <img
                  src={report.screenshotDataUrl}
                  alt="Screenshot"
                  className="w-full max-h-72 object-cover object-top transition-transform duration-200 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  {isRtl ? "کلیک برای مشاهده اندازه واقعی" : "Click to view full size"}
                </div>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {report.attachments && report.attachments.length > 0 && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Download className="size-4 text-primary" />
                <span>{isRtl ? "فایل‌های ضمیمه" : "Attachments"}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {report.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    download={att.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-border/70 hover:border-primary bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pe-2">
                      <div className="text-xs font-bold text-foreground truncate group-hover:text-primary">
                        {att.fileName}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {(att.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <Download className="size-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments & Discussion */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <span>{isRtl ? "گفتگو و پیگیری‌های تیکت" : "Discussion & Updates"}</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-3">
              {(!report.comments || report.comments.length === 0) ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {isRtl ? "تاکنون پیامی برای این تیکت ثبت نشده است." : "No comments yet."}
                </div>
              ) : (
                report.comments
                  .filter((c) => !c.isInternal || isStaff)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "p-3.5 rounded-xl border text-xs space-y-1.5",
                        c.isInternal
                          ? "bg-amber-500/[0.06] border-amber-500/20"
                          : "bg-muted/30 border-border/60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{c.userName}</span>
                          {c.userRole && (
                            <span className="text-[10px] text-muted-foreground">({c.userRole})</span>
                          )}
                          {c.isInternal && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
                              <Lock className="size-2.5" />
                              <span>{isRtl ? "یادداشت داخلی" : "Internal Note"}</span>
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(c.createdAt).toLocaleString(isRtl ? "fa-IR" : "en-US")}
                        </span>
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{c.comment}</p>
                    </div>
                  ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3 pt-2 border-t border-border/60">
              <Textarea
                placeholder={isRtl ? "پاسخ یا نظر خود را بنویسید..." : "Write a comment or note..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                required
                className="rounded-xl text-xs resize-none"
              />

              <div className="flex items-center justify-between">
                {isStaff ? (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Lock className="size-3 text-amber-500" />
                      <span>{isRtl ? "یادداشت داخلی (فقط مدیران و کارشناسان)" : "Internal note (Staff only)"}</span>
                    </span>
                  </label>
                ) : <div />}

                <Button
                  type="submit"
                  disabled={isSubmittingComment}
                  size="sm"
                  className="rounded-xl px-5 text-xs font-bold gap-1.5 bg-primary text-white cursor-pointer"
                >
                  {isSubmittingComment ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  <span>{isRtl ? "ارسال پیام" : "Post Comment"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Activity Logs Timeline */}
          {report.activityLogs && report.activityLogs.length > 0 && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <span>{isRtl ? "تاریخچه و ممیزی رویدادها (Audit Trail)" : "Activity Timeline"}</span>
              </h3>
              <div className="space-y-2.5">
                {report.activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-foreground me-1.5">{log.userName}</span>
                      <span className="text-muted-foreground">{log.description}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right / Sidebar Column */}
        <div className="space-y-5">
          {/* Workflow Status Controls */}
          {isStaff && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground">
                {isRtl ? "مدیریت وضعیت تیکت" : "Workflow Status"}
              </h3>
              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground block">
                  {isRtl ? "تغییر مرحله کار:" : "Change State:"}
                </label>
                <select
                  value={report.status}
                  onChange={(e) => handleStatusChange(e.target.value as BugStatus)}
                  disabled={isUpdatingStatus}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-[11px] text-muted-foreground block">
                  {isRtl ? "اولویت رسیدگی:" : "Priority:"}
                </label>
                <select
                  value={report.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as BugPriority)}
                  disabled={isUpdatingPriority}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {ALL_PRIORITIES.map((pr) => (
                    <option key={pr} value={pr}>{pr}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAssignSelf}
                  disabled={isUpdatingAssignee || report.assigneeId === user?.id}
                  className="w-full rounded-xl text-xs h-9 cursor-pointer"
                >
                  {report.assigneeId === user?.id
                    ? isRtl ? "ارجاع‌شده به شما" : "Assigned to You"
                    : isRtl ? "ارجاع تیکت به من" : "Assign to Me"}
                </Button>
              </div>
            </div>
          )}

          {/* Technical Environment Details */}
          {report.environment && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Monitor className="size-4 text-primary" />
                <span>{isRtl ? "مشخصات محیط فنی (Smart Capture)" : "Environment Details"}</span>
              </h3>

              <div className="divide-y divide-border/40 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{isRtl ? "مرورگر:" : "Browser:"}</span>
                  <span className="font-semibold text-foreground">
                    {report.environment.browserName || "Unknown"} {report.environment.browserVersion}
                  </span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{isRtl ? "سیستم‌عامل:" : "OS:"}</span>
                  <span className="font-semibold text-foreground">{report.environment.os || "Unknown"}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{isRtl ? "نوع دستگاه:" : "Device:"}</span>
                  <span className="font-semibold text-foreground">{report.environment.deviceType || "Desktop"}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{isRtl ? "ابعاد مانیتور:" : "Resolution:"}</span>
                  <span className="font-mono text-muted-foreground">{report.environment.screenResolution}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{isRtl ? "عرض فریم:" : "Viewport:"}</span>
                  <span className="font-mono text-muted-foreground">{report.environment.viewportDimensions}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{isRtl ? "ماژول:" : "Module:"}</span>
                  <span className="font-semibold text-primary uppercase">{report.moduleId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reporter Information */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <User className="size-4 text-primary" />
              <span>{isRtl ? "اطلاعات فرستنده" : "Reporter Info"}</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-foreground">{report.reporterName}</div>
              {report.reporterEmail && (
                <div className="text-muted-foreground font-mono text-[11px]">{report.reporterEmail}</div>
              )}
              {report.reporterRole && (
                <Badge variant="outline" className="text-[10px] mt-1">
                  {report.reporterRole}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

