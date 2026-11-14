import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProjectsPageContainer } from "@/modules/projects/components/projects-page-container";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa ? "مکاتبات و نامه‌های پروژه‌ها | Euroslot Pars CORE" : "Project Letters & Correspondence | Euroslot Pars CORE",
    description: isFa
      ? "کارتابل بررسی و تایید نامه‌ها و مکاتبات پروژه‌ها"
      : "Project correspondence, manager approvals, and dispatch records",
  };
}

export default async function ProjectLettersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <ProjectsPageContainer initialTab="letters" />
    </Suspense>
  );
}
