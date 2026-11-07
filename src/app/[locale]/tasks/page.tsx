import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TasksManagementPage } from "@/modules/tasks/components/tasks-management-page";
import { RefreshCw } from "lucide-react";

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
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen flex items-center justify-center bg-panel dark:bg-background">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <TasksManagementPage />
    </Suspense>
  );
}
