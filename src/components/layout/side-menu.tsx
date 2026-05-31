// src/components/layout/side-menu.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Cpu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useUI } from '@/providers/ui-provider';

// Navigation model kept outside the component so it can be reused/tested.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/devices', label: 'دستگاه‌ها', icon: Cpu },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
] as const;

// Shared link list rendered in both the desktop rail and the mobile drawer.
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SideMenu() {
  // sidebarOpen drives the mobile drawer; desktop rail is always visible.
  const { sidebarOpen, setSidebar } = useUI();

  return (
    <>
      {/* Desktop persistent rail. Border on the inline-start edge via logical prop. */}
      <aside className="bg-background fixed inset-y-0 top-14 z-30 hidden w-60 border-e lg:block">
        <NavLinks />
      </aside>

      {/* Mobile drawer. Radix/shadcn Sheet auto-flips side based on dir. */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebar}>
        <SheetContent side="start" className="w-60 p-0">
          <NavLinks onNavigate={() => setSidebar(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
