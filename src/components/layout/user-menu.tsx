// src/components/layout/user-menu.tsx
'use client';
import Link from 'next/link';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/providers/auth-provider';

// Account control: shows a login button when signed out, and an avatar
// dropdown with profile/logout when signed in. Reads state from AuthProvider.
export function UserMenu() {
  const { user, logout, isLoading } = useAuth();

  // Skeleton-ish placeholder while the session is being resolved.
  if (isLoading) {
    return <div className="bg-muted size-9 animate-pulse rounded-full" />;
  }

  // Signed-out state.
  if (!user) {
    return (
      <Button asChild variant="default" size="sm">
        <Link href="/login">
          <LogIn className="me-2 size-4" />
          ورود
        </Link>
      </Button>
    );
  }

  // Derive initials for the avatar fallback (no external image needed).
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {/* align="end" keeps the menu edge-aligned in both directions */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="me-2 size-4" />
            پروفایل
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive">
          <LogOut className="me-2 size-4" />
          خروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
