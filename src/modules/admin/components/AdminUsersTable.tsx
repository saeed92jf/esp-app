"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, PendingRequest } from "../types/admin.types";
import type { UserUploadedDocument } from "@/types/auth";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Search, X, Eye, EyeOff, Copy, LayoutDashboard,
  FileCheck, CheckCheck, XCircle, ZoomIn, ZoomOut, RotateCw, FileText, CheckCircle2,
  TableProperties, Mail, Phone, 
  FolderKanban, Award, Filter,
  ArrowUp, ArrowDown, ArrowUpDown, Check, RotateCcw,
  AlertCircle, KeyRound, Edit2, ShieldCheck, UserCheck, UserCog,
  Building, Calendar, Users,
  Building2, Briefcase, DollarSign, Clock, MapPin,
  Heart, Shield, Layers, Trash2, Lock, Sparkles, Loader2, Send
} from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";
import { formatPersonName, formatRoleName } from "@/lib/person-names";
import { getRoleRingClass } from "@/lib/role-avatar";
import { toast } from "sonner";
import { api } from "@/services";
import { NAVIGATION } from "@/config/navigation";
import { getCompanyFromEmail } from "../utils/company";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { getLocalizedDocumentTitle } from "@/modules/profile/utils/document-helpers";
import { addUserNotification } from "@/modules/dashboard/services/dashboard.service";
import { resolveDegreeLabel } from "@/config/profile-options";

interface AdminUsersTableProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserToEdit?: (u: User | null) => void;
  setActiveTab: (tab: any) => void;
  onRefresh?: () => Promise<void> | void;
}

interface ColumnFilterState {
  // Column 1: User
  userRoles: string[];
  userNameQuery: string;

  // Column 2: Department
  departments: string[];

  // Column: Company
  companies: string[];

  // Column 3: Contact
  hasEmailOnly: boolean;
  hasPhoneOnly: boolean;

  // Column 4: Projects
  projectRanges: string[];

  // Column 6: Tenure (Days)
  tenureRanges: string[];

  // Column 7: Salary
  salaryRanges: string[];

  // Column 8: Working Format Focus
  workingFormats: string[];

  // Column 9: Status
  statuses: string[];
}

const initialFilters: ColumnFilterState = {
  userRoles: [],
  userNameQuery: "",
  departments: [],
  companies: [],
  hasEmailOnly: false,
  hasPhoneOnly: false,
  projectRanges: [],
  tenureRanges: [],
  salaryRanges: [],
  workingFormats: [],
  statuses: []
};

