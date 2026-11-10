"use client";
import type { UserRole } from "@/types/auth";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  FileText,
  FileCheck,
  CheckCheck,
  XCircle,
  ZoomIn,
  ZoomOut,
  Search,
  X,
  Clock,
  Send,
  UserCheck,
  ShieldCheck,
  UserX,
  UserCog,
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
  Banknote,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/services";
import { formatPersonName, formatRoleName } from "@/lib/person-names";
import { useConfirm } from "@/hooks/use-confirm";
import { PendingRequest, RequestStatus, User } from "../types/admin.types";
import {
  getCompanyFromEmail,
  isValidCorporateEmail,
  formatEmailWithDomain,
} from "../utils/company";
import {
  getDepartmentsForCompany,
  getJobTitlesForDepartment,
  getManagerialTitlesWithOccupants,
  SUPPLEMENTARY_INSURANCE_PROVIDERS,
  BASIC_INSURANCE_PROVIDERS,
} from "../data/organization-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getRoleRingClass } from "@/lib/role-avatar";
import { AdminModuleAccessStep } from "./AdminModuleAccessStep";
import {
  getDegreeOptions,
  getStudyFieldOptions,
  getUniversityOptions,
  resolveDegreeLabel,
  resolveStudyFieldLabel,
  resolveUniversityLabel,
} from "@/modules/profile/data/education-options";
import type { UserUploadedDocument } from "@/types/auth";
import { addUserNotification } from "@/modules/dashboard/services/dashboard.service";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { formatRequestSubmissionDate, formatDateFieldForLocale, toAsciiDigits } from "../utils/date-formatter";
import { getLocalizedDocumentTitle } from "@/modules/profile/utils/document-helpers";
import { PRESET_SUGGESTED_SKILLS } from "./AdminUserConfig";
import { SubordinateSelector } from "./SubordinateSelector";

interface AdminRequestsProps {
  requests: PendingRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>>;
  users?: User[];
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>;
  onRefresh?: () => Promise<void>;
  availableModules?: any[];
}

type ReqSegmentId = "personal" | "org" | "insurance" | "education" | "skills" | "documents" | "compensation";

const sanitizePersian = (text: string) => {
  return text.replace(/[^ \u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C]/g, "");
};

