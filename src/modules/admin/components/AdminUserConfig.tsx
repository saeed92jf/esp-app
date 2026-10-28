import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { User, UserModuleAccess } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  UserCircle2,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  Users,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Building2,
  CheckCircle2,
  Lock,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { getCompanyFromEmail } from "../utils/company";
import { AdminModuleAccessStep } from "./AdminModuleAccessStep";
import {
  getDepartmentsForCompany,
  getJobTitlesForDepartment,
  getManagerialTitlesWithOccupants,
} from "../data/organization-data";

export interface AdminUserConfigProps {
  selectedUser?: User | null;
  users: User[];
  setUsers: (u: User[]) => void;
  setSelectedUser?: (u: User) => void;
  availableModules?: any[];
  tMenu?: any;
  handleToggleModuleAccess?: (moduleId: string, checked: boolean) => void;
  handleToggleAllModulesAccess?: (checked: boolean) => void;
}

type SegmentId = "identity" | "org" | "personal" | "education" | "modules";

interface FormState {
  firstNameFa: string;
  lastNameFa: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  department: string;
  role: "admin" | "user";
  jobTitle: string;
  manager: string;
  salary: number;
  age: number;
  maritalStatus: "single" | "married";
  childrenCount: number;
  insuranceType: "none" | "socialSecurity" | "complementary";
  educationDegree: string;
  educationField: string;
  workMode: "office" | "factory" | "site" | "remote";
  modulesAccess: UserModuleAccess[];
}

