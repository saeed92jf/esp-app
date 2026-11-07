"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { api } from "@/services";
import { User, PendingRequest } from "../types/admin.types";
import type { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Settings, CheckCircle2, Mail, Clock, Send, UserCheck, UserCircle2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { NAVIGATION } from "@/config/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/app-header";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { toApiError } from "@/services/core/errors";
import {
  ServerConnectionError,
  ServerConnectionErrorInfo,
} from "@/components/ui/server-connection-error";
import { useAuth } from "@/modules/auth/hooks/use-auth";

import { AdminSidebar } from "./AdminSidebar";
import { AdminProfileStats } from "./AdminProfileStats";
import { AdminTasksTime } from "./AdminTasksTime";
import { AdminUserSearchAvatars } from "./AdminUserSearchAvatars";
import { AdminUserConfig } from "./AdminUserConfig";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminRequests } from "./AdminRequests";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

const tabMotionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function AdminDashboard() {
  const t = useTranslations("Admin");
  const tMenu = useTranslations("Menu");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user: currentUser, updateUser: updateUserStore } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<ServerConnectionErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'usersTable' | 'add' | 'requests' | 'settings'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab: 'home' | 'usersTable' | 'add' | 'requests' | 'settings') => {
    if (tab === 'add') {
      setUserToEdit(null);
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    // Purge only legacy mock users from local storage
    if (typeof window !== "undefined") {
      try {
        const rawUsers = localStorage.getItem("esp_admin_users");
        if (rawUsers && (rawUsers.includes("u-rezaei") || rawUsers.includes("u-mohammadi") || rawUsers.includes("u-karimi") || rawUsers.includes("u-nouri") || rawUsers.includes("u-moradi") || rawUsers.includes("u-req-1") || rawUsers.includes("u-ali-m"))) {
          localStorage.removeItem("esp_admin_users");
        }
        const rawReqs = localStorage.getItem("esp_account_requests");
        if (rawReqs && (rawReqs.includes("req-1") || rawReqs.includes("req-2") || rawReqs.includes("req-3"))) {
          localStorage.removeItem("esp_account_requests");
        }
      } catch {}
    }
    fetchData();
  }, [currentUser]);

  // Silent real-time presence poller (updates online/offline status live without reloading)
  useEffect(() => {
    const timer = setInterval(() => {
      api.admin.getUsers().then((freshUsers) => {
        if (freshUsers && freshUsers.length > 0) {
          setUsers((prevUsers) => {
            return prevUsers.map((existing) => {
              const fresh = freshUsers.find(
                (f) => f.id === existing.id || (f.email && existing.email && f.email.toLowerCase() === existing.email.toLowerCase())
              );
              if (fresh) {
                const isCurrent = currentUser && (
                  existing.id === currentUser.id ||
                  (existing.email && currentUser.email && existing.email.toLowerCase() === currentUser.email.toLowerCase())
                );
                return {
                  ...existing,
                  isOnline: isCurrent ? true : Boolean(fresh.isOnline || fresh.status === 'online'),
                  status: isCurrent ? 'online' : fresh.status,
                  lastSeenAt: fresh.lastSeenAt || existing.lastSeenAt,
                };
              }
              return existing;
            });
          });
        }
      }).catch(() => {});
    }, 20000);

    return () => clearInterval(timer);
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    setIsRetrying(true);
    setConnectionError(null);
    try {
      const [u, r] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getPendingRequests(),
      ]);
      let userList: User[] = (u || []).filter(
        (item) => !["u-rezaei", "u-mohammadi", "u-karimi", "u-nouri", "u-moradi", "u-req-1"].includes(item.id)
      );

      // If currentUser is logged in, ensure the authenticated administrator is in userList and selectable
      if (currentUser) {
        const adminEmail = currentUser.email?.toLowerCase();
        const foundIdx = userList.findIndex(
          (item) => (adminEmail && item.email?.toLowerCase() === adminEmail) || item.id === currentUser.id
        );

        const adminName = currentUser.fullNameFa || currentUser.name || currentUser.fullName || "سعید جلیلی فرد";
        const isSaeed = adminEmail && (adminEmail.includes("jalili") || adminEmail.includes("saeed"));
        const assignedRole: UserRole = isSaeed || currentUser.role === "superadmin" ? "superadmin" : (currentUser.role || "admin");
        
        if (foundIdx === -1) {
          const adminAsUser: User = {
            id: currentUser.id || "u-saeed",
            name: adminName,
            firstNameFa: currentUser.fullNameFa?.split(" ")[0] || "سعید",
            lastNameFa: currentUser.fullNameFa?.split(" ").slice(1).join(" ") || "جلیلی فرد",
            firstName: currentUser.fullName?.split(" ")[0] || "Saeed",
            lastName: currentUser.fullName?.split(" ").slice(1).join(" ") || "Jalili Fard",
            email: currentUser.email || "s.jalilifard@euroslotpars.com",
            role: assignedRole,
            status: "online",
            accountStatus: "active",
            avatar: currentUser.avatar,
            avatarColor: currentUser.avatarColor,
            avatarBgColor: currentUser.avatarBgColor || currentUser.avatarColor,
            avatarMode: currentUser.avatarMode || "photo",
            primaryColor: currentUser.primaryColor || "red",
            phone: currentUser.mobile || "09123456789",
            nationalId: "0012345678",
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
            monthlyBonusTitle: isRtl ? "پاداش مدیریت و راهبری سیستم" : "System Leadership Bonus",
            monthlyBonuses: [],
            score: 95,
            age: 34,
            maritalStatus: "single",
            childrenCount: 0,
            insuranceType: "complementary",
            educationDegree: "master",
            educationField: isRtl ? "مهندسی نرم‌افزار / مکانیک" : "Software & Mechanical Engineering",
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
            avatarColor: currentUser.avatarColor || userList[foundIdx].avatarColor,
            primaryColor: currentUser.primaryColor || userList[foundIdx].primaryColor,
          };
        }
      }

      // Ensure Morteza Shafiee is always present in userList as an active administrator
      const shafieeIdx = userList.findIndex(
        (item) => item.id === "u-shafiee" || item.email?.toLowerCase() === "mshafiee@euroslotpars.com"
      );
      if (shafieeIdx === -1) {
        const shafieeAsUser: User = {
          id: "u-shafiee",
          name: "مرتضی شفیعی",
          fullNameFa: "مرتضی شفیعی",
          fullName: "Morteza Shafiee",
          firstNameFa: "مرتضی",
          lastNameFa: "شفیعی",
          firstName: "Morteza",
          lastName: "Shafiee",
          email: "mshafiee@euroslotpars.com",
          role: "admin",
          status: "offline",
          isOnline: false,
          accountStatus: "active",
          avatarColor: "#8b5cf6",
          primaryColor: "purple",
          avatarMode: "photo",
          phone: "09123480872",
          nationalId: "0000000000",
          department: "engineering",
          jobTitle: isRtl ? "مدیر فنی و مهندسی" : "Engineering Manager",
          company: isRtl ? "یورواسلات پارس" : "Euroslot Pars",
          companyId: "euroslot",
          joinedAt: "1403/01/01",
          daysInCompany: 300,
          doneProjects: 15,
          salary: 620000000,
          hasOvertime: false,
          maxOvertimeHours: 0,
          workLocation: "office",
          contractType: "full_time",
          employeeId: "ESP-002",
          extensionNumber: "125",
          workingFormat: { office: 70, factory: 20, mission: 5, leave: 5 },
          modulesAccess: [],
          recentActivities: [],
          checklists: [],
          isProfileCompleted: true,
          adminApproved: true,
          managerApproved: true,
          documents: [],
          subordinates: [],
        };
        userList = [...userList, shafieeAsUser];
      }

      setUsers(userList);
      if (userList.length > 0) {
        // Default to the current logged-in admin if available, or first user
        const adminUser = currentUser
          ? userList.find((item) => (currentUser.email && item.email?.toLowerCase() === currentUser.email.toLowerCase()) || item.id === currentUser.id)
          : null;
        setSelectedUser(adminUser || userList[0]);
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
  };

  const availableModules = NAVIGATION.filter(n => n.id !== "main" && n.id !== "dashboard");

  const handleToggleModuleAccess = (moduleId: string, checked: boolean) => {
    if (!selectedUser) return;
    const updatedUser = { ...selectedUser };
    if (!updatedUser.modulesAccess) updatedUser.modulesAccess = [];
    
    const group = availableModules.find(g => g.id === moduleId);
    
    if (group) {
      const existing = updatedUser.modulesAccess.find(m => m.moduleId === group.id);
      if (existing) existing.hasAccess = checked;
      else updatedUser.modulesAccess.push({ moduleId: group.id, hasAccess: checked, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
      
      group.items.forEach(item => {
        const exItem = updatedUser.modulesAccess!.find(m => m.moduleId === item.href);
        if (exItem) exItem.hasAccess = checked;
        else updatedUser.modulesAccess!.push({ moduleId: item.href, hasAccess: checked, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
      });
    } else {
      const existing = updatedUser.modulesAccess.find(m => m.moduleId === moduleId);
      if (existing) existing.hasAccess = checked;
      else updatedUser.modulesAccess.push({ moduleId, hasAccess: checked, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
      
      const parentGroup = availableModules.find(g => g.items.some((i: any) => i.href === moduleId));
      if (parentGroup) {
        if (checked) {
          const exGroup = updatedUser.modulesAccess.find(m => m.moduleId === parentGroup.id);
          if (exGroup) exGroup.hasAccess = true;
          else updatedUser.modulesAccess.push({ moduleId: parentGroup.id, hasAccess: true, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
        } else {
          const anyItemChecked = parentGroup.items.some((item: any) => {
             if (item.href === moduleId) return checked;
             const ex = updatedUser.modulesAccess!.find(m => m.moduleId === item.href);
             return ex ? ex.hasAccess : false;
          });
          if (!anyItemChecked) {
             const exGroup = updatedUser.modulesAccess.find(m => m.moduleId === parentGroup.id);
             if (exGroup) exGroup.hasAccess = false;
          }
        }
      }
    }
    
    setSelectedUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    api.admin.updateUserModules(updatedUser.id, updatedUser.modulesAccess || []).catch(console.error);
    toast.success(t("accessUpdated"));
  };

  const handleToggleAllModulesAccess = (checked: boolean) => {
    if (!selectedUser) return;
    const updatedUser = { ...selectedUser };
    if (!updatedUser.modulesAccess) updatedUser.modulesAccess = [];
    
    availableModules.forEach(module => {
      const existing = updatedUser.modulesAccess!.find(m => m.moduleId === module.id);
      if (existing) existing.hasAccess = checked;
      else updatedUser.modulesAccess!.push({ moduleId: module.id, hasAccess: checked, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
      
      module.items.forEach((item: any) => {
        const exItem = updatedUser.modulesAccess!.find(m => m.moduleId === item.href);
        if (exItem) exItem.hasAccess = checked;
        else updatedUser.modulesAccess!.push({ moduleId: item.href, hasAccess: checked, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
      });
    });
    
    setSelectedUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    api.admin.updateUserModules(updatedUser.id, updatedUser.modulesAccess || []).catch(console.error);
    toast.success(t("accessUpdated"));
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await api.admin.updateUser(userId, { role: newRole });
      setSelectedUser(prev => prev && prev.id === userId ? { ...prev, role: newRole } : prev);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (currentUser && (currentUser.id === userId || currentUser.email === updated.email)) {
        updateUserStore({ role: newRole });
      }
      toast.success(
        isRtl
          ? `نقش کاربر «${updated.name}» با موفقیت به‌روزرسانی شد.`
          : `Role for "${updated.name}" updated successfully.`
      );
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در به‌روزرسانی نقش کاربر" : "Failed to update user role"));
    }
  };

  const handleUpdateProfile = async (userId: string, updates: Partial<User>) => {
    try {
      const updated = await api.admin.updateUser(userId, updates);
      const mergedUser = { ...selectedUser, ...updated, ...updates } as User;

      // Update selectedUser state
      setSelectedUser(prev => prev && prev.id === userId ? mergedUser : prev);

      // Update users list
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...mergedUser } : u));

      // If currentUser is being updated (admin profile):
      if (currentUser && (currentUser.id === userId || (currentUser.email && mergedUser.email && currentUser.email.toLowerCase() === mergedUser.email.toLowerCase()))) {
        const computedFullNameFa = mergedUser.fullNameFa || (mergedUser.firstNameFa && mergedUser.lastNameFa ? `${mergedUser.firstNameFa} ${mergedUser.lastNameFa}` : mergedUser.name);
        const computedFullNameEn = mergedUser.fullName || (mergedUser.firstName && mergedUser.lastName ? `${mergedUser.firstName} ${mergedUser.lastName}` : mergedUser.name);

        const isSaeed = Boolean(
          (currentUser.email && (currentUser.email.includes("jalili") || currentUser.email.includes("saeed"))) ||
          currentUser.id === "u-saeed" ||
          userId === "u-saeed"
        );
        const resolvedRole: UserRole = isSaeed || currentUser.role === "superadmin" ? "superadmin" : (mergedUser.role || currentUser.role);

        updateUserStore({
          ...updates,
          fullNameFa: computedFullNameFa,
          fullName: computedFullNameEn,
          name: isRtl ? (computedFullNameFa || computedFullNameEn) : (computedFullNameEn || computedFullNameFa),
          email: mergedUser.email,
          mobile: mergedUser.phone,
          role: resolvedRole,
          department: mergedUser.department,
          jobTitle: mergedUser.jobTitle,
          avatarColor: mergedUser.avatarColor,
          primaryColor: mergedUser.primaryColor,
        });

        // Synchronize active localStorage auth session
        try {
          const rawAuth = localStorage.getItem("esp_auth_user");
          if (rawAuth) {
            const authObj = JSON.parse(rawAuth);
            const newAuthObj = {
              ...authObj,
              ...updates,
              fullNameFa: computedFullNameFa,
              fullName: computedFullNameEn,
              name: isRtl ? (computedFullNameFa || computedFullNameEn) : (computedFullNameEn || computedFullNameFa),
              email: mergedUser.email,
              mobile: mergedUser.phone,
              role: mergedUser.role,
              department: mergedUser.department,
              jobTitle: mergedUser.jobTitle,
            };
            localStorage.setItem("esp_auth_user", JSON.stringify(newAuthObj));
            localStorage.setItem("esp-auth-user", JSON.stringify(newAuthObj));
          }
        } catch {}

        // Attempt user service profile update if available
        try {
          await api.user?.updateProfile?.({
            fullName: computedFullNameEn,
            fullNameFa: computedFullNameFa,
            mobile: mergedUser.phone,
            email: mergedUser.email,
          });
        } catch {}
      }

      // Persist to esp_admin_users in localStorage
      try {
        const rawStored = localStorage.getItem("esp_admin_users");
        let list: User[] = rawStored ? JSON.parse(rawStored) : [];
        if (!Array.isArray(list) || list.length === 0) {
          list = [...users];
        }
        const idx = list.findIndex(u => u.id === userId || (u.email && mergedUser.email && u.email.toLowerCase() === mergedUser.email.toLowerCase()));
        if (idx !== -1) list[idx] = { ...list[idx], ...mergedUser };
        else list.push(mergedUser);
        localStorage.setItem("esp_admin_users", JSON.stringify(list));
      } catch {}

      toast.success(
        isRtl
          ? `اطلاعات «${mergedUser.name}» با موفقیت ذخیره شد.`
          : `Profile for "${mergedUser.name}" successfully updated.`
      );
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      toast.error(err?.message || (isRtl ? "خطا در به‌روزرسانی اطلاعات" : "Failed to update profile"));
      throw err;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-full bg-background font-sans w-full relative">
      {/* Top Header */}
      <AppHeader
        tag="Admin"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      />

      <div className="flex flex-1 w-full relative">
        {/* Sidebar Navigation */}
        <AdminSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />

        {/* Main Content Area */}
        <div className="flex-1 bg-transparent w-full relative z-10 p-2.5 sm:p-3.5 lg:p-4 xl:p-5 flex flex-col min-h-0">
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.div
                key="admin-loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[330px_1fr] 2xl:grid-cols-[360px_1fr] gap-3 w-full max-w-[1600px] mx-auto items-stretch pb-6 min-h-full"
              >
                <Skeleton className="col-span-1 h-[650px] w-full rounded-[1.5rem] opacity-40 bg-muted/50" />
                <Skeleton className="col-span-1 h-[650px] w-full rounded-[1.5rem] opacity-40 bg-muted/50" />
              </motion.div>
            ) : connectionError && users.length === 0 && requests.length === 0 ? (
              <ServerConnectionError
                key="server-connection-error-full"
                error={connectionError}
                onRetry={fetchData}
                isRetrying={isRetrying}
                targetUrl={BACKEND_URL}
                variant="full"
              />
            ) : (
              <motion.div
                key={activeTab}
                variants={tabMotionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full min-h-full flex flex-col flex-1"
              >
                {connectionError && (
                  <ServerConnectionError
                    error={connectionError}
                    onRetry={fetchData}
                    isRetrying={isRetrying}
                    targetUrl={BACKEND_URL}
                    variant="banner"
                    className="mb-4"
                    onDismiss={() => setConnectionError(null)}
                  />
                )}
                {activeTab === 'home' && (
                  <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-4 flex-1">
                    {/* On small screens (< lg): Top Search & Avatars Header */}
                    <div className="block lg:hidden w-full mb-3">
                      <AdminUserSearchAvatars
                        users={users}
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[330px_1fr] 2xl:grid-cols-[360px_1fr] gap-3 w-full items-stretch flex-1">
                      {selectedUser ? (
                        <div className="col-span-1 w-full min-w-0 flex flex-col h-full">
                          <AdminProfileStats 
                            selectedUser={selectedUser} 
                            onUpdateRole={handleUpdateUserRole}
                          />
                        </div>
                      ) : (
                        <div className="col-span-1 w-full min-w-0 flex flex-col h-full items-center justify-center p-6 bg-slate-100/90 dark:bg-slate-800/40 rounded-[1.75rem] border border-border/40 text-center">
                          <UserCircle2 className="size-12 text-muted-foreground/40 mb-3" />
                          <h3 className="text-sm font-bold text-foreground mb-1">
                            {isRtl ? "کاربری در سیستم یافت نشد" : "No Users Found"}
                          </h3>
                          <p className="text-xs text-muted-foreground max-w-xs mb-4">
                            {isRtl ? "هنوز کاربری در سرور ثبت نشده است. می‌توانید از بخش ساخت کاربر، کاربر جدید اضافه کنید." : "No users registered on the server yet. You can create a new user."}
                          </p>
                          <Button size="sm" onClick={() => setActiveTab('add')} className="rounded-xl gap-1.5 cursor-pointer">
                            <UserPlus className="size-3.5" />
                            <span>{isRtl ? "افزودن کاربر جدید" : "Add New User"}</span>
                          </Button>
                        </div>
                      )}
                      
                      <div className="col-span-1 w-full min-w-0 flex flex-col h-full">
                        <AdminTasksTime 
                          selectedUser={selectedUser}
                          users={users}
                          setUsers={setUsers}
                          setSelectedUser={setSelectedUser}
                          availableModules={availableModules}
                          tMenu={tMenu}
                          handleToggleModuleAccess={handleToggleModuleAccess}
                          handleToggleAllModulesAccess={handleToggleAllModulesAccess}
                          onNavigateToAccess={() => { setUserToEdit(selectedUser); setActiveTab('add'); }}
                          hideSearchAvatarsOnMobile={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'usersTable' && (
                  <div className="w-full h-full flex-1">
                    <AdminUsersTable 
                      users={users}
                      setUsers={setUsers}
                      selectedUser={selectedUser}
                      setSelectedUser={setSelectedUser}
                      setUserToEdit={setUserToEdit}
                      setActiveTab={setActiveTab}
                      onRefresh={fetchData}
                    />
                  </div>
                )}

                {activeTab === 'add' && (
                  <div className="w-full h-full flex-1">
                    <AdminUserConfig 
                      selectedUser={userToEdit}
                      users={users}
                      setUsers={setUsers}
                      setSelectedUser={setSelectedUser}
                      availableModules={availableModules}
                      tMenu={tMenu}
                      handleToggleModuleAccess={handleToggleModuleAccess}
                      handleToggleAllModulesAccess={handleToggleAllModulesAccess}
                      onRefresh={fetchData}
                    />
                  </div>
                )}

                {activeTab === 'requests' && (
                  <div className="w-full h-full flex-1">
                    <AdminRequests 
                      requests={requests}
                      setRequests={setRequests}
                      users={users}
                      setUsers={setUsers}
                      onRefresh={fetchData}
                      availableModules={availableModules}
                    />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="flex items-center justify-center flex-1 min-h-[420px]">
                    <div className="bg-card rounded-2xl p-10 max-w-lg w-full text-center border border-border/40 shadow-xs">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Settings size={32} />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{t("tabSettingsTitle")}</h2>
                      <p className="text-muted-foreground mb-8">{t("tabSettingsDesc")}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
