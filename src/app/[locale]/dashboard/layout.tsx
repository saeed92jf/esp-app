import type { ReactNode } from 'react';
import { SideMenu } from '@/components/layout/side-menu';

// Inner layout for the dashboard area (no <html>/<body> here)
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-6">
      <SideMenu />
      <section className="flex-1">{children}</section>
    </div>
  );
}
