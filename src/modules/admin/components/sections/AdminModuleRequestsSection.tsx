"use client";

import React from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { AdminModuleRequestsView } from "../AdminModuleRequestsView";

export function AdminModuleRequestsSection() {
  const { users, setUsers, currentUser } = useAdmin();

  return (
    <div className="w-full h-full flex-1">
      <AdminModuleRequestsView
        users={users}
        setUsers={setUsers}
        currentUser={currentUser}
      />
    </div>
  );
}
