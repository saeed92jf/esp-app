"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ScrollText,
  RotateCw,
  Search,
  Filter,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  User,
  Clock,
  LogIn,
  LogOut,
  FolderPlus,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Laptop,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services";
import { SystemAuditLog } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminAuditLogsViewProps {
  currentUser?: any;
}

function formatJalaliAndRelative(isoString?: string, isRtl = false): { full: string; relative: string } {
  if (!isoString) return { full: "-", relative: "-" };
  try {
    const d = new Date(isoString);
    const full = new Intl.DateTimeFormat(isRtl ? "fa-IR-u-ca-persian" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);

    const diffMs = Date.now() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    let relative = "";
    if (diffSec < 60) relative = isRtl ? "هم‌اکنون" : "Just now";
    else if (diffSec < 3600) relative = isRtl ? `${Math.floor(diffSec / 60)} دقیقه پیش` : `${Math.floor(diffSec / 60)}m ago`;
    else if (diffSec < 86400) relative = isRtl ? `${Math.floor(diffSec / 3600)} ساعت پیش` : `${Math.floor(diffSec / 3600)}h ago`;
    else relative = isRtl ? `${Math.floor(diffSec / 86400)} روز پیش` : `${Math.floor(diffSec / 86400)}d ago`;

    return { full, relative };
  } catch {
    return { full: isoString, relative: "-" };
  }
}

