// src/app/[locale]/dashboard/page.tsx
"use client";

import dynamic from "next/dynamic";
import { AuthGate } from "@/modules/auth/components/auth-gate";

const Dashboard = dynamic(
  () => import("@/modules/dashboard/components/dashboard").then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary/50" />
      </div>
    ),
  }
);

/**
 * Enterprise Dashboard route.
 * Wrapped in AuthGate and loaded dynamically with ssr: false to guarantee
 * client-only grid layout and avoid SSR DOM measurement mismatches.
 */
export default function DashboardPage() {
  return (
    <AuthGate>
      <div className="w-full flex-1 flex flex-col min-h-full">
        <Dashboard />
      </div>
    </AuthGate>
  );
}
