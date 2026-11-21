// src/app/[locale]/warehouse/[tab]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { WarehouseModuleShell } from "@/modules/warehouse/components/WarehouseModuleShell";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";
import { WarehouseTab } from "@/modules/warehouse/types/warehouse.types";

type Props = {
  params: Promise<{ locale: string; tab: string }>;
};

const VALID_TABS: WarehouseTab[] = [
  "inventory",
  "locations",
  "transactions",
  "receipts",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tab } = await params;
  const isFa = locale === "fa";

  const tabTitlesFa: Record<WarehouseTab, string> = {
    inventory: "موجودی قطعات و انبار",
    locations: "قفسه‌بندی و جایگاه‌های انبار",
    transactions: "گردش کالا و تراکنش‌ها",
    receipts: "رسیدها و حواله‌های انبار",
  };

  const tabTitlesEn: Record<WarehouseTab, string> = {
    inventory: "Inventory & Spare Parts",
    locations: "Bays & Storage Locations",
    transactions: "Stock Transactions",
    receipts: "Vouchers & Receipts",
  };

  const currentTab = (VALID_TABS.includes(tab as WarehouseTab) ? tab : "inventory") as WarehouseTab;
  const sectionTitle = isFa ? tabTitlesFa[currentTab] : tabTitlesEn[currentTab];

  return {
    title: `${sectionTitle} | ESP Warehouse | Euroslot Pars`,
    description: isFa
      ? "سامانه انبارداری، مدیریت موجودی قطعات یدکی، پالت‌بندی و لجستیک کارخانه یورواسلات پارس (ESP Warehouse)"
      : "ESP Warehouse: Factory inventory management, spare parts stock, warehouse bays, and logistics",
  };
}

export default async function WarehouseTabPage({ params }: Props) {
  const { locale, tab } = await params;
  setRequestLocale(locale);

  const activeTab: WarehouseTab = VALID_TABS.includes(tab as WarehouseTab)
    ? (tab as WarehouseTab)
    : "inventory";

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <WarehouseModuleShell initialTab={activeTab} />
    </Suspense>
  );
}
