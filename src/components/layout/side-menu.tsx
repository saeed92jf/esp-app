"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe, Menu as MenuIcon, Search as SearchIcon, ShieldCheck, User, X } from "lucide-react";
import { Compass } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAVIGATION, NAV_COLOR_MAP, resolveNavIconGradient, type NavColor } from "@/config/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SideMenu() {
  const locale = useLocale();
  const pathname = usePathname();

  const tMenu = useTranslations("Menu");
  const tSections = useTranslations("Menu.sections");
  const tItems = useTranslations("Menu.items");

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuExpanded, setMenuExpanded] = useState(true);

  const side = locale === "fa" ? "right" : "left";

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
            tItems(item.labelKey).toLowerCase().includes(q),
          );

      return { ...group, items };
    }).filter((group) => group.custom || group.items.length > 0);
  }, [query, tItems, tSections]);

  const [openGroup, setOpenGroup] = useState<string | undefined>(undefined);

  // Sync active group when search query changes
  useEffect(() => {
    if (query.trim()) {
      setMenuExpanded(true);
      if (filteredNav.length > 0) {
        setOpenGroup(filteredNav[0].id);
      }
    }
  }, [query, filteredNav]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setOpenGroup(undefined);
    }
  };

  const handleToggleMenuExpanded = () => {
    setMenuExpanded((prev) => {
      setOpenGroup(undefined);
      return !prev;
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={tMenu("open")}>
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side={side}
        showCloseButton={false}
        className="flex w-75 flex-col gap-0 p-4 sm:w-85 bg-popover rounded-none border-border/40 shadow-xl overflow-hidden"
      >
        {/* CLOSE (X) BUTTON MATCHING AVATAR POPOVER AT TOP */}
        <div className="flex items-center justify-end px-1 pb-1 shrink-0">
          <SheetClose asChild>
            <button 
              type="button" 
              className="p-1.5 rounded-full hover:bg-[#98c1d9]/30 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none"
              aria-label={tMenu("close") || "بستن"}
            >
              <X className="size-5" />
            </button>
          </SheetClose>
        </div>

        {/* MAIN NAVIGATION SCROLL AREA WITH STABLE SCROLLBAR GUTTER */}
        <nav className="flex-1 overflow-y-auto px-0.5 py-1 custom-scrollbar [scrollbar-gutter:stable]">
          {/* FLAT SEARCH INPUT MATCHING ACCORDION WIDTH */}
          <div className="relative mb-3 shrink-0">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tMenu("search")}
              className="ps-10 h-10 rounded-full text-xs bg-white dark:bg-zinc-900 border-border/40 shadow-none focus-visible:ring-1"
            />
          </div>

          <div className="segmented-list w-full">
            {/* OPTION 1: Main Menu Header Option with Solid Phosphor Icon & Title */}
            <button
              type="button"
              onClick={handleToggleMenuExpanded}
              className={cn(
                "segmented-item group relative flex items-center justify-between gap-3.5 px-5 py-4.5 sm:py-5 text-start w-full outline-none cursor-pointer overflow-hidden transition-all duration-150 ease-out",
                menuExpanded ? "rounded-t-[28px] rounded-b-[6px]" : "rounded-[28px]"
              )}
            >
              <span className="relative z-10 flex items-center gap-3.5 overflow-hidden">
                <Compass className="size-8 sm:size-8.5 shrink-0 text-primary" weight="fill" />
                <span className="flex flex-col text-start overflow-hidden gap-0.5">
                  <span className="font-bold text-base sm:text-lg text-foreground leading-tight truncate">{tMenu("mainNavigation")}</span>
                  <span className="text-xs text-muted-foreground font-normal leading-tight truncate">{tMenu("mainNavigationDesc")}</span>
                </span>
              </span>
              <ChevronDown className={cn("relative z-10 size-5 text-muted-foreground transition-transform duration-200 shrink-0", menuExpanded && "rotate-180")} />
            </button>

            {/* EXPANDABLE MENU SECTIONS + ADMIN PANEL INSIDE ACCORDION */}
            <AnimatePresence initial={false}>
              {menuExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
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
                            {GroupIcon && <AppIcon icon={GroupIcon} className={cn("size-5 shrink-0", resolveNavIconGradient((group.color || "sky") as NavColor))} />}
                            <span>{tSections(group.labelKey)}</span>
                          </span>
                          <ChevronDown className={cn("relative z-10 size-4 text-muted-foreground transition-transform duration-150", isExpanded && "rotate-180")} />
                        </button>

                        {/* Items inside section */}
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
                                    onClick={() => handleOpenChange(false)}
                                    className={cn(
                                      "segmented-item group relative flex items-center gap-3 px-5 py-3.5 text-sm font-medium w-full outline-none no-underline hover:no-underline overflow-hidden rounded-[6px]",
                                      isActive ? "text-primary font-semibold" : "text-foreground/80 hover:text-foreground",
                                    )}
                                  >
                                    {isActive && (
                                      <span className="absolute inset-0 bg-primary/10 pointer-events-none" aria-hidden="true" />
                                    )}
                                    <span className="relative z-10 flex items-center gap-3 w-full ms-5">
                                      {ItemIcon && (
                                        <AppIcon icon={ItemIcon} className={cn("size-4.5 shrink-0", resolveNavIconGradient((item.color || group.color || "sky") as NavColor))} />
                                      )}
                                      <span className="relative z-10 transition-colors">{tItems(item.labelKey)}</span>
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

                  {/* LAST ITEM INSIDE ACCORDION: Get Full Access Action Item */}
                  <div className="segmented-item flex flex-col overflow-hidden rounded-b-[28px] rounded-t-[6px]">
                    <Link
                      href="/plans"
                      onClick={() => handleOpenChange(false)}
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

          {/* STANDALONE PILL-SHAPED BUTTON (مدیریت پروفایل) */}
          <div className="segmented-item flex flex-col overflow-hidden mt-3 rounded-[28px]">
            <Link 
              href="/dashboard/profile" 
              onClick={() => handleOpenChange(false)}
              className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-semibold w-full text-foreground/90 outline-none"
            >
              <User className="relative z-10 size-5 text-foreground/90" />
              <span className="relative z-10">{tMenu("profileLink")}</span>
            </Link>
          </div>

          {/* TWO SIMPLE FOOTER LINKS (دو لینک ساده زیرش) */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground mt-4 mb-2">
            <Link href="/privacy" onClick={() => handleOpenChange(false)} className="hover:text-foreground transition-colors">
              {tMenu("privacy")}
            </Link>
            <span>•</span>
            <Link href="/terms" onClick={() => handleOpenChange(false)} className="hover:text-foreground transition-colors">
              {tMenu("terms")}
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}


