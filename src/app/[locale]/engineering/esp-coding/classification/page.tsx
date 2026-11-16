import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MaterialFormClassificationView } from "@/modules/esp-coding";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "طبقه‌بندی و فرم‌های متریال (MTO & Forms) | ESP Coding"
      : "Material Form Classification | ESP Coding",
  };
}

export default async function EspCodingClassificationPage({ params }: Props) {
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
      <MaterialFormClassificationView />
    </Suspense>
  );
}
