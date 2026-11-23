'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@core/ui';

export interface WelcomeViewProps {
  user?: any;
  homeHref?: string;
  onGetStarted?: () => void;
  Logo?: React.ComponentType<{ className?: string; showText?: boolean; short?: boolean }>;
  Link?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}

export function WelcomeView({
  user,
  homeHref = '/',
  onGetStarted,
  Logo,
  Link: CustomLink,
}: WelcomeViewProps): React.JSX.Element {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isFa = locale === 'fa';
  const Arrow = isFa ? ArrowLeft : ArrowRight;

  const RenderLink = ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children?: React.ReactNode;
  }) => {
    if (CustomLink) {
      return (
        <CustomLink href={href} className={className}>
          {children}
        </CustomLink>
      );
    }
    const cleanHref = href.startsWith(`/${locale}`)
      ? href
      : `/${locale}${href === '/' ? '' : href.startsWith('/') ? href : `/${href}`}`;
    return (
      <a href={cleanHref} className={className}>
        {children}
      </a>
    );
  };

  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-[480px] shadow-2xl border-border/50 bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 my-auto shrink-0 transition-all relative overflow-hidden">
        {/* Subtle Ambient Radial Glow — Primary Brand Color */}
        <div className="pointer-events-none absolute -top-16 start-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-35 bg-gradient-to-b from-primary/35 to-primary/5" />

        <CardHeader className="space-y-3 text-center p-0 pb-6">
          {Logo && (
            <div className="flex justify-center mb-1">
              <div className="bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20 shadow-xs">
                <Logo className="text-xs sm:text-sm" showText={false} />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <CardTitle className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-foreground">
              {isFa ? 'خوش آمدید!' : 'Welcome aboard!'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {isFa
                ? 'حساب کاربری شما با موفقیت فعال شد و دسترسی به سامانه مهیا گردید.'
                : 'Your account has been fully activated and you are ready to explore.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-6 text-center">
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
            <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Sparkles className="size-6 text-primary" />
            </div>
            {user && (
              <p className="text-sm font-bold text-foreground">
                {user.fullName || user.username}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {isFa ? 'دسترسی سازمانی شما برقرار شد.' : 'Enterprise access granted.'}
            </p>
          </div>

          <Button
            asChild
            onClick={onGetStarted}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
          >
            <RenderLink href={homeHref}>
              <span>{isFa ? 'ورود به صفحه اصلی' : 'Go to Homepage'}</span>
              <Arrow className="size-4 ms-2" />
            </RenderLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
