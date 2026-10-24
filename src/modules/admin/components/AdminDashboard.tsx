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

import { AdminSidebar } from "./AdminSidebar";
import { AdminProfileStats } from "./AdminProfileStats";
import { AdminTasksTime } from "./AdminTasksTime";
import { AdminHeatmapModules } from "./AdminHeatmapModules";
import { AdminUserConfig } from "./AdminUserConfig";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminRequests } from "./AdminRequests";

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
    <div className="flex flex-col h-[calc(100vh)] bg-panel dark:bg-background font-sans w-full overflow-hidden relative">
      {/* Top Header */}
      <AppHeader
        tag="Admin"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
        position="absolute"
      />

      <div className="flex flex-1 overflow-hidden w-full relative pt-[72px]">
        {/* Sidebar Navigation */}
        <AdminSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent h-full w-full relative z-10 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_6fr_3.5fr] gap-3 h-full w-full max-w-[1440px] mx-auto items-stretch min-h-0">
              <Skeleton className="col-span-1 lg:col-span-1 h-full min-h-0 min-w-0 rounded-[2rem] opacity-40 bg-muted/50" />
              <Skeleton className="col-span-1 lg:col-span-1 h-full min-h-0 min-w-0 rounded-[2rem] opacity-40 bg-muted/50" />
              <Skeleton className="col-span-1 lg:col-span-1 h-full min-h-0 min-w-0 rounded-[2rem] opacity-40 bg-muted/50" />
            </div>
          ) : activeTab === 'home' ? (
            <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_6fr_3.5fr] gap-3 h-full w-full max-w-[1440px] mx-auto items-stretch min-h-0">
              
              {selectedUser && (
                <div className="col-span-1 lg:col-span-1 h-full min-h-0 min-w-0">
                  <AdminProfileStats selectedUser={selectedUser} />
                </div>
              )}
              
              <div className="col-span-1 lg:col-span-1 h-full min-h-0 min-w-0">
                <AdminTasksTime 
                  selectedUser={selectedUser}
                  users={users}
                  setUsers={setUsers}
                  setSelectedUser={setSelectedUser}
                />
              </div>

              <div className="col-span-1 lg:col-span-1 h-full min-h-0 min-w-0">
                <AdminHeatmapModules 
                  selectedUser={selectedUser}
                  availableModules={availableModules}
                  tMenu={tMenu}
                  handleToggleModuleAccess={handleToggleModuleAccess}
                  handleToggleAllModulesAccess={handleToggleAllModulesAccess}
                />
              </div>

            </div>
          ) : null}

          {!loading && activeTab === 'usersTable' && (
            <AdminUsersTable 
              users={users}
              setUsers={setUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              setActiveTab={setActiveTab}
            />
          )}

          {!loading && activeTab === 'add' && (
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
          )}

          {!loading && activeTab === 'requests' && (
            <AdminRequests 
              requests={requests}
              setRequests={setRequests}
              onRefresh={fetchData}
            />
          )}

          {!loading && activeTab === 'settings' && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-card rounded-2xl p-10 max-w-lg w-full text-center border border-border/40">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t("tabSettingsTitle")}</h2>
                <p className="text-muted-foreground mb-8">{t("tabSettingsDesc")}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
