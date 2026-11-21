import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MaterialCodingView } from "@/modules/esp-coding";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "کدگذاری هوشمند متریال و مواد خام | ESP Coding"
      : "Material Coding & Specifications | ESP Coding",
  };
}

export default async function EspCodingMaterialCodingPage({ params }: Props) {
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
      <MaterialCodingView />
    </Suspense>
  );
}
