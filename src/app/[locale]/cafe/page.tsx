import React, { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RefreshCw } from "lucide-react";
import { CafeView } from "@/modules/cafe/components/cafe-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";

  return {
    title: isFa
      ? "سامانه جامع مدیریت کافه و رستوران | ZHEEN COFFEE ERP"
      : "Cafe & Restaurant ERP System | ZHEEN COFFEE",
    description: isFa
      ? "سامانه یکپارچه فروش حضوری POS، کنترل فرمول BOM، انبارداری، نمایشگر آشپزخانه KDS و تجربه ۳ بعدی شکلات آبی"
      : "Integrated POS, BOM Formula, Kitchen Display KDS and 3D Blue Chocolate Experience",
  };
}

export default async function CafePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[60vh] flex items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="size-6 animate-spin text-primary" />
            <span className="text-sm font-medium">
              {locale === "fa" ? "در حال بارگذاری سامانه کافه..." : "Loading Cafe ERP..."}
            </span>
          </div>
        </div>
      }
    >
      <CafeView />
    </Suspense>
  );
}
