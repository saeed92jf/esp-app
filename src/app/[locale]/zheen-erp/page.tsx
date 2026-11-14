import React, { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RefreshCw } from "lucide-react";
import { ZheenErpShell } from "@/modules/zheen-erp/components/zheen-erp-shell";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";

  return {
    title: isFa
      ? "سامانه جامع مدیریت و برنامه‌ریزی کافه ژین | ZHEEN CAFÉ ERP"
      : "ZHEEN Café Enterprise Resource Planning",
    description: isFa
      ? "مدیریت یکپارچه انبارداری سه‌گانه، فرمولاسیون چندسطحی BOM، بهای تمام‌شده، پرسنل، نگهداری و فضای سبز کافه ژین"
      : "Comprehensive Integrated Café Management System",
  };
}

export default async function ZheenErpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[60vh] flex items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="size-6 animate-spin text-primary" />
            <span className="text-sm font-medium">
              {locale === "fa" ? "در حال بارگذاری سامانه جامع کافه ژین..." : "Loading ZHEEN ERP..."}
            </span>
          </div>
        </div>
      }
    >
      <ZheenErpShell />
    </Suspense>
  );
}
