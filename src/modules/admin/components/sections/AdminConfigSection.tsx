"use client";

import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAdmin } from "../../hooks/useAdmin";
import { AdminUserConfig } from "../AdminUserConfig";

export function AdminConfigSection() {
  const tMenu = useTranslations("Menu");
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId") || searchParams.get("id");

  const {
    users,
    setUsers,
    userToEdit,
    setUserToEdit,
    setSelectedUser,
    availableModules,
    handleToggleModuleAccess,
    handleToggleAllModulesAccess,
    fetchData,
  } = useAdmin();

  // If userId is in query params, find matching user
  useEffect(() => {
    if (queryUserId && users.length > 0) {
      const match = users.find(
        (u) =>
          u.id === queryUserId ||
          (u.email && u.email.toLowerCase() === queryUserId.toLowerCase())
      );
      if (match) {
        setUserToEdit(match);
      }
    }
  }, [queryUserId, users, setUserToEdit]);

  const activeUser = useMemo(() => {
    if (queryUserId && users.length > 0) {
      const match = users.find(
        (u) =>
          u.id === queryUserId ||
          (u.email && u.email.toLowerCase() === queryUserId.toLowerCase())
      );
      if (match) return match;
    }
    return userToEdit;
  }, [queryUserId, users, userToEdit]);

  return (
    <div className="w-full h-full flex-1">
      <AdminUserConfig
        selectedUser={activeUser}
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
  );
}
