import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SuperAdminApprovalsView } from "@/modules/esp-coding";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "تأیید و فعال‌سازی فرمول‌ها (Super Admin) | ESP Coding"
      : "Formula Approvals & Governance | ESP Coding",
  };
}

export default async function EspCodingApprovalsPage({ params }: Props) {
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
      <SuperAdminApprovalsView />
    </Suspense>
  );
}
