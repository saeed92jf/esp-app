'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Clock,
  RotateCw,
  LogOut,
  ShieldCheck,
  UserCheck,
  Building,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from '@core/ui';

export interface AccountPendingViewProps {
  user?: any;
  onRefresh?: () => Promise<any>;
  onLogout?: () => void;
  supportEmail?: string;
  Logo?: React.ComponentType<{ className?: string; showText?: boolean; short?: boolean }>;
  loginHref?: string;
  Link?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}

export function AccountPendingView({
  user,
  onRefresh,
  onLogout,
  supportEmail = 'support@company.com',
  Logo,
  loginHref = '/login',
  Link: CustomLink,
}: AccountPendingViewProps): React.JSX.Element {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isFa = locale === 'fa';

  const [isRefreshing, setIsRefreshing] = useState(false);

  const steps = [
    { id: 1, title: isFa ? 'ثبت درخواست' : 'Requested', icon: Building, done: true },
    {
      id: 2,
      title: isFa ? 'تکمیل مدارک' : 'Profile Form',
      icon: UserCheck,
      done: Boolean(user?.isProfileCompleted),
    },
    {
      id: 3,
      title: isFa ? 'بررسی منابع انسانی' : 'HR Review',
      icon: Clock,
      done: Boolean(user?.hrApproved),
    },
    {
      id: 4,
      title: isFa ? 'تأیید مدیریت' : 'Management',
      icon: ShieldCheck,
      done: Boolean(user?.managerApproved || user?.accountStatus === 'active'),
    },
  ];

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-[500px] shadow-2xl border-border/50 bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 my-auto shrink-0 transition-all relative overflow-hidden">
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
              {isFa ? 'حساب در انتظار تأیید است' : 'Account Under Review'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {isFa
                ? 'حساب کاربری شما ایجاد شده و در صف بررسی و تایید اداری قرار دارد.'
                : 'Your registration has been submitted and is currently queued for administrative approval.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 p-3.5 rounded-2xl bg-muted/40 border border-border/40">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.id} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={cn(
                      'size-9 rounded-full flex items-center justify-center transition-all',
                      st.done
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-muted text-muted-foreground border border-border/60'
                    )}
                  >
                    {st.done ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </div>
                  <span
                    className={cn(
                      'text-[11px] leading-tight',
                      st.done ? 'font-bold text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {st.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* User info box */}
          {user && (
            <div className="p-4 rounded-xl bg-card border border-border/50 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{isFa ? 'نام کاربری / ایمیل:' : 'Account ID:'}</span>
                <span className="font-semibold text-foreground font-mono" dir="ltr">
                  {user.username || user.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{isFa ? 'وضعیت فعلی:' : 'Status:'}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {isFa ? 'در انتظار تأیید اداری' : 'Pending Verification'}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {onRefresh && (
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full h-11 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
              >
                <RotateCw className={cn('size-4 me-2', isRefreshing && 'animate-spin')} />
                <span>{isFa ? 'بررسی مجدد وضعیت' : 'Check Status Again'}</span>
              </Button>
            )}

            {onLogout && (
              <Button
                variant="outline"
                onClick={onLogout}
                className="w-full h-10 text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                <LogOut className="size-4 me-2" />
                <span>{isFa ? 'خروج از حساب' : 'Sign Out'}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
