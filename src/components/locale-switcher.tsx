// src/components/LocaleSwitcher.tsx
"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";

import { Combobox, type ComboboxOption } from "@/components/ui-custom/combobox";
import { cn } from "@/lib/utils";

/**
 * Supported locales mapped to ComboboxOption format.
 */
const LOCALE_OPTIONS: ComboboxOption[] = [
  { label: "English", value: "en" },
  { label: "فارسی", value: "fa" },
];

type Props = {
  /**
   * Optional callback fired after locale changes.
   */
  onLocaleChange?: () => void;
  /**
   * Optional className to apply to the combobox button.
   */
  className?: string;
};

export function LocaleSwitcher({ onLocaleChange, className }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");

  const [isPending, startTransition] = useTransition();

  /**
   * Change locale and navigate to the same pathname with the new locale.
   */
  function handleLocaleChange(nextLocale: string) {
    if (!nextLocale || nextLocale === locale) return;

    onLocaleChange?.();

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale as Locale });
    });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe className="size-4 text-muted-foreground" aria-hidden="true" />
      <Combobox
        options={LOCALE_OPTIONS}
        value={locale}
        onChange={handleLocaleChange}
        placeholder={t("placeholder")}
        searchPlaceholder={t("search")}
        emptyText={t("empty")}
        className="w-35"
      />
    </div>
  );
}
