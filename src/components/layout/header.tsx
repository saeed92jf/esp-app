// src/components/layout/header.tsx
'use client';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/providers/ui-provider';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';

// Top app bar. Uses logical spacing (ms/me/ps/pe) so it mirrors correctly
// between the (rtl) and (main) route groups without extra conditionals.
export function Header() {
  // Pull the sidebar toggle from the central UI provider (single source of truth).
  const { toggleSidebar } = useUI();

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4">
        {/* Sidebar trigger — hidden on large screens where menu is persistent */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu className="size-5" />
        </Button>

        {/* Brand. Logical margin-end pushes the rest of the bar away. */}
        <Link href="/" className="me-auto font-bold">
          ESP App
        </Link>

        {/* Trailing controls cluster */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
