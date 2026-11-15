// src/modules/search/components/SearchKnowledgeCard.tsx
"use client";

import React from "react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  TreeStructure,
  Kanban,
  ListChecks,
  Buildings,
  FileMagnifyingGlass,
  BookOpenText,
  Lightbulb,
  VideoCamera,
  Lifebuoy,
  AddressBook,
  ChatCircleDots,
  House,
  ShieldCheck,
  Archive,
} from "@phosphor-icons/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";
import { IconGradients } from "@/components/ui/icon-gradients";
import { resolveNavIconGradient, type NavColor } from "@/config/navigation";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { cn } from "@/lib/utils";
import type { SearchItem } from "../types/search.types";

interface Sitelink {
  labelFa: string;
  labelEn: string;
  href: string;
}

interface ModuleConfig {
  icon: PhosphorIcon;
  color: NavColor;
  badgeFa: string;
  badgeEn: string;
  sitelinks: Sitelink[];
}

const MODULE_REGISTRY: Record<string, ModuleConfig> = {
  "/ESP-Flow": {
    icon: TreeStructure,
    color: "violet",
    badgeFa: "ماژول اصلی محاسبات فرایندی",
    badgeEn: "Process Simulation & Vessel Design",
    sitelinks: [
      { labelFa: "محاسبات مخازن ASME", labelEn: "ASME Calculations", href: "/ESP-Flow" },
      { labelFa: "شبیه‌سازی جریان فرایند", labelEn: "Process Simulation", href: "/ESP-Flow" },
      { labelFa: "هندسه، هد و متریال", labelEn: "Geometry & Materials", href: "/ESP-Flow" },
    ],
  },
  "/projects": {
    icon: Kanban,
    color: "blue",
    badgeFa: "سامانه جامع مدیریت پروژه‌ها",
    badgeEn: "Engineering Projects & VDIS",
    sitelinks: [
      { labelFa: "فهرست پروژه‌های فعال", labelEn: "Active Projects", href: "/projects" },
      { labelFa: "ثبت و تعریف پروژه جدید", labelEn: "New Project", href: "/projects/new" },
      { labelFa: "کارتابل ترنسمیتال و نامه‌ها", labelEn: "Letters & Transmittals", href: "/projects/letters" },
    ],
  },
  "/tasks": {
    icon: ListChecks,
    color: "sky",
    badgeFa: "سامانه مدیریت وظایف و تسک‌ها",
    badgeEn: "Tasks & Kanban Workflow",
    sitelinks: [
      { labelFa: "تخته کانبان تسک‌ها", labelEn: "Kanban Board", href: "/tasks" },
      { labelFa: "ثبت تسک جدید", labelEn: "New Task", href: "/tasks/new" },
      { labelFa: "تسک‌های یورواسلات پارس", labelEn: "Euroslot Tasks", href: "/tasks?company=euroslot" },
      { labelFa: "تسک‌های نانو پالایش سرام", labelEn: "Nano Ceram Tasks", href: "/tasks?company=nano" },
    ],
  },
  "/customers": {
    icon: Buildings,
    color: "teal",
    badgeFa: "بانک اطلاعات کارفرماها و لایسنسورها",
    badgeEn: "Industrial Clients & Licensors",
    sitelinks: [
      { labelFa: "شرکت‌ها و کارفرمایان", labelEn: "Companies & Clients", href: "/customers?tab=companies" },
      { labelFa: "دایرکتوری لایسنسورها", labelEn: "Licensors Directory", href: "/customers?tab=licensors" },
      { labelFa: "ثبت کارفرمای جدید", labelEn: "Add Customer", href: "/customers/new" },
    ],
  },
  "/datasheet-ai": {
    icon: FileMagnifyingGlass,
    color: "cyan",
    badgeFa: "سامانه هوش مصنوعی استخراج دیتاشیت",
    badgeEn: "Datasheet AI Extractor",
    sitelinks: [
      { labelFa: "بارگذاری دیتاشیت PDF", labelEn: "Upload Datasheet", href: "/datasheet-ai" },
      { labelFa: "تحلیل پارامترها و جداول", labelEn: "Parameters & Tables", href: "/datasheet-ai" },
    ],
  },
  "/dictionary": {
    icon: BookOpenText,
    color: "emerald",
    badgeFa: "واژه‌نامه تخصصی مهندسی و استانداردها",
    badgeEn: "Engineering Dictionary & Standards",
    sitelinks: [
      { labelFa: "جستجوی واژگان تخصصی", labelEn: "Search Terms", href: "/dictionary" },
      { labelFa: "کدهای استاندارد ASME / API", labelEn: "ASME & API Codes", href: "/dictionary" },
    ],
  },
  "/did-you-know": {
    icon: Lightbulb,
    color: "amber",
    badgeFa: "دانستنی‌های علمی و فرمول‌های مهندسی",
    badgeEn: "Scientific & Engineering Insights",
    sitelinks: [
      { labelFa: "کارت‌های علمی و دانستنی‌ها", labelEn: "Science Insights", href: "/did-you-know" },
    ],
  },
  "/aparat": {
    icon: VideoCamera,
    color: "rose",
    badgeFa: "ویدیوها و دوره‌های آموزشی مهندسی",
    badgeEn: "Video Tutorials & Webinars",
    sitelinks: [
      { labelFa: "ویدیوها و آموزش‌های آپارات", labelEn: "Video Tutorials", href: "/aparat" },
    ],
  },
  "/bug-reports": {
    icon: Lifebuoy,
    color: "rose",
    badgeFa: "مرکز گزارش خطا و ایشو سنتر",
    badgeEn: "System Issue Center",
    sitelinks: [
      { labelFa: "ثبت گزارش باگ جدید", labelEn: "Report Issue", href: "/bug-reports" },
      { labelFa: "پیگیری گزارش‌های من", labelEn: "My Bug Reports", href: "/bug-reports" },
    ],
  },
  "/directory": {
    icon: AddressBook,
    color: "sky",
    badgeFa: "دفترچه تلفن پرسنل و چارت سازمانی",
    badgeEn: "Personnel Directory",
    sitelinks: [
      { labelFa: "شماره‌های داخلی پرسنل", labelEn: "Internal Extensions", href: "/directory" },
      { labelFa: "چارت سازمانی", labelEn: "Organization Chart", href: "/directory" },
    ],
  },
  "/community": {
    icon: ChatCircleDots,
    color: "indigo",
    badgeFa: "تالار گفتگو و پرسش و پاسخ تخصصی",
    badgeEn: "Engineering Community & Q&A",
    sitelinks: [
      { labelFa: "پرسش‌های فنی اخیر", labelEn: "Recent Questions", href: "/community" },
      { labelFa: "ثبت پرسش جدید", labelEn: "Ask Question", href: "/community" },
    ],
  },
  "/dashboard": {
    icon: House,
    color: "blue",
    badgeFa: "میز کار و داشبورد مرکزی",
    badgeEn: "Central Management Dashboard",
    sitelinks: [
      { labelFa: "پروژه‌های من", labelEn: "My Projects", href: "/dashboard?tab=projects" },
      { labelFa: "تسک‌های من", labelEn: "My Tasks", href: "/dashboard?tab=tasks" },
      { labelFa: "تقویم کاری", labelEn: "Work Calendar", href: "/dashboard?tab=calendar" },
    ],
  },
  "/admin": {
    icon: ShieldCheck,
    color: "slate",
    badgeFa: "پنل مدیریت کاربران و سیستم",
    badgeEn: "System Administration Panel",
    sitelinks: [
      { labelFa: "مدیریت کاربران و دسترسی‌ها", labelEn: "User Management", href: "/admin/users" },
      { labelFa: "درخواست‌های عضویت", labelEn: "Registration Requests", href: "/admin/requests" },
      { labelFa: "لاگ‌ها و مانیتورینگ", labelEn: "Audit Logs", href: "/admin/audit-logs" },
    ],
  },
};

