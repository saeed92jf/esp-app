// src/app/[locale]/customers/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CustomersPageContainer } from "@/modules/customers/components/CustomersPageContainer";
import { ModulePageSkeleton } from "@/components/layout/module-page-skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "ESP Customers | اطلس جامع صنایع و کارفرمایان | یورواسلات پارس"
      : "ESP Customers | Clients & Licensors Directory | Euroslot Pars",
    description: isFa
      ? "اطلس جامع صنایع پتروشیمی، پالایشگاهی و لایسنسورهای فرآیندی طرف قرارداد یورواسلات پارس (ESP Customers)"
      : "ESP Customers: Official directory of industrial clients, petrochemical complexes, and process licensors",
  };
}

export default async function CustomersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <CustomersPageContainer />
    </Suspense>
  );
}
