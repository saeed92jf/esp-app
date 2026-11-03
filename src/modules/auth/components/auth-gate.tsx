// src/modules/auth/components/auth-gate.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { UserRole } from "@/types/auth";
import { toast } from "sonner";

interface AuthGateProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Wraps protected page content. While the session is being restored it
 * shows a lightweight loader. If unauthenticated, it redirects to login.
 * If user lacks required role, it redirects to dashboard.
 */
export function AuthGate({ children, allowedRoles }: AuthGateProps) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      } else if (allowedRoles && allowedRoles.length > 0 && user.role !== 'superadmin' && !allowedRoles.includes(user.role)) {
        toast.error(locale === "fa" ? "شما مجوز دسترسی به این بخش مدیریتی را ندارید." : "You do not have permission to access this section.");
        router.replace("/dashboard");
      }
    }
  }, [mounted, loading, user, router, pathname, allowedRoles]);

  if (!mounted || loading || !user) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary/50" />
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && user.role !== 'superadmin' && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
