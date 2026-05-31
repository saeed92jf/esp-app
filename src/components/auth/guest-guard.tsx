// src/components/auth/guest-guard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrating } = useAuth();

  useEffect(() => {
    // Wait until the persisted session has been read before deciding.
    if (isHydrating) return;

    if (isAuthenticated) {
      // Honor an explicit redirect target, otherwise go to the dashboard.
      const redirect = searchParams.get('redirect');
      router.replace(redirect ? decodeURIComponent(redirect) : '/dashboard');
    }
  }, [isAuthenticated, isHydrating, searchParams, router]);

  // While hydrating or redirecting an authenticated user, show a loader.
  if (isHydrating || isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
