"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DashboardAvatar } from "./dashboard-avatar";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { Link } from "@/i18n/navigation";
import { Home, Menu, Calendar as CalendarIcon } from "lucide-react";

interface DashboardHeaderProps {
  displayName: string;
  userRole: string;
  tAuth: (key: string) => string;
  tDashboard: (key: string, values?: any) => string;
  menuSidebarOpen: boolean;
  setMenuSidebarOpen: (v: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export function DashboardHeader({
  displayName,
  userRole,
  tAuth,
  tDashboard,
  menuSidebarOpen,
  setMenuSidebarOpen,
  sidebarOpen,
  setSidebarOpen,
}: DashboardHeaderProps) {
  const locale = useLocale();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 flex items-center justify-between w-full mb-6 bg-background/60 backdrop-blur-md py-3"
    >
      <div className="flex items-center justify-start gap-0">
        <div className="flex-shrink-0 origin-left rtl:origin-right mt-2">
          <DashboardAvatar />
        </div>
        <div className="flex flex-col rtl:mr-1 ltr:ml-1">
          <h1 className="fa-num font-bold tracking-tight text-lg leading-tight capitalize">
            {displayName}
          </h1>
          <span className="text-muted-foreground font-medium text-xs mt-0.5">
            {userRole ? tAuth(`roles.${userRole}`) : tDashboard(`roleSummary.${userRole}`)}
          </span>
        </div>
      </div>

      {/* ── Top Buttons ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 scale-90 origin-right rtl:origin-left">
        <LocaleSwitcher className="bg-card border-border/50 h-8 text-xs sm:px-3" />
        <Link
          href="/"
          className="flex items-center justify-center bg-card border border-border/50 rounded-xl shadow-sm hover:bg-primary/10 hover:text-primary transition-all duration-200 p-1.5"
          title="خانه"
        >
          <Home className="size-4" />
        </Link>
        <button
          onClick={() => setMenuSidebarOpen(!menuSidebarOpen)}
          className={cn(
            "flex items-center justify-center bg-card border border-border/50 rounded-xl shadow-sm hover:bg-primary/10 hover:text-primary transition-all duration-200 p-1.5",
            menuSidebarOpen && "bg-primary/5 border-primary/20 text-primary"
          )}
          title={menuSidebarOpen ? "بستن منو" : "باز کردن منو"}
        >
          <Menu className="size-4" />
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "flex items-center justify-center bg-card border border-border/50 rounded-xl shadow-sm hover:bg-primary/10 hover:text-primary transition-all duration-200 p-1.5",
            sidebarOpen && "bg-primary/5 border-primary/20 text-primary"
          )}
          title={sidebarOpen ? (locale === "fa" ? "بستن رویدادها" : "Hide Events") : (locale === "fa" ? "رویدادهای پیش رو" : "Upcoming Events")}
        >
          <CalendarIcon className="size-4" />
        </button>
      </div>
    </motion.header>
  );
}
