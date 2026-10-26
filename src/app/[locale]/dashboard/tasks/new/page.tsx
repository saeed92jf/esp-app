import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { TasksManagementPage } from '@/modules/tasks/components/tasks-management-page';

type Props = {
  params: { locale: string };
};

export default function Page({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-screen bg-panel dark:bg-background" />}>
      <TasksManagementPage initialTab="create" />
    </Suspense>
  );
}
