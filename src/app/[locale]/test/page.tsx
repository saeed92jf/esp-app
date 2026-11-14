import React, { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RefreshCw } from "lucide-react";
import { TestLabView } from "@/modules/test-lab/components/test-lab-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";

  return {
    title: isFa
      ? "آزمایشگاه تست و اعتبارسنجی | Euroslot Pars CORE"
      : "Test Lab & System Validation | Euroslot Pars CORE",
    description: isFa
      ? "صفحه تست اختصاصی کامپوننت‌های رابط کاربری، استانداردهای طراحی و سلامت سامانه Euroslot Pars"
      : "Dedicated sandbox for UI components, design standards, and system health validation across Euroslot Pars",
  };
}

export default async function TestPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[60vh] flex items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="size-6 animate-spin text-primary" />
            <span className="text-sm font-medium">
              {locale === "fa" ? "در حال بارگذاری آزمایشگاه تست..." : "Loading Test Lab..."}
            </span>
          </div>
        </div>
      }
    >
      <TestLabView />
    </Suspense>
  );
}
