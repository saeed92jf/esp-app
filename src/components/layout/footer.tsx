import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/brand/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Footer() {
  const tCommon = useTranslations('Common');
  const tHeader = useTranslations('Header');
  const year = new Date().getFullYear();

  return (
    <footer className="fa-num w-full mt-24 bg-background/80 backdrop-blur-md">
      <div className="w-full px-6 md:px-12 py-6">
        
        <div className="flex flex-col gap-6">
          
          {/* --- Line 1: Logo Centered with Tooltip --- */}
          <div className="flex justify-center items-center w-full">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    aria-label={tHeader('home')}
                    className="focus:outline-none opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer select-none"
                  >
                    <Logo className="text-xl sm:text-2xl" showText={false} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="text-xs font-medium shadow-md">
                  {tHeader('home')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* --- Line 2: Links & Copyright (Full width, opposite ends) --- */}
          <div className="border-t border-border/30 pt-4 flex flex-col-reverse md:flex-row items-center justify-between gap-4 w-full">
            
            {/* Copyright */}
            <p className="text-[11px] text-muted-foreground/60 tracking-wider">
              <span>© <bdi>2024-{year}</bdi> </span>
              <span className="font-medium text-muted-foreground/70">EUROSLOT PARS</span>
              <span> | {tCommon('footer.allRightsReserved')}</span>
            </p>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[12px] font-normal">
              <Link href="/privacy" className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300">
                {tCommon('footer.privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300">
                {tCommon('footer.termsOfUse')}
              </Link>
              <Link href="/sitemap" className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300">
                {tCommon('footer.sitemap')}
              </Link>
            </nav>

          </div>

        </div>

      </div>
    </footer>
  );
}
