import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { TasksManagementPage } from '@/modules/tasks/components/tasks-management-page';

type Props = {
  params: { locale: string };
};

export default function Page({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-background" />}>
      <TasksManagementPage />
    </Suspense>
  );
}
