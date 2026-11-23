'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Send,
  CheckCircle2,
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  MailCheck,
} from 'lucide-react';

import { getAccountRequestSchema, type AccountRequestInput } from '../validations/auth';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  cn,
} from '@core/ui';

export interface AccountRequestFormProps {
  onRequestAccount: (data: { email: string }) => Promise<{ message?: string } | any>;
  Logo?: React.ComponentType<{ className?: string; showText?: boolean; short?: boolean }>;
  supportEmail?: string;
  loginHref?: string;
  homeHref?: string;
  Link?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}

export function AccountRequestForm({
  onRequestAccount,
  Logo,
  supportEmail = 'support@company.com',
  loginHref = '/login',
  homeHref = '/',
  Link: CustomLink,
}: AccountRequestFormProps): React.JSX.Element {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isFa = locale === 'fa';
  const BackArrow = isFa ? ArrowRight : ArrowLeft;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [successInfoMsg, setSuccessInfoMsg] = useState<string | null>(null);

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

  const form = useForm<AccountRequestInput>({
    resolver: zodResolver(getAccountRequestSchema(t)),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: AccountRequestInput) {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 600));
      const [res] = await Promise.all([
        onRequestAccount({ email: data.email }),
        minDelay,
      ]);
      if (res?.message) {
        setSuccessInfoMsg(res.message);
      }
      setSubmittedEmail(data.email.trim().toLowerCase());
    } catch (error: any) {
      console.warn('Account request error:', error?.message);
      setErrorMsg(error?.message || t('errors.invalidForm') || (isFa ? 'خطا در ثبت درخواست' : 'Submission error'));
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-[480px] shadow-2xl border-border/50 bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 my-auto shrink-0 transition-all relative overflow-hidden">
        {/* Subtle Ambient Radial Glow — Driven by Primary Brand Color */}
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
              {submittedEmail
                ? t('accountRequest.successTitle') || (isFa ? 'درخواست حساب ثبت شد' : 'Request Received')
                : t('accountRequest.title') || (isFa ? 'درخواست حساب کاربری' : 'Request Account')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {submittedEmail
                ? t('accountRequest.successDesc') || (isFa ? 'درخواست شما برای تأیید ارسال شد.' : 'Your request has been forwarded for approval.')
                : t('accountRequest.subtitle') || (isFa ? 'نشانی ایمیل سازمانی خود را جهت بررسی و فعال‌سازی وارد نمایید.' : 'Enter your corporate email to request access.')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {submittedEmail ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
                  <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {isFa ? 'اطلاعات با موفقیت دریافت شد' : 'Submission Successful'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                      {submittedEmail}
                    </p>
                  </div>
                  {successInfoMsg && (
                    <p className="text-xs text-primary/90 leading-relaxed font-medium">
                      {successInfoMsg}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Button
                    asChild
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
                  >
                    <RenderLink href={`${loginHref}?email=${encodeURIComponent(submittedEmail)}`}>
                      <MailCheck className="size-4.5 me-2" />
                      <span>{t('backToLogin') || (isFa ? 'ورود به حساب کاربری' : 'Sign In')}</span>
                    </RenderLink>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmittedEmail(null);
                      setSuccessInfoMsg(null);
                      form.reset();
                    }}
                    className="w-full h-10 text-xs sm:text-sm rounded-xl cursor-pointer"
                  >
                    {isFa ? 'ثبت درخواست جدید' : 'Submit Another Request'}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: any }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs sm:text-sm font-medium">
                          {t('email') || (isFa ? 'ایمیل سازمانی' : 'Corporate Email')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="user@company.com"
                              autoComplete="email"
                              dir="ltr"
                              disabled={isLoading}
                              className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-3.5 text-left font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                              {...field}
                            />
                            <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs sm:text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-center flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      'w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all relative overflow-hidden select-none cursor-pointer',
                      isLoading && 'cursor-wait opacity-100 pointer-events-none'
                    )}
                  >
                    {isLoading && (
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
                    )}
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium animate-pulse">
                          {isFa ? 'در حال ارسال درخواست...' : 'Sending request...'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Send className="size-4.5" />
                        <span>{t('accountRequest.submit') || (isFa ? 'ارسال درخواست ثبت‌نام' : 'Submit Request')}</span>
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
              </Form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
