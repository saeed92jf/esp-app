// src/providers/index.tsx
'use client';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { UIProvider } from './ui-provider';

// Single composition root for all client-side providers.
// Order matters: Query (data) -> Auth (session) -> UI (local view state).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <UIProvider>
          {children}
          {/* Global toast portal; rich colors + RTL-aware via dir on <html> */}
          <Toaster richColors closeButton position="top-center" />
        </UIProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
