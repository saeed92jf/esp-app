"use client";

import React from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { AdminUsersTable } from "../AdminUsersTable";
import { useRouter } from "@/i18n/navigation";

export function AdminUsersSection() {
  const router = useRouter();
  const {
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    setUserToEdit,
    fetchData,
    navigateToTab,
  } = useAdmin();

  return (
    <div className="w-full h-full flex-1">
      <AdminUsersTable
        users={users}
        setUsers={setUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setUserToEdit={(u) => {
          setUserToEdit(u);
          if (u?.id) {
            router.push(`/admin/config?userId=${u.id}`);
          }
        }}
        setActiveTab={navigateToTab}
        onRefresh={fetchData}
      />
    </div>
  );
}