const AVATAR_PALETTE = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#6366f1'];
function getUserAvatarColor(user: User): string {
  if (user.avatarColor && user.avatarColor.startsWith('#')) return user.avatarColor;
  let hash = 0;
  for (let i = 0; i < user.id.length; i++) hash = user.id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function matchesUserSearch(user: User, rawQuery: string): boolean {
  if (!rawQuery.trim()) return true;
  const q = rawQuery.toLowerCase().trim();
  const cleanQ = q.replace(/[\u200c\s]/g, "");

  const candidates = [
    user.name,
    user.fullName,
    user.fullNameFa,
    user.firstName,
    user.lastName,
    user.firstNameFa,
    user.lastNameFa,
    user.id,
    user.email,
    user.phone,
    user.employeeId,
    user.personnelCode,
    user.nationalId,
  ].filter(Boolean) as string[];

  return candidates.some((c) => {
    const cl = c.toLowerCase();
    if (cl.includes(q)) return true;
    const cleanC = cl.replace(/[\u200c\s]/g, "");
    return cleanC.includes(cleanQ);
  });
}

function formatLastSeen(isoDate?: string, isRtl = false): string {
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

function formatOnlineDuration(isoDate?: string, isRtl = false): string {
  if (!isoDate) return isRtl ? "همین الان" : "Just now";
  try {
    const diffMs = Math.max(0, Date.now() - new Date(isoDate).getTime());
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return isRtl ? "همین الان" : "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return isRtl ? `${diffMin} دقیقه` : `${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      const remMin = diffMin % 60;
      if (remMin > 0) {
        return isRtl ? `${diffHours} ساعت و ${remMin} دقیقه` : `${diffHours}h ${remMin}m`;
      }
      return isRtl ? `${diffHours} ساعت` : `${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return isRtl ? `${diffDays} روز` : `${diffDays}d`;
  } catch {
    return isRtl ? "همین الان" : "Just now";
  }
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface TableAccordionPanelProps {
  activeType: string;
  isRtl: boolean;
  children: React.ReactNode;
}

function TableAccordionPanel({ activeType, isRtl, children }: TableAccordionPanelProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  useIsomorphicLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) {
        setHeight((prev) => (prev === h ? prev : h));
      }
    };

    updateHeight();

    const ro = new ResizeObserver(() => {
      updateHeight();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [activeType]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: height ?? "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.22, ease: "easeOut" }
      }}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "w-full bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-x border-b border-border/50 rounded-t-none overflow-hidden",
        isRtl ? "rounded-br-none rounded-bl-2xl" : "rounded-bl-none rounded-br-2xl",
        "shadow-[inset_0_4px_8px_-3px_rgba(15,23,42,0.08)] dark:shadow-[inset_0_4px_8px_-3px_rgba(0,0,0,0.4)]"
      )}
    >
      <div ref={contentRef} className="p-4 sm:p-5">
        <div className="w-full max-w-5xl mx-auto">
          <motion.div
            key={activeType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export const ORDERED_ROLES: {
  value: UserRole;
  labelEn: string;
  labelFa: string;
  descEn: string;
  descFa: string;
  badgeClass: string;
  iconBg: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    value: "superadmin",
    labelEn: "Super Admin",
    labelFa: "Super Admin (مدیر ارشد)",
    descEn: "Full root access to entire system and role configurations",
    descFa: "دسترسی نامحدود و کامل به تمام بخش‌ها، تنظیمات رول‌ها و سیستم",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35 font-bold",
    iconBg: "bg-rose-600",
    icon: ShieldCheck,
  },
  {
    value: "admin",
    labelEn: "System Admin",
    labelFa: "System Admin (مدیر سیستم)",
    descEn: "Technical administrator, manages personnel, requests and module access",
    descFa: "مدیریت فنی، نظارت بر پرسنل، درخواست‌ها و تخصیص ماژول‌ها",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35 font-bold",
    iconBg: "bg-amber-600",
    icon: Shield,
  },
  {
    value: "office_admin",
    labelEn: "Office Admin",
    labelFa: "Office Admin (مدیر اداری)",
    descEn: "Administrative management, personnel affairs, and employee records",
    descFa: "مدیریت اداری، کارگزینی، ثبت قراردادها و امور پرسنلی",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25",
    iconBg: "bg-teal-600",
    icon: Building2,
  },
  {
    value: "manager",
    labelEn: "Department Manager",
    labelFa: "Department Manager (مدیر دپارتمان)",
    descEn: "Departmental oversight, request approvals, and team management",
    descFa: "تأیید درخواست‌های دپارتمان و نظارت بر پرسنل زیرمجموعه",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
    iconBg: "bg-purple-600",
    icon: Users,
  },
  {
    value: "engineer",
    labelEn: "Engineer",
    labelFa: "Engineer (مهندس)",
    descEn: "Specialized engineering tools, assigned projects, and technical workflows",
    descFa: "دسترسی تخصصی به ماژول‌های فنی، پروژه‌ها و کارتابل مهندسی",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
    iconBg: "bg-sky-600",
    icon: Briefcase,
  },
  {
    value: "staff",
    labelEn: "Staff",
    labelFa: "Staff (پرسنل / کارمند)",
    descEn: "Operational staff access to assigned daily tasks and documents",
    descFa: "دسترسی به وظایف اداری، کارتابل روزمره و مستندات",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    iconBg: "bg-emerald-600",
    icon: Building,
  },
  {
    value: "customer",
    labelEn: "Client",
    labelFa: "Client (مشتری / کارفرما)",
    descEn: "External client portal to view project milestones and communication",
    descFa: "مشاهده وضعیت پروژه‌ها، تحویل سفارش‌ها و مکاتبات",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    iconBg: "bg-amber-500",
    icon: UserCheck,
  },
  {
    value: "user",
    labelEn: "standard user",
    labelFa: "standard user (کاربر استاندارد)",
    descEn: "Default role with basic access and public modules (Knowledge & Media)",
    descFa: "نقش پیش‌فرض سیستم با دسترسی پایه و باز بودن خودکار ماژول‌های دانش و رسانه",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25",
    iconBg: "bg-slate-600",
    icon: KeyRound,
  },
];

export function AdminUsersTable({
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  setUserToEdit,
  setActiveTab,
  onRefresh,
}: AdminUsersTableProps) {
  const { user: currentUser, updateUser: updateUserStore } = useAuth();
  const t = useTranslations("Admin");

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "superadmin": return t("roleSuperadmin");
      case "dept_admin": return t("roleDeptAdmin");
      case "office_admin": return t("roleOfficeAdmin");
      case "admin": return t("roleAdmin");
      case "manager": return t("roleManager");
      case "engineer": return t("roleEngineer");
      case "staff": return t("roleStaff");
      case "customer": return t("roleCustomer");
      case "user": return t("roleUser");
      default: return role || t("roleUser");
    }
  };
  const tMenu = useTranslations("Menu");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const operatorName = formatPersonName(currentUser?.fullName || currentUser?.fullNameFa || currentUser?.name || "سعید جلیلی فرد", locale);
  const operatorRoleLabel = currentUser?.role === "superadmin"
    ? (isRtl ? "سوپر ادمین" : "Super Admin")
    : currentUser?.role === "dept_admin"
    ? (isRtl ? "ادمین دپارتمان" : "Dept Admin")
    : currentUser?.role === "office_admin"
    ? (isRtl ? "ادمین اداری" : "Office Admin")
    : (isRtl ? "ادمین سیستم" : "Admin");

  // Global search input
  const [globalSearch, setGlobalSearch] = useState("");

  // Column-specific filters
  const [colFilters, setColFilters] = useState<ColumnFilterState>(initialFilters);

  // Sorting
  const [sortState, setSortState] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: "id",
    direction: "asc"
  });

  // Salary visibility toggle
  const [showSalaries, setShowSalaries] = useState(false);

  const { confirm } = useConfirm();
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<UserRole>('user');
  const [isSavingRole, setIsSavingRole] = useState(false);

  const isSaeed = Boolean(
    (currentUser?.email && (currentUser.email.includes("jalili") || currentUser.email === "s.jalili@euroslotpars.com" || currentUser.email === "saeed@euroslotpars.com") && !currentUser.email.includes("saeedkhani")) ||
    currentUser?.id === "u-saeed"
  );
  const isSuperAdmin = currentUser?.role === 'superadmin' || isSaeed;
  const canEditModuleAccess = isSuperAdmin || currentUser?.role === 'admin';

  // Active accordion per user row
  const [activeAccordion, setActiveAccordion] = useState<{
    userId: string;
    type: 'view' | 'password' | 'role' | 'edit' | 'access' | 'documents';
  } | null>(null);

  // Track clicked user row to display action icons tray on click (instead of hover)
  const [openTrayUserId, setOpenTrayUserId] = useState<string | null>(null);

  // State for Password Change accordion
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSendingCurrentPassword, setIsSendingCurrentPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [sendNewPasswordEmail, setSendNewPasswordEmail] = useState(true);
  const [lightboxDoc, setLightboxDoc] = useState<{ src: string; title: string; fileName: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Escape key listener for lightbox
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxDoc(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleToggleVerifyUserDoc = (userId: string, docId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const currentDocs = targetUser.documents || [];
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
    const updatedUser = { ...targetUser, documents: updatedDocs };
    setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
    if (selectedUser?.id === userId) setSelectedUser(updatedUser);
    api.admin.updateUser(userId, updatedUser).catch(() => {});
  };

  const handleVerifyAllUserDocs = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const currentDocs = targetUser.documents || [];
    const updatedDocs = currentDocs.map((doc) => ({ ...doc, verified: true }));
    const updatedUser = { ...targetUser, documents: updatedDocs };
    setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
    if (selectedUser?.id === userId) setSelectedUser(updatedUser);
    api.admin.updateUser(userId, updatedUser).catch(() => {});
    toast.success(isRtl ? "تمامی مدارک پرسنل با موفقیت تأیید شدند." : "All personnel documents verified successfully.");
  };

  // State for Quick Edit accordion
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  // Extract unique departments with counts
  const departmentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => {
      const dep = u.department || 'engineering';
      map[dep] = (map[dep] || 0) + 1;
    });
    return map;
  }, [users]);

  const uniqueDepartments = useMemo(() => Object.keys(departmentCounts), [departmentCounts]);

  const departmentOptions: ComboboxOption[] = useMemo(() => {
    return uniqueDepartments.map(dep => {
      let depLabel = dep;
      try {
        depLabel = t.has(`departments.${dep}`) ? t(`departments.${dep}`) : dep;
      } catch {
        depLabel = dep;
      }
      return {
        value: dep,
        label: depLabel,
      };
    });
  }, [uniqueDepartments, t]);

  const roleOptions: ComboboxOption[] = useMemo(() => {
    return ORDERED_ROLES.map((r) => ({
      value: r.value,
      label: isRtl ? r.labelFa : r.labelEn,
    }));
  }, [isRtl]);

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const handleSort = (field: string, forceDirection?: 'asc' | 'desc') => {
    setSortState(prev => {
      if (prev.field === field) {
        const nextDir = forceDirection || (prev.direction === 'asc' ? 'desc' : 'asc');
        return { field, direction: nextDir };
      }
      return { field, direction: forceDirection || 'asc' };
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (colFilters.userRoles.length > 0 || colFilters.userNameQuery.trim().length > 0) count++;
    if (colFilters.departments.length > 0) count++;
    if (colFilters.companies.length > 0) count++;
    if (colFilters.hasEmailOnly || colFilters.hasPhoneOnly) count++;
    if (colFilters.projectRanges.length > 0) count++;
    if (colFilters.tenureRanges.length > 0) count++;
    if (colFilters.salaryRanges.length > 0) count++;
    if (colFilters.workingFormats.length > 0) count++;
    if (colFilters.statuses.length > 0) count++;
    return count;
  }, [colFilters]);

  const clearAllFilters = () => {
    setColFilters(initialFilters);
    setGlobalSearch("");
  };

  const checkIsCurrentUser = useCallback((u?: { id?: string; email?: string } | null): boolean => {
    if (!u || !currentUser) return false;
    const uid = String(u.id || '').toLowerCase();
    const cid = String(currentUser.id || '').toLowerCase();
    if (uid && cid && uid === cid) return true;
    const uemail = String(u.email || '').toLowerCase();
    const cemail = String(currentUser.email || '').toLowerCase();
    if (uemail && cemail && uemail === cemail) return true;

    const isUserSaeed = (uid === 'u-saeed' || uid === 'usr_9801' || uemail.includes('jalili') || uemail === 's.jalili@euroslotpars.com' || uemail === 'saeed@euroslotpars.com') && !uemail.includes('saeedkhani') && uid !== 'u-msaeedkhani';
    const isCurrentSaeed = (cid === 'u-saeed' || cid === 'usr_9801' || cemail.includes('jalili') || cemail === 's.jalili@euroslotpars.com' || cemail === 'saeed@euroslotpars.com') && !cemail.includes('saeedkhani') && cid !== 'u-msaeedkhani';
    if (isUserSaeed && isCurrentSaeed) return true;

    return false;
  }, [currentUser]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    // 🟢 Strict unique user deduplication by ID and canonical identity
    const seenUserIds = new Set<string>();
    const seenUserEmails = new Set<string>();
    const uniqueUsers = users.filter((u) => {
      const idKey = (u.id || "").toLowerCase();
      const emailKey = (u.email || "").toLowerCase();
      const isSaeedUser = (idKey === "u-saeed" || idKey === "usr_9801" || emailKey.includes("jalili") || emailKey === "s.jalili@euroslotpars.com" || emailKey === "saeed@euroslotpars.com") && !emailKey.includes("saeedkhani") && idKey !== "u-msaeedkhani";

      if (isSaeedUser) {
        if (seenUserIds.has("saeed_singleton")) return false;
        seenUserIds.add("saeed_singleton");
        return true;
      }

      if (idKey && seenUserIds.has(idKey)) return false;
      if (emailKey && seenUserEmails.has(emailKey)) return false;

      if (idKey) seenUserIds.add(idKey);
      if (emailKey) seenUserEmails.add(emailKey);
      return true;
    });

    return uniqueUsers.filter((user) => {
      // 0. Role-based Visibility & Permission Scope
      if (currentUser?.role === 'superadmin' || currentUser?.role === 'admin') {
        // Superadmin and Admin have full visibility across all corporate users and administrators
      } else if (currentUser?.role === 'dept_admin') {
        // Dept admin sees themselves and non-admin members of their department
        const isSelf = user.id === currentUser.id || (Boolean(user.email) && Boolean(currentUser.email) && user.email.toLowerCase() === currentUser.email?.toLowerCase());
        if (!isSelf) {
          if (user.role === 'admin' || user.role === 'superadmin') return false;
          const userDept = (user.department || '').toLowerCase();
          const curDept = (currentUser.department || '').toLowerCase();
          if (!userDept || !curDept || userDept !== curDept) {
            return false;
          }
        }
      } else if (currentUser?.role === 'office_admin') {
        // Office admin sees themselves and all non-admin roles across company
        const isSelf = user.id === currentUser.id || (Boolean(user.email) && Boolean(currentUser.email) && user.email.toLowerCase() === currentUser.email?.toLowerCase());
        if (!isSelf && (user.role === 'admin' || user.role === 'superadmin')) {
          return false;
        }
      }

      // 0. Global Search
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchName = matchesUserSearch(user, q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        const matchId = user.id?.toLowerCase().includes(q);
        const matchTitle = user.jobTitle?.toLowerCase().includes(q);
        const matchDept = user.department?.toLowerCase().includes(q);
        const matchPhone = user.phone?.includes(q);
        const userComp = getCompanyFromEmail(user.email);
        const matchCompany = userComp.nameFa.toLowerCase().includes(q) || userComp.nameEn.toLowerCase().includes(q) || userComp.domain.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId && !matchTitle && !matchDept && !matchPhone && !matchCompany) {
          return false;
        }
      }

      // 1. Column 1: User Query & Roles
      if (colFilters.userNameQuery.trim()) {
        if (!matchesUserSearch(user, colFilters.userNameQuery)) {
          return false;
        }
      }
      if (colFilters.userRoles.length > 0) {
        if (!colFilters.userRoles.includes(user.role)) return false;
      }

      // 2. Column 2: Departments
      if (colFilters.departments.length > 0) {
        const dep = user.department || 'engineering';
        if (!colFilters.departments.includes(dep)) return false;
      }

      // Column: Company
      if (colFilters.companies.length > 0) {
        const comp = getCompanyFromEmail(user.email);
        if (!colFilters.companies.includes(comp.id)) return false;
      }

      // 3. Column 3: Contact Channels
      if (colFilters.hasEmailOnly && !user.email) return false;
      if (colFilters.hasPhoneOnly && !user.phone) return false;

      // 4. Column 4: Projects Range
      if (colFilters.projectRanges.length > 0) {
        const projects = user.doneProjects || 0;
        const matchesRange = colFilters.projectRanges.some(r => {
          if (r === 'ge10') return projects >= 10;
          if (r === '5to10') return projects >= 5 && projects < 10;
          if (r === 'lt5') return projects < 5;
          return false;
        });
        if (!matchesRange) return false;
      }

      // 6. Column 6: Tenure Range
      if (colFilters.tenureRanges.length > 0) {
        const days = user.daysInCompany || 0;
        const matchesTenure = colFilters.tenureRanges.some(r => {
          if (r === 'ge300') return days >= 300;
          if (r === '100to300') return days >= 100 && days < 300;
          if (r === 'lt100') return days < 100;
          return false;
        });
        if (!matchesTenure) return false;
      }

      // 7. Column 7: Salary Range
      if (colFilters.salaryRanges.length > 0) {
        const sal = user.salary || 0;
        const matchesSalary = colFilters.salaryRanges.some(r => {
          if (r === 'ge15k') return sal >= 500000000;
          if (r === '10to15k') return sal >= 300000000 && sal < 500000000;
          if (r === 'lt10k') return sal < 300000000;
          return false;
        });
        if (!matchesSalary) return false;
      }

      // 8. Column 8: Working Format Focus
      if (colFilters.workingFormats.length > 0) {
        const wf = user.workingFormat || { office: 25, factory: 25, mission: 25, leave: 25 };
        const primaryFocus = Object.entries(wf).sort((a, b) => b[1] - a[1])[0][0];
        if (!colFilters.workingFormats.includes(primaryFocus)) return false;
      }

      // 9. Column 9: Status (Accurate live presence evaluation)
      if (colFilters.statuses.length > 0) {
        const isCurrent = checkIsCurrentUser(user);
        const effectiveStatus = (isCurrent || user.status === 'online' || Boolean(user.isOnline)) ? 'online' : 'offline';
        if (!colFilters.statuses.includes(effectiveStatus)) return false;
      }

      return true;
    }).sort((a, b) => {
      // 🟢 Rule: Online users are ALWAYS placed at the top of the table!
      const isCurrentA = checkIsCurrentUser(a);
      const isOnlineA = isCurrentA || a.status === 'online' || Boolean(a.isOnline);

      const isCurrentB = checkIsCurrentUser(b);
      const isOnlineB = isCurrentB || b.status === 'online' || Boolean(b.isOnline);

      if (isOnlineA && !isOnlineB) return -1;
      if (!isOnlineA && isOnlineB) return 1;

      // Rule: Offline users sorted by who went offline more recently (2 min ago before 3 min ago)!
      if (!isOnlineA && !isOnlineB) {
        if (!sortState.field || sortState.field === 'id') {
          const timeA = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
          const timeB = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
          if (timeA !== timeB) return timeB - timeA;
        }
      }

      // Online users: most recently active / online first by default
      if (isOnlineA && isOnlineB) {
        if (!sortState.field || sortState.field === 'id') {
          const timeA = (a.onlineSince || a.lastSeenAt) ? new Date(a.onlineSince || a.lastSeenAt!).getTime() : 0;
          const timeB = (b.onlineSince || b.lastSeenAt) ? new Date(b.onlineSince || b.lastSeenAt!).getTime() : 0;
          if (timeA !== timeB) return timeB - timeA;
        }
      }

      // Within same status group, apply column sort
      let valA: any = a[sortState.field as keyof User];
      let valB: any = b[sortState.field as keyof User];

      if (sortState.field === 'id') {
        valA = parseInt(a.id) || 0;
        valB = parseInt(b.id) || 0;
      } else if (sortState.field === 'company') {
        valA = getCompanyFromEmail(a.email).nameFa;
        valB = getCompanyFromEmail(b.email).nameFa;
      } else if (sortState.field === 'primaryFormat') {
        const wfA = a.workingFormat || { office: 0, factory: 0, mission: 0, leave: 0 };
        const wfB = b.workingFormat || { office: 0, factory: 0, mission: 0, leave: 0 };
        valA = Math.max(...Object.values(wfA));
        valB = Math.max(...Object.values(wfB));
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortState.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, globalSearch, colFilters, sortState]);

  const handleSelectAndGoHome = (user: User) => {
    setSelectedUser(user);
    setActiveTab('home');
  };

  // Accordion Toggle
  const toggleAccordion = (userId: string, type: 'view' | 'password' | 'role' | 'edit' | 'access' | 'documents') => {
    const targetUser = users.find(x => x.id === userId);
    if (targetUser) {
      setSelectedUser(targetUser);
    }
    setOpenTrayUserId(userId);

    if (activeAccordion?.userId === userId && activeAccordion?.type === type) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion({ userId, type });
      setNewPassword("");
      setConfirmPassword("");
      if (type === 'role') {
        if (!isSuperAdmin) {
          toast.error(isRtl ? "تعیین و تغییر نقش فقط توسط مدیر ارشد سیستم (Super Admin) امکان‌پذیر است." : "Role definition and modification is strictly restricted to Super Admin only.");
          return;
        }
        setSelectedRoleForUser((targetUser?.role as UserRole) || 'user');
      }
      if (type === 'password') {
        // Fetch fresh password directly from server
        api.admin.getUserById(userId).then((freshUser) => {
          if (freshUser?.password) {
            setUsers(users.map((u: User) => u.id === userId ? { ...u, password: freshUser.password } : u));
          }
        }).catch(() => {});
      }
      if (type === 'edit') {
        const u = targetUser || users.find(x => x.id === userId);
        if (u) {
          setEditFormData({
            name: u.name,
            firstNameFa: u.firstNameFa || "",
            lastNameFa: u.lastNameFa || "",
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email,
            phone: u.phone || "",
            extensionNumber: u.extensionNumber || "",
            department: u.department || "engineering",
            role: u.role || "user",
            jobTitle: u.jobTitle || "",
            salary: u.salary ?? 0,
          });
        }
      }
    }
  };

  const [creatingReqUserId, setCreatingReqUserId] = useState<string | null>(null);

  const handleCreateEditRequest = async (targetUser: User) => {
    try {
      setCreatingReqUserId(targetUser.id);
      const comp = getCompanyFromEmail(targetUser.email);
      const rawUser = targetUser as any;
      const resolvedDept = targetUser.department || rawUser.subUnit || "Engineering";
      const resolvedJoinDate = targetUser.joinDate || targetUser.joinedAt || rawUser.employmentDate || "";
      const resolvedGradYear = targetUser.graduationYear || rawUser.graduationDate || "";
      const resolvedEduDegree = targetUser.educationDegree || rawUser.education || "master";
      const resolvedEduField = targetUser.educationField || rawUser.fieldOfStudy || "";
      const resolvedInsCode = targetUser.insuranceCode || rawUser.insuranceNumber || "";
      const resolvedSheba = targetUser.shebaNumber || rawUser.bankAccount || "";
      const resolvedJobTitle = targetUser.jobTitle || rawUser.jobPosition || rawUser.jobPositionEn || "";
      const resolvedEmpId = targetUser.employeeId || (rawUser.personnelCode ? `ESP-${rawUser.personnelCode}` : "");
      const resolvedManager = targetUser.manager || rawUser.directManager || "";
      const resolvedDuties = rawUser.duties || [];

      const newReqPayload: Partial<PendingRequest> = {
        userId: targetUser.id,
        name: targetUser.name || targetUser.fullNameFa || targetUser.fullName || targetUser.email.split("@")[0],
        fullName: targetUser.fullName || targetUser.name,
        fullNameFa: targetUser.fullNameFa || targetUser.name,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        firstNameFa: targetUser.firstNameFa,
        lastNameFa: targetUser.lastNameFa,
        email: targetUser.email,
        phone: targetUser.phone || rawUser.mobile,
        nationalId: targetUser.nationalId,
        department: resolvedDept,
        company: isRtl ? comp.nameFa : comp.nameEn,
        companyId: comp.id,
        jobTitle: resolvedJobTitle,
        role: targetUser.role,
        workLocation: targetUser.workLocation || "office",
        contractType: targetUser.contractType || "full_time",
        employeeId: resolvedEmpId,
        extensionNumber: targetUser.extensionNumber || "",
        salary: targetUser.salary,
        hasOvertime: targetUser.hasOvertime ?? true,
        maxOvertimeHours: targetUser.maxOvertimeHours ?? 40,
        monthlyBonusType: targetUser.monthlyBonusType || "cash",
        monthlyBonusAmount: targetUser.monthlyBonusAmount ?? 25000000,
        monthlyBonusTitle: targetUser.monthlyBonusTitle,
        monthlyBonuses: targetUser.monthlyBonuses,
        maritalStatus: targetUser.maritalStatus || "single",
        childrenCount: targetUser.childrenCount ?? 0,
        birthDate: targetUser.birthDate || rawUser.birthDate || "",
        birthPlace: targetUser.birthPlace || rawUser.birthPlace || "",
        fatherName: targetUser.fatherName || rawUser.fatherName || "",
        gender: rawUser.gender || "مرد",
        militaryStatus: rawUser.militaryStatus || rawUser.militaryDuty || "",
        joinDate: resolvedJoinDate,
        insuranceType: targetUser.insuranceType || "complementary",
        insuranceCode: resolvedInsCode,
        insuranceProvider: targetUser.insuranceProvider || "تأمین اجتماعی",
        insuranceValidUntil: targetUser.insuranceValidUntil || "",
        supplementaryPlan: (targetUser.supplementaryPlan || rawUser.supplementalInsurance || "special") as any,
        supplementaryProvider: targetUser.supplementaryProvider || "SOS",
        shebaNumber: resolvedSheba,
        educationDegree: resolvedEduDegree,
        educationField: resolvedEduField,
        university: targetUser.university || "",
        graduationYear: resolvedGradYear,
        skills: targetUser.skills as any,
        projects: (targetUser.projects || rawUser.projects || []) as any,
        experiences: (targetUser.experiences || rawUser.experiences || []) as any,
        modulesAccess: targetUser.modulesAccess,
        documents: targetUser.documents,
        duties: resolvedDuties,
        manager: resolvedManager,
        subordinates: targetUser.subordinates || [],
        status: "pending",
        requestType: "edit_profile",
        requestTag: "ویرایش اطلاعات کاربر",
        notes: isRtl
          ? `درخواست بازنگری و ویرایش اطلاعات پرونده پرسنلی برای «${formatPersonName(targetUser.name, locale)}» (#${targetUser.id})`
          : `Profile information update request for ${formatPersonName(targetUser.name, locale)} (#${targetUser.id})`,
      };

      try {
        await api.admin.createRequest(newReqPayload);
      } catch (err: any) {
        // If an active request already exists for this user, gracefully continue
        console.warn("Edit request already open or updated:", err);
      }

      toast.success(
        isRtl
          ? `فرم ویرایش برای «${formatPersonName(targetUser.name, locale)}» بارگذاری شد و به بخش بررسی منتقل شد.`
          : `Edit form for "${formatPersonName(targetUser.name, locale)}" loaded in Requests.`
      );

      if (onRefresh) {
        await onRefresh();
      }
      if (setActiveTab) {
        setActiveTab("requests");
      }
    } catch (err: any) {
      console.error("handleCreateEditRequest error:", err);
      toast.error(isRtl ? "خطا در آماده‌سازی فرم ویرایش اطلاعات." : "Failed to prepare edit form.");
    } finally {
      setCreatingReqUserId(null);
    }
  };

  // Save role by Super Admin only
  const handleSaveRole = async (userId: string, newRole: UserRole) => {
    if (!isSuperAdmin) {
      toast.error(isRtl ? "تعیین رول فقط توسط سوپر ادمین مجاز است." : "Role assignment is restricted to Super Admin only.");
      return;
    }
    setIsSavingRole(true);
    try {
      await api.admin.updateUser(userId, { role: newRole });
      setUsers((prev: User[]) => prev.map((u: User) => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: User | null) => prev ? { ...prev, role: newRole } : null);
      }
      if (currentUser?.id === userId) {
        const isCurrentSaeed = currentUser.id === 'u-saeed' || (currentUser.email && currentUser.email.toLowerCase().includes('jalili'));
        updateUserStore({ role: isCurrentSaeed ? 'superadmin' : newRole });
      }
      const roleObj = ORDERED_ROLES.find(r => r.value === newRole);
      const roleLabel = isRtl ? (roleObj?.labelFa || newRole) : (roleObj?.labelEn || newRole);
      toast.success(
        isRtl
          ? `نقش کاربر با موفقیت به «${roleLabel}» تغییر یافت.`
          : `User role successfully updated to "${roleLabel}".`
      );
      setActiveAccordion(null);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در به‌روزرسانی نقش" : "Failed to update role"));
    } finally {
      setIsSavingRole(false);
    }
  };

  // Delete user with explicit warning dialog
  const handleDeleteUser = (targetUser: User) => {
    const isTargetSaeed = targetUser.id === 'u-saeed' || (targetUser.email && targetUser.email.toLowerCase().includes('jalili'));
    if (targetUser.role === 'superadmin' || isTargetSaeed) {
      toast.error(isRtl ? "امکان حذف حساب کاربری مدیر ارشد سیستم وجود ندارد." : "Cannot delete Super Admin account.");
      return;
    }

    confirm({
      title: isRtl ? `حذف کامل کاربر «${formatPersonName(targetUser.name, locale)}»` : `Delete User "${formatPersonName(targetUser.name, locale)}"`,
      description: isRtl
        ? `هشدار حذف اطلاعات: آیا از حذف کامل حساب کاربری «${formatPersonName(targetUser.name, locale)}» و تمام اطلاعات پروفایل، مدارک، سوابق و دسترسی‌های وی اطمینان دارید؟ این عملیات دائمی بوده و اطلاعات قابل بازیابی نخواهند بود.`
        : `Data Deletion Warning: Are you sure you want to completely delete "${formatPersonName(targetUser.name, locale)}" along with all profile data, documents, and permissions? This action is permanent and cannot be undone.`,
      confirmText: isRtl ? "حذف کامل و دائمی" : "Delete Permanently",
      cancelText: isRtl ? "انصراف" : "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await api.admin.deleteUser(targetUser.id);
          setUsers((prev: User[]) => prev.filter((u: User) => u.id !== targetUser.id));
          if (selectedUser?.id === targetUser.id) {
            setSelectedUser(null);
          }
          if (openTrayUserId === targetUser.id) {
            setOpenTrayUserId(null);
          }
          if (activeAccordion?.userId === targetUser.id) {
            setActiveAccordion(null);
          }
          toast.success(
            isRtl
              ? `حساب کاربری «${formatPersonName(targetUser.name, locale)}» با موفقیت حذف گردید.`
              : `User "${formatPersonName(targetUser.name, locale)}" successfully deleted.`
          );
        } catch (err: any) {
          toast.error(err?.message || (isRtl ? "خطا در حذف کاربر" : "Failed to delete user"));
        }
      },
    });
  };

  // Toggle user module access directly from table accordion
  const handleToggleUserAccess = (userId: string, moduleId: string, checked: boolean) => {
    if (!canEditModuleAccess) {
      toast.error(isRtl ? "تغییر دسترسی ماژول‌ها منحصراً توسط مدیر ارشد سیستم و مدیر سیستم امکان‌پذیر است." : "Module access can only be modified by Super Admin and System Admin.");
      return;
    }
    const availableModules = NAVIGATION.filter(n => n.id !== "main" && n.id !== "dashboard");
    const updatedUsers = users.map(u => {
      if (u.id !== userId) return u;
      const updatedUser = { ...u };
      const currentList = updatedUser.modulesAccess ? [...updatedUser.modulesAccess] : [];

      const setItemAccess = (id: string, hasAccess: boolean) => {
        const idx = currentList.findIndex(m => m.moduleId === id);
        if (idx !== -1) {
          currentList[idx] = { ...currentList[idx], hasAccess };
        } else {
          currentList.push({ moduleId: id, hasAccess, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
        }
      };

      const parent = availableModules.find(m => m.id === moduleId);
      if (parent) {
        setItemAccess(moduleId, checked);
        parent.items?.forEach((item: any) => {
          setItemAccess(item.href, checked);
        });
      } else {
        setItemAccess(moduleId, checked);
        const parentGroup = availableModules.find(m => m.items?.some((i: any) => i.href === moduleId));
        if (parentGroup) {
          if (checked) {
            setItemAccess(parentGroup.id, true);
          } else {
            const anyItemChecked = parentGroup.items?.some((item: any) => {
              const ex = currentList.find(m => m.moduleId === item.href);
              return ex ? ex.hasAccess : false;
            });
            if (!anyItemChecked) {
              setItemAccess(parentGroup.id, false);
            }
          }
        }
      }

      updatedUser.modulesAccess = currentList;
      if (selectedUser?.id === userId) {
        setSelectedUser(updatedUser);
      }
      return updatedUser;
    });
    setUsers(updatedUsers);
    const targetUser = updatedUsers.find(u => u.id === userId);
    if (targetUser?.modulesAccess) {
      api.admin.updateUserModules(userId, targetUser.modulesAccess).catch(console.error);
    }
    toast.success(t("accessUpdated"));
  };

  // Save Changed Password (Real authenticated token change + optional email dispatch)
  const handleSavePassword = async (userId: string) => {
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(isRtl ? "رمز عبور باید حداقل ۶ کاراکتر باشد." : "Password must be at least 6 characters.");
      return;
    }
    setIsSavingPassword(true);
    try {
      const targetUser = users.find(u => u.id === userId);
      const targetName = targetUser?.name || userId;
      await api.admin.updateUser(userId, { password: newPassword });
      setUsers(users.map(u => (u.id === userId ? { ...u, password: newPassword } : u)));

      // If option to send updated credentials email is enabled
      if (sendNewPasswordEmail) {
        try {
          await api.admin.sendPassword(userId);
        } catch (mailErr) {
          console.warn("Failed to dispatch updated password email:", mailErr);
        }
      }

      addUserNotification({
        title: isRtl ? "تغییر رمز عبور کاربر" : "Password Changed",
        description: isRtl
          ? `رمز عبور کاربر (${targetName}) توسط ${operatorName} (${operatorRoleLabel}) بازنشانی و تغییر یافت.`
          : `Password for ${targetName} was changed by ${operatorName} (${operatorRoleLabel}).`,
        type: "system",
        operatorName,
        operatorRole: operatorRoleLabel,
      });

      toast.success(
        sendNewPasswordEmail
          ? (isRtl ? `رمز عبور با موفقیت ذخیره شد و به ایمیل کاربر (${targetUser?.email || ''}) ارسال گردید.` : t("passwordChangedSuccess"))
          : t("passwordChangedSuccess")
      );
      setActiveAccordion(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ذخیره رمز عبور روی سرور" : "Failed to update password on server"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Dispatch Current Password Directly to User Email in Corporate Template
  const handleSendCurrentPassword = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const targetEmail = targetUser.email;
    if (!targetEmail) {
      toast.error(isRtl ? "این کاربر فاقد آدرس ایمیل معتبر است." : "User has no valid email address.");
      return;
    }
    setIsSendingCurrentPassword(true);
    try {
      const res = await api.admin.sendPassword(userId);
      if (res?.password && !targetUser.password) {
        setUsers(users.map(u => (u.id === userId ? { ...u, password: res.password } : u)));
      }
      toast.success(
        isRtl
          ? `رمز عبور فعلی کاربر در قالب ایمیل سازمانی به آدرس (${targetEmail}) ارسال گردید.`
          : `Current credentials email dispatched to ${targetEmail}.`
      );
      addUserNotification({
        title: isRtl ? "ارسال رمز عبور فعلی" : "Current Password Dispatched",
        description: isRtl
          ? `رمز عبور فعلی کاربر (${targetUser.name || targetEmail}) توسط ${operatorName} به ایمیل وی ارسال شد.`
          : `Current password for ${targetUser.name || targetEmail} was sent by ${operatorName}.`,
        type: "system",
        operatorName,
        operatorRole: operatorRoleLabel,
      });
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ارسال ایمیل حاوی کلمه عبور" : "Failed to send password email"));
    } finally {
      setIsSendingCurrentPassword(false);
    }
  };

  // Save Quick Edited Info
  const handleSaveEdit = async (userId: string) => {
    try {
      const fn = (editFormData.firstName || "").trim();
      const ln = (editFormData.lastName || "").trim();
      const fnFa = (editFormData.firstNameFa || "").trim();
      const lnFa = (editFormData.lastNameFa || "").trim();
      const fullNameEn = (fn || ln) ? `${fn} ${ln}`.trim() : (editFormData.fullName || "");
      const fullNameFa = (fnFa || lnFa) ? `${fnFa} ${lnFa}`.trim() : (editFormData.fullNameFa || "");
      const finalName = isRtl ? (fullNameFa || editFormData.name || fullNameEn) : (fullNameEn || editFormData.name || fullNameFa);

      const payload: Partial<User> = {
        ...editFormData,
        name: finalName || editFormData.name,
        fullName: fullNameEn || editFormData.fullName,
        fullNameFa: fullNameFa || editFormData.fullNameFa,
        firstName: fn,
        lastName: ln,
        firstNameFa: fnFa,
        lastNameFa: lnFa,
        salary: Number(editFormData.salary) || 0,
      };

      const updatedUser = await api.admin.updateUser(userId, payload);
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          const updated = { ...u, ...updatedUser, ...payload };
          if (selectedUser?.id === userId) {
            setSelectedUser(updated);
          }
          return updated;
        }
        return u;
      });
      setUsers(updatedUsers);
      if (onRefresh) await onRefresh();

      // If the edited user is the currently logged in admin, update active session immediately
      if (currentUser && (currentUser.id === userId || (currentUser.email && editFormData.email && currentUser.email.toLowerCase() === editFormData.email.toLowerCase()))) {
        const isSaeed = Boolean(
          (currentUser.email && (currentUser.email.includes("jalili") || currentUser.email === "s.jalili@euroslotpars.com" || currentUser.email === "saeed@euroslotpars.com") && !currentUser.email.includes("saeedkhani")) ||
          currentUser.id === "u-saeed" ||
          userId === "u-saeed"
        );
        const resolvedRole = isSaeed || currentUser.role === "superadmin" ? "superadmin" : (editFormData.role || currentUser.role);
        updateUserStore({
          name: editFormData.name,
          email: editFormData.email,
          mobile: editFormData.phone,
          department: editFormData.department,
          jobTitle: editFormData.jobTitle,
          role: resolvedRole,
        });
        try {
          const raw = localStorage.getItem("esp_auth_user");
          if (raw) {
            const authObj = JSON.parse(raw);
            const merged = { ...authObj, ...editFormData, mobile: editFormData.phone || authObj.mobile };
            localStorage.setItem("esp_auth_user", JSON.stringify(merged));
            localStorage.setItem("esp-auth-user", JSON.stringify(merged));
          }
        } catch {}
      }

      toast.success(t("userInfoUpdatedSuccess"));
      setActiveAccordion(null);
    } catch (err: any) {
      toast.error(err?.message || "خطا در ذخیره اطلاعات در سرور");
    }
  };

  /* ── Header Cell Component with Excel Filter Popover ── */
  const renderExcelHeader = ({
    title,
    field,
    isFiltered,
    onClear,
    children,
    align = "start"
  }: {
    title: string;
    field: string;
    isFiltered: boolean;
    onClear: () => void;
    children: React.ReactNode;
    align?: "start" | "center";
  }) => {
    const isSorted = sortState.field === field;
    const sortDir = sortState.direction;

    return (
      <th className={cn(
        "py-3.5 px-3 text-xs font-bold select-none group text-slate-800 dark:text-slate-100 first:rounded-ts-2xl first:rounded-bs-none last:rounded-te-2xl last:rounded-be-none rounded-b-none",
        align === "start" ? "text-start" : "text-center",
        isFiltered && "bg-primary/10 text-primary"
      )}>
        <div className={cn(
          "inline-flex items-center gap-1.5",
          align === "start" ? "justify-start" : "justify-center"
        )}>
          {/* Column Title + Quick Sort Toggle */}
          <button
            type="button"
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer outline-none"
            title={`${title} - ${t("sortAsc")} / ${t("sortDesc")}`}
          >
            <span>{title}</span>
            {isSorted ? (
              sortDir === 'asc' ? (
                <ArrowUp className="size-3 text-primary stroke-[2.5]" />
              ) : (
                <ArrowDown className="size-3 text-primary stroke-[2.5]" />
              )
            ) : (
              <ArrowUpDown className="size-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
          </button>

          {/* Excel Filter Funnel Button with Popover */}
          {children ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "size-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer outline-none",
                    isFiltered 
                      ? "bg-primary text-primary-foreground shadow-2xs" 
                      : "text-muted-foreground/50 hover:text-foreground hover:bg-background/80"
                  )}
                  title={t("filterTooltip")}
                >
                  <Filter className="size-3" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align={align === 'start' ? 'start' : 'center'}
                sideOffset={6}
                dir="rtl"
                className="w-64 p-3 bg-popover border border-border/60 shadow-xl rounded-2xl text-xs flex flex-col gap-2.5 rtl:text-right"
              >
                {/* Header Title & Sorting options */}
                <div className="flex flex-col gap-1 pb-2 border-b border-border/40">
                  <span className="font-bold text-foreground text-[11px] text-muted-foreground">
                    {title}
                  </span>

                  <div className="flex flex-col gap-0.5 mt-1">
                    <button
                      type="button"
                      onClick={() => handleSort(field, 'asc')}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer",
                        isSorted && sortDir === 'asc' && "text-primary font-bold bg-primary/10"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowUp className="size-3.5" />
                        {t("sortAsc")}
                      </span>
                      {isSorted && sortDir === 'asc' && <Check className="size-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSort(field, 'desc')}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer",
                        isSorted && sortDir === 'desc' && "text-primary font-bold bg-primary/10"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowDown className="size-3.5" />
                        {t("sortDesc")}
                      </span>
                      {isSorted && sortDir === 'desc' && <Check className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Custom Filter Body */}
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto custom-scrollbar pe-1">
                  {children}
                </div>

                {/* Popover Footer: Clear column filter */}
                {isFiltered && (
                  <div className="pt-2 border-t border-border/40 flex justify-end">
                    <button
                      type="button"
                      onClick={onClear}
                      className="text-[11px] font-semibold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      <span>{t("clearColumnFilter")}</span>
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </th>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-100/80 dark:bg-slate-900/40 border border-border/40 rounded-[2rem] p-4 sm:p-6 shadow-xs overflow-hidden">
      
      {/* ── Top Header & Global Search Bar (Unified in 1 Streamlined Row) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-border/40 shrink-0">
        
        {/* Left Side: Title + Total Count + Search Bar directly beside it */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <TableProperties className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">
                {t("usersTable")}
              </h2>
              <p className="text-[11px] text-muted-foreground fa-num">
                {t("totalUsersCount", { count: filteredUsers.length })}
              </p>
            </div>
          </div>

          {/* Search Bar placed directly in front of the Title */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm min-w-[180px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              name="admin_users_global_search"
              id="admin_users_global_search"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t("searchUsersPlaceholder")}
              className="h-9 text-xs ps-8.5 pe-8 rounded-xl bg-background/90 dark:bg-card/90 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/40 shadow-none transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Filters Clear & Salary Masking */}
        <div className="flex items-center gap-2 shrink-0">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 px-3 rounded-xl border-destructive/30 text-destructive text-xs font-semibold gap-1.5 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>{t("clearAllFilters")}</span>
              <span className="size-4.5 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center fa-num font-bold ms-1">
                {activeFiltersCount}
              </span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSalaries(!showSalaries)}
            className="h-9 px-3 rounded-xl border-border/50 text-xs font-semibold gap-2 bg-background/80 hover:bg-background transition-colors cursor-pointer"
          >
            {showSalaries ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            <span>{t("monthlySalary")}</span>
          </Button>
        </div>
      </div>

      {/* ── Table Container with Perfect Rounded Fillet Corners & Stacking Isolation ── */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-border/50 rounded-2xl bg-card shadow-inner mt-3.5 fa-num isolate">
        <table className="w-full text-sm text-start border-separate border-spacing-0 min-w-[960px]">
          
          {/* Distinct, High-Contrast Table Header */}
          <thead className="bg-slate-200/90 dark:bg-slate-800/95 sticky top-0 z-10 backdrop-blur-md border-b-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs rounded-t-2xl rounded-b-none">
            <tr>
              {/* ── Column 1: User ── */}
              {renderExcelHeader({
                title: t("userCol"),
                field: "name",
                align: "start",
                isFiltered: colFilters.userRoles.length > 0 || colFilters.userNameQuery.trim().length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, userRoles: [], userNameQuery: "" })),
                children: (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Search className="absolute start-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <Input
                        type="search"
                        name="admin_users_col_name_filter"
                        id="admin_users_col_name_filter"
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={colFilters.userNameQuery}
                        onChange={(e) => setColFilters(prev => ({ ...prev, userNameQuery: e.target.value }))}
                        placeholder={t("searchInColumn")}
                        className="h-7 text-[11px] ps-6 pe-2 rounded-md bg-muted/50 border-border/40"
                      />
                    </div>

                    <span className="font-semibold text-foreground/80 text-[10px] mt-1">{t("role")}</span>
                    {(['superadmin', 'admin', 'dept_admin', 'office_admin', 'manager', 'engineer', 'staff', 'customer', 'user'] as const)
                      .filter(r => {
                        if (currentUser?.role === 'superadmin') return true;
                        if (currentUser?.role === 'admin') return r !== 'superadmin';
                        return r !== 'superadmin' && r !== 'admin';
                      })
                      .map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.userRoles.includes(role)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            userRoles: toggleArrayItem(prev.userRoles, role)
                          }))}
                        />
                        <span>{getRoleLabel(role)}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 2: EXT (ستون مستقل بعد از اسم) ── */}
              {renderExcelHeader({
                title: isRtl ? "داخلی" : "EXT.",
                field: "extensionNumber" as any,
                align: "center",
                isFiltered: false,
                onClear: () => {},
                children: null,
              })}

              {/* ── Column 3: Department & Title ── */}
              {renderExcelHeader({
                title: t("roleAndDeptCol"),
                field: "department",
                align: "start",
                isFiltered: colFilters.departments.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, departments: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("department")}</span>
                    {uniqueDepartments.map(dep => {
                      let depName = dep;
                      try {
                        depName = t.has(`departments.${dep}`) ? t(`departments.${dep}`) : dep;
                      } catch {
                        depName = dep;
                      }
                      return (
                        <label key={dep} className="flex items-center justify-between gap-2 cursor-pointer py-0.5 hover:text-foreground">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={colFilters.departments.includes(dep)}
                              onCheckedChange={() => setColFilters(prev => ({
                                ...prev,
                                departments: toggleArrayItem(prev.departments, dep)
                              }))}
                            />
                            <span>{depName}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {departmentCounts[dep]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )
              })}

              {/* ── Column 3: Contact (مستقیماً بعد از دپارتمان) ── */}
              {renderExcelHeader({
                title: t("contactCol"),
                field: "phone",
                align: "start",
                isFiltered: colFilters.hasPhoneOnly,
                onClear: () => setColFilters(prev => ({ ...prev, hasPhoneOnly: false })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    <label className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                      <Checkbox
                        checked={colFilters.hasPhoneOnly}
                        onCheckedChange={(c) => setColFilters(prev => ({ ...prev, hasPhoneOnly: Boolean(c) }))}
                      />
                      <span>{t("hasPhone")}</span>
                    </label>
                  </div>
                )
              })}

              {/* ── Column 4: Company & Role (شرکت و نقش) ── */}
              {renderExcelHeader({
                title: isRtl ? "شرکت و نقش" : "Company & Role",
                field: "company",
                align: "start",
                isFiltered: colFilters.companies.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, companies: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterByCompany")}</span>
                    {[
                      { id: "euroslot", label: t("companyEuroslot") },
                      { id: "npceram", label: t("companyNpceram") },
                      { id: "holding", label: isRtl ? "هلدینگ" : "Holding" }
                    ].map((comp) => (
                      <label key={comp.id} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.companies.includes(comp.id)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            companies: toggleArrayItem(prev.companies, comp.id)
                          }))}
                        />
                        <span className="text-xs">{comp.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 5: Projects & Experience (پروژه و تجربه در یک ستون) ── */}
              {renderExcelHeader({
                title: isRtl ? "پروژه و تجربه" : "Projects & Exp",
                field: "doneProjects",
                align: "start",
                isFiltered: colFilters.projectRanges.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, projectRanges: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'ge10', label: t("projectsGe10") },
                      { key: '5to10', label: t("projects5to10") },
                      { key: 'lt5', label: t("projectsLt5") }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.projectRanges.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            projectRanges: toggleArrayItem(prev.projectRanges, item.key)
                          }))}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 6: Tenure (Days in company) ── */}
              {renderExcelHeader({
                title: t("tenureCol"),
                field: "daysInCompany",
                align: "start",
                isFiltered: colFilters.tenureRanges.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, tenureRanges: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'ge300', label: t("tenureGe300") },
                      { key: '100to300', label: t("tenure100to300") },
                      { key: 'lt100', label: t("tenureLt100") }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.tenureRanges.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            tenureRanges: toggleArrayItem(prev.tenureRanges, item.key)
                          }))}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 7: Salary ── */}
              {renderExcelHeader({
                title: t("salaryCol"),
                field: "salary",
                align: "start",
                isFiltered: colFilters.salaryRanges.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, salaryRanges: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'ge15k', label: t("salaryGe15k") },
                      { key: '10to15k', label: t("salary10to15k") },
                      { key: 'lt10k', label: t("salaryLt10k") }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.salaryRanges.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            salaryRanges: toggleArrayItem(prev.salaryRanges, item.key)
                          }))}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 8: Status ── */}
              {renderExcelHeader({
                title: t("statusCol"),
                field: "status",
                align: "start",
                isFiltered: colFilters.statuses.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, statuses: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'online', label: t("online"), dot: "bg-emerald-500" },
                      { key: 'offline', label: t("offline"), dot: "bg-slate-400" }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.statuses.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            statuses: toggleArrayItem(prev.statuses, item.key)
                          }))}
                        />
                        <div className="flex items-center gap-1.5">
                          <span className={cn("size-2 rounded-full", item.dot)} />
                          <span>{item.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )
              })}
            </tr>
          </thead>

          {filteredUsers.length === 0 ? (
            <tbody className="divide-y divide-border/20">
              <tr>
                <td colSpan={9} className="py-16 text-center text-muted-foreground text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="size-6 text-muted-foreground/60" />
                    <span>{t("noUsersFound")}</span>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="mt-1 text-xs text-primary hover:underline cursor-pointer"
                      >
                        {t("clearAllFilters")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              const wf = user.workingFormat || { office: 25, factory: 25, mission: 25, leave: 25 };
              const departmentKey = user.department || 'engineering';
              let departmentName = departmentKey;
              try {
                departmentName = t.has(`departments.${departmentKey}`) ? t(`departments.${departmentKey}`) : departmentKey;
              } catch {
                departmentName = departmentKey;
              }

              const isAccordionOpen = activeAccordion?.userId === user.id;
              const isTrayOpen = openTrayUserId === user.id;
              const isRowActive = isAccordionOpen || isTrayOpen;

              // Determine unclipped location badge (color & localized label)
              const getLocationBadge = () => {
                const loc = user.workLocation?.toLowerCase();
                if (loc === 'factory') return { colorClass: 'bg-[#3b82f6]', label: t("factory") };
                if (loc === 'mission') return { colorClass: 'bg-[#f59e0b]', label: t("mission") };
                if (loc === 'leave') return { colorClass: 'bg-[#94a3b8]', label: t("leave") };
                if (loc === 'remote') return { colorClass: 'bg-purple-500', label: t("workLocationRemote") };
                if (loc === 'office') return { colorClass: 'bg-[#22c55e]', label: t("office") };

                if (wf) {
                  const entries = Object.entries(wf) as [string, number][];
                  entries.sort((a, b) => b[1] - a[1]);
                  const dominant = entries[0]?.[0];
                  if (dominant === 'factory') return { colorClass: 'bg-[#3b82f6]', label: t("factory") };
                  if (dominant === 'mission') return { colorClass: 'bg-[#f59e0b]', label: t("mission") };
                  if (dominant === 'leave') return { colorClass: 'bg-[#94a3b8]', label: t("leave") };
                  if (dominant === 'office') return { colorClass: 'bg-[#22c55e]', label: t("office") };
                }

                const isCurrentForLoc = checkIsCurrentUser(user);
                const isOnlineForLoc = isCurrentForLoc || user.status === 'online' || Boolean(user.isOnline);
                if (!isOnlineForLoc) {
                  return { colorClass: 'bg-slate-400', label: t("offline") };
                }

                return { colorClass: 'bg-[#22c55e]', label: t("office") };
              };
              const locationBadge = getLocationBadge();

              const enName = (user.firstName || user.lastName)
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : (user.fullName || user.name || user.email?.split('@')[0] || "-");

              const faName = (user.firstNameFa || user.lastNameFa)
                ? `${user.firstNameFa || ''} ${user.lastNameFa || ''}`.trim()
                : (user.fullNameFa || user.name || enName);

              const userDisplayName = formatPersonName(isRtl ? faName : enName, locale);

              const getEducationLabel = () => {
                const deg = user.educationDegree;
                const degTitle = deg ? resolveDegreeLabel(deg, locale) : "";
                const field = user.educationField?.trim();
                if (degTitle && field) return `${degTitle} (${field})`;
                return degTitle || field || (isRtl ? "مدرک ثبت نشده" : "Degree not set");
              };
              const educationText = getEducationLabel();

              // Initial letter tailored to current locale (Persian vs English)
              const getInitialLetter = () => {
                if (isRtl) {
                  if (user.firstNameFa?.trim()) return user.firstNameFa.trim().charAt(0);
                  const match = userDisplayName.match(/[\u0600-\u06FF]/);
                  return match ? match[0] : (userDisplayName.trim().charAt(0) || "ک");
                } else {
                  if (user.firstName?.trim()) return user.firstName.trim().charAt(0).toUpperCase();
                  const match = userDisplayName.match(/[a-zA-Z]/);
                  return match ? match[0].toUpperCase() : (userDisplayName.trim().charAt(0) || "U").toUpperCase();
                }
              };
              const userInitial = getInitialLetter();
              const avatarBg = getUserAvatarColor(user);

              return (
                <tbody
                  key={user.id}
                  className="group/row"
                >
                    
                    {/* ── 1. Main User Data Row ── */}
                    <tr
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenTrayUserId(prev => prev === user.id ? null : user.id);
                        if (activeAccordion && activeAccordion.userId !== user.id) {
                          setActiveAccordion(null);
                        }
                      }}
                      className={cn(
                        "transition-colors duration-150 group cursor-pointer",
                        isRowActive
                          ? "bg-primary/[0.08] dark:bg-primary/20 [&>td]:border-b [&>td]:border-primary/25 dark:[&>td]:border-primary/35 [&>td]:relative [&>td]:z-20"
                          : "bg-card hover:bg-slate-50/80 dark:hover:bg-slate-800/40 [&>td]:border-b [&>td]:border-border/30"
                      )}
                    >
                      {/* Column 1: User (خط اول: نام بولد / خط دوم: مدرک تحصیلی) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar with unclipped location tag (ring removed) */}
                          <div className="relative size-9 shrink-0 rounded-full flex items-center justify-center">
                            {user.avatar || (user as any).photoUrl || (user as any).imageUrl ? (
                              <img
                                src={user.avatar || (user as any).photoUrl || (user as any).imageUrl}
                                alt={userDisplayName}
                                className="size-full rounded-full object-cover select-none shadow-xs border border-white/20 dark:border-white/10"
                              />
                            ) : (
                              <div 
                                className="size-full rounded-full flex items-center justify-center select-none shadow-xs text-white font-bold text-xs border border-white/20 dark:border-white/10"
                                style={{ backgroundColor: avatarBg }}
                              >
                                <span className="leading-none">{userInitial}</span>
                              </div>
                            )}
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-background z-10 pointer-events-none shadow-2xs transition-colors",
                                locationBadge.colorClass
                              )}
                              title={`${t("workLocationLabel")}: ${locationBadge.label}`}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-foreground truncate max-w-[170px] leading-snug">
                              {userDisplayName}
                            </span>
                            <span 
                              className="text-[11px] text-muted-foreground truncate max-w-[170px] font-normal leading-tight mt-0.5"
                              title={educationText}
                            >
                              {educationText}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: EXT (ستون مستقل بعد از اسم - فقط یک تگ عددی شیک) */}
                      <td className="py-3 px-3 text-center align-middle">
                        {user.extensionNumber ? (
                          <span 
                            className={cn(
                              "inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs",
                              isRtl && "fa-num"
                            )}
                            dir="ltr"
                          >
                            {user.extensionNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 font-mono">-</span>
                        )}
                      </td>

                      {/* Column 3: Department & Title (دپارتمان و سمت سازمانی) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate max-w-[150px] leading-snug">
                            {departmentName}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[150px] font-normal leading-tight mt-0.5">
                            {formatRoleName(user.jobTitle || t("userRole"), locale)}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Contact (خط اول: شماره تلفن / خط دوم زیر آن: ایمیل) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        <div className="flex flex-col min-w-0">
                          {user.phone ? (
                            <span className={cn("text-xs font-bold text-foreground font-mono leading-snug", isRtl && "fa-num")} dir="ltr">
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-normal leading-snug">-</span>
                          )}
                          {user.email ? (
                            <a
                              href={`mailto:${user.email}`}
                              onClick={(e) => e.stopPropagation()}
                              dir="ltr"
                              className="text-[11px] text-muted-foreground hover:text-primary transition-colors truncate max-w-[170px] font-normal leading-tight mt-0.5"
                            >
                              {user.email}
                            </a>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-normal mt-0.5">-</span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Company & Role (خط اول: کمپانی بولد / خط دوم: نقش کمرنگ) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        {(() => {
                          const comp = getCompanyFromEmail(user.email);
                          return (
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-foreground truncate max-w-[140px] leading-snug">
                                {isRtl ? comp.nameFa : comp.nameEn}
                              </span>
                              <span className="text-[11px] text-muted-foreground truncate max-w-[140px] font-normal leading-tight mt-0.5">
                                {getRoleLabel(user.role)}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Column 5: Projects & Experience (خط اول: پروژه‌ها بولد / خط دوم: عدد و تجربه کمرنگ بدون آیکون) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        <div className="flex flex-col min-w-0">
                          <span className={cn("text-xs font-bold text-foreground leading-snug", isRtl && "fa-num")}>
                            {user.doneProjects || 0} {isRtl ? "پروژه" : t("projectsCol")}
                          </span>
                          <span className={cn("text-[11px] text-muted-foreground font-normal leading-tight mt-0.5", isRtl && "fa-num")}>
                            {user.score || 350} {isRtl ? "تجربه" : "Exp"}
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Tenure (سابقه) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        <div className="flex flex-col min-w-0">
                          <span className={cn("text-xs font-bold text-foreground font-mono leading-snug", isRtl && "fa-num")}>
                            {user.daysInCompany || 0}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-normal leading-tight mt-0.5">
                            {isRtl ? "روز سابقه" : t("daysUnit")}
                          </span>
                        </div>
                      </td>

                      {/* Column 7: Salary (خط اول: حقوق بولد / خط دوم: ریال) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        <div className="flex flex-col min-w-0">
                          <span className={cn("font-mono text-xs font-bold text-foreground leading-snug", isRtl && "fa-num")}>
                            {showSalaries 
                              ? (user.salary || 0).toLocaleString() 
                              : "••••••••"}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-normal leading-tight mt-0.5">
                            {isRtl ? "ریال" : "IRR"}
                          </span>
                        </div>
                      </td>

                      {/* Column 8: Status (تشخیص آنلاین بودن فوق‌حرفه‌ای و زنده) */}
                      <td className="py-3 px-3.5 text-start align-middle">
                        {(() => {
                          const isCurrent = checkIsCurrentUser(user);
                          const isOnline = isCurrent || user.status === 'online' || Boolean(user.isOnline);

                          return (
                            <div className="flex items-center">
                              {isOnline ? (
                                <span
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs select-none"
                                  title={isRtl ? "کاربر هم‌اکنون در سامانه آنلاین و فعال است" : "User is active and online in the system"}
                                >
                                  <span className="relative flex size-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                                  </span>
                                  <span>{t("online")}</span>
                                  <span className="text-[11px] font-normal opacity-90 fa-num">
                                    ({formatOnlineDuration(user.onlineSince || user.lastSeenAt, isRtl)})
                                  </span>
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/70 text-muted-foreground border border-border/60 select-none"
                                  title={user.lastSeenAt ? (isRtl ? `آخرین فعالیت: ${formatLastSeen(user.lastSeenAt, isRtl)}` : `Last active: ${formatLastSeen(user.lastSeenAt, isRtl)}`) : undefined}
                                >
                                  <span className="size-2 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                                  <span>{t("offline")}</span>
                                  {user.lastSeenAt && (
                                    <span className="text-[11px] opacity-80 fa-num">
                                      ({formatLastSeen(user.lastSeenAt, isRtl)})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>

                    {/* ── 2. Paper Pull-out & Folder Tab (سمت راست در فارسی، سمت چپ در انگلیسی) ── */}
                    <tr className="border-0 relative z-0">
                      <td colSpan={9} className="p-0 border-0">
                        <div 
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                            isAccordionOpen || isTrayOpen
                              ? "grid-rows-[1fr] opacity-100" 
                              : "grid-rows-[0fr] opacity-0 pointer-events-none"
                          )}
                        >
                          <div className="overflow-hidden min-h-0">
                            <div 
                              className={cn(
                                "w-full flex flex-col px-3 sm:px-4 relative",
                                isRtl ? "items-end" : "items-start",
                                isAccordionOpen ? "pb-4" : "pb-2.5"
                              )} 
                              dir="ltr"
                            >
                              {/* ── Fixed Continuous Bottom Shadow across the whole row ── */}
                              <div className="w-full h-1.5 bg-gradient-to-b from-slate-900/[0.06] dark:from-black/30 to-transparent pointer-events-none absolute top-0 inset-x-0 z-10" />

                          {/* ── A. Content Container on Top (فول واید هم‌اندازه سطر، بدون فیلت در بالا) ── */}
                          <AnimatePresence initial={false}>
                            {isAccordionOpen && activeAccordion && (
                              <TableAccordionPanel
                                key={`acc-panel-${user.id}`}
                                activeType={activeAccordion.type}
                                isRtl={isRtl}
                              >
                                {/* ── Mode A: View Details (اطلاعات کامل و جامع کاربر) ── */}
                                {activeAccordion.type === 'view' && (() => {
                                  const comp = getCompanyFromEmail(user.email);
                                  return (
                                    <div className="flex flex-col gap-3.5">
                                      {/* Top Header Bar */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                                        <div className="flex items-center gap-3">
                                          {user.avatar || (user as any).photoUrl || (user as any).imageUrl ? (
                                            <img
                                              src={user.avatar || (user as any).photoUrl || (user as any).imageUrl}
                                              alt={user.name || "User"}
                                              className="size-10 rounded-2xl object-cover shrink-0 shadow-xs border border-border/50"
                                            />
                                          ) : (
                                            <div 
                                              className="size-10 rounded-2xl flex items-center justify-center font-medium text-sm text-white shrink-0 shadow-xs"
                                              style={{ backgroundColor: user.avatarColor || '#0284c7' }}
                                            >
                                              {user.name ? user.name.slice(0, 2) : "US"}
                                            </div>
                                          )}
                                          <div className="flex flex-col">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <h4 className="text-sm font-medium text-foreground">
                                                {user.name}
                                              </h4>
                                              <Badge variant="outline" className="text-[10px] h-5 font-mono bg-muted/60 text-muted-foreground border-border/50">
                                                #{user.id}
                                              </Badge>
                                              <Badge 
                                                variant="secondary"
                                                className={cn(
                                                  "text-[10px] h-5 font-medium whitespace-nowrap",
                                                  comp.id === "npceram"
                                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                                                    : comp.id === "holding"
                                                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                                                    : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                                                )}
                                              >
                                                {isRtl ? comp.nameFa : comp.nameEn}
                                              </Badge>
                                              <Badge 
                                                variant="secondary"
                                                className={cn(
                                                  "text-[10px] h-5 font-semibold",
                                                  user.role === 'superadmin'
                                                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35 font-bold"
                                                  : user.role === 'admin'
                                                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35 font-bold"
                                                  : user.role === 'dept_admin'
                                                    ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25"
                                                  : user.role === 'office_admin'
                                                    ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25"
                                                    : user.role === 'manager'
                                                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25"
                                                    : user.role === 'engineer'
                                                    ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25"
                                                    : user.role === 'staff'
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                                                    : user.role === 'customer'
                                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25"
                                                    : "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25"
                                                )}
                                              >
                                                {getRoleLabel(user.role)}
                                              </Badge>
                                              {(() => {
                                                const isCurrent = checkIsCurrentUser(user);
                                                const isOnline = isCurrent || user.status === 'online' || Boolean(user.isOnline);

                                                return (
                                                  <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    {isOnline ? (
                                                      <>
                                                        <span className="relative flex size-2 shrink-0">
                                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                          <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                                                        </span>
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t("online")}</span>
                                                        <span className="text-[10px] text-muted-foreground/80 fa-num">({formatOnlineDuration(user.onlineSince || user.lastSeenAt, isRtl)})</span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <span className="size-2 rounded-full bg-slate-400 shrink-0" />
                                                        <span>{t("offline")}</span>
                                                        {user.lastSeenAt && (
                                                          <span className="text-[9px] text-muted-foreground/80">
                                                            ({formatLastSeen(user.lastSeenAt, isRtl)})
                                                          </span>
                                                        )}
                                                      </>
                                                    )}
                                                  </span>
                                                );
                                              })()}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate" dir="ltr">
                                              {user.email}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                                          <button
                                            type="button"
                                            onClick={() => handleCreateEditRequest(user)}
                                            disabled={creatingReqUserId === user.id}
                                            className={cn(
                                              "h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all shadow-2xs",
                                              "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25",
                                              creatingReqUserId === user.id && "opacity-70 pointer-events-none"
                                            )}
                                            title={isRtl ? "ویرایش مشخصات کاربر" : "Edit User Profile"}
                                            aria-label={isRtl ? "ویرایش مشخصات کاربر" : "Edit User Profile"}
                                          >
                                            {creatingReqUserId === user.id ? (
                                              <RotateCw className="size-3.5 animate-spin" />
                                            ) : (
                                              <Edit2 className="size-3.5" />
                                            )}
                                            <span className="hidden sm:inline">{isRtl ? "ویرایش" : "Edit"}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSelectAndGoHome(user)}
                                            className="size-8 rounded-xl flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                                            title={t("viewInDashboard")}
                                            aria-label={t("viewInDashboard")}
                                          >
                                            <LayoutDashboard size={14} className="shrink-0" />
                                          </button>
                                          <button 
                                            type="button"
                                            onClick={() => setActiveAccordion(null)}
                                            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                                            title={t("cancel")}
                                          >
                                            <X size={15} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* 4 Clean Dossier Cards */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                        {/* Card 1: Identity & Contact */}
                                        <div className="flex flex-col p-3 rounded-2xl bg-background/70 dark:bg-slate-800/60 border border-border/50 shadow-xs">
                                          <div className="pb-2 mb-2 border-b border-border/40">
                                            <span className="font-medium text-xs text-foreground/80">{t("identityInfo")}</span>
                                          </div>
                                          <div className="space-y-2">
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("nationalIdLabel")}</span>
                                              <span className="font-normal text-foreground fa-num">{user.nationalId || "0012345678"}</span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("phoneLabel")}</span>
                                              <span className="font-normal text-foreground fa-num" dir="ltr">{user.phone || "09120000000"}</span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("email")}</span>
                                              <span className="font-normal text-foreground/90 truncate block text-[11px]" dir="ltr">{user.email}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Card 2: Organization & Position */}
                                        <div className="flex flex-col p-3 rounded-2xl bg-background/70 dark:bg-slate-800/60 border border-border/50 shadow-xs">
                                          <div className="pb-2 mb-2 border-b border-border/40">
                                            <span className="font-medium text-xs text-foreground/80">{t("orgInfo")}</span>
                                          </div>
                                          <div className="space-y-2">
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("department")}</span>
                                              <span className="font-normal text-foreground truncate block">
                                                {t.has(`departments.${user.department}`) ? t(`departments.${user.department}`) : user.department}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("jobTitle")}</span>
                                              <span className="font-normal text-foreground truncate block">{user.jobTitle || t("unspecified")}</span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("workLocationLabel")}</span>
                                              <span className="font-normal text-foreground">
                                                {user.workLocation === 'factory' ? t("workLocationFactory") : user.workLocation === 'remote' ? t("workLocationRemote") : t("workLocationOffice")}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("managerDirectLabel")}</span>
                                              <span className="font-normal text-foreground truncate block">{user.manager || t("unspecified")}</span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("directSubordinatesTitle")}</span>
                                              <span className="font-normal text-foreground truncate block fa-num">
                                                {(() => {
                                                  const directReports = users.filter((u) => 
                                                    (user.subordinates && user.subordinates.includes(u.id)) ||
                                                    (u.manager && (u.manager.includes(user.name) || (user.employeeId && u.manager.includes(user.employeeId))))
                                                  );
                                                  if (directReports.length === 0) {
                                                    return <span className="text-muted-foreground">{isRtl ? "فاقد پرسنل زیردست" : "No direct reports"}</span>;
                                                  }
                                                  return (
                                                    <span className="text-primary font-semibold">
                                                      {directReports.length} {isRtl ? "نفر تحت امر" : "reports"}
                                                      {" ("}
                                                      {directReports.slice(0, 2).map(r => r.name).join("، ")}
                                                      {directReports.length > 2 ? "..." : ""}
                                                      {")"}
                                                    </span>
                                                  );
                                                })()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Card 3: Performance, Tenure & Salary */}
                                        <div className="flex flex-col p-3 rounded-2xl bg-background/70 dark:bg-slate-800/60 border border-border/50 shadow-xs">
                                          <div className="pb-2 mb-2 border-b border-border/40">
                                            <span className="font-medium text-xs text-foreground/80">{t("statsInfo")}</span>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-muted-foreground/75 font-normal">{t("tenureCol")}</span>
                                              <span className="font-normal text-foreground fa-num">
                                                {user.daysInCompany || 0} {t("daysUnit")}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-muted-foreground/75 font-normal">{t("projectsCol")}</span>
                                              <span className="font-normal text-foreground fa-num">
                                                {user.doneProjects || 0}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-muted-foreground/75 font-normal">{t("score")}</span>
                                              <span className="font-normal text-emerald-600 dark:text-emerald-400 fa-num">
                                                {user.score || 90} / 100
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-muted-foreground/75 font-normal">{t("salary")}</span>
                                              <span className="font-normal text-foreground fa-num">
                                                {(user.salary || 0).toLocaleString()} {isRtl ? "ریال" : "IRR"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Card 4: Personal, Education & Insurance */}
                                        <div className="flex flex-col p-3 rounded-2xl bg-background/70 dark:bg-slate-800/60 border border-border/50 shadow-xs">
                                          <div className="pb-2 mb-2 border-b border-border/40">
                                            <span className="font-medium text-xs text-foreground/80">{t("personalInfo")}</span>
                                          </div>
                                          <div className="space-y-2">
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("userAge")} / {t("maritalStatus")}</span>
                                              <span className="font-normal text-foreground fa-num">
                                                {user.age || 32} {t("daysUnit") === "روز" ? "سال" : "yrs"} • {user.maritalStatus === 'married' ? t("married") : t("single")} ({user.childrenCount ?? 0} {t("child")})
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("insuranceTypeLabel")}</span>
                                              <span className="font-normal text-foreground">
                                                {user.insuranceType === 'complementary' ? t("insuranceOptions.complementary") : user.insuranceType === 'none' ? t("insuranceOptions.none") : t("insuranceOptions.socialSecurity")}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] text-muted-foreground/75 font-normal block">{t("education")}</span>
                                              <span className="font-normal text-foreground truncate block">
                                                {user.educationDegree || t("degreesOptions.master")} - {user.educationField || user.education || t("defaultEducationField")}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* ── Mode B: Change Password & Resend Credentials (تغییر رمز عبور و ارسال رمز فعلی) ── */}
                                {activeAccordion.type === 'password' && (
                                  <div className="flex flex-col gap-3.5">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                                      <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                          <KeyRound size={17} />
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-foreground">
                                            {isRtl ? "مدیریت و بازنشانی رمز عبور" : "Password Management"} — {userDisplayName}
                                          </h4>
                                          <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {isRtl ? "مشاهده رمز فعلی، ارسال به ایمیل کاربر در قالب سازمانی و یا تعیین رمز جدید" : "View current credentials, dispatch corporate email, or set a new password"}
                                          </p>
                                        </div>
                                      </div>
                                      <button 
                                        type="button"
                                        onClick={() => setActiveAccordion(null)}
                                        className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                                        title={t("cancel")}
                                      >
                                        <X size={15} />
                                      </button>
                                    </div>

                                    {/* Section 1: Current Password & Direct Email Dispatch Option */}
                                    <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                          <Lock size={16} />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="text-[11px] font-medium text-muted-foreground block">
                                            {isRtl ? "کلمه عبور فعلی کاربر در سامانه:" : "Current Password on File:"}
                                          </span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="font-mono text-xs font-bold text-foreground tracking-wider select-all" dir="ltr">
                                              {user.password
                                                ? (showCurrentPassword ? user.password : "••••••••••••")
                                                : (isRtl ? "در حال دریافت / پیش‌فرض" : "Default / Fetching...")}
                                            </span>
                                            {user.password && (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
                                                  title={showCurrentPassword ? (isRtl ? "مخفی کردن" : "Hide") : (isRtl ? "نمایش رمز" : "Show")}
                                                >
                                                  {showCurrentPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(user.password || "");
                                                    toast.success(isRtl ? "رمز عبور کپی شد." : "Password copied.");
                                                  }}
                                                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
                                                  title={isRtl ? "کپی رمز" : "Copy"}
                                                >
                                                  <Copy size={13} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* THE REQUESTED OPTION: Send Current Password via Corporate Email */}
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSendCurrentPassword(user.id)}
                                        disabled={isSendingCurrentPassword || isSavingPassword}
                                        className="h-8.5 px-3.5 rounded-xl text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 gap-2 cursor-pointer shrink-0 w-full sm:w-auto transition-all"
                                      >
                                        {isSendingCurrentPassword ? (
                                          <Loader2 size={14} className="animate-spin text-amber-600" />
                                        ) : (
                                          <Mail size={14} className="text-amber-600 dark:text-amber-400" />
                                        )}
                                        <span>
                                          {isSendingCurrentPassword
                                            ? (isRtl ? "در حال ارسال ایمیل..." : "Sending Email...")
                                            : (isRtl ? "ارسال رمز فعلی به ایمیل کاربر" : "Send Current Password via Email")}
                                        </span>
                                      </Button>
                                    </div>

                                    {/* Section 2: Set New Password Form */}
                                    <form 
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSavePassword(user.id);
                                      }}
                                      autoComplete="off"
                                      className="flex flex-col gap-3 pt-1"
                                    >
                                      {/* Hidden dummy inputs to safely absorb browser password manager autofill heuristics */}
                                      <input 
                                        type="text" 
                                        name="fake_username_prevention" 
                                        tabIndex={-1} 
                                        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} 
                                        autoComplete="username" 
                                      />
                                      <input 
                                        type="password" 
                                        name="fake_password_prevention" 
                                        tabIndex={-1} 
                                        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} 
                                        autoComplete="current-password" 
                                      />

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl">
                                        <div className="space-y-1.5">
                                          <Label htmlFor={`new_pwd_${user.id}`} className="text-xs font-medium text-foreground">
                                            {t("newPassword")}
                                          </Label>
                                          <PasswordInput
                                            id={`new_pwd_${user.id}`}
                                            name={`new_pwd_${user.id}`}
                                            autoComplete="new-password"
                                            data-lpignore="true"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-9 text-xs bg-background rounded-xl border-border/50"
                                            dir="ltr"
                                          />
                                        </div>

                                        <div className="space-y-1.5">
                                          <Label htmlFor={`confirm_pwd_${user.id}`} className="text-xs font-medium text-foreground">
                                            {t("confirmPassword")}
                                          </Label>
                                          <PasswordInput
                                            id={`confirm_pwd_${user.id}`}
                                            name={`confirm_pwd_${user.id}`}
                                            autoComplete="new-password"
                                            data-lpignore="true"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-9 text-xs bg-background rounded-xl border-border/50"
                                            dir="ltr"
                                          />
                                        </div>
                                      </div>

                                      {/* Option to also email the new password upon saving */}
                                      <div className="flex items-center gap-2 pt-1">
                                        <Checkbox
                                          id={`email_new_pwd_${user.id}`}
                                          checked={sendNewPasswordEmail}
                                          onCheckedChange={(checked) => setSendNewPasswordEmail(Boolean(checked))}
                                        />
                                        <label
                                          htmlFor={`email_new_pwd_${user.id}`}
                                          className="text-xs text-foreground cursor-pointer select-none font-medium flex items-center gap-1.5"
                                        >
                                          <Mail size={13} className="text-muted-foreground" />
                                          <span>{isRtl ? `ارسال رمز جدید به ایمیل کاربر (${user.email}) پس از ذخیره` : `Email new credentials to user (${user.email}) upon save`}</span>
                                        </label>
                                      </div>

                                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setActiveAccordion(null)}
                                          disabled={isSavingPassword || isSendingCurrentPassword}
                                          className="h-8.5 px-3.5 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                          {t("cancel")}
                                        </Button>
                                        <Button
                                          type="submit"
                                          size="sm"
                                          disabled={isSavingPassword || isSendingCurrentPassword || !newPassword.trim()}
                                          className="h-8.5 px-4 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-xs transition-colors gap-1.5"
                                        >
                                          {isSavingPassword ? (
                                            <>
                                              <Loader2 size={13} className="animate-spin" />
                                              <span>{isRtl ? "در حال ذخیره..." : "Saving..."}</span>
                                            </>
                                          ) : (
                                            <>
                                              <Check size={13} />
                                              <span>{t("save")}</span>
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </form>
                                  </div>
                                )}

                                {/* ── Mode C: Quick Edit User Info (ویرایش مشخصات با استفاده از کامپوننت‌های پروژه) ── */}
                                {activeAccordion.type === 'edit' && (
                                  <div className="flex flex-col gap-3.5">
                                    <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                                      <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                          <Edit2 size={16} />
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-foreground">
                                            {t("editUserInfo")} - {user.name}
                                          </h4>
                                          <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {t("editUserDesc")}
                                          </p>
                                        </div>
                                      </div>
                                      <button 
                                        type="button"
                                        onClick={() => setActiveAccordion(null)}
                                        className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                                        title={t("cancel")}
                                      >
                                        <X size={15} />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {isRtl ? "نام انگلیسی (First Name)" : "First Name"}
                                        </Label>
                                        <Input
                                          value={editFormData.firstName || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                          dir="ltr"
                                          placeholder="e.g. Morteza"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50 text-left"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {isRtl ? "نام خانوادگی انگلیسی (Last Name)" : "Last Name"}
                                        </Label>
                                        <Input
                                          value={editFormData.lastName || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                          dir="ltr"
                                          placeholder="e.g. Shafiee"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50 text-left"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {isRtl ? "نام فارسی" : "First Name (FA)"}
                                        </Label>
                                        <Input
                                          value={editFormData.firstNameFa || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, firstNameFa: e.target.value }))}
                                          placeholder="مثلاً مرتضی"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {isRtl ? "نام خانوادگی فارسی" : "Last Name (FA)"}
                                        </Label>
                                        <Input
                                          value={editFormData.lastNameFa || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, lastNameFa: e.target.value }))}
                                          placeholder="مثلاً شفیعی"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {t("email")}
                                        </Label>
                                        <Input
                                          value={editFormData.email || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                          dir="ltr"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50 text-left"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {t("phoneLabel")}
                                        </Label>
                                        <Input
                                          value={editFormData.phone || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                                          dir="ltr"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50 text-left fa-num"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {isRtl ? "شماره داخلی (EXT)" : "Extension (EXT)"}
                                        </Label>
                                        <Input
                                          value={editFormData.extensionNumber || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, extensionNumber: e.target.value }))}
                                          dir="ltr"
                                          placeholder="101"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50 text-left fa-num"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {isRtl ? "حقوق ماهیانه (ریال)" : "Monthly Salary (IRR)"}
                                        </Label>
                                        <Input
                                          type="number"
                                          value={editFormData.salary || 0}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
                                          dir="ltr"
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50 text-left fa-num"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {t("department")}
                                        </Label>
                                        <Combobox
                                          options={departmentOptions}
                                          value={editFormData.department || "engineering"}
                                          onChange={(val) => setEditFormData(prev => ({ ...prev, department: val }))}
                                          allowClear={false}
                                          size="sm"
                                          triggerClassName="w-full justify-between h-8.5 rounded-xl bg-background border-border/50 text-xs"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {t("role")}
                                        </Label>
                                        <Combobox
                                          options={roleOptions}
                                          value={editFormData.role || "user"}
                                          onChange={(val) => setEditFormData(prev => ({ ...prev, role: val as any }))}
                                          allowClear={false}
                                          size="sm"
                                          disabled={!canEditModuleAccess}
                                          triggerClassName="w-full justify-between h-8.5 rounded-xl bg-background border-border/50 text-xs"
                                        />
                                      </div>

                                      <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-xs font-medium text-foreground">
                                          {t("jobTitle")}
                                        </Label>
                                        <Input
                                          value={editFormData.jobTitle || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                          className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveAccordion(null)}
                                        className="h-8.5 px-3.5 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                      >
                                        {t("cancel")}
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveEdit(user.id)}
                                        className="h-8.5 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs transition-colors"
                                      >
                                        {t("save")}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* ── Mode R: Role Assignment (تعیین رول - منحصراً سوپر ادمین) ── */}
                                {activeAccordion.type === 'role' && (() => {
                                  const currentRoleObj = ORDERED_ROLES.find(r => r.value === (user.role || 'user')) || ORDERED_ROLES[7];
                                  return (
                                    <div className="flex flex-col gap-3.5">
                                      <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                                        <div className="flex items-center gap-2.5">
                                          <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                            <UserCog size={18} />
                                          </div>
                                          <div>
                                            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                              <span>{isRtl ? "تعیین رول و سطح دسترسی سازمانی" : "Role Assignment & Organization Scope"}</span>
                                              <span className="text-[11px] font-normal text-muted-foreground">({user.name})</span>
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                              {isRtl
                                                ? "تعیین رول فقط توسط مدیر ارشد سیستم (Super Admin) قابل تغییر است و برای بقیه قفل است."
                                                : "Role assignment is strictly restricted to Super Admin and locked for other roles."}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {!isSuperAdmin && (
                                            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 gap-1">
                                              <Lock size={11} />
                                              <span>{isRtl ? "قفل (فقط سوپر ادمین)" : "Locked (Super Admin Only)"}</span>
                                            </Badge>
                                          )}
                                          <Badge variant="secondary" className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", currentRoleObj.badgeClass)}>
                                            {isRtl ? currentRoleObj.labelFa : currentRoleObj.labelEn}
                                          </Badge>

                                          <button
                                            type="button"
                                            onClick={() => setActiveAccordion(null)}
                                            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                                            title={t("cancel")}
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      </div>

                                      {!isSuperAdmin ? (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground text-xs">
                                          <Lock size={18} className="text-rose-500 shrink-0" />
                                          <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-foreground">
                                              {isRtl ? "عدم دسترسی به تعیین رول" : "Access Denied"}
                                            </span>
                                            <span>
                                              {isRtl
                                                ? "تعیین رول فقط توسط سوپر ادمین قابل تغییر است و برای سایر نقش‌ها قفل می‌باشد."
                                                : "Role assignment is strictly restricted to Super Admin and locked for other roles."}
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col gap-3">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                            {ORDERED_ROLES.map((roleItem) => {
                                              const isCurrent = (user.role || 'user') === roleItem.value;
                                              const isSelected = selectedRoleForUser === roleItem.value;
                                              const RoleIcon = roleItem.icon;
                                              return (
                                                <button
                                                  key={roleItem.value}
                                                  type="button"
                                                  onClick={() => setSelectedRoleForUser(roleItem.value)}
                                                  className={cn(
                                                    "flex flex-col text-right p-3 rounded-xl border transition-all cursor-pointer relative",
                                                    isSelected
                                                      ? "bg-purple-500/10 border-purple-500 ring-1 ring-purple-500/30 shadow-xs"
                                                      : "bg-background/80 hover:bg-muted/50 border-border/60"
                                                  )}
                                                >
                                                  <div className="flex items-center justify-between w-full mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                      <div className={cn("size-6 rounded-lg flex items-center justify-center text-white text-[10px]", roleItem.iconBg)}>
                                                        <RoleIcon size={13} />
                                                      </div>
                                                      <span className="text-xs font-bold text-foreground">
                                                        {isRtl ? roleItem.labelFa : roleItem.labelEn}
                                                      </span>
                                                    </div>
                                                    {isCurrent && (
                                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground">
                                                        {isRtl ? "فعلی" : "Current"}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {isRtl ? roleItem.descFa : roleItem.descEn}
                                                  </p>
                                                </button>
                                              );
                                            })}
                                          </div>

                                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setActiveAccordion(null)}
                                              className="h-8.5 px-3.5 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                              {t("cancel")}
                                            </Button>
                                            <Button
                                              type="button"
                                              size="sm"
                                              disabled={isSavingRole || selectedRoleForUser === user.role}
                                              onClick={() => handleSaveRole(user.id, selectedRoleForUser)}
                                              className="h-8.5 px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-colors"
                                            >
                                              {isSavingRole ? (
                                                <RotateCcw className="size-3.5 animate-spin" />
                                              ) : (
                                                <Check className="size-3.5" />
                                              )}
                                              <span>{isRtl ? "ذخیره نقش" : "Save Role"}</span>
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* ── Mode D: Module Access (دسترسی ماژول‌ها همراه با زیرگزینه‌ها) ── */}
                                {activeAccordion.type === 'access' && (() => {
                                  const availableGroups = NAVIGATION.filter(n => n.id !== "main" && n.id !== "dashboard");
                                  const totalSubItemsCount = availableGroups.reduce((acc, g) => acc + (g.items?.length || 1), 0);
                                  const activeSubItemsCount = availableGroups.reduce((acc, g) => {
                                    if (g.items && g.items.length > 0) {
                                      return acc + g.items.filter(it => user.modulesAccess?.some(m => m.moduleId === it.href && m.hasAccess)).length;
                                    }
                                    return acc + (user.modulesAccess?.some(m => m.moduleId === g.id && m.hasAccess) ? 1 : 0);
                                  }, 0);

                                  return (
                                    <div className="flex flex-col gap-3.5">
                                      <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                                        <div className="flex items-center gap-2.5">
                                          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                            <ShieldCheck size={18} />
                                          </div>
                                          <div>
                                            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                              <span>{t("moduleAccess")}</span>
                                              <span className="text-[11px] font-normal text-muted-foreground">({user.name})</span>
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                              {t("changeUserAccess")}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {currentUser?.role === 'office_admin' && (
                                            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                                              {isRtl ? "فقط‌خواندنی (مدیر اداری)" : "Read-Only (Office Admin)"}
                                            </Badge>
                                          )}
                                          {(user.role === 'admin' || user.role === 'superadmin') ? (
                                            <Badge variant="secondary" className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                              {isRtl ? "دسترسی کامل" : "Full Access"}
                                            </Badge>
                                          ) : (
                                            <Badge variant="secondary" className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 fa-num">
                                              {activeSubItemsCount} / {totalSubItemsCount} {t("activeStatus")}
                                            </Badge>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => setActiveAccordion(null)}
                                            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                                            title={t("cancel")}
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Rule: For Admins, show Full Access without checkboxes */}
                                      {(user.role === 'admin' || user.role === 'superadmin') ? (
                                        <div className="flex flex-col items-center justify-center py-10 px-6 bg-emerald-500/[0.04] dark:bg-emerald-950/20 border border-emerald-500/25 rounded-2xl text-center shadow-2xs">
                                          <div className="size-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3.5 shadow-2xs">
                                            <ShieldCheck size={32} />
                                          </div>
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-2">
                                            <Sparkles size={14} />
                                            <span>{isRtl ? "دسترسی کامل سازمانی" : "Full Organizational Access"}</span>
                                          </div>
                                          <h3 className="text-sm font-bold text-foreground mb-1.5">
                                            {isRtl ? "دسترسی کامل (Full Access)" : "Full System Access"}
                                          </h3>
                                          <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                                            {isRtl
                                              ? "مدیران سیستم به طور پیش‌فرض و نامحدود به تمامی ماژول‌ها، ابزارها و بخش‌های سازمان دسترسی کامل دارند و نیازی به انتخاب موردی ماژول‌ها نیست."
                                              : "System Administrators have comprehensive and unrestricted access to all organizational modules and tools. Individual module selection is not required."}
                                          </p>
                                        </div>
                                      ) : (
                                      /* Modern, Clean & Complete Module Cards Grid with All Sub-Items */
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto custom-scrollbar p-1">
                                        {availableGroups.map(group => {
                                          const items = group.items || [];
                                          const activeItemsInGroup = items.filter(it => 
                                            user.modulesAccess?.some(m => m.moduleId === it.href && m.hasAccess)
                                          );
                                          const isGroupFullyActive = items.length > 0 
                                            ? activeItemsInGroup.length === items.length
                                            : Boolean(user.modulesAccess?.find(m => m.moduleId === group.id)?.hasAccess);
                                          const isGroupPartiallyActive = items.length > 0 && activeItemsInGroup.length > 0 && !isGroupFullyActive;

                                          let label = group.id;
                                          try {
                                            label = tMenu(`sections.${group.labelKey}` as any) || group.id;
                                          } catch {
                                            label = group.id;
                                          }

                                          const GroupIcon = group.icon;

                                          return (
                                            <div
                                              key={group.id}
                                              className={cn(
                                                "flex flex-col justify-between p-3.5 rounded-2xl border transition-colors select-none bg-white dark:bg-card shadow-2xs",
                                                isGroupFullyActive || isGroupPartiallyActive
                                                  ? "border-emerald-500/35 ring-1 ring-emerald-500/15"
                                                  : "border-border/60 hover:border-border"
                                              )}
                                            >
                                              {/* Group Header */}
                                              <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-border/40">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                  <div className={cn(
                                                    "size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                    isGroupFullyActive || isGroupPartiallyActive
                                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                                                      : "bg-muted text-muted-foreground"
                                                  )}>
                                                    {GroupIcon ? <GroupIcon size={16} weight="duotone" /> : <ShieldCheck size={16} />}
                                                  </div>
                                                  <div className="min-w-0">
                                                    <span className="text-xs font-bold text-foreground block truncate" title={label}>
                                                      {label}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground fa-num">
                                                      {activeItemsInGroup.length} / {items.length} {t("moduleActiveBadge")}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                  <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                                                    {isGroupFullyActive ? t("revokeAccess") : t("grantAccess")}
                                                  </span>
                                                  <Switch
                                                    size="sm"
                                                    checked={isGroupFullyActive}
                                                    disabled={!canEditModuleAccess}
                                                    onCheckedChange={(checked) => handleToggleUserAccess(user.id, group.id, checked)}
                                                    className={cn(isGroupPartiallyActive && "opacity-85 ring-1 ring-emerald-500/40")}
                                                  />
                                                </div>
                                              </div>

                                              {/* Sub-Items List */}
                                              <div className="flex flex-col gap-1.5 pt-2.5">
                                                {items.map((item) => {
                                                  const ItemIcon = item.icon;
                                                  const isAlwaysOpenItem = item.href === '/dictionary' || item.href === '/did-you-know' || item.href === '/aparat' || group.id === 'knowledge';
                                                   const hasItemAccess = isAlwaysOpenItem
                                                     ? (user.modulesAccess?.find(m => m.moduleId === item.href)?.hasAccess ?? true)
                                                     : (user.modulesAccess?.some(m => m.moduleId === item.href && m.hasAccess) ?? false);

                                                  let itemLabel = item.labelKey;
                                                  try {
                                                    itemLabel = tMenu(`items.${item.labelKey}` as any) || item.labelKey;
                                                  } catch {
                                                    itemLabel = item.labelKey;
                                                  }

                                                  return (
                                                    <div
                                                      key={item.href}
                                                      onClick={() => {
                                                        if (currentUser?.role === 'office_admin') {
                                                          toast.error(isRtl ? "مدیر اداری مجاز به تغییر دسترسی‌های ماژول‌ها نمی‌باشد." : "Office admin cannot change module permissions.");
                                                          return;
                                                        }
                                                        handleToggleUserAccess(user.id, item.href, !hasItemAccess);
                                                      }}
                                                      className={cn(
                                                        "flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer select-none text-xs",
                                                        hasItemAccess
                                                          ? "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] border-emerald-500/25 text-foreground"
                                                          : "bg-muted/30 dark:bg-muted/15 border-border/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/60"
                                                      )}
                                                    >
                                                      <div className="flex items-center gap-2 min-w-0">
                                                        <div className={cn(
                                                          "size-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                          hasItemAccess
                                                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                            : "bg-muted text-muted-foreground"
                                                        )}>
                                                          {ItemIcon ? <ItemIcon size={13} weight="duotone" /> : <Layers size={13} />}
                                                        </div>
                                                        <span className="font-medium truncate text-xs" title={itemLabel}>
                                                          {itemLabel}
                                                        </span>
                                                      </div>

                                                      <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center gap-2">
                                                        <span className={cn(
                                                          "text-[10px] font-medium hidden sm:inline-block",
                                                          hasItemAccess ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                                        )}>
                                                          {hasItemAccess ? t("activeStatus") : t("inactiveStatus")}
                                                        </span>
                                                        <Switch
                                                          size="sm"
                                                          checked={hasItemAccess}
                                                          disabled={!canEditModuleAccess}
                                                          onCheckedChange={(checked) => handleToggleUserAccess(user.id, item.href, checked)}
                                                        />
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* ── Mode E: Documents & Verification (مدارک و تأیید مدارک پرسنل - زیر هم و ساده) ── */}
                                {activeAccordion.type === 'documents' && (() => {
                                  const userDocs: UserUploadedDocument[] = user.documents && user.documents.length > 0 ? user.documents : [
                                    {
                                      id: `doc-${user.id}-1`,
                                      category: "national_card_front",
                                      title: isRtl ? "تصویر روی کارت ملی" : "National ID Card (Front)",
                                      fileName: "national_card_front.jpg",
                                      fileSize: "1.4 MB",
                                      fileType: "image/jpeg",
                                      fileData: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'><rect width='600' height='380' rx='20' fill='%230284c7'/><text x='300' y='190' font-size='22' fill='white' text-anchor='middle' font-family='sans-serif'>${encodeURIComponent((user.name || "پرسنل") + " - روی کارت ملی")}</text></svg>`,
                                      uploadedAt: "2026-10-28T07:45:00.000Z",
                                      verified: true,
                                    },
                                    {
                                      id: `doc-${user.id}-2`,
                                      category: "national_card_back",
                                      title: isRtl ? "تصویر پشت کارت ملی" : "National ID Card (Back)",
                                      fileName: "national_card_back.jpg",
                                      fileSize: "1.2 MB",
                                      fileType: "image/jpeg",
                                      fileData: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'><rect width='600' height='380' rx='20' fill='%23059669'/><text x='300' y='190' font-size='22' fill='white' text-anchor='middle' font-family='sans-serif'>${encodeURIComponent((user.name || "پرسنل") + " - پشت کارت ملی")}</text></svg>`,
                                      uploadedAt: "2026-10-28T07:46:00.000Z",
                                      verified: true,
                                    },
                                    {
                                      id: `doc-${user.id}-3`,
                                      category: "university_degree",
                                      title: isRtl ? "تصویر آخرین مدرک دانشگاهی" : "Latest University Degree",
                                      fileName: "degree_certificate.jpg",
                                      fileSize: "2.3 MB",
                                      fileType: "image/jpeg",
                                      fileData: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380' viewBox='0 0 600 380'><rect width='600' height='380' rx='20' fill='%237c3aed'/><text x='300' y='190' font-size='22' fill='white' text-anchor='middle' font-family='sans-serif'>${encodeURIComponent((user.name || "پرسنل") + " - دانشنامه تحصیلی")}</text></svg>`,
                                      uploadedAt: "2026-10-28T07:48:00.000Z",
                                      verified: true,
                                    },
                                  ];

                                  const verifiedCount = userDocs.filter(d => d.verified).length;

                                  return (
                                    <div className="flex flex-col gap-3">
                                      {/* Header Bar */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                                        <div className="flex items-center gap-3">
                                          <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                            <FileCheck className="size-5" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                              <span>{t("userDocumentsTitle")}</span>
                                              <span className="text-xs text-muted-foreground font-normal">({user.name})</span>
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                              {t("userDocumentsDesc")}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "text-xs font-semibold px-2.5 py-1 gap-1.5",
                                              verifiedCount === userDocs.length
                                                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                                                : "border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400",
                                              isRtl && "fa-num"
                                            )}
                                          >
                                            <CheckCircle2 className="size-3.5" />
                                            <span>
                                              {t("docsVerifiedCount", { verified: verifiedCount, total: userDocs.length })}
                                            </span>
                                          </Badge>

                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleVerifyAllUserDocs(user.id)}
                                            disabled={verifiedCount === userDocs.length}
                                            className="h-8 px-3 rounded-lg text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                                          >
                                            <CheckCheck className="size-3.5" />
                                            <span>{t("verifyAllDocs")}</span>
                                          </Button>

                                          <button
                                            type="button"
                                            onClick={() => setActiveAccordion(null)}
                                            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                                            title={t("cancel")}
                                          >
                                            <X size={15} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Documents List (زیر هم و ساده) */}
                                      <div className="flex flex-col gap-2">
                                        {userDocs.map((doc) => {
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

                                                <div className="flex flex-col min-w-0">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                                      {getLocalizedDocumentTitle(doc, locale)}
                                                    </span>
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

                                              {/* Actions */}
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
                                                  onClick={() => handleToggleVerifyUserDoc(user.id, doc.id)}
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
                                    </div>
                                  );
                                })()}
                              </TableAccordionPanel>
                              )}
                            </AnimatePresence>

                            {/* ── B. Icon Tab (در پایین کانتینر محتوا - سمت راست در فارسی، سمت چپ در انگلیسی) ── */}
                            <div 
                              dir={isRtl ? "rtl" : "ltr"}
                              className={cn(
                                "flex items-center justify-between px-3 py-1 transition-colors select-none shrink-0",
                                isAccordionOpen ? "-mt-px" : "mt-0",
                                "rounded-b-xl shadow-none border-x border-b border-border/50",
                                "bg-slate-100/95 dark:bg-slate-800/95",
                                isRowActive ? "text-foreground" : "text-muted-foreground",
                                !isAccordionOpen && (isRowActive ? "hover:bg-slate-200/90 dark:hover:bg-slate-700/90" : "hover:bg-slate-200/80 dark:hover:bg-slate-700/80")
                              )}
                            >
                              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                {/* 1. View User Details (مشاهده مشخصات) */}
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(user.id, 'view')}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                    isAccordionOpen && activeAccordion?.type === 'view'
                                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                                      : "text-muted-foreground hover:text-foreground hover:bg-background/80 dark:hover:bg-card"
                                  )}
                                  title={t("viewDetailsBtn")}
                                >
                                  <Eye size={13} className="shrink-0" />
                                  <span className="hidden sm:inline">{t("viewDetailsBtn")}</span>
                                </button>

                                {/* 2. Change Password (تغییر رمز عبور) */}
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(user.id, 'password')}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                    isAccordionOpen && activeAccordion?.type === 'password'
                                      ? "bg-amber-500 text-white shadow-2xs font-semibold"
                                      : "text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-background/80 dark:hover:bg-card"
                                  )}
                                  title={isRtl ? "رمز عبور" : "Password"}
                                >
                                  <KeyRound size={13} className="shrink-0" />
                                  <span className="hidden sm:inline">{isRtl ? "رمز عبور" : "Password"}</span>
                                </button>


                                {/* 3. Role Assignment (تعیین رول - منحصراً سوپر ادمین) */}
                                {isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => toggleAccordion(user.id, 'role')}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                      isAccordionOpen && activeAccordion?.type === 'role'
                                        ? "bg-purple-600 text-white shadow-2xs font-semibold"
                                        : "text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-background/80 dark:hover:bg-card"
                                    )}
                                    title={isRtl ? "تعیین رول (سوپر ادمین)" : "Role Assignment (Super Admin)"}
                                  >
                                    <UserCog size={13} className="shrink-0" />
                                    <span className="hidden sm:inline">{isRtl ? "تعیین رول" : "Role"}</span>
                                  </button>
                                )}

                                {/* 4. Module Access (دسترسی ماژول‌ها - کشویی، مدیر سیستم و سوپر ادمین) */}
                                {canEditModuleAccess && (
                                  <button
                                    type="button"
                                    onClick={() => toggleAccordion(user.id, 'access')}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                      isAccordionOpen && activeAccordion?.type === 'access'
                                        ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                                        : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-background/80 dark:hover:bg-card"
                                    )}
                                    title={t("moduleAccess")}
                                  >
                                    <ShieldCheck size={13} className="shrink-0" />
                                    <span className="hidden sm:inline">{t("moduleAccess")}</span>
                                  </button>
                                )}

                                {/* 5. Delete User (حذف کامل کاربر با پیام هشدار حذف اطلاعات، فقط ادمین‌ها) */}
                                {canEditModuleAccess && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(user)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
                                    title={isRtl ? "حذف کاربر" : "Delete User"}
                                  >
                                    <Trash2 size={13} className="shrink-0" />
                                    <span className="hidden sm:inline">{isRtl ? "حذف کاربر" : "Delete User"}</span>
                                  </button>
                                )}

                                <div className="h-3.5 w-px bg-border/40 mx-0.5 shrink-0" />

                                {/* 5. Open in Dashboard (مشاهده در داشبورد - بدون اسم، آیکون آخر) */}
                                <button
                                  type="button"
                                  onClick={() => handleSelectAndGoHome(user)}
                                  className="size-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  title={t("viewInDashboard")}
                                  aria-label={t("viewInDashboard")}
                                >
                                  <LayoutDashboard size={14} className="shrink-0" />
                                </button>
                              </div>

                              {/* ── Fixed 28px slot for Close (X) so the tab width NEVER shifts when X appears ── */}
                              <div className="size-7 flex items-center justify-center shrink-0 ms-1">
                                {(isAccordionOpen || isTrayOpen) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveAccordion(null);
                                      setOpenTrayUserId(null);
                                    }}
                                    className="size-6.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 dark:hover:bg-card transition-colors cursor-pointer"
                                    title={t("cancel")}
                                    aria-label={t("cancel")}
                                  >
                                    <X size={13} className="shrink-0" />
                                  </button>
                                )}
                              </div>
                            </div>

                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>

                  </tbody>
                );
              })
            )}
        </table>
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
    </div>
  );
}
