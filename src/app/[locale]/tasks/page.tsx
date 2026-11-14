import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TasksPage as TasksPageClient } from "@/modules/tasks/components/TasksPage";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa ? "مدیریت وظایف و تسک‌ها | Euroslot Pars CORE" : "Task Management | Euroslot Pars CORE",
    description: isFa
      ? "سیستم مدیریت فعالیت‌ها، بردهای کانبان و رهگیری تسک‌های پرسنلی"
      : "Kanban workflow, activity tracking and team task management",
  };
}

export default async function TasksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <TasksPageClient />
    </Suspense>
  );
}
