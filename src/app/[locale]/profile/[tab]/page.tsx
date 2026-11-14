import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProfilePage } from "@/modules/profile/components/profile-page";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; tab: string }>;
};

const VALID_TABS = [
  "personal",
  "documents",
  "organizational",
  "skills",
  "requests",
  "insurance",
  "education",
  "settings",
];

export async function generateStaticParams() {
  return VALID_TABS.map((tab) => ({ tab }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tab } = await params;
  const isFa = locale === "fa";
  const tabTitlesFa: Record<string, string> = {
    personal: "اطلاعات فردی",
    documents: "مدارک و اسناد",
    organizational: "اطلاعات سازمانی",
    skills: "مهارت‌ها و تخصص‌ها",
    requests: "درخواست‌ها و کارتابل",
    insurance: "بیمه و درمان",
    education: "سوابق تحصیلی",
    settings: "تنظیمات حساب",
  };
  const tabTitlesEn: Record<string, string> = {
    personal: "Personal Info",
    documents: "Documents & Files",
    organizational: "Organizational Data",
    skills: "Skills & Expertise",
    requests: "Requests & Approvals",
    insurance: "Insurance & Healthcare",
    education: "Education History",
    settings: "Account Settings",
  };

  const titlePrefix = isFa ? (tabTitlesFa[tab] || "پروفایل پرسنلی") : (tabTitlesEn[tab] || "Personnel Profile");
  return {
    title: `${titlePrefix} | Euroslot Pars CORE`,
    description: isFa
      ? "پروفایل کاربری، اطلاعات پرسنلی و تنظیمات حساب"
      : "User profile, personnel records and account settings",
  };
}

export default async function TabPage({ params }: Props) {
  const { locale, tab } = await params;
  setRequestLocale(locale);

  return (
    <AuthGate>
      <Suspense
        fallback={
          <div className="flex-1 min-h-screen flex items-center justify-center bg-panel dark:bg-background">
            <RefreshCw className="size-8 animate-spin text-primary" />
          </div>
        }
      >
        <ProfilePage initialTab={tab} />
      </Suspense>
    </AuthGate>
  );
}
