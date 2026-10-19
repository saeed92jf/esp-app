// src/app/[locale]/dashboard/projects/page.tsx
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { ProjectsPageContainer } from "@/modules/projects/components/projects-page-container";
import { RefreshCw } from "lucide-react";

type Props = {
  params: { locale: string };
};

export default function Page({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProjectsPageContainer />
    </Suspense>
  );
}
