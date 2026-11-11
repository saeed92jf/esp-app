"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UserCircle2, UserPlus } from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin";
import { AdminUserSearchAvatars } from "../AdminUserSearchAvatars";
import { AdminProfileStats } from "../AdminProfileStats";
import { AdminTasksTime } from "../AdminTasksTime";

export function AdminOverviewSection() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();
  const tMenu = useTranslations("Menu");

  const {
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    setUserToEdit,
    availableModules,
    handleToggleModuleAccess,
    handleToggleAllModulesAccess,
    handleUpdateUserRole,
  } = useAdmin();

  const handleNavigateToUserAccess = () => {
    setUserToEdit(selectedUser);
    if (selectedUser?.id) {
      router.push(`/admin/config?userId=${selectedUser.id}`);
    } else {
      router.push("/admin/config");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-4 flex-1">
      {/* Top Search & Avatars Header */}
      <div className="w-full mb-3">
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
              {isRtl
                ? "هنوز کاربری در سرور ثبت نشده است. می‌توانید از بخش ساخت کاربر، کاربر جدید اضافه کنید."
                : "No users registered on the server yet. You can create a new user."}
            </p>
            <Button
              size="sm"
              onClick={() => router.push("/admin/config")}
              className="rounded-xl gap-1.5 cursor-pointer"
            >
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
            onNavigateToAccess={handleNavigateToUserAccess}
          />
        </div>
      </div>
    </div>
  );
}
