// src/app/(rtl)/(auth)/layout.tsx
import { Suspense } from 'react';
import { GuestGuard } from '@/components/auth/guest-guard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // GuestGuard uses useSearchParams, so it needs a Suspense boundary.
  // All guest-only pages under this group are wrapped in one place.
  return (
    <Suspense fallback={null}>
      <GuestGuard>{children}</GuestGuard>
    </Suspense>
  );
}
