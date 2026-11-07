import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CommunityPage } from "@/modules/community/components/community-page";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa ? "تالار گفتگو و پرسش و پاسخ (Q&A) | Euroslot Pars CORE" : "Community & Q&A | Euroslot Pars CORE",
    description: isFa
      ? "تالار پرسش و پاسخ تخصصی مهندسی، تبادل دانش و حل چالش‌های فنی یورواسلات پارس"
      : "Collaborative Engineering Community & Q&A Platform for Euroslot Pars CORE",
  };
}

export default async function DedicatedCommunityPage({ params }: Props) {
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
      <CommunityPage />
    </Suspense>
  );
}
