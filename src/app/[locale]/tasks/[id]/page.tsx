import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TasksPage } from "@/modules/tasks/components/TasksPage";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa ? `جزئیات تسک (${id}) | Euroslot Pars CORE` : `Task Details (${id}) | Euroslot Pars CORE`,
  };
}

export default async function TaskDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen flex items-center justify-center bg-panel dark:bg-background">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <TasksPage initialTaskId={id} />
    </Suspense>
  );
}

