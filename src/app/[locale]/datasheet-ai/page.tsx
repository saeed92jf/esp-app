import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DatasheetAIPage } from "@/modules/datasheet-ai";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "سامانه هوشمند استخراج دیتاشیت (Datasheet AI) | Euroslot Pars CORE"
      : "Datasheet AI Analyzer | Euroslot Pars CORE",
    description: isFa
      ? "پردازش و استخراج هوشمند پارامترهای فنی تجهیزات صنعتی با هوش مصنوعی داخلی"
      : "On-Premise Industrial AI Datasheet Parser and Engineering Assistant",
  };
}

export default async function DedicatedDatasheetAIPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <DatasheetAIPage />
    </Suspense>
  );
}

