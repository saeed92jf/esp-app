import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { TasksManagementPage } from '@/modules/tasks/components/tasks-management-page';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function TaskDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="flex-1 min-h-full bg-panel dark:bg-background" />}>
      <TasksManagementPage initialTab="detail" initialTaskId={id} />
    </Suspense>
  );
}
