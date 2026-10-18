"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuickAccess, QUICK_ACCESS_MAX, ALL_SELECTABLE_ITEMS } from "@/hooks/use-quick-access";
import { NAVIGATION, type NavColor, resolveNavIconGradient } from "@/config/navigation";
import { GoogleShortcutTile } from "./GoogleShortcutTile";
import { AppIcon } from "@/components/ui/app-icon";
import { Check, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconGradients } from "@/components/ui/icon-gradients";

interface QuickAccessSectionProps {
  className?: string;
  maxItems?: number;
  onEditModeChange?: (editing: boolean) => void;
  onHydrated?: () => void;
}

export function QuickAccessSection({
  className,
  maxItems = QUICK_ACCESS_MAX,
  onEditModeChange,
  onHydrated,
}: QuickAccessSectionProps) {
  const tItems = useTranslations("Menu.items");
  const t = useTranslations("Common");
  const tHome = useTranslations("Home");
  const [editMode, setEditMode] = useState(false);

  const handleToggleEditMode = () => {
    const next = !editMode;
    setEditMode(next);
    onEditModeChange?.(next);
  };

  const {
    items,
    hydrated,
    isSelected,
    isFull,
    toggle,
    removeShortcut,
    reset,
    selectedHrefs,
  } = useQuickAccess();

  React.useEffect(() => {
    if (hydrated) {
      onHydrated?.();
    }
  }, [hydrated, onHydrated]);

  return (
    <section
      aria-label="Quick Access Shortcuts"
      className={cn("w-full max-w-4xl mx-auto select-none mt-1 sm:mt-1.5", className)}
    >
      <IconGradients />
      <div className="flex flex-col items-center justify-center w-full">
        {/* ======================================================== */}
        {/* EDIT MODE TOOLBAR                                        */}
        {/* ======================================================== */}
        {hydrated && editMode && (
          <div className="w-full flex items-center justify-between gap-3 mb-3.5 px-2 sm:px-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground fa-num">
              <span>{t("quickAccess.editHint", { max: maxItems })}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums transition-colors",
                  isFull
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-primary/10 text-primary"
                )}
              >
                {t("quickAccess.selectedCount", {
                  count: selectedHrefs.length,
                  max: maxItems,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/60 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>{tHome("quickAccess.reset")}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleEditMode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Check className="size-3.5 stroke-[2.5]" />
                <span>{tHome("quickAccess.done")}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ITEMS DISPLAY AREA                                       */}
        {/* ======================================================== */}
        {!hydrated ? (
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex flex-nowrap items-center justify-center min-w-max mx-auto gap-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] p-3 sm:p-4 shrink-0"
                />
              ))}
            </div>
          </div>
        ) : editMode ? (
          /* EDIT MODE: All selectable items with oscillation for inactive cards */
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full animate-in fade-in-50 duration-200">
            {ALL_SELECTABLE_ITEMS.map((item, index) => {
              let title = item.labelKey;
              try {
                title = tItems(item.labelKey);
              } catch {}

              const group = NAVIGATION.find((g) =>
                g.items.some((i) => i.href === item.href)
              );
              const effectiveColor = (item.color ?? group?.color ?? "sky") as NavColor;
              const navGradientClass = resolveNavIconGradient(effectiveColor);
              const isItemSelected = isSelected(item.href);

              return (
                <div
                  key={item.href}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(item.href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(item.href);
                    }
                  }}
                  style={
                    !isItemSelected
                      ? { animationDelay: `-${((index % 7) * 0.22).toFixed(2)}s` }
                      : undefined
                  }
                  className={cn(
                    "group relative flex flex-col items-center justify-start w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] text-center rounded-[12px] sm:rounded-[14px] cursor-pointer transition-[border-color,background-color,box-shadow] duration-150 select-none overflow-hidden",
                    isItemSelected
                      ? "border-2 border-primary bg-primary/[0.08] dark:bg-primary/[0.16] shadow-xs"
                      : "animate-oscillate border-2 border-dashed border-border/90 dark:border-border/70 hover:border-primary/60 bg-muted/20 dark:bg-muted/30 hover:bg-muted/40"
                  )}
                  title={title}
                >
                  {/* GPU-accelerated instant hover layer (matching .segmented-item color & speed) */}
                  <span 
                    className="absolute inset-0 rounded-[inherit] bg-[#98c1d9]/30 opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100 group-hover:duration-0 pointer-events-none" 
                    aria-hidden="true" 
                  />

                  {/* Selection Indicator Badge */}
                  {isItemSelected ? (
                    <div className="absolute top-1 end-1 sm:top-1.5 sm:end-1.5 size-5 sm:size-5.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-20">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="absolute top-1 end-1 sm:top-1.5 sm:end-1.5 size-5 sm:size-5.5 rounded-full bg-background text-foreground/90 border border-border/80 flex items-center justify-center shadow-xs z-20">
                      <Plus className="size-3 stroke-[2.2]" />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col items-center justify-start w-full h-full pt-3 sm:pt-4 pointer-events-none">
                    <div
                      className={cn(
                        "flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/90 shadow-xs transition-colors",
                        isItemSelected && "bg-primary/10 dark:bg-primary/20"
                      )}
                    >
                      {item.icon && (
                        <AppIcon
                          icon={item.icon}
                          className={cn("size-5 sm:size-6", navGradientClass)}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <span
                      className={cn(
                        "mt-2 sm:mt-3 text-[11px] sm:text-[12.5px] font-medium tracking-normal leading-tight block w-full max-w-[60px] sm:max-w-[76px] truncate text-center",
                        isItemSelected
                          ? "text-foreground font-semibold"
                          : "text-foreground/80 font-medium"
                      )}
                    >
                      {title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* NORMAL MODE: User's shortcuts + "Expand" tile as the final item in ONE single row */
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex flex-nowrap items-center justify-center min-w-max mx-auto gap-0">
              {items.map((item) => {
                let title = item.labelKey;
                try {
                  title = tItems(item.labelKey);
                } catch {}

                const group = NAVIGATION.find((g) =>
                  g.items.some((i) => i.href === item.href)
                );
                const effectiveColor = (item.color ?? group?.color ?? "sky") as NavColor;

                return (
                  <GoogleShortcutTile
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    color={effectiveColor}
                    title={title}
                    onEdit={handleToggleEditMode}
                    onRemove={removeShortcut}
                  />
                );
              })}

              {/* Expand Card (styled identically to shortcuts, opens edit mode) */}
              <div
                key="expand-tile"
                role="button"
                tabIndex={0}
                onClick={handleToggleEditMode}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleEditMode();
                  }
                }}
                className="group relative flex flex-col items-center justify-start w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] shrink-0 focus:outline-none text-center rounded-[12px] sm:rounded-[14px] overflow-hidden bg-transparent active:scale-95 transition-transform duration-150 transform-gpu cursor-pointer"
                aria-label={tHome("quickAccess.expand")}
              >
                {/* GPU-accelerated instant hover layer (matching .segmented-item color & speed) */}
                <span 
                  className="absolute inset-0 rounded-[inherit] bg-[#98c1d9]/30 opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100 group-hover:duration-0 pointer-events-none" 
                  aria-hidden="true" 
                />

                <div className="relative z-10 flex flex-col items-center justify-start w-full h-full pt-3 sm:pt-4 pointer-events-none">
                  <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/90 shadow-xs group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 transition-colors">
                    <Plus className="size-5 sm:size-6 text-muted-foreground group-hover:text-foreground transition-colors stroke-[2.2]" />
                  </div>
                  <span
                    className="mt-2 sm:mt-3 text-[11px] sm:text-[12.5px] font-medium tracking-normal text-foreground/90 leading-tight block w-full max-w-[60px] sm:max-w-[76px] truncate text-center group-hover:text-foreground transition-colors"
                    title={tHome("quickAccess.expand")}
                  >
                    {tHome("quickAccess.expand")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
