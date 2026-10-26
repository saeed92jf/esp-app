// src/app/[locale]/dashboard/help/docs/page.tsx
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { DocsPageContainer } from "@/modules/docs";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HelpDocsPage({ params }: Props) {
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
      <DocsPageContainer />
    </Suspense>
  );
}
