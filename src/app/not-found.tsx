import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Locale-aware 404. Rendered inside [locale]/layout, so no <html>/<body> here.
export default function LocaleNotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
        <Link
          href="/"
          className="text-primary mt-4 inline-block hover:underline"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
