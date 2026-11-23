'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

import {
  Button,
  PasswordInput,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from '@core/ui';

export interface ResetPasswordFormProps {
  onResetPassword: (data: { token: string; email?: string; password: string }) => Promise<any>;
  token?: string;
  email?: string;
  Logo?: React.ComponentType<{ className?: string; showText?: boolean; short?: boolean }>;
  loginHref?: string;
  homeHref?: string;
  Link?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}

export function ResetPasswordForm({
  onResetPassword,
  token: initialToken,
  email: initialEmail,
  Logo,
  loginHref = '/login',
  homeHref = '/',
  Link: CustomLink,
}: ResetPasswordFormProps): React.JSX.Element {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isFa = locale === 'fa';
  const BackArrow = isFa ? ArrowRight : ArrowLeft;
  const searchParams = useSearchParams();

  const token =
    initialToken ||
    searchParams?.get('token') ||
    searchParams?.get('code') ||
    searchParams?.get('key') ||
    '';
  const email =
    initialEmail ||
    searchParams?.get('email') ||
    searchParams?.get('identifier') ||
    '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isStrong = checks.length && checks.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!token) {
      setFormError(
        isFa
          ? 'توکن اعتبارسنجی نامعتبر یا منقضی شده است.'
          : 'Invalid or missing reset token.'
      );
      return;
    }

    if (!checks.length) {
      setFormError(
        isFa
          ? 'رمز عبور باید حداقل ۸ کاراکتر باشد.'
          : 'Password must be at least 8 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setFormError(
        isFa
          ? 'رمز عبور با تکرار آن یکسان نیست.'
          : 'Passwords do not match.'
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 600));
      await Promise.all([
        onResetPassword({ token, email, password }),
        minDelay,
      ]);
      setIsSuccess(true);
    } catch (err: any) {
      setFormError(
        err?.message ||
          (isFa
            ? 'خطا در بازنشانی رمز عبور. لطفاً مجدداً امتحان کنید.'
            : 'Failed to reset password. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-[480px] shadow-2xl border-border/50 bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 my-auto shrink-0 transition-all relative overflow-hidden">
        {/* Subtle Ambient Radial Glow — Primary Brand Color */}
        <div className="pointer-events-none absolute -top-16 start-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-35 bg-gradient-to-b from-primary/35 to-primary/5" />

        {/* Header */}
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
              {t('resetPasswordPageTitle') || (isFa ? 'تعیین رمز عبور جدید' : 'Set New Password')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {t('resetPasswordPageSubtitle') ||
                (isFa
                  ? 'رمز عبور جدید خود را وارد و تأیید نمایید.'
                  : 'Enter and confirm your new account password.')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center"
              >
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
                  <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-foreground">
                      {isFa ? 'رمز عبور با موفقیت به‌روزرسانی شد' : 'Password Reset Successful'}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isFa
                        ? 'اکنون می‌توانید با رمز عبور جدید خود وارد سامانه شوید.'
                        : 'You can now sign in using your new credentials.'}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
                >
                  <RenderLink href={loginHref}>
                    <KeyRound className="size-4.5 me-2" />
                    <span>{t('backToLogin') || (isFa ? 'ورود به حساب کاربری' : 'Sign In')}</span>
                  </RenderLink>
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium">
                      {t('newPassword') || (isFa ? 'رمز عبور جدید' : 'New Password')}
                    </Label>
                    <div className="relative">
                      <PasswordInput
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        disabled={isSubmitting}
                        className="h-11 sm:h-12 text-sm sm:text-base ps-10 pe-10 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                      />
                      <Lock className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium">
                      {t('confirmPassword') || (isFa ? 'تکرار رمز عبور جدید' : 'Confirm New Password')}
                    </Label>
                    <div className="relative">
                      <PasswordInput
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        disabled={isSubmitting}
                        className="h-11 sm:h-12 text-sm sm:text-base ps-10 pe-10 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                      />
                      <Lock className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/40 border border-border/40 text-[11px]">
                  <div className={cn('flex items-center gap-1.5', checks.length ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    <Check className="size-3.5" />
                    <span>{isFa ? 'حداقل ۸ کاراکتر' : 'At least 8 chars'}</span>
                  </div>
                  <div className={cn('flex items-center gap-1.5', checks.number ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    <Check className="size-3.5" />
                    <span>{isFa ? 'شامل عدد' : 'Includes number'}</span>
                  </div>
                </div>

                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs sm:text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-center flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{formError}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || !password || !confirmPassword}
                  className={cn(
                    'w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all relative overflow-hidden select-none cursor-pointer',
                    isSubmitting && 'cursor-wait opacity-100 pointer-events-none'
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium animate-pulse">
                        {isFa ? 'در حال ذخیره رمز...' : 'Saving password...'}
                      </span>
                    </div>
                  ) : (
                    <span>{t('submitResetPassword') || (isFa ? 'ثبت و تغییر رمز عبور' : 'Save Password')}</span>
                  )}
                </Button>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs sm:text-sm">
                  <RenderLink
                    href={loginHref}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    <BackArrow className="size-3.5" />{' '}
                    {t('backToLogin') || (isFa ? 'بازگشت به ورود' : 'Back to Login')}
                  </RenderLink>
                  <RenderLink
                    href={homeHref}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    {t('backToHome') || (isFa ? 'صفحه اصلی' : 'Home')}
                  </RenderLink>
                </div>
              </form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
