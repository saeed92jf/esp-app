"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  KeyRound,
  Check,
  X,
  Clock,
  RotateCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services";
import { ModuleAccessRequest, User } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AdminModuleRequestsViewProps {
  users?: User[];
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser?: any;
}

function formatRelativeTime(isoDate?: string, isRtl = false): string {
  if (!isoDate) return isRtl ? "نامشخص" : "Unknown";
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return isRtl ? "همین الان" : "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return isRtl ? `${diffMin} دقیقه پیش` : `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return isRtl ? `${diffHours} ساعت پیش` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return isRtl ? `${diffDays} روز پیش` : `${diffDays}d ago`;
  } catch {
    return isRtl ? "نامشخص" : "Unknown";
  }
}

export function AdminModuleRequestsView({
  users,
  setUsers,
  currentUser,
}: AdminModuleRequestsViewProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [requests, setRequests] = useState<ModuleAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const res = await api.admin.getModuleRequests();
      setRequests(res || []);
    } catch (err) {
      console.error("Failed to load module access requests:", err);
      toast.error(isRtl ? "خطا در دریافت درخواست‌های دسترسی" : "Failed to load access requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req: ModuleAccessRequest) => {
    try {
      setProcessingId(req.id);
      await api.admin.approveModuleRequest(req.id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: "approved", reviewedAt: new Date().toISOString(), reviewedBy: currentUser?.name || "مدیر سیستم" }
            : r
        )
      );

      // If user list is provided, update that user's modulesAccess locally
      if (setUsers) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === req.userId || (req.userEmail && u.email?.toLowerCase() === req.userEmail.toLowerCase())) {
              const currentAccess = u.modulesAccess ? [...u.modulesAccess] : [];
              const ex = currentAccess.find((m) => m.moduleId === req.moduleId);
              if (ex) {
                ex.hasAccess = true;
              } else {
                currentAccess.push({
                  moduleId: req.moduleId,
                  hasAccess: true,
                  accessLevel: "read",
                  usagePercentage: 0,
                  hoursSpent: "00:00:00",
                });
              }
              return { ...u, modulesAccess: currentAccess };
            }
            return u;
          })
        );
      }

      toast.success(
        isRtl
          ? `دسترسی به ماژول «${req.moduleName}» برای کاربر با موفقیت تأیید شد.`
          : `Access to "${req.moduleName}" approved successfully.`
      );
    } catch (err: any) {
      console.error("Approve failed:", err);
      toast.error(err?.message || (isRtl ? "خطا در تایید درخواست" : "Failed to approve request"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: ModuleAccessRequest) => {
    try {
      setProcessingId(req.id);
      await api.admin.rejectModuleRequest(req.id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: "rejected", reviewedAt: new Date().toISOString(), reviewedBy: currentUser?.name || "مدیر سیستم" }
            : r
        )
      );
      toast.info(isRtl ? "درخواست دسترسی رد شد." : "Access request rejected.");
    } catch (err: any) {
      console.error("Reject failed:", err);
      toast.error(err?.message || (isRtl ? "خطا در رد درخواست" : "Failed to reject request"));
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests]
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (activeFilter !== "all" && r.status !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = r.userName?.toLowerCase().includes(q);
        const matchEmail = r.userEmail?.toLowerCase().includes(q);
        const matchMod = r.moduleName?.toLowerCase().includes(q) || r.moduleId?.toLowerCase().includes(q);
        return matchName || matchEmail || matchMod;
      }
      return true;
    });
  }, [requests, activeFilter, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Banner & Header */}
      <div className="bg-background/80 dark:bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <KeyRound className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {isRtl ? "درخواست‌های دسترسی ماژول‌ها" : "Module Access Requests"}
              </h2>
              {pendingCount > 0 && (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold fa-num px-2 py-0.5">
                  {pendingCount} {isRtl ? "در انتظار" : "Pending"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "بررسی و تعیین تکلیف یک‌سطری درخواست‌های دسترسی پرسنل به ماژول‌های سازمانی"
                : "Single-line overview to review, approve, or reject employee access requests to system modules."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={refreshing}
            className="h-8.5 px-3 rounded-xl text-xs gap-1.5 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCw className={cn("size-3.5", refreshing && "animate-spin")} />
            <span>{isRtl ? "بروزرسانی" : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-2 rounded-2xl border border-border/40">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer select-none",
              activeFilter === "all"
                ? "bg-background text-foreground shadow-2xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {isRtl ? "همه درخواست‌ها" : "All Requests"} ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer select-none flex items-center gap-1.5",
              activeFilter === "pending"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span>{isRtl ? "در انتظار بررسی" : "Pending"}</span>
            {pendingCount > 0 && (
              <span className="size-4.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center fa-num">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("approved")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer select-none",
              activeFilter === "approved"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {isRtl ? "تأیید شده" : "Approved"} (
            {requests.filter((r) => r.status === "approved").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("rejected")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer select-none",
              activeFilter === "rejected"
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {isRtl ? "رد شده" : "Rejected"} (
            {requests.filter((r) => r.status === "rejected").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "جستجوی کاربر یا ماژول..." : "Search user or module..."}
            className="h-8.5 ps-8.5 pe-3 text-xs rounded-xl bg-background border-border/50"
          />
        </div>
      </div>

      {/* Main Single-Line Requests Table */}
      <div className="bg-background border border-border/50 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <RotateCw className="size-6 animate-spin text-primary" />
            <span className="text-xs">{isRtl ? "در حال دریافت درخواست‌ها..." : "Loading requests..."}</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mb-3">
              <KeyRound className="size-6 opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {isRtl ? "هیچ درخواستی یافت نشد" : "No requests found"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {isRtl
                ? "در حال حاضر درخواستی با این شرایط برای نمایش وجود ندارد."
                : "There are currently no access requests matching the selected filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-bold text-muted-foreground">
                  <th className="py-3 px-3.5 text-start w-12">{isRtl ? "#" : "#"}</th>
                  <th className="py-3 px-3.5 text-start">{isRtl ? "کاربر متقاضی" : "Applicant"}</th>
                  <th className="py-3 px-3.5 text-start">{isRtl ? "ماژول درخواستی" : "Requested Module"}</th>
                  <th className="py-3 px-3.5 text-start">{isRtl ? "زمان درخواست" : "Requested At"}</th>
                  <th className="py-3 px-3.5 text-start">{isRtl ? "وضعیت" : "Status"}</th>
                  <th className="py-3 px-3.5 text-end">{isRtl ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filteredRequests.map((req, idx) => {
                  const isPending = req.status === "pending";
                  const isApproved = req.status === "approved";
                  const isRejected = req.status === "rejected";
                  const isProcessing = processingId === req.id;

                  return (
                    <tr
                      key={req.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        isPending && "bg-amber-500/[0.02]"
                      )}
                    >
                      {/* 1. Row Index */}
                      <td className="py-3 px-3.5 font-medium text-muted-foreground text-[11px] fa-num">
                        {idx + 1}
                      </td>

                      {/* 2. User Info */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5 min-w-[200px]">
                          <Avatar className="size-8 rounded-full border border-border/50 shrink-0">
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {req.userName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="font-bold text-foreground block truncate">
                              {req.userName}
                            </span>
                            <span className="text-[11px] text-muted-foreground block truncate" dir="ltr">
                              {req.userEmail || req.userId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Module Name */}
                      <td className="py-3 px-3.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/50 font-semibold text-foreground text-xs">
                          <Layers className="size-3.5 text-primary" />
                          <span>{req.moduleName || req.moduleId}</span>
                        </div>
                      </td>

                      {/* 4. Request Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5" title={req.requestedAt}>
                          <Clock className="size-3.5 text-muted-foreground/70" />
                          <span className="fa-num">{formatRelativeTime(req.requestedAt, isRtl)}</span>
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            <AlertCircle className="size-3" />
                            <span>{isRtl ? "در انتظار بررسی" : "Pending"}</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="size-3" />
                            <span>{isRtl ? "تأیید شده" : "Approved"}</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                            <XCircle className="size-3" />
                            <span>{isRtl ? "رد شده" : "Rejected"}</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Actions (One-line Quick Approve / Reject) */}
                      <td className="py-3 px-3.5 text-end whitespace-nowrap">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <Button
                              type="button"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleApprove(req)}
                              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1 shadow-2xs cursor-pointer"
                            >
                              <Check className="size-3.5" />
                              <span>{isRtl ? "تأیید دسترسی" : "Approve"}</span>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleReject(req)}
                              className="h-8 px-2.5 rounded-xl border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs gap-1 cursor-pointer"
                            >
                              <X className="size-3.5" />
                              <span>{isRtl ? "رد" : "Reject"}</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/80">
                            {req.reviewedBy ? `${isRtl ? "توسط" : "by"} ${req.reviewedBy}` : "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
