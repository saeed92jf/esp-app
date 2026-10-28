import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { TasksManagementPage } from '@/modules/tasks/components/tasks-management-page';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="flex-1 min-h-full bg-panel dark:bg-background" />}>
      <TasksManagementPage />
    </Suspense>
  );
}
