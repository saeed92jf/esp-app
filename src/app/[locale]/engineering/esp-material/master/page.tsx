import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MaterialMasterView } from "@/modules/esp-coding";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "مستر دیتای متریال و مشخصات فنی | ESP Material"
      : "Material Master & Properties | ESP Material",
  };
}

export default async function EspMaterialMasterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <MaterialMasterView />
    </Suspense>
  );
}
