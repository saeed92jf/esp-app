// src/app/[locale]/assets/[tab]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AssetsModuleShell, AssetTab } from "@/modules/assets/components/AssetsModuleShell";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string; tab: string }>;
};

const VALID_TABS = ["directory", "machinery", "categories", "locations"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tab } = await params;
  const isFa = locale === "fa";

  const tabTitlesFa: Record<string, string> = {
    directory: "شناسنامه ماشین‌آلات و تجهیزات",
    machinery: "شناسنامه ماشین‌آلات و تجهیزات",
    categories: "دسته‌بندی و مشخصات فنی تجهیزات",
    locations: "موقعیت‌های فیزیکی و سالن‌های کارخانه",
  };

  const tabTitlesEn: Record<string, string> = {
    directory: "Machinery & Equipment Registry",
    machinery: "Machinery & Equipment Registry",
    categories: "Asset Categories & Parameters",
    locations: "Plant Locations & Workshop Bays",
  };

  const currentTab = VALID_TABS.includes(tab) ? tab : "directory";
  const sectionTitle = isFa ? tabTitlesFa[currentTab] : tabTitlesEn[currentTab];

  return {
    title: `${sectionTitle} | ESP Asset | Euroslot Pars`,
    description: isFa
      ? "سامانه شناسنامه ماشین‌آلات صنعتی، مشخصات فنی، موقعیت استقرار و سوابق نگهداری کارخانه (ESP Asset)"
      : "ESP Asset: Industrial machinery registry, technical specs, physical plant locations, and lifecycle management",
  };
}

export default async function AssetsTabPage({ params }: Props) {
  const { locale, tab } = await params;
  setRequestLocale(locale);

  const activeTab: AssetTab = tab === "machinery" ? "directory" : (VALID_TABS.includes(tab) ? (tab as AssetTab) : "directory");

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AssetsModuleShell initialTab={activeTab} />
    </Suspense>
  );
}
