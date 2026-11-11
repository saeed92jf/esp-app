"use client";

import React from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { AdminRequests } from "../AdminRequests";

export function AdminRequestsSection() {
  const {
    requests,
    setRequests,
    users,
    setUsers,
    fetchData,
    availableModules,
  } = useAdmin();

  return (
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
  );
}
