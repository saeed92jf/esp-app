import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/brand/logo';

export function Footer() {
  const tCommon = useTranslations('Common');
  const year = new Date().getFullYear();

  return (
    <footer className="fa-num w-full mt-24 border-t border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        
        <div className="flex flex-col gap-4">
          
          {/* --- Line 1: Logo & Credit --- */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" aria-label="Home" className="focus:outline-none md:w-1/3">
              <Logo className="text-2xl text-foreground/80 hover:text-foreground transition-colors duration-300" showText={false} />
            </Link>

            {/* Navigation Links (Pushed down with mt-4 and colored #999) */}
            <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[12px] font-normal mt-2 md:mt-3 md:w-1/3">
              <Link href="/privacy" className="text-[#999] hover:text-foreground transition-colors duration-300">
                {tCommon('footer.privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-[#999] hover:text-foreground transition-colors duration-300">
                {tCommon('footer.termsOfUse')}
              </Link>
              <Link href="/sitemap" className="text-[#999] hover:text-foreground transition-colors duration-300">
                {tCommon('footer.sitemap')}
              </Link>
            </nav>

            {/* Designed By */}
            <div className="text-[12px] text-muted-foreground/80 flex items-center justify-center md:justify-end gap-1.5 font-medium md:w-1/3">
              <span>{tCommon('footer.designedBy')}</span>
              <Link href="/team" className="font-semibold text-foreground/80 hover:text-primary transition-colors duration-300">
                {tCommon('footer.rdTeam')}
              </Link>
            </div>

          </div>

          {/* --- Line 2: Copyright --- */}
          <div className="border-t border-border/30 pt-4 flex justify-center">
            <p className="text-[11px] text-muted-foreground/60 tracking-wider text-center">
              <span>© <bdi>{year}</bdi> </span>
              <span className="font-medium text-muted-foreground/70">{tCommon('appName.lead')} {tCommon('appName.trail')}</span>
              <span> | {tCommon('footer.allRightsReserved')}</span>
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
