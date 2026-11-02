import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { User, UserModuleAccess, MonthlyBonusItem } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Star,
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
  Globe,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Clock,
  Banknote,
  Calendar,
  AlertCircle,
  XCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { api } from "@/services";
import {
  CompanyId,
  getCompanyFromEmail,
  isValidCorporateEmail,
  formatEmailWithDomain,
  AllowedCompanyDomain,
  extractEmailUsername,
  isHoldingExecutiveEmail,
  COMPANIES,
} from "../utils/company";
import { toAsciiDigits } from "../utils/date-formatter";
import { AdminModuleAccessStep } from "./AdminModuleAccessStep";
import {
  getDepartmentsForCompany,
  getJobTitlesForDepartment,
  getManagerialTitlesWithOccupants,
  SUPPLEMENTARY_INSURANCE_PROVIDERS,
  BASIC_INSURANCE_PROVIDERS,
} from "../data/organization-data";
import {
  getDegreeOptions,
  getStudyFieldOptions,
  getUniversityOptions,
} from "@/modules/profile/data/education-options";
import { SubordinateSelector } from "./SubordinateSelector";
import { DocumentUploadSection } from "@/modules/profile/components/document-upload-section";
import type { UserUploadedDocument, UserRole } from "@/types/auth";

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

type SegmentId = "identity" | "org" | "personal" | "education" | "skills" | "documents" | "modules" | "compensation";

interface FormState {
  // 1. Identity & Credentials
  firstNameFa: string;
  lastNameFa: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  nationalId: string;
  role: UserRole;
  companyId: CompanyId;

  // 2. Organization & Job
  department: string;
  jobTitle: string;
  manager: string;
  subordinates?: string[];
  employeeId?: string;
  joinDate?: string;
  contractType?: string;
  workMode: "office" | "factory" | "site" | "remote";

  // 3. Personal & Insurance
  age: number;
  birthDate?: string;
  maritalStatus: "single" | "married";
  childrenCount: number;
  insuranceType: "none" | "socialSecurity" | "complementary";
  insuranceCode?: string;
  supplementaryPlan?: "golden" | "silver" | "special" | "none";
  supplementaryProvider?: string;
  shebaNumber?: string;

  // 4. Education & Skills
  educationDegree: string;
  educationField: string;
  university?: string;
  graduationYear?: string;
  skills?: { id: string; name: string; level: number }[];

  // 5. Uploaded Documents
  documents?: UserUploadedDocument[];

  // 6. Modules Access
  modulesAccess: UserModuleAccess[];

  // 7. Compensation & Benefits
  salary: number;
  hasOvertime: boolean;
  maxOvertimeHours: number;
  monthlyBonusType: "cash" | "mission_days" | "none";
  monthlyBonusAmount: number;
  monthlyBonusTitle: string;
  monthlyBonuses: MonthlyBonusItem[];
}

