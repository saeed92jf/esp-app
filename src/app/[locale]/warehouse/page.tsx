// src/app/[locale]/warehouse/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { WarehouseModuleShell } from "@/modules/warehouse/components/WarehouseModuleShell";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "ESP Warehouse | انبارداری و مدیریت قطعات کارخانه | یورواسلات پارس"
      : "ESP Warehouse | Factory Warehouse & Inventory | Euroslot Pars",
    description: isFa
      ? "سامانه انبارداری، مدیریت موجودی قطعات یدکی، پالت‌بندی و لجستیک کارخانه یورواسلات پارس (ESP Warehouse)"
      : "ESP Warehouse: Factory inventory management, spare parts stock, warehouse bays, and logistics",
  };
}

export default async function WarehousePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <WarehouseModuleShell initialTab="inventory" />
    </Suspense>
  );
}
