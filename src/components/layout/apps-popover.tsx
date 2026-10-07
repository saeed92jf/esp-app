"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Grip, Pencil, Lock, Move } from "lucide-react";
import { NAVIGATION, NAV_COLOR_MAP, resolveNavIconGradient, type NavColor } from "@/config/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";
import { IconGradients } from "@/components/ui/icon-gradients";

export function AppsPopover({ triggerClassName, iconClassName }: { triggerClassName?: string; iconClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = useState<"left" | "right">("right");
  const [editMode, setEditMode] = useState(false);
  const { user } = useAuth();
  const t = useTranslations("Menu");
  const tItems = useTranslations("Menu.items");
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
    if (favoriteIds.length === 0 && allApps.length > 0) {
      setFavoriteIds(allApps.slice(0, 6).map(a => a.href));
    }
  }, [allApps]);

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
      }
    }}>
      <IconGradients />
      <PopoverTrigger asChild>
        <Button ref={triggerRef} variant="ghost" size="icon" className={cn("rounded-full text-zinc-700 dark:text-zinc-300 hover:text-foreground hover:bg-muted hidden sm:inline-flex size-8 sm:size-10", triggerClassName)}>
          <Grip className={cn("size-4 sm:size-5", iconClassName)} />
        </Button>
      </PopoverTrigger>
      
      <PopoverAnchor className={cn("fixed top-[72px] w-0 h-0 pointer-events-none", anchorEdge === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6")} />
      
      <PopoverContent 
        align={anchorEdge === "left" ? (dir === "rtl" ? "end" : "start") : (dir === "rtl" ? "start" : "end")}
        side="bottom"
        sideOffset={0}
        collisionPadding={16}
        className="w-[calc(100vw-32px)] sm:w-[380px] p-0 bg-popover rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100] overflow-hidden"
      >
        <ScrollArea className="h-[55vh] w-full apps-radix-scroll" type="always">
          <div className="p-3">
            <div className="bg-white/90 dark:bg-white/10 rounded-[20px] p-4 mb-3">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold text-base sm:text-lg text-foreground">{t("popular")}</h3>
              {editMode ? (
                <Button
                  variant="ghost"
                  onClick={() => setEditMode(false)}
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
                        isDragOver ? "bg-muted opacity-100 duration-0" : "bg-[#98c1d9]/30 dark:bg-white/[0.12]",
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

          <div className="px-2 pb-3 sm:pb-4">
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
                        "bg-[#98c1d9]/30 dark:bg-white/[0.12]",
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
