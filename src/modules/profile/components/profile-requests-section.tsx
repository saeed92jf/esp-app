"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  Laptop,
  Network,
  GraduationCap,
  Sparkles,
  ClipboardList,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserCheck,
  Search,
  Filter,
  FileText,
  Mail,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/services";
import { PendingRequest, RequestPriority } from "@/modules/admin/types/admin.types";
import { UserProfile } from "../types/profile";
import { getJalaliDate } from "@/components/ui/date-picker";

export type ServiceCategoryKey =
  | "equipment"
  | "network"
  | "training"
  | "software"
  | "administrative"
  | "other";

interface CategoryMeta {
  key: ServiceCategoryKey;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeBg: string;
}

const SERVICE_CATEGORIES: CategoryMeta[] = [
  {
    key: "equipment",
    labelFa: "تجهیزات و سخت‌افزار",
    labelEn: "Equipment & Hardware",
    icon: Laptop,
    colorClass: "text-blue-500 dark:text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25",
  },
  {
    key: "network",
    labelFa: "دسترسی به شبکه و سیستم‌ها",
    labelEn: "Network & Systems Access",
    icon: Network,
    colorClass: "text-cyan-500 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25",
  },
  {
    key: "training",
    labelFa: "آموزش و دوره‌های مهارتی",
    labelEn: "Training & Courses",
    icon: GraduationCap,
    colorClass: "text-amber-500 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
  },
  {
    key: "software",
    labelFa: "نرم‌افزار، لایسنس و ابزارها",
    labelEn: "Software & Licenses",
    icon: Wrench,
    colorClass: "text-indigo-500 dark:text-indigo-400",
    badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
  },
  {
    key: "administrative",
    labelFa: "امور اداری و خدمات عمومی",
    labelEn: "Administrative & General Services",
    icon: ClipboardList,
    colorClass: "text-emerald-500 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
  },
  {
    key: "other",
    labelFa: "سایر نیازمندی‌ها",
    labelEn: "Other Requests",
    icon: Sparkles,
    colorClass: "text-purple-500 dark:text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
  },
];

const TARGET_DEPARTMENTS = [
  { value: "IT", labelFa: "فناوری اطلاعات، شبکه و زیرساخت (IT)", labelEn: "IT & Infrastructure" },
  { value: "administration", labelFa: "امور اداری و منابع انسانی", labelEn: "Administration & HR" },
  { value: "engineering", labelFa: "مهندسی، طراحی و فنی", labelEn: "Engineering & Technical" },
  { value: "procurement", labelFa: "تدارکات و بازرگانی", labelEn: "Procurement & Commercial" },
  { value: "finance", labelFa: "امور مالی و حسابداری", labelEn: "Finance & Accounting" },
  { value: "factory", labelFa: "مدیریت کارخانه و خط تولید", labelEn: "Plant & Production" },
  { value: "other", labelFa: "سایر واحدها", labelEn: "Other Departments" },
];

interface ProfileRequestsSectionProps {
  user: any;
  isRtl: boolean;
}

