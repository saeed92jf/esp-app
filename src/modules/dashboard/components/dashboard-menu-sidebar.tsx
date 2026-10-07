"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search as SearchIcon, Menu as MenuIcon, Lock } from "lucide-react";
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
import { AuthModal } from "@/modules/auth/components/auth-modal";

export function DashboardMenuSidebar() {
  const pathname = usePathname();
  const tSections = useTranslations("Menu.sections");
  const tItems = useTranslations("Menu.items");
  const tMenu = useTranslations("Menu");
  const { user } = useAuth();

  const [query, setQuery] = React.useState("");
  const [showUpsell, setShowUpsell] = React.useState(false);

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
      <div className="shrink-0 flex flex-col gap-2">
        <div className="relative">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tMenu("search")}
            className="ps-9 h-10 bg-background/50 backdrop-blur-sm border-border/50"
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
      <nav className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
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
                        const isRestricted = !user && !item.free;

                        const handleLinkClick = (e: React.MouseEvent) => {
                          if (isRestricted) {
                            e.preventDefault();
                            setShowUpsell(true);
                          }
                        };

                        return (
                          <li key={item.href} className="segmented-item flex flex-col overflow-hidden rounded-xl">
                            <Link
                              href={item.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "relative flex items-center gap-3 px-4 py-3 text-sm no-underline hover:no-underline outline-none transition-colors w-full",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground/80"
                              )}
                            >
                              {ItemIcon && (
                                <ItemIcon className={cn("relative z-10 size-4.5 shrink-0", isRestricted && "opacity-60")} />
                              )}
                              <span className={cn("relative z-10 text-sm font-medium", isRestricted && "opacity-80")}>
                                {tItems(item.labelKey)}
                              </span>
                              
                              {isRestricted && (
                                <Lock className="relative z-10 size-3.5 ms-auto opacity-40 group-hover:opacity-100 group-hover:text-primary transition-opacity" />
                              )}
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

      <AuthModal open={showUpsell} onOpenChange={setShowUpsell} />
    </div>
  );
}

