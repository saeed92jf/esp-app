// src/components/locale-switcher.tsx
'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, localeLabels, type Locale } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

/**
 * Locale switcher.
 * Re-navigates to the same pathname under the chosen locale, keeping
 * the user on the page they were viewing.
 */
export function LocaleSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // Wrap navigation in a transition to avoid blocking the UI.
  const [isPending, startTransition] = useTransition();

  function onSelect(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      // `pathname` here is already locale-stripped by our navigation helper,
      // so we only need to pass the target locale.
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          aria-label={t('language')}
          className="gap-2"
        >
          <Globe className="size-4" aria-hidden="true" />
          <span>{localeLabels[locale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={() => onSelect(loc)}
            // Mark the active locale for assistive tech.
            aria-current={loc === locale ? 'true' : undefined}
            className="cursor-pointer"
          >
            {localeLabels[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
