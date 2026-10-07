"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DashboardAvatar } from "./dashboard-avatar";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "@/i18n/navigation";
import { Home, Settings, LogOut } from "lucide-react";
import { CalendarBlank, ListDashes } from "@phosphor-icons/react";
import { DashboardSettingsModal } from "./dashboard-settings-modal";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useRouter } from "@/i18n/navigation";
import { AppsPopover } from "@/components/layout/apps-popover";
import { HelpPopover } from "@/components/layout/help-popover";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";

interface DashboardHeaderProps {
  displayName: string;
  userRole: string;
  tAuth: (key: string) => string;
  tDashboard: (key: string, values?: any) => string;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  linksSidebarOpen: boolean;
  setLinksSidebarOpen: (v: boolean) => void;
  isScrolled?: boolean;
}

export function DashboardHeader({
  displayName,
  userRole,
  tAuth,
  tDashboard,
  sidebarOpen,
  setSidebarOpen,
  linksSidebarOpen,
  setLinksSidebarOpen,
  isScrolled = false,
}: DashboardHeaderProps) {
  const locale = useLocale();
  const tDash = useTranslations("Dashboard.header");
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
      <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "z-[60] absolute top-0 left-0 right-0 flex items-center justify-between w-full bg-background/50 backdrop-blur-2xl px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 border-none shadow-none"
      )}
    >
      <div className="flex items-center justify-start gap-3">
        <div className="flex-shrink-0 relative z-50">
          <DashboardAvatar />
        </div>
        <div className="flex flex-col">
          <h1 className="fa-num font-semibold text-foreground/90 tracking-tight text-lg leading-tight capitalize">
            {displayName}
          </h1>
        </div>
        
        {/* Sidebar Toggles */}
        <div className="flex items-center gap-1 rtl:mr-3 ltr:ml-3 border-l rtl:border-l-0 rtl:border-r border-border/80 rtl:pr-4 ltr:pl-4 h-8">
          <button
            onClick={() => setLinksSidebarOpen(!linksSidebarOpen)}
            className={cn(HEADER_ICON_BUTTON_CLASS, linksSidebarOpen && "bg-foreground/[0.08] text-foreground")}
            title={linksSidebarOpen ? tDashboard("header.closeMenu") : tDashboard("calendar.usefulLinks")}
          >
            <ListDashes weight="duotone" className="size-5" />
          </button>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(HEADER_ICON_BUTTON_CLASS, sidebarOpen && "bg-foreground/[0.08] text-foreground")}
            title={sidebarOpen ? tDashboard("header.hideEvents") : tDashboard("header.upcomingEvents")}
          >
            <CalendarBlank weight="duotone" className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 origin-right rtl:origin-left">
        <ThemeToggle />
        <LocaleSwitcher />
        <HelpPopover 
          triggerClassName={HEADER_ICON_BUTTON_CLASS}
          iconClassName={HEADER_ICON_CLASS}
        />
        <AppsPopover 
          triggerClassName={HEADER_ICON_BUTTON_CLASS}
          iconClassName={HEADER_ICON_CLASS}
        />
      </div>
      <DashboardSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </motion.header>
  );
}

