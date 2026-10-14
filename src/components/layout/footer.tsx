import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const tCommon = useTranslations('Common');
  const year = new Date().getFullYear();

  return (
    <footer className="fa-num fixed bottom-0 inset-x-0 h-[var(--footer-height)] z-30 bg-background/85 dark:bg-background/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 text-xs select-none">
      {/* Copyright */}
      <p className="text-[11px] text-slate-600 dark:text-slate-300 tracking-wider truncate font-medium">
        <span>© <bdi>2024-{year}</bdi> </span>
        <span className="font-semibold text-primary">EUROSLOT PARS</span>
        <span className="hidden sm:inline"> | {tCommon('footer.allRightsReserved')}</span>
      </p>

      {/* Navigation Links */}
      <nav className="flex items-center gap-4 sm:gap-6 text-[12px] font-medium shrink-0">
        <Link href="/privacy" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150">
          {tCommon('footer.privacyPolicy')}
        </Link>
        <Link href="/terms" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150">
          {tCommon('footer.termsOfUse')}
        </Link>
        <Link href="/sitemap" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-150">
          {tCommon('footer.sitemap')}
        </Link>
      </nav>
    </footer>
  );
}
