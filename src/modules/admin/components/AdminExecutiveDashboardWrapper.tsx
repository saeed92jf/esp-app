"use client";

import React from "react";
import { useAdmin } from "../hooks/useAdmin";
import { AdminExecutiveDashboard } from "./AdminExecutiveDashboard";

export function AdminExecutiveDashboardWrapper() {
  const { users } = useAdmin();
  return <AdminExecutiveDashboard users={users} />;
}
