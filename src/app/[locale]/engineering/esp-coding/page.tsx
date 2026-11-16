import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CodingWorkspace } from "@/modules/esp-coding";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "میز کار کدگذاری قطعات و متریال (ESP Coding) | Euroslot Pars CORE"
      : "ESP Coding Workspace | Euroslot Pars CORE",
    description: isFa
      ? "سامانه جامع و متمرکز کدگذاری، مستر دیتای متریال و طراحی فرمول‌های مهندسی"
      : "Enterprise Product and Material Coding Management System",
  };
}

export default async function EspCodingWorkspacePage({ params }: Props) {
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
      <CodingWorkspace />
    </Suspense>
  );
}
