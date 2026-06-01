// src/components/layout/user-menu.tsx
'use client';

import { useTranslations } from 'next-intl';
import { User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================
// USER MENU
// Guest state  -> Login + Register buttons.
// Auth state   -> avatar/profile icon with a dropdown.
// `isAuthenticated` is a prop for now; wire it to your real
// session source (next-auth, cookies, etc.) later.
// ============================================================

interface UserMenuProps {
  // Whether a user session is active. Defaults to guest.
  isAuthenticated?: boolean;
  // Display name shown in the dropdown header when signed in.
  userName?: string;
}

export function UserMenu({ isAuthenticated = false, userName }: UserMenuProps) {
  const t = useTranslations('Auth');

  // ---- Guest: show auth entry points ----
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        {/* Ghost on small screens to save space, full on md+. */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">{t('login')}</Link>
        </Button>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/register">{t('register')}</Link>
        </Button>
      </div>
    );
  }

  // ---- Authenticated: profile dropdown ----
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          // Accessible label so screen readers announce the trigger.
          aria-label={t('accountMenu')}
        >
          <User className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      {/* align="end" pins the panel to the logical end edge. */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          {userName ?? t('account')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="size-4" />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <SettingsIcon className="size-4" />
            <span>{t('settings')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center gap-2">
          <LogOut className="size-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
