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
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Save,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  RotateCcw,
  Sparkles,
  UserCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  HeartHandshake,
  Star,
  Users,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/services";
import { PendingRequest, RequestStatus } from "../types/admin.types";
import { getCompanyFromEmail } from "../utils/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AdminModuleAccessStep } from "./AdminModuleAccessStep";
import { addUserNotification } from "@/modules/dashboard/services/dashboard.service";
import { formatRequestSubmissionDate, formatDateFieldForLocale, toAsciiDigits } from "../utils/date-formatter";

interface AdminRequestsProps {
  requests: PendingRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>>;
  onRefresh?: () => Promise<void>;
  availableModules?: any[];
}

type ReqSegmentId = "personal" | "org" | "insurance" | "education" | "modules";

const sanitizePersian = (text: string) => {
  return text.replace(/[^ \u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C]/g, "");
};

const sanitizeEnglish = (text: string) => {
  return text.replace(/[^ a-zA-Z'-]/g, "");
};

const normalizeDigits = (val: string) => {
  return val.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
};

export function AdminRequests({
  requests,
  setRequests,
  onRefresh,
  availableModules,
}: AdminRequestsProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "hr_approved" | "rejected"
  >("all");
  const [domainFilter, setDomainFilter] = useState<
    "all" | "euroslotpars.com" | "npceram.com"
  >("all");

  // Reviewer role perspective: HR vs General Manager
  const [reviewerRole, setReviewerRole] = useState<"hr" | "manager">("manager");

  // Selected Request for Review
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  // Active form state for the selected request
  const [reviewData, setReviewData] = useState<PendingRequest | null>(null);
  const [activeSegment, setActiveSegment] = useState<ReqSegmentId>("personal");
  const [openSegment, setOpenSegment] = useState<ReqSegmentId | null>("personal");
  const [completedSteps, setCompletedSteps] = useState<Set<ReqSegmentId>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states for rejection
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculation (Active Account removed per user requirement)
  const metrics = useMemo(() => {
    const total = requests.length;
    const pendingHr = requests.filter((r) => r.status === "pending").length;
    const pendingManager = requests.filter((r) => r.status === "hr_approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total, pendingHr, pendingManager, rejected };
  }, [requests]);

  // Fast live filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false;
      }
      if (
        domainFilter !== "all" &&
        !req.email.toLowerCase().includes(domainFilter)
      ) {
        return false;
      }
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const nameMatch = req.name?.toLowerCase().includes(q);
        const emailMatch = req.email.toLowerCase().includes(q);
        const phoneMatch = req.phone?.includes(q);
        const natIdMatch = req.nationalId?.includes(q);
        const deptMatch = req.department?.toLowerCase().includes(q);
        const jobMatch = req.jobTitle?.toLowerCase().includes(q);
        const idMatch = req.id.toLowerCase().includes(q);
        return (
          nameMatch ||
          emailMatch ||
          phoneMatch ||
          natIdMatch ||
          deptMatch ||
          jobMatch ||
          idMatch
        );
      }
      return true;
    });
  }, [requests, statusFilter, domainFilter, searchQuery]);

  // Automatically select first request if none selected or if selected was removed
  useEffect(() => {
    if (!selectedReqId && filteredRequests.length > 0) {
      setSelectedReqId(filteredRequests[0].id);
    } else if (
      selectedReqId &&
      !requests.some((r) => r.id === selectedReqId) &&
      filteredRequests.length > 0
    ) {
      setSelectedReqId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedReqId, requests]);

  // Load selected request into review form
  useEffect(() => {
    if (selectedReqId) {
      setCompletedSteps(new Set());
      setActiveSegment("personal");
      setOpenSegment("personal");
      const found = requests.find((r) => r.id === selectedReqId);
      if (found) {
        setReviewData({
          ...found,
          birthDate: formatDateFieldForLocale(found.birthDate, isRtl),
          joinDate: formatDateFieldForLocale(found.joinDate, isRtl),
          insuranceValidUntil: formatDateFieldForLocale(found.insuranceValidUntil, isRtl),
          graduationYear: formatDateFieldForLocale(found.graduationYear, isRtl),
          department: found.department || "engineering",
          maritalStatus: found.maritalStatus || "single",
          childrenCount: found.childrenCount || 0,
          workLocation: found.workLocation || "office",
          contractType: found.contractType || "full_time",
          insuranceProvider: found.insuranceProvider || t("insuranceOptions.socialSecurity"),
          supplementaryPlan: found.supplementaryPlan || "none",
          educationDegree: found.educationDegree || "bachelors",
          dependents: found.dependents || [],
          modulesAccess: found.modulesAccess || [
            { moduleId: "/dashboard/projects", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
            { moduleId: "/dashboard/tasks", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
          ],
          skills: found.skills || [
            { id: "sk-1", name: t("defaultSkill1"), level: 4 },
            { id: "sk-2", name: t("defaultSkill2"), level: 4 },
          ],
        });
      }
    } else {
      setReviewData(null);
    }
  }, [selectedReqId, requests, isRtl]);

  // Options
  const departmentOptions = [
    { value: "engineering", label: t("departments.engineering") },
    { value: "marketDevelopment", label: t("departments.marketDevelopment") },
    { value: "projectControl", label: t("departments.projectControl") },
    { value: "administrative", label: t("departments.administrative") },
    { value: "rAndD", label: t("departments.rAndD") },
  ];

  const maritalOptions = [
    { value: "single", label: t("maritalStatusOptions.single") },
    { value: "married", label: t("maritalStatusOptions.married") },
  ];

  const workLocationOptions = [
    { value: "office", label: t("workLocationOffice") },
    { value: "factory", label: t("workLocationFactory") },
    { value: "remote", label: t("workLocationRemote") },
    { value: "hybrid", label: t("workLocationHybrid") },
  ];

  const contractTypeOptions = [
    { value: "full_time", label: t("contractFullTime") },
    { value: "part_time", label: t("contractPartTime") },
    { value: "hourly", label: t("contractHourly") },
    { value: "contractual", label: t("contractContractual") },
    { value: "internship", label: t("contractInternship") },
  ];

  const supplementaryPlanOptions = [
    { value: "golden", label: t("planGolden") },
    { value: "silver", label: t("planSilver") },
    { value: "special", label: t("planSpecial") },
    { value: "none", label: t("planNone") },
  ];

  const degreeOptions = [
    { value: "diploma", label: t("degreesOptions.diploma") },
    { value: "bachelors", label: t("degreesOptions.bachelors") },
    { value: "master", label: t("degreesOptions.master") },
    { value: "phd", label: t("degreesOptions.phd") },
  ];

  const relationshipOptions = [
    { value: "spouse", label: t("relationshipSpouse") },
    { value: "child", label: t("relationshipChild") },
    { value: "parent", label: t("relationshipParent") },
    { value: "other", label: t("relationshipOther") },
  ];

  const SEGMENTS: {
    id: ReqSegmentId;
    icon: React.ComponentType<{ className?: string }>;
    titleKey: string;
    descKey: string;
    stepNumber: number;
    owner: "hr" | "manager";
  }[] = [
    {
      id: "personal",
      icon: UserCircle2,
      titleKey: "reqSegmentPersonal",
      descKey: "reqSegmentPersonalDesc",
      stepNumber: 1,
      owner: "hr",
    },
    {
      id: "org",
      icon: Briefcase,
      titleKey: "reqSegmentOrg",
      descKey: "reqSegmentOrgDesc",
      stepNumber: 2,
      owner: "manager",
    },
    {
      id: "insurance",
      icon: ShieldCheck,
      titleKey: "reqSegmentInsurance",
      descKey: "reqSegmentInsuranceDesc",
      stepNumber: 3,
      owner: "hr",
    },
    {
      id: "education",
      icon: GraduationCap,
      titleKey: "reqSegmentEducation",
      descKey: "reqSegmentEducationDesc",
      stepNumber: 4,
      owner: "hr",
    },
    {
      id: "modules",
      icon: KeyRound,
      titleKey: "reqSegmentModules",
      descKey: "reqSegmentModulesDesc",
      stepNumber: 5,
      owner: "manager",
    },
  ];

  // Actions
  const handleSaveProfileChanges = async () => {
    if (!reviewData) return;
    try {
      setIsSaving(true);
      const updated = await api.admin.updateRequest(reviewData.id, reviewData);
      setRequests((prev) =>
        prev.map((r) => (r.id === reviewData.id ? updated : r))
      );
      addUserNotification({
        title: isRtl ? "به‌روزرسانی پرونده متقاضی" : "Applicant Dossier Updated",
        description: isRtl
          ? `اطلاعات پرونده متقاضی (${reviewData.name}) در سامانه ذخیره شد.`
          : `Dossier changes for ${reviewData.name} were saved in the system.`,
        type: "system",
      });
      toast.success(t("profileChangesSavedSuccess"));
      if (onRefresh) await onRefresh();
    } catch {
      toast.error(t("errorSaveProfileChanges"));
    } finally {
      setIsSaving(false);
    }
  };

  // Step Navigation Helpers
  const handleNextStep = (currentSegmentId: ReqSegmentId, nextSegmentId: ReqSegmentId) => {
    setCompletedSteps((prev) => new Set(prev).add(currentSegmentId));
    setActiveSegment(nextSegmentId);
    setOpenSegment(nextSegmentId);
  };

  const handlePrevStep = (currentSegmentId: ReqSegmentId, prevSegmentId: ReqSegmentId) => {
    setCompletedSteps((prev) => {
      const nextSet = new Set(prev);
      nextSet.delete(currentSegmentId);
      nextSet.delete(prevSegmentId);
      return nextSet;
    });
    setActiveSegment(prevSegmentId);
    setOpenSegment(prevSegmentId);
  };

  // Final Step Action: Save and Advance Stage depending on status (HR vs Admin)
  const handleSaveAndAdvance = async () => {
    if (!reviewData) return;
    try {
      setIsSaving(true);
      setCompletedSteps((prev) => new Set(prev).add("education").add("modules"));

      const reqCompany = getCompanyFromEmail(reviewData.email);
      const dataToSave: PendingRequest = {
        ...reviewData,
        company: isRtl ? reqCompany.nameFa : reqCompany.nameEn,
        companyId: reqCompany.id,
      };

      // 1. First save any current modifications to request profile
      await api.admin.updateRequest(reviewData.id, dataToSave);

      // 2. Advance stage based on current reviewer role and status
      if (reviewerRole === "hr") {
        if (reviewData.status === "pending") {
          // HR Stage Approval
          const updated = await api.admin.approveHr(reviewData.id);
          setRequests((prev) =>
            prev.map((r) => (r.id === reviewData.id ? updated : r))
          );
          setReviewData((prev) => (prev ? { ...prev, ...updated, status: "hr_approved", hrApproved: true } : null));
          addUserNotification({
            title: isRtl ? "تایید مدارک توسط منابع انسانی" : "HR Verification Approved",
            description: isRtl
              ? `مدارک و اطلاعات متقاضی (${reviewData.name}) تایید شد و پرونده به مدیریت ارجاع گردید.`
              : `Application for ${reviewData.name} was approved by HR and submitted to the General Manager.`,
            type: "system",
          });
          toast.success(t("hrApproveSuccess", { email: reviewData.email }));
        } else {
          toast.success(t("profileChangesSavedSuccess"));
        }
      } else {
        // Manager Perspective
        if (reviewData.status === "pending") {
          toast.warning(t("stepAwaitingHr"));
        } else if (reviewData.status === "hr_approved") {
          // Manager Final Approval & Activation
          const res = await api.admin.approveManager(reviewData.id, {
            role: "user",
            modulesAccess: dataToSave.modulesAccess,
          });
          setRequests((prev) =>
            prev.map((r) => (r.id === reviewData.id ? res.request : r))
          );
          setReviewData((prev) => (prev ? { ...prev, ...res.request, status: "active", hrApproved: true, managerApproved: true, tempPassword: res.tempPassword || res.request.tempPassword } : null));
          addUserNotification({
            title: isRtl ? "تایید نهایی و فعال‌سازی حساب کاربری" : "Account Final Approval & Activation",
            description: isRtl
              ? `درخواست متقاضی (${reviewData.name}) تایید نهایی شد و حساب کاربری با دسترسی‌های تعیین‌شده فعال گردید.`
              : `Application for ${reviewData.name} received final approval from the General Manager and the account is now active.`,
            type: "system",
          });
          toast.success(t("managerApproveSuccess", { email: reviewData.email }));
        } else {
          toast.success(t("profileChangesSavedSuccess"));
        }
      }

      if (onRefresh) await onRefresh();
    } catch {
      toast.error(t("errorAdvanceStage"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveHr = async () => {
    if (!reviewData) return;
    try {
      setActionLoadingId(reviewData.id);
      const reqCompany = getCompanyFromEmail(reviewData.email);
      const dataToSave: PendingRequest = {
        ...reviewData,
        company: isRtl ? reqCompany.nameFa : reqCompany.nameEn,
        companyId: reqCompany.id,
      };
      await api.admin.updateRequest(reviewData.id, dataToSave);
      const updated = await api.admin.approveHr(reviewData.id);
      setRequests((prev) =>
        prev.map((r) => (r.id === reviewData.id ? updated : r))
      );
      setReviewData((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              status: "hr_approved",
              hrApproved: true,
            }
          : null
      );
      addUserNotification({
        title: isRtl ? "تایید مدارک توسط منابع انسانی" : "HR Verification Approved",
        description: isRtl
          ? `مدارک و اطلاعات متقاضی (${reviewData.name}) تایید شد و پرونده به مدیریت ارجاع گردید.`
          : `Application for ${reviewData.name} was approved by HR and submitted to the General Manager.`,
        type: "system",
      });
      toast.success(t("hrApproveSuccess", { email: reviewData.email }));
      if (onRefresh) await onRefresh();
    } catch {
      toast.error(t("errorApproveHr"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveManager = async () => {
    if (!reviewData) return;
    try {
      setActionLoadingId(reviewData.id);
      const reqCompany = getCompanyFromEmail(reviewData.email);
      const dataToSave: PendingRequest = {
        ...reviewData,
        company: isRtl ? reqCompany.nameFa : reqCompany.nameEn,
        companyId: reqCompany.id,
      };
      await api.admin.updateRequest(reviewData.id, dataToSave);
      const res = await api.admin.approveManager(reviewData.id, {
        role: "user",
        modulesAccess: dataToSave.modulesAccess,
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === reviewData.id ? res.request : r))
      );
      setReviewData((prev) =>
        prev
          ? {
              ...prev,
              ...res.request,
              status: "active",
              hrApproved: true,
              managerApproved: true,
              tempPassword: res.tempPassword || res.request.tempPassword,
            }
          : null
      );
      addUserNotification({
        title: isRtl ? "تایید نهایی و فعال‌سازی حساب کاربری" : "Account Final Approval & Activation",
        description: isRtl
          ? `درخواست متقاضی (${reviewData.name}) تایید نهایی شد و حساب کاربری با دسترسی‌های تعیین‌شده فعال گردید.`
          : `Application for ${reviewData.name} received final approval from the General Manager and the account is now active.`,
        type: "system",
      });
      toast.success(t("managerApproveSuccess", { email: reviewData.email }));
      if (onRefresh) await onRefresh();
    } catch {
      toast.error(t("errorApproveManager"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!reviewData) return;
    try {
      setIsRejecting(true);
      const updated = await api.admin.rejectRequest(
        reviewData.id,
        rejectReason
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === reviewData.id ? updated : r))
      );
      setReviewData((prev) => (prev ? { ...prev, ...updated } : null));
      addUserNotification({
        title: isRtl ? "عدم تایید درخواست متقاضی" : "Application Rejected",
        description: isRtl
          ? `درخواست متقاضی (${reviewData.name}) رد گردید. دلیل: ${rejectReason}`
          : `Application for ${reviewData.name} was rejected. Reason: ${rejectReason}`,
        type: "system",
      });
      toast.info(t("rejectSuccess", { email: reviewData.email }));
      setRejectModalOpen(false);
      setRejectReason("");
      if (onRefresh) await onRefresh();
    } catch {
      toast.error(t("errorRejectRequest"));
    } finally {
      setIsRejecting(false);
    }
  };

  const handleResendCredentials = async () => {
    if (!reviewData) return;
    try {
      setActionLoadingId(reviewData.id);
      const res = await api.admin.resendCredentials(reviewData.id);
      addUserNotification({
        title: isRtl ? "ارسال مجدد مشخصات ورود" : "Credentials Resent",
        description: isRtl
          ? `مشخصات ورود و رمز عبور موقت متقاضی (${reviewData.name}) مجدداً ارسال گردید.`
          : `Temporary login credentials for ${reviewData.name} were resent.`,
        type: "system",
      });
      toast.success(
        t("resendSuccess", {
          email: reviewData.email,
          password: res.tempPassword || "",
        })
      );
      if (onRefresh) await onRefresh();
    } catch {
      toast.error(t("errorResendCredentials"));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Dependents Helpers
  const handleAddDependent = () => {
    if (!reviewData) return;
    const newDep = {
      id: `dep-${Date.now()}`,
      fullName: "",
      relationship: "child",
      nationalId: "",
    };
    setReviewData({
      ...reviewData,
      dependents: [...(reviewData.dependents || []), newDep],
    });
  };

  const handleRemoveDependent = (depId: string) => {
    if (!reviewData) return;
    setReviewData({
      ...reviewData,
      dependents: (reviewData.dependents || []).filter((d) => d.id !== depId),
    });
  };

  const handleUpdateDependent = (
    depId: string,
    field: "fullName" | "relationship" | "nationalId",
    value: string
  ) => {
    if (!reviewData) return;
    setReviewData({
      ...reviewData,
      dependents: (reviewData.dependents || []).map((d) =>
        d.id === depId ? { ...d, [field]: value } : d
      ),
    });
  };

  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const PrevArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-2 sm:p-5 max-w-[1440px] mx-auto w-full space-y-6">
      {/* ─── Top Header & Live KPI Metrics Bar ──────────────────────────────── */}
      <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/40">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 text-foreground tracking-tight">
              <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldAlert className="size-6" />
              </div>
              <span>{t("tabReqTitle")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("tabReqDesc")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Reviewer Role Toggle: HR vs General Manager */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-border/50 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setReviewerRole("hr")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  reviewerRole === "hr"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserCheck className="size-3.5" />
                <span>{t("reviewerRoleHr")}</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewerRole("manager")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  reviewerRole === "manager"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="size-3.5" />
                <span>{t("reviewerRoleManager")}</span>
              </button>
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-9 px-3.5 text-xs rounded-xl gap-1.5 cursor-pointer border-border/50 hover:bg-background/80"
              >
                <RotateCw className="size-3.5" />
                <span>{t("refreshBtn")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* 4 Metric Overview Cards (Tags) */}
        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", isRtl && "fa-num")}>
          <div
            onClick={() => setStatusFilter("all")}
            className={cn(
              "p-3.5 rounded-2xl border transition-colors cursor-pointer select-none",
              statusFilter === "all"
                ? "bg-primary/10 border-primary/40 shadow-xs ring-1 ring-primary/20"
                : "bg-background/60 border-border/40 hover:bg-background"
            )}
          >
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("statTotalRequests")}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
              {metrics.total}
            </div>
          </div>

          <div
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "p-3.5 rounded-2xl border transition-colors cursor-pointer select-none",
              statusFilter === "pending"
                ? "bg-amber-500/15 border-amber-500/40 shadow-xs ring-1 ring-amber-500/20"
                : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
            )}
          >
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {t("statPendingHr")}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {metrics.pendingHr}
            </div>
          </div>

          <div
            onClick={() => setStatusFilter("hr_approved")}
            className={cn(
              "p-3.5 rounded-2xl border transition-colors cursor-pointer select-none",
              statusFilter === "hr_approved"
                ? "bg-blue-500/15 border-blue-500/40 shadow-xs ring-1 ring-blue-500/20"
                : "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
            )}
          >
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              {t("statPendingManager")}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {metrics.pendingManager}
            </div>
          </div>

          <div
            onClick={() => setStatusFilter("rejected")}
            className={cn(
              "p-3.5 rounded-2xl border transition-colors cursor-pointer select-none",
              statusFilter === "rejected"
                ? "bg-rose-500/15 border-rose-500/40 shadow-xs ring-1 ring-rose-500/20"
                : "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10"
            )}
          >
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              {t("statRejected")}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {metrics.rejected}
            </div>
          </div>
        </div>

        {/* Unified Search Bar & Company Tabs Row (Moved out of Applicants Queue) */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-1">
          {/* Fast Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchRequestsPlaceholder")}
              className="h-10 ps-10 pe-9 bg-background/90 text-xs rounded-xl border-border/60 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Company / Domain Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-border/50 text-xs font-semibold w-full md:w-auto shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setDomainFilter("all")}
              className={cn(
                "flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer text-center",
                domainFilter === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("allCompanies")}
            </button>
            <button
              type="button"
              onClick={() => setDomainFilter("euroslotpars.com")}
              className={cn(
                "flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer text-center",
                domainFilter === "euroslotpars.com"
                  ? "bg-sky-600 text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("companyEuroslot")}
            </button>
            <button
              type="button"
              onClick={() => setDomainFilter("npceram.com")}
              className={cn(
                "flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer text-center",
                domainFilter === "npceram.com"
                  ? "bg-amber-600 text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("companyNpceram")}
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2-Column Responsive Workspace ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT / QUEUE COLUMN: APPLICANTS QUEUE ONLY */}
        {/* ======================================================== */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-primary" />
                <span className="font-bold text-sm text-foreground">
                  {t("requestsQueue")}
                </span>
              </div>
              <span className={cn("bg-muted text-muted-foreground text-[11px] font-bold px-2 py-0.5 rounded-full", isRtl && "fa-num")}>
                {filteredRequests.length}
              </span>
            </div>

            {/* Requests List Cards */}
            <div className="flex flex-col gap-2.5 max-h-[720px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  {t("noRequestsFound")}
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedReqId === req.id;
                  const isEuroslot = req.email
                    .toLowerCase()
                    .includes("@euroslotpars.com");

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedReqId(req.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-2 relative",
                        isSelected
                          ? "bg-background border-primary shadow-xs ring-1 ring-primary/20"
                          : "bg-background/60 border-border/40 hover:border-border hover:bg-background"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="size-9 rounded-full border border-border/50 shrink-0 bg-transparent">
                            <AvatarFallback className="bg-transparent text-primary text-xs font-bold rounded-full">
                              {req.name ? req.name.charAt(0) : "؟"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-foreground truncate">
                              {req.name || req.email.split("@")[0]}
                            </span>
                            <span
                              className="text-[11px] text-muted-foreground truncate"
                              dir="ltr"
                            >
                              {req.email}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {req.status === "pending" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <UserCheck className="size-3" />
                              <span>{t("statusPendingHr")}</span>
                            </span>
                          )}
                          {req.status === "hr_approved" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                              <ShieldCheck className="size-3" />
                              <span>{t("statusHrApproved")}</span>
                            </span>
                          )}
                          {req.status === "active" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="size-3" />
                              <span>{t("statusActive")}</span>
                            </span>
                          )}
                          {req.status === "rejected" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <UserX className="size-3" />
                              <span>{t("statusRejected")}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={cn("flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30", isRtl && "fa-num")}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="truncate max-w-[110px]">{req.department ? t(`departments.${req.department}`) : "---"}</span>
                          {(() => {
                            const comp = getCompanyFromEmail(req.email);
                            return (
                              <span
                                className={cn(
                                  "px-1.5 py-0.2 rounded font-bold text-[9px] border shrink-0 flex items-center gap-1",
                                  comp.id === "npceram"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                    : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                                )}
                              >
                                <Building2 className="size-2.5" />
                                <span>{isRtl ? comp.nameFa : comp.nameEn}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <span className="shrink-0 font-mono">
                          {formatRequestSubmissionDate(req.requestedAt, isRtl)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT / MAIN COLUMN: SEGMENTED ACCORDION REVIEW WORKSPACE */}
        {/* ======================================================== */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {!reviewData ? (
            <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-12 text-center shadow-xs space-y-3">
              <CheckCircle2 className="size-10 text-muted-foreground/50 mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                {t("selectApplicantPrompt")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("selectApplicantDesc")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Applicant Header Card & Workflow Actions */}
              <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-5 sm:p-6 shadow-xs flex flex-col gap-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar className="size-14 rounded-full border-2 border-border/60 shadow-xs shrink-0 bg-transparent">
                      <AvatarFallback className="bg-transparent text-primary text-xl font-bold rounded-full">
                        {reviewData.name ? reviewData.name.charAt(0) : "؟"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base sm:text-lg text-foreground truncate">
                          {reviewData.name || reviewData.email.split("@")[0]}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-primary/10 text-primary border border-primary/20">
                          {reviewData.id}
                        </span>
                        {(() => {
                          const comp = getCompanyFromEmail(reviewData.email);
                          return (
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border",
                                comp.id === "npceram"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                  : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                              )}
                            >
                              <Building2 className="size-2.5" />
                              <span>{isRtl ? comp.nameFa : comp.nameEn}</span>
                            </span>
                          );
                        })()}
                      </div>
                      <span
                        className="text-xs text-muted-foreground truncate mt-0.5"
                        dir="ltr"
                      >
                        {reviewData.email}
                      </span>
                    </div>
                  </div>

                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Primary Role Workflow Approval Action */}
                    {reviewerRole === "hr" ? (
                      reviewData.status === "pending" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleApproveHr}
                          disabled={actionLoadingId === reviewData.id}
                          className="h-9 px-4 rounded-xl text-xs font-bold gap-2 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        >
                          {actionLoadingId === reviewData.id ? (
                            <RotateCw className="size-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="size-3.5" />
                          )}
                          <span>{t("approveHrBtn")}</span>
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                          <span>{t("hrVerifiedBadge")}</span>
                        </div>
                      )
                    ) : (
                      /* Manager Perspective */
                      reviewData.status === "hr_approved" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleApproveManager}
                          disabled={actionLoadingId === reviewData.id}
                          className="h-9 px-4 rounded-xl text-xs font-bold gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                        >
                          {actionLoadingId === reviewData.id ? (
                            <RotateCw className="size-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="size-3.5" />
                          )}
                          <span>{t("approveManagerBtn")}</span>
                        </Button>
                      ) : reviewData.status === "active" ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                          <span>{t("managerVerifiedBadge")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-xs border border-amber-500/20">
                          <Clock className="size-3.5 text-amber-500" />
                          <span>{t("stepAwaitingHr")}</span>
                        </div>
                      )
                    )}

                    {/* Save Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSaveProfileChanges}
                      disabled={isSaving}
                      className="h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer border-border/60 hover:bg-background"
                    >
                      <Save className="size-3.5 text-muted-foreground" />
                      <span>{t("saveChangesOnly")}</span>
                    </Button>

                    {/* Reject Button (if not rejected) */}
                    {reviewData.status !== "rejected" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRejectReason("");
                          setRejectModalOpen(true);
                        }}
                        className="h-9 px-3 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1 cursor-pointer"
                      >
                        <UserX className="size-3.5" />
                        <span>{t("rejectBtn")}</span>
                      </Button>
                    )}

                    {/* Resend Temp Password */}
                    {reviewData.status === "active" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResendCredentials}
                        className="h-9 px-3.5 rounded-xl text-xs font-medium gap-1.5 cursor-pointer"
                      >
                        <Send className="size-3.5" />
                        <span>{t("resendCredentialsBtn")}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Rejection notice or Temp password */}
                {reviewData.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold">{t("rejectionReasonLabel")}</span>
                      <p className="leading-relaxed">{reviewData.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {reviewData.tempPassword && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-3.5 text-primary" />
                      <span className="text-muted-foreground">
                        {t("tempPasswordLabel")}
                      </span>
                      <span className="font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border/60">
                        {reviewData.tempPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(reviewData.tempPassword!, `pass-${reviewData.id}`)
                      }
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `pass-${reviewData.id}` ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>{t("copyPassword")}</span>
                    </button>
                  </div>
                )}

                {/* =================================================== */}
                {/* SEGMENTED CONTROL / TABS */}
                {/* =================================================== */}
                <div className="bg-background/60 dark:bg-background/40 border border-border/40 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                  {SEGMENTS.map((seg) => {
                    const isActive = activeSegment === seg.id;
                    const isCompleted = completedSteps.has(seg.id);
                    const isHr = seg.owner === "hr";

                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => {
                          setActiveSegment(seg.id);
                          setOpenSegment(seg.id);
                          // Untick step when clicked on per user requirement
                          setCompletedSteps((prev) => {
                            const nextSet = new Set(prev);
                            nextSet.delete(seg.id);
                            return nextSet;
                          });
                        }}
                        className={cn(
                          "flex-1 min-w-[140px] flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                        )}
                      >
                        <div
                          className={cn(
                            "size-5 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold transition-colors",
                            isRtl && "fa-num",
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="size-3 stroke-[3]" />
                          ) : (
                            seg.stepNumber
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 text-start">
                          <span className="truncate">{t(seg.titleKey)}</span>
                          <span
                            className={cn(
                              "text-[9px] font-medium leading-none mt-0.5",
                              isActive
                                ? "text-primary-foreground/80"
                                : isHr
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {isHr ? t("badgeHrRole") : t("badgeManagerRole")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =================================================== */}
              {/* ACCORDION ITEMS CONTAINER (EDITABLE FIELDS) */}
              {/* =================================================== */}
              <div className="flex flex-col gap-4">
                {SEGMENTS.map((seg, idx) => {
                  const isOpen = openSegment === seg.id;
                  const isCompleted = completedSteps.has(seg.id);
                  const Icon = seg.icon;
                  const isFieldReadOnly =
                    (reviewerRole === "manager" && seg.owner === "hr") ||
                    (reviewerRole === "hr" && seg.owner === "manager");

                  return (
                    <div
                      key={seg.id}
                      className={cn(
                        "bg-slate-100/90 dark:bg-slate-800/40 border rounded-[1.5rem] transition-colors overflow-hidden",
                        isOpen
                          ? "border-primary/40 shadow-xs"
                          : "border-border/40 hover:border-border/70"
                      )}
                    >
                      {/* Accordion Trigger Header */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenSegment(isOpen ? null : seg.id);
                          setActiveSegment(seg.id);
                          // Untick step when clicked on per user requirement
                          setCompletedSteps((prev) => {
                            const nextSet = new Set(prev);
                            nextSet.delete(seg.id);
                            return nextSet;
                          });
                        }}
                        className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none text-right rtl:text-right ltr:text-left transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={cn(
                              "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs",
                              isCompleted
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : isOpen
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-muted-foreground border border-border/50"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="size-4 stroke-[2.5]" />
                            ) : (
                              <Icon className="size-4" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base text-foreground truncate">
                                {t(seg.titleKey)}
                              </span>
                              <span
                                className={cn(
                                  "px-1.5 py-0.2 rounded-md text-[9px] font-bold border",
                                  seg.owner === "hr"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                    : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                                )}
                              >
                                {seg.owner === "hr" ? t("badgeHrRole") : t("badgeManagerRole")}
                              </span>
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <Check className="size-2.5" />
                                  <span>{t("stageCompleted")}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground truncate mt-0.5">
                              {t(seg.descKey)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={cn("text-[11px] text-muted-foreground font-medium hidden sm:inline", isRtl && "fa-num")}>
                            {t("stepBadge", { step: seg.stepNumber, total: SEGMENTS.length })}
                          </span>
                          <div className="size-7 rounded-lg bg-background/60 flex items-center justify-center text-muted-foreground">
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform duration-250",
                                isOpen && "rotate-180 text-foreground"
                              )}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Accordion Content */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key={`content-${seg.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 sm:p-6 pt-2 border-t border-border/30 flex flex-col gap-5">
                              {/* Role-based Verification & View-Only Notice Banners */}
                              {reviewerRole === "manager" && seg.owner === "hr" && (
                                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2.5">
                                  <CheckCircle2 className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                  <div className="flex flex-col">
                                    <span className="font-bold">{t("hrVerifiedBadge")}</span>
                                    <span className="text-[11px] opacity-90 mt-0.5">{t("hrReadOnlyNotice")}</span>
                                  </div>
                                </div>
                              )}

                              {reviewerRole === "hr" && seg.owner === "manager" && (
                                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2.5">
                                  <Lock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                  <div className="flex flex-col">
                                    <span className="font-bold">{t("badgeManagerRole")}</span>
                                    <span className="text-[11px] opacity-90 mt-0.5">{t("managerReadOnlyNotice")}</span>
                                  </div>
                                </div>
                              )}

                              <fieldset disabled={isFieldReadOnly} className="contents group-disabled:pointer-events-none">
                              {/* ========================================= */}
                              {/* SEGMENT 1: IDENTITY & PERSONAL */}
                              {/* ========================================= */}
                              {seg.id === "personal" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Persian Name Fields */}
                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("firstNameFaLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.firstNameFa || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          firstNameFa: sanitizePersian(
                                            e.target.value
                                          ),
                                          name: `${sanitizePersian(
                                            e.target.value
                                          )} ${reviewData.lastNameFa || ""}`.trim(),
                                        })
                                      }
                                      placeholder={t("firstNameFaPlaceholder")}
                                      className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("lastNameFaLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.lastNameFa || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          lastNameFa: sanitizePersian(
                                            e.target.value
                                          ),
                                          name: `${
                                            reviewData.firstNameFa || ""
                                          } ${sanitizePersian(
                                            e.target.value
                                          )}`.trim(),
                                        })
                                      }
                                      placeholder={t("lastNameFaPlaceholder")}
                                      className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                    />
                                  </div>

                                  {/* English Name Fields */}
                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("firstNameEnLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.firstName || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          firstName: sanitizeEnglish(
                                            e.target.value
                                          ),
                                        })
                                      }
                                      placeholder={t("firstNameEnPlaceholder")}
                                      className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                      dir="ltr"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("lastNameEnLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.lastName || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          lastName: sanitizeEnglish(
                                            e.target.value
                                          ),
                                        })
                                      }
                                      placeholder={t("lastNameEnPlaceholder")}
                                      className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                      dir="ltr"
                                    />
                                  </div>

                                  {/* National ID & Phone */}
                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("nationalIdInputLabel")}
                                    </Label>
                                    <div className="relative">
                                      <CreditCard
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                      />
                                      <Input
                                        value={reviewData.nationalId || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            nationalId: normalizeDigits(
                                              e.target.value
                                            ),
                                          })
                                        }
                                        placeholder="0012345678"
                                        className={cn("pl-10 h-11 bg-background border-border/50 rounded-xl text-sm text-left", isRtl && "fa-num")}
                                        dir="ltr"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("phone")}
                                    </Label>
                                    <div className="relative">
                                      <Phone
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                      />
                                      <Input
                                        value={reviewData.phone || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            phone: normalizeDigits(
                                              e.target.value
                                            ),
                                          })
                                        }
                                        placeholder="0912..."
                                        className={cn("pl-10 h-11 bg-background border-border/50 rounded-xl text-sm text-left", isRtl && "fa-num")}
                                        dir="ltr"
                                      />
                                    </div>
                                  </div>

                                  {/* Email & Birth Date */}
                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("email")}
                                    </Label>
                                    <div className="relative">
                                      <Mail
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                      />
                                      <Input
                                        type="email"
                                        value={reviewData.email || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            email: e.target.value,
                                          })
                                        }
                                        className="pl-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                        dir="ltr"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("birthDateLabel")}
                                    </Label>
                                    <div className="relative">
                                      <Calendar
                                        size={18}
                                        className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                      />
                                      <Input
                                        value={reviewData.birthDate || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            birthDate: isRtl ? e.target.value : toAsciiDigits(e.target.value),
                                          })
                                        }
                                        placeholder={isRtl ? "1370/01/01" : "1991/03/21"}
                                        className={cn("ps-10 h-11 bg-background border-border/50 rounded-xl text-sm", isRtl && "fa-num")}
                                        dir="ltr"
                                      />
                                    </div>
                                  </div>

                                  {/* Marital Status & Children Count */}
                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("maritalStatusLabel")}
                                    </Label>
                                    <Combobox
                                      options={maritalOptions}
                                      value={reviewData.maritalStatus || "single"}
                                      onChange={(val) =>
                                        setReviewData({
                                          ...reviewData,
                                          maritalStatus: val as
                                            | "single"
                                            | "married",
                                          childrenCount:
                                            val === "single"
                                              ? 0
                                              : reviewData.childrenCount,
                                        })
                                      }
                                      placeholder={t("selectMaritalStatus")}
                                      emptyText={t("noResults")}
                                      className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("childrenCountLabel")}
                                    </Label>
                                    <div className="h-11 flex items-center">
                                      <div
                                        className={cn(
                                          "inline-flex items-center rounded-xl border border-border/50 bg-background p-1 shadow-2xs",
                                          reviewData.maritalStatus === "single" &&
                                            "opacity-50 pointer-events-none"
                                        )}
                                      >
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            setReviewData((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    childrenCount: Math.max(
                                                      0,
                                                      (prev.childrenCount || 0) -
                                                        1
                                                    ),
                                                  }
                                                : null
                                            )
                                          }
                                          disabled={
                                            reviewData.maritalStatus ===
                                              "single" ||
                                            (reviewData.childrenCount || 0) <= 0
                                          }
                                          className="size-8 rounded-lg text-foreground hover:bg-muted active:bg-muted flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                        >
                                          <Minus className="size-3.5 stroke-[2.5]" />
                                        </Button>
                                        <span className={cn("min-w-10 px-2 text-center font-mono font-bold text-sm text-foreground select-none", isRtl && "fa-num")}>
                                          {reviewData.childrenCount || 0}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            setReviewData((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    childrenCount: Math.min(
                                                      20,
                                                      (prev.childrenCount || 0) +
                                                        1
                                                    ),
                                                  }
                                                : null
                                            )
                                          }
                                          disabled={
                                            reviewData.maritalStatus ===
                                              "single" ||
                                            (reviewData.childrenCount || 0) >= 20
                                          }
                                          className="size-8 rounded-lg text-foreground hover:bg-muted active:bg-muted flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                        >
                                          <Plus className="size-3.5 stroke-[2.5]" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Residential Address */}
                                  <div className="flex flex-col gap-2 sm:col-span-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("addressLabel")}
                                    </Label>
                                    <div className="relative">
                                      <MapPin
                                        size={18}
                                        className="absolute start-3.5 top-3.5 text-muted-foreground/60 pointer-events-none"
                                      />
                                      <Textarea
                                        value={reviewData.address || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            address: e.target.value,
                                          })
                                        }
                                        rows={2}
                                        placeholder={t("addressPlaceholder")}
                                        className="ps-10 bg-background border-border/50 rounded-xl text-xs resize-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* ========================================= */}
                              {/* SEGMENT 2: ORGANIZATIONAL & JOB */}
                              {/* ========================================= */}
                              {seg.id === "org" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Auto-detected & Locked Company Field */}
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Building2 className="size-3.5 text-primary" />
                                        <span>{t("company")}</span>
                                      </Label>
                                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
                                        <Lock className="size-2.5 text-amber-500" />
                                        <span>{t("companyAutoDetected")}</span>
                                      </span>
                                    </div>
                                    <div className="relative">
                                      <Building2
                                        size={18}
                                        className="absolute start-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                                      />
                                      {(() => {
                                        const comp = getCompanyFromEmail(reviewData.email);
                                        return (
                                          <Input
                                            readOnly
                                            disabled
                                            value={isRtl ? comp.nameFa : comp.nameEn}
                                            className={cn(
                                              "ps-10 pe-10 h-11 border rounded-xl text-sm font-bold cursor-not-allowed select-none",
                                              comp.id === "npceram"
                                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                                : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                                            )}
                                          />
                                        );
                                      })()}
                                      <Lock
                                        size={16}
                                        className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("department")}
                                    </Label>
                                    <Combobox
                                      options={departmentOptions}
                                      value={reviewData.department || "engineering"}
                                      onChange={(val) =>
                                        setReviewData({
                                          ...reviewData,
                                          department: val,
                                        })
                                      }
                                      placeholder={t("selectDepartment")}
                                      emptyText={t("noResults")}
                                      className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("jobTitleLabel")}
                                    </Label>
                                    <div className="relative">
                                      <Briefcase
                                        size={18}
                                        className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                      />
                                      <Input
                                        value={reviewData.jobTitle || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            jobTitle: e.target.value,
                                          })
                                        }
                                        placeholder={t("jobTitlePlaceholder")}
                                        className="ps-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("employeeIdLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.employeeId || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          employeeId: e.target.value,
                                        })
                                      }
                                      placeholder="ESP-1001"
                                      className={cn("h-11 bg-background border-border/50 rounded-xl text-sm", isRtl && "fa-num")}
                                      dir="ltr"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("joinDateLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.joinDate || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          joinDate: isRtl ? e.target.value : toAsciiDigits(e.target.value),
                                        })
                                      }
                                      placeholder={isRtl ? "1402/01/01" : "2023/03/21"}
                                      className={cn("h-11 bg-background border-border/50 rounded-xl text-sm", isRtl && "fa-num")}
                                      dir="ltr"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("managerDirectLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.manager || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          manager: e.target.value,
                                        })
                                      }
                                      placeholder={t("managerDirectPlaceholder")}
                                      className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("extensionNumberLabel")}
                                    </Label>
                                    <Input
                                      value={reviewData.extensionNumber || ""}
                                      onChange={(e) =>
                                        setReviewData({
                                          ...reviewData,
                                          extensionNumber: isRtl
                                            ? normalizeDigits(e.target.value)
                                            : toAsciiDigits(e.target.value),
                                        })
                                      }
                                      placeholder="101"
                                      className={cn("h-11 bg-background border-border/50 rounded-xl text-sm", isRtl && "fa-num")}
                                      dir="ltr"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("workLocationLabel")}
                                    </Label>
                                    <Combobox
                                      options={workLocationOptions}
                                      value={reviewData.workLocation || "office"}
                                      onChange={(val) =>
                                        setReviewData({
                                          ...reviewData,
                                          workLocation: val,
                                        })
                                      }
                                      placeholder={t("workLocationLabel")}
                                      emptyText={t("noResults")}
                                      className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                      {t("contractTypeLabel")}
                                    </Label>
                                    <Combobox
                                      options={contractTypeOptions}
                                      value={
                                        reviewData.contractType || "full_time"
                                      }
                                      onChange={(val) =>
                                        setReviewData({
                                          ...reviewData,
                                          contractType: val,
                                        })
                                      }
                                      placeholder={t("contractTypeLabel")}
                                      emptyText={t("noResults")}
                                      className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* ========================================= */}
                              {/* SEGMENT 3: INSURANCE & FINANCIAL */}
                              {/* ========================================= */}
                              {seg.id === "insurance" && (
                                <div className="flex flex-col gap-5">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("insuranceCodeLabel")}
                                      </Label>
                                      <Input
                                        value={reviewData.insuranceCode || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            insuranceCode: normalizeDigits(
                                              e.target.value
                                            ),
                                          })
                                        }
                                        placeholder="1234567890"
                                        className={cn(
                                          "h-11 bg-background border-border/50 rounded-xl text-sm",
                                          isRtl && "fa-num"
                                        )}
                                        dir="ltr"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("insuranceProviderLabel")}
                                      </Label>
                                      <Input
                                        value={
                                          reviewData.insuranceProvider ||
                                          t("insuranceOptions.socialSecurity")
                                        }
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            insuranceProvider: e.target.value,
                                          })
                                        }
                                        className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("insuranceValidUntilLabel")}
                                      </Label>
                                      <Input
                                        value={reviewData.insuranceValidUntil || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            insuranceValidUntil: isRtl
                                              ? e.target.value
                                              : toAsciiDigits(e.target.value),
                                          })
                                        }
                                        placeholder={isRtl ? "1405/12/29" : "2027/03/20"}
                                        className={cn(
                                          "h-11 bg-background border-border/50 rounded-xl text-sm",
                                          isRtl && "fa-num"
                                        )}
                                        dir="ltr"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("supplementaryPlanLabel")}
                                      </Label>
                                      <Combobox
                                        options={supplementaryPlanOptions}
                                        value={
                                          reviewData.supplementaryPlan || "none"
                                        }
                                        onChange={(val) =>
                                          setReviewData({
                                            ...reviewData,
                                            supplementaryPlan: val as any,
                                          })
                                        }
                                        placeholder={t("supplementaryPlanLabel")}
                                        emptyText={t("noResults")}
                                        className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:col-span-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("shebaNumberLabel")}
                                      </Label>
                                      <div className="relative">
                                        <CreditCard
                                          size={18}
                                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                        />
                                        <Input
                                          value={reviewData.shebaNumber || ""}
                                          onChange={(e) =>
                                            setReviewData({
                                              ...reviewData,
                                              shebaNumber: e.target.value.toUpperCase(),
                                            })
                                          }
                                          placeholder="IR000000000000000000000000"
                                          className={cn(
                                            "pl-10 h-11 bg-background border-border/50 rounded-xl text-sm font-mono text-left",
                                            isRtl && "fa-num"
                                          )}
                                          dir="ltr"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dependents Sub-Section */}
                                  <div className="flex flex-col gap-3 pt-3 border-t border-border/30">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                                        <Users className="size-4 text-primary" />
                                        <span>{t("dependentsTitle")}</span>
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddDependent}
                                        className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/60 cursor-pointer"
                                      >
                                        <Plus className="size-3.5" />
                                        <span>{t("addDependentBtn")}</span>
                                      </Button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      {(reviewData.dependents || []).length ===
                                      0 ? (
                                        <p className="text-xs text-muted-foreground italic py-2">
                                          {t("noDependentsRegistered")}
                                        </p>
                                      ) : (
                                        (reviewData.dependents || []).map(
                                          (dep) => (
                                            <div
                                              key={dep.id}
                                              className="p-3 rounded-xl bg-background/60 border border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
                                            >
                                              <Input
                                                value={dep.fullName}
                                                onChange={(e) =>
                                                  handleUpdateDependent(
                                                    dep.id,
                                                    "fullName",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder={t("fullNamePlaceholder")}
                                                className="h-9 text-xs bg-background"
                                              />
                                              <Combobox
                                                options={relationshipOptions}
                                                value={dep.relationship}
                                                onChange={(val) =>
                                                  handleUpdateDependent(
                                                    dep.id,
                                                    "relationship",
                                                    val
                                                  )
                                                }
                                                placeholder={t("relationshipPlaceholder")}
                                                className="h-9 text-xs bg-background rtl:text-right"
                                              />
                                              <div className="flex items-center gap-2">
                                                <Input
                                                  value={dep.nationalId}
                                                  onChange={(e) =>
                                                    handleUpdateDependent(
                                                      dep.id,
                                                      "nationalId",
                                                      normalizeDigits(
                                                        e.target.value
                                                      )
                                                    )
                                                  }
                                                  placeholder={t("nationalIdPlaceholder")}
                                                  className={cn(
                                                    "h-9 text-xs bg-background",
                                                    isRtl && "fa-num"
                                                  )}
                                                  dir="ltr"
                                                />
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    handleRemoveDependent(
                                                      dep.id
                                                    )
                                                  }
                                                  className="size-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0 cursor-pointer"
                                                >
                                                  <Trash2 className="size-3.5" />
                                                </Button>
                                              </div>
                                            </div>
                                          )
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* ========================================= */}
                              {/* SEGMENT 4: EDUCATION & SKILLS */}
                              {/* ========================================= */}
                              {seg.id === "education" && (
                                <div className="flex flex-col gap-5">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("degreeLevelLabel")}
                                      </Label>
                                      <Combobox
                                        options={degreeOptions}
                                        value={
                                          reviewData.educationDegree || "bachelors"
                                        }
                                        onChange={(val) =>
                                          setReviewData({
                                            ...reviewData,
                                            educationDegree: val,
                                          })
                                        }
                                        placeholder={t("selectDegree")}
                                        emptyText={t("noResults")}
                                        className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("studyFieldLabel")}
                                      </Label>
                                      <Input
                                        value={reviewData.educationField || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            educationField: e.target.value,
                                          })
                                        }
                                        placeholder={t("studyFieldPlaceholder")}
                                        className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("universityLabel")}
                                      </Label>
                                      <Input
                                        value={reviewData.university || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            university: e.target.value,
                                          })
                                        }
                                        placeholder={t("universityPlaceholder")}
                                        className="h-11 bg-background border-border/50 rounded-xl text-sm"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("graduationYearLabel")}
                                      </Label>
                                      <Input
                                        value={reviewData.graduationYear || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            graduationYear: isRtl
                                              ? normalizeDigits(e.target.value)
                                              : toAsciiDigits(e.target.value),
                                          })
                                        }
                                        placeholder={isRtl ? "1398" : "2019"}
                                        className={cn("h-11 bg-background border-border/50 rounded-xl text-sm", isRtl && "fa-num")}
                                        dir="ltr"
                                      />
                                    </div>
                                  </div>

                                  {/* Skills Sub-Section */}
                                  <div className="flex flex-col gap-3 pt-3 border-t border-border/30">
                                    <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                                      <Star className="size-4 text-amber-500" />
                                      <span>{t("skillsTitle")}</span>
                                    </Label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {(reviewData.skills || []).map((sk) => (
                                        <div
                                          key={sk.id}
                                          className="p-3 rounded-xl bg-background/60 border border-border/40 flex items-center justify-between gap-3"
                                        >
                                          <span className="text-xs font-semibold text-foreground truncate">
                                            {sk.name}
                                          </span>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                              <button
                                                key={lvl}
                                                type="button"
                                                onClick={() => {
                                                  const newSkills = (
                                                    reviewData.skills || []
                                                  ).map((s) =>
                                                    s.id === sk.id
                                                      ? { ...s, level: lvl }
                                                      : s
                                                  );
                                                  setReviewData({
                                                    ...reviewData,
                                                    skills: newSkills,
                                                  });
                                                }}
                                                className="cursor-pointer"
                                              >
                                                <Star
                                                  className={cn(
                                                    "size-3.5",
                                                    lvl <= sk.level
                                                      ? "fill-amber-400 text-amber-400"
                                                      : "text-muted-foreground/30"
                                                  )}
                                                />
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* ========================================= */}
                              {/* SEGMENT 5: MODULES ACCESS */}
                              {/* ========================================= */}
                              {seg.id === "modules" && (
                                <div className="pt-1">
                                  <AdminModuleAccessStep
                                    modulesAccess={reviewData.modulesAccess || []}
                                    onChange={(updated) =>
                                      setReviewData((prev) =>
                                        prev ? { ...prev, modulesAccess: updated } : null
                                      )
                                    }
                                    availableModules={availableModules}
                                  />
                                </div>
                              )}
                            </fieldset>

                              {/* Accordion Footer Actions */}
                              <div className="flex items-center justify-between pt-3 border-t border-border/30 mt-1">
                                <div>
                                  {idx > 0 ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handlePrevStep(seg.id, SEGMENTS[idx - 1].id)
                                      }
                                      className="h-9 px-3.5 rounded-xl font-medium text-xs gap-1.5 cursor-pointer"
                                    >
                                      <PrevArrow className="size-3.5" />
                                      <span>{t("prevStep")}</span>
                                    </Button>
                                  ) : (
                                    <div />
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {!isFieldReadOnly && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleSaveProfileChanges}
                                      disabled={isSaving}
                                      className="h-9 px-3 rounded-xl font-medium text-xs gap-1.5 cursor-pointer border-border/50 hover:bg-background"
                                    >
                                      <Save className="size-3.5 text-muted-foreground" />
                                      <span>{t("saveChangesOnly")}</span>
                                    </Button>
                                  )}
                                  {idx < SEGMENTS.length - 1 ? (
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() =>
                                        handleNextStep(seg.id, SEGMENTS[idx + 1].id)
                                      }
                                      className="h-9 px-4 rounded-xl font-medium text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                      <span>{t("nextStep")}</span>
                                      <NextArrow className="size-3.5" />
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={handleSaveAndAdvance}
                                      disabled={isSaving}
                                      className="h-9 px-5 rounded-xl font-semibold text-xs gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                    >
                                      <Save className="size-3.5" />
                                      <span>
                                        {reviewerRole === "hr"
                                          ? t("saveAndApproveHr")
                                          : t("saveAndApproveManager")}
                                      </span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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
              {reviewData?.email}
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
              {isRejecting ? t("submitting") : t("confirmRejectBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
