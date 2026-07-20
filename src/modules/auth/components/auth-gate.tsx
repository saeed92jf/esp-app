// src/components/auth/auth-gate.tsx
"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { WelcomeScreen } from "@/modules/welcome/components/welcome-screen";

/**
 * Wraps protected page content. While the session is being restored it
 * shows a lightweight loader. When there is no user it renders the public
 * WelcomeScreen; otherwise it renders the children (real page content).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  return <>{children}</>;
}
