"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search as SearchIcon, Menu as MenuIcon } from "lucide-react";
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

export function DashboardMenuSidebar() {
  const pathname = usePathname();
  const tSections = useTranslations("Menu.sections");
  const tItems = useTranslations("Menu.items");
  const tMenu = useTranslations("Menu");

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
        <div className="p-2 @sm:p-2.5 bg-primary/10 rounded-xl shrink-0">
          <MenuIcon className="size-4 @sm:size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base @sm:text-lg">{tMenu("title")}</h3>
      </div>

      {/* SEARCH */}
      <div className="relative shrink-0">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tMenu("search")}
          className="ps-9 h-10 bg-background/50 backdrop-blur-sm border-border/50"
        />
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
        <Accordion
          type="single"
          collapsible
          value={openGroup}
          onValueChange={setOpenGroup}
          className="space-y-1"
        >
          {filteredNav.map((group) => {
            const GroupIcon = group.icon;

            return (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="border-none"
              >
                <AccordionTrigger className="hover:bg-muted/50 rounded-lg px-3 py-2 text-sm font-semibold hover:no-underline transition-colors duration-200">
                  <span className="flex items-center gap-2">
                    {GroupIcon && <GroupIcon className="size-4 shrink-0 text-muted-foreground" />}
                    {tSections(group.labelKey)}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pt-1 pb-2 [&_a]:no-underline">
                  {!group.custom && (
                    <ul className="space-y-1 pl-4 rtl:pr-4 rtl:pl-0 border-l rtl:border-r rtl:border-l-0 border-border/50 ml-4 rtl:mr-4 rtl:ml-0 mt-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm no-underline hover:no-underline transition-all duration-200",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium translate-x-1 rtl:-translate-x-1"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              {ItemIcon && (
                                <ItemIcon className="size-4 shrink-0" />
                              )}
                              {tItems(item.labelKey)}
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
