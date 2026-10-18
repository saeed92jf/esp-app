import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const tCommon = useTranslations('Common');
  const year = new Date().getFullYear();

  return (
    <footer className="fa-num w-full mt-auto relative border-t border-border/40 min-h-[var(--footer-height)] bg-background/85 dark:bg-background/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-8 text-xs select-none">
      {/* Copyright */}
      <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 tracking-wider truncate font-medium shrink-0">
        <span>© <bdi>2024-{year}</bdi> </span>
        <span className="font-semibold text-primary">EUROSLOT PARS</span>
        <span className="hidden sm:inline"> | {tCommon('footer.allRightsReserved')}</span>
      </p>

      {/* Navigation Links */}
      <nav className="flex items-center gap-2.5 sm:gap-6 text-[10.5px] sm:text-[12px] font-medium shrink-0">
        <Link href="/privacy" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150">
          {tCommon('footer.privacyPolicy')}
        </Link>
        <Link href="/terms" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150">
          {tCommon('footer.termsOfUse')}
        </Link>
        <Link href="/sitemap" className="hidden xs:inline text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150">
          {tCommon('footer.sitemap')}
        </Link>
      </nav>
    </footer>
  );
}
