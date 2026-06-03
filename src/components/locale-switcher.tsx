'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';
import { Globe } from 'lucide-react';

import { Switch } from '@/components/ui/switch';

type Props = {
  onLocaleChange?: () => void;
};

export function LocaleSwitcher({ onLocaleChange }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const checked = locale === 'fa';

  function changeLocale(next: Locale) {
    onLocaleChange?.();

    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  function handleToggle(value: boolean) {
    const nextLocale: Locale = value ? 'fa' : 'en';
    if (nextLocale === locale) return;

    changeLocale(nextLocale);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Globe className="size-4" />
        <span>Language</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">EN</span>

        <Switch
          checked={checked}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />

        <span className="text-muted-foreground text-xs">FA</span>
      </div>
    </div>
  );
}
