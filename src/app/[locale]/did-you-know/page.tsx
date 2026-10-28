import React, { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { DidYouKnowPage } from "@/modules/did-you-know/components/did-you-know-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "fa" ? "آیا می‌دانید؟ | دانستنی‌های علمی و مهندسی" : "Did You Know? | Engineering Insights",
    description: locale === "fa"
      ? "نکات علمی شگفت‌انگیز، فرمول‌های فیزیک و استانداردهای طراحی مکانیک و مخازن تحت فشار"
      : "Fascinating engineering facts, physics principles, and ASME standards",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-full flex items-center justify-center bg-panel dark:bg-background text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-primary animate-ping" />
            <span className="text-sm font-medium">...</span>
          </div>
        </div>
      }
    >
      <DidYouKnowPage />
    </Suspense>
  );
}
