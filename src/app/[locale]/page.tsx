import { getTranslations } from 'next-intl/server';
import { HomeClient } from '@/components/home/home-client';

// Generate localized metadata for the landing page
export async function generateMetadata() {
  const t = await getTranslations('Home');
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

// Home route renders the client landing page (animations + interactivity)
export default function HomePage() {
  return <HomeClient />;
}
