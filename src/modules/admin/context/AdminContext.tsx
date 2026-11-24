"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { api } from "@/services";
import type { User, PendingRequest } from "../types/admin.types";
import type { UserRole } from "@/types/auth";
import { toast } from "sonner";
import { NAVIGATION } from "@/config/navigation";
import { toApiError } from "@/services/core/errors";
import type { ServerConnectionErrorInfo } from "@/components/ui/server-connection-error";
import { useAuth } from "@/modules/auth/hooks/use-auth";

export type AdminTab =
  | "home"
  | "executiveDashboard"
  | "usersTable"
  | "add"
  | "requests"
  | "moduleRequests"
  | "auditLogs"
  | "settings"
  | "qualityGuardian";

export const ADMIN_TAB_ROUTES: Record<AdminTab, string> = {
  home: "/admin",
  executiveDashboard: "/admin/dashboard",
  usersTable: "/admin/users",
  add: "/admin/config",
  requests: "/admin/requests",
  moduleRequests: "/admin/module-requests",
  auditLogs: "/admin/audit-logs",
  settings: "/admin/settings",
  qualityGuardian: "/admin/quality-guardian",
};

export interface AdminContextValue {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  requests: PendingRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  userToEdit: User | null;
  setUserToEdit: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  connectionError: ServerConnectionErrorInfo | null;
  setConnectionError: React.Dispatch<React.SetStateAction<ServerConnectionErrorInfo | null>>;
  isRetrying: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSuperAdmin: boolean;
  isOfficeAdmin: boolean;
  currentUser: any;
  availableModules: any[];
  activeTab: AdminTab;
  navigateToTab: (tab: AdminTab, query?: Record<string, string>) => void;
  setActiveTab: (tab: AdminTab) => void;
  fetchData: () => Promise<void>;
  handleToggleModuleAccess: (moduleId: string, checked: boolean) => void;
  handleToggleAllModulesAccess: (checked: boolean) => void;
  handleUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  handleSaveProfile: (userId: string, updates: Partial<User>) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

export function AdminProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser, updateUser: updateUserStore } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] =
    useState<ServerConnectionErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Compute activeTab from pathname
  const activeTab: AdminTab = useMemo(() => {
    if (!pathname) return "home";
    if (pathname.includes("/admin/dashboard")) return "executiveDashboard";
    if (pathname.includes("/admin/users")) return "usersTable";
    if (pathname.includes("/admin/config")) return "add";
    if (pathname.includes("/admin/requests")) return "requests";
    if (pathname.includes("/admin/module-requests")) return "moduleRequests";
    if (pathname.includes("/admin/audit-logs")) return "auditLogs";
    if (pathname.includes("/admin/settings")) return "settings";
    return "home";
  }, [pathname]);

  const isSuperAdmin = useMemo(() => {
    return currentUser?.role === "superadmin";
  }, [currentUser]);

  const isOfficeAdmin = useMemo(() => {
    return currentUser?.role === "office_admin";
  }, [currentUser]);

  const navigateToTab = useCallback(
    (tab: AdminTab, query?: Record<string, string>) => {
      if (isOfficeAdmin && !["home", "usersTable", "add", "requests"].includes(tab)) {
        toast.error(
          isRtl
            ? "دسترسی مدیر اداری محدود به مشاهده پرسنل، ایجاد حساب کاربری و تأیید درخواست‌ها می‌باشد."
            : "Office Admin access is limited to user info, users table, account creation, and request approvals."
        );
        return;
      }
      if (tab === "auditLogs" && !isSuperAdmin) {
        toast.error(
          isRtl
            ? "دسترسی به بخش لاگ‌های سیستم مختص سوپر ادمین است."
            : "Audit logs are restricted to Super Admin."
        );
        return;
      }
      if (tab === "add" && !query?.userId) {
        setUserToEdit(null);
      }
      let target = ADMIN_TAB_ROUTES[tab] || "/admin";
      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams(query);
        target = `${target}?${params.toString()}`;
      }
      router.push(target);
    },
    [isOfficeAdmin, isSuperAdmin, isRtl, router]
  );

  const availableModules = useMemo(() => {
    return NAVIGATION.filter((n) => n.id !== "main" && n.id !== "dashboard");
  }, []);

  // Fetch admin users & requests
  const fetchData = useCallback(async () => {
    setLoading(true);
    setIsRetrying(true);
    setConnectionError(null);
    try {
      const [u, r] = await Promise.all([
        api.admin.getUsers({ limit: 2000 }),
        api.admin.getPendingRequests(),
      ]);
      let userList: User[] = (u || []).filter(
        (item) =>
          ![
            "u-rezaei",
            "u-mohammadi",
            "u-karimi",
            "u-nouri",
            "u-moradi",
            "u-req-1",
          ].includes(item.id)
      );

      // If currentUser is logged in, ensure the authenticated administrator is in userList
      if (currentUser) {
        const adminEmail = currentUser.email?.toLowerCase();
        const adminName =
          currentUser.fullNameFa ||
          currentUser.name ||
          currentUser.fullName ||
          "سعید جلیلی فرد";
        const assignedRole: UserRole =
          currentUser.role === "superadmin"
            ? "superadmin"
            : (currentUser.role as UserRole) || "admin";

        const foundIdx = userList.findIndex((item) => {
          if (currentUser.id && item.id === currentUser.id) return true;
          if (adminEmail && item.email?.toLowerCase() === adminEmail) return true;
          return false;
        });

        if (foundIdx === -1) {
          const adminAsUser: User = {
            id: currentUser.id || "u-saeed",
            name: adminName,
            firstNameFa: currentUser.fullNameFa?.split(" ")[0] || "سعید",
            lastNameFa:
              currentUser.fullNameFa?.split(" ").slice(1).join(" ") ||
              "جلیلی فرد",
            firstName: currentUser.fullName?.split(" ")[0] || "Saeed",
            lastName:
              currentUser.fullName?.split(" ").slice(1).join(" ") ||
              "Jalili Fard",
            email: currentUser.email || "",
            role: assignedRole,
            status: "online",
            accountStatus: "active",
            avatar: currentUser.avatar,
            avatarColor: currentUser.avatarColor,
            avatarBgColor: currentUser.avatarBgColor || currentUser.avatarColor,
            avatarMode: currentUser.avatarMode || "photo",
            primaryColor: currentUser.primaryColor || "red",
            phone: currentUser.mobile || "09123456789",
            nationalId: "",
            department: "engineering",
            jobTitle: isRtl ? "سوپر ادمین / مالک سیستم" : "Super Administrator",
            company: isRtl ? "یورو اسلات پارس" : "Euroslot Pars",
            companyId: "euroslot",
            joinedAt: new Date().toISOString(),
            daysInCompany: 120,
            doneProjects: 14,
            salary: 450000000,
            hasOvertime: true,
            maxOvertimeHours: 40,
            monthlyBonusType: "cash",
            monthlyBonusAmount: 35000000,
            monthlyBonusTitle: isRtl
              ? "پاداش مدیریت و راهبری سیستم"
              : "System Leadership Bonus",
            monthlyBonuses: [],
            score: 95,
            age: 34,
            maritalStatus: "single",
            childrenCount: 0,
            insuranceType: "complementary",
            educationDegree: "master",
            educationField: isRtl
              ? "مهندسی نرم‌افزار / مکانیک"
              : "Software & Mechanical Engineering",
            skills: [
              { name: "System Architecture", rate: 95 },
              { name: "Fullstack Engineering", rate: 90 },
              { name: "Security & Dual-Gate Access", rate: 90 },
              { name: "Industrial ERP & P&ID", rate: 85 },
            ],
            workingFormat: { office: 60, factory: 20, mission: 10, leave: 10 },
            modulesAccess: [],
            recentActivities: [],
            checklists: [],
            isProfileCompleted: true,
            adminApproved: true,
            managerApproved: true,
            documents: [],
            subordinates: [],
          };
          userList = [adminAsUser, ...userList];
        } else {
          userList[foundIdx] = {
            ...userList[foundIdx],
            name: adminName,
            status: "online",
            isOnline: true,
            avatar: currentUser.avatar || userList[foundIdx].avatar,
            avatarColor:
              currentUser.avatarColor || userList[foundIdx].avatarColor,
            primaryColor:
              currentUser.primaryColor || userList[foundIdx].primaryColor,
          };
        }
      }

      // Strict unique user deduplication by canonical user.id
      const seenIds = new Set<string>();
      userList = userList.filter((item) => {
        if (!item || !item.id) return false;
        const idKey = item.id.toLowerCase().trim();
        if (seenIds.has(idKey)) return false;
        seenIds.add(idKey);
        return true;
      });

      setUsers(userList);
      if (userList.length > 0) {
        setSelectedUser((prev) => {
          if (prev) {
            const found = userList.find((u) => u.id === prev.id);
            if (found) return found;
          }
          const adminUser = currentUser
            ? userList.find(
                (item) =>
                  (currentUser.email &&
                    item.email?.toLowerCase() ===
                      currentUser.email.toLowerCase()) ||
                  item.id === currentUser.id
              )
            : null;
          return adminUser || userList[0];
        });
      } else {
        setSelectedUser(null);
      }
      setRequests(r || []);
      setConnectionError(null);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      const apiErr = toApiError(err);
      setConnectionError({
        code: apiErr.code,
        message: apiErr.message,
        status: apiErr.status,
        timestamp: new Date(),
        endpoint: BACKEND_URL,
      });
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [currentUser, isRtl]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time presence poller
  useEffect(() => {
    const isCurrentMatch = (u?: { id?: string; email?: string } | null) => {
      if (!u || !currentUser) return false;
      if (u.id && currentUser.id && u.id.toLowerCase() === currentUser.id.toLowerCase()) return true;
      if (
        u.email &&
        currentUser.email &&
        u.email.toLowerCase() === currentUser.email.toLowerCase()
      )
        return true;
      return false;
    };

    const updatePresence = async () => {
      try {
        const res = await fetch("/api/real/users/presence");
        if (!res.ok) return;
        const data = await res.json();
        const onlineSet = new Set(
          (data.onlineUserIds || []).map((x: string) => String(x).toLowerCase())
        );
        const presenceMap = data.presenceMap || {};

        setUsers((prevUsers) => {
          return prevUsers.map((existing) => {
            const isCurrent = isCurrentMatch(existing);
            const uidLower = String(existing.id || "").toLowerCase();
            const emailLower = String(existing.email || "").toLowerCase();
            const pInfo =
              presenceMap[existing.id] ||
              presenceMap[uidLower] ||
              presenceMap[emailLower] ||
              null;

            const isOnline = isCurrent
              ? true
              : onlineSet.has(uidLower) ||
                onlineSet.has(emailLower) ||
                Boolean(pInfo?.isOnline || pInfo?.status === "online");

            return {
              ...existing,
              isOnline,
              status: isOnline ? "online" : "offline",
              lastSeenAt: pInfo?.lastSeenAt || existing.lastSeenAt,
              onlineSince: pInfo?.onlineSince || existing.onlineSince,
            };
          });
        });
      } catch {
        // ignore background errors
      }
    };

    const timer = setInterval(updatePresence, 8000);
    const initTimer = setTimeout(updatePresence, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(initTimer);
    };
  }, [currentUser]);

  // Actions
  const handleToggleModuleAccess = useCallback(
    (moduleId: string, checked: boolean) => {
      if (!selectedUser) return;
      const updatedUser = { ...selectedUser };
      if (!updatedUser.modulesAccess) updatedUser.modulesAccess = [];

      const group = availableModules.find((g) => g.id === moduleId);

      if (group) {
        const existing = updatedUser.modulesAccess.find(
          (m) => m.moduleId === group.id
        );
        if (existing) existing.hasAccess = checked;
        else
          updatedUser.modulesAccess.push({
            moduleId: group.id,
            hasAccess: checked,
            accessLevel: "read",
            usagePercentage: 0,
            hoursSpent: "00:00:00",
          });

        group.items.forEach((item: any) => {
          const exItem = updatedUser.modulesAccess!.find(
            (m) => m.moduleId === item.href
          );
          if (exItem) exItem.hasAccess = checked;
          else
            updatedUser.modulesAccess!.push({
              moduleId: item.href,
              hasAccess: checked,
              accessLevel: "read",
              usagePercentage: 0,
              hoursSpent: "00:00:00",
            });
        });
      } else {
        const existing = updatedUser.modulesAccess.find(
          (m) => m.moduleId === moduleId
        );
        if (existing) existing.hasAccess = checked;
        else
          updatedUser.modulesAccess.push({
            moduleId,
            hasAccess: checked,
            accessLevel: "read",
            usagePercentage: 0,
            hoursSpent: "00:00:00",
          });

        const parentGroup = availableModules.find((g) =>
          g.items.some((i: any) => i.href === moduleId)
        );
        if (parentGroup) {
          if (checked) {
            const exGroup = updatedUser.modulesAccess.find(
              (m) => m.moduleId === parentGroup.id
            );
            if (exGroup) exGroup.hasAccess = true;
            else
              updatedUser.modulesAccess.push({
                moduleId: parentGroup.id,
                hasAccess: true,
                accessLevel: "read",
                usagePercentage: 0,
                hoursSpent: "00:00:00",
              });
          } else {
            const anyItemChecked = parentGroup.items.some((item: any) => {
              if (item.href === moduleId) return checked;
              const ex = updatedUser.modulesAccess!.find(
                (m) => m.moduleId === item.href
              );
              return ex ? ex.hasAccess : false;
            });
            if (!anyItemChecked) {
              const exGroup = updatedUser.modulesAccess.find(
                (m) => m.moduleId === parentGroup.id
              );
              if (exGroup) exGroup.hasAccess = false;
            }
          }
        }
      }

      setSelectedUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      api.admin
        .updateUserModules(updatedUser.id, updatedUser.modulesAccess || [])
        .catch(console.error);
      toast.success(t("accessUpdated"));
    },
    [selectedUser, availableModules, t]
  );

  const handleToggleAllModulesAccess = useCallback(
    (checked: boolean) => {
      if (!selectedUser) return;
      const updatedUser = { ...selectedUser };
      if (!updatedUser.modulesAccess) updatedUser.modulesAccess = [];

      availableModules.forEach((module) => {
        const existing = updatedUser.modulesAccess!.find(
          (m) => m.moduleId === module.id
        );
        if (existing) existing.hasAccess = checked;
        else
          updatedUser.modulesAccess!.push({
            moduleId: module.id,
            hasAccess: checked,
            accessLevel: "read",
            usagePercentage: 0,
            hoursSpent: "00:00:00",
          });

        module.items.forEach((item: any) => {
          const exItem = updatedUser.modulesAccess!.find(
            (m) => m.moduleId === item.href
          );
          if (exItem) exItem.hasAccess = checked;
          else
            updatedUser.modulesAccess!.push({
              moduleId: item.href,
              hasAccess: checked,
              accessLevel: "read",
              usagePercentage: 0,
              hoursSpent: "00:00:00",
            });
        });
      });

      setSelectedUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      api.admin
        .updateUserModules(updatedUser.id, updatedUser.modulesAccess || [])
        .catch(console.error);
      toast.success(t("accessUpdated"));
    },
    [selectedUser, availableModules, t]
  );

  const handleUpdateUserRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      if (!isSuperAdmin) {
        toast.error(
          isRtl
            ? "تعیین و تغییر نقش فقط توسط مدیر ارشد سیستم (Super Admin) مجاز است."
            : "Role definition and modification is strictly restricted to Super Admin only."
        );
        return;
      }
      try {
        const updated = await api.admin.updateUser(userId, { role: newRole });
        setSelectedUser((prev) =>
          prev && prev.id === userId ? { ...prev, role: newRole } : prev
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        if (
          currentUser &&
          (currentUser.id === userId || currentUser.email === updated.email)
        ) {
          const keepSuperAdmin = currentUser.role === "superadmin";
          updateUserStore({ role: keepSuperAdmin ? "superadmin" : newRole });
        }
        toast.success(
          isRtl
            ? `نقش کاربر «${updated.name}» با موفقیت به‌روزرسانی شد.`
            : `Role for "${updated.name}" updated successfully.`
        );
      } catch (err: any) {
        toast.error(
          err?.message ||
            (isRtl ? "خطا در به‌روزرسانی نقش کاربر" : "Failed to update user role")
        );
      }
    },
    [isSuperAdmin, isRtl, currentUser, updateUserStore]
  );

  const handleSaveProfile = useCallback(
    async (userId: string, updates: Partial<User>) => {
      try {
        const updated = await api.admin.updateUser(userId, updates);
        const mergedUser = { ...selectedUser, ...updated, ...updates } as User;

        setSelectedUser((prev) =>
          prev && prev.id === userId ? mergedUser : prev
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...mergedUser } : u))
        );

        if (currentUser && currentUser.id === userId) {
          const computedFullNameFa =
            mergedUser.fullNameFa ||
            (mergedUser.firstNameFa && mergedUser.lastNameFa
              ? `${mergedUser.firstNameFa} ${mergedUser.lastNameFa}`
              : mergedUser.name);
          const computedFullNameEn =
            mergedUser.fullName ||
            (mergedUser.firstName && mergedUser.lastName
              ? `${mergedUser.firstName} ${mergedUser.lastName}`
              : mergedUser.name);

          const resolvedRole: UserRole =
            currentUser.role === "superadmin"
              ? "superadmin"
              : (mergedUser.role as UserRole) || currentUser.role;

          updateUserStore({
            ...updates,
            fullNameFa: computedFullNameFa,
            fullName: computedFullNameEn,
            name: isRtl
              ? computedFullNameFa || computedFullNameEn
              : computedFullNameEn || computedFullNameFa,
            email: mergedUser.email,
            mobile: mergedUser.phone,
            role: resolvedRole,
            department: mergedUser.department,
            jobTitle: mergedUser.jobTitle,
            avatarColor: mergedUser.avatarColor,
            primaryColor: mergedUser.primaryColor,
          });
        }

        toast.success(
          isRtl
            ? `اطلاعات «${mergedUser.name}» با موفقیت ذخیره شد.`
            : `Profile for "${mergedUser.name}" successfully updated.`
        );
      } catch (err: any) {
        console.error("Failed to update profile:", err);
        toast.error(
          err?.message ||
            (isRtl ? "خطا در به‌روزرسانی اطلاعات" : "Failed to update profile")
        );
        throw err;
      }
    },
    [selectedUser, currentUser, isRtl, updateUserStore]
  );

  const value: AdminContextValue = {
    users,
    setUsers,
    requests,
    setRequests,
    selectedUser,
    setSelectedUser,
    userToEdit,
    setUserToEdit,
    loading,
    connectionError,
    setConnectionError,
    isRetrying,
    sidebarOpen,
    setSidebarOpen,
    isSuperAdmin,
    isOfficeAdmin,
    currentUser,
    availableModules,
    activeTab,
    navigateToTab,
    setActiveTab: navigateToTab,
    fetchData,
    handleToggleModuleAccess,
    handleToggleAllModulesAccess,
    handleUpdateUserRole,
    handleSaveProfile,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return ctx;
}
