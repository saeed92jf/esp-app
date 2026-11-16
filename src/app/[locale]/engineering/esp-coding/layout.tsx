"use client";

import React from "react";
import { usePathname, Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Binary,
  Layers,
  Database,
  Sliders,
  ShieldCheck,
  FileSpreadsheet,
  LayoutDashboard,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function EspCodingLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("espCoding.nav");

  const navItems = [
    {
      id: "workspace",
      label: t("workspace"),
      href: "/engineering/esp-coding",
      icon: LayoutDashboard,
      isActive: pathname === "/engineering/esp-coding",
    },
    {
      id: "products",
      label: t("products"),
      href: "/engineering/esp-coding/products",
      icon: Binary,
      isActive: pathname.startsWith("/engineering/esp-coding/products"),
    },
    {
      id: "materials",
      label: t("materials"),
      href: "/engineering/esp-coding/materials",
      icon: Database,
      isActive: pathname.startsWith("/engineering/esp-coding/materials"),
    },
    {
      id: "classification",
      label: t("classification"),
      href: "/engineering/esp-coding/classification",
      icon: Layers,
      isActive: pathname.startsWith("/engineering/esp-coding/classification"),
    },
    {
      id: "formula-designer",
      label: t("formulaDesigner"),
      href: "/engineering/esp-coding/formula-designer",
      icon: Sliders,
      isActive: pathname.startsWith("/engineering/esp-coding/formula-designer"),
    },
    {
      id: "approvals",
      label: t("approvals"),
      href: "/engineering/esp-coding/approvals",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/engineering/esp-coding/approvals"),
    },
    {
      id: "imports",
      label: t("imports"),
      href: "/engineering/esp-coding/imports",
      icon: FileSpreadsheet,
      isActive: pathname.startsWith("/engineering/esp-coding/imports"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950/70 text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Global Persistent AppHeader adhering to GEMINI.md Rules 5 & 6 */}
      <AppHeader
        variant="panel"
        tag={isRtl ? "کدگذاری قطعات و متریال" : "ESP Coding"}
      />

      {/* Main Sub-Navigation Bar adhering to GEMINI.md Rules A, B, C, F */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-14 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none" aria-label="ESP Coding Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shrink-0 transition-all cursor-pointer select-none",
                    item.isActive
                      ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="size-3.5" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content Body with Pure Opacity Fade Transition (Rule F: No Vertical Translate) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 animate-in fade-in duration-150">
        {children}
      </main>
    </div>
  );
}
