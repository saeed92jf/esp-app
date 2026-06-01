import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Menu.items');

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
      {/* Dashboard widgets go here */}
    </div>
  );
}