const sanitizeEnglish = (text: string) => {
  return text.replace(/[^ a-zA-Z'-]/g, "");
};

const normalizeDigits = (val: string) => {
  return val.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
};

const formatNumberWithCommas = (val: number | string | undefined | null) => {
  if (val === undefined || val === null || val === "") return "";
  const str = typeof val === "string" ? val.replace(/,/g, "") : val.toString();
  const num = parseInt(str, 10);
  return isNaN(num) ? "" : num.toLocaleString();
};

export function AdminRequests({
  requests,
  setRequests,
  users = [],
  setUsers,
  onRefresh,
  availableModules,
}: AdminRequestsProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { confirm } = useConfirm();
  const { user: currentUser } = useAuth();
  const operatorNameFa = formatPersonName(currentUser?.fullNameFa || currentUser?.fullName || currentUser?.name || "سعید جلیلی فرد", "fa");
  const operatorNameEn = formatPersonName(currentUser?.fullName || currentUser?.fullNameFa || currentUser?.name || "Saeed Jalilifard", "en");
  const operatorName = isRtl ? operatorNameFa : operatorNameEn;

  const operatorRoleLabelFa = currentUser?.role === "superadmin"
    ? "سوپر ادمین"
    : currentUser?.role === "dept_admin"
    ? "ادمین دپارتمان"
    : currentUser?.role === "office_admin"
    ? "ادمین اداری"
    : "ادمین سیستم";

  const operatorRoleLabelEn = currentUser?.role === "superadmin"
    ? "Super Admin"
    : currentUser?.role === "dept_admin"
    ? "Dept Admin"
    : currentUser?.role === "office_admin"
    ? "Office Admin"
    : "System Admin";

  const operatorRoleLabel = isRtl ? operatorRoleLabelFa : operatorRoleLabelEn;

  const getReqDisplayName = (r?: PendingRequest | null) => {
    if (!r) return "";
    const enName = (r.firstName || r.lastName)
      ? `${r.firstName || ''} ${r.lastName || ''}`.trim()
      : (r.fullName || r.name || r.email?.split('@')[0] || "");
    const faName = (r.firstNameFa || r.lastNameFa)
      ? `${r.firstNameFa || ''} ${r.lastNameFa || ''}`.trim()
      : (r.fullNameFa || r.name || enName);
    return formatPersonName(isRtl ? (faName || enName) : (enName || faName), locale);
  };

  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "rejected">("all");
  const [lightboxDoc, setLightboxDoc] = useState<{ src: string; title: string; fileName: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

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
  const [isManualFieldOfStudy, setIsManualFieldOfStudy] = useState(false);
  const [isManualUniversity, setIsManualUniversity] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Escape key listener for lightbox
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxDoc(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculation (Active Account removed per user requirement)
  const metrics = useMemo(() => {
    const validRequests = requests.filter((r) => r.isProfileCompleted !== false && (r.status as any) !== "pending_profile");
    const total = validRequests.length;
    const pending = validRequests.filter((r) => r.status === "pending" || r.status === "hr_approved").length;
    const active = validRequests.filter((r) => r.status === "active").length;
    const rejected = validRequests.filter((r) => r.status === "rejected").length;
    return { total, pending, active, rejected };
  }, [requests]);

  // Fast live filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (req.isProfileCompleted === false || (req.status as any) === "pending_profile") {
        return false;
      }
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [requests, statusFilter]);

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
          supplementaryProvider: found.supplementaryProvider || "SOS",
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
          salary: found.salary ?? 350000000,
          hasOvertime: found.hasOvertime ?? true,
          maxOvertimeHours: found.maxOvertimeHours ?? 40,
          monthlyBonusType: found.monthlyBonusType || "cash",
          monthlyBonusAmount: found.monthlyBonusAmount ?? 25000000,
          monthlyBonusTitle: found.monthlyBonusTitle || (isRtl ? "پاداش حسن انجام کار و بهره‌وری" : "Performance & Productivity Bonus"),
          monthlyBonuses: found.monthlyBonuses && found.monthlyBonuses.length > 0 ? found.monthlyBonuses : [
            {
              id: `b-${found.id}-1`,
              title: found.monthlyBonusTitle || (isRtl ? "پاداش حسن انجام کار و بهره‌وری" : "Performance & Productivity Bonus"),
              type: (found.monthlyBonusType as any) || "cash",
              amount: found.monthlyBonusAmount ?? 25000000,
            }
          ],
          documents: found.documents && found.documents.length > 0 ? found.documents : [
            {
              id: `doc-${found.id}-front`,
              category: "national_card_front",
              title: isRtl ? "تصویر روی کارت ملی" : "National ID Card (Front)",
              fileName: "national_id_front.jpg",
              fileSize: "1.4 MB",
              fileType: "image/jpeg",
              fileData: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'><rect width='600' height='380' rx='20' fill='%230284c7'/><text x='300' y='190' font-size='22' fill='white' text-anchor='middle' font-family='sans-serif'>${encodeURIComponent((found.name || "متقاضی") + " - کارت ملی")}</text></svg>`,
              uploadedAt: new Date().toISOString(),
              verified: found.adminApproved ?? false,
            },
            {
              id: `doc-${found.id}-back`,
              category: "national_card_back",
              title: isRtl ? "تصویر پشت کارت ملی" : "National ID Card (Back)",
              fileName: "national_id_back.jpg",
              fileSize: "1.2 MB",
              fileType: "image/jpeg",
              fileData: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'><rect width='600' height='380' rx='20' fill='%23059669'/><text x='300' y='190' font-size='22' fill='white' text-anchor='middle' font-family='sans-serif'>${encodeURIComponent((found.name || "متقاضی") + " - پشت کارت ملی")}</text></svg>`,
              uploadedAt: new Date().toISOString(),
              verified: found.adminApproved ?? false,
            },
            {
              id: `doc-${found.id}-degree`,
              category: "university_degree",
              title: isRtl ? "تصویر آخرین مدرک دانشگاهی" : "Latest University Degree",
              fileName: "degree_certificate.jpg",
              fileSize: "2.1 MB",
              fileType: "image/jpeg",
              fileData: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'><rect width='600' height='380' rx='20' fill='%237c3aed'/><text x='300' y='190' font-size='22' fill='white' text-anchor='middle' font-family='sans-serif'>${encodeURIComponent((found.name || "متقاضی") + " - دانشنامه")}</text></svg>`,
              uploadedAt: new Date().toISOString(),
              verified: found.adminApproved ?? false,
            },
          ],
        });
      }
    } else {
      setReviewData(null);
    }
  }, [selectedReqId, requests, isRtl]);

  // Dynamic company detection from applicant's email
  const detectedCompany = useMemo(() => {
    return getCompanyFromEmail(reviewData?.email || "");
  }, [reviewData?.email]);

  const departmentOptions = useMemo(() => {
    const list = getDepartmentsForCompany(detectedCompany.id, isRtl);
    if (reviewData?.department) {
      const trimmed = reviewData.department.trim();
      const match = list.find(
        (d) =>
          d.value.toLowerCase() === trimmed.toLowerCase() ||
          d.label.toLowerCase() === trimmed.toLowerCase()
      );
      if (!match && trimmed) {
        list.unshift({
          value: trimmed,
          label: trimmed,
        });
      }
    }
    return list;
  }, [detectedCompany.id, reviewData?.department, isRtl]);

  const jobTitleOptions = useMemo(() => {
    const list = getJobTitlesForDepartment(detectedCompany.id, reviewData?.department, isRtl);
    if (reviewData?.jobTitle) {
      const trimmed = reviewData.jobTitle.trim();
      const match = list.find(
        (t) =>
          t.value.toLowerCase() === trimmed.toLowerCase() ||
          t.label.toLowerCase() === trimmed.toLowerCase()
      );
      if (!match && trimmed) {
        list.unshift({
          value: trimmed,
          label: trimmed,
        });
      }
    }
    return list;
  }, [detectedCompany.id, reviewData?.department, reviewData?.jobTitle, isRtl]);

  const managerOptions = useMemo(() => {
    return getManagerialTitlesWithOccupants(detectedCompany.id, users, isRtl);
  }, [detectedCompany.id, users, isRtl]);

  // Synchronize department when email domain / company switches, without blindly overwriting valid departments
  useEffect(() => {
    if (reviewData?.department && departmentOptions.length > 0) {
      const trimmed = reviewData.department.trim();
      const matchedOpt = departmentOptions.find(
        (d) =>
          d.value.toLowerCase() === trimmed.toLowerCase() ||
          d.label.toLowerCase() === trimmed.toLowerCase()
      );
      if (matchedOpt && matchedOpt.value !== reviewData.department) {
        // Normalize to canonical ID (e.g. "Engineering" -> "engineering")
        setReviewData((prev) => (prev ? { ...prev, department: matchedOpt.value } : null));
      }
    }
  }, [departmentOptions, reviewData?.department]);

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
  }[] = [
    {
      id: "personal",
      icon: UserCircle2,
      titleKey: "reqSegmentPersonal",
      descKey: "reqSegmentPersonalDesc",
      stepNumber: 1,
    },
    {
      id: "org",
      icon: Briefcase,
      titleKey: "reqSegmentOrg",
      descKey: "reqSegmentOrgDesc",
      stepNumber: 2,
    },
    {
      id: "insurance",
      icon: ShieldCheck,
      titleKey: "reqSegmentInsurance",
      descKey: "reqSegmentInsuranceDesc",
      stepNumber: 3,
    },
    {
      id: "education",
      icon: GraduationCap,
      titleKey: "reqSegmentEducation",
      descKey: "reqSegmentEducationDesc",
      stepNumber: 4,
    },
    {
      id: "skills",
      icon: Star,
      titleKey: "reqSegmentSkills",
      descKey: "reqSegmentSkillsDesc",
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
      id: "compensation",
      icon: Banknote,
      titleKey: "reqSegmentCompensation",
      descKey: "reqSegmentCompensationDesc",
      stepNumber: 7,
    },
  ];

  // Document Verification Actions
  const handleToggleVerifyDocument = (docId: string) => {
    if (!reviewData) return;
    const currentDocs = reviewData.documents || [];
    const updatedDocs = currentDocs.map((doc) => {
      if (doc.id === docId) {
        const nextVerified = !doc.verified;
        toast.success(
          nextVerified
            ? (isRtl ? `مدرک «${doc.title}» تأیید شد.` : `Document "${doc.title}" verified.`)
            : (isRtl ? `تأیید مدرک «${doc.title}» لغو شد.` : `Verification for "${doc.title}" revoked.`)
        );
        return { ...doc, verified: nextVerified };
      }
      return doc;
    });
    setReviewData({
      ...reviewData,
      documents: updatedDocs,
    });
  };

  const handleVerifyAllDocuments = () => {
    if (!reviewData) return;
    const currentDocs = reviewData.documents || [];
    const updatedDocs = currentDocs.map((doc) => ({ ...doc, verified: true }));
    setReviewData({
      ...reviewData,
      documents: updatedDocs,
    });
    toast.success(isRtl ? "تمامی مدارک متقاضی با موفقیت تأیید شدند." : "All applicant documents were successfully verified.");
  };

  // Skills Management Handlers
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(4);

  const handleAddRequestSkill = (name?: string, level?: number) => {
    if (!reviewData) return;
    const skillTitle = (name || newSkillName).trim();
    if (!skillTitle) return;
    const skillLvl = level ?? newSkillLevel;
    const exists = (reviewData.skills || []).some(
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
    setReviewData({
      ...reviewData,
      skills: [...(reviewData.skills || []), newSkill],
    });
    setNewSkillName("");
    toast.success(isRtl ? `مهارت «${skillTitle}» افزوده شد.` : `Added skill "${skillTitle}".`);
  };

  const handleRemoveRequestSkill = (skillIdOrName: string) => {
    if (!reviewData) return;
    setReviewData({
      ...reviewData,
      skills: (reviewData.skills || []).filter(
        (s) => s.id !== skillIdOrName && s.name !== skillIdOrName
      ),
    });
    toast.info(isRtl ? "مهارت حذف شد." : "Skill removed.");
  };

  const handleUpdateRequestSkillLevel = (skillIdOrName: string, level: number) => {
    if (!reviewData) return;
    setReviewData({
      ...reviewData,
      skills: (reviewData.skills || []).map((s) =>
        s.id === skillIdOrName || s.name === skillIdOrName ? { ...s, level } : s
      ),
    });
  };

  // Actions
  const handleSaveProfileChanges = async () => {
    if (!reviewData) return;
    try {
      setIsSaving(true);
      const updated = await api.admin.updateRequest(reviewData.id, reviewData);
      setRequests((prev) =>
        prev.map((r) => (r.id === reviewData.id ? updated : r))
      );
      const reqNameFa = reviewData.firstNameFa || reviewData.lastNameFa ? `${reviewData.firstNameFa || ''} ${reviewData.lastNameFa || ''}`.trim() : (reviewData.fullNameFa || reviewData.name || reviewData.email.split('@')[0]);
      const reqNameEn = reviewData.firstName || reviewData.lastName ? `${reviewData.firstName || ''} ${reviewData.lastName || ''}`.trim() : (reviewData.fullName || reviewData.name || reviewData.email.split('@')[0]);

      addUserNotification({
        title: isRtl ? "به‌روزرسانی پرونده متقاضی" : "Applicant Dossier Updated",
        titleFa: "به‌روزرسانی پرونده متقاضی",
        titleEn: "Applicant Dossier Updated",
        description: isRtl
          ? `اطلاعات پرونده متقاضی (${reqNameFa}) در سامانه ذخیره شد.`
          : `Dossier changes for ${reqNameEn} were saved in the system.`,
        descriptionFa: `اطلاعات پرونده متقاضی (${reqNameFa}) در سامانه ذخیره شد.`,
        descriptionEn: `Dossier changes for ${reqNameEn} were saved in the system.`,
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

  // Final Step Action: Save and Advance Stage directly with Admin Approval
  const handleSaveAndAdvance = async () => {
    if (!reviewData) return;
    try {
      setIsSaving(true);
      setCompletedSteps((prev) => new Set(prev).add("education").add("skills").add("documents").add("compensation"));

      const reqCompany = getCompanyFromEmail(reviewData.email);
      const dataToSave: PendingRequest = {
        ...reviewData,
        company: isRtl ? reqCompany.nameFa : reqCompany.nameEn,
        companyId: reqCompany.id,
      };

      await api.admin.updateRequest(reviewData.id, dataToSave);

      if (reviewData.userId) {
        try {
          await api.admin.updateUser(reviewData.userId, dataToSave as any);
        } catch (uErr) {
          console.warn("Direct updateUser sync warning:", uErr);
        }
      }

      if (reviewData.status !== "active") {
        const res = await api.admin.approveManager(reviewData.id, {
          role: reviewData.role || "user",
          modulesAccess: dataToSave.modulesAccess,
          requestData: dataToSave,
        });
        
        // Remove from active queue immediately
        setRequests((prev) => prev.filter((r) => r.id !== reviewData.id));
        setSelectedReqId(null);
        setReviewData(null);

        // Update users list immediately
        const approvedUser: User = {
          ...(res?.user || {}),
          ...dataToSave,
          id: res?.user?.id || reviewData.userId || reviewData.id,
          role: reviewData.role || res?.user?.role || "user",
          status: (res?.user?.status === "online" ? "online" : "offline") as "online" | "offline",
          accountStatus: "active" as const,
          skills: res?.user?.skills || [],
          insuranceType: ((dataToSave.insuranceType as any) || res?.user?.insuranceType || "none") as any,
        };

        if (setUsers) {
          setUsers((prev) => {
            const targetId = approvedUser.id;
            const targetEmail = approvedUser.email?.toLowerCase();
            const existingIdx = prev.findIndex(
              (u) => (targetId && u.id === targetId) || (targetEmail && u.email?.toLowerCase() === targetEmail)
            );
            if (existingIdx !== -1) {
              const copy = [...prev];
              copy[existingIdx] = { ...copy[existingIdx], ...approvedUser };
              return copy;
            }
            return [approvedUser as any, ...prev];
          });
        }

        const advReqNameFa = reviewData.firstNameFa || reviewData.lastNameFa ? `${reviewData.firstNameFa || ''} ${reviewData.lastNameFa || ''}`.trim() : (reviewData.fullNameFa || reviewData.name || reviewData.email.split('@')[0]);
        const advReqNameEn = reviewData.firstName || reviewData.lastName ? `${reviewData.firstName || ''} ${reviewData.lastName || ''}`.trim() : (reviewData.fullName || reviewData.name || reviewData.email.split('@')[0]);

        addUserNotification({
          title: isRtl ? "تأیید و فعال‌سازی حساب توسط مدیر" : "Account Approved & Activated by Admin",
          titleFa: "تأیید و فعال‌سازی حساب توسط مدیر",
          titleEn: "Account Approved & Activated by Admin",
          description: isRtl
            ? `درخواست متقاضی (${advReqNameFa}) توسط ${operatorNameFa} (${operatorRoleLabelFa}) تأیید شد و از صف خارج گردید.`
            : `Application for ${advReqNameEn} was approved by ${operatorNameEn} (${operatorRoleLabelEn}) and removed from queue.`,
          descriptionFa: `درخواست متقاضی (${advReqNameFa}) توسط ${operatorNameFa} (${operatorRoleLabelFa}) تأیید شد و از صف خارج گردید.`,
          descriptionEn: `Application for ${advReqNameEn} was approved by ${operatorNameEn} (${operatorRoleLabelEn}) and removed from queue.`,
          type: "system",
          operatorName,
          operatorRole: operatorRoleLabel,
        });
        toast.success(t("adminApproveSuccess", { email: reviewData.email }));
      } else {
        toast.success(t("profileChangesSavedSuccess"));
      }

      if (onRefresh) await onRefresh();
    } catch {
      toast.error(t("errorAdvanceStage"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (requestId: string, reqName?: string) => {
    confirm({
      title: isRtl ? "حذف درخواست از صف" : "Delete Request from Queue",
      description: isRtl
        ? `آیا از حذف کامل درخواست «${reqName || requestId}» از صف و پایگاه داده اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`
        : `Are you sure you want to permanently delete the request for "${reqName || requestId}" from the queue? This action cannot be undone.`,
      confirmText: isRtl ? "حذف دائمی" : "Delete Permanently",
      cancelText: isRtl ? "انصراف" : "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          setActionLoadingId(requestId);
          await api.admin.deleteRequest(requestId);
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
          if (selectedReqId === requestId) {
            setSelectedReqId(null);
            setReviewData(null);
          }
          if (reviewData?.id === requestId) {
            setReviewData(null);
          }
          addUserNotification({
            title: isRtl ? "حذف درخواست از صف" : "Request Deleted from Queue",
            description: isRtl
              ? `درخواست متقاضی (${reqName || requestId}) به طور کامل توسط مدیر از صف حذف شد.`
              : `Application for ${reqName || requestId} was deleted from the queue by Admin.`,
            type: "system",
          });
          toast.success(
            isRtl
              ? `درخواست «${reqName || requestId}» با موفقیت از صف حذف شد.`
              : `Request for "${reqName || requestId}" was successfully deleted from queue.`
          );
          if (onRefresh) await onRefresh();
        } catch (err: any) {
          console.error("Failed to delete request:", err);
          toast.error(
            isRtl
              ? "خطا در حذف درخواست از سرور"
              : (err?.message || "Failed to delete request")
          );
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const handleApproveAdmin = async () => {
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

      if (reviewData.userId) {
        try {
          await api.admin.updateUser(reviewData.userId, dataToSave as any);
        } catch (uErr) {
          console.warn("Direct updateUser sync warning:", uErr);
        }
      }

      const res = await api.admin.approveManager(reviewData.id, {
        role: reviewData.role || "user",
        modulesAccess: dataToSave.modulesAccess,
        requestData: dataToSave,
      });

      // Remove from active queue immediately
      setRequests((prev) => prev.filter((r) => r.id !== reviewData.id));
      setSelectedReqId(null);
      setReviewData(null);

      // Update users list immediately
      const approvedUser: User = {
        ...(res?.user || {}),
        ...dataToSave,
        id: res?.user?.id || reviewData.userId || reviewData.id,
        role: reviewData.role || res?.user?.role || "user",
        status: (res?.user?.status === "online" ? "online" : "offline") as "online" | "offline",
        accountStatus: "active" as const,
        skills: res?.user?.skills || [],
        insuranceType: ((dataToSave.insuranceType as any) || res?.user?.insuranceType || "none") as any,
      };

      if (setUsers) {
        setUsers((prev) => {
          const targetId = approvedUser.id;
          const targetEmail = approvedUser.email?.toLowerCase();
          const existingIdx = prev.findIndex(
            (u) => (targetId && u.id === targetId) || (targetEmail && u.email?.toLowerCase() === targetEmail)
          );
          if (existingIdx !== -1) {
            const copy = [...prev];
            copy[existingIdx] = { ...copy[existingIdx], ...approvedUser };
            return copy;
          }
          return [approvedUser as any, ...prev];
        });
      }

      const appReqNameFa = reviewData.firstNameFa || reviewData.lastNameFa ? `${reviewData.firstNameFa || ''} ${reviewData.lastNameFa || ''}`.trim() : (reviewData.fullNameFa || reviewData.name || reviewData.email.split('@')[0]);
      const appReqNameEn = reviewData.firstName || reviewData.lastName ? `${reviewData.firstName || ''} ${reviewData.lastName || ''}`.trim() : (reviewData.fullName || reviewData.name || reviewData.email.split('@')[0]);

      addUserNotification({
        title: isRtl ? "تأیید و فعال‌سازی حساب توسط مدیر" : "Account Approved & Activated by Admin",
        titleFa: "تأیید و فعال‌سازی حساب توسط مدیر",
        titleEn: "Account Approved & Activated by Admin",
        description: isRtl
          ? `حساب کاربری متقاضی (${appReqNameFa}) با موفقیت توسط ${operatorNameFa} (${operatorRoleLabelFa}) تأیید شد و از صف خارج گردید.`
          : `Application for ${appReqNameEn} was approved by ${operatorNameEn} (${operatorRoleLabelEn}) and removed from active queue.`,
        descriptionFa: `حساب کاربری متقاضی (${appReqNameFa}) با موفقیت توسط ${operatorNameFa} (${operatorRoleLabelFa}) تأیید شد و از صف خارج گردید.`,
        descriptionEn: `Application for ${appReqNameEn} was approved by ${operatorNameEn} (${operatorRoleLabelEn}) and removed from active queue.`,
        type: "system",
        operatorName,
        operatorRole: operatorRoleLabel,
      });
      toast.success(t("adminApproveSuccess", { email: reviewData.email }));
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
      await api.admin.rejectRequest(
        reviewData.id,
        rejectReason
      );

      // Remove from active queue immediately
      setRequests((prev) => prev.filter((r) => r.id !== reviewData.id));
      setSelectedReqId(null);
      setReviewData(null);

      const rejReqNameFa = reviewData.firstNameFa || reviewData.lastNameFa ? `${reviewData.firstNameFa || ''} ${reviewData.lastNameFa || ''}`.trim() : (reviewData.fullNameFa || reviewData.name || reviewData.email.split('@')[0]);
      const rejReqNameEn = reviewData.firstName || reviewData.lastName ? `${reviewData.firstName || ''} ${reviewData.lastName || ''}`.trim() : (reviewData.fullName || reviewData.name || reviewData.email.split('@')[0]);

      addUserNotification({
        title: isRtl ? "عدم تایید درخواست متقاضی" : "Application Rejected",
        titleFa: "عدم تایید درخواست متقاضی",
        titleEn: "Application Rejected",
        description: isRtl
          ? `درخواست متقاضی (${rejReqNameFa}) توسط ${operatorNameFa} (${operatorRoleLabelFa}) رد و از صف خارج گردید. دلیل: ${rejectReason}`
          : `Application for ${rejReqNameEn} was rejected by ${operatorNameEn} (${operatorRoleLabelEn}). Reason: ${rejectReason}`,
        descriptionFa: `درخواست متقاضی (${rejReqNameFa}) توسط ${operatorNameFa} (${operatorRoleLabelFa}) رد و از صف خارج گردید. دلیل: ${rejectReason}`,
        descriptionEn: `Application for ${rejReqNameEn} was rejected by ${operatorNameEn} (${operatorRoleLabelEn}). Reason: ${rejectReason}`,
        type: "system",
        operatorName,
        operatorRole: operatorRoleLabel,
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
          ? `مشخصات ورود و رمز عبور موقت متقاضی (${reviewData.name}) توسط ${operatorName} (${operatorRoleLabel}) مجدداً ارسال گردید.`
          : `Temporary login credentials for ${reviewData.name} were resent by ${operatorName} (${operatorRoleLabel}).`,
        type: "system",
        operatorName,
        operatorRole: operatorRoleLabel,
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
    <div className="h-full overflow-y-auto custom-scrollbar p-2 sm:p-4 lg:p-6 w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto">
      {/* ─── 2-Column Responsive Workspace (Matches New User Config Layout) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* MAIN COLUMN: STAGES & APPROVAL PIPELINE (LEFT IN EN, RIGHT IN FA) */}
        {/* ======================================================== */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Header Card */}
          <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    <div className={cn("relative rounded-full flex items-center justify-center p-[2.5px] shrink-0", getRoleRingClass(reviewData.role))}>
                      <Avatar className="size-13 rounded-full border border-background shadow-xs">
                        <AvatarFallback 
                          className="text-white text-xl font-bold rounded-full"
                          style={{ backgroundColor: (reviewData as any).avatarColor || "#0284c7" }}
                        >
                          {reviewData.name ? reviewData.name.charAt(0) : "؟"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      {/* Name on its own line: full space, never cut off */}
                      <h3 className="font-extrabold text-base sm:text-xl text-foreground break-words leading-snug">
                        {getReqDisplayName(reviewData) || reviewData.email.split("@")[0]}
                      </h3>

                      {/* Tags brought DOWN below the name */}
                      <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-primary/10 text-primary border border-primary/20 shrink-0">
                          {reviewData.id}
                        </span>
                        {reviewData.requestType === "edit_profile" ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shrink-0 shadow-2xs">
                            <UserCog className="size-3" />
                            <span>{isRtl ? "درخواست ویرایش اطلاعات کاربر" : "User Edit Request"}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50 flex items-center gap-1 shrink-0">
                            <span>{isRtl ? "درخواست ثبت‌نام کاربر" : "New User Registration"}</span>
                          </span>
                        )}
                        {(() => {
                          const comp = getCompanyFromEmail(reviewData.email);
                          return (
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border shrink-0",
                                comp.id === "npceram"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                  : comp.id === "holding"
                                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                                  : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                              )}
                            >
                              <span>{isRtl ? comp.nameFa : comp.nameEn}</span>
                            </span>
                          );
                        })()}
                        <span
                          className="text-xs text-muted-foreground font-mono"
                          dir="ltr"
                        >
                          {reviewData.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {reviewData.status !== "active" ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApproveAdmin}
                        disabled={actionLoadingId === reviewData.id}
                        className="h-9 px-4 rounded-xl text-xs font-bold gap-2 cursor-pointer bg-primary hover:bg-primary/90 text-white shadow-xs"
                      >
                        {actionLoadingId === reviewData.id ? (
                          <RotateCw className="size-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="size-3.5" />
                        )}
                        <span>{t("approveAdminBtn")}</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>{t("statusActive")}</span>
                      </div>
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

                    {/* Delete from Queue Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRequest(reviewData.id, reviewData.name)}
                      disabled={actionLoadingId === reviewData.id}
                      className="h-9 px-3 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5 cursor-pointer border border-rose-200/50 dark:border-rose-900/50"
                      title={isRtl ? "حذف کامل درخواست از صف" : "Delete request from queue"}
                    >
                      <Trash2 className="size-3.5" />
                      <span>{isRtl ? "حذف از صف" : "Delete from Queue"}</span>
                    </Button>

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
                {/* SEGMENTED CONTROL / TABS (FLEXIBLE WRAP - NO SCROLL) */}
                {/* =================================================== */}
                <div className="bg-background/60 dark:bg-background/40 border border-border/40 rounded-2xl p-2 flex flex-wrap items-center gap-1.5">
                  {SEGMENTS.map((seg) => {
                    const isActive = activeSegment === seg.id;
                    const isCompleted = completedSteps.has(seg.id);

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
                          "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
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
                        <span className="truncate">{t(seg.titleKey)}</span>
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
                  const isFieldReadOnly = reviewData?.status === "rejected";

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
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("email")}
                                      </Label>
                                      {isValidCorporateEmail(reviewData.email) ? (
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "text-[10px] px-2 py-0 border gap-1 font-semibold",
                                            reviewData.email.toLowerCase().includes("npceram")
                                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                              : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
                                          )}
                                        >
                                          <CheckCircle2 className="size-2.5" />
                                          <span>{reviewData.email.toLowerCase().includes("npceram") ? "@npceram.com" : "@euroslotpars.com"}</span>
                                        </Badge>
                                      ) : reviewData.email ? (
                                        <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 font-semibold">
                                          <AlertCircle className="size-2.5" />
                                          <span>{isRtl ? "دامنه غیرمجاز" : "Unauthorized"}</span>
                                        </Badge>
                                      ) : null}
                                    </div>
                                    <div className="relative">
                                      <Mail
                                        size={18}
                                        className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                                      />
                                      <Input
                                        type="email"
                                        value={reviewData.email || ""}
                                        onChange={(e) =>
                                          setReviewData({
                                            ...reviewData,
                                            email: e.target.value.trim(),
                                          })
                                        }
                                        className="ps-10 h-11 bg-background border-border/50 rounded-xl text-sm"
                                        dir="ltr"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                                      <span className="text-[10px]">{isRtl ? "تغییر دامنه سازمانی:" : "Switch domain:"}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReviewData({
                                            ...reviewData,
                                            email: formatEmailWithDomain(reviewData.email, "euroslotpars.com"),
                                          })
                                        }
                                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 cursor-pointer transition-colors"
                                        dir="ltr"
                                      >
                                        @euroslotpars.com
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReviewData({
                                            ...reviewData,
                                            email: formatEmailWithDomain(reviewData.email, "npceram.com"),
                                          })
                                        }
                                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 cursor-pointer transition-colors"
                                        dir="ltr"
                                      >
                                        @npceram.com
                                      </button>
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
                                                : comp.id === "holding"
                                                ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
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
                                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                      <Briefcase className="size-3.5 text-primary" />
                                      <span>{t("jobTitleLabel")}</span>
                                    </Label>
                                    <Combobox
                                      options={jobTitleOptions}
                                      value={reviewData.jobTitle || ""}
                                      onChange={(val) =>
                                        setReviewData((prev) =>
                                          prev ? { ...prev, jobTitle: val } : null
                                        )
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
                                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                      <UserCircle2 className="size-3.5 text-primary" />
                                      <span>{t("managerDirectLabel")}</span>
                                    </Label>
                                    <Combobox
                                      options={managerOptions}
                                      value={reviewData.manager || ""}
                                      onChange={(val) =>
                                        setReviewData((prev) =>
                                          prev ? { ...prev, manager: val } : null
                                        )
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

                                  {/* Direct Subordinates Multi-Selector */}
                                  <div className="sm:col-span-2 pt-3 border-t border-border/40">
                                    <SubordinateSelector
                                      selectedIds={reviewData.subordinates || []}
                                      onChange={(newIds) =>
                                        setReviewData((prev) =>
                                          prev ? { ...prev, subordinates: newIds } : null
                                        )
                                      }
                                      allUsers={users}
                                      currentEmail={reviewData.email}
                                      isRtl={isRtl}
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
                                      <Combobox
                                        options={BASIC_INSURANCE_PROVIDERS}
                                        value={
                                          reviewData.insuranceProvider || "socialSecurity"
                                        }
                                        onChange={(val) =>
                                          setReviewData({
                                            ...reviewData,
                                            insuranceProvider: val,
                                          })
                                        }
                                        placeholder={t("insuranceProviderLabel")}
                                        searchPlaceholder={
                                          isRtl
                                            ? "جستجو یا ثبت بیمه‌گر پایه..."
                                            : "Search or type basic provider..."
                                        }
                                        emptyText={t("noResults")}
                                        creatable={true}
                                        showSearch={true}
                                        className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
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
                                        {t("supplementaryProviderLabel")}
                                      </Label>
                                      <Combobox
                                        options={SUPPLEMENTARY_INSURANCE_PROVIDERS}
                                        value={reviewData.supplementaryProvider || "SOS"}
                                        onChange={(val) =>
                                          setReviewData({
                                            ...reviewData,
                                            supplementaryProvider: val,
                                          })
                                        }
                                        placeholder={t("supplementaryProviderLabel")}
                                        searchPlaceholder={
                                          isRtl
                                            ? "جستجو یا ثبت بیمه‌گر تکمیلی..."
                                            : "Search or type provider..."
                                        }
                                        emptyText={t("noResults")}
                                        creatable={true}
                                        showSearch={true}
                                        className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
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
                                    {/* Degree Level Combobox */}
                                    <div className="flex flex-col gap-2">
                                      <Label className="text-xs font-semibold text-foreground">
                                        {t("degreeLevelLabel")}
                                      </Label>
                                      <Combobox
                                        options={getDegreeOptions(locale)}
                                        value={
                                          reviewData.educationDegree === "bachelors"
                                            ? "bachelor"
                                            : reviewData.educationDegree || "bachelor"
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

                                    {/* Field of Study Combobox with Search & Manual Toggle */}
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <Label className="text-xs font-semibold text-foreground">
                                          {t("studyFieldLabel")}
                                        </Label>
                                        <button
                                          type="button"
                                          onClick={() => setIsManualFieldOfStudy(!isManualFieldOfStudy)}
                                          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                                        >
                                          {isManualFieldOfStudy
                                            ? (isRtl ? "انتخاب از لیست" : "Select from list")
                                            : (isRtl ? "سایر / ورود دستی" : "Other / Manual entry")}
                                        </button>
                                      </div>
                                      {isManualFieldOfStudy ? (
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
                                          autoFocus
                                        />
                                      ) : (
                                        <Combobox
                                          options={getStudyFieldOptions(
                                            locale,
                                            isRtl ? "سایر / ورود دستی رشته..." : "Other / Manual entry..."
                                          )}
                                          value={reviewData.educationField || ""}
                                          onChange={(val) => {
                                            if (val === "__manual__" || val === "other") {
                                              setIsManualFieldOfStudy(true);
                                            } else {
                                              setReviewData({
                                                ...reviewData,
                                                educationField: val,
                                              });
                                            }
                                          }}
                                          placeholder={t("studyFieldPlaceholder")}
                                          showSearch={true}
                                          emptyText={t("noResults")}
                                          className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                        />
                                      )}
                                    </div>

                                    {/* University Combobox with Search & Manual Toggle */}
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <Label className="text-xs font-semibold text-foreground">
                                          {t("universityLabel")}
                                        </Label>
                                        <button
                                          type="button"
                                          onClick={() => setIsManualUniversity(!isManualUniversity)}
                                          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                                        >
                                          {isManualUniversity
                                            ? (isRtl ? "انتخاب از لیست" : "Select from list")
                                            : (isRtl ? "سایر / ورود دستی" : "Other / Manual entry")}
                                        </button>
                                      </div>
                                      {isManualUniversity ? (
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
                                          autoFocus
                                        />
                                      ) : (
                                        <Combobox
                                          options={getUniversityOptions(
                                            locale,
                                            isRtl ? "سایر / ورود دستی نام دانشگاه..." : "Other / Manual entry..."
                                          )}
                                          value={reviewData.university || ""}
                                          onChange={(val) => {
                                            if (val === "__manual__" || val === "other") {
                                              setIsManualUniversity(true);
                                            } else {
                                              setReviewData({
                                                ...reviewData,
                                                university: val,
                                              });
                                            }
                                          }}
                                          placeholder={t("universityPlaceholder")}
                                          showSearch={true}
                                          emptyText={t("noResults")}
                                          className="w-full h-11 bg-background border-border/50 rounded-xl rtl:text-right text-xs"
                                        />
                                      )}
                                    </div>

                                    {/* Graduation Year */}
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
                                            handleAddRequestSkill();
                                          }
                                        }}
                                        placeholder={t("skillNamePlaceholder")}
                                        className="h-10 bg-background border-border/50 rounded-xl text-xs flex-1"
                                      />
                                      <Button
                                        type="button"
                                        onClick={() => handleAddRequestSkill()}
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
                                            onClick={() => handleAddRequestSkill(isRtl ? sk.fa : sk.en, 4)}
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
                                        {t("skillsTitle")} ({(reviewData.skills || []).length})
                                      </Label>
                                    </div>

                                    {(!reviewData.skills || reviewData.skills.length === 0) ? (
                                      <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 text-muted-foreground text-xs space-y-1">
                                        <Star className="size-7 mx-auto opacity-30 text-amber-500" />
                                        <p>{t("noSkillsYet")}</p>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {reviewData.skills.map((sk) => (
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
                                                    onClick={() => handleUpdateRequestSkillLevel(sk.id || sk.name, lvl)}
                                                    className={cn(
                                                      "p-0.5 transition-transform hover:scale-110 cursor-pointer",
                                                      lvl <= (sk.level ?? (sk as any).rate ?? 4)
                                                        ? "text-amber-500"
                                                        : "text-muted-foreground/30 hover:text-amber-400"
                                                    )}
                                                    title={`${lvl} / 5`}
                                                  >
                                                    <Star
                                                      className={cn(
                                                        "size-3.5",
                                                        lvl <= (sk.level ?? (sk as any).rate ?? 4) && "fill-amber-500"
                                                      )}
                                                    />
                                                  </button>
                                                ))}
                                              </div>

                                              {/* Delete Button */}
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveRequestSkill(sk.id || sk.name)}
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
                              {/* SEGMENT 5: UPLOADED DOCUMENTS & VERIFICATION */}
                              {/* ========================================= */}
                              {seg.id === "documents" && (
                                <div className="flex flex-col gap-5">
                                  {/* Header bar: summary and batch actions */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-muted/20 border border-border/50">
                                    <div className="flex items-center gap-3">
                                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <FileCheck className="size-5" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-foreground">
                                          {t("uploadedDocsTitle")}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          {t("reqSegmentDocumentsDesc")}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                      {/* Verified count badge */}
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs font-semibold px-3 py-1 gap-1.5",
                                          (reviewData.documents || []).length > 0 &&
                                            (reviewData.documents || []).every((d) => d.verified)
                                            ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                                            : "border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400",
                                          isRtl && "fa-num"
                                        )}
                                      >
                                        <CheckCircle2 className="size-3.5" />
                                        <span>
                                          {t("docsVerifiedCount", {
                                            verified: (reviewData.documents || []).filter((d) => d.verified).length,
                                            total: (reviewData.documents || []).length,
                                          })}
                                        </span>
                                      </Badge>

                                      {/* Verify All Documents button */}
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleVerifyAllDocuments}
                                        disabled={
                                          (reviewData.documents || []).length === 0 ||
                                          (reviewData.documents || []).every((d) => d.verified)
                                        }
                                        className="h-8 px-3 rounded-xl text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                                      >
                                        <CheckCheck className="size-3.5" />
                                        <span>{t("verifyAllDocs")}</span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Documents List (زیر هم و ساده) */}
                                  {(!reviewData.documents || reviewData.documents.length === 0) ? (
                                    <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 text-muted-foreground text-xs space-y-2">
                                      <FileText className="size-8 mx-auto opacity-40" />
                                      <p>{t("noDocUploaded")}</p>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-2.5">
                                      {reviewData.documents.map((doc) => {
                                        const isDocVerified = !!doc.verified;
                                        const imageSrc = doc.fileData || doc.fileUrl || "";

                                        return (
                                          <div
                                            key={doc.id}
                                            className={cn(
                                              "rounded-xl border p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all",
                                              "bg-card/70 hover:bg-card border-border/60 shadow-2xs hover:shadow-xs",
                                              isDocVerified && "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                                            )}
                                          >
                                            {/* Thumbnail + Title + Meta */}
                                            <div className="flex items-center gap-3 min-w-0">
                                              {/* Clickable Small Thumbnail */}
                                              <div
                                                onClick={() => {
                                                  if (imageSrc) {
                                                    setLightboxDoc({
                                                      src: imageSrc,
                                                      title: getLocalizedDocumentTitle(doc, locale),
                                                      fileName: doc.fileName,
                                                    });
                                                    setZoom(1);
                                                    setRotation(0);
                                                  }
                                                }}
                                                className="relative size-12 sm:size-14 rounded-lg overflow-hidden bg-muted/50 border border-border/50 shrink-0 flex items-center justify-center cursor-pointer group select-none"
                                                title={t("viewDocumentFull")}
                                              >
                                                {imageSrc ? (
                                                  <>
                                                    <img
                                                      src={imageSrc}
                                                      alt={getLocalizedDocumentTitle(doc, locale)}
                                                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                      <Eye className="size-4" />
                                                    </div>
                                                  </>
                                                ) : (
                                                  <FileText className="size-6 text-muted-foreground" />
                                                )}
                                              </div>

                                              {/* Title & File Meta */}
                                              <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                                    {getLocalizedDocumentTitle(doc, locale)}
                                                  </span>
                                                  {/* Status Badge */}
                                                  {isDocVerified ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px] shrink-0 font-medium px-2 py-0.5">
                                                      <CheckCircle2 className="size-3" />
                                                      <span>{t("docStatusVerified")}</span>
                                                    </Badge>
                                                  ) : (
                                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[10px] shrink-0 font-medium px-2 py-0.5">
                                                      <Clock className="size-3" />
                                                      <span>{t("docStatusPending")}</span>
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                                                  <span className="truncate max-w-[200px] font-mono text-[11px]" dir="ltr">
                                                    {doc.fileName}
                                                  </span>
                                                  <span>•</span>
                                                  <span className={cn("font-medium", isRtl && "fa-num")}>
                                                    {doc.fileSize}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Action Buttons: Preview & Verify Toggle */}
                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  if (imageSrc) {
                                                    setLightboxDoc({
                                                      src: imageSrc,
                                                      title: getLocalizedDocumentTitle(doc, locale),
                                                      fileName: doc.fileName,
                                                    });
                                                    setZoom(1);
                                                    setRotation(0);
                                                  }
                                                }}
                                                className="h-8 px-2.5 rounded-lg text-xs gap-1.5 border-border/60 hover:bg-muted cursor-pointer"
                                              >
                                                <Eye className="size-3.5 text-muted-foreground" />
                                                <span>{isRtl ? "مشاهده" : "View"}</span>
                                              </Button>

                                              <Button
                                                type="button"
                                                variant={isDocVerified ? "outline" : "default"}
                                                size="sm"
                                                onClick={() => handleToggleVerifyDocument(doc.id)}
                                                className={cn(
                                                  "h-8 px-3 rounded-lg text-xs gap-1.5 cursor-pointer font-medium transition-all",
                                                  isDocVerified
                                                    ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30"
                                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                                )}
                                              >
                                                {isDocVerified ? (
                                                  <>
                                                    <XCircle className="size-3.5" />
                                                    <span>{t("unverifyDocBtn")}</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Check className="size-3.5" />
                                                    <span>{t("verifyDocBtn")}</span>
                                                  </>
                                                )}
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}



                              {/* ========================================= */}
                              {/* SEGMENT 7: COMPENSATION & BENEFITS */}
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
                                          {formatNumberWithCommas(reviewData.salary || 0)} {t("currencyRials")}
                                        </span>
                                      </div>
                                      <div className="bg-muted/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-xl border border-border/40 flex items-center gap-1.5 shrink-0">
                                        <span className="text-muted-foreground font-medium">{t("compensationSummaryOvertime")}</span>
                                        <span className={cn("font-bold fa-num", reviewData.hasOvertime ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                                          {reviewData.hasOvertime 
                                            ? (isRtl ? `${reviewData.maxOvertimeHours || 0} ساعت مجاز` : `${reviewData.maxOvertimeHours || 0}h Allowed`)
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
                                          disabled={isFieldReadOnly}
                                          value={formatNumberWithCommas(reviewData.salary)}
                                          onChange={(e) => {
                                            const raw = toAsciiDigits(e.target.value.replace(/,/g, "").replace(/\D/g, ""));
                                            const num = raw ? parseInt(raw, 10) : 0;
                                            setReviewData({ ...reviewData, salary: num });
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
                                            disabled={isFieldReadOnly}
                                            onClick={() => setReviewData({ ...reviewData, salary: preset })}
                                            className={cn(
                                              "h-8 px-2.5 text-[11px] rounded-lg cursor-pointer transition-all",
                                              reviewData.salary === preset
                                                ? "bg-primary/10 text-primary border-primary/40 font-bold"
                                                : "text-muted-foreground hover:text-foreground"
                                            )}
                                          >
                                            <span className="fa-num">{(preset / 10000000).toLocaleString()} {isRtl ? "م تومان" : "M T"}</span>
                                          </Button>
                                        ))}
                                      </div>
                                    </div>

                                    {reviewData.salary && reviewData.salary > 0 ? (
                                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 fa-num">
                                        <span>≈</span>
                                        <span className="font-semibold text-foreground">
                                          {formatNumberWithCommas(Math.round(reviewData.salary / 10))} {t("currencyTomans")}
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
                                            disabled={isFieldReadOnly}
                                            onClick={() => setReviewData({ ...reviewData, hasOvertime: true, maxOvertimeHours: reviewData.maxOvertimeHours || 40 })}
                                            className={cn(
                                              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                              reviewData.hasOvertime
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "text-muted-foreground hover:text-foreground"
                                            )}
                                          >
                                            <CheckCircle2 className="size-3.5" />
                                            <span>{t("overtimeEligible")}</span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={isFieldReadOnly}
                                            onClick={() => setReviewData({ ...reviewData, hasOvertime: false, maxOvertimeHours: 0 })}
                                            className={cn(
                                              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                              !reviewData.hasOvertime
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
                                          {reviewData.hasOvertime && (
                                            <span className="text-[10px] text-primary font-bold fa-num">
                                              {reviewData.maxOvertimeHours || 0} {t("hoursPerMonth")}
                                            </span>
                                          )}
                                        </div>

                                        {reviewData.hasOvertime ? (
                                          <div className="flex flex-col gap-2">
                                            <div className="relative">
                                              <Clock className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                              <Input
                                                type="number"
                                                min={0}
                                                max={200}
                                                disabled={isFieldReadOnly}
                                                value={reviewData.maxOvertimeHours || ""}
                                                onChange={(e) => {
                                                  const val = parseInt(toAsciiDigits(e.target.value), 10) || 0;
                                                  setReviewData({ ...reviewData, maxOvertimeHours: val });
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
                                                  disabled={isFieldReadOnly}
                                                  onClick={() => setReviewData({ ...reviewData, maxOvertimeHours: hrs })}
                                                  className={cn(
                                                    "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer fa-num",
                                                    reviewData.maxOvertimeHours === hrs
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
                                        disabled={isFieldReadOnly}
                                        onClick={() => {
                                          const newId = `b-${Date.now()}`;
                                          const list = reviewData.monthlyBonuses || [];
                                          const updatedList = [
                                            ...list,
                                            {
                                              id: newId,
                                              title: isRtl ? "پاداش بهره‌وری و پروژه‌ای" : "Productivity Bonus",
                                              type: "cash" as const,
                                              amount: 20000000,
                                            },
                                          ];
                                          setReviewData({
                                            ...reviewData,
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
                                      {((reviewData.monthlyBonuses && reviewData.monthlyBonuses.length > 0)
                                        ? reviewData.monthlyBonuses
                                        : [
                                            {
                                              id: "b-default",
                                              title: reviewData.monthlyBonusTitle || (isRtl ? "پاداش حسن انجام کار و بهره‌وری" : "Performance & Productivity Bonus"),
                                              type: reviewData.monthlyBonusType === "mission_days" ? ("mission_days" as const) : ("cash" as const),
                                              amount: reviewData.monthlyBonusAmount ?? 25000000,
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
                                                disabled={isFieldReadOnly}
                                                value={bonus.title}
                                                onChange={(e) => {
                                                  const list = [...(reviewData.monthlyBonuses || [])];
                                                  if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                  list[bIdx] = { ...list[bIdx], title: e.target.value };
                                                  setReviewData({
                                                    ...reviewData,
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
                                                    disabled={isFieldReadOnly}
                                                    onClick={() => {
                                                      const list = [...(reviewData.monthlyBonuses || [])];
                                                      if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                      list[bIdx] = { ...list[bIdx], title: presetTitle };
                                                      setReviewData({
                                                        ...reviewData,
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

                                            {(reviewData.monthlyBonuses || []).length > 1 && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={isFieldReadOnly}
                                                onClick={() => {
                                                  const list = (reviewData.monthlyBonuses || []).filter((_, idx) => idx !== bIdx);
                                                  setReviewData({
                                                    ...reviewData,
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
                                                  disabled={isFieldReadOnly}
                                                  onClick={() => {
                                                    const list = [...(reviewData.monthlyBonuses || [])];
                                                    if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                    const defaultAmount = list[bIdx].type === "mission_days" ? 25000000 : list[bIdx].amount;
                                                    list[bIdx] = { ...list[bIdx], type: "cash", amount: defaultAmount };
                                                    setReviewData({
                                                      ...reviewData,
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
                                                  disabled={isFieldReadOnly}
                                                  onClick={() => {
                                                    const list = [...(reviewData.monthlyBonuses || [])];
                                                    if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                    const defaultAmount = list[bIdx].type === "cash" ? 3 : list[bIdx].amount;
                                                    list[bIdx] = { ...list[bIdx], type: "mission_days", amount: defaultAmount };
                                                    setReviewData({
                                                      ...reviewData,
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
                                                    disabled={isFieldReadOnly}
                                                    value={formatNumberWithCommas(bonus.amount || 0)}
                                                    onChange={(e) => {
                                                      const raw = toAsciiDigits(e.target.value.replace(/,/g, "").replace(/\D/g, ""));
                                                      const num = raw ? parseInt(raw, 10) : 0;
                                                      const list = [...(reviewData.monthlyBonuses || [])];
                                                      if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                      list[bIdx] = { ...list[bIdx], amount: num };
                                                      setReviewData({
                                                        ...reviewData,
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
                                                      disabled={isFieldReadOnly}
                                                      value={bonus.amount ?? ""}
                                                      onChange={(e) => {
                                                        const num = parseInt(toAsciiDigits(e.target.value), 10) || 0;
                                                        const list = [...(reviewData.monthlyBonuses || [])];
                                                        if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                        list[bIdx] = { ...list[bIdx], amount: num };
                                                        setReviewData({
                                                          ...reviewData,
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
                                                      disabled={isFieldReadOnly || (bonus.amount || 0) <= 0}
                                                      onClick={() => {
                                                        const list = [...(reviewData.monthlyBonuses || [])];
                                                        if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                        list[bIdx] = { ...list[bIdx], amount: Math.max(0, (list[bIdx].amount || 0) - 1) };
                                                        setReviewData({ ...reviewData, monthlyBonuses: list, monthlyBonusAmount: list[0]?.amount });
                                                      }}
                                                      className="size-9 rounded-lg border border-border/40 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40"
                                                    >
                                                      <Minus className="size-3.5" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      disabled={isFieldReadOnly}
                                                      onClick={() => {
                                                        const list = [...(reviewData.monthlyBonuses || [])];
                                                        if (!list[bIdx]) list[bIdx] = { ...bonus };
                                                        list[bIdx] = { ...list[bIdx], amount: (list[bIdx].amount || 0) + 1 };
                                                        setReviewData({ ...reviewData, monthlyBonuses: list, monthlyBonusAmount: list[0]?.amount });
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
                                      <span>{t("saveAndApproveAdmin")}</span>
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

        {/* ======================================================== */}
        {/* SIDE COLUMN: TAGS, SEARCH & APPLICANTS QUEUE (RIGHT IN EN, LEFT IN FA) */}
        {/* ======================================================== */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Applicants Queue Box with Integrated Status Row */}
          <div className="bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 rounded-[1.75rem] p-4 sm:p-5 shadow-xs space-y-3.5">
            {/* Header: Title & Total Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-primary" />
                <span className="font-bold text-sm text-foreground">
                  {t("requestsQueue")}
                </span>
              </div>
              <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20", isRtl && "fa-num")}>
                {metrics.total}
              </span>
            </div>

            {/* Compact 4 Status Cards in a Single Row */}
            <div className={cn("grid grid-cols-4 gap-1.5", isRtl && "fa-num")}>
              {/* All */}
              <div
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center min-w-0",
                  statusFilter === "all"
                    ? "bg-primary/15 border-primary/40 shadow-xs ring-1 ring-primary/20"
                    : "bg-background/60 border-border/40 hover:bg-background"
                )}
                title={t("reqFilterAll")}
              >
                <span className="text-[10px] text-muted-foreground font-medium truncate w-full px-0.5">
                  {t("reqFilterAll")}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-foreground leading-tight mt-0.5">
                  {metrics.total}
                </span>
              </div>

              {/* Pending */}
              <div
                onClick={() => setStatusFilter("pending")}
                className={cn(
                  "py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center min-w-0",
                  statusFilter === "pending"
                    ? "bg-amber-500/15 border-amber-500/40 shadow-xs ring-1 ring-amber-500/20"
                    : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                )}
                title={t("statPendingAdmin")}
              >
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate w-full px-0.5">
                  {t("statPendingAdmin")}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">
                  {metrics.pending}
                </span>
              </div>

              {/* Approved */}
              <div
                onClick={() => setStatusFilter("active")}
                className={cn(
                  "py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center min-w-0",
                  statusFilter === "active"
                    ? "bg-emerald-500/15 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20"
                    : "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                )}
                title={t("statApproved")}
              >
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate w-full px-0.5">
                  {t("statApproved")}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
                  {metrics.active}
                </span>
              </div>

              {/* Rejected */}
              <div
                onClick={() => setStatusFilter("rejected")}
                className={cn(
                  "py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center min-w-0",
                  statusFilter === "rejected"
                    ? "bg-rose-500/15 border-rose-500/40 shadow-xs ring-1 ring-rose-500/20"
                    : "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10"
                )}
                title={t("statRejected")}
              >
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium truncate w-full px-0.5">
                  {t("statRejected")}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-rose-600 dark:text-rose-400 leading-tight mt-0.5">
                  {metrics.rejected}
                </span>
              </div>
            </div>

            {/* Requests List Cards */}
            <div className="flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  {t("noRequestsFound")}
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedReqId === req.id;

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
                      {/* Top Row: Avatar + Full Name (No truncation or squishing!) */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("relative rounded-full flex items-center justify-center p-[2px] shrink-0", getRoleRingClass(req.role))}>
                          <Avatar className="size-9 rounded-full border border-background">
                            <AvatarFallback 
                              className="text-white text-xs font-bold rounded-full"
                              style={{ backgroundColor: (req as any).avatarColor || "#0284c7" }}
                            >
                              {req.name ? req.name.charAt(0) : "؟"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-xs sm:text-sm text-foreground break-words leading-tight">
                            {getReqDisplayName(req) || req.email.split("@")[0]}
                          </span>
                          <span
                            className="text-[11px] text-muted-foreground font-mono truncate mt-0.5"
                            dir="ltr"
                          >
                            {req.email}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequest(req.id, req.name);
                          }}
                          className="size-7 rounded-lg text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-500/10 shrink-0 cursor-pointer transition-colors"
                          title={isRtl ? "حذف کامل از صف" : "Delete from Queue"}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {/* Middle Row: Tags brought DOWN below the name! */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {/* Request Type Tag */}
                        {req.requestType === "edit_profile" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shrink-0 shadow-2xs">
                            <UserCog className="size-3" />
                            <span>{isRtl ? "ویرایش مشخصات" : "Profile Edit"}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 flex items-center gap-1 shrink-0">
                            <span>{isRtl ? "ثبت‌نام جدید" : "Registration"}</span>
                          </span>
                        )}
                        {/* Status Badge */}
                        {req.status === "pending" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 shrink-0">
                            <UserCheck className="size-3" />
                            <span>{t("statusPendingHr")}</span>
                          </span>
                        )}
                        {req.status === "hr_approved" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 shrink-0">
                            <ShieldCheck className="size-3" />
                            <span>{t("statusHrApproved")}</span>
                          </span>
                        )}
                        {req.status === "active" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="size-3" />
                            <span>{t("statusActive")}</span>
                          </span>
                        )}
                        {req.status === "rejected" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 shrink-0">
                            <UserX className="size-3" />
                            <span>{t("statusRejected")}</span>
                          </span>
                        )}

                        {/* Company Badge */}
                        {(() => {
                          const comp = getCompanyFromEmail(req.email);
                          return (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded-full font-bold text-[9px] border shrink-0 flex items-center gap-1",
                                comp.id === "npceram"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                  : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                              )}
                            >
                              <span>{isRtl ? comp.nameFa : comp.nameEn}</span>
                            </span>
                          );
                        })()}

                        {/* Department Tag */}
                        {req.department && (
                          <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/30 truncate max-w-[130px]">
                            {t.has(`departments.${req.department}`) ? t(`departments.${req.department}`) : req.department}
                          </span>
                        )}

                        {/* Role Badge */}
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 font-medium",
                            req.role === "admin"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-bold"
                              : req.role === "manager"
                              ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 font-bold"
                              : req.role === "engineer"
                              ? "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                              : req.role === "staff"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : req.role === "customer"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          )}
                        >
                          {req.role === "superadmin" || req.role === "admin" ? (
                            <ShieldAlert className="size-3 shrink-0" />
                          ) : req.role === "dept_admin" || req.role === "manager" ? (
                            <Users className="size-3 shrink-0" />
                          ) : req.role === "office_admin" ? (
                            <Building2 className="size-3 shrink-0" />
                          ) : req.role === "engineer" ? (
                            <Briefcase className="size-3 shrink-0" />
                          ) : (
                            <UserCheck className="size-3 shrink-0" />
                          )}
                          <span>
                            {req.role === "superadmin" ? t("roleSuperadmin") :
                             req.role === "dept_admin" ? t("roleDeptAdmin") :
                             req.role === "office_admin" ? t("roleOfficeAdmin") :
                             req.role === "admin" ? t("roleAdmin") :
                             req.role === "manager" ? t("roleManager") :
                             req.role === "engineer" ? t("roleEngineer") :
                             req.role === "staff" ? t("roleStaff") :
                             req.role === "customer" ? t("roleCustomer") :
                             t("roleUser")}
                          </span>
                        </span>
                      </div>

                      {/* Bottom Row: Submission Date */}
                      <div className={cn("flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/30", isRtl && "fa-num")}>
                        <span className="text-[10px] text-muted-foreground">
                          {isRtl ? "تاریخ ثبت درخواست:" : "Requested:"}
                        </span>
                        <span className="font-mono text-[10px]">
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
      </div>

      {/* ─── Fullscreen Lightbox Modal ─────────────────────────────── */}
      {lightboxDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxDoc(null)}
        >
          {/* Top Controls */}
          <div
            className="absolute top-4 inset-x-4 flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-white">
              <span className="font-bold text-sm">{lightboxDoc.title}</span>
              <span className="text-xs text-white/60 font-mono" dir="ltr">
                {lightboxDoc.fileName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <RotateCw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                }}
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono cursor-pointer"
              >
                1:1
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLightboxDoc(null)}
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Image Canvas */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxDoc.src}
              alt={lightboxDoc.title}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-out",
              }}
              className="max-w-full max-h-[80vh] object-contain rounded-xl select-none shadow-2xl"
            />
          </div>
        </div>
      )}

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
