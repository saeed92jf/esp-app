// src/app/(rtl)/layout.tsx
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SideMenu } from '@/components/layout/side-menu';

// RTL route group: sets dir="rtl" + lang="fa" via a wrapping element.
// We can't set <html dir> per-group, so we scope dir on a container div.
export default function RtlLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" lang="fa" className="flex min-h-dvh flex-col">
      <Header />
      <SideMenu />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
