import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProjectsPageContainer } from "@/modules/projects/components/projects-page-container";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa ? "تعریف پروژه جدید | Euroslot Pars CORE" : "Create New Project | Euroslot Pars CORE",
    description: isFa
      ? "فرم ایجاد و زمان‌بندی پروژه صنعتی جدید"
      : "Define new industrial engineering and manufacturing project",
  };
}

export default async function NewProjectPage({ params }: Props) {
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
      <ProjectsPageContainer initialTab="create" />
    </Suspense>
  );
}
