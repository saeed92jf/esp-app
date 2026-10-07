"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe, Menu as MenuIcon, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAVIGATION, NAV_COLOR_MAP, resolveNavIconGradient, type NavColor } from "@/config/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SettingsSection } from "@/components/layout/settings-section";

export function SideMenu() {
  const locale = useLocale();
  const pathname = usePathname();

  const tMenu = useTranslations("Menu");
  const tSections = useTranslations("Menu.sections");
  const tItems = useTranslations("Menu.items");
  const tSettings = useTranslations("Settings");

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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

  const activeRouteGroups = useMemo(
    () =>
      NAVIGATION.filter(
        (group) =>
          !group.custom && group.items.some((item) => item.href === pathname),
      ).map((group) => group.id),
    [pathname],
  );

  const [openGroup, setOpenGroup] = useState<string | undefined>(
    () => activeRouteGroups[0] || (filteredNav[0]?.id ?? undefined),
  );

  // Sync active group when pathname or search query changes
  useEffect(() => {
    if (query.trim()) {
      if (filteredNav.length > 0) {
        setOpenGroup(filteredNav[0].id);
      }
    } else if (activeRouteGroups.length > 0) {
      setOpenGroup(activeRouteGroups[0]);
    }
  }, [query, filteredNav, activeRouteGroups]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
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
        className="flex w-75 flex-col gap-0 p-0 sm:w-85 bg-popover border-border/40 shadow-lg"
      >
        <SheetHeader className="px-5 pt-4 pb-2 text-start">
          <SheetTitle>{tMenu("title")}</SheetTitle>
          <SheetDescription>{tMenu("subtitle")}</SheetDescription>
        </SheetHeader>

        {/* SEARCH */}
        <div className="px-5 pb-4 pt-2">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute inset-s-4 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tMenu("search")}
              className="ps-10 h-11 rounded-full text-sm"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-2">
          <div className="flex flex-col gap-[2px]">
            {filteredNav.map((group, groupIdx) => {
              const GroupIcon = group.icon;
              const isExpanded = openGroup === group.id;
              const isFirst = groupIdx === 0;
              const isLast = groupIdx === filteredNav.length - 1;
              const colorMeta = NAV_COLOR_MAP[(group.color || "sky") as NavColor];

              return (
                <div
                  key={group.id}
                  className="flex flex-col gap-[2px]"
                >
                  {/* Section Header */}
                  <button
                    type="button"
                    onClick={() => setOpenGroup(isExpanded ? undefined : group.id)}
                    className={cn(
                      "segmented-item group relative flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold w-full text-foreground/90 outline-none cursor-pointer overflow-hidden",
                      isFirst ? "rounded-t-[32px]" : "rounded-t-[6px]",
                      (isLast && !isExpanded) ? "rounded-b-[32px]" : "rounded-b-[6px]"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {GroupIcon && <AppIcon icon={GroupIcon} className={cn("size-5 shrink-0", resolveNavIconGradient((group.color || "sky") as NavColor))} />}
                      {tSections(group.labelKey)}
                    </span>
                    <ChevronDown className={cn("relative z-10 size-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                  </button>

                  {/* Items */}
                  <AnimatePresence initial={false}>
                    {isExpanded && !group.custom && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex flex-col gap-[2px]"
                      >
                        {group.items.map((item, itemIdx) => {
                          const ItemIcon = item.icon;
                          const isActive = pathname === item.href;
                          const itemColorMeta = NAV_COLOR_MAP[(item.color || group.color || "sky") as NavColor];
                          const isLastItem = itemIdx === group.items.length - 1;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => handleOpenChange(false)}
                              className={cn(
                                "segmented-item group relative flex items-center gap-3 px-5 py-4 text-sm font-normal w-full outline-none no-underline hover:no-underline overflow-hidden",
                                "rounded-t-[6px]",
                                (isLast && isLastItem) ? "rounded-b-[32px]" : "rounded-b-[6px]",
                                isActive
                                  ? "text-primary"
                                  : "text-foreground/70 hover:text-foreground",
                              )}
                            >
                              {/* Active state background */}
                              {isActive && (
                                <span className="absolute inset-0 bg-[#98c1d9]/20 pointer-events-none" aria-hidden="true" />
                              )}
                              <span className="relative z-10 flex items-center gap-3 w-full ms-6">
                                {ItemIcon && (
                                  <AppIcon icon={ItemIcon} className={cn("size-5 shrink-0", resolveNavIconGradient((item.color || group.color || "sky") as NavColor))} />
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
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}


