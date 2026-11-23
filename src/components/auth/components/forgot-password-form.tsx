'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from '@core/ui';

export interface ForgotPasswordFormProps {
  onForgotPassword: (email: string) => Promise<{ message?: string } | any>;
  Logo?: React.ComponentType<{ className?: string; showText?: boolean; short?: boolean }>;
  loginHref?: string;
  homeHref?: string;
  Link?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}

export function ForgotPasswordForm({
  onForgotPassword,
  Logo,
  loginHref = '/login',
  homeHref = '/',
  Link: CustomLink,
}: ForgotPasswordFormProps): React.JSX.Element {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isFa = locale === 'fa';
  const BackArrow = isFa ? ArrowRight : ArrowLeft;

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError(
        isFa ? 'لطفاً نشانی ایمیل معتبر وارد کنید.' : 'Please enter a valid email address.'
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 600));
      await Promise.all([onForgotPassword(cleanEmail), minDelay]);
      setSentEmail(cleanEmail);
      setSuccess(true);
    } catch (err: any) {
      setFormError(
        err?.message ||
          (isFa
            ? 'خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش کنید.'
            : 'Error connecting to server. Please try again.')
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
              {t('forgotPasswordTitle') || (isFa ? 'بازیابی رمز عبور' : 'Reset Password')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {t('forgotPasswordSubtitle') ||
                (isFa
                  ? 'نشانی ایمیل حساب کاربری خود را وارد کنید تا لینک بازیابی رمز ارسال گردد.'
                  : 'Enter your account email to receive instructions for resetting your password.')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {success ? (
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
                      {isFa ? 'لینک بازیابی ارسال شد' : 'Reset Link Sent'}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isFa
                        ? 'دستورالعمل بازیابی رمز عبور به نشانی زیر ارسال گردید:'
                        : 'Instructions for resetting your password have been sent to:'}
                    </p>
                    <p className="text-xs font-semibold text-primary font-mono" dir="ltr">
                      {sentEmail}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
                  >
                    <RenderLink href={loginHref}>
                      <BackArrow className="size-4.5 me-2" />
                      <span>{t('backToLogin') || (isFa ? 'بازگشت به صفحه ورود' : 'Back to Login')}</span>
                    </RenderLink>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {isFa ? 'ارسال به ایمیل دیگر' : 'Send to another email'}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                    {t('email') || (isFa ? 'نشانی ایمیل' : 'Email Address')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder={isFa ? 'name@company.com' : 'user@company.com'}
                      autoComplete="email"
                      dir="ltr"
                      disabled={isSubmitting}
                      className="h-11 sm:h-12 text-sm sm:text-base ps-10 pe-3.5 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                    />
                    <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
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
                  disabled={isSubmitting}
                  className={cn(
                    'w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all relative overflow-hidden select-none cursor-pointer',
                    isSubmitting && 'cursor-wait opacity-100 pointer-events-none'
                  )}
                >
                  {isSubmitting && (
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
                  )}
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium animate-pulse">
                        {isFa ? 'در حال ارسال لینک...' : 'Sending reset link...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="size-4.5" />
                      <span>{t('sendResetLink') || (isFa ? 'ارسال لینک بازیابی' : 'Send Reset Link')}</span>
                    </div>
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
