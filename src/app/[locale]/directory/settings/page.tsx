import React from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PersonnelDirectory } from "@/modules/directory/components/PersonnelDirectory";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "تنظیمات دایرکتوری همکاران | Euroslot Pars CORE"
      : "Personnel Directory Settings | Euroslot Pars CORE",
    description: isFa
      ? "پیکربندی و تنظیمات نمایش شناسنامه سازمانی پرسنل"
      : "Configure and customize personnel directory settings",
  };
}

export default async function DirectorySettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full flex-1 flex flex-col min-h-full bg-panel dark:bg-background text-foreground">
      <PersonnelDirectory initialTab="settings" />
    </div>
  );
}