export function ProfileRequestsSection({ user, isRtl }: ProfileRequestsSectionProps) {
  const locale = useLocale();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New Request Form State
  const [category, setCategory] = useState<ServiceCategoryKey>("equipment");
  const [title, setTitle] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("IT");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [description, setDescription] = useState("");

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const userEmail = user?.email || user?.personal?.email;
      const userIdent = user?.id || userEmail;
      const res = await api.admin.getPendingRequests({
        userId: userIdent,
      } as any);

      // Filter only requests belonging to this user or general service requests
      const userRequests = (res || []).filter((r) => {
        const matchesUser =
          (user?.id && r.userId === user.id) ||
          (userEmail && r.email?.toLowerCase() === userEmail.toLowerCase());
        return matchesUser && r.requestType === "service_request";
      });

      setRequests(userRequests);
    } catch (err) {
      console.warn("Failed to load user service requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userIdent = user?.id || user?.email || user?.personal?.email;
    if (userIdent) {
      loadRequests();
    }
  }, [user?.id, user?.email, user?.personal?.email]);

  const handleSubmitNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(isRtl ? "لطفاً عنوان درخواست را وارد کنید." : "Please enter the request title.");
      return;
    }
    if (!description.trim()) {
      toast.error(isRtl ? "لطفاً شرح درخواست را وارد فرمایید." : "Please provide a detailed description.");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedCat = SERVICE_CATEGORIES.find((c) => c.key === category);
      const reqId = `req-srv-${Math.floor(100000 + Math.random() * 900000)}`;

      const userEmail = user?.email || user?.personal?.email || "";
      const userName = user?.fullNameFa || user?.fullName || user?.name || user?.personal?.fullNameFa || user?.personal?.fullName || "کاربر سازمانی";
      const userPhone = user?.phone || user?.personal?.phone || "";
      const userDept = user?.department || user?.organizational?.department || "Engineering";
      const userCompany = user?.company || user?.organizational?.company || "Euroslot Pars";
      const userCompanyId = user?.companyId || user?.organizational?.companyId || "euroslot";

      const newReqPayload: Partial<PendingRequest> = {
        id: reqId,
        userId: user?.id,
        name: userName,
        fullName: user?.fullName || user?.name || user?.personal?.fullName || userName,
        fullNameFa: user?.fullNameFa || user?.personal?.fullNameFa || userName,
        email: userEmail,
        phone: userPhone,
        department: userDept,
        company: userCompany,
        companyId: userCompanyId,
        requestType: "service_request",
        category,
        categoryLabel: isRtl ? selectedCat?.labelFa : selectedCat?.labelEn,
        title: title.trim(),
        description: description.trim(),
        priority,
        targetDepartment,
        status: "pending",
        requestedAt: new Date().toISOString(),
      };

      const created = await api.admin.createRequest(newReqPayload);
      setRequests((prev) => [created || (newReqPayload as PendingRequest), ...prev]);

      toast.success(
        isRtl
          ? "درخواست سازمانی شما با موفقیت ثبت شد و به پنل مدیریت ارسال گردید."
          : "Your organizational request has been successfully submitted to management."
      );

      // Reset form and close
      setTitle("");
      setDescription("");
      setPriority("normal");
      setCategory("equipment");
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ثبت درخواست." : "Failed to submit request."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && r.status !== "pending") return false;
        if (statusFilter === "approved" && r.status !== "approved" && r.status !== "active") return false;
        if (statusFilter === "completed" && r.status !== "completed") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title?.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesId = r.id?.toLowerCase().includes(q);
        const matchesCat = r.categoryLabel?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesId && !matchesCat) return false;
      }
      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      if (isRtl) {
        const j = getJalaliDate(d);
        return `${j.year}/${String(j.month).padStart(2, "0")}/${String(j.day).padStart(2, "0")}`;
      }
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getPriorityBadge = (p?: string) => {
    if (p === "urgent") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertCircle className="size-3 text-rose-500" />
          <span>{isRtl ? "اضطراری" : "Urgent"}</span>
        </span>
      );
    }
    if (p === "high") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <Clock className="size-3 text-amber-500" />
          <span>{isRtl ? "فوری" : "High"}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 flex items-center gap-1">
        <span>{isRtl ? "عادی" : "Normal"}</span>
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (status === "approved" || status === "active") {
      return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-2xs">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>{isRtl ? "تأیید و ارجاع به کارشناس مجری" : "Approved & Assigned"}</span>
        </span>
      );
    }
    if (status === "completed") {
      return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 className="size-3.5 text-blue-500" />
          <span>{isRtl ? "تکمیل و نهایی شده" : "Completed"}</span>
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shadow-2xs">
          <XCircle className="size-3.5 text-rose-500" />
          <span>{isRtl ? "عدم تأیید / رد شده" : "Rejected"}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-2xs">
        <Clock className="size-3.5 text-amber-500 animate-pulse" />
        <span>{isRtl ? "در انتظار بررسی مدیریت" : "Pending Review"}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-background/60 to-primary/5 border border-primary/20 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Send className="size-3.5" />
              <span>{isRtl ? "سامانه درخواست‌های سازمانی ESP CORE" : "ESP CORE Service Requests"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {isRtl ? "درخواست‌های تجهیزات، آموزش و دسترسی" : "Equipment, Training & Access Requests"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {isRtl
                ? "ثبت و پیگیری کلیه درخواست‌های سازمانی اعم از تجهیزات فنی، دسترسی‌های شبکه و VPN، دوره‌های آموزشی و نرم‌افزارها با ارجاع مستقیم مدیریت."
                : "Submit and track organizational requests including hardware equipment, network access, training courses, and tools with executive assignment."}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            <span>{isRtl ? "ثبت درخواست جدید" : "New Request"}</span>
          </Button>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-border/50">
          <div className="flex items-center gap-1.5 p-1 bg-background/80 dark:bg-card/80 rounded-2xl border border-border/60">
            {(
              [
                { id: "all", labelFa: "همه درخواست‌ها", labelEn: "All" },
                { id: "pending", labelFa: "در انتظار بررسی", labelEn: "Pending" },
                { id: "approved", labelFa: "تأیید و ارجاع شده", labelEn: "Assigned" },
                { id: "completed", labelFa: "تکمیل شده", labelEn: "Completed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isRtl ? tab.labelFa : tab.labelEn}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "جستجو در درخواست‌ها..." : "Search requests..."}
              className="h-9 ps-9 text-xs rounded-xl border-border/60 bg-background/80"
            />
          </div>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <RotateCw className="size-6 animate-spin text-primary" />
          <span className="text-xs">{isRtl ? "در حال دریافت درخواست‌ها..." : "Loading requests..."}</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/70 bg-card/40 space-y-3">
          <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <h3 className="font-bold text-sm text-foreground">
            {isRtl ? "هیچ درخواستی یافت نشد" : "No requests found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {isRtl
              ? "تاکنون درخواستی در این بخش ثبت نشده است. می‌توانید با کلیک روی دکمه 'ثبت درخواست جدید' نیازمندی خود را ارسال فرمایید."
              : "No requests have been submitted yet. Click 'New Request' to send your requirements to management."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="size-3.5" />
            <span>{isRtl ? "ثبت درخواست جدید" : "Create Request"}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.key === req.category) || SERVICE_CATEGORIES[0];
            const CatIcon = cat.icon;
            const isExpanded = expandedId === req.id;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all shadow-xs space-y-3",
                  req.status === "approved" && "border-emerald-500/30 bg-emerald-500/[0.02]"
                )}
              >
                {/* Top Row: Category, Tracking Code, Priority, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {req.id}
                    </span>
                    <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1", cat.badgeBg)}>
                      <CatIcon className="size-3" />
                      <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
                    </span>
                    {getPriorityBadge(req.priority)}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(req.status)}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      <span>{formatDate(req.requestedAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                    {req.title}
                  </h4>
                  <p className={cn("text-xs text-muted-foreground mt-1 leading-relaxed", !isExpanded && "line-clamp-2")}>
                    {req.description}
                  </p>
                  {req.description && req.description.length > 120 && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="text-[11px] font-medium text-primary hover:underline mt-1 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isExpanded ? (isRtl ? "بستن متن" : "Show less") : (isRtl ? "مشاهده کامل متن" : "Read more")}</span>
                      {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </button>
                  )}
                </div>

                {/* Target Department */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <Building2 className="size-3.5 text-muted-foreground/70" />
                  <span>
                    {isRtl ? "واحد مخاطب: " : "Target Unit: "}
                    <strong className="text-foreground font-semibold">
                      {TARGET_DEPARTMENTS.find((d) => d.value === req.targetDepartment)?.[isRtl ? "labelFa" : "labelEn"] ||
                        req.targetDepartment ||
                        "IT"}
                    </strong>
                  </span>
                </div>

                {/* Executive Assignment Card (If Manager Approved & Assigned) */}
                {req.assignedTo && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                          <UserCheck className="size-4" />
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground">
                            {isRtl ? "ارجاع داده شده توسط مدیریت به:" : "Assigned by Management to:"}
                          </span>
                          <div className="font-bold text-foreground">
                            {req.assignedTo.name}{" "}
                            {req.assignedTo.department && (
                              <span className="text-muted-foreground font-normal">
                                ({req.assignedTo.department})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {req.assignedAt && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(req.assignedAt)}
                        </span>
                      )}
                    </div>

                    {req.managerNote && (
                      <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-foreground/90 leading-relaxed">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          {isRtl ? "دستور و یادداشت مدیریت: " : "Manager Directive: "}
                        </span>
                        <span>{req.managerNote}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                      <Mail className="size-3" />
                      <span>
                        {isRtl
                          ? `ایمیل ابلاغ کار سازمانی به همراه امضای رسمی ESP CORE به ${req.assignedTo.email} ارسال گردید.`
                          : `Assignment email with ESP CORE signature was dispatched to ${req.assignedTo.email}.`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rejection notice */}
                {req.status === "rejected" && req.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                    <span className="font-bold">{isRtl ? "علت عدم تأیید:" : "Rejection Reason:"}</span>
                    <p className="leading-relaxed">{req.rejectionReason}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Request Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-7 border border-border/70 shadow-2xl" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader className="text-start space-y-1.5">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Send className="size-5" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
              {isRtl ? "ثبت درخواست سازمانی جدید" : "Submit New Organizational Request"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {isRtl
                ? "این درخواست مستقیماً در کارتابل مدیریت قرار می‌گیرد و پس از بررسی، همراه با دستور اقدام و امضای رسمی ESP CORE به کارشناس مربوطه ارجاع خواهد شد."
                : "This request will be sent to the management dashboard and assigned to the responsible staff with the official ESP CORE signature upon approval."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitNewRequest} className="space-y-4 pt-2">
            {/* Category selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground">
                {isRtl ? "دسته‌بندی درخواست:" : "Request Category:"}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SERVICE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-2xl border text-start transition-all cursor-pointer select-none",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground font-bold shadow-2xs"
                          : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn("size-7 rounded-xl flex items-center justify-center shrink-0", isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Icon className="size-4" />
                      </div>
                      <span className="text-xs leading-tight line-clamp-2">
                        {isRtl ? cat.labelFa : cat.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                {isRtl ? "عنوان درخواست:" : "Request Title:"}
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isRtl
                    ? "مثال: درخواست مانیتور دوم جهت طراحی سالیدورکز / دسترسی به سرور نقشه / دوره نرم‌افزار ANSYS"
                    : "e.g. Request secondary display for SolidWorks / VPN server access"
                }
                className="h-10 text-xs rounded-xl border-border/70"
                required
              />
            </div>

            {/* Target Department & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  {isRtl ? "واحد سازمانی مخاطب:" : "Target Department:"}
                </Label>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full h-10 text-xs rounded-xl border border-border/70 bg-background px-3 font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {TARGET_DEPARTMENTS.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {isRtl ? dept.labelFa : dept.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  {isRtl ? "درجه فوریت و اولویت:" : "Priority Level:"}
                </Label>
                <div className="grid grid-cols-3 gap-1.5 h-10">
                  {(
                    [
                      { id: "normal", labelFa: "عادی", labelEn: "Normal" },
                      { id: "high", labelFa: "فوری", labelEn: "High" },
                      { id: "urgent", labelFa: "اضطراری", labelEn: "Urgent" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={cn(
                        "rounded-xl text-xs font-bold border transition-all cursor-pointer select-none",
                        priority === p.id
                          ? p.id === "urgent"
                            ? "bg-rose-500 text-white border-rose-600 shadow-2xs"
                            : p.id === "high"
                            ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                            : "bg-primary text-white border-primary shadow-2xs"
                          : "border-border/60 text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {isRtl ? p.labelFa : p.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                {isRtl ? "شرح کامل نیازمندی و توضیحات توجیهی:" : "Detailed Description & Justification:"}
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={
                  isRtl
                    ? "مشخصات دقیق مورد نیاز، دلایل کاری، و هرگونه توضیحات لازم جهت بررسی مدیریت را در این کادر بنویسید..."
                    : "Describe the requirements, reasons, and any specifications for management review..."
                }
                className="text-xs rounded-2xl border-border/70 p-3 leading-relaxed"
                required
              />
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="h-10 rounded-xl text-xs font-medium cursor-pointer"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <RotateCw className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>{isRtl ? "ثبت و ارسال به مدیریت" : "Submit to Management"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
