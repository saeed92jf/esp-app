import React, { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SearchResultsClient } from "@/modules/search/components/search-results-client";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "Search" });

  const querySuffix = q ? ` - ${q}` : "";
  return {
    title: `${t("title")}${querySuffix}`,
  };
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-primary animate-ping" />
            <span className="text-sm font-medium">...</span>
          </div>
        </div>
      }
    >
      <SearchResultsClient />
    </Suspense>
  );
}
