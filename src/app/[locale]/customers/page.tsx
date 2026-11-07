import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CustomersDirectoryView } from "@/modules/customers/components/CustomersDirectoryView";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "فهرست کارفرمایان و مشتریان | یورواسلات پارس"
      : "Clients & Partners Directory | Euroslot Pars",
    description: isFa
      ? "بانک اطلاعات کارفرمایان و صنایع پتروشیمی، پالایشگاهی و صنعتی طرف قرارداد"
      : "Official directory of industrial clients, petrochemical complexes, and refineries",
  };
}

export default async function CustomersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <CustomersDirectoryView />
    </Suspense>
  );
}

