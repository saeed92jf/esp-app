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
  Download,
  Copy,
  Check,
  Package,
  Building2,
  Briefcase,
  Users,
  Calendar,
  Activity,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services";
import { SystemAuditLog } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatPersonName, formatRoleName } from "@/lib/person-names";
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

type TimeRangeFilter = "all" | "today" | "24h" | "7d" | "30d";

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
  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspection modal
  const [selectedLog, setSelectedLog] = useState<SystemAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

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
        limit: 200,
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

  // Time-filtered logs
  const filteredLogs = useMemo(() => {
    if (timeFilter === "all") return logs;
    const now = Date.now();
    return logs.filter((log) => {
      if (!log.timestamp) return true;
      const logTime = new Date(log.timestamp).getTime();
      const diffHours = (now - logTime) / (1000 * 3600);

      if (timeFilter === "today") {
        const d = new Date(log.timestamp);
        const today = new Date();
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      }
      if (timeFilter === "24h") return diffHours <= 24;
      if (timeFilter === "7d") return diffHours <= 24 * 7;
      if (timeFilter === "30d") return diffHours <= 24 * 30;
      return true;
    });
  }, [logs, timeFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const authCount = logs.filter((l) => l.category === "auth").length;
    const adminCount = logs.filter((l) => l.category === "admin").length;
    const tasksCount = logs.filter((l) => l.category === "tasks" || l.category === "projects").length;
    const reqsCount = logs.filter((l) => l.category === "requests").length;
    const warnErrorCount = logs.filter((l) => l.severity === "warning" || l.severity === "error").length;
    return { authCount, adminCount, tasksCount, reqsCount, warnErrorCount };
  }, [logs]);

  const handleExportJson = () => {
    try {
      const dataStr = JSON.stringify(filteredLogs, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `esp-audit-logs-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(isRtl ? "فایل لاگ‌ها با موفقیت دانلود شد." : "Audit logs exported successfully.");
    } catch {
      toast.error(isRtl ? "خطا در خروجی لاگ‌ها" : "Failed to export audit logs.");
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast.success(isRtl ? "شناسه لاگ کپی شد." : "Log ID copied.");
  };

  const handleCopyJson = (log: SystemAuditLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
    toast.success(isRtl ? "کد کامل رویداد کپی شد." : "Full log event copied to clipboard.");
  };

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
      case "warehouse":
        return {
          label: isRtl ? "انبار و اقلام" : "Warehouse",
          className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          icon: Package,
        };
      case "assets":
        return {
          label: isRtl ? "اموال و دارایی‌ها" : "Assets",
          className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          icon: Briefcase,
        };
      case "customers":
        return {
          label: isRtl ? "مشتریان" : "Customers",
          className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
          icon: Users,
        };
      case "coding":
        return {
          label: isRtl ? "کدگذاری قطعات" : "Coding",
          className: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
          icon: FileCode,
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
    <div className="flex flex-col flex-1 w-full max-w-[1600px] mx-auto pb-8 gap-4 font-sans animate-in fade-in duration-150">
      {/* ── Top Header Banner ── */}
      <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="size-11 sm:size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <ScrollText className="size-5 sm:size-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                  {isRtl ? "سیستم جامع ثبت و رهگیری فعالیت‌ها (Audit Trail)" : "Comprehensive System Audit Trail"}
                </h1>
                <Badge variant="outline" className="text-[10px] h-5 font-bold border-primary/30 text-primary bg-primary/5">
                  {isRtl ? "امنیت و مانیتورینگ زنده" : "Live Security Monitor"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {isRtl
                  ? "ثبت خودکار تمامی حرکات، ورود/خروج، تغییرات دسترسی، جهش‌های دیتابیس و وقایع ماژول‌های سیستم"
                  : "Automatic logging for authentications, role revisions, database mutations, and module events"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Live Sync Toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "h-8 px-2.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0",
                autoRefresh
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              <span className={cn("size-2 rounded-full shrink-0", autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40")} />
              <span>{isRtl ? (autoRefresh ? "همگام‌سازی زنده" : "آفلاین") : (autoRefresh ? "Live Sync" : "Sync Off")}</span>
            </button>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs()}
              disabled={refreshing}
              className="h-8 rounded-xl gap-1.5 cursor-pointer text-xs whitespace-nowrap shrink-0"
            >
              <RotateCw className={cn("size-3 shrink-0", refreshing && "animate-spin")} />
              <span>{isRtl ? "به‌روزرسانی" : "Refresh"}</span>
            </Button>

            {/* Export JSON */}
            {filteredLogs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-8 rounded-xl gap-1.5 cursor-pointer text-xs whitespace-nowrap shrink-0 bg-background/80"
              >
                <Download className="size-3 text-primary shrink-0" />
                <span>{isRtl ? "خروجی JSON" : "Export JSON"}</span>
              </Button>
            )}

            {/* Clear All */}
            {logs.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setClearModalOpen(true)}
                className="h-8 rounded-xl gap-1.5 cursor-pointer text-xs whitespace-nowrap shrink-0"
              >
                <Trash2 className="size-3 shrink-0" />
                <span>{isRtl ? "پاکسازی" : "Clear"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── Summary KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-border/40">
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-between shadow-2xs">
            <span className="text-[11px] font-medium text-muted-foreground">{isRtl ? "کل وقایع" : "Total Events"}</span>
            <span className="text-sm sm:text-base font-extrabold text-foreground fa-num">{total}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center justify-between shadow-2xs">
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">{isRtl ? "ورود و خروج" : "Auth Events"}</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 fa-num">{stats.authCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-center justify-between shadow-2xs">
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">{isRtl ? "عملیات ادمین" : "Admin Actions"}</span>
            <span className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400 fa-num">{stats.adminCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between shadow-2xs">
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{isRtl ? "پروژه‌ها و تسک‌ها" : "Projects & Tasks"}</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 fa-num">{stats.tasksCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">{isRtl ? "هشدارها و خطاها" : "Alerts & Errors"}</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 fa-num">{stats.warnErrorCount}</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-2.5 bg-card border border-border/40 p-3 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "جستجو در وقایع، نام کاربر، ایمیل، اکشن، آدرس آی‌پی..." : "Search in events, user, email, action, IP..."}
              className="ps-8 pe-3 h-8 text-xs rounded-xl bg-muted/30 border-border/50"
            />
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] text-muted-foreground me-1 flex items-center gap-1 shrink-0 font-medium">
              <Calendar className="size-3 text-primary/70" />
              <span>{isRtl ? "بازه زمانی:" : "Time:"}</span>
            </span>
            {[
              { id: "all", label: isRtl ? "همه" : "All" },
              { id: "today", label: isRtl ? "امروز" : "Today" },
              { id: "24h", label: isRtl ? "۲۴ ساعت اخیر" : "24h" },
              { id: "7d", label: isRtl ? "۷ روز اخیر" : "7d" },
              { id: "30d", label: isRtl ? "۳۰ روز اخیر" : "30d" },
            ].map((tRange) => (
              <button
                key={tRange.id}
                type="button"
                onClick={() => setTimeFilter(tRange.id as TimeRangeFilter)}
                className={cn(
                  "h-7 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                  timeFilter === tRange.id
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tRange.label}
              </button>
            ))}
          </div>

          {/* Severity Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: "all", label: isRtl ? "همه وضعیت‌ها" : "All Severities" },
              { id: "success", label: isRtl ? "موفق" : "Success", color: "bg-emerald-500" },
              { id: "info", label: isRtl ? "اطلاعات" : "Info", color: "bg-blue-500" },
              { id: "warning", label: isRtl ? "هشدار" : "Warning", color: "bg-amber-500" },
              { id: "error", label: isRtl ? "خطا" : "Error", color: "bg-red-500" },
            ].map((sev) => (
              <button
                key={sev.id}
                type="button"
                onClick={() => setSeverityFilter(sev.id)}
                className={cn(
                  "h-7 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5",
                  severityFilter === sev.id
                    ? "bg-foreground text-background shadow-2xs font-bold"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {sev.color && <span className={cn("size-1.5 rounded-full", sev.color)} />}
                <span>{sev.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-border/30">
          <span className="text-[11px] text-muted-foreground me-1 flex items-center gap-1 shrink-0 font-medium">
            <Layers className="size-3 text-primary/70" />
            <span>{isRtl ? "دسته‌بندی:" : "Category:"}</span>
          </span>
          {[
            { id: "all", label: isRtl ? "همه ماژول‌ها" : "All" },
            { id: "auth", label: isRtl ? "احراز هویت" : "Auth" },
            { id: "admin", label: isRtl ? "مدیریت ادمین" : "Admin" },
            { id: "requests", label: isRtl ? "درخواست‌ها" : "Requests" },
            { id: "tasks", label: isRtl ? "تسک‌ها" : "Tasks" },
            { id: "projects", label: isRtl ? "پروژه‌ها" : "Projects" },
            { id: "warehouse", label: isRtl ? "انبار و کالا" : "Warehouse" },
            { id: "assets", label: isRtl ? "اموال و دارایی" : "Assets" },
            { id: "customers", label: isRtl ? "مشتریان" : "Customers" },
            { id: "coding", label: isRtl ? "کدگذاری" : "Coding" },
            { id: "system", label: isRtl ? "سیستم" : "System" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "h-7 px-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                categoryFilter === cat.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.label}
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
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/50 mb-3">
              <ScrollText className="size-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {isRtl ? "هیچ لاگی یافت نشد" : "No Audit Logs Found"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {isRtl
                ? "هیچ رویدادی مطابق با فیلترهای انتخابی در پایگاه لاگ‌ها ثبت نشده است."
                : "No events match the selected criteria in the audit log archive."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredLogs.map((log) => {
              const catInfo = getCategoryBadge(log.category);
              const sevInfo = getSeverityBadge(log.severity);
              const timeInfo = formatJalaliAndRelative(log.timestamp, isRtl);
              const CatIcon = catInfo.icon;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-3 sm:p-3.5 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {/* Category Icon */}
                    <div className="size-9 sm:size-10 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center shrink-0 text-foreground/80 group-hover:text-primary transition-colors">
                      <CatIcon className="size-4 sm:size-5" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Severity Dot */}
                        <span className={cn("size-2 rounded-full shrink-0", sevInfo.dotColor)} />

                        {/* Title */}
                        <h4 className="text-xs sm:text-[13px] font-bold text-foreground truncate">
                          {isRtl ? log.titleFa || log.title : log.titleEn || log.title}
                        </h4>

                        {/* Category Badge */}
                        <span className={cn("text-[9.5px] font-bold px-2 py-0.2 rounded-full border", catInfo.className)}>
                          {catInfo.label}
                        </span>

                        {/* Action key */}
                        <span className="text-[9.5px] font-mono text-muted-foreground/60 hidden md:inline-block">
                          {log.action}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                        {isRtl ? log.descriptionFa || log.description : log.descriptionEn || log.description}
                      </p>

                      {/* Actor & Target Meta on Mobile */}
                      <div className="flex items-center gap-2 mt-1 sm:hidden text-[10.5px] text-muted-foreground flex-wrap">
                        <span className="font-semibold text-foreground">
                          {log.actorName ? formatPersonName(log.actorName, locale) : log.actorId}
                        </span>
                        {log.targetName && (
                          <>
                            <span>•</span>
                            <span className="truncate">{isRtl ? `هدف: ${formatPersonName(log.targetName, locale)}` : `Target: ${formatPersonName(log.targetName, locale)}`}</span>
                          </>
                        )}
                        {log.ipAddress && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{log.ipAddress}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actor, Target, and Timestamp (Desktop) */}
                  <div className="flex items-center gap-4 shrink-0 sm:self-center justify-between sm:justify-end">
                    {/* IP Badge */}
                    {log.ipAddress && (
                      <span className="hidden xl:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/30">
                        {log.ipAddress}
                      </span>
                    )}

                    {/* Actor Details */}
                    <div className="hidden sm:flex flex-col items-end text-end min-w-[120px]">
                      <span className="text-xs font-bold text-foreground truncate max-w-[140px]">
                        {log.actorName ? formatPersonName(log.actorName, locale) : (log.actorId || (isRtl ? "سیستم" : "System"))}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                        {log.actorRole ? formatRoleName(log.actorRole, locale) : "system"}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex flex-col items-start sm:items-end text-start sm:text-end shrink-0 min-w-[85px]">
                      <span className="text-xs font-semibold text-foreground fa-num">
                        {timeInfo.relative}
                      </span>
                      <span className="text-[10px] text-muted-foreground fa-num">
                        {timeInfo.full.split(" ")[1] || timeInfo.full}
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
        <DialogContent className="max-w-xl max-h-[88vh] flex flex-col font-sans">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pe-6">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <ScrollText className="size-5 text-primary" />
                <span>{isRtl ? "شناسنامه و جزئیات رویداد" : "Audit Event Details"}</span>
              </DialogTitle>
              {selectedLog && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleCopyId(selectedLog.id)}
                  className="text-[11px] h-6 px-2 gap-1 rounded-lg border-border/60"
                >
                  {copiedId ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedId ? (isRtl ? "کپی شد" : "Copied") : (isRtl ? "کپی شناسه" : "Copy ID")}</span>
                </Button>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground font-mono truncate">
              {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="flex-1 overflow-y-auto space-y-3 py-1 text-xs custom-scrollbar">
              {/* Event Title & Description Box */}
              <div className="bg-muted/40 p-3 rounded-xl border border-border/40 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground text-sm">
                    {isRtl ? selectedLog.titleFa || selectedLog.title : selectedLog.titleEn || selectedLog.title}
                  </span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", getCategoryBadge(selectedLog.category).className)}>
                    {getCategoryBadge(selectedLog.category).label}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {isRtl ? selectedLog.descriptionFa || selectedLog.description : selectedLog.descriptionEn || selectedLog.description}
                </p>
              </div>

              {/* 2x2 Grid Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "عامل (کاربر)" : "Actor"}</span>
                  <span className="font-semibold text-foreground text-xs">
                    {selectedLog.actorName ? formatPersonName(selectedLog.actorName, locale) : selectedLog.actorId}
                  </span>
                  {selectedLog.actorEmail && <span className="block text-[10px] text-muted-foreground truncate">{selectedLog.actorEmail}</span>}
                </div>
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نقش سازمانی" : "Actor Role"}</span>
                  <span className="font-semibold text-foreground text-xs">
                    {selectedLog.actorRole ? formatRoleName(selectedLog.actorRole, locale) : "system"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "کلید عملیات (Action)" : "Action Key"}</span>
                  <span className="font-mono text-foreground font-semibold text-[11px] truncate block">{selectedLog.action}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "شدت رویداد" : "Severity"}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("size-2 rounded-full", getSeverityBadge(selectedLog.severity).dotColor)} />
                    <span className="font-semibold text-foreground text-xs">{getSeverityBadge(selectedLog.severity).label}</span>
                  </div>
                </div>
              </div>

              {/* Network Context (IP, Duration, Status Code) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "آدرس آی‌پی" : "IP Address"}</span>
                  <span className="font-mono text-foreground text-xs">{selectedLog.ipAddress || "127.0.0.1"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "کد وضعیت HTTP" : "Status Code"}</span>
                  <span className="font-mono font-bold text-foreground text-xs">{selectedLog.metadata?.statusCode || 200}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "زمان پاسخ" : "Duration"}</span>
                  <span className="font-mono text-foreground text-xs">{selectedLog.metadata?.durationMs ? `${selectedLog.metadata.durationMs}ms` : "-"}</span>
                </div>
              </div>

              {/* Target Entity */}
              {selectedLog.targetName && (
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "هدف عملیات" : "Target"}</span>
                  <span className="font-semibold text-foreground text-xs">{selectedLog.targetName} ({selectedLog.targetType || "entity"})</span>
                </div>
              )}

              {/* Exact Jalali & Gregorian Timestamp */}
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "زمان دقیق ثبت" : "Exact Timestamp"}</span>
                <span className="font-mono text-foreground text-xs fa-num">
                  {formatJalaliAndRelative(selectedLog.timestamp, isRtl).full} ({selectedLog.timestamp})
                </span>
              </div>

              {/* Metadata JSON Block */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground">{isRtl ? "متادیتا و جزئیات فنی" : "Technical Metadata"}</span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyJson(selectedLog)}
                      className="text-[10px] h-6 px-2 gap-1 rounded-md text-muted-foreground hover:text-foreground"
                    >
                      {copiedJson ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>{copiedJson ? (isRtl ? "کپی شد" : "Copied") : (isRtl ? "کپی JSON" : "Copy JSON")}</span>
                    </Button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-44 custom-scrollbar">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
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
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
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
