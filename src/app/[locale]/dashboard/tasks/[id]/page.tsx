import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { TasksManagementPage } from '@/modules/tasks/components/tasks-management-page';

type Props = {
  params: { locale: string; id: string };
};

export default function TaskDetailPage({ params: { locale, id } }: Props) {
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-screen bg-panel dark:bg-background" />}>
      <TasksManagementPage initialTab="detail" initialTaskId={id} />
    </Suspense>
  );
}
