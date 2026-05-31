// src/app/(main)/layout.tsx
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SideMenu } from '@/components/layout/side-menu';

// LTR route group: default direction. Same components reused with logical props.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" lang="en" className="flex min-h-dvh flex-col">
      <Header />
      <SideMenu />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
