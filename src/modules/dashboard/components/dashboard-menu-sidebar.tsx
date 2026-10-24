"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search as SearchIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "@/config/navigation";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/modules/auth/hooks/use-auth";

export function DashboardMenuSidebar() {
  const pathname = usePathname();
  const tSections = useTranslations("Menu.sections");
  const tItems = useTranslations("Menu.items");
  const tMenu = useTranslations("Menu");
  const { user } = useAuth();

  const [query, setQuery] = React.useState("");

  const filteredNav = React.useMemo(() => {
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

  const activeRouteGroups = React.useMemo(
    () =>
      NAVIGATION.filter(
        (group) =>
          !group.custom && group.items.some((item) => item.href === pathname)
      ).map((group) => group.id),
    [pathname]
  );

  const [openGroup, setOpenGroup] = React.useState<string | undefined>(
    () => activeRouteGroups[0] || (filteredNav[0]?.id ?? undefined)
  );

  React.useEffect(() => {
    if (query.trim()) {
      if (filteredNav.length > 0) {
        setOpenGroup(filteredNav[0].id);
      }
    } else if (activeRouteGroups.length > 0) {
      setOpenGroup(activeRouteGroups[0]);
    }
  }, [query, filteredNav, activeRouteGroups]);

  return (
    <div className="bg-transparent p-4 @sm:p-5 flex flex-col gap-3 @sm:gap-4 h-full @container">
      {/* HEADER */}
      <div className="flex items-center gap-2 @sm:gap-3 shrink-0">
        <h3 className="font-semibold text-base @sm:text-lg">{tMenu("title")}</h3>
      </div>

      {/* SEARCH */}
      <div className="shrink-0 flex flex-col gap-2">
        <div className="relative">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tMenu("search")}
            className="ps-9 h-10 bg-white dark:bg-black backdrop-blur-sm border-border/50"
          />
        </div>
        {/* Keywords */}
        <div className="flex items-center gap-1.5 flex-wrap px-1">
          {["projects", "documents", "staff", "attendance"].map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setQuery(tItems(key))}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50"
            >
              {tItems(key)}
            </button>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar -mx-2 ps-2 pe-3">
        <Accordion
          type="single"
          collapsible
          value={openGroup}
          onValueChange={setOpenGroup}
          className="segmented-list"
        >
          {filteredNav.map((group, groupIdx) => {
            const GroupIcon = group.icon;

            return (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="border-none flex flex-col gap-[2px]"
              >
                <AccordionTrigger className="segmented-item relative flex items-center justify-between px-4 py-3.5 text-sm font-semibold hover:no-underline outline-none cursor-pointer">
                  <span className="relative z-10 flex items-center gap-3">
                    {GroupIcon && <GroupIcon className="size-4.5 shrink-0 text-muted-foreground" />}
                    <span>{tSections(group.labelKey)}</span>
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pt-1 pb-2 [&_a]:no-underline">
                  {!group.custom && (
                    <ul className="flex flex-col gap-[2px] ps-2 rtl:pe-2">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <li key={item.href} className="segmented-item flex flex-col overflow-hidden rounded-xl">
                            <Link
                              href={item.href}
                              className={cn(
                                "relative flex items-center gap-3 px-4 py-3 text-sm no-underline hover:no-underline outline-none transition-colors w-full",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground/80"
                              )}
                            >
                              {ItemIcon && (
                                <ItemIcon className="relative z-10 size-4.5 shrink-0" />
                              )}
                              <span className="relative z-10 text-sm font-medium">
                                {tItems(item.labelKey)}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </nav>
    </div>
  );
}

