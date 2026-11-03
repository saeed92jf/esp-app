import React, { useState, useMemo } from "react";
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
  Building, Calendar, Users, ExternalLink,
  Building2, Briefcase, DollarSign, Clock, MapPin,
  Heart, Shield, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/services";
import { NAVIGATION } from "@/config/navigation";
import { getCompanyFromEmail } from "../utils/company";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { getLocalizedDocumentTitle } from "@/modules/profile/utils/document-helpers";

interface AdminUsersTableProps {
  users: User[];
  setUsers: (u: User[]) => void;
  selectedUser: User | null;
  setSelectedUser: (u: User) => void;
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
        isRtl ? "rounded-bl-none rounded-br-2xl" : "rounded-br-none rounded-bl-2xl",
        "shadow-[inset_0_4px_8px_-3px_rgba(15,23,42,0.08)] dark:shadow-[inset_0_4px_8px_-3px_rgba(0,0,0,0.4)]"
      )}
    >
      <div ref={contentRef} className="p-4 sm:p-5">
        <div className="w-full max-w-5xl mx-auto">
          <motion.div
            key={activeType}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function AdminUsersTable({
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  setActiveTab,
  onRefresh,
}: AdminUsersTableProps) {
  const { user: currentUser, updateUser: updateUserStore } = useAuth();
  const t = useTranslations("Admin");

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin": return t("roleAdmin");
      case "manager": return t("roleManager");
      case "engineer": return t("roleEngineer");
      case "staff": return t("roleStaff");
      case "customer": return t("roleCustomer");
      case "user": return t("roleUser");
      default: return t("roleUser");
    }
  };
  const tMenu = useTranslations("Menu");
  const locale = useLocale();
  const isRtl = locale === "fa";

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

  // Active accordion per user row
  const [activeAccordion, setActiveAccordion] = useState<{
    userId: string;
    type: 'view' | 'password' | 'edit' | 'access' | 'documents';
  } | null>(null);

  // Track hovered user row for smooth slide-out tab animation
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  // State for Password Change accordion
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisteredPassword, setShowRegisteredPassword] = useState<Record<string, boolean>>({});
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

  const roleOptions: ComboboxOption[] = useMemo(() => [
    { value: "user", label: t("userRole") },
    { value: "admin", label: t("adminRole") },
  ], [t]);

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

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 0. Global Search
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchName = user.name?.toLowerCase().includes(q);
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
        const q = colFilters.userNameQuery.toLowerCase().trim();
        if (!user.name?.toLowerCase().includes(q) && !user.id?.toLowerCase().includes(q)) {
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
        const sal = user.salary || 10000;
        const matchesSalary = colFilters.salaryRanges.some(r => {
          if (r === 'ge15k') return sal >= 15000;
          if (r === '10to15k') return sal >= 10000 && sal < 15000;
          if (r === 'lt10k') return sal < 10000;
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

      // 9. Column 9: Status
      if (colFilters.statuses.length > 0) {
        if (!colFilters.statuses.includes(user.status)) return false;
      }

      return true;
    }).sort((a, b) => {
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

  const handleSelectAndGoConfig = (user: User) => {
    setSelectedUser(user);
    setActiveTab('add');
  };

  // Accordion Toggle
  const toggleAccordion = (userId: string, type: 'view' | 'password' | 'edit' | 'access' | 'documents') => {
    const targetUser = users.find(x => x.id === userId);
    if (targetUser) {
      setSelectedUser(targetUser);
    }

    if (activeAccordion?.userId === userId && activeAccordion?.type === type) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion({ userId, type });
      setNewPassword("");
      setConfirmPassword("");
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
            email: u.email,
            phone: u.phone || "",
            department: u.department || "engineering",
            role: u.role || "user",
            jobTitle: u.jobTitle || ""
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
        phone: targetUser.phone,
        nationalId: targetUser.nationalId,
        department: targetUser.department,
        company: isRtl ? comp.nameFa : comp.nameEn,
        companyId: comp.id,
        jobTitle: targetUser.jobTitle,
        role: targetUser.role,
        workLocation: targetUser.workLocation,
        contractType: targetUser.contractType,
        salary: targetUser.salary,
        hasOvertime: targetUser.hasOvertime,
        maxOvertimeHours: targetUser.maxOvertimeHours,
        monthlyBonusType: targetUser.monthlyBonusType,
        monthlyBonusAmount: targetUser.monthlyBonusAmount,
        monthlyBonusTitle: targetUser.monthlyBonusTitle,
        monthlyBonuses: targetUser.monthlyBonuses,
        maritalStatus: targetUser.maritalStatus,
        childrenCount: targetUser.childrenCount,
        insuranceType: targetUser.insuranceType,
        insuranceCode: targetUser.insuranceCode,
        insuranceProvider: targetUser.insuranceProvider,
        insuranceValidUntil: targetUser.insuranceValidUntil,
        supplementaryPlan: targetUser.supplementaryPlan as any,
        supplementaryProvider: targetUser.supplementaryProvider,
        shebaNumber: targetUser.shebaNumber,
        educationDegree: targetUser.educationDegree,
        educationField: targetUser.educationField,
        university: targetUser.university,
        graduationYear: targetUser.graduationYear,
        skills: targetUser.skills as any,
        modulesAccess: targetUser.modulesAccess,
        documents: targetUser.documents,
        manager: targetUser.manager,
        subordinates: targetUser.subordinates,
        status: "pending",
        requestType: "edit_profile",
        requestTag: "ویرایش اطلاعات کاربر",
        notes: isRtl
          ? `درخواست بازنگری و ویرایش اطلاعات پرونده پرسنلی برای «${targetUser.name}» (#${targetUser.id})`
          : `Profile information update request for ${targetUser.name} (#${targetUser.id})`,
      };

      await api.admin.createRequest(newReqPayload);
      toast.success(
        isRtl
          ? `درخواست ویرایش برای «${targetUser.name}» ثبت گردید و به کارتابل درخواست‌ها منتقل شد.`
          : `Edit request created for "${targetUser.name}" and sent to Requests.`
      );

      if (onRefresh) {
        await onRefresh();
      }
      if (setActiveTab) {
        setActiveTab("requests");
      }
    } catch (err: any) {
      console.error("handleCreateEditRequest error:", err);
      toast.error(isRtl ? "خطا در ثبت درخواست ویرایش اطلاعات." : "Failed to create edit request.");
    } finally {
      setCreatingReqUserId(null);
    }
  };

  // Toggle user module access directly from table accordion
  const handleToggleUserAccess = (userId: string, moduleId: string, checked: boolean) => {
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

  // Save Changed Password
  const handleSavePassword = async (userId: string) => {
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }
    try {
      await api.admin.updateUser(userId, { password: newPassword });
      setUsers(users.map(u => (u.id === userId ? { ...u, password: newPassword } : u)));
      toast.success(t("passwordChangedSuccess"));
      setActiveAccordion(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(isRtl ? "خطا در ذخیره رمز عبور روی سرور" : "Failed to update password on server");
    }
  };

  // Save Quick Edited Info
  const handleSaveEdit = async (userId: string) => {
    try {
      const updatedUser = await api.admin.updateUser(userId, editFormData);
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          const updated = { ...u, ...updatedUser, ...editFormData };
          if (selectedUser?.id === userId) {
            setSelectedUser(updated);
          }
          return updated;
        }
        return u;
      });
      setUsers(updatedUsers);

      // If the edited user is the currently logged in admin, update active session immediately
      if (currentUser && (currentUser.id === userId || (currentUser.email && editFormData.email && currentUser.email.toLowerCase() === editFormData.email.toLowerCase()))) {
        updateUserStore({
          name: editFormData.name,
          email: editFormData.email,
          mobile: editFormData.phone,
          department: editFormData.department,
          jobTitle: editFormData.jobTitle,
          role: editFormData.role,
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
                    {(['admin', 'manager', 'engineer', 'staff', 'customer', 'user'] as const).map(role => (
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

              {/* ── Column 2: Department & Title ── */}
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

              {/* ── Column 4: Company (شرکت) ── */}
              {renderExcelHeader({
                title: t("companyCol"),
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
                <td colSpan={8} className="py-16 text-center text-muted-foreground text-xs">
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
              const isRowActive = activeAccordion ? isAccordionOpen : isSelected;

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

                if (user.status === 'offline') {
                  return { colorClass: 'bg-slate-400', label: t("offline") };
                }

                return { colorClass: 'bg-[#22c55e]', label: t("office") };
              };
              const locationBadge = getLocationBadge();
              const userDisplayName = isRtl
                ? (user.firstNameFa && user.lastNameFa ? `${user.firstNameFa} ${user.lastNameFa}` : (user.fullNameFa || user.name))
                : (user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.email?.split('@')[0] || user.name)));

              // Initial letter tailored to current locale (Persian vs English)
              const getInitialLetter = () => {
                if (isRtl) {
                  if (user.firstNameFa?.trim()) return user.firstNameFa.trim().charAt(0);
                  const match = user.name?.match(/[\u0600-\u06FF]/);
                  return match ? match[0] : (user.name?.trim().charAt(0) || "ک");
                } else {
                  if (user.firstName?.trim()) return user.firstName.trim().charAt(0).toUpperCase();
                  const match = user.name?.match(/[a-zA-Z]/);
                  return match ? match[0].toUpperCase() : (user.name?.trim().charAt(0) || "U").toUpperCase();
                }
              };
              const userInitial = getInitialLetter();
              const avatarBg = getUserAvatarColor(user);

              return (
                <tbody
                  key={user.id}
                  className="group/row"
                  onMouseEnter={() => setHoveredUserId(user.id)}
                  onMouseLeave={() => setHoveredUserId((prev) => (prev === user.id ? null : prev))}
                >
                    
                    {/* ── 1. Main User Data Row ── */}
                    <tr
                      onClick={() => {
                        setSelectedUser(user);
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
                      {/* Column 1: User (نام + ایمیل در زیر نام + نقش) */}
                      <td className="py-3 px-3 text-start">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar with unclipped location tag */}
                          <div className="relative size-9 shrink-0">
                            <div 
                              className="size-full rounded-full flex items-center justify-center select-none shadow-xs text-white font-bold text-xs border border-white/20 dark:border-white/10"
                              style={{ backgroundColor: avatarBg }}
                            >
                              <span className="leading-none">{userInitial}</span>
                            </div>
                            {/* Unclipped colored location status tag */}
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-background z-10 pointer-events-none shadow-2xs transition-colors",
                                locationBadge.colorClass
                              )}
                              title={`${t("workLocationLabel")}: ${locationBadge.label}`}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-foreground truncate max-w-[150px]">
                              {userDisplayName}
                            </span>
                            {user.email && (
                              <a
                                href={`mailto:${user.email}`}
                                onClick={(e) => e.stopPropagation()}
                                dir="ltr"
                                className="text-[11px] text-muted-foreground hover:text-primary transition-colors truncate max-w-[160px] font-normal leading-tight mt-0.5"
                              >
                                {user.email}
                              </a>
                            )}
                            <span className="text-[10px] text-muted-foreground/75 truncate max-w-[150px] mt-0.5">
                              {getRoleLabel(user.role)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Department & Title */}
                      <td className="py-3 px-3 text-start">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                            {departmentName}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                            {user.jobTitle || t("userRole")}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Contact (مستقیماً بعد از دپارتمان با فونت بزرگتر و بولدتر) */}
                      <td className="py-3 px-3 text-start">
                        <div className="flex flex-col gap-1 min-w-0">
                          {user.phone ? (
                            <span className="text-[13px] font-bold text-foreground flex items-center gap-1.5" dir="ltr">
                              <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                              <span>{user.phone}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                          {user.extensionNumber && (
                            <span className="text-[13px] font-extrabold text-foreground flex items-center gap-1.5" dir="ltr">
                              <span className="text-[10px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">EXT.</span>
                              <span>{user.extensionNumber}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Company (شرکت) */}
                      <td className="py-3 px-3 text-start">
                        {(() => {
                          const comp = getCompanyFromEmail(user.email);
                          return (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs whitespace-nowrap",
                                comp.id === "npceram"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                                  : comp.id === "holding"
                                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25"
                                  : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25"
                              )}
                            >
                              <span className="whitespace-nowrap">{isRtl ? comp.nameFa : comp.nameEn}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Column 5: Projects & Experience (پروژه و تجربه در یک ستون، چپ‌چین) */}
                      <td className="py-3 px-3 text-start">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs"
                            title={isRtl ? `${user.doneProjects || 0} پروژه انجام‌شده` : `${user.doneProjects || 0} Done Projects`}
                          >
                            <FolderKanban className="size-3.5" />
                            <span>{user.doneProjects || 0}</span>
                          </span>
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs"
                            title={isRtl ? `امتیاز تجربه: ${user.score || 350}` : `Experience Score: ${user.score || 350}`}
                          >
                            <Award className="size-3.5" />
                            <span>{user.score || 350}</span>
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Tenure (چپ‌چین) */}
                      <td className="py-3 px-3 text-start">
                        <span className="text-xs font-medium text-foreground">
                          {user.daysInCompany || 0} <span className="text-[10px] text-muted-foreground">{t("daysUnit")}</span>
                        </span>
                      </td>

                      {/* Column 7: Salary (چپ‌چین) */}
                      <td className="py-3 px-3 text-start">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {showSalaries 
                            ? `$${(user.salary || 10000).toLocaleString()}` 
                            : "••••••••"}
                        </span>
                      </td>

                      {/* Column 8: Status (چپ‌چین) */}
                      <td className="py-3 px-3 text-start">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                          user.status === 'online'
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                        )}>
                          <span className={cn(
                            "size-1.5 rounded-full",
                            user.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          )} />
                          {user.status === 'online' ? t("online") : t("offline")}
                        </span>
                      </td>
                    </tr>

                    {/* ── 2. Paper Pull-out & Folder Tab (سمت چپ در فارسی، راست در انگلیسی) ── */}
                    <tr className="border-0 relative z-0">
                      <td colSpan={8} className="p-0 border-0">
                        <div 
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
                            isAccordionOpen 
                              ? "grid-rows-[1fr] opacity-100" 
                              : cn(
                                  "grid-rows-[0fr] opacity-0 group-hover/row:grid-rows-[1fr] group-hover/row:opacity-100",
                                  hoveredUserId === user.id && "grid-rows-[1fr] opacity-100"
                                )
                          )}
                        >
                          <div className="overflow-hidden min-h-0">
                            <div 
                              className={cn(
                                "w-full flex flex-col px-3 sm:px-4 relative",
                                isRtl ? "items-start" : "items-end",
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
                                          <div 
                                            className="size-10 rounded-2xl flex items-center justify-center font-medium text-sm text-white shrink-0 shadow-xs"
                                            style={{ backgroundColor: user.avatarColor || '#0284c7' }}
                                          >
                                            {user.name ? user.name.slice(0, 2) : "US"}
                                          </div>
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
                                                  user.role === 'admin'
                                                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25"
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
                                              <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <span className={cn(
                                                  "size-2 rounded-full shrink-0",
                                                  user.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                                )} />
                                                {user.status === 'online' ? t("online") : t("offline")}
                                              </span>
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
                                            title={isRtl ? "ایجاد درخواست ویرایش اطلاعات (انتقال به بخش درخواست‌ها)" : "Create Edit Request"}
                                            aria-label={isRtl ? "ایجاد درخواست ویرایش اطلاعات" : "Create Edit Request"}
                                          >
                                            {creatingReqUserId === user.id ? (
                                              <RotateCw className="size-3.5 animate-spin" />
                                            ) : (
                                              <UserCog className="size-3.5" />
                                            )}
                                            <span className="hidden sm:inline">{isRtl ? "درخواست ویرایش" : "Request Edit"}</span>
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
                                                ${(user.salary || 12500).toLocaleString()}
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

                                {/* ── Mode B: Change Password (تغییر رمز عبور) ── */}
                                {activeAccordion.type === 'password' && (
                                  <form 
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleSavePassword(user.id);
                                    }}
                                    autoComplete="off"
                                    className="flex flex-col gap-3.5"
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

                                    <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                                      <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                          <KeyRound size={17} />
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-foreground">
                                            {isRtl ? "رمز عبور" : "Password"} — {userDisplayName}
                                          </h4>
                                          <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {t("enterNewPassword")}
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

                                    {/* Current registered password */}
                                    <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border/30">
                                      <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-medium text-muted-foreground">
                                          {isRtl ? "رمز عبور فعلی ثبت‌شده در سامانه" : "Current Registered Password"}
                                        </p>
                                        <span className="text-[9px] text-muted-foreground font-mono">
                                          {isRtl ? "دریافت‌شده از سرور" : "Live from server"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border/40 font-mono text-xs sm:text-sm text-foreground overflow-hidden">
                                          <span className="select-all tracking-wider truncate">
                                            {user.password
                                              ? (showRegisteredPassword[user.id] ? user.password : "••••••••••••")
                                              : (isRtl ? "در حال دریافت..." : "Loading...")}
                                          </span>
                                          <div className="flex items-center gap-1 shrink-0 ms-2">
                                            <button
                                              type="button"
                                              onClick={() => setShowRegisteredPassword(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                                              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                              title={showRegisteredPassword[user.id] ? (isRtl ? "مخفی‌سازی" : "Hide") : (isRtl ? "نمایش رمز" : "Show")}
                                            >
                                              {showRegisteredPassword[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            {user.password && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(user.password || "");
                                                  toast.success(isRtl ? "رمز عبور در کلیپ‌بورد کپی شد" : "Password copied to clipboard");
                                                }}
                                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                                title={isRtl ? "کپی رمز" : "Copy"}
                                              >
                                                <Copy size={14} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() => {
                                            api.admin.sendPassword(user.id)
                                              .then(() => toast.success(isRtl ? "رمز عبور برای کاربر ارسال شد" : "Password sent to user"))
                                              .catch(() => toast.error(isRtl ? "خطا در ارسال رمز عبور" : "Failed to send password"));
                                          }}
                                          className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-xs shrink-0"
                                        >
                                          {isRtl ? "ارسال برای کاربر" : "Send to User"}
                                        </Button>
                                      </div>
                                    </div>

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
                                        type="submit"
                                        size="sm"
                                        className="h-8.5 px-4 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-xs transition-colors"
                                      >
                                        {t("save")}
                                      </Button>
                                    </div>
                                  </form>
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-foreground">
                                          {t("name")}
                                        </Label>
                                        <Input
                                          value={editFormData.name || ""}
                                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
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
                                          triggerClassName="w-full justify-between h-8.5 rounded-xl bg-background border-border/50 text-xs"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
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
                                          <Badge variant="secondary" className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 fa-num">
                                            {activeSubItemsCount} / {totalSubItemsCount} {t("activeStatus")}
                                          </Badge>

                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSelectAndGoConfig(user)}
                                            className="h-7.5 px-2.5 rounded-lg text-xs gap-1.5 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                            title={t("managePermissions")}
                                          >
                                            <ExternalLink size={12} />
                                            <span className="hidden sm:inline">{t("managePermissions")}</span>
                                          </Button>

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

                                      {/* Modern, Clean & Complete Module Cards Grid with All Sub-Items */}
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
                                                    onCheckedChange={(checked) => handleToggleUserAccess(user.id, group.id, checked)}
                                                    className={cn(isGroupPartiallyActive && "opacity-85 ring-1 ring-emerald-500/40")}
                                                  />
                                                </div>
                                              </div>

                                              {/* Sub-Items List */}
                                              <div className="flex flex-col gap-1.5 pt-2.5">
                                                {items.map((item) => {
                                                  const ItemIcon = item.icon;
                                                  const hasItemAccess = user.modulesAccess?.some(m => m.moduleId === item.href && m.hasAccess) ?? false;

                                                  let itemLabel = item.labelKey;
                                                  try {
                                                    itemLabel = tMenu(`items.${item.labelKey}` as any) || item.labelKey;
                                                  } catch {
                                                    itemLabel = item.labelKey;
                                                  }

                                                  return (
                                                    <div
                                                      key={item.href}
                                                      onClick={() => handleToggleUserAccess(user.id, item.href, !hasItemAccess)}
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

                            {/* ── B. Icon Tab (در پایین کانتینر محتوا - سمت چپ در فارسی، سمت راست در انگلیسی) ── */}
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


                                {/* 4. Module Access (دسترسی ماژول‌ها - کشویی) */}
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
                                {isAccordionOpen && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveAccordion(null)}
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
