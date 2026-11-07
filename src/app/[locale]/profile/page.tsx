import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProfilePage } from "@/modules/profile/components/profile-page";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa ? "پروفایل پرسنلی | Euroslot Pars CORE" : "Personnel Profile | Euroslot Pars CORE",
    description: isFa
      ? "پروفایل کاربری، اطلاعات پرسنلی و تنظیمات حساب"
      : "User profile, personnel records and account settings",
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen flex items-center justify-center bg-panel dark:bg-background">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}
