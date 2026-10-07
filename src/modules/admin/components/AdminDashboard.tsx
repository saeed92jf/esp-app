"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminFakeService } from "../services/admin.fake.service";
import { User, PendingRequest } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Plus, ShieldAlert, Settings } from "lucide-react";
import { toast } from "sonner";
import { NAVIGATION } from "@/config/navigation";
import { Skeleton } from "@/components/ui/skeleton";

import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminProfileStats } from "./AdminProfileStats";
import { AdminTasksTime } from "./AdminTasksTime";
import { AdminHeatmapModules } from "./AdminHeatmapModules";
import { AdminUserConfig } from "./AdminUserConfig";

export function AdminDashboard() {
  const t = useTranslations("Admin");
  const tMenu = useTranslations("Menu");
  
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'add' | 'requests' | 'settings'>('home');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [u, r] = await Promise.all([
      AdminFakeService.getUsers(),
      AdminFakeService.getPendingRequests(),
    ]);
    setUsers(u);
    if (u.length > 0) setSelectedUser(u[0]);
    setRequests(r);
    setLoading(false);
  };

  const adminUser = users.find((u) => u.role === "admin");
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
    <div className="flex h-screen w-full bg-background p-0 m-0 font-sans rtl">
      <div className="flex w-full h-full bg-card rounded-none border-none shadow-none overflow-hidden relative">
        
        <AdminSidebar 
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adminUser={adminUser}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          <AdminHeader 
            users={users}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />

          <div className="flex-1 overflow-hidden px-8 pb-8 pt-4 scrollbar-hide">
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
              <div className="flex items-center justify-center h-full">
                <div className="bg-card rounded-2xl p-10 max-w-lg w-full text-center border border-border/40">
                  <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{t("tabReqTitle")}</h2>
                  <p className="text-muted-foreground mb-8">{t("tabReqDesc")}</p>
                </div>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
