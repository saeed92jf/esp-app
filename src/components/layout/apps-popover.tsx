"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Grip, Pencil, Lock, Move, X } from "lucide-react";
import { NAVIGATION, NAV_COLOR_MAP, resolveNavIconGradient, type NavColor } from "@/config/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { api } from "@/services";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";
import { IconGradients } from "@/components/ui/icon-gradients";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";

export function AppsPopover({ triggerClassName, iconClassName }: { triggerClassName?: string; iconClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = useState<"left" | "right">("right");
  const [editMode, setEditMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const t = useTranslations("Menu");
  const tItems = useTranslations("Menu.items");
  const tHeader = useTranslations("Header");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";

  const allApps = useMemo(() => {
    return NAVIGATION.flatMap(group =>
      group.items.map(item => ({
        ...item,
        effectiveColor: item.color || group.color || 'sky'
      }))
    ).filter(Boolean);
  }, []);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    const activeUserId = user?.id || user?.email;
    api.preferences.get(activeUserId).then((prefs) => {
      if (cancelled) return;
      if (prefs.favoriteApps && prefs.favoriteApps.length > 0) {
        setFavoriteIds(prefs.favoriteApps.slice(0, 6));
      } else if (prefs.quickAccessHrefs && prefs.quickAccessHrefs.length > 0) {
        setFavoriteIds(prefs.quickAccessHrefs.slice(0, 6));
      } else if (allApps.length > 0) {
        setFavoriteIds(allApps.slice(0, 6).map((a) => a.href));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email, allApps]);

  const favorites = favoriteIds.map(id => allApps.find(a => a.href === id)).filter(Boolean) as typeof allApps;
  const others = allApps.filter(a => !favoriteIds.includes(a.href));

  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverAppId, setDragOverAppId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!editMode) {
      e.preventDefault();
      return;
    }
    setDraggedAppId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnFavorite = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverAppId(null);
    if (!draggedAppId) return;

    setFavoriteIds(prev => {
      let newFavs = [...prev];
      const sourceIndex = newFavs.indexOf(draggedAppId);

      if (sourceIndex !== -1) {
        // Reorder
        newFavs.splice(sourceIndex, 1);
        newFavs.splice(targetIndex, 0, draggedAppId);
      } else {
        // Replace target with the new one
        newFavs.splice(targetIndex, 1, draggedAppId);
      }
      void api.preferences.update({ favoriteApps: newFavs, quickAccessHrefs: newFavs }, user?.id || user?.email);
      return newFavs;
    });
    setDraggedAppId(null);
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setAnchorEdge(rect.left < window.innerWidth / 2 ? "left" : "right");
      }
      setIsOpen(open);
      if (!open) {
        setEditMode(false);
        setDraggedAppId(null);
        setDragOverAppId(null);
        setIsScrolled(false);
      }
    }}>
      <IconGradients />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="ghost"
                size="icon"
                className={cn("hidden sm:inline-flex", triggerClassName || HEADER_ICON_BUTTON_CLASS)}
              >
                <Grip className={cn(iconClassName || HEADER_ICON_CLASS)} />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {tHeader("apps")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverAnchor className={cn("fixed top-[calc(var(--header-height,64px)+8px)] w-0 h-0 pointer-events-none", anchorEdge === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6")} />

      <PopoverContent
        style={{
          maxHeight: 'min(540px, var(--radix-popover-content-available-height, calc(100dvh - var(--header-height, 64px) - 1.25rem)), calc(100dvh - var(--header-height, 64px) - 1.25rem))',
        }}
        align={anchorEdge === "left" ? "start" : "end"}
        side="bottom"
        sideOffset={0}
        collisionPadding={12}
        className="w-[calc(100vw-24px)] max-w-[calc(100vw-24px)] sm:w-[380px] sm:max-w-[380px] max-h-[min(540px,calc(100dvh-var(--header-height,64px)-1.25rem))] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border border-border/40 z-[100] overflow-hidden box-border"
      >
        {/* Sticky Header with centered title & Concentric Close Button */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 z-30 flex items-center h-[46px] sm:h-[50px] transition-colors duration-200 pointer-events-auto rounded-t-[22px] sm:rounded-t-[26px]",
            isScrolled
              ? "bg-[#dfe7f3] dark:bg-popover/95 dark:backdrop-blur-md border-b border-border/50"
              : "bg-popover border-b border-transparent"
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none overflow-hidden">
            <div className="flex items-center gap-2 max-w-full min-w-0">
              <div
                className={cn(
                  "transition-all duration-300 ease-out shrink-0 flex items-center justify-center",
                  isScrolled
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-90 translate-y-2 pointer-events-none"
                )}
              >
                <Grip className="size-4.5 sm:size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span
                className={cn(
                  "text-sm font-semibold text-foreground truncate min-w-0 text-center transition-opacity duration-300 ease-out",
                  isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                {tHeader("apps")}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="absolute top-[6px] end-[6px] size-8.5 sm:size-9 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-20 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </Button>
        </div>

        <ScrollArea
          className="w-full max-w-full flex-1 min-h-0 overflow-x-hidden apps-radix-scroll popup-scroll [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!w-full [&_[data-slot=scroll-area-viewport]>div]:!max-w-full [&_[data-slot=scroll-area-viewport]>div]:!min-w-0 [&_[data-radix-scroll-area-viewport]>div]:!block [&_[data-radix-scroll-area-viewport]>div]:!w-full [&_[data-radix-scroll-area-viewport]>div]:!max-w-full [&_[data-radix-scroll-area-viewport]>div]:!min-w-0"
          dir={dir}
          type="auto"
          onViewportScroll={(e) => {
            setIsScrolled(e.currentTarget.scrollTop > 8);
          }}
        >
          <div className="flex flex-col w-full max-w-full min-w-0 box-border px-3.5 sm:px-4 pt-[54px] sm:pt-[58px] pb-3.5 sm:pb-4">
            <div className="bg-white dark:bg-card rounded-[20px] p-4 mb-3 border border-border/40">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold text-base sm:text-lg text-foreground">{t("popular")}</h3>
                {editMode ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditMode(false);
                      void api.preferences.update({ favoriteApps: favoriteIds, quickAccessHrefs: favoriteIds }, user?.id || user?.email);
                    }}
                    className="h-8 sm:h-9 rounded-full px-4 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                  >
                    {t("done")}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditMode(true)}
                    className="rounded-full size-8 sm:size-9 transition-colors bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
              </div>

              {editMode && (
                <div className="mb-3 mx-1 flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] sm:text-xs text-primary animate-in fade-in-50 duration-200">
                  <Move className="size-3.5 shrink-0" />
                  <span className="truncate">{t("appsEditHint")}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-0">
                {favorites.map((app, idx) => {
                  const Icon = app.icon;
                  const isRestricted = !user && !app.free;
                  const isDragOver = dragOverAppId === app.href;

                  return (
                    <Link
                      key={`fav-${app.href}`}
                      href={isRestricted || editMode ? "#" : app.href}
                      draggable={editMode}
                      onDragStart={(e) => handleDragStart(e, app.href)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverAppId !== app.href) setDragOverAppId(app.href);
                      }}
                      onDragLeave={() => {
                        if (dragOverAppId === app.href) setDragOverAppId(null);
                      }}
                      onDrop={(e) => handleDropOnFavorite(e, idx)}
                      className={cn(
                        "group relative flex flex-col items-center justify-start gap-2 rounded-xl px-1 py-3 outline-none",
                        isRestricted && !editMode && "opacity-60 cursor-not-allowed",
                        editMode && "cursor-grab active:cursor-grabbing"
                      )}
                      onClick={(e) => {
                        if (isRestricted || editMode) {
                          e.preventDefault();
                        } else {
                          setIsOpen(false);
                        }
                      }}
                    >
                      {/* GPU-accelerated hover layer (instant in, slow out) */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-1 rounded-xl pointer-events-none opacity-0 transition-opacity duration-100 ease-out",
                          isDragOver ? "bg-muted opacity-100 duration-0" : "bg-accent",
                          !editMode && !isRestricted && "group-hover:opacity-100"
                        )}
                      />
                      <div
                        className={cn(
                          "relative flex size-10 sm:size-11 items-center justify-center",
                          resolveNavIconGradient(app.effectiveColor as NavColor)
                        )}
                      >
                        <AppIcon icon={Icon} className="size-8 sm:size-9" />
                      </div>
                      <span className="relative block w-full max-w-[84px] truncate text-xs sm:text-[13px] font-medium text-center text-foreground leading-tight">
                        {tItems(app.labelKey)}
                      </span>

                      {isRestricted && !editMode && (
                        <div className="absolute top-1 end-1 bg-background rounded-full p-[1px] shadow-sm">
                          <Lock className="size-2.5 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-3 gap-0">
                {others.map((app) => {
                  const Icon = app.icon;
                  const isRestricted = !user && !app.free;

                  return (
                    <Link
                      key={`other-${app.href}`}
                      href={isRestricted || editMode ? "#" : app.href}
                      draggable={editMode}
                      onDragStart={(e) => handleDragStart(e, app.href)}
                      className={cn(
                        "group relative flex flex-col items-center justify-start gap-2 rounded-xl px-1 py-3 outline-none transition-opacity duration-200",
                        isRestricted && !editMode && "opacity-60 cursor-not-allowed",
                        editMode && "opacity-55 hover:opacity-80 cursor-grab active:cursor-grabbing"
                      )}
                      onClick={(e) => {
                        if (isRestricted || editMode) {
                          e.preventDefault();
                        } else {
                          setIsOpen(false);
                        }
                      }}
                    >
                      {/* GPU-accelerated hover layer (instant in, slow out) */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-1 rounded-xl pointer-events-none opacity-0 transition-opacity duration-100 ease-out",
                          "bg-accent",
                          !editMode && !isRestricted && "group-hover:opacity-100"
                        )}
                      />
                      <div
                        className={cn(
                          "relative flex size-10 sm:size-11 items-center justify-center",
                          resolveNavIconGradient(app.effectiveColor as NavColor)
                        )}
                      >
                        <AppIcon icon={Icon} className="size-8 sm:size-9" />
                      </div>

                      <span className="relative block w-full max-w-[84px] truncate text-xs sm:text-[13px] font-medium text-center text-foreground leading-tight">
                        {tItems(app.labelKey)}
                      </span>

                      {isRestricted && !editMode && (
                        <div className="absolute top-1 end-1 bg-background rounded-full p-[1px] shadow-sm">
                          <Lock className="size-2.5 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
