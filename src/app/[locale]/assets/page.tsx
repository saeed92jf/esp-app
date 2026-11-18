// src/app/[locale]/assets/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AssetsModuleShell } from "@/modules/assets/components/AssetsModuleShell";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "ESP Asset | مدیریت ماشین‌آلات و تجهیزات صنعتی | یورواسلات پارس"
      : "ESP Asset | Industrial Assets & Machinery | Euroslot Pars",
    description: isFa
      ? "سامانه شناسنامه ماشین‌آلات صنعتی، مشخصات فنی، موقعیت استقرار و سوابق نگهداری کارخانه (ESP Asset)"
      : "ESP Asset: Industrial machinery registry, technical specs, physical plant locations, and lifecycle management",
  };
}

export default async function AssetsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AssetsModuleShell />
    </Suspense>
  );
}
