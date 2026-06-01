import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const t = useTranslations('Auth');

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center">
      <h1 className="mb-1 text-2xl font-bold">{t('login')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">{t('loginSubtitle')}</p>

      {/* TODO: wire up to your auth backend (e.g. next-auth) */}
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input id="email" type="email" autoComplete="email" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-primary text-sm hover:underline"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        <Button type="submit" className="w-full">
          {t('login')}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-primary hover:underline">
          {t('register')}
        </Link>
      </p>
    </div>
  );
}
