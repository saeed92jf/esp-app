"use client";

import React from "react";
import { AdminProvider } from "../context/AdminContext";
import { AdminLayout } from "./AdminLayout";
import { AdminOverviewSection } from "./sections/AdminOverviewSection";

/**
 * AdminDashboard legacy wrapper.
 * Kept for backwards compatibility with any existing imports.
 */
export function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminLayout>
        <AdminOverviewSection />
      </AdminLayout>
    </AdminProvider>
  );
}
