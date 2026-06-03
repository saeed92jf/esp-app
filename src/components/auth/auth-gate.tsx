// src/components/auth/auth-gate.tsx
'use client';

import type { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { WelcomeScreen } from '@/components/welcome/welcome-screen';

/**
 * Wraps protected page content. While the session is being restored from
 * localStorage it shows a lightweight loader. When there is no user it
 * renders the public WelcomeScreen; otherwise it renders the children
 * (the real, post-login page content).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useSimpleAuth();

  // Avoid a flash of the wrong screen during the initial restore
  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated: show the public landing screen
  if (!user) {
    return <WelcomeScreen />;
  }

  // Authenticated: render the actual home content
  return <>{children}</>;
}
