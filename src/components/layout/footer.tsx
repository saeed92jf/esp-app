import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/brand/logo';

export function Footer() {
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const isRtl = locale === "fa";
  const year = new Date().getFullYear();

  return (
    <footer className="fa-num relative w-full border-t border-border/30 bg-muted/40 text-foreground backdrop-blur-2xl z-40 overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-(--theme)/30 to-transparent" />
      
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex flex-col gap-4">
        
        {/* Top Row: Logo */}
        <div className="flex items-center justify-center sm:justify-start">
          <Logo className="text-xl sm:text-2xl opacity-80 hover:opacity-100 transition-opacity" showText={false} />
        </div>

        {/* Directional Faded Divider */}
        <div 
          className={`h-[1px] w-full from-border/50 to-transparent ${
            isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'
          }`} 
        />

        {/* Bottom Row: Copyright, Designed by R&D Team & Links */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-start gap-1.5 sm:gap-2 text-muted-foreground/70 text-[11px] sm:text-xs font-medium tracking-wider text-center sm:text-start">
            <div className="flex items-center gap-1.5">
              <span>©</span>
              <bdi>{year}</bdi>
              <span>{tCommon('appName.lead')} {tCommon('appName.trail')}</span>
              <span className="hidden sm:inline-block opacity-70">| {tCommon('footer.allRightsReserved')}</span>
            </div>
            
            <span className="hidden sm:inline-block opacity-40">|</span>
            
            <div className="flex items-center gap-1">
              <span>{tCommon('footer.designedBy')}</span>
              <Link href="/team" className="text-foreground/80 hover:text-primary transition-colors font-semibold">
                {tCommon('footer.rdTeam')}
              </Link>
            </div>
          </div>

          {/* Minimal Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[12px] sm:text-[13px] font-medium tracking-wide">
            <Link href="/privacy" className="text-foreground/80 hover:text-primary transition-colors">{tCommon('footer.privacyPolicy')}</Link>
            <Link href="/terms" className="text-foreground/80 hover:text-primary transition-colors">{tCommon('footer.termsOfUse')}</Link>
            <Link href="/sitemap" className="text-foreground/80 hover:text-primary transition-colors">{tCommon('footer.sitemap')}</Link>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
