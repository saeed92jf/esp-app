import React, { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { DictionaryPage } from "@/modules/dictionary/components/dictionary-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "fa" ? "دیکشنری تخصصی مهندسی | سامانه پارس" : "Technical Engineering Dictionary | ESP Platform",
    description: locale === "fa" 
      ? "واژه‌نامه و اصطلاحات تخصصی مهندسی مکانیک، مخازن تحت فشار، پایپینگ، متالورژی و استانداردهای ASME و API"
      : "Technical glossary and engineering terms for pressure vessels, piping, metallurgy, ASME and API standards",
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
        <div className="min-h-screen flex items-center justify-center bg-panel dark:bg-background text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-primary animate-ping" />
            <span className="text-sm font-medium">...</span>
          </div>
        </div>
      }
    >
      <DictionaryPage />
    </Suspense>
  );
}
