// src/app/(rtl)/dashboard/layout.tsx
import { AuthGuard } from '@/components/auth/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Every route under /dashboard is protected by a single guard here.
  return <AuthGuard>{children}</AuthGuard>;
}
