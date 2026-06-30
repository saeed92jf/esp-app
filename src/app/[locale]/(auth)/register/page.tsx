// src/app/[locale]/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { api, ApiError } from '@/services';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/core/types';
import { ROLE_HOME } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { user, token } = await api.auth.register({ fullName, email, password });
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      router.replace(ROLE_HOME[user.role] ?? '/');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('errors.invalidForm');
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center">
      <h1 className="mb-1 text-2xl font-bold">{t('register')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">{t('registerSubtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('fullName')}</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {formError && (
          <p role="alert" aria-live="assertive" className="text-destructive text-sm font-medium">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t('loggingIn') : t('register')}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {t('haveAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline">
          {t('login')}
        </Link>
      </p>
    </div>
  );
}
