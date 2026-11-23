'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MailCheck, CheckCircle2, RotateCw, ArrowRight, ArrowLeft } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@core/ui';

export interface VerifyEmailViewProps {
  email?: string;
  onResend?: (email: string) => Promise<any>;
  loginHref?: string;
  Logo?: React.ComponentType<{ className?: string; showText?: boolean; short?: boolean }>;
  Link?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}

export function VerifyEmailView({
  email,
  onResend,
  loginHref = '/login',
  Logo,
  Link: CustomLink,
}: VerifyEmailViewProps): React.JSX.Element {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isFa = locale === 'fa';
  const BackArrow = isFa ? ArrowRight : ArrowLeft;

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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

  const handleResend = async () => {
    if (!onResend || !email || isResending) return;
    setIsResending(true);
    try {
      await onResend(email);
      setResendSuccess(true);
    } finally {
      setIsResending(false);
    }
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
              {t('verifyEmailTitle') || (isFa ? 'تأیید نشانی ایمیل' : 'Verify Your Email')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {isFa
                ? 'لینک تأیید به ایمیل شما ارسال شد. جهت فعال‌سازی حساب روی لینک داخل ایمیل کلیک فرمایید.'
                : 'A confirmation email was sent. Please click the link inside to verify your account.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
            <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <MailCheck className="size-6 text-primary" />
            </div>
            {email && (
              <p className="text-xs font-semibold text-primary font-mono" dir="ltr">
                {email}
              </p>
            )}
            {resendSuccess && (
              <p className="text-xs text-primary font-medium">
                {isFa ? 'ایمیل مجدداً ارسال گردید.' : 'Email has been resent.'}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {onResend && email && (
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
                className="w-full h-11 text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                <RotateCw className="size-4 me-2" />
                <span>{isFa ? 'ارسال مجدد ایمیل' : 'Resend Email'}</span>
              </Button>
            )}

            <Button
              asChild
              className="w-full h-11 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
            >
              <RenderLink href={loginHref}>
                <BackArrow className="size-4 me-2" />
                <span>{t('backToLogin') || (isFa ? 'ورود به حساب' : 'Back to Login')}</span>
              </RenderLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
