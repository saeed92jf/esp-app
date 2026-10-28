'use client';

import React from 'react';
import { usePathname } from '@/i18n/navigation';
import { isPanelBackgroundRoute } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ConditionalHeader } from '@/components/layout/conditional-header';
import { ConditionalFooter } from '@/components/layout/conditional-footer';
import { GlobalConfirmModal } from '@/components/global-confirm-modal';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Global AppShell wrapper providing seamless background inheritance and flexible layout.
 * Ensures the root container and <main> automatically adapt their background color
 * (e.g., bg-panel for panel routes, bg-background for standard pages), making it
 * mathematically impossible for white body gaps or hairline seams to appear above the footer.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPanelBg = isPanelBackgroundRoute(pathname);

  return (
    <div
      className={cn(
        'relative flex flex-col min-h-dvh w-full transition-colors duration-150',
        isPanelBg ? 'bg-panel dark:bg-background' : 'bg-background'
      )}
    >
      <ConditionalHeader />
      <main
        className={cn(
          'flex-1 flex flex-col min-h-0 w-full transition-colors duration-150',
          isPanelBg ? 'bg-panel dark:bg-background' : 'bg-background'
        )}
      >
        {children}
      </main>
      <GlobalConfirmModal />
      <ConditionalFooter />
    </div>
  );
}
