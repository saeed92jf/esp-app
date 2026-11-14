// src/app/[locale]/bug-reports/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BugReportsModule } from "@/modules/bug-reports/components/BugReportsModule";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "مرکز گزارش و مدیریت باگ‌ها | Euroslot Pars CORE"
      : "Issue Center & Bug Reports | Euroslot Pars CORE",
    description: isFa
      ? "سامانه ثبت، رهگیری و رسیدگی به باگ‌ها و اشکالات فنی اپلیکیشن"
      : "Technical bug tracking, issue reporting and resolution system",
  };
}

export default async function BugReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <BugReportsModule />
    </Suspense>
  );
}

