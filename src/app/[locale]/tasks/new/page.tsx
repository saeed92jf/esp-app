import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TasksPage } from "@/modules/tasks/components/TasksPage";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa ? "ایجاد تسک جدید | Euroslot Pars CORE" : "Create New Task | Euroslot Pars CORE",
  };
}

export default async function NewTaskPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <TasksPage initialTab="create" />
    </Suspense>
  );
}

