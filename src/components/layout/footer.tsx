// src/components/layout/footer.tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/**
 * Site footer.
 * Server component (no interactivity) — translations are resolved on the
 * server via the synchronous `useTranslations` hook.
 */
export function Footer() {
  const t = useTranslations('Footer');
  const tHeader = useTranslations('Header');
  const tCommon = useTranslations('Common');

  // Current year for the copyright line.
  const year = new Date().getFullYear();

  const links = [
    { href: '/', label: tHeader('home') },
    { href: '/about', label: tHeader('about') },
    { href: '/contact', label: tHeader('contact') },
  ] as const;

  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        {/* Brand column */}
        <div>
          <h2 className="text-base font-bold">{tCommon('appName')}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{t('rights')}</p>
        </div>

        {/* Quick links */}
        <nav aria-label={t('quickLinks')}>
          <h3 className="text-sm font-semibold">{t('quickLinks')}</h3>
          <ul className="mt-3 space-y-2">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Follow us */}
        <div>
          <h3 className="text-sm font-semibold">{t('followUs')}</h3>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-4">
        <p className="text-muted-foreground text-center text-xs">
          © <bdi>{year}</bdi> {tCommon('appName')} — {t('rights')}
        </p>
      </div>
    </footer>
  );
}