const INITIAL_FORM: FormState = {
  firstNameFa: "",
  lastNameFa: "",
  firstName: "",
  lastName: "",
  name: "",
  email: "",
  phone: "",
  nationalId: "",
  department: "engineering",
  role: "user",
  jobTitle: "",
  manager: "",
  salary: 12000,
  age: 28,
  maritalStatus: "single",
  childrenCount: 0,
  insuranceType: "socialSecurity",
  educationDegree: "bachelors",
  educationField: "",
  workMode: "office",
  modulesAccess: [
    { moduleId: "/dashboard/projects", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
    { moduleId: "/dashboard/tasks", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
  ],
};

const sanitizePersian = (text: string) => {
  return text.replace(/[^ \u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C]/g, "");
};

const sanitizeEnglish = (text: string) => {
  return text.replace(/[^ a-zA-Z'-]/g, "");
};

const normalizeDigits = (val: string) => {
  return val.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
};

export function AdminUserConfig({
  users,
  setUsers,
  setSelectedUser,
  availableModules,
  tMenu,
}: AdminUserConfigProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { confirm } = useConfirm();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [activeSegment, setActiveSegment] = useState<SegmentId>("identity");
  const [openSegment, setOpenSegment] = useState<SegmentId | null>("identity");
  const [confirmedSegments, setConfirmedSegments] = useState<Set<SegmentId>>(new Set());

  const detectedCompany = getCompanyFromEmail(form.email);

  const fullNameFa = `${form.firstNameFa.trim()} ${form.lastNameFa.trim()}`.trim();
  const fullNameEn = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
  const previewDisplayName = (isRtl ? (fullNameFa || fullNameEn) : (fullNameEn || fullNameFa)) || form.name.trim();
  const previewSecondaryName = isRtl
    ? (fullNameFa && fullNameEn ? fullNameEn : "")
    : (fullNameEn && fullNameFa ? fullNameFa : "");

  // Company-scoped dynamic options
  const departmentOptions = React.useMemo(() => {
    return getDepartmentsForCompany(detectedCompany.id, isRtl);
  }, [detectedCompany.id, isRtl]);

  const jobTitleOptions = React.useMemo(() => {
    return getJobTitlesForDepartment(detectedCompany.id, form.department, isRtl);
  }, [detectedCompany.id, form.department, isRtl]);

  const managerOptions = React.useMemo(() => {
    return getManagerialTitlesWithOccupants(detectedCompany.id, users, isRtl);
  }, [detectedCompany.id, users, isRtl]);

  // Synchronize department when email domain / company switches
  React.useEffect(() => {
    const isDeptValid = departmentOptions.some((d) => d.value === form.department);
    if (!isDeptValid && departmentOptions.length > 0) {
      setForm((prev) => ({ ...prev, department: departmentOptions[0].value }));
    }
  }, [departmentOptions, form.department]);

  const roleOptions = [
    { value: "admin", label: t("roleAdmin") },
    { value: "user", label: t("roleUser") },
  ];

  const maritalOptions = [
    { value: "single", label: t("maritalStatusOptions.single") },
    { value: "married", label: t("maritalStatusOptions.married") },
  ];

  const insuranceOptions = [
    { value: "none", label: t("insuranceOptions.none") },
    { value: "socialSecurity", label: t("insuranceOptions.socialSecurity") },
    { value: "complementary", label: t("insuranceOptions.complementary") },
  ];

  const degreeOptions = [
    { value: "diploma", label: t("degreesOptions.diploma") },
    { value: "bachelors", label: t("degreesOptions.bachelors") },
    { value: "master", label: t("degreesOptions.master") },
    { value: "phd", label: t("degreesOptions.phd") },
  ];

  const workModeOptions = [
    { value: "office", label: t("workFormatOffice") },
    { value: "factory", label: t("workFormatFactory") },
    { value: "site", label: t("workFormatSite") },
    { value: "remote", label: t("workFormatRemote") },
  ];

  // Segment filled checks
  const isSegmentFilled = (id: SegmentId): boolean => {
    switch (id) {
      case "identity": {
        const hasFa = Boolean(form.firstNameFa.trim().length > 0 || form.lastNameFa.trim().length > 0);
        const hasEn = Boolean(form.firstName.trim().length > 0 || form.lastName.trim().length > 0);
        const hasAnyName = Boolean(hasFa || hasEn || form.name.trim().length > 0);
        return Boolean(hasAnyName && form.email.trim().length > 0);
      }
      case "org":
        return Boolean(form.department && form.role && form.jobTitle.trim().length > 0);
      case "personal":
        return Boolean(form.age >= 18 && form.maritalStatus && form.insuranceType);
      case "education":
        return Boolean(form.educationDegree && form.educationField.trim().length > 0);
      case "modules":
        return true;
      default:
        return false;
    }
  };

  // Step is only ticked if confirmed by Next AND info is currently filled (un-ticks if info cleared)
  const isSegmentTicked = (id: SegmentId): boolean => {
    return confirmedSegments.has(id) && isSegmentFilled(id);
  };

  const completedCount = [
    isSegmentTicked("identity"),
    isSegmentTicked("org"),
    isSegmentTicked("personal"),
    isSegmentTicked("education"),
    isSegmentTicked("modules"),
  ].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);

  const SEGMENTS: {
    id: SegmentId;
    icon: React.ComponentType<{ className?: string }>;
    titleKey: string;
    descKey: string;
    stepNumber: number;
  }[] = [
    {
      id: "identity",
      icon: UserCircle2,
      titleKey: "segmentIdentity",
      descKey: "segmentIdentityDesc",
      stepNumber: 1,
    },
    {
      id: "org",
      icon: Briefcase,
      titleKey: "segmentOrg",
      descKey: "segmentOrgDesc",
      stepNumber: 2,
    },
    {
      id: "personal",
      icon: HeartHandshake,
      titleKey: "segmentPersonal",
      descKey: "segmentPersonalDesc",
      stepNumber: 3,
    },
    {
      id: "education",
      icon: GraduationCap,
      titleKey: "segmentEducation",
      descKey: "segmentEducationDesc",
      stepNumber: 4,
    },
    {
      id: "modules",
      icon: KeyRound,
      titleKey: "segmentModules",
      descKey: "segmentModulesDesc",
      stepNumber: 5,
    },
  ];

  const handleResetForm = () => {
    setForm(INITIAL_FORM);
    setConfirmedSegments(new Set());
    setActiveSegment("identity");
    setOpenSegment("identity");
  };

  const handleNextStep = (currentId: SegmentId, nextId: SegmentId) => {
    if (!isSegmentFilled(currentId)) {
      toast.error(t("fillRequiredFields"));
      return;
    }
    setConfirmedSegments((prev) => new Set(prev).add(currentId));
    setActiveSegment(nextId);
    setOpenSegment(nextId);
  };

  const handleCreateUser = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSegmentFilled("identity")) {
      toast.error(t("fillRequiredFields"));
      setActiveSegment("identity");
      setOpenSegment("identity");
      return;
    }
    setConfirmedSegments((prev) => new Set(prev).add("education").add("modules"));

    const fullNameFa = `${form.firstNameFa.trim()} ${form.lastNameFa.trim()}`.trim();
    const fullNameEn = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    const finalDisplayName = (isRtl ? (fullNameFa || fullNameEn) : (fullNameEn || fullNameFa)) || form.name.trim();

    const createdUser: User = {
      id: `u_${Date.now()}`,
      name: finalDisplayName,
      firstNameFa: form.firstNameFa.trim(),
      lastNameFa: form.lastNameFa.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      nationalId: form.nationalId.trim(),
      department: form.department,
      company: isRtl ? detectedCompany.nameFa : detectedCompany.nameEn,
      companyId: detectedCompany.id,
      role: form.role,
      jobTitle: form.jobTitle.trim(),
      manager: form.manager.trim(),
      salary: Number(form.salary) || 10000,
      age: Number(form.age) || 25,
      maritalStatus: form.maritalStatus,
      childrenCount: Number(form.childrenCount) || 0,
      insuranceType: form.insuranceType,
      educationDegree: form.educationDegree,
      educationField: form.educationField.trim(),
      status: "offline",
      accountStatus: "active",
      avatar: "",
      avatarColor: "#0284c7",
      daysInCompany: 0,
      doneProjects: 0,
      workingFormat: {
        office: form.workMode === "office" ? 80 : 20,
        factory: form.workMode === "factory" ? 80 : 10,
        mission: form.workMode === "site" ? 80 : 10,
        leave: 0,
      },
      modulesAccess: form.modulesAccess && form.modulesAccess.length > 0
        ? form.modulesAccess
        : [
            { moduleId: "/projects", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
            { moduleId: "/dashboard/tasks", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" }
          ],
      recentActivities: [],
      checklists: [],
    };

    const newUsers = [createdUser, ...users];
    setUsers(newUsers);
    if (setSelectedUser) {
      setSelectedUser(createdUser);
    }
    toast.success(t("userAddedSuccess"));
    handleResetForm();
  };

  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const PrevArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-[1440px] mx-auto min-h-0 overflow-y-auto pr-1 pb-12 scrollbar-hide items-start">
      {/* ======================================================== */}
      {/* MAIN COLUMN: CREATE USER WIZARD (SEGMENT LIST + ACCORDION) */}
      {/* ======================================================== */}
      <div className="xl:col-span-7 flex flex-col gap-5">
        {/* Header Card */}
        <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-6 flex flex-col gap-5 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
                <UserPlus className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {t("addNewUserTitle")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("addNewUserDesc")}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="h-9 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground border-border/50 hover:bg-background/80 transition-colors gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("resetForm")}</span>
            </Button>
          </div>

          {/* =================================================== */}
          {/* SEGMENTED LIST / STEP TABS CONTROL */}
          {/* =================================================== */}
          <div className="bg-background/60 dark:bg-background/40 border border-border/40 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {SEGMENTS.map((seg) => {
              const isActive = activeSegment === seg.id;
              const isCompleted = isSegmentTicked(seg.id);
              const Icon = seg.icon;

              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => {
                    setActiveSegment(seg.id);
                    setOpenSegment(seg.id);
                  }}
                  className={cn(
                    "flex-1 min-w-[130px] flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCompleted
                      ? "text-emerald-600 dark:text-emerald-400 hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  )}
                >
                  <div
                    className={cn(
                      "size-5 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold fa-num transition-colors",
                      isCompleted
                        ? isActive
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-3 stroke-[2.5]" />
                    ) : (
                      seg.stepNumber
                    )}
                  </div>
                  <span className="truncate">{t(seg.titleKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================== */}
        {/* ACCORDION ITEMS CONTAINER */}
        {/* =================================================== */}
        <div className="flex flex-col gap-4">
          {SEGMENTS.map((seg, idx) => {
            const isOpen = openSegment === seg.id;
            const isCompleted = isSegmentTicked(seg.id);
            const Icon = seg.icon;

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
                  }}
                  className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none text-right rtl:text-right ltr:text-left transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs",
                        isOpen
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-foreground truncate">
                          {t(seg.titleKey)}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            {t("stepCompleted")}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                        {t(seg.descKey)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] text-muted-foreground font-medium fa-num hidden sm:inline">
                      {t("stepBadge", { step: seg.stepNumber, total: 4 })}
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
                        {/* ========================================= */}
                        {/* SEGMENT 1: IDENTITY & CONTACT */}
                        {/* ========================================= */}
                        {seg.id === "identity" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 1. Persian First Name */}
                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="firstNameFa"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                {t("firstNameFaLabel")}
                                <span className="text-rose-500">*</span>
                              </Label>
                              <div className="relative">
                                <UserCircle2
                                  size={18}
                                  className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="firstNameFa"
                                  value={form.firstNameFa}
                                  onChange={(e) => {
                                    const val = sanitizePersian(e.target.value);
                                    setForm((prev) => {
                                      const fa = `${val} ${prev.lastNameFa}`.trim();
                                      const en = `${prev.firstName} ${prev.lastName}`.trim();
                                      return {
                                        ...prev,
                                        firstNameFa: val,
                                        name: isRtl ? (fa || en) : (en || fa),
                                      };
                                    });
                                  }}
                                  placeholder={t("firstNameFaPlaceholder")}
                                  className="ps-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* 2. Persian Last Name */}
                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="lastNameFa"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                {t("lastNameFaLabel")}
                                <span className="text-rose-500">*</span>
                              </Label>
                              <div className="relative">
                                <UserCircle2
                                  size={18}
                                  className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="lastNameFa"
                                  value={form.lastNameFa}
                                  onChange={(e) => {
                                    const val = sanitizePersian(e.target.value);
                                    setForm((prev) => {
                                      const fa = `${prev.firstNameFa} ${val}`.trim();
                                      const en = `${prev.firstName} ${prev.lastName}`.trim();
                                      return {
                                        ...prev,
                                        lastNameFa: val,
                                        name: isRtl ? (fa || en) : (en || fa),
                                      };
                                    });
                                  }}
                                  placeholder={t("lastNameFaPlaceholder")}
                                  className="ps-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* 3. English First Name */}
                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="firstName"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                {t("firstNameEnLabel")}
                                <span className="text-rose-500">*</span>
                              </Label>
                              <div className="relative">
                                <UserCircle2
                                  size={18}
                                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="firstName"
                                  value={form.firstName}
                                  onChange={(e) => {
                                    const val = sanitizeEnglish(e.target.value);
                                    setForm((prev) => {
                                      const fa = `${prev.firstNameFa} ${prev.lastNameFa}`.trim();
                                      const en = `${val} ${prev.lastName}`.trim();
                                      return {
                                        ...prev,
                                        firstName: val,
                                        name: isRtl ? (fa || en) : (en || fa),
                                      };
                                    });
                                  }}
                                  placeholder={t("firstNameEnPlaceholder")}
                                  className="pl-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            {/* 4. English Last Name */}
                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="lastName"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                {t("lastNameEnLabel")}
                                <span className="text-rose-500">*</span>
                              </Label>
                              <div className="relative">
                                <UserCircle2
                                  size={18}
                                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="lastName"
                                  value={form.lastName}
                                  onChange={(e) => {
                                    const val = sanitizeEnglish(e.target.value);
                                    setForm((prev) => {
                                      const fa = `${prev.firstNameFa} ${prev.lastNameFa}`.trim();
                                      const en = `${prev.firstName} ${val}`.trim();
                                      return {
                                        ...prev,
                                        lastName: val,
                                        name: isRtl ? (fa || en) : (en || fa),
                                      };
                                    });
                                  }}
                                  placeholder={t("lastNameEnPlaceholder")}
                                  className="pl-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="email"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                {t("email")}
                                <span className="text-rose-500">*</span>
                              </Label>
                              <div className="relative">
                                <Mail
                                  size={18}
                                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="email"
                                  type="email"
                                  value={form.email}
                                  onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                  }
                                  placeholder="user@company.com"
                                  className="pl-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="phone"
                                className="text-xs font-semibold text-foreground"
                              >
                                {t("phone")}
                              </Label>
                              <div className="relative">
                                <Phone
                                  size={18}
                                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="phone"
                                  value={form.phone}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      phone: normalizeDigits(e.target.value),
                                    })
                                  }
                                  placeholder="0912..."
                                  className="pl-10 h-11 bg-background border-border/50 rounded-xl text-sm fa-num text-left"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="nationalId"
                                className="text-xs font-semibold text-foreground"
                              >
                                {t("nationalIdInputLabel")}
                              </Label>
                              <div className="relative">
                                <CreditCard
                                  size={18}
                                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="nationalId"
                                  value={form.nationalId}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      nationalId: normalizeDigits(
                                        e.target.value
                                      ),
                                    })
                                  }
                                  placeholder={t("nationalIdPlaceholder")}
                                  className="pl-10 h-11 bg-background border-border/50 rounded-xl text-sm fa-num text-left"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 2: ORGANIZATION & ROLE */}
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
                                <Input
                                  readOnly
                                  disabled
                                  value={isRtl ? detectedCompany.nameFa : detectedCompany.nameEn}
                                  className={cn(
                                    "ps-10 pe-10 h-11 border rounded-xl text-sm font-bold cursor-not-allowed select-none",
                                    detectedCompany.id === "npceram"
                                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                      : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                                  )}
                                />
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
                                value={form.department}
                                onChange={(val) =>
                                  setForm({ ...form, department: val })
                                }
                                placeholder={t("selectDepartment")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("role")}
                              </Label>
                              <Combobox
                                options={roleOptions}
                                value={form.role}
                                onChange={(val) =>
                                  setForm({
                                    ...form,
                                    role: val as "admin" | "user",
                                  })
                                }
                                placeholder={t("selectRole")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="jobTitle"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                <Briefcase className="size-3.5 text-primary" />
                                <span>{t("jobTitleLabel")}</span>
                              </Label>
                              <Combobox
                                options={jobTitleOptions}
                                value={form.jobTitle}
                                onChange={(val) =>
                                  setForm((prev) => ({ ...prev, jobTitle: val }))
                                }
                                placeholder={t("selectJobTitle")}
                                searchPlaceholder={
                                  isRtl
                                    ? "جستجو یا تایپ سمت جدید..."
                                    : "Search or type new title..."
                                }
                                emptyText={t("noResults")}
                                creatable={true}
                                showSearch={true}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="manager"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                <UserCircle2 className="size-3.5 text-primary" />
                                <span>{t("managerDirectLabel")}</span>
                              </Label>
                              <Combobox
                                options={managerOptions}
                                value={form.manager}
                                onChange={(val) =>
                                  setForm((prev) => ({ ...prev, manager: val }))
                                }
                                placeholder={t("selectManager")}
                                searchPlaceholder={
                                  isRtl
                                    ? "جستجوی مدیر یا تعریف سمت..."
                                    : "Search manager or type title..."
                                }
                                emptyText={t("noResults")}
                                creatable={true}
                                showSearch={true}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="salary"
                                className="text-xs font-semibold text-foreground"
                              >
                                {t("baseSalary")}
                              </Label>
                              <div className="relative">
                                <DollarSign
                                  size={18}
                                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                />
                                <Input
                                  id="salary"
                                  type="number"
                                  min={0}
                                  step={500}
                                  value={form.salary}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      salary: Number(e.target.value) || 0,
                                    })
                                  }
                                  placeholder={t("baseSalaryPlaceholder")}
                                  className="pl-10 h-11 bg-background border-border/50 rounded-xl text-sm fa-num text-left"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 3: PERSONAL & DEMOGRAPHICS */}
                        {/* ========================================= */}
                        {seg.id === "personal" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("userAge")}
                              </Label>
                              <Input
                                type="number"
                                min={18}
                                max={99}
                                value={form.age}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    age: parseInt(e.target.value) || 18,
                                  })
                                }
                                className="h-11 bg-background border-border/50 rounded-xl text-sm fa-num"
                                dir="ltr"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("maritalStatusLabel")}
                              </Label>
                              <Combobox
                                options={maritalOptions}
                                value={form.maritalStatus}
                                onChange={(val) =>
                                  setForm({
                                    ...form,
                                    maritalStatus: val as "single" | "married",
                                    childrenCount:
                                      val === "single" ? 0 : form.childrenCount,
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
                                    form.maritalStatus === "single" &&
                                      "opacity-50 pointer-events-none"
                                  )}
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setForm((prev) => ({
                                        ...prev,
                                        childrenCount: Math.max(
                                          0,
                                          prev.childrenCount - 1
                                        ),
                                      }))
                                    }
                                    disabled={
                                      form.maritalStatus === "single" ||
                                      form.childrenCount <= 0
                                    }
                                    className="size-8 rounded-lg text-foreground hover:bg-muted active:bg-muted flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                    aria-label="Decrease children count"
                                  >
                                    <Minus className="size-3.5 stroke-[2.5]" />
                                  </Button>
                                  <span className="min-w-10 px-2 text-center font-mono font-bold text-sm text-foreground fa-num select-none">
                                    {form.childrenCount}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setForm((prev) => ({
                                        ...prev,
                                        childrenCount: Math.min(
                                          20,
                                          prev.childrenCount + 1
                                        ),
                                      }))
                                    }
                                    disabled={
                                      form.maritalStatus === "single" ||
                                      form.childrenCount >= 20
                                    }
                                    className="size-8 rounded-lg text-foreground hover:bg-muted active:bg-muted flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                    aria-label="Increase children count"
                                  >
                                    <Plus className="size-3.5 stroke-[2.5]" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("insuranceTypeLabel")}
                              </Label>
                              <Combobox
                                options={insuranceOptions}
                                value={form.insuranceType}
                                onChange={(val) =>
                                  setForm({
                                    ...form,
                                    insuranceType: val as any,
                                  })
                                }
                                placeholder={t("selectInsurance")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 4: EDUCATION & WORK MODE */}
                        {/* ========================================= */}
                        {seg.id === "education" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("educationDegreeLabel")}
                              </Label>
                              <Combobox
                                options={degreeOptions}
                                value={form.educationDegree}
                                onChange={(val) =>
                                  setForm({ ...form, educationDegree: val })
                                }
                                placeholder={t("selectDegree")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="educationField"
                                className="text-xs font-semibold text-foreground"
                              >
                                {t("educationFieldLabel")}
                              </Label>
                              <Input
                                id="educationField"
                                value={form.educationField}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    educationField: e.target.value,
                                  })
                                }
                                placeholder={t("educationFieldLabel")}
                                className="h-11 bg-background border-border/50 rounded-xl text-sm"
                              />
                            </div>

                            <div className="flex flex-col gap-2 sm:col-span-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("workFormatLabel")}
                              </Label>
                              <Combobox
                                options={workModeOptions}
                                value={form.workMode}
                                onChange={(val) =>
                                  setForm({
                                    ...form,
                                    workMode: val as any,
                                  })
                                }
                                placeholder={t("workFormatLabel")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 5: MODULES ACCESS */}
                        {/* ========================================= */}
                        {seg.id === "modules" && (
                          <div className="pt-1">
                            <AdminModuleAccessStep
                              modulesAccess={form.modulesAccess}
                              onChange={(updated) =>
                                setForm((prev) => ({ ...prev, modulesAccess: updated }))
                              }
                              availableModules={availableModules}
                            />
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* ACCORDION BOTTOM ACTIONS */}
                        {/* ========================================= */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/30 mt-1">
                          <div>
                            {idx > 0 ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const prev = SEGMENTS[idx - 1].id;
                                  setActiveSegment(prev);
                                  setOpenSegment(prev);
                                }}
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
                                onClick={() => handleCreateUser()}
                                className="h-9 px-5 rounded-xl font-semibold text-xs gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                              >
                                <UserPlus className="size-4" />
                                <span>{t("submitAddUser")}</span>
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

      {/* ======================================================== */}
      {/* SIDE COLUMN: LIVE PERSONNEL PREVIEW & RECENT USERS */}
      {/* ======================================================== */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        {/* Live Personnel Card Preview */}
        <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-6 flex flex-col gap-5 relative overflow-hidden shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t("livePreview")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("livePreviewDesc")}
                </p>
              </div>
            </div>

            {/* Progress Pill */}
            <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-full border border-border/50 text-[11px] font-bold fa-num text-foreground shadow-2xs">
              <CheckCircle2
                className={cn(
                  "size-3.5",
                  progressPercent === 100
                    ? "text-emerald-500"
                    : "text-primary"
                )}
              />
              <span>{progressPercent}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Real-time Personnel Badge Card */}
          <div className="bg-background/80 dark:bg-background/60 border border-border/50 rounded-2xl p-5 shadow-xs flex flex-col gap-4 relative">
            {/* 1. Personnel Header Profile */}
            <div className="flex items-center gap-3.5">
              <Avatar className="size-14 rounded-full border border-border/60 shadow-xs shrink-0">
                <AvatarFallback className="text-white font-bold text-xl rounded-full" style={{ backgroundColor: "#0284c7" }}>
                  {previewDisplayName ? previewDisplayName.charAt(0) : "؟"}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-foreground text-base truncate">
                  {previewDisplayName || t("newEmployeeBadge")}
                </span>
                {previewSecondaryName && (
                  <span className="text-[11px] text-muted-foreground truncate" dir={isRtl ? "ltr" : "rtl"}>
                    {previewSecondaryName}
                  </span>
                )}
                <span className="text-xs text-muted-foreground truncate mt-0.5">
                  {form.jobTitle.trim() || t("unspecified")}
                </span>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shadow-2xs",
                      form.role === "admin"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    )}
                  >
                    {form.role === "admin" ? t("roleAdmin") : t("roleUser")}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border",
                      detectedCompany.id === "npceram"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                    )}
                  >
                    <Building2 className="size-2.5" />
                    <span>{isRtl ? detectedCompany.nameFa : detectedCompany.nameEn}</span>
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">
                    {t(`departments.${form.department}`)}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {t(`workFormat${form.workMode ? form.workMode.charAt(0).toUpperCase() + form.workMode.slice(1) : "Office"}`)}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-border/40" />

            {/* 2. Bilingual Name Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col bg-slate-100/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/30 min-w-0">
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  {t("persianName")}
                </span>
                <span className="text-xs font-bold text-foreground truncate mt-0.5" title={fullNameFa}>
                  {fullNameFa || "---"}
                </span>
              </div>
              <div className="flex flex-col bg-slate-100/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/30 min-w-0">
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  {t("englishName")}
                </span>
                <span className="text-xs font-bold text-foreground truncate mt-0.5" dir="ltr" title={fullNameEn}>
                  {fullNameEn || "---"}
                </span>
              </div>
            </div>

            {/* 3. Contact & Identity Items */}
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-border/20">
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <Mail className="size-3.5 shrink-0 text-primary" />
                  <span className="text-[11px] font-medium">{t("email")}</span>
                </div>
                <span className="font-semibold text-foreground truncate max-w-[190px] text-start" dir="ltr">
                  {form.email.trim() || "---"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-border/20">
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <Phone className="size-3.5 shrink-0 text-emerald-500" />
                  <span className="text-[11px] font-medium">{t("phone")}</span>
                </div>
                <span className="font-semibold text-foreground fa-num" dir="ltr">
                  {form.phone.trim() || "---"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-border/20">
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <CreditCard className="size-3.5 shrink-0 text-amber-500" />
                  <span className="text-[11px] font-medium">{t("nationalIdInputLabel")}</span>
                </div>
                <span className="font-semibold text-foreground fa-num font-mono text-xs" dir="ltr">
                  {form.nationalId.trim() || "---"}
                </span>
              </div>
            </div>

            {/* 4. Complete Detailed Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30 text-xs">
              {/* Base Monthly Salary */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[10px] truncate">{t("baseSalary")}</span>
                </div>
                <span className="text-xs font-bold text-foreground mt-0.5 fa-num">
                  {form.salary ? Number(form.salary).toLocaleString() : "0"} $
                </span>
              </div>

              {/* Work Format / Location */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="size-3 text-blue-500 shrink-0" />
                  <span className="text-[10px] truncate">{t("workFormatLabel")}</span>
                </div>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate">
                  {t(`workFormat${form.workMode ? form.workMode.charAt(0).toUpperCase() + form.workMode.slice(1) : "Office"}`)}
                </span>
              </div>

              {/* Age */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <span className="text-[10px] text-muted-foreground">
                  {t("userAge")}
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5 fa-num">
                  {form.age} {t("yearsOldUnit")}
                </span>
              </div>

              {/* Marital Status & Children */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <span className="text-[10px] text-muted-foreground">
                  {t("maritalStatusLabel")}
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate fa-num">
                  {t(`maritalStatusOptions.${form.maritalStatus}`)}
                  {form.maritalStatus === "married" && ` (${form.childrenCount} ${t("childCountUnit")})`}
                </span>
              </div>

              {/* Education Degree */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <GraduationCap className="size-3 text-indigo-500 shrink-0" />
                  <span className="text-[10px] truncate">{t("educationDegreeLabel")}</span>
                </div>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate">
                  {t(`degreesOptions.${form.educationDegree}`)}
                </span>
              </div>

              {/* Field of Study */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <span className="text-[10px] text-muted-foreground truncate">
                  {t("educationFieldLabel")}
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate" title={form.educationField}>
                  {form.educationField.trim() || t("unspecified")}
                </span>
              </div>

              {/* Insurance Type (full width) */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {t("insuranceTypeLabel")}
                  </span>
                  <span className="text-xs font-bold text-foreground truncate">
                    {t(`insuranceOptions.${form.insuranceType}`)}
                  </span>
                </div>
              </div>

              {/* Modules Access Summary (full width) */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25 col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <KeyRound className="size-3 text-primary shrink-0" />
                    <span className="text-[10px]">{t("segmentModules")}</span>
                  </div>
                  <span className="text-xs font-bold text-primary fa-num">
                    {t("grantedModulesPreview", {
                      count: (form.modulesAccess || []).filter((m) => m.hasAccess).length,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Instant Create Button */}
            <Button
              type="button"
              onClick={() => handleCreateUser()}
              className="w-full h-10 rounded-xl mt-1 font-semibold text-xs gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
            >
              <UserPlus className="size-4" />
              <span>{t("submitAddUser")}</span>
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RECENT USERS LIST CARD */}
        {/* ======================================================== */}
        <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-6 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t("recentCreatedUsers")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("recentCreatedUsersDesc")}
                </p>
              </div>
            </div>
            <span className="bg-muted text-muted-foreground text-[11px] font-bold px-2.5 py-0.5 rounded-full fa-num">
              {users.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1 scrollbar-thin">
            {users.slice(0, 5).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border/40 hover:border-primary/20 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-9 rounded-full border border-border/50 shrink-0">
                    <AvatarFallback className="text-white text-xs font-bold rounded-full" style={{ backgroundColor: u.avatarColor || "#0284c7" }}>
                      {u.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground leading-tight truncate">
                      {u.name}
                    </span>
                    <span
                      className="text-[11px] text-muted-foreground truncate"
                      dir="ltr"
                    >
                      {u.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rtl:mr-auto ltr:ml-auto shrink-0">
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase border shadow-2xs",
                      u.role === "admin"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    )}
                  >
                    {u.role === "admin" ? t("roleAdmin") : t("roleUser")}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg h-7 w-7 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    onClick={() => {
                      confirm({
                        title: t("deleteUserAccount"),
                        description: `${t("confirmDeleteUser")} ${u.name}`,
                        confirmText: t("deleteUserAccount"),
                        cancelText: t("cancel"),
                        variant: "destructive",
                        onConfirm: () => {
                          const newUsers = users.filter(
                            (usr) => usr.id !== u.id
                          );
                          setUsers(newUsers);
                          toast.success(t("userDeletedSuccess"));
                        },
                      });
                    }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground italic opacity-60">
                {t("noResults")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
