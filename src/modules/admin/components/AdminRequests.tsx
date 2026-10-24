"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  ShieldAlert, 
  Search, 
  X, 
  Clock, 
  Send, 
  UserCheck, 
  ShieldCheck, 
  UserX, 
  Eye, 
  RotateCw, 
  KeyRound, 
  Copy, 
  Check, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard, 
  Briefcase, 
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services";
import { PendingRequest, RequestStatus } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminRequestsProps {
  requests: PendingRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>>;
  onRefresh?: () => Promise<void>;
}

export function AdminRequests({
  requests,
  setRequests,
  onRefresh,
}: AdminRequestsProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [domainFilter, setDomainFilter] = useState<'all' | 'euroslotpars.com' | 'npceram.com'>('all');

  // Dialog states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReqForReject, setSelectedReqForReject] = useState<PendingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReqForDetails, setSelectedReqForDetails] = useState<PendingRequest | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Copy email / password helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = requests.length;
    const pendingHr = requests.filter((r) => r.status === "pending").length;
    const pendingManager = requests.filter((r) => r.status === "hr_approved").length;
    const active = requests.filter((r) => r.status === "active").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total, pendingHr, pendingManager, active, rejected };
  }, [requests]);

  // Fast live filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      // 2. Domain Filter
      if (domainFilter !== 'all' && !req.email.toLowerCase().includes(domainFilter)) {
        return false;
      }

      // 3. Fast multi-field query matching
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const nameMatch = req.name?.toLowerCase().includes(q);
        const emailMatch = req.email.toLowerCase().includes(q);
        const phoneMatch = req.phone?.includes(q);
        const natIdMatch = req.nationalId?.includes(q);
        const deptMatch = req.department?.toLowerCase().includes(q);
        const jobMatch = req.jobTitle?.toLowerCase().includes(q);
        const idMatch = req.id.toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || natIdMatch || deptMatch || jobMatch || idMatch;
      }

      return true;
    });
  }, [requests, statusFilter, domainFilter, searchQuery]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  // 1. HR Approval
  const handleApproveHr = async (req: PendingRequest) => {
    try {
      setActionLoadingId(req.id);
      const updated = await api.admin.approveHr(req.id);
      setRequests((prev) => prev.map((r) => (r.id === req.id ? updated : r)));
      toast.success(t("hrApproveSuccess", { email: req.email }));
      if (onRefresh) await onRefresh();
    } catch {
      toast.error("خطا در تایید واحد منابع انسانی");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Manager Final Approval & Activation
  const handleApproveManager = async (req: PendingRequest) => {
    try {
      setActionLoadingId(req.id);
      const res = await api.admin.approveManager(req.id);
      setRequests((prev) => prev.map((r) => (r.id === req.id ? res.request : r)));
      toast.success(t("managerApproveSuccess", { email: req.email }));
      if (onRefresh) await onRefresh();
    } catch {
      toast.error("خطا در فعال‌سازی و صدور دسترسی");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Resend Temporary Password
  const handleResendCredentials = async (req: PendingRequest) => {
    try {
      setActionLoadingId(req.id);
      const res = await api.admin.resendCredentials(req.id);
      toast.success(t("resendSuccess", { email: req.email, password: res.tempPassword || "" }));
      if (onRefresh) await onRefresh();
    } catch {
      toast.error("خطا در صدور مجدد کلمه عبور");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Reject Request
  const handleOpenReject = (req: PendingRequest) => {
    setSelectedReqForReject(req);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedReqForReject) return;
    try {
      setIsRejecting(true);
      const updated = await api.admin.rejectRequest(selectedReqForReject.id, rejectReason);
      setRequests((prev) => prev.map((r) => (r.id === selectedReqForReject.id ? updated : r)));
      toast.info(t("rejectSuccess", { email: selectedReqForReject.email }));
      setRejectModalOpen(false);
      setSelectedReqForReject(null);
      if (onRefresh) await onRefresh();
    } catch {
      toast.error("خطا در ثبت رد درخواست");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-3 sm:p-5 max-w-6xl mx-auto w-full space-y-6">
      
      {/* ─── Top Header & Live KPI Metrics Bar ──────────────────────────────── */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/50 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 text-foreground tracking-tight">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <ShieldAlert className="size-5 sm:size-6" />
              </div>
              <span>{t("tabReqTitle")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("tabReqDesc")}</p>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-9 px-3 text-xs gap-1.5"
              >
                <RotateCw className="size-3.5" />
                <span>بروزرسانی</span>
              </Button>
            )}
          </div>
        </div>

        {/* 4 Metric Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fa-num">
          
          <div 
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
              statusFilter === 'all' 
                ? "bg-primary/10 border-primary/40 shadow-xs ring-1 ring-primary/20" 
                : "bg-muted/30 border-border/40 hover:bg-muted/50"
            }`}
          >
            <div className="text-[11px] text-muted-foreground font-medium">{t("statTotalRequests")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">{metrics.total}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('pending')}
            className={`p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
              statusFilter === 'pending' 
                ? "bg-amber-500/15 border-amber-500/40 shadow-xs ring-1 ring-amber-500/20" 
                : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
            }`}
          >
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">{t("statPendingHr")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{metrics.pendingHr}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('hr_approved')}
            className={`p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
              statusFilter === 'hr_approved' 
                ? "bg-blue-500/15 border-blue-500/40 shadow-xs ring-1 ring-blue-500/20" 
                : "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
            }`}
          >
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{t("statPendingManager")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{metrics.pendingManager}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('rejected')}
            className={`p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
              statusFilter === 'rejected' 
                ? "bg-rose-500/15 border-rose-500/40 shadow-xs ring-1 ring-rose-500/20" 
                : "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10"
            }`}
          >
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{t("statRejected")}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{metrics.rejected}</div>
          </div>

        </div>
      </div>

      {/* ─── Fast Search Bar & Filter Controls ─────────────────────────────── */}
      <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border/50 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchRequestsPlaceholder")}
            className="h-11 ps-10 pe-9 bg-background/80 text-sm rounded-xl border-border/60 focus-visible:ring-1"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/30 border border-border/40 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("reqFilterAll")}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pending'
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("reqFilterPending")}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('hr_approved')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'hr_approved'
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("reqFilterHrApproved")}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("reqFilterActive")}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'rejected'
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("reqFilterRejected")}
            </button>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground text-[11px] font-medium hidden sm:inline">دامنه:</span>
            <button
              type="button"
              onClick={() => setDomainFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                domainFilter === 'all'
                  ? "bg-secondary text-foreground border-border/80 font-bold"
                  : "bg-muted/20 text-muted-foreground border-border/30 hover:border-border/60"
              }`}
            >
              {t("allDomains")}
            </button>
            <button
              type="button"
              onClick={() => setDomainFilter('euroslotpars.com')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                domainFilter === 'euroslotpars.com'
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 font-bold"
                  : "bg-muted/20 text-muted-foreground border-border/30 hover:border-border/60"
              }`}
            >
              @euroslotpars.com
            </button>
            <button
              type="button"
              onClick={() => setDomainFilter('npceram.com')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                domainFilter === 'npceram.com'
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
                  : "bg-muted/20 text-muted-foreground border-border/30 hover:border-border/60"
              }`}
            >
              @npceram.com
            </button>
          </div>

        </div>

        {/* Counter of results */}
        <div className="text-[11px] text-muted-foreground pt-0.5 fa-num">
          {t("searchResultsCount", { count: filteredRequests.length })}
        </div>
      </div>

      {/* ─── Requests List ─────────────────────────────────────────────────── */}
      <div className="space-y-3.5">
        {filteredRequests.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center border border-border/40 shadow-xs space-y-3">
            <CheckCircle2 className="size-10 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-semibold text-foreground">{t("noRequestsFound")}</p>
            <p className="text-xs text-muted-foreground">برای مشاهده سایر درخواست‌ها فیلترها را تغییر داده یا جستجو را پاک کنید.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter('all');
                setDomainFilter('all');
              }}
              className="mt-2 text-xs"
            >
              پاک کردن همه فیلترها
            </Button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isEuroslot = req.email.toLowerCase().includes("@euroslotpars.com");
            const isLoading = actionLoadingId === req.id;

            return (
              <div
                key={req.id}
                className="bg-card rounded-2xl p-4 sm:p-5 border border-border/50 hover:border-primary/40 transition-colors shadow-xs space-y-4"
              >
                {/* Header Row: Applicant details & status badge */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/40">
                  <div className="flex items-start sm:items-center gap-3.5">
                    
                    {/* Avatar Initials */}
                    <div className="size-11 sm:size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shrink-0 select-none">
                      {req.name ? req.name.charAt(0).toUpperCase() : req.email.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-foreground">
                          {req.name || req.email.split("@")[0]}
                        </span>
                        
                        {/* Domain tag */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                          isEuroslot 
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {isEuroslot ? "@euroslotpars.com" : "@npceram.com"}
                        </span>

                        {/* ID badge */}
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-1.5 py-0.5 rounded">
                          {req.id}
                        </span>
                      </div>

                      {/* Contact metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 font-sans" dir="ltr">
                          <Mail className="size-3 text-muted-foreground" />
                          <span className="select-all font-medium text-foreground/80">{req.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(req.email, `email-${req.id}`)}
                            className="p-0.5 hover:text-foreground text-muted-foreground"
                            title="کپی ایمیل"
                          >
                            {copiedId === `email-${req.id}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </button>
                        </div>

                        {req.phone && (
                          <div className="flex items-center gap-1 fa-num" dir="ltr">
                            <Phone className="size-3 text-muted-foreground" />
                            <span className="text-foreground/80">{req.phone}</span>
                          </div>
                        )}

                        {req.nationalId && (
                          <div className="flex items-center gap-1 fa-num">
                            <CreditCard className="size-3 text-muted-foreground" />
                            <span className="text-[11px]">کدملی: {req.nationalId}</span>
                          </div>
                        )}

                        {req.department && (
                          <div className="flex items-center gap-1">
                            <Building2 className="size-3 text-muted-foreground" />
                            <span className="text-[11px]">{req.department}</span>
                          </div>
                        )}

                        {req.jobTitle && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="size-3 text-muted-foreground" />
                            <span className="text-[11px]">{req.jobTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {req.status === 'pending' && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        <span>{t("statusPendingHr")}</span>
                      </span>
                    )}

                    {req.status === 'hr_approved' && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 flex items-center gap-1.5">
                        <UserCheck className="size-3.5" />
                        <span>{t("statusHrApproved")}</span>
                      </span>
                    )}

                    {req.status === 'active' && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5" />
                        <span>{t("statusActive")}</span>
                      </span>
                    )}

                    {req.status === 'rejected' && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 flex items-center gap-1.5">
                        <UserX className="size-3.5" />
                        <span>{t("statusRejected")}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 4-Stage visual flow indicator */}
                <div className="py-1">
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] sm:text-xs">
                    
                    {/* Stage 1: Request */}
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                      <Check className="size-3 stroke-[3]" />
                      <span>{t("step1Short")}</span>
                    </div>

                    {/* Stage 2: Profile Form */}
                    <div className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1 ${
                      req.isProfileCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted/30 border-border/40 text-muted-foreground"
                    }`}>
                      {req.isProfileCompleted && <Check className="size-3 stroke-[3]" />}
                      <span>{t("step2Short")}</span>
                    </div>

                    {/* Stage 3: HR Review */}
                    <div className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1 ${
                      req.hrApproved
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : req.status === 'pending'
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                          : "bg-muted/30 border-border/40 text-muted-foreground"
                    }`}>
                      {req.hrApproved && <Check className="size-3 stroke-[3]" />}
                      <span>{t("step3Short")}</span>
                    </div>

                    {/* Stage 4: Manager Approval */}
                    <div className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1 ${
                      req.status === 'active'
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : req.status === 'hr_approved'
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                          : req.status === 'rejected'
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                            : "bg-muted/30 border-border/40 text-muted-foreground"
                    }`}>
                      {req.status === 'active' && <Check className="size-3 stroke-[3]" />}
                      <span>{t("step4Short")}</span>
                    </div>

                  </div>
                </div>

                {/* Additional Info Row (Rejection Reason or Temp Password if available) */}
                {req.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold">{t("rejectionReasonLabel")}</span>
                      <p className="leading-relaxed">{req.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {req.tempPassword && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-3.5 text-primary" />
                      <span className="text-muted-foreground">{t("tempPasswordLabel")}</span>
                      <span className="font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border/60">
                        {req.tempPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(req.tempPassword!, `pass-${req.id}`)}
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      {copiedId === `pass-${req.id}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>کپی کلمه عبور</span>
                    </button>
                  </div>
                )}

                {/* Footer Row: Timestamp & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground fa-num">
                    <Clock className="size-3.5" />
                    <span>ثبت در: {new Date(req.requestedAt).toLocaleString("fa-IR")}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* View Details Modal Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReqForDetails(req);
                        setDetailsModalOpen(true);
                      }}
                      className="h-8.5 text-xs font-medium gap-1"
                    >
                      <Eye className="size-3.5" />
                      <span>{t("viewDetailsBtn")}</span>
                    </Button>

                    {/* Reject Button (available if not already rejected) */}
                    {req.status !== 'rejected' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenReject(req)}
                        disabled={isLoading}
                        className="h-8.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1"
                      >
                        <UserX className="size-3.5" />
                        <span>{t("rejectBtn")}</span>
                      </Button>
                    )}

                    {/* Step 3 Action: HR Approval */}
                    {req.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveHr(req)}
                        disabled={isLoading}
                        className="h-8.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-xs"
                      >
                        <UserCheck className="size-3.5" />
                        <span>{t("approveHrBtn")}</span>
                      </Button>
                    )}

                    {/* Step 4 Action: Manager Approval / Final Activation */}
                    {req.status === 'hr_approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveManager(req)}
                        disabled={isLoading}
                        className="h-8.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
                      >
                        <ShieldCheck className="size-3.5" />
                        <span>{t("approveManagerBtn")}</span>
                      </Button>
                    )}

                    {/* Active Action: Resend Temp Credentials */}
                    {req.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResendCredentials(req)}
                        disabled={isLoading}
                        className="h-8.5 text-xs font-medium gap-1.5"
                      >
                        <Send className="size-3.5" />
                        <span>{t("resendCredentialsBtn")}</span>
                      </Button>
                    )}

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ─── Rejection Reason Dialog ───────────────────────────────────────── */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-600">
              <UserX className="size-5" />
              <span>{t("rejectReasonTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedReqForReject?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("rejectReasonPlaceholder")}
              rows={4}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={isRejecting}
              className="text-xs"
            >
              {t("cancelBtn")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={isRejecting}
              className="text-xs font-semibold"
            >
              {isRejecting ? "در حال ثبت..." : t("confirmRejectBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Applicant Details Dialog ──────────────────────────────────────── */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Eye className="size-5 text-primary" />
              <span>{t("applicantDetailsTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("applicantDetailsDesc")}
            </DialogDescription>
          </DialogHeader>

          {selectedReqForDetails && (
            <div className="py-3 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/40">
                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("name")}:</span>
                  <div className="font-bold text-foreground text-sm">
                    {selectedReqForDetails.name || "تعیین نشده"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("email")}:</span>
                  <div className="font-sans font-medium text-foreground text-sm" dir="ltr">
                    {selectedReqForDetails.email}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("phoneLabel")}</span>
                  <div className="font-sans font-medium text-foreground fa-num" dir="ltr">
                    {selectedReqForDetails.phone || "09120000000"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("nationalIdLabel")}</span>
                  <div className="font-medium text-foreground fa-num">
                    {selectedReqForDetails.nationalId || "0010000000"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("deptLabel")}</span>
                  <div className="font-medium text-foreground">
                    {selectedReqForDetails.department || "Engineering"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("jobTitleLabel")}</span>
                  <div className="font-medium text-foreground">
                    {selectedReqForDetails.jobTitle || "پرسنل سازمانی"}
                  </div>
                </div>
              </div>

              {/* Status & Approvers details */}
              <div className="space-y-2 p-4 rounded-xl bg-muted/20 border border-border/40">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">{t("profileCompletionLabel")}</span>
                  <span className={`font-semibold ${selectedReqForDetails.isProfileCompleted ? "text-emerald-500" : "text-amber-500"}`}>
                    {selectedReqForDetails.isProfileCompleted ? t("profileCompleted") : t("profileIncomplete")}
                  </span>
                </div>

                {selectedReqForDetails.hrApproved && (
                  <div className="flex items-center justify-between border-b border-border/30 pb-2">
                    <span className="text-muted-foreground">{t("hrApprovedByLabel")}</span>
                    <span className="font-medium text-foreground">
                      {selectedReqForDetails.hrApprovedBy || "واحد HR"}
                    </span>
                  </div>
                )}

                {selectedReqForDetails.managerApproved && (
                  <div className="flex items-center justify-between border-b border-border/30 pb-2">
                    <span className="text-muted-foreground">{t("managerApprovedByLabel")}</span>
                    <span className="font-medium text-foreground">
                      {selectedReqForDetails.managerApprovedBy || "مدیر سیستم"}
                    </span>
                  </div>
                )}

                {selectedReqForDetails.tempPassword && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-muted-foreground">{t("tempPasswordLabel")}</span>
                    <span className="font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border/60">
                      {selectedReqForDetails.tempPassword}
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsModalOpen(false)}
              className="text-xs"
            >
              {t("closeBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
