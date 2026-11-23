'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import {
  MailCheck,
  Mail,
  Lock,
  LogIn,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { getLoginSchema, type LoginInput } from '../validations/auth';
import {
  Button,
  Input,
  PasswordInput,
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

export interface LoginFormProps {
  login?: (identifier: string, password: string) => Promise<any>;
  user?: any;
  authLoading?: boolean;
  Logo?: React.ComponentType<{ className?: string; showText?: boolean; short?: boolean }>;
  supportEmail?: string;
  portalTitle?: string;
  portalSubtitle?: string;
  accountRequestHref?: string;
  forgotPasswordHref?: string;
  homeHref?: string;
  onSuccessRedirect?: (user: any) => void;
  Link?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
  router?: { replace: (url: string) => void; refresh?: () => void };
}

export function LoginForm({
  login,
  user,
  authLoading = false,
  Logo,
  supportEmail = 'support@company.com',
  portalTitle,
  portalSubtitle,
  accountRequestHref = '/account-request',
  forgotPasswordHref = '/forgot-password',
  homeHref = '/',
  onSuccessRedirect,
  Link: CustomLink,
  router: customRouter,
}: LoginFormProps): React.JSX.Element {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isFa = locale === 'fa';
  const BackArrow = isFa ? ArrowRight : ArrowLeft;
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const emailParam =
    searchParams?.get('email') || searchParams?.get('identifier') || '';

  // Safe navigation helper
  const navigateTo = (url: string) => {
    if (customRouter?.replace) {
      customRouter.replace(url);
      if (customRouter.refresh) customRouter.refresh();
      return;
    }
    if (typeof window !== 'undefined') {
      const cleanUrl = url.startsWith(`/${locale}`) ? url : `/${locale}${url === '/' ? '' : url.startsWith('/') ? url : `/${url}`}`;
      window.location.href = cleanUrl;
    }
  };

  // Safe Link renderer
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

  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      identifier: emailParam,
      password: '',
    },
  });

  useEffect(() => {
    if (emailParam) {
      form.setValue('identifier', emailParam);
    }
  }, [emailParam, form]);

  // Redirect away if already logged in
  useEffect(() => {
    const redirectParam = searchParams?.get('redirect') || searchParams?.get('returnUrl');
    if (redirectParam) return;

    if (user && !authLoading && !isLoading) {
      navigateTo(homeHref);
    }
  }, [user, authLoading, isLoading, searchParams]);

  async function onSubmit(data: LoginInput) {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (login) {
        const loggedUser = await login(data.identifier, data.password);
        if (!loggedUser) {
          setIsLoading(false);
          return;
        }

        if (onSuccessRedirect) {
          onSuccessRedirect(loggedUser);
          return;
        }

        let destination = homeHref;
        const isPrivileged =
          loggedUser.role === 'admin' || loggedUser.role === 'superadmin' || loggedUser.role === 'super admin';

        if (!isPrivileged) {
          const isFullyApproved = Boolean(
            loggedUser.accountStatus === 'active' ||
              (loggedUser.hrApproved && loggedUser.managerApproved)
          );
          if (!isFullyApproved && loggedUser.accountStatus === 'pending') {
            destination = '/account-pending';
          }
        }

        if (destination !== '/account-pending') {
          const redirectParam =
            searchParams?.get('redirect') || searchParams?.get('returnUrl');
          if (redirectParam && !redirectParam.includes('/login')) {
            let target = redirectParam;
            for (const loc of ['fa', 'en']) {
              if (target === `/${loc}` || target === `/${loc}/`) {
                target = '/';
                break;
              } else if (target.startsWith(`/${loc}/`)) {
                target = target.slice(loc.length + 1);
                break;
              }
            }
            if (target.startsWith('/') && !target.startsWith('//')) {
              destination = target;
            }
          }
        }

        navigateTo(destination);
      } else {
        navigateTo(homeHref);
      }
    } catch (error: any) {
      console.warn('Login error:', error?.message);
      const isAuthError = error?.status === 401 || error?.status === 400;
      setErrorMsg(
        isAuthError
          ? t('errors.invalidCredentials') || (isFa ? 'نام کاربری یا رمز عبور نامعتبر است.' : 'Invalid username or password.')
          : error?.message || t('errors.invalidCredentials') || (isFa ? 'نام کاربری یا رمز عبور نامعتبر است.' : 'Invalid username or password.')
      );
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
              {portalTitle || t('loginTitle')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {portalSubtitle || t('loginSubtitle')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                {/* Identifier (Email / Mobile / Username) */}
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }: { field: any }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('emailOrMobile') || (isFa ? 'ایمیل، نام کاربری یا شماره موبایل' : 'Email, Username or Mobile')}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={isFa ? 'ایمیل یا نام کاربری' : 'name@company.com'}
                            autoComplete="username"
                            dir="ltr"
                            disabled={isLoading}
                            className="h-11 sm:h-12 text-sm sm:text-base ps-10 pe-3.5 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                            {...field}
                          />
                          <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }: { field: any }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('password') || (isFa ? 'رمز عبور' : 'Password')}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PasswordInput
                            placeholder={isFa ? 'رمز عبور' : 'Enter password'}
                            autoComplete="current-password"
                            dir="ltr"
                            disabled={isLoading}
                            className="h-11 sm:h-12 text-sm sm:text-base ps-10 pe-10 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                            {...field}
                          />
                          <Lock className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Explanatory / Links Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm px-0.5">
                <RenderLink
                  href={forgotPasswordHref}
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>{t('forgotPassword') || (isFa ? 'فراموشی رمز عبور' : 'Forgot Password?')}</span>
                </RenderLink>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium inline-flex items-center gap-1 text-xs"
                >
                  <HelpCircle className="size-3.5 text-muted-foreground" />
                  <span>{t('troubleLoggingIn') || (isFa ? 'مشکل در ورود؟' : 'Trouble logging in?')}</span>
                </a>
              </div>

              {emailParam && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary font-medium">
                  <MailCheck className="size-4.5 shrink-0 text-primary" />
                  <span>{t('emailPrefilledNotice') || (isFa ? 'نشانی ایمیل از قبل تکمیل شد.' : 'Email was prefilled.')}</span>
                </div>
              )}

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

              {/* Submit Button */}
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
                      {isFa ? 'در حال ورود...' : 'Signing in...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="size-4.5" />
                    <span>{t('login') || (isFa ? 'ورود به سامانه' : 'Sign In')}</span>
                  </div>
                )}
              </Button>

              {/* Bottom Navigation Links */}
              <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-3">
                <RenderLink
                  href={homeHref}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                >
                  <BackArrow className="size-3.5" />{' '}
                  {t('backToHome') || (isFa ? 'بازگشت به صفحه اصلی' : 'Back to Home')}
                </RenderLink>
                <div>
                  <span className="text-muted-foreground">
                    {t('noAccount') || (isFa ? 'حساب کاربری ندارید؟' : "Don't have an account?")}
                  </span>{' '}
                  <RenderLink
                    href={accountRequestHref}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t('requestAccount') || (isFa ? 'درخواست اکانت' : 'Request Account')}
                  </RenderLink>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
