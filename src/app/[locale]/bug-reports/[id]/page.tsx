// src/app/[locale]/bug-reports/[id]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BugReportsModule } from "@/modules/bug-reports/components/BugReportsModule";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? `تیکت باگ ${id} | Euroslot Pars CORE`
      : `Bug Ticket ${id} | Euroslot Pars CORE`,
    description: isFa
      ? `جزئیات تیکت و تاریخچه پیگیری خطای ${id}`
      : `Ticket details and resolution history for ${id}`,
  };
}

export default async function BugReportDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <BugReportsModule initialReportId={id} />
    </Suspense>
  );
}

