"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { api } from "@/services";
import { User, PendingRequest } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Settings, CheckCircle2, Mail, Clock, Send, UserCheck } from "lucide-react";
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

import { AdminSidebar } from "./AdminSidebar";
import { AdminProfileStats } from "./AdminProfileStats";
import { AdminTasksTime } from "./AdminTasksTime";
import { AdminUserConfig } from "./AdminUserConfig";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminRequests } from "./AdminRequests";

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
  
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<ServerConnectionErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'usersTable' | 'add' | 'requests' | 'settings'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setIsRetrying(true);
    setConnectionError(null);
    try {
      const [u, r] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getPendingRequests(),
      ]);
      setUsers(u);
      if (u.length > 0) setSelectedUser(u[0]);
      setRequests(r);
      setConnectionError(null);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      const apiErr = toApiError(err);
      setConnectionError({
        code: apiErr.code,
        message: apiErr.message,
        status: apiErr.status,
        timestamp: new Date(),
        endpoint: "http://192.168.0.171:8080/api/v1",
      });
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const handleSwitchToMock = async () => {
    setLoading(true);
    try {
      const { FakeAdminService } = await import("../services/admin.fake.service");
      const fakeAdmin = new FakeAdminService();
      const [u, r] = await Promise.all([
        fakeAdmin.getUsers(),
        fakeAdmin.getPendingRequests(),
      ]);
      setUsers(u);
      if (u.length > 0) setSelectedUser(u[0]);
      setRequests(r);
      setConnectionError(null);
      toast.success(
        isRtl
          ? "داده‌های شبیه‌سازی (Mock) با موفقیت بارگذاری شدند."
          : "Mock data loaded successfully."
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
          setActiveTab={setActiveTab}
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
                onSwitchToMock={handleSwitchToMock}
                targetUrl="http://192.168.0.171:8080/api/v1"
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
                    targetUrl="http://192.168.0.171:8080/api/v1"
                    variant="banner"
                    className="mb-4"
                    onDismiss={() => setConnectionError(null)}
                  />
                )}
                {activeTab === 'home' && (
                  <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[330px_1fr] 2xl:grid-cols-[360px_1fr] gap-3 w-full max-w-[1600px] mx-auto items-stretch pb-4 lg:min-h-full flex-1">
                    {selectedUser && (
                      <div className="col-span-1 w-full min-w-0 flex flex-col h-full">
                        <AdminProfileStats selectedUser={selectedUser} />
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
                        onNavigateToAccess={() => setActiveTab('add')}
                      />
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
                      setActiveTab={setActiveTab}
                    />
                  </div>
                )}

                {activeTab === 'add' && (
                  <div className="w-full h-full flex-1">
                    <AdminUserConfig 
                      selectedUser={selectedUser}
                      users={users}
                      setUsers={setUsers}
                      setSelectedUser={setSelectedUser}
                      availableModules={availableModules}
                      tMenu={tMenu}
                      handleToggleModuleAccess={handleToggleModuleAccess}
                      handleToggleAllModulesAccess={handleToggleAllModulesAccess}
                    />
                  </div>
                )}

                {activeTab === 'requests' && (
                  <div className="w-full h-full flex-1">
                    <AdminRequests 
                      requests={requests}
                      setRequests={setRequests}
                      users={users}
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
