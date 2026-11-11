// src/app/[locale]/customers/new/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CustomersPageContainer } from "@/modules/customers/components/CustomersPageContainer";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "افزودن کارفرما جدید | یورواسلات پارس"
      : "Add New Client | Euroslot Pars",
    description: isFa
      ? "ثبت و تعریف کارفرما، پتروشیمی یا شرکت صنعتی جدید"
      : "Register and configure new industrial client or refinery partner",
  };
}

export default async function NewCustomerPage({ params }: Props) {
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
      <CustomersPageContainer initialTab="create" />
    </Suspense>
  );
}
