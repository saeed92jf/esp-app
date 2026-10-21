"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronDown, LayoutDashboard, Search as SearchIcon, ShieldCheck, User, X } from "lucide-react";
import { Compass } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "@/config/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { segmentedAccordionMotion } from "@/lib/animations/segmented-accordion";

export interface SideMenuContentProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function SideMenuContent({ onClose, showCloseButton = true }: SideMenuContentProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const tMenu = useTranslations("Menu");
  const tSections = useTranslations("Menu.sections");
  const tItems = useTranslations("Menu.items");

  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [openGroup, setOpenGroup] = useState<string | undefined>(undefined);

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAVIGATION;

    return NAVIGATION.map((group) => {
      if (group.custom) return group;

      const sectionMatches = tSections(group.labelKey)
        .toLowerCase()
        .includes(q);

      const items = sectionMatches
        ? group.items
        : group.items.filter((item) =>
            tItems(item.labelKey).toLowerCase().includes(q)
          );

      return { ...group, items };
    }).filter((group) => group.custom || group.items.length > 0);
  }, [query, tItems, tSections]);

  useEffect(() => {
    if (query.trim()) {
      setMenuExpanded(true);
      if (filteredNav.length > 0) {
        setOpenGroup(filteredNav[0].id);
      }
    }
  }, [query, filteredNav]);

  const handleToggleMenuExpanded = () => {
    setMenuExpanded((prev) => {
      setOpenGroup(undefined);
      return !prev;
    });
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-popover">
      {/* Sticky Header with centered Navigation Title on scroll & concentric Close Button */}
      <div 
        className={cn(
          "absolute top-0 inset-x-0 z-30 flex items-center h-[46px] sm:h-[50px] transition-colors duration-200 pointer-events-auto",
          isScrolled 
            ? "bg-[#dfe7f3] dark:bg-popover/95 dark:backdrop-blur-md border-b border-border/50" 
            : "bg-popover border-b border-transparent"
        )}
      >
        {/* Centered Navigation Title with Compass icon (slides/fades in on scroll) */}
        <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none">
          <div className="flex items-center gap-2 max-w-full">
            <div 
              className={cn(
                "transition-all duration-300 ease-out shrink-0 flex items-center justify-center",
                isScrolled 
                  ? "opacity-100 scale-100 translate-y-0" 
                  : "opacity-0 scale-90 translate-y-2 pointer-events-none"
              )}
            >
              <Compass className="size-5 sm:size-5.5 text-primary shrink-0" weight="fill" />
            </div>
            <span 
              className={cn(
                "text-sm font-semibold text-foreground truncate min-w-0 text-center transition-opacity duration-300 ease-out",
                isScrolled 
                  ? "opacity-100" 
                  : "opacity-0 pointer-events-none"
              )}
            >
              {tMenu("mainNavigation")}
            </span>
          </div>
        </div>

        {/* Concentric Close Button (nested fillet: R_inner = R_outer - d) */}
        {showCloseButton && (
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-[6px] end-[6px] size-8.5 sm:size-9 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#98c1d9]/30 transition-colors z-20 cursor-pointer outline-none"
            aria-label={tMenu("close") || "بستن"}
          >
            <X className="size-4.5" />
          </button>
        )}
      </div>

      {/* Main Navigation Scroll Area with popup-scroll for scrollbar thumb positioning */}
      <ScrollArea
        className="w-full flex-1 min-h-0 popup-scroll"
        dir={dir}
        type="auto"
        onViewportScroll={(e) => {
          setIsScrolled(e.currentTarget.scrollTop > 8);
        }}
      >
        <div className="flex flex-col w-full p-3.5 sm:p-4 pt-[50px] sm:pt-[54px]">
          {/* Search Input */}
          <div className="relative mb-3 shrink-0">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute inset-s-6 top-1/2 size-5 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tMenu("search")}
              className="ps-14 pe-6 h-[52px] rounded-[22px] sm:rounded-[26px] text-[15px] font-normal placeholder:text-zinc-600 dark:placeholder:text-zinc-400 bg-white dark:bg-black border-border/40 shadow-none focus-visible:ring-1"
            />
          </div>

        <div className="segmented-list w-full">
          {/* Main Navigation Header Button */}
          <button
            type="button"
            onClick={handleToggleMenuExpanded}
            className={cn(
              "segmented-item group relative flex items-center justify-between gap-3.5 px-5 py-4.5 sm:py-5 text-start w-full outline-none cursor-pointer overflow-hidden",
              menuExpanded
                ? "rounded-t-[22px] sm:rounded-t-[26px] rounded-b-[6px] transition-[border-radius] duration-120 delay-0 ease-out"
                : "rounded-[22px] sm:rounded-[26px] transition-[border-radius] duration-220 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)]"
            )}
          >
            <span className="relative z-10 flex items-center gap-3.5 overflow-hidden">
              <Compass className="size-8 sm:size-8.5 shrink-0 text-primary" weight="fill" />
              <span className="flex flex-col text-start overflow-hidden gap-0.5">
                <span className="font-bold text-base sm:text-lg text-foreground leading-tight truncate">
                  {tMenu("mainNavigation")}
                </span>
                <span className="text-xs text-muted-foreground font-normal leading-tight truncate">
                  {tMenu("mainNavigationDesc")}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn(
                "relative z-10 size-5 text-muted-foreground transition-transform duration-200 shrink-0",
                menuExpanded && "rotate-180"
              )}
            />
          </button>

          {/* Expandable Sections */}
          <AnimatePresence initial={false}>
            {menuExpanded && (
              <motion.div
                initial={segmentedAccordionMotion.initial}
                animate={segmentedAccordionMotion.animate}
                exit={segmentedAccordionMotion.exit}
                className="flex flex-col gap-[2px] overflow-hidden"
              >
                {filteredNav.map((group) => {
                  const GroupIcon = group.icon;
                  const isExpanded = openGroup === group.id;

                  return (
                    <div key={group.id} className="flex flex-col gap-[2px]">
                      {/* Section Header */}
                      <button
                        type="button"
                        onClick={() => setOpenGroup(isExpanded ? undefined : group.id)}
                        className="segmented-item group relative flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-semibold w-full text-foreground/90 outline-none cursor-pointer overflow-hidden rounded-[6px]"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {GroupIcon && (
                            <AppIcon
                              icon={GroupIcon}
                              className="size-5 shrink-0 text-zinc-700 dark:text-zinc-400 group-hover:text-foreground transition-colors"
                            />
                          )}
                          <span>{tSections(group.labelKey)}</span>
                        </span>
                        <ChevronDown
                          className={cn(
                            "relative z-10 size-4 text-muted-foreground transition-transform duration-150",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Items Inside Section */}
                      <AnimatePresence initial={false}>
                        {isExpanded && !group.custom && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.12, ease: "easeOut" }}
                            className="flex flex-col gap-[2px]"
                          >
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isActive = pathname === item.href;

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={handleLinkClick}
                                  className={cn(
                                    "segmented-item group relative flex items-center gap-3 px-5 py-3.5 text-sm font-medium w-full outline-none no-underline hover:no-underline overflow-hidden rounded-[6px]",
                                    isActive ? "text-primary font-semibold" : "text-foreground/80 hover:text-foreground"
                                  )}
                                >
                                  {isActive && (
                                    <span
                                      className="absolute inset-0 bg-primary/10 pointer-events-none"
                                      aria-hidden="true"
                                    />
                                  )}
                                  <span className="relative z-10 flex items-center gap-3 w-full ms-5">
                                    {ItemIcon && (
                                      <AppIcon
                                        icon={ItemIcon}
                                        className={cn(
                                          "size-4.5 shrink-0 transition-colors",
                                          isActive
                                            ? "text-primary"
                                            : "text-zinc-600 dark:text-zinc-400 group-hover:text-foreground"
                                        )}
                                      />
                                    )}
                                    <span className="relative z-10 transition-colors">
                                      {tItems(item.labelKey)}
                                    </span>
                                  </span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Get Full Access Action */}
                <div className="segmented-item flex flex-col overflow-hidden rounded-b-[22px] sm:rounded-b-[26px] rounded-t-[6px]">
                  <Link
                    href="/plans"
                    onClick={handleLinkClick}
                    className="relative flex items-center justify-start gap-4 px-5 py-4 text-sm font-semibold w-full text-foreground/90 outline-none cursor-pointer"
                  >
                    <ShieldCheck className="relative z-10 size-5 text-foreground/90" />
                    <span className="relative z-10">{tMenu("getFullAccess")}</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dashboard Pill Button */}
        <div className="segmented-item flex flex-col overflow-hidden mt-3 rounded-[22px] sm:rounded-[26px]">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-semibold w-full text-foreground/90 outline-none"
          >
            <LayoutDashboard className="relative z-10 size-5 text-foreground/90" />
            <span className="relative z-10">{tMenu("dashboardLink")}</span>
          </Link>
        </div>

        {/* Privacy & Terms Footer Links */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground mt-4 mb-2">
          <Link
            href="/privacy"
            onClick={handleLinkClick}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {tMenu("privacy")}
          </Link>
          <span>•</span>
          <Link
            href="/terms"
            onClick={handleLinkClick}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {tMenu("terms")}
          </Link>
        </div>
      </div>
    </ScrollArea>
  </div>
);
}