export function AdminAuditLogsView({ currentUser }: AdminAuditLogsViewProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspection modal
  const [selectedLog, setSelectedLog] = useState<SystemAuditLog | null>(null);

  // Clear confirmation modal
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchLogs = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      const res = await api.admin.getAuditLogs({
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        severity: severityFilter !== "all" ? severityFilter : undefined,
        search: searchQuery.trim() || undefined,
        limit: 100,
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
      if (!isSilent) {
        toast.error(isRtl ? "خطا در دریافت لاگ‌های سیستم" : "Failed to load audit logs");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryFilter, severityFilter, searchQuery, isRtl]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Real-time polling every 10s if auto-refresh is active
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const handleClearLogs = async () => {
    try {
      setIsClearing(true);
      await api.admin.clearAuditLogs();
      setLogs([]);
      setTotal(0);
      setClearModalOpen(false);
      toast.success(isRtl ? "تمام لاگ‌های سیستم با موفقیت پاک شدند." : "All audit logs cleared successfully.");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در پاکسازی لاگ‌ها" : "Failed to clear logs"));
    } finally {
      setIsClearing(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const authCount = logs.filter((l) => l.category === "auth").length;
    const adminCount = logs.filter((l) => l.category === "admin").length;
    const tasksCount = logs.filter((l) => l.category === "tasks" || l.category === "projects").length;
    const reqsCount = logs.filter((l) => l.category === "requests").length;
    return { authCount, adminCount, tasksCount, reqsCount };
  }, [logs]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "auth":
        return {
          label: isRtl ? "ورود / خروج" : "Auth",
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: LogIn,
        };
      case "admin":
        return {
          label: isRtl ? "مدیریت ادمین" : "Admin Action",
          className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          icon: ShieldCheck,
        };
      case "requests":
        return {
          label: isRtl ? "درخواست‌ها" : "Requests",
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: ShieldAlert,
        };
      case "tasks":
        return {
          label: isRtl ? "تسک‌ها" : "Tasks",
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "projects":
        return {
          label: isRtl ? "پروژه‌ها" : "Projects",
          className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
          icon: FolderPlus,
        };
      default:
        return {
          label: isRtl ? "سیستم" : "System",
          className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          icon: Laptop,
        };
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "success":
        return {
          label: isRtl ? "موفق" : "Success",
          dotColor: "bg-emerald-500",
          className: "text-emerald-600 dark:text-emerald-400",
        };
      case "warning":
        return {
          label: isRtl ? "هشدار" : "Warning",
          dotColor: "bg-amber-500",
          className: "text-amber-600 dark:text-amber-400",
        };
      case "error":
        return {
          label: isRtl ? "خطا" : "Error",
          dotColor: "bg-red-500",
          className: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          label: isRtl ? "اطلاعات" : "Info",
          dotColor: "bg-blue-500",
          className: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-[1600px] mx-auto pb-8 gap-4 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="size-12 sm:size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <ScrollText className="size-6 sm:size-7" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  {isRtl ? "لاگ‌های سیستم و رهگیری فعالیت‌ها" : "System Audit & Activity Logs"}
                </h1>
                <Badge variant="outline" className="text-[11px] font-bold border-primary/30 text-primary bg-primary/5">
                  {isRtl ? "اختصاصی سوپر ادمین" : "Super Admin Only"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {isRtl
                  ? "ثبت رویدادهای زنده ورود و خروج، درخواست‌ها، تغییرات سطح دسترسی و وقایع تسک‌ها و پروژه‌ها"
                  : "Audit trail for authentications, account requests, role revisions, and task lifecycles"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Auto refresh pill */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "h-9 px-3 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5 cursor-pointer",
                autoRefresh
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              <span className={cn("size-2 rounded-full", autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40")} />
              <span>{isRtl ? (autoRefresh ? "به‌روزرسانی زنده فعال" : "به‌روزرسانی خودکار خاموش") : (autoRefresh ? "Live Sync On" : "Live Sync Off")}</span>
            </button>

            {/* Manual refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs()}
              disabled={refreshing}
              className="h-9 rounded-xl gap-1.5 cursor-pointer"
            >
              <RotateCw className={cn("size-3.5", refreshing && "animate-spin")} />
              <span>{isRtl ? "به‌روزرسانی" : "Refresh"}</span>
            </Button>

            {/* Clear all logs */}
            {logs.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setClearModalOpen(true)}
                className="h-9 rounded-xl gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>{isRtl ? "پاکسازی لاگ‌ها" : "Clear Logs"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 sm:mt-5 pt-4 border-t border-border/40">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{isRtl ? "کل وقایع ثبت‌شده" : "Total Events"}</span>
            <span className="text-sm sm:text-base font-extrabold text-foreground fa-num">{total}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{isRtl ? "ورود و خروج" : "Auth Events"}</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 fa-num">{stats.authCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-center justify-between">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{isRtl ? "عملیات مدیریتی" : "Admin Actions"}</span>
            <span className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400 fa-num">{stats.adminCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{isRtl ? "تسک‌ها و پروژه‌ها" : "Tasks & Projects"}</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 fa-num">{stats.tasksCount}</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border border-border/40 p-3 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "جستجو در وقایع، نام کاربر، ایمیل، شناسه..." : "Search in events, user, email..."}
            className="ps-9 pe-3 h-9 text-xs rounded-xl bg-muted/30"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: "all", label: isRtl ? "همه دسته‌ها" : "All" },
            { id: "auth", label: isRtl ? "ورود/خروج" : "Auth" },
            { id: "admin", label: isRtl ? "ادمین" : "Admin" },
            { id: "requests", label: isRtl ? "درخواست‌ها" : "Requests" },
            { id: "tasks", label: isRtl ? "تسک‌ها" : "Tasks" },
            { id: "projects", label: isRtl ? "پروژه‌ها" : "Projects" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                categoryFilter === cat.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Severity Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 border-t md:border-t-0 md:border-s border-border/40 pt-2 md:pt-0 md:ps-3">
          {[
            { id: "all", label: isRtl ? "همه وضعیت‌ها" : "All Severities" },
            { id: "success", label: isRtl ? "موفق" : "Success", color: "text-emerald-500" },
            { id: "info", label: isRtl ? "اطلاعات" : "Info", color: "text-blue-500" },
            { id: "warning", label: isRtl ? "هشدار" : "Warning", color: "text-amber-500" },
          ].map((sev) => (
            <button
              key={sev.id}
              type="button"
              onClick={() => setSeverityFilter(sev.id)}
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5",
                severityFilter === sev.id
                  ? "bg-foreground text-background shadow-2xs font-bold"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {sev.color && <span className={cn("size-1.5 rounded-full", sev.id === "success" ? "bg-emerald-500" : sev.id === "warning" ? "bg-amber-500" : "bg-blue-500")} />}
              <span>{sev.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Logs List / Table Stream ── */}
      <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <RotateCw className="size-8 text-primary animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">{isRtl ? "در حال بارگذاری لاگ‌های سیستم..." : "Loading system logs..."}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/50 mb-3">
              <ScrollText className="size-8" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {isRtl ? "هیچ لاگی یافت نشد" : "No Audit Logs Found"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {isRtl
                ? "هیچ رویدادی مطابق با فیلترهای انتخابی شما در پایگاه لاگ‌ها ثبت نشده است."
                : "No events match the selected criteria in the audit log archive."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {logs.map((log) => {
              const catInfo = getCategoryBadge(log.category);
              const sevInfo = getSeverityBadge(log.severity);
              const timeInfo = formatJalaliAndRelative(log.timestamp, isRtl);
              const CatIcon = catInfo.icon;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-3.5 sm:p-4 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {/* Category Icon */}
                    <div className="size-10 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center shrink-0 text-foreground/80 group-hover:text-primary transition-colors">
                      <CatIcon className="size-5" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Severity Dot */}
                        <span className={cn("size-2 rounded-full shrink-0", sevInfo.dotColor)} />

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {isRtl ? log.titleFa || log.title : log.titleEn || log.title}
                        </h4>

                        {/* Category Badge */}
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", catInfo.className)}>
                          {catInfo.label}
                        </span>

                        {/* Action key */}
                        <span className="text-[10px] font-mono text-muted-foreground/60 hidden md:inline-block">
                          {log.action}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {isRtl ? log.descriptionFa || log.description : log.descriptionEn || log.description}
                      </p>

                      {/* Actor & Target Meta on Mobile */}
                      <div className="flex items-center gap-2 mt-1 sm:hidden text-[11px] text-muted-foreground flex-wrap">
                        <span className="font-semibold text-foreground">{log.actorName || log.actorId}</span>
                        {log.targetName && (
                          <>
                            <span>•</span>
                            <span className="truncate">هدف: {log.targetName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actor, Target, and Timestamp (Desktop) */}
                  <div className="flex items-center gap-4 shrink-0 sm:self-center justify-between sm:justify-end">
                    {/* Actor Details */}
                    <div className="hidden sm:flex flex-col items-end text-end min-w-[130px]">
                      <span className="text-xs font-bold text-foreground truncate max-w-[140px]">
                        {log.actorName || log.actorId || "سیستم"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                        {log.actorRole || "system"}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex flex-col items-start sm:items-end text-start sm:text-end shrink-0">
                      <span className="text-xs font-semibold text-foreground fa-num">
                        {timeInfo.relative}
                      </span>
                      <span className="text-[10px] text-muted-foreground fa-num">
                        {timeInfo.full}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Log Details Dialog ── */}
      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ScrollText className="size-5 text-primary" />
              <span>{isRtl ? "جزئیات رویداد سیستم" : "Audit Event Details"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="flex-1 overflow-y-auto space-y-3.5 py-2 text-xs">
              <div className="bg-muted/40 p-3 rounded-xl border border-border/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">
                    {isRtl ? selectedLog.titleFa || selectedLog.title : selectedLog.titleEn || selectedLog.title}
                  </span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getCategoryBadge(selectedLog.category).className)}>
                    {getCategoryBadge(selectedLog.category).label}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {isRtl ? selectedLog.descriptionFa || selectedLog.description : selectedLog.descriptionEn || selectedLog.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "عامل (کاربر)" : "Actor"}</span>
                  <span className="font-semibold text-foreground">{selectedLog.actorName || selectedLog.actorId}</span>
                  {selectedLog.actorEmail && <span className="block text-[10px] text-muted-foreground">{selectedLog.actorEmail}</span>}
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نقش عامل" : "Actor Role"}</span>
                  <span className="font-semibold text-foreground">{selectedLog.actorRole || "system"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نوع عملیات" : "Action Key"}</span>
                  <span className="font-mono text-foreground font-semibold">{selectedLog.action}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "شدت" : "Severity"}</span>
                  <span className="font-semibold text-foreground">{selectedLog.severity}</span>
                </div>
              </div>

              {selectedLog.targetName && (
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "هدف عملیات" : "Target"}</span>
                  <span className="font-semibold text-foreground">{selectedLog.targetName} ({selectedLog.targetType || "entity"})</span>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "زمان دقیق ثبت" : "Exact Timestamp"}</span>
                <span className="font-mono text-foreground fa-num">
                  {formatJalaliAndRelative(selectedLog.timestamp, isRtl).full} ({selectedLog.timestamp})
                </span>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-foreground mb-1 block">{isRtl ? "اطلاعات تکمیلی (متادیتا)" : "Metadata"}</span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)} className="rounded-xl">
              {isRtl ? "بستن" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Clear Logs Confirmation Dialog ── */}
      <Dialog open={clearModalOpen} onOpenChange={setClearModalOpen}>
        <DialogContent className="max-w-md font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              <span>{isRtl ? "پاکسازی کامل لاگ‌های سیستم" : "Clear All Audit Logs"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {isRtl
                ? "آیا از پاکسازی تمامی لاگ‌های ثبت‌شده سیستم اطمینان دارید؟ این عملیات غیرقابل بازگشت است و فقط توسط سوپر ادمین مجاز می‌باشد."
                : "Are you sure you want to permanently clear all system audit logs? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearModalOpen(false)}
              disabled={isClearing}
              className="rounded-xl"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearLogs}
              disabled={isClearing}
              className="rounded-xl gap-1.5"
            >
              {isClearing ? <RotateCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              <span>{isRtl ? "بله، پاکسازی کن" : "Yes, Clear All"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

