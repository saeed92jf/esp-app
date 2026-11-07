import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function TaskDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/tasks/${encodeURIComponent(id)}`);
}
