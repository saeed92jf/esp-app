// src/components/auth/auth-guard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrating } = useAuth();

  useEffect(() => {
    // Wait until the persisted session has been read before deciding.
    if (isHydrating) return;

    if (!isAuthenticated) {
      // Preserve intended destination so we can return after login.
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, isHydrating, pathname, router]);

  // While hydrating or redirecting, render a lightweight loader.
  if (isHydrating || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
