// src/components/auth/auth-gate.tsx
"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
/**
 * Wraps protected page content. While the session is being restored it
 * shows a lightweight loader.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary/50" />
      </div>
    );
  }

  return <>{children}</>;
}
