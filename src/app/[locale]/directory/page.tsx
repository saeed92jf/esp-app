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
      ? "راهنمای همکاران و شناسنامه سازمانی | Euroslot Pars CORE"
      : "Personnel Directory & Organizational Identity | Euroslot Pars CORE",
    description: isFa
      ? "شبکه ارتباطی و راهنمای دسترسی به شماره‌های داخلی، ایمیل‌ها و شناسنامه سازمانی پرسنل شرکت‌های یورواسلات پارس و نانو پالایش سرام"
      : "Corporate communication network and directory for Euroslot Pars and Nano Palayesh Ceram personnel",
  };
}

export default async function DirectoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full flex-1 flex flex-col min-h-full bg-background text-foreground">
      <PersonnelDirectory />
    </div>
  );
}

