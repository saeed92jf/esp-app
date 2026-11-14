"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
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
  FileText,
  Mail,
  Building2,
  ChevronRight,
  Tag,
  ShieldCheck,
  RotateCw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/services";
import { PendingRequest } from "@/modules/admin/types/admin.types";
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
  const [isCreating, setIsCreating] = useState(false);

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

      // Filter requests belonging to this user
      const userRequests = (res || []).filter((r) => {
        const matchesUser =
          (user?.id && r.userId === user.id) ||
          (userEmail && r.email?.toLowerCase() === userEmail.toLowerCase());
        return matchesUser;
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
      toast.error(isRtl ? "لطفاً عنوان درخواست را وارد فرمایید." : "Please enter the request title.");
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

      // Reset form and exit creation view without popup
      setTitle("");
      setDescription("");
      setPriority("normal");
      setCategory("equipment");
      setIsCreating(false);
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
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 shrink-0">
          <AlertCircle className="size-3 text-rose-500" />
          <span>{isRtl ? "اضطراری" : "Urgent"}</span>
        </span>
      );
    }
    if (p === "high") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
          <Clock className="size-3 text-amber-500" />
          <span>{isRtl ? "فوری" : "High"}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 flex items-center gap-1 shrink-0">
        <span>{isRtl ? "عادی" : "Normal"}</span>
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (status === "approved" || status === "active") {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0 shadow-2xs">
          <ShieldCheck className="size-3 text-emerald-500" />
          <span>{isRtl ? "تأیید و ارجاع شده" : "Assigned"}</span>
        </span>
      );
    }
    if (status === "completed") {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1 shrink-0 shadow-2xs">
          <CheckCircle2 className="size-3 text-blue-500" />
          <span>{isRtl ? "تکمیل شده" : "Completed"}</span>
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 shrink-0 shadow-2xs">
          <XCircle className="size-3 text-rose-500" />
          <span>{isRtl ? "عدم تأیید" : "Rejected"}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0 shadow-2xs">
        <Clock className="size-3 text-amber-500" />
        <span>{isRtl ? "در انتظار بررسی" : "Pending"}</span>
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // VIEW: Create New Request (In-Page Segmented List Style - No Popup)
  // ─────────────────────────────────────────────────────────────
  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-8 animate-in fade-in duration-150" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex items-center gap-4 mb-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted/60 size-10 shrink-0 cursor-pointer"
            onClick={() => setIsCreating(false)}
            title={isRtl ? "بازگشت به فهرست درخواست‌ها" : "Back to requests list"}
          >
            <ArrowLeft className="size-6 text-foreground rtl:rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-normal text-foreground">
              {isRtl ? "ثبت درخواست جدید" : "New Request"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {isRtl
                ? "ارسال نیازمندی سازمانی اعم از تجهیزات، دسترسی، آموزش و خدمات به مدیریت"
                : "Submit organizational requirement to management"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitNewRequest}>
          <div className="segmented-list mb-8">
            {/* 1. Category */}
            <div className="segmented-item no-hover-bg shadow-none p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Tag className="size-4" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground">
                    {isRtl ? "دسته‌بندی درخواست" : "Request Category"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "نوع خدمات، تجهیزات یا نیازمندی مورد نظر خود را انتخاب نمایید." : "Select the category of your request."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {SERVICE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-2xl border text-start transition-all cursor-pointer select-none",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground font-bold shadow-2xs"
                          : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn("size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors", isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Icon className="size-4" />
                      </div>
                      <span className="text-xs leading-snug line-clamp-2">
                        {isRtl ? cat.labelFa : cat.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Title */}
            <div className="segmented-item no-hover-bg shadow-none p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="req-title" className="text-sm font-semibold text-foreground">
                    {isRtl ? "عنوان درخواست" : "Request Title"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "عنوان مشخص و خلاصه درخواست خود را بنویسید." : "Enter a clear, concise title."}
                  </p>
                </div>
              </div>
              <Input
                id="req-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isRtl
                    ? "مثال: درخواست مانیتور دوم جهت طراحی سالیدورکز / دسترسی به سرور نقشه / دوره نرم‌افزار ANSYS"
                    : "e.g. Secondary display for CAD / Access to engineering server / Training course"
                }
                className="h-11 text-xs sm:text-sm rounded-xl border-border/70 bg-background/80"
                required
              />
            </div>

            {/* 3. Target Department */}
            <div className="segmented-item no-hover-bg shadow-none p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Building2 className="size-4" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="req-dept" className="text-sm font-semibold text-foreground">
                    {isRtl ? "واحد سازمانی مخاطب" : "Target Department"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "دپارتمان یا واحد مسئول رسیدگی به این نیازمندی را تعیین فرمایید." : "Select the responsible department."}
                  </p>
                </div>
              </div>
              <select
                id="req-dept"
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full h-11 text-xs sm:text-sm rounded-xl border border-border/70 bg-background px-3 font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {TARGET_DEPARTMENTS.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {isRtl ? dept.labelFa : dept.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Priority */}
            <div className="segmented-item no-hover-bg shadow-none p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Clock className="size-4" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-foreground">
                    {isRtl ? "درجه فوریت و اولویت" : "Priority Level"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "میزان اضطرار و حساسیت زمانی درخواست را مشخص فرمایید." : "Specify the urgency level."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 h-11 pt-1">
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
                      "rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer select-none",
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

            {/* 5. Description */}
            <div className="segmented-item no-hover-bg shadow-none p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ClipboardList className="size-4" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="req-desc" className="text-sm font-semibold text-foreground">
                    {isRtl ? "شرح کامل نیازمندی و دلایل توجیهی" : "Detailed Description & Justification"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "مشخصات فنی دقیق، دلایل کاری و هرگونه توضیحات لازم را درج فرمایید." : "Provide detailed specifications and reasons for management review."}
                  </p>
                </div>
              </div>
              <Textarea
                id="req-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={
                  isRtl
                    ? "مشخصات دقیق مورد نیاز، دلایل کاری، و هرگونه توضیحات لازم جهت بررسی مدیریت را در این کادر بنویسید..."
                    : "Describe the requirements, reasons, and any specifications for management review..."
                }
                className="text-xs sm:text-sm rounded-xl border-border/70 p-3 leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Action Bar matching Personal Info Save/Cancel */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreating(false)}
              className="rounded-full px-6 font-medium text-primary hover:bg-primary/5 cursor-pointer"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="rounded-full px-8 font-medium bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-xs gap-2"
            >
              {isSubmitting ? (
                <RotateCw className="size-4 animate-spin" />
              ) : (
                <Send className="size-4 rtl:rotate-180" />
              )}
              <span>{isRtl ? "ثبت و ارسال به مدیریت" : "Submit to Management"}</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW: Main Requests List (Segmented List matching Personal Info)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-8 animate-in fade-in duration-300" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-normal text-foreground mb-1">
            {isRtl ? "درخواست‌های سازمانی" : "Organizational Requests"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isRtl
              ? "ثبت و پیگیری کلیه درخواست‌های سازمانی، تجهیزات، دسترسی و آموزش"
              : "Submit and track organizational requests, equipment, access and training"}
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-2xl border border-border/60">
            {(
              [
                { id: "all", labelFa: "همه", labelEn: "All" },
                { id: "pending", labelFa: "در انتظار", labelEn: "Pending" },
                { id: "approved", labelFa: "تأیید شده", labelEn: "Assigned" },
                { id: "completed", labelFa: "تکمیل", labelEn: "Completed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
                  statusFilter === tab.id
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isRtl ? tab.labelFa : tab.labelEn}
              </button>
            ))}
          </div>

          <div className="relative w-44 sm:w-52">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "جستجو..." : "Search..."}
              className="h-8 ps-8 text-xs rounded-xl border-border/60 bg-background"
            />
          </div>
        </div>
      </div>

      {/* The Segmented List */}
      <div className="segmented-list mb-10">
        {isLoading ? (
          <div className="segmented-item no-hover-bg shadow-none flex flex-col items-center justify-center py-12 px-4 text-center">
            <RotateCw className="size-6 animate-spin text-primary mb-2" />
            <span className="text-xs text-muted-foreground">{isRtl ? "در حال دریافت درخواست‌ها..." : "Loading requests..."}</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="segmented-item no-hover-bg shadow-none flex flex-col items-center justify-center py-10 px-4 text-center">
            <ClipboardList className="size-8 text-muted-foreground/60 mb-2" />
            <span className="text-sm font-medium text-foreground mb-1">
              {isRtl ? "هیچ درخواستی یافت نشد" : "No requests found"}
            </span>
            <span className="text-xs text-muted-foreground max-w-sm">
              {isRtl
                ? "تاکنون درخواستی ثبت نشده است. با کلیک بر روی «ثبت درخواست جدید» در زیر، می‌توانید نیازمندی خود را ارسال فرمایید."
                : "No requests found. Click 'New Request' below to submit a requirement to management."}
            </span>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.key === req.category) || SERVICE_CATEGORIES[0];
            const CatIcon = cat.icon;
            const isExpanded = expandedId === req.id;

            return (
              <div
                key={req.id}
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                className="segmented-item no-hover-bg shadow-none flex flex-col justify-center px-4 sm:px-6 relative outline-none cursor-pointer group min-h-[72px] py-3.5 transition-all"
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />

                {/* Primary Row Header */}
                <div className="flex items-center justify-between w-full gap-3 relative z-10">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={cn("size-9 rounded-2xl flex items-center justify-center shrink-0 border", cat.badgeBg)}>
                      <CatIcon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{req.title}</span>
                        <span className="text-[10px] font-mono text-muted-foreground fa-num px-1.5 py-0.5 rounded bg-muted/60 hidden sm:inline-block">
                          {req.id}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate block">
                        {isRtl ? cat.labelFa : cat.labelEn} · <span className="fa-num">{formatDate(req.requestedAt)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getPriorityBadge(req.priority)}
                    {getStatusBadge(req.status)}
                    <ChevronRight className={cn("size-5 text-muted-foreground shrink-0 rtl:rotate-180 transition-transform duration-200", isExpanded && "rotate-90 rtl:-rotate-90")} />
                  </div>
                </div>

                {/* Expanded Details without any popup */}
                {isExpanded && (
                  <div
                    className="mt-3.5 pt-3.5 border-t border-border/40 text-xs text-foreground space-y-3 relative z-10 animate-in fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">
                        {isRtl ? "شرح کامل درخواست:" : "Description:"}
                      </span>
                      <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40">
                        {req.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="size-3.5 text-muted-foreground/70" />
                      <span>
                        {isRtl ? "واحد مخاطب: " : "Target Department: "}
                        <strong className="text-foreground font-semibold">
                          {TARGET_DEPARTMENTS.find((d) => d.value === req.targetDepartment)?.[isRtl ? "labelFa" : "labelEn"] ||
                            req.targetDepartment ||
                            "IT"}
                        </strong>
                      </span>
                    </div>

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
                            <span className="text-[10px] text-muted-foreground font-mono fa-num">
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

                    {req.status === "rejected" && req.rejectionReason && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                        <span className="font-bold">{isRtl ? "علت عدم تأیید:" : "Rejection Reason:"}</span>
                        <p className="leading-relaxed">{req.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Request segmented-item row */}
        <div
          onClick={() => setIsCreating(true)}
          className="relative outline-none segmented-item no-hover-bg shadow-none flex items-center justify-center px-4 sm:px-6 cursor-pointer group h-[72px] border-t border-border/40 hover:bg-muted/20 transition-colors"
        >
          <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
          <div className="flex items-center gap-2 text-primary font-medium">
            <Plus className="size-5 shrink-0" />
            <span>{isRtl ? "ثبت درخواست جدید" : "New Request"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
