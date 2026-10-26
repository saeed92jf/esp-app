"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/services";
import { User, PendingRequest } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Settings, CheckCircle2, Mail, Clock, Send, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { NAVIGATION } from "@/config/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/app-header";
import { motion, AnimatePresence } from "motion/react";

import { AdminSidebar } from "./AdminSidebar";
import { AdminProfileStats } from "./AdminProfileStats";
import { AdminTasksTime } from "./AdminTasksTime";
import { AdminUserConfig } from "./AdminUserConfig";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminRequests } from "./AdminRequests";

const tabMotionVariants = {
  initial: {
    opacity: 0,
    y: 14,
    scale: 0.992,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.992,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

export function AdminDashboard() {
  const t = useTranslations("Admin");
  const tMenu = useTranslations("Menu");
  
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'usersTable' | 'add' | 'requests' | 'settings'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getPendingRequests(),
      ]);
      setUsers(u);
      if (u.length > 0) setSelectedUser(u[0]);
      setRequests(r);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
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
    toast.success(t("accessUpdated"));
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-var(--header-height,0px))] bg-white dark:bg-background font-sans w-full relative">
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
        <main className="flex-1 bg-transparent w-full relative z-10 p-2.5 sm:p-3.5 lg:p-4 xl:p-5 flex flex-col min-h-0">
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
            ) : (
              <motion.div
                key={activeTab}
                variants={tabMotionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full min-h-full flex flex-col flex-1"
              >
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
        </main>
      </div>
    </div>
  );
}
