import React from "react";
import { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { PersonnelDirectory } from "@/modules/directory/components/PersonnelDirectory";

export const metadata: Metadata = {
  title: "راهنمای همکاران و شناسنامه پرسنل | Euroslot Pars CORE",
  description:
    "شبکه ارتباطی و راهنمای دسترسی به شماره‌های داخلی، ایمیل‌ها و شناسنامه سازمانی پرسنل شرکت‌های یورواسلات پارس و نانو پالایش سرام",
};

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader
        tag="همکاران"
        subTag="راهنمای سازمانی"
        logoShort={true}
        showMenuButton={true}
      />
      <main className="flex-1">
        <PersonnelDirectory />
      </main>
    </div>
  );
}
