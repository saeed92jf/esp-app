// src/app/[locale]/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth, getAuthErrorKey } from '@/hooks/use-auth';
import { loginSchema } from '@/lib/validations/auth';
import { ROLE_HOME } from '@/lib/auth/roles';
import { DEMO_USERS } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      setFormError(t('errors.invalidForm'));
      return;
    }

    try {
      const loggedInUser = await login(identifier.trim(), password);
      router.replace(ROLE_HOME[loggedInUser.role] ?? '/');
    } catch (err) {
      setFormError(t(`errors.${getAuthErrorKey(err)}`));
    }
  };

  const fillDemo = (email: string, pwd: string) => {
    setIdentifier(email);
    setPassword(pwd);
    setFormError(null);
  };

  return (
    <div className="from-background to-muted/30 flex min-h-screen items-center justify-center bg-linear-to-b px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t('login')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card space-y-4 rounded-2xl border p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="identifier">{t('identifier')}</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('identifierPlaceholder')}
              disabled={isLoggingIn}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
              autoComplete="current-password"
            />
          </div>

          {formError && (
            <p role="alert" aria-live="assertive" className="text-destructive text-sm font-medium">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? t('loggingIn') : t('submit')}
          </Button>
        </form>

        {/* کارت حساب‌های تستی — فقط در fake mode معنا دارد؛
            در real mode، DEMO_USERS از services/auth.service خالی export نمی‌شود
            مگر صراحتاً نگه داشته شود. این بلاک را قبل از رفتن به production حذف کنید. */}
        <div className="bg-muted/40 rounded-2xl border border-dashed p-4">
          <p className="text-sm font-semibold">{t('demoTitle')}</p>
          <p className="text-muted-foreground mb-3 text-xs">{t('demoHint')}</p>
          <ul className="space-y-2">
            {DEMO_USERS.map((c) => (
              <li key={c.user.id}>
                <button
                  type="button"
                  onClick={() => fillDemo(c.email, c.password)}
                  className="bg-card hover:bg-accent flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-start text-xs transition-colors"
                >
                  <span className="text-foreground font-medium">{t(`roles.${c.user.role}`)}</span>
                  <span className="text-muted-foreground font-mono" dir="ltr">
                    {c.email} — {c.mobile} — {c.password}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