export const generateRandomPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let pwd = "Esp@";
  for (let i = 0; i < 6; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

export const PRESET_SUGGESTED_SKILLS = [
  { fa: "پایپینگ و خطوط لوله", en: "Piping & Pipelines" },
  { fa: "کنترل پروژه و P6", en: "Project Control & P6" },
  { fa: "ابزار دقیق و اتوماسیون", en: "Instrumentation & Control" },
  { fa: "بازرسی فنی و NDT", en: "Technical Inspection & NDT" },
  { fa: "مهندسی فرآیند و شیمی", en: "Process & Chemical" },
  { fa: "طراحی سازه (Civil)", en: "Civil & Structural" },
  { fa: "اتوکد و سالیدورکس", en: "AutoCAD & SolidWorks" },
  { fa: "ایمنی و بهداشت (HSE)", en: "HSE Management" },
];

const INITIAL_FORM: FormState = {
  firstNameFa: "",
  lastNameFa: "",
  firstName: "",
  lastName: "",
  name: "",
  email: "",
  password: generateRandomPassword(),
  phone: "",
  nationalId: "",
  role: "user",
  companyId: "euroslot",

  department: "engineering",
  jobTitle: "",
  manager: "",
  subordinates: [],
  employeeId: "",
  joinDate: "",
  contractType: "full_time",
  workMode: "office",

  age: 28,
  birthDate: "",
  maritalStatus: "single",
  childrenCount: 0,
  insuranceType: "socialSecurity",
  insuranceCode: "",
  supplementaryPlan: "golden",
  supplementaryProvider: "SOS",
  shebaNumber: "",

  educationDegree: "bachelors",
  educationField: "",
  university: "",
  graduationYear: "",
  skills: [
    { id: "sk-1", name: "مهندسی متالورژی", level: 4 },
    { id: "sk-2", name: "کنترل کیفیت متریال", level: 4 },
  ],
  documents: [],

  modulesAccess: [
    { moduleId: "/dashboard/projects", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
    { moduleId: "/dashboard/tasks", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
  ],

  salary: 350000000,
  hasOvertime: true,
  maxOvertimeHours: 40,
  monthlyBonusType: "cash",
  monthlyBonusAmount: 25000000,
  monthlyBonusTitle: "پاداش حسن انجام کار و بهره‌وری",
  monthlyBonuses: [
    {
      id: "b-init-1",
      title: "پاداش حسن انجام کار و بهره‌وری",
      type: "cash",
      amount: 25000000,
    }
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

  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    password: generateRandomPassword(),
  }));
  const [activeSegment, setActiveSegment] = useState<SegmentId>("identity");
  const [openSegment, setOpenSegment] = useState<SegmentId | null>("identity");
  const [confirmedSegments, setConfirmedSegments] = useState<Set<SegmentId>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(4);

  const handleAddSkill = (name?: string, level?: number) => {
    const skillTitle = (name || newSkillName).trim();
    if (!skillTitle) return;
    const skillLvl = level ?? newSkillLevel;
    const exists = (form.skills || []).some(
      (s) => s.name.toLowerCase() === skillTitle.toLowerCase()
    );
    if (exists) {
      toast.warning(isRtl ? "این مهارت قبلاً اضافه شده است." : "This skill already exists.");
      return;
    }
    const newSkill = {
      id: `sk-${Date.now()}`,
      name: skillTitle,
      level: skillLvl,
    };
    setForm((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill],
    }));
    setNewSkillName("");
    toast.success(isRtl ? `مهارت «${skillTitle}» افزوده شد.` : `Added skill "${skillTitle}".`);
  };

  const handleRemoveSkill = (skillIdOrName: string) => {
    setForm((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter(
        (s) => s.id !== skillIdOrName && s.name !== skillIdOrName
      ),
    }));
    toast.info(isRtl ? "مهارت حذف شد." : "Skill removed.");
  };

  const handleUpdateSkillLevel = (skillIdOrName: string, level: number) => {
    setForm((prev) => ({
      ...prev,
      skills: (prev.skills || []).map((s) =>
        s.id === skillIdOrName || s.name === skillIdOrName ? { ...s, level } : s
      ),
    }));
  };

  const detectedCompany = form.companyId === "holding"
    ? COMPANIES.holding
    : form.companyId === "npceram"
    ? COMPANIES.npceram
    : COMPANIES.euroslot;

  const handleSelectCompany = (companyId: CompanyId) => {
    setForm((prev) => {
      const username = extractEmailUsername(prev.email);
      let targetDomain: AllowedCompanyDomain = "euroslotpars.com";
      if (companyId === "npceram") targetDomain = "npceram.com";
      else targetDomain = "euroslotpars.com";

      // If user had already entered a username, adapt email cleanly without losing the name
      const updatedEmail = username ? `${username}@${targetDomain}` : "";
      return {
        ...prev,
        companyId,
        email: updatedEmail,
      };
    });
    toast.info(
      isRtl
        ? companyId === "holding"
          ? "شرکت روی «هلدینگ و گروه (دسترسی مشترک)» تنظیم شد."
          : companyId === "npceram"
          ? "شرکت روی «نانو پالایش» تنظیم شد."
          : "شرکت روی «یورواسلات پارس» تنظیم شد."
        : `Company set to ${companyId === "holding" ? "Holding & Group" : companyId === "npceram" ? "NPCeram" : "Euroslot Pars"}`
    );
  };

  const handleAttachDomain = (domain: "euroslotpars.com" | "npceram.com") => {
    const rawUsername = extractEmailUsername(form.email) || "";
    const cleanUser = rawUsername.replace(/@.*$/, "").trim();
    const updatedEmail = cleanUser ? `${cleanUser}@${domain}` : `@${domain}`;
    const newCompanyId = domain === "npceram.com"
      ? (form.companyId === "holding" ? "holding" : "npceram")
      : (form.companyId === "holding" ? "holding" : "euroslot");
    setForm((prev) => ({
      ...prev,
      email: updatedEmail,
      companyId: newCompanyId,
    }));
  };

  const handleEmailChange = (val: string) => {
    const clean = val.trim();
    const lower = clean.toLowerCase();
    let newCompanyId = form.companyId;
    if (lower.includes("@npceram.com") && form.companyId !== "holding") {
      newCompanyId = "npceram";
    } else if (lower.includes("@euroslotpars.com") && form.companyId !== "holding") {
      newCompanyId = "euroslot";
    }
    setForm((prev) => ({ ...prev, email: clean, companyId: newCompanyId }));
  };

  const isEmailValid = React.useMemo(() => {
    if (!form.email.trim()) return false;
    const lower = form.email.trim().toLowerCase();
    const username = extractEmailUsername(lower);
    if (!username || username.length < 2) return false;
    if (form.companyId === "holding") {
      return lower.endsWith("@euroslotpars.com") || lower.endsWith("@npceram.com") || isValidCorporateEmail(lower);
    }
    if (form.companyId === "npceram") {
      return lower.endsWith("@npceram.com");
    }
    return lower.endsWith("@euroslotpars.com") || isValidCorporateEmail(lower);
  }, [form.email, form.companyId]);

  const isInvalidExternalDomain = Boolean(
    form.email.includes("@") &&
      !form.email.toLowerCase().endsWith("@euroslotpars.com") &&
      !form.email.toLowerCase().endsWith("@npceram.com") &&
      !isHoldingExecutiveEmail(form.email)
  );
  const isMissingDomain = Boolean(form.email.trim().length > 0 && !form.email.includes("@"));

  const fullNameFa = `${form.firstNameFa.trim()} ${form.lastNameFa.trim()}`.trim();
  const fullNameEn = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
  const previewDisplayName = (isRtl ? (fullNameFa || fullNameEn) : (fullNameEn || fullNameFa)) || form.name.trim();
  const previewSecondaryName = isRtl
    ? (fullNameFa && fullNameEn ? fullNameEn : "")
    : (fullNameEn && fullNameFa ? fullNameFa : "");

  // Company-scoped dynamic options
  const departmentOptions = React.useMemo(() => {
    return getDepartmentsForCompany(form.companyId || detectedCompany.id, isRtl);
  }, [form.companyId, detectedCompany.id, isRtl]);

  const jobTitleOptions = React.useMemo(() => {
    return getJobTitlesForDepartment(form.companyId || detectedCompany.id, form.department, isRtl);
  }, [form.companyId, detectedCompany.id, form.department, isRtl]);

  const managerOptions = React.useMemo(() => {
    return getManagerialTitlesWithOccupants(form.companyId || detectedCompany.id, users, isRtl);
  }, [form.companyId, detectedCompany.id, users, isRtl]);

  const studyFieldOptions = React.useMemo(() => {
    return getStudyFieldOptions(locale);
  }, [locale]);

  const universityOptions = React.useMemo(() => {
    return getUniversityOptions(locale);
  }, [locale]);

  // Synchronize department when email domain / company switches
  React.useEffect(() => {
    const isDeptValid = departmentOptions.some((d) => d.value === form.department);
    if (!isDeptValid && departmentOptions.length > 0) {
      setForm((prev) => ({ ...prev, department: departmentOptions[0].value }));
    }
  }, [departmentOptions, form.department]);

  const roleOptions: { value: UserRole; label: string; desc: string; badge: string; color: string }[] = React.useMemo(() => [
    {
      value: "admin",
      label: t("roleAdmin"),
      desc: t("roleAdminDesc"),
      badge: isRtl ? "دسترسی کامل" : "Full Access",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    {
      value: "manager",
      label: t("roleManager"),
      desc: t("roleManagerDesc"),
      badge: isRtl ? "مدیریت و نظارت" : "Management",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
    {
      value: "engineer",
      label: t("roleEngineer"),
      desc: t("roleEngineerDesc"),
      badge: isRtl ? "تخصصی مهندسی" : "Technical",
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    },
    {
      value: "staff",
      label: t("roleStaff"),
      desc: t("roleStaffDesc"),
      badge: isRtl ? "پرسنل سازمانی" : "Operations",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      value: "customer",
      label: t("roleCustomer"),
      desc: t("roleCustomerDesc"),
      badge: isRtl ? "پورتال کارفرما" : "Client Portal",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    {
      value: "user",
      label: t("roleUser"),
      desc: t("roleUserDesc"),
      badge: isRtl ? "کاربر پایه" : "Standard",
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
    },
  ], [t, isRtl]);

  const currentRoleMeta = roleOptions.find((r) => r.value === form.role) || roleOptions[5];

  const maritalOptions = [
    { value: "single", label: t("maritalStatusOptions.single") },
    { value: "married", label: t("maritalStatusOptions.married") },
  ];

  const insuranceOptions = [
    { value: "none", label: t("insuranceOptions.none") },
    { value: "socialSecurity", label: t("insuranceOptions.socialSecurity") },
    { value: "complementary", label: t("insuranceOptions.complementary") },
  ];

  const supplementaryPlanOptions = [
    { value: "golden", label: isRtl ? "طرح طلایی (کامل)" : "Golden Plan" },
    { value: "silver", label: isRtl ? "طرح نقره‌ای" : "Silver Plan" },
    { value: "special", label: isRtl ? "طرح ویژه" : "Special Plan" },
    { value: "none", label: isRtl ? "فاقد بیمه تکمیلی" : "None" },
  ];

  const degreeOptions = [
    { value: "diploma", label: t("degreesOptions.diploma") },
    { value: "associate", label: isRtl ? "کاردانی" : "Associate" },
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

  const contractTypeOptions = [
    { value: "full_time", label: isRtl ? "تمام وقت" : "Full Time" },
    { value: "part_time", label: isRtl ? "پاره وقت" : "Part Time" },
    { value: "contractual", label: isRtl ? "قراردادی / پروژه‌ای" : "Contractual" },
    { value: "hourly", label: isRtl ? "ساعتی" : "Hourly" },
    { value: "internship", label: isRtl ? "کارآموزی" : "Internship" },
  ];

  const formatNumberWithCommas = (val: number | string | undefined | null) => {
    if (val === undefined || val === null || val === "") return "";
    const str = typeof val === "string" ? val.replace(/,/g, "") : val.toString();
    const num = parseInt(str, 10);
    return isNaN(num) ? "" : num.toLocaleString();
  };

  // Segment filled checks
  const isSegmentFilled = (id: SegmentId): boolean => {
    switch (id) {
      case "identity": {
        const hasFa = Boolean(form.firstNameFa.trim().length > 0 || form.lastNameFa.trim().length > 0);
        const hasEn = Boolean(form.firstName.trim().length > 0 || form.lastName.trim().length > 0);
        const hasAnyName = Boolean(hasFa || hasEn || form.name.trim().length > 0);
        return Boolean(hasAnyName && isValidCorporateEmail(form.email));
      }
      case "org":
        return Boolean(form.department && form.role && form.jobTitle.trim().length > 0);
      case "personal":
        return Boolean(form.age >= 18 && form.maritalStatus && form.insuranceType);
      case "education":
        return Boolean(form.educationDegree && form.educationField.trim().length > 0);
      case "skills":
        return Boolean(form.skills && form.skills.length > 0);
      case "documents":
        return true;
      case "modules":
        return true;
      case "compensation":
        return Boolean(form.salary > 0);
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
    isSegmentTicked("skills"),
    isSegmentTicked("documents"),
    isSegmentTicked("modules"),
    isSegmentTicked("compensation"),
  ].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 8) * 100);

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
      id: "skills",
      icon: Star,
      titleKey: "segmentSkills",
      descKey: "segmentSkillsDesc",
      stepNumber: 5,
    },
    {
      id: "documents",
      icon: FileCheck,
      titleKey: "reqSegmentDocuments",
      descKey: "reqSegmentDocumentsDesc",
      stepNumber: 6,
    },
    {
      id: "modules",
      icon: KeyRound,
      titleKey: "segmentModules",
      descKey: "segmentModulesDesc",
      stepNumber: 7,
    },
    {
      id: "compensation",
      icon: Banknote,
      titleKey: "reqSegmentCompensation",
      descKey: "reqSegmentCompensationDesc",
      stepNumber: 8,
    },
  ];

  const handleResetForm = () => {
    setForm({ ...INITIAL_FORM, password: generateRandomPassword() });
    setConfirmedSegments(new Set());
    setActiveSegment("identity");
    setOpenSegment("identity");
  };

  const handleNextStep = (currentId: SegmentId, nextId: SegmentId) => {
    if (currentId === "identity") {
      if (!form.email.trim()) {
        toast.error(isRtl ? "لطفاً ایمیل سازمانی کاربر را وارد کنید." : "Please enter user's corporate email.");
        return;
      }
      if (!isValidCorporateEmail(form.email)) {
        toast.error(
          isRtl
            ? "ایمیل سازمانی باید منحصراً متعلق به شرکت یورواسلات پارس (euroslotpars.com@) یا نانو پالایش (npceram.com@) باشد."
            : "Corporate email must end with @euroslotpars.com or @npceram.com."
        );
        return;
      }
    }
    if (!isSegmentFilled(currentId)) {
      toast.error(t("fillRequiredFields"));
      return;
    }
    setConfirmedSegments((prev) => new Set(prev).add(currentId));
    setActiveSegment(nextId);
    setOpenSegment(nextId);
  };

  const handleCreateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.email.trim()) {
      toast.error(isRtl ? "لطفاً ایمیل سازمانی کاربر را وارد کنید." : "Please enter user's corporate email.");
      setActiveSegment("identity");
      setOpenSegment("identity");
      return;
    }
    if (!isValidCorporateEmail(form.email)) {
      toast.error(
        isRtl
          ? "ایمیل سازمانی باید منحصراً متعلق به شرکت یورواسلات پارس (euroslotpars.com@) یا نانو پالایش (npceram.com@) باشد."
          : "Corporate email must end with @euroslotpars.com or @npceram.com."
      );
      setActiveSegment("identity");
      setOpenSegment("identity");
      return;
    }
    if (!isSegmentFilled("identity")) {
      toast.error(t("fillRequiredFields"));
      setActiveSegment("identity");
      setOpenSegment("identity");
      return;
    }

    const effectivePassword = form.password?.trim() || generateRandomPassword();

    try {
      setIsSubmitting(true);
      setConfirmedSegments((prev) => 
        new Set(prev)
          .add("identity")
          .add("org")
          .add("personal")
          .add("education")
          .add("skills")
          .add("documents")
          .add("modules")
          .add("compensation")
      );

      const fullNameFa = `${form.firstNameFa.trim()} ${form.lastNameFa.trim()}`.trim();
      const fullNameEn = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const finalDisplayName = (isRtl ? (fullNameFa || fullNameEn) : (fullNameEn || fullNameFa)) || form.name.trim();

      const createdUserPayload: Partial<User> & { password?: string } = {
        name: finalDisplayName,
        firstNameFa: form.firstNameFa.trim(),
        lastNameFa: form.lastNameFa.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: effectivePassword,
        phone: form.phone.trim(),
        nationalId: form.nationalId.trim(),
        department: form.department,
        company: isRtl ? detectedCompany.nameFa : detectedCompany.nameEn,
        companyId: detectedCompany.id,
        role: form.role,
        jobTitle: form.jobTitle.trim(),
        manager: form.manager.trim(),
        subordinates: form.subordinates || [],
        employeeId: form.employeeId?.trim() || `ESP-${Math.floor(1000 + Math.random() * 9000)}`,
        joinDate: form.joinDate?.trim() || new Date().toISOString().split("T")[0],
        workLocation: form.workMode,
        contractType: form.contractType || "full_time",
        
        salary: Number(form.salary) || 350000000,
        hasOvertime: form.hasOvertime ?? true,
        maxOvertimeHours: form.hasOvertime ? (Number(form.maxOvertimeHours) || 40) : 0,
        monthlyBonusType: form.monthlyBonusType || "cash",
        monthlyBonusAmount: Number(form.monthlyBonusAmount) || 25000000,
        monthlyBonusTitle: form.monthlyBonusTitle?.trim() || (isRtl ? "پاداش حسن انجام کار و بهره‌وری" : "Performance Bonus"),
        monthlyBonuses: form.monthlyBonuses && form.monthlyBonuses.length > 0 ? form.monthlyBonuses : [
          {
            id: `b-${Date.now()}`,
            title: form.monthlyBonusTitle?.trim() || (isRtl ? "پاداش حسن انجام کار و بهره‌وری" : "Performance Bonus"),
            type: form.monthlyBonusType || "cash",
            amount: Number(form.monthlyBonusAmount) || 25000000,
          }
        ],

        age: Number(form.age) || 28,
        birthDate: form.birthDate?.trim() || "",
        maritalStatus: form.maritalStatus,
        childrenCount: Number(form.childrenCount) || 0,
        insuranceType: form.insuranceType,
        insuranceCode: form.insuranceCode?.trim() || "",
        supplementaryPlan: form.supplementaryPlan || "golden",
        supplementaryProvider: form.supplementaryProvider || "SOS",
        shebaNumber: form.shebaNumber?.trim() || "",

        educationDegree: form.educationDegree,
        educationField: form.educationField.trim(),
        university: form.university?.trim() || "",
        graduationYear: form.graduationYear?.trim() || "",
        skills: (form.skills || []).map((s: any) => ({ name: s.name, rate: s.rate ?? s.level ?? 5 })),
        documents: form.documents || [],

        status: "offline",
        accountStatus: "active",
        avatar: "",
        avatarColor: "#0284c7",
        daysInCompany: 1,
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
              { moduleId: "/dashboard/projects", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" },
              { moduleId: "/dashboard/tasks", hasAccess: true, accessLevel: "read", usagePercentage: 0, hoursSpent: "00:00:00" }
            ],
        isProfileCompleted: true,
        adminApproved: true,
        managerApproved: true,
        isEmailVerified: true,
        emailVerified: true,
      };

      const savedUser = await api.admin.createUser(createdUserPayload);

      // Bi-directional sync: update existing users who were assigned as subordinates to report to this user
      const updatedOtherUsers = users.map((u) => {
        if (form.subordinates?.includes(u.id)) {
          return { ...u, manager: savedUser.name || previewDisplayName };
        }
        return u;
      });

      const newUsers = [savedUser, ...updatedOtherUsers.filter(u => u.id !== savedUser.id && u.email !== savedUser.email)];
      setUsers(newUsers);
      if (setSelectedUser) {
        setSelectedUser(savedUser);
      }

      toast.success(
        isRtl
          ? `حساب کاربری «${savedUser.name}» با موفقیت ایجاد و در سیستم ثبت شد.`
          : `User "${savedUser.name}" successfully created and saved in the system.`
      );
      handleResetForm();
    } catch (err: any) {
      toast.error(err?.message || t("errorSaveProfileChanges"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const PrevArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto min-h-0 overflow-y-auto px-1 sm:px-2 pb-12 scrollbar-hide items-start">
      {/* ======================================================== */}
      {/* MAIN COLUMN: CREATE USER WIZARD (SEGMENT LIST + ACCORDION) */}
      {/* ======================================================== */}
      <div className="xl:col-span-8 flex flex-col gap-5">
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
          {/* SEGMENTED LIST / STEP TABS CONTROL (FLEXIBLE WRAP - NO SCROLL) */}
          {/* =================================================== */}
          <div className="bg-background/60 dark:bg-background/40 border border-border/40 rounded-2xl p-2 flex flex-wrap items-center gap-1.5">
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
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCompleted
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15"
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
                    <div className="flex flex-col min-w-0 flex-1">
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
                        {/* ========================================= */}
                        {/* SEGMENT 1: IDENTITY & CONTACT */}
                        {/* ========================================= */}
                        {seg.id === "identity" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 0. Top Account & Login Credentials Box */}
                            <div className="sm:col-span-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border border-primary/20 flex flex-col gap-3.5 shadow-2xs">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <KeyRound className="size-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-foreground">
                                      {t("accountCredentialsTitle")}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                      {t("accountCredentialsDesc")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 gap-1 font-semibold">
                                    <Sparkles className="size-3" />
                                    <span>{isRtl ? "رمز خودکار تولید شده" : "Auto-Generated"}</span>
                                  </Badge>
                                </div>
                              </div>

                              {/* Corporate Company Selector (Euroslot, NPCeram, Holding) */}
                              <div className="p-3 sm:p-3.5 rounded-2xl bg-background/80 border border-border/60 flex flex-col gap-3 shadow-2xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                      <Building2 className="size-4" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-foreground flex items-center gap-2">
                                        <span>{isRtl ? "انتخاب شرکت سازمانی کاربر:" : "Select Corporate Company:"}</span>
                                        <span
                                          className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                            form.companyId === "holding"
                                              ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                                              : form.companyId === "npceram"
                                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                              : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                                          )}
                                        >
                                          {isRtl ? detectedCompany.nameFa : detectedCompany.nameEn}
                                        </span>
                                      </span>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {isRtl
                                          ? "دپارتمان‌ها، سمت‌ها و دامنه مجاز ایمیل بر اساس شرکت انتخابی تنظیم می‌شوند."
                                          : "Departments, job titles, and allowed domains automatically adapt to the company."}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* 3-Button Company Selector Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {/* 1. Euroslot Pars */}
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCompany("euroslot")}
                                    className={cn(
                                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-2.5 group",
                                      form.companyId === "euroslot"
                                        ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30 shadow-xs"
                                        : "border-border/60 hover:border-border hover:bg-muted/40"
                                    )}
                                  >
                                    <div className={cn(
                                      "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                      form.companyId === "euroslot"
                                        ? "bg-sky-500 text-white"
                                        : "bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500/20"
                                    )}>
                                      <Building2 className="size-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-xs font-bold text-foreground flex items-center justify-between">
                                        <span>{isRtl ? "یورواسلات پارس" : "Euroslot Pars"}</span>
                                        {form.companyId === "euroslot" && (
                                          <span className="size-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px]">✓</span>
                                        )}
                                      </span>
                                      <span dir="ltr" className="text-[10px] font-mono text-muted-foreground text-start">
                                        @euroslotpars.com
                                      </span>
                                    </div>
                                  </button>

                                  {/* 2. NPCeram */}
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCompany("npceram")}
                                    className={cn(
                                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-2.5 group",
                                      form.companyId === "npceram"
                                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30 shadow-xs"
                                        : "border-border/60 hover:border-border hover:bg-muted/40"
                                    )}
                                  >
                                    <div className={cn(
                                      "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                      form.companyId === "npceram"
                                        ? "bg-amber-600 text-white"
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20"
                                    )}>
                                      <Sparkles className="size-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-xs font-bold text-foreground flex items-center justify-between">
                                        <span>{isRtl ? "نانو پالایش" : "NPCeram"}</span>
                                        {form.companyId === "npceram" && (
                                          <span className="size-3.5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px]">✓</span>
                                        )}
                                      </span>
                                      <span dir="ltr" className="text-[10px] font-mono text-muted-foreground text-start">
                                        @npceram.com
                                      </span>
                                    </div>
                                  </button>

                                  {/* 3. Holding & Group */}
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCompany("holding")}
                                    className={cn(
                                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-2.5 group",
                                      form.companyId === "holding"
                                        ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30 shadow-xs"
                                        : "border-border/60 hover:border-border hover:bg-muted/40"
                                    )}
                                  >
                                    <div className={cn(
                                      "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                      form.companyId === "holding"
                                        ? "bg-purple-600 text-white"
                                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20"
                                    )}>
                                      <Briefcase className="size-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-xs font-bold text-foreground flex items-center justify-between">
                                        <span>{isRtl ? "هلدینگ و گروه" : "Holding & Group"}</span>
                                        {form.companyId === "holding" && (
                                          <span className="size-3.5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px]">✓</span>
                                        )}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground truncate">
                                        {isRtl ? "دسترسی مشترک به ۲ شرکت" : "Shared group access"}
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {/* Email */}
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between min-h-6 h-6">
                                    <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                      <Mail className="size-3.5 text-primary" />
                                      <span>{t("email")}</span>
                                      <span className="text-rose-500">*</span>
                                    </Label>
                                    {/* Live Corporate Email Verification Badge */}
                                    {isEmailValid ? (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-2 py-0.5 border gap-1 font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                      >
                                        <ShieldCheck className="size-3" />
                                        <span>{isRtl ? "ایمیل سازمانی معتبر و تأیید شده" : "Verified Corporate Email"}</span>
                                      </Badge>
                                    ) : isInvalidExternalDomain ? (
                                      <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 font-semibold">
                                        <AlertCircle className="size-2.5" />
                                        <span>{isRtl ? "دامنه غیرمجاز سازمانی" : "Unauthorized Domain"}</span>
                                      </Badge>
                                    ) : form.email ? (
                                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold">
                                        <span>{isRtl ? "نیاز به دامنه رسمی" : "Complete domain"}</span>
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <div className="relative">
                                    <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                                    <Input
                                      id="email"
                                      type="email"
                                      value={form.email}
                                      onChange={(e) => handleEmailChange(e.target.value)}
                                      placeholder={
                                        form.companyId === "npceram"
                                          ? "username@npceram.com"
                                          : form.companyId === "holding"
                                          ? "username@euroslotpars.com"
                                          : "username@euroslotpars.com"
                                      }
                                      className={cn(
                                        "ps-9 pe-9 h-10 bg-background border rounded-xl text-xs font-medium transition-colors",
                                        isInvalidExternalDomain
                                          ? "border-rose-500/60 focus-visible:ring-rose-500/30"
                                          : isEmailValid
                                          ? "border-emerald-500/50 focus-visible:ring-emerald-500/20"
                                          : "border-border/50"
                                      )}
                                      dir="ltr"
                                    />
                                    {isEmailValid && (
                                      <CheckCircle2 className="size-4 absolute end-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                                    )}
                                    {isInvalidExternalDomain && (
                                      <AlertCircle className="size-4 absolute end-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none" />
                                    )}
                                  </div>

                                  {/* Quick 1-click domain pills below input */}
                                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                    <span className="text-[10px] text-muted-foreground">{isRtl ? "افزودن دامنه مجاز:" : "Quick domain:"}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleAttachDomain("euroslotpars.com")}
                                      className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-colors flex items-center gap-1",
                                        form.email.toLowerCase().endsWith("@euroslotpars.com")
                                          ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40"
                                          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/40"
                                      )}
                                      dir="ltr"
                                    >
                                      <span>+ @euroslotpars.com</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAttachDomain("npceram.com")}
                                      className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-colors flex items-center gap-1",
                                        form.email.toLowerCase().endsWith("@npceram.com")
                                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                                          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/40"
                                      )}
                                      dir="ltr"
                                    >
                                      <span>+ @npceram.com</span>
                                    </button>
                                  </div>

                                  {/* Inline alert for invalid external domain (e.g. @gmail.com) */}
                                  {isInvalidExternalDomain && (
                                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex flex-col gap-1.5 mt-0.5">
                                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                                        <AlertCircle className="size-3.5 shrink-0" />
                                        <span>
                                          {isRtl
                                            ? "دامنه ایمیل غیرمجاز است! ایمیل باید منحصراً euroslotpars.com@ یا npceram.com@ باشد."
                                            : "Unauthorized domain! Email must end with @euroslotpars.com or @npceram.com."}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Password with Auto-generation, Copy, Eye & Manual typing */}
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between min-h-6 h-6">
                                    <Label htmlFor="password" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                      <Lock className="size-3.5 text-primary" />
                                      <span>{t("passwordLabel")}</span>
                                      <span className="text-rose-500">*</span>
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const generated = generateRandomPassword();
                                        setForm((prev) => ({ ...prev, password: generated }));
                                        setShowPassword(true);
                                        toast.info(isRtl ? `رمز عبور جدید تولید شد: ${generated}` : `Generated password: ${generated}`);
                                      }}
                                      className="h-6 px-2 text-[10px] rounded-lg gap-1 text-primary hover:text-primary cursor-pointer border-primary/30 hover:bg-primary/5"
                                    >
                                      <RefreshCw className="size-2.5" />
                                      <span>{t("generatePasswordBtn")}</span>
                                    </Button>
                                  </div>
                                  <div className="relative">
                                    <KeyRound size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                                    <Input
                                      id="password"
                                      type={showPassword ? "text" : "password"}
                                      value={form.password || ""}
                                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                                      placeholder={t("passwordPlaceholder")}
                                      className="ps-9 pe-16 h-10 bg-background border-border/50 rounded-xl text-xs font-mono font-semibold"
                                      dir="ltr"
                                    />
                                    <div className="absolute end-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                      {form.password && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(form.password || "");
                                            toast.success(t("passwordCopied"));
                                          }}
                                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                          title={isRtl ? "کپی رمز" : "Copy password"}
                                        >
                                          <Copy className="size-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                        title={showPassword ? (isRtl ? "مخفی کردن" : "Hide") : (isRtl ? "نمایش" : "Show")}
                                      >
                                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

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
                            {/* Company Selector (Euroslot, NPCeram, Holding) */}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <Building2 className="size-3.5 text-primary" />
                                  <span>{t("company")}</span>
                                </Label>
                                <span className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                  form.companyId === "holding"
                                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                                    : form.companyId === "npceram"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                    : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                                )}>
                                  {isRtl ? detectedCompany.nameFa : detectedCompany.nameEn}
                                </span>
                              </div>
                              {/* 3-Button Company Selector Grid */}
                              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/40">
                                <button
                                  type="button"
                                  onClick={() => handleSelectCompany("euroslot")}
                                  className={cn(
                                    "px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                    form.companyId === "euroslot"
                                      ? "bg-sky-600 text-white shadow-xs"
                                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                                  )}
                                >
                                  <Building2 className="size-3.5 shrink-0" />
                                  <span className="truncate">{isRtl ? "یورواسلات" : "Euroslot"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectCompany("npceram")}
                                  className={cn(
                                    "px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                    form.companyId === "npceram"
                                      ? "bg-amber-600 text-white shadow-xs"
                                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                                  )}
                                >
                                  <Sparkles className="size-3.5 shrink-0" />
                                  <span className="truncate">{isRtl ? "نانوپالایش" : "NPCeram"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectCompany("holding")}
                                  className={cn(
                                    "px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                    form.companyId === "holding"
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                                  )}
                                >
                                  <Briefcase className="size-3.5 shrink-0" />
                                  <span className="truncate">{isRtl ? "هلدینگ" : "Holding"}</span>
                                </button>
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

                            {/* Role Selection & Dynamic RBAC Scope Card */}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <ShieldCheck className="size-3.5 text-primary" />
                                  <span>{t("role")}</span>
                                </Label>
                                <Badge variant="outline" className={cn("text-[10px] px-2 py-0 border font-semibold", currentRoleMeta.color)}>
                                  {currentRoleMeta.badge}
                                </Badge>
                              </div>
                              <Combobox
                                options={roleOptions}
                                value={form.role}
                                onChange={(val) =>
                                  setForm({
                                    ...form,
                                    role: val as UserRole,
                                  })
                                }
                                placeholder={t("selectRole")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />

                              {/* Dynamic Role Scope & Permission Card */}
                              <div className={cn(
                                "p-3 rounded-xl border transition-all mt-0.5",
                                form.role === "admin"
                                  ? "bg-rose-500/[0.04] border-rose-500/25"
                                  : form.role === "manager"
                                  ? "bg-purple-500/[0.04] border-purple-500/25"
                                  : form.role === "engineer"
                                  ? "bg-sky-500/[0.04] border-sky-500/25"
                                  : form.role === "staff"
                                  ? "bg-emerald-500/[0.04] border-emerald-500/25"
                                  : form.role === "customer"
                                  ? "bg-amber-500/[0.04] border-amber-500/25"
                                  : "bg-slate-500/[0.04] border-slate-500/20"
                              )}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "size-5 rounded-md flex items-center justify-center shrink-0 text-white text-[10px]",
                                      form.role === "admin"
                                        ? "bg-rose-500"
                                        : form.role === "manager"
                                        ? "bg-purple-500"
                                        : form.role === "engineer"
                                        ? "bg-sky-500"
                                        : form.role === "staff"
                                        ? "bg-emerald-500"
                                        : form.role === "customer"
                                        ? "bg-amber-500"
                                        : "bg-slate-500"
                                    )}>
                                      {form.role === "admin" ? <ShieldCheck className="size-3" /> :
                                       form.role === "manager" ? <Users className="size-3" /> :
                                       form.role === "engineer" ? <Briefcase className="size-3" /> :
                                       form.role === "staff" ? <Building2 className="size-3" /> :
                                       form.role === "customer" ? <UserCircle2 className="size-3" /> :
                                       <KeyRound className="size-3" />}
                                    </div>
                                    <span className="text-xs font-bold text-foreground">
                                      {currentRoleMeta.label}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  {currentRoleMeta.desc}
                                </p>
                              </div>
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
                                htmlFor="employeeId"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                <CreditCard className="size-3.5 text-primary" />
                                <span>{t("employeeIdLabel")}</span>
                              </Label>
                              <Input
                                id="employeeId"
                                value={form.employeeId || ""}
                                onChange={(e) =>
                                  setForm({ ...form, employeeId: e.target.value })
                                }
                                placeholder="ESP-4028"
                                className="h-11 bg-background border-border/50 rounded-xl text-sm font-mono"
                                dir="ltr"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="joinDate"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                <Calendar className="size-3.5 text-primary" />
                                <span>{t("joinDateLabel")}</span>
                              </Label>
                              <Input
                                id="joinDate"
                                value={form.joinDate || ""}
                                onChange={(e) =>
                                  setForm({ ...form, joinDate: isRtl ? normalizeDigits(e.target.value) : e.target.value })
                                }
                                placeholder={isRtl ? "۱۴۰۳/۰۱/۱۵" : "2024-04-01"}
                                className="h-11 bg-background border-border/50 rounded-xl text-sm fa-num"
                                dir="ltr"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Briefcase className="size-3.5 text-primary" />
                                <span>{t("contractTypeLabel")}</span>
                              </Label>
                              <Combobox
                                options={contractTypeOptions}
                                value={form.contractType || "full_time"}
                                onChange={(val) =>
                                  setForm({ ...form, contractType: val })
                                }
                                placeholder={t("contractTypeLabel")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Building2 className="size-3.5 text-primary" />
                                <span>{t("workFormatLabel")}</span>
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

                            {/* Direct Subordinates Multi-Selector */}
                            <div className="sm:col-span-2 pt-3 border-t border-border/40">
                              <SubordinateSelector
                                selectedIds={form.subordinates || []}
                                onChange={(newIds) =>
                                  setForm((prev) => ({ ...prev, subordinates: newIds }))
                                }
                                allUsers={users}
                                currentEmail={form.email}
                                isRtl={isRtl}
                              />
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

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="insuranceCode"
                                className="text-xs font-semibold text-foreground"
                              >
                                {t("insuranceCodeLabel")}
                              </Label>
                              <Input
                                id="insuranceCode"
                                value={form.insuranceCode || ""}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    insuranceCode: isRtl ? normalizeDigits(e.target.value) : e.target.value,
                                  })
                                }
                                placeholder="1098453210"
                                className="h-11 bg-background border-border/50 rounded-xl text-sm fa-num"
                                dir="ltr"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("supplementaryPlanLabel")}
                              </Label>
                              <Combobox
                                options={supplementaryPlanOptions}
                                value={form.supplementaryPlan || "none"}
                                onChange={(val) =>
                                  setForm({ ...form, supplementaryPlan: val as any })
                                }
                                placeholder={t("supplementaryPlanLabel")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground">
                                {t("supplementaryProviderLabel")}
                              </Label>
                              <Combobox
                                options={SUPPLEMENTARY_INSURANCE_PROVIDERS}
                                value={form.supplementaryProvider || "SOS"}
                                onChange={(val) =>
                                  setForm({ ...form, supplementaryProvider: val })
                                }
                                placeholder={t("supplementaryProviderLabel")}
                                emptyText={t("noResults")}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2 sm:col-span-2">
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor="shebaNumber"
                                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                                >
                                  <CreditCard className="size-3.5 text-primary" />
                                  <span>{t("shebaNumberLabel")}</span>
                                </Label>
                                <span className="text-[11px] text-muted-foreground">
                                  {t("shebaNumberDesc")}
                                </span>
                              </div>
                              <div className="relative">
                                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none select-none">
                                  IR
                                </span>
                                <Input
                                  id="shebaNumber"
                                  value={(form.shebaNumber || "").replace(/^IR/i, "")}
                                  onChange={(e) => {
                                    const raw = (isRtl ? normalizeDigits(e.target.value) : e.target.value).replace(/\D/g, "");
                                    setForm({ ...form, shebaNumber: `IR${raw}` });
                                  }}
                                  placeholder="000000000000000000000000"
                                  maxLength={24}
                                  className="ps-9 h-11 bg-background border-border/50 rounded-xl text-sm font-mono tracking-wider fa-num"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 4: EDUCATION & SKILLS */}
                        {/* ========================================= */}
                        {seg.id === "education" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <GraduationCap className="size-3.5 text-primary" />
                                <span>{t("educationDegreeLabel")}</span>
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
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                <Briefcase className="size-3.5 text-primary" />
                                <span>{t("educationFieldLabel")}</span>
                              </Label>
                              <Combobox
                                options={studyFieldOptions}
                                value={form.educationField}
                                onChange={(val) =>
                                  setForm({ ...form, educationField: val })
                                }
                                placeholder={t("educationFieldLabel")}
                                searchPlaceholder={isRtl ? "جستجو یا تایپ رشته..." : "Search or type major..."}
                                emptyText={t("noResults")}
                                creatable={true}
                                showSearch={true}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Building2 className="size-3.5 text-primary" />
                                <span>{t("universityLabel")}</span>
                              </Label>
                              <Combobox
                                options={universityOptions}
                                value={form.university || ""}
                                onChange={(val) =>
                                  setForm({ ...form, university: val })
                                }
                                placeholder={t("universityLabel")}
                                searchPlaceholder={t("universityPlaceholder")}
                                emptyText={t("noResults")}
                                creatable={true}
                                showSearch={true}
                                className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label
                                htmlFor="graduationYear"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                              >
                                <Calendar className="size-3.5 text-primary" />
                                <span>{isRtl ? "سال فارغ‌التحصیلی" : "Graduation Year"}</span>
                              </Label>
                              <Input
                                id="graduationYear"
                                value={form.graduationYear || ""}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    graduationYear: isRtl ? normalizeDigits(e.target.value) : e.target.value,
                                  })
                                }
                                placeholder={isRtl ? "۱۳۹۸" : "2020"}
                                className="h-11 bg-background border-border/50 rounded-xl text-sm fa-num"
                                dir="ltr"
                              />
                            </div>

                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 5: SKILLS & EXPERTISE */}
                        {/* ========================================= */}
                        {seg.id === "skills" && (
                          <div className="flex flex-col gap-5">
                            {/* Add New Skill Card */}
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  <Star className="size-4 text-amber-500 fill-amber-500" />
                                  <span>{t("addSkillBtn")}</span>
                                </Label>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <span>{t("skillLevelLabel")}:</span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((lvl) => (
                                      <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setNewSkillLevel(lvl)}
                                        className={cn(
                                          "p-0.5 rounded hover:scale-110 transition-transform cursor-pointer",
                                          lvl <= newSkillLevel ? "text-amber-500" : "text-muted-foreground/30 hover:text-amber-300"
                                        )}
                                        title={`${lvl} / 5`}
                                      >
                                        <Star className={cn("size-4", lvl <= newSkillLevel && "fill-amber-500")} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={newSkillName}
                                  onChange={(e) => setNewSkillName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddSkill();
                                    }
                                  }}
                                  placeholder={t("skillNamePlaceholder")}
                                  className="h-10 bg-background border-border/50 rounded-xl text-xs flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={() => handleAddSkill()}
                                  disabled={!newSkillName.trim()}
                                  className="h-10 px-4 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                                >
                                  <Plus className="size-4" />
                                  <span>{t("addSkillBtn")}</span>
                                </Button>
                              </div>

                              {/* Preset Suggestions */}
                              <div className="flex flex-col gap-1.5 pt-1">
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {t("suggestedSkills")}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {PRESET_SUGGESTED_SKILLS.map((sk, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleAddSkill(isRtl ? sk.fa : sk.en, 4)}
                                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-background/80 hover:bg-primary/10 hover:text-primary border border-border/40 hover:border-primary/30 transition-colors cursor-pointer text-muted-foreground flex items-center gap-1"
                                    >
                                      <Plus className="size-3 opacity-60" />
                                      <span>{isRtl ? sk.fa : sk.en}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Current Skills List */}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground">
                                  {t("skillsTitle")} ({(form.skills || []).length})
                                </Label>
                              </div>

                              {(!form.skills || form.skills.length === 0) ? (
                                <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 text-muted-foreground text-xs space-y-1">
                                  <Star className="size-7 mx-auto opacity-30 text-amber-500" />
                                  <p>{t("noSkillsYet")}</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {form.skills.map((sk) => (
                                    <div
                                      key={sk.id || sk.name}
                                      className="p-3 rounded-xl bg-background/80 border border-border/50 flex items-center justify-between gap-3 shadow-2xs hover:border-primary/30 transition-colors group"
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                          <Star className="size-3.5 fill-amber-500/30 text-amber-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-foreground truncate" title={sk.name}>
                                          {sk.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {/* 5-Star Interactive Rating */}
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((lvl) => (
                                            <button
                                              key={lvl}
                                              type="button"
                                              onClick={() => handleUpdateSkillLevel(sk.id || sk.name, lvl)}
                                              className={cn(
                                                "p-0.5 transition-transform hover:scale-110 cursor-pointer",
                                                lvl <= sk.level ? "text-amber-500" : "text-muted-foreground/30 hover:text-amber-400"
                                              )}
                                              title={`${lvl} / 5`}
                                            >
                                              <Star className={cn("size-3.5", lvl <= sk.level && "fill-amber-500")} />
                                            </button>
                                          ))}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSkill(sk.id || sk.name)}
                                          className="size-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center cursor-pointer"
                                          title={t("deleteSkill")}
                                        >
                                          <Trash2 className="size-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 6: DOCUMENTS UPLOAD */}
                        {/* ========================================= */}
                        {seg.id === "documents" && (
                          <div className="flex flex-col gap-5 pt-1">
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                <FileCheck className="size-4 text-primary" />
                                <span>{t("reqSegmentDocuments")}</span>
                              </h4>
                              <p className="text-[11px] text-muted-foreground">
                                {t("reqSegmentDocumentsDesc")}
                              </p>
                            </div>
                            <DocumentUploadSection
                              documents={form.documents || []}
                              onChange={(docs) => setForm((prev) => ({ ...prev, documents: docs }))}
                            />
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* SEGMENT 7: MODULES ACCESS */}
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
                        {/* SEGMENT 6: COMPENSATION & BENEFITS */}
                        {/* ========================================= */}
                        {seg.id === "compensation" && (
                          <div className="flex flex-col gap-4 pt-1">
                            {/* Top Header Card */}
                            <div className="bg-background/80 dark:bg-slate-900/50 border border-border/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                  <Banknote className="size-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-foreground">
                                    {t("compensationSectionTitle")}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {t("compensationSectionDesc")}
                                  </p>
                                </div>
                              </div>

                              {/* Quick Live Summary Badges */}
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <div className="bg-muted/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-xl border border-border/40 flex items-center gap-1.5 shrink-0">
                                  <span className="text-muted-foreground font-medium">{t("compensationSummarySalary")}</span>
                                  <span className="font-bold text-foreground fa-num">
                                    {formatNumberWithCommas(form.salary || 0)} {t("currencyRials")}
                                  </span>
                                </div>
                                <div className="bg-muted/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-xl border border-border/40 flex items-center gap-1.5 shrink-0">
                                  <span className="text-muted-foreground font-medium">{t("compensationSummaryOvertime")}</span>
                                  <span className={cn("font-bold fa-num", form.hasOvertime ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                                    {form.hasOvertime 
                                      ? (isRtl ? `${form.maxOvertimeHours || 0} ساعت مجاز` : `${form.maxOvertimeHours || 0}h Allowed`)
                                      : (isRtl ? "غیرمشمول" : "No")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 1. Base Salary Card */}
                            <div className="bg-background/70 dark:bg-slate-900/40 border border-border/40 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <CreditCard className="size-3.5 text-primary" />
                                  <span>{t("baseSalaryTitle")}</span>
                                </Label>
                                <span className="text-[11px] text-muted-foreground">
                                  {t("baseSalaryDesc")}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                                <div className="relative">
                                  <Banknote className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-primary pointer-events-none" />
                                  <Input
                                    type="text"
                                    value={formatNumberWithCommas(form.salary)}
                                    onChange={(e) => {
                                      const raw = toAsciiDigits(e.target.value.replace(/,/g, "").replace(/\D/g, ""));
                                      const num = raw ? parseInt(raw, 10) : 0;
                                      setForm({ ...form, salary: num });
                                    }}
                                    placeholder={t("salaryAmountPlaceholder")}
                                    className="ps-10 pe-16 h-11 bg-background border-border/50 rounded-xl text-sm font-bold fa-num"
                                    dir="ltr"
                                  />
                                  <div className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">
                                    {t("currencyRials")}
                                  </div>
                                </div>

                                {/* Quick Preset Buttons */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {[250000000, 350000000, 450000000, 550000000].map((preset) => (
                                    <Button
                                      key={preset}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setForm({ ...form, salary: preset })}
                                      className={cn(
                                        "h-8 px-2.5 text-[11px] rounded-lg cursor-pointer transition-all",
                                        form.salary === preset
                                          ? "bg-primary/10 text-primary border-primary/40 font-bold"
                                          : "text-muted-foreground hover:text-foreground"
                                      )}
                                    >
                                      <span className="fa-num">{(preset / 10000000).toLocaleString()} {isRtl ? "م تومان" : "M T"}</span>
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {form.salary && form.salary > 0 ? (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 fa-num">
                                  <span>≈</span>
                                  <span className="font-semibold text-foreground">
                                    {formatNumberWithCommas(Math.round(form.salary / 10))} {t("currencyTomans")}
                                  </span>
                                </p>
                              ) : null}
                            </div>

                            {/* 2. Overtime Allowance & Hours Limit Card */}
                            <div className="bg-background/70 dark:bg-slate-900/40 border border-border/40 rounded-2xl p-4 flex flex-col gap-4 shadow-2xs">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <Clock className="size-3.5 text-primary" />
                                  <span>{t("overtimeSectionTitle")}</span>
                                </Label>
                                <span className="text-[11px] text-muted-foreground">
                                  {t("overtimeSectionDesc")}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                {/* Overtime Eligibility Switch */}
                                <div className="flex flex-col gap-2">
                                  <span className="text-xs font-medium text-foreground">{t("hasOvertimeLabel")}</span>
                                  <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/40">
                                    <button
                                      type="button"
                                      onClick={() => setForm({ ...form, hasOvertime: true, maxOvertimeHours: form.maxOvertimeHours || 40 })}
                                      className={cn(
                                        "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                        form.hasOvertime
                                          ? "bg-emerald-600 text-white shadow-xs"
                                          : "text-muted-foreground hover:text-foreground"
                                      )}
                                    >
                                      <CheckCircle2 className="size-3.5" />
                                      <span>{t("overtimeEligible")}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setForm({ ...form, hasOvertime: false, maxOvertimeHours: 0 })}
                                      className={cn(
                                        "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                        !form.hasOvertime
                                          ? "bg-slate-700 text-white shadow-xs"
                                          : "text-muted-foreground hover:text-foreground"
                                      )}
                                    >
                                      <XCircle className="size-3.5" />
                                      <span>{t("overtimeNotEligible")}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Max Allowed Overtime Hours */}
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-foreground">{t("maxOvertimeHoursLabel")}</span>
                                    {form.hasOvertime && (
                                      <span className="text-[10px] text-primary font-bold fa-num">
                                        {form.maxOvertimeHours || 0} {t("hoursPerMonth")}
                                      </span>
                                    )}
                                  </div>

                                  {form.hasOvertime ? (
                                    <div className="flex flex-col gap-2">
                                      <div className="relative">
                                        <Clock className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                          type="number"
                                          min={0}
                                          max={200}
                                          value={form.maxOvertimeHours || ""}
                                          onChange={(e) => {
                                            const val = parseInt(toAsciiDigits(e.target.value), 10) || 0;
                                            setForm({ ...form, maxOvertimeHours: val });
                                          }}
                                          placeholder={t("maxOvertimeHoursPlaceholder")}
                                          className="ps-10 pe-24 h-10 bg-background border-border/50 rounded-xl text-xs font-semibold fa-num"
                                        />
                                        <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                          {t("hoursPerMonth")}
                                        </span>
                                      </div>

                                      {/* Quick Hour Preset Pills */}
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {[20, 40, 60, 80, 100].map((hrs) => (
                                          <button
                                            key={hrs}
                                            type="button"
                                            onClick={() => setForm({ ...form, maxOvertimeHours: hrs })}
                                            className={cn(
                                              "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer fa-num",
                                              form.maxOvertimeHours === hrs
                                                ? "bg-primary/10 border-primary/30 text-primary font-bold"
                                                : "border-border/40 text-muted-foreground hover:bg-muted/50"
                                            )}
                                          >
                                            {hrs} {isRtl ? "ساعت" : "hrs"}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-10 px-3 flex items-center bg-muted/30 border border-dashed border-border/50 rounded-xl text-xs text-muted-foreground">
                                      <AlertCircle className="size-3.5 me-2 text-muted-foreground shrink-0" />
                                      <span>{t("overtimeNotEligibleHint")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 3. Monthly Bonus / Incentive Card (Mission Days or Rial Amount with Title) */}
                            <div className="bg-background/70 dark:bg-slate-900/40 border border-border/40 rounded-2xl p-4 flex flex-col gap-4 shadow-2xs">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <Sparkles className="size-3.5 text-primary" />
                                    <span>{t("bonusSectionTitle")}</span>
                                  </Label>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {t("bonusSectionDesc")}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newId = `b-${Date.now()}`;
                                    const list = form.monthlyBonuses || [];
                                    const updatedList = [
                                      ...list,
                                      {
                                        id: newId,
                                        title: isRtl ? "پاداش بهره‌وری و پروژه‌ای" : "Productivity Bonus",
                                        type: "cash" as const,
                                        amount: 20000000,
                                      },
                                    ];
                                    setForm({
                                      ...form,
                                      monthlyBonuses: updatedList,
                                      monthlyBonusTitle: updatedList[0]?.title,
                                      monthlyBonusType: updatedList[0]?.type,
                                      monthlyBonusAmount: updatedList[0]?.amount,
                                    });
                                  }}
                                  className="h-8 px-2.5 text-xs rounded-xl gap-1 text-primary hover:text-primary cursor-pointer border-primary/20 hover:bg-primary/5"
                                >
                                  <Plus className="size-3.5" />
                                  <span>{t("addBonusBtn")}</span>
                                </Button>
                              </div>

                              {/* Bonus Items List */}
                              <div className="flex flex-col gap-3">
                                {((form.monthlyBonuses && form.monthlyBonuses.length > 0)
                                  ? form.monthlyBonuses
                                  : [
                                      {
                                        id: "b-default",
                                        title: form.monthlyBonusTitle || (isRtl ? "پاداش حسن انجام کار و بهره‌وری" : "Performance & Productivity Bonus"),
                                        type: form.monthlyBonusType === "mission_days" ? ("mission_days" as const) : ("cash" as const),
                                        amount: form.monthlyBonusAmount ?? 25000000,
                                      },
                                    ]
                                ).map((bonus, bIdx) => (
                                  <div
                                    key={bonus.id || bIdx}
                                    className="bg-card/90 dark:bg-slate-900/70 border border-border/50 rounded-xl p-3 sm:p-3.5 flex flex-col gap-3 transition-all hover:border-primary/30"
                                  >
                                    {/* Title & Delete Row */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 flex flex-col gap-1.5">
                                        <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                                          <span>{t("bonusTitleLabel")}</span>
                                          <span className="text-[10px] text-muted-foreground font-normal fa-num">
                                            (#{bIdx + 1})
                                          </span>
                                        </span>
                                        <Input
                                          type="text"
                                          value={bonus.title}
                                          onChange={(e) => {
                                            const list = [...(form.monthlyBonuses || [])];
                                            if (!list[bIdx]) list[bIdx] = { ...bonus };
                                            list[bIdx] = { ...list[bIdx], title: e.target.value };
                                            setForm({
                                              ...form,
                                              monthlyBonuses: list,
                                              monthlyBonusTitle: list[0]?.title,
                                              monthlyBonusType: list[0]?.type,
                                              monthlyBonusAmount: list[0]?.amount,
                                            });
                                          }}
                                          placeholder={t("bonusTitlePlaceholder")}
                                          className="h-9 bg-background text-xs rounded-xl"
                                        />
                                        {/* Preset Suggestions */}
                                        <div className="flex items-center gap-1 flex-wrap">
                                          {[
                                            t("presetBonusPerformance"),
                                            t("presetBonusProduction"),
                                            t("presetBonusSupervision"),
                                            t("presetBonusMission"),
                                          ].map((presetTitle) => (
                                            <button
                                              key={presetTitle}
                                              type="button"
                                              onClick={() => {
                                                const list = [...(form.monthlyBonuses || [])];
                                                if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                list[bIdx] = { ...list[bIdx], title: presetTitle };
                                                setForm({
                                                  ...form,
                                                  monthlyBonuses: list,
                                                  monthlyBonusTitle: list[0]?.title,
                                                });
                                              }}
                                              className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/30"
                                            >
                                              {presetTitle}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {(form.monthlyBonuses || []).length > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const list = (form.monthlyBonuses || []).filter((_, idx) => idx !== bIdx);
                                            setForm({
                                              ...form,
                                              monthlyBonuses: list,
                                              monthlyBonusTitle: list[0]?.title || "",
                                              monthlyBonusType: list[0]?.type || "cash",
                                              monthlyBonusAmount: list[0]?.amount || 0,
                                            });
                                          }}
                                          className="size-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer shrink-0 mt-1"
                                          title={t("deleteBonusBtn")}
                                        >
                                          <Trash2 className="size-4" />
                                        </Button>
                                      )}
                                    </div>

                                    {/* Type & Amount Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/30">
                                      {/* Type Selector (Cash vs Mission Days) */}
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-[11px] font-semibold text-foreground">{t("bonusTypeLabel")}</span>
                                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/40">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const list = [...(form.monthlyBonuses || [])];
                                              if (!list[bIdx]) list[bIdx] = { ...bonus };
                                              const defaultAmount = list[bIdx].type === "mission_days" ? 25000000 : list[bIdx].amount;
                                              list[bIdx] = { ...list[bIdx], type: "cash", amount: defaultAmount };
                                              setForm({
                                                ...form,
                                                monthlyBonuses: list,
                                                monthlyBonusType: list[0]?.type,
                                                monthlyBonusAmount: list[0]?.amount,
                                              });
                                            }}
                                            className={cn(
                                              "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                              bonus.type === "cash"
                                                ? "bg-background text-primary shadow-xs border border-primary/20 font-bold"
                                                : "text-muted-foreground hover:text-foreground"
                                            )}
                                          >
                                            <Banknote className="size-3.5 text-emerald-600 shrink-0" />
                                            <span>{t("bonusTypeCash")}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const list = [...(form.monthlyBonuses || [])];
                                              if (!list[bIdx]) list[bIdx] = { ...bonus };
                                              const defaultAmount = list[bIdx].type === "cash" ? 3 : list[bIdx].amount;
                                              list[bIdx] = { ...list[bIdx], type: "mission_days", amount: defaultAmount };
                                              setForm({
                                                ...form,
                                                monthlyBonuses: list,
                                                monthlyBonusType: list[0]?.type,
                                                monthlyBonusAmount: list[0]?.amount,
                                              });
                                            }}
                                            className={cn(
                                              "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                              bonus.type === "mission_days"
                                                ? "bg-background text-primary shadow-xs border border-primary/20 font-bold"
                                                : "text-muted-foreground hover:text-foreground"
                                            )}
                                          >
                                            <Calendar className="size-3.5 text-amber-500 shrink-0" />
                                            <span>{t("bonusTypeMission")}</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Amount / Days Input */}
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-[11px] font-semibold text-foreground">{t("bonusAmountLabel")}</span>
                                        {bonus.type === "cash" ? (
                                          <div className="relative">
                                            <Banknote className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                            <Input
                                              type="text"
                                              value={formatNumberWithCommas(bonus.amount || 0)}
                                              onChange={(e) => {
                                                const raw = toAsciiDigits(e.target.value.replace(/,/g, "").replace(/\D/g, ""));
                                                const num = raw ? parseInt(raw, 10) : 0;
                                                const list = [...(form.monthlyBonuses || [])];
                                                if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                list[bIdx] = { ...list[bIdx], amount: num };
                                                setForm({
                                                  ...form,
                                                  monthlyBonuses: list,
                                                  monthlyBonusAmount: list[0]?.amount,
                                                });
                                              }}
                                              className="ps-9 pe-14 h-9 bg-background border-border/50 rounded-xl text-xs font-semibold fa-num"
                                              dir="ltr"
                                            />
                                            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground pointer-events-none">
                                              {t("currencyRials")}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                              <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                              <Input
                                                type="number"
                                                min={0}
                                                max={31}
                                                value={bonus.amount ?? ""}
                                                onChange={(e) => {
                                                  const num = parseInt(toAsciiDigits(e.target.value), 10) || 0;
                                                  const list = [...(form.monthlyBonuses || [])];
                                                  if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                  list[bIdx] = { ...list[bIdx], amount: num };
                                                  setForm({
                                                    ...form,
                                                    monthlyBonuses: list,
                                                    monthlyBonusAmount: list[0]?.amount,
                                                  });
                                                }}
                                                className="ps-9 pe-20 h-9 bg-background border-border/50 rounded-xl text-xs font-semibold fa-num"
                                              />
                                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">
                                                {t("missionDaysUnit")}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <button
                                                type="button"
                                                disabled={(bonus.amount || 0) <= 0}
                                                onClick={() => {
                                                  const list = [...(form.monthlyBonuses || [])];
                                                  if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                  list[bIdx] = { ...list[bIdx], amount: Math.max(0, (list[bIdx].amount || 0) - 1) };
                                                  setForm({ ...form, monthlyBonuses: list, monthlyBonusAmount: list[0]?.amount });
                                                }}
                                                className="size-9 rounded-lg border border-border/40 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40"
                                              >
                                                <Minus className="size-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const list = [...(form.monthlyBonuses || [])];
                                                  if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                  list[bIdx] = { ...list[bIdx], amount: (list[bIdx].amount || 0) + 1 };
                                                  setForm({ ...form, monthlyBonuses: list, monthlyBonusAmount: list[0]?.amount });
                                                }}
                                                className="size-9 rounded-lg border border-border/40 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                                              >
                                                <Plus className="size-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
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
                                disabled={isSubmitting}
                                onClick={() => handleCreateUser()}
                                className="h-9 px-5 rounded-xl font-semibold text-xs gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              >
                                <CheckCircle2 className="size-4" />
                                <span>{isSubmitting ? (isRtl ? "در حال ثبت..." : "Saving...") : t("confirmAndCreateUser")}</span>
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
      <div className="xl:col-span-4 flex flex-col gap-6">
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
                <span className="font-bold text-foreground text-base sm:text-lg break-words leading-tight">
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
                    <span>{isRtl ? detectedCompany.nameFa : detectedCompany.nameEn}</span>
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">
                    {t.has(`departments.${form.department}`) ? t(`departments.${form.department}`) : form.department}
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
                  <Banknote className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[10px] truncate">{t("baseSalary")}</span>
                </div>
                <span className="text-xs font-bold text-foreground mt-0.5 fa-num">
                  {formatNumberWithCommas(form.salary || 0)} {t("currencyRials")}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 fa-num">
                  ≈ {formatNumberWithCommas(Math.floor((form.salary || 0) / 10))} {t("currencyTomans")}
                </span>
              </div>

              {/* Overtime & Hours */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-3 text-sky-500 shrink-0" />
                  <span className="text-[10px] truncate">{t("hasOvertimeLabel")}</span>
                </div>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate fa-num">
                  {form.hasOvertime ? `${form.maxOvertimeHours} ${t("hoursPerMonth")}` : t("overtimeNotEligible")}
                </span>
                {form.hasOvertime && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {t("overtimeEligible")}
                  </span>
                )}
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

              {/* Employee ID */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <span className="text-[10px] text-muted-foreground">
                  {t("employeeIdLabel")}
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate fa-num font-mono">
                  {form.employeeId || "---"}
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

              {/* Direct Manager (Superior) */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <UserCircle2 className="size-3 text-sky-500 shrink-0" />
                  <span className="text-[10px] truncate">{t("managerDirectLabel")}</span>
                </div>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate" title={form.manager}>
                  {form.manager.trim() || t("unspecified")}
                </span>
              </div>

              {/* Direct Subordinates Count */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="size-3 text-primary shrink-0" />
                  <span className="text-[10px] truncate">{t("subordinatesPreviewCount")}</span>
                </div>
                <span className="text-xs font-bold text-foreground mt-0.5 truncate fa-num">
                  {form.subordinates && form.subordinates.length > 0
                    ? `${form.subordinates.length} ${isRtl ? "نفر" : "reports"}`
                    : (isRtl ? "فاقد زیردست" : "None")}
                </span>
              </div>

              {/* Password Status & Credentials (full width) */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25 col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Lock className="size-3 text-amber-500 shrink-0" />
                    <span className="text-[10px]">{t("passwordLabel")}</span>
                  </div>
                  <span className={cn(
                    "text-xs font-bold",
                    form.password ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                  )}>
                    {form.password ? (isRtl ? "رمز تنظیم شد ✓" : "Password Set ✓") : (isRtl ? "رمز تعیین نشده" : "No Password")}
                  </span>
                </div>
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

              {/* Uploaded Documents (full width) */}
              <div className="flex flex-col bg-slate-100/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/25 col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileCheck className="size-3 text-purple-500 shrink-0" />
                    <span className="text-[10px]">{t("reqSegmentDocuments")}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground fa-num">
                    {form.documents && form.documents.length > 0
                      ? `${form.documents.length} ${isRtl ? "مدرک بارگذاری شده" : "docs uploaded"}`
                      : (isRtl ? "فاقد مدرک" : "No documents")}
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
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="size-9 rounded-full border border-border/50 shrink-0">
                    <AvatarFallback className="text-white text-xs font-bold rounded-full" style={{ backgroundColor: u.avatarColor || "#0284c7" }}>
                      {u.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-foreground leading-snug break-words">
                      {u.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase border shadow-2xs shrink-0",
                          u.role === "admin"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}
                      >
                        {u.role === "admin" ? t("roleAdmin") : t("roleUser")}
                      </span>
                      <span
                        className="text-[11px] text-muted-foreground font-mono truncate"
                        dir="ltr"
                      >
                        {u.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center shrink-0">

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