interface SearchKnowledgeCardProps {
  item: SearchItem;
  query: string;
  locale: string;
  isRtl: boolean;
}

export function SearchKnowledgeCard({
  item,
  query,
  locale,
  isRtl,
}: SearchKnowledgeCardProps) {
  const isQueryEn = /[a-zA-Z]/.test(query) && !/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(query);
  const isQueryFa = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(query);
  const showEnglish = isQueryEn || (locale === "en" && !isQueryFa);

  // Match module configuration by normalized path
  const normalizedHref = item.href.split("?")[0].replace(/\/+$/, "");
  const modConfig =
    MODULE_REGISTRY[item.href] ||
    MODULE_REGISTRY[normalizedHref] ||
    Object.entries(MODULE_REGISTRY).find(([key]) =>
      normalizedHref.toLowerCase() === key.toLowerCase()
    )?.[1];

  const isModule = Boolean(
    modConfig ||
    item.category === "modules" ||
    item.id.startsWith("mod-")
  );

  const displayTitle = showEnglish && item.titleEn ? item.titleEn : item.title;
  const displaySubtitle = showEnglish ? item.title : item.titleEn;
  const displaySnippet = showEnglish && item.snippetEn ? item.snippetEn : item.snippet;

  // Icon & color determination
  const PhosphorIconComponent: PhosphorIcon = modConfig
    ? modConfig.icon
    : item.category === "projects"
    ? Archive
    : item.category === "videos"
    ? VideoCamera
    : item.category === "dictionary"
    ? BookOpenText
    : item.category === "tasks"
    ? ListChecks
    : TreeStructure;

  const colorToken: NavColor = modConfig
    ? modConfig.color
    : item.category === "projects"
    ? "blue"
    : item.category === "videos"
    ? "rose"
    : item.category === "dictionary"
    ? "emerald"
    : item.category === "tasks"
    ? "sky"
    : "violet";

  const badgeText = isModule
    ? modConfig
      ? showEnglish
        ? modConfig.badgeEn
        : modConfig.badgeFa
      : showEnglish
      ? "Official System Module"
      : "ماژول رسمی سامانه"
    : item.category === "projects"
    ? showEnglish
      ? "Engineering Project"
      : "پروژه مهندسی"
    : item.category === "videos"
    ? showEnglish
      ? "Video Tutorial"
      : "ویدیوی آموزشی"
    : item.category === "dictionary"
    ? showEnglish
      ? "Dictionary Definition"
      : "تعریف واژه‌نامه تخصصی"
    : item.category === "tasks"
    ? showEnglish
      ? "Engineering Task"
      : "تسک و وظیفه مهندسی"
    : showEnglish
    ? "System Feature"
    : "قابلیت سامانه";

  const actionText = isModule
    ? showEnglish
      ? "Launch Module"
      : "ورود به ماژول"
    : item.category === "projects"
    ? showEnglish
      ? "View Project"
      : "مشاهده پروژه"
    : item.category === "videos"
    ? showEnglish
      ? "Watch Video"
      : "مشاهده ویدیو"
    : item.category === "dictionary"
    ? showEnglish
      ? "View in Glossary"
      : "مشاهده در واژه‌نامه"
    : showEnglish
    ? "Open"
    : "مشاهده";

  const sitelinks = modConfig?.sitelinks || [];

  return (
    <div
      dir={showEnglish ? "ltr" : isRtl ? "rtl" : "ltr"}
      className={cn(
        "mb-6 sm:mb-7 rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all text-start relative overflow-hidden group/knowledge",
        showEnglish ? "text-left" : isRtl ? "text-right" : "text-left"
      )}
    >
      <IconGradients />

      {/* Decorative top glow border */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-60" />

      {/* Header Row: Icon + Names + Direct Launch CTA */}
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          {/* Module / Entity Icon in Google Squircle */}
          <div
            className={cn(
              "size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 border border-border/70 shadow-2xs bg-muted/40 transition-transform group-hover/knowledge:scale-105",
              resolveNavIconGradient(colorToken)
            )}
          >
            <AppIcon icon={PhosphorIconComponent} className="size-7 sm:size-8" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Tagline / Source Breadcrumbs & Badge */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <Badge
                variant="secondary"
                className="text-[10.5px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md gap-1 bg-primary/10 text-primary border border-primary/20"
              >
                <Sparkles className="size-3 text-primary shrink-0" />
                <span>{badgeText}</span>
              </Badge>

              <span className="text-[11px] text-muted-foreground/80 font-mono truncate hidden xs:inline-block">
                esp.app{item.href.split("?")[0]}
              </span>
            </div>

            {/* Entity Title */}
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-snug truncate">
              <Link
                href={item.href}
                className="text-foreground hover:text-primary transition-colors focus:outline-none focus:underline"
              >
                <HighlightMatch
                  text={displayTitle}
                  query={query}
                  highlightClassName="bg-primary/15 text-primary font-bold px-0.5 rounded-xs"
                />
              </Link>
            </h2>

            {/* Subtitle / Alternate Language */}
            {displaySubtitle && (
              <p className="text-xs text-muted-foreground font-mono truncate mt-0.5 opacity-85">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Primary CTA Button (Google Style) */}
        <Button
          asChild
          size="sm"
          className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
        >
          <Link href={item.href}>
            <span>{actionText}</span>
            <ArrowUpRight className="size-3.5 rtl:rotate-[-90deg] ltr:rotate-0" />
          </Link>
        </Button>
      </div>

      {/* Description Snippet */}
      <p className="mt-3 text-xs sm:text-[13.5px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed max-w-4xl">
        <HighlightMatch
          text={displaySnippet}
          query={query}
          highlightClassName="font-semibold text-foreground dark:text-white bg-black/5 dark:bg-white/10 px-0.5 rounded-xs"
        />
      </p>

      {/* Sitelinks / Quick Actions (Google Sitelinks Under Card) */}
      {sitelinks.length > 0 && (
        <div className="pt-3.5 mt-3.5 border-t border-border/60">
          <div className="mb-2 text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>{isRtl ? "دسترسی‌های سریع و امکانات ماژول:" : "Quick Actions & Features:"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {sitelinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-muted/30 hover:bg-muted/70 text-xs font-medium text-foreground transition-colors group/link border border-transparent hover:border-border/60"
              >
                <span className="truncate group-hover/link:text-primary transition-colors text-[11.5px] sm:text-xs">
                  {showEnglish ? link.labelEn : link.labelFa}
                </span>
                {isRtl ? (
                  <ChevronLeft className="size-3 text-muted-foreground group-hover/link:text-primary transition-colors shrink-0 ms-1" />
                ) : (
                  <ChevronRight className="size-3 text-muted-foreground group-hover/link:text-primary transition-colors shrink-0 ms-1" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
