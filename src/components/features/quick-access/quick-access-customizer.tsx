"use client";

import { useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, X, RotateCcw, Check } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  QUICK_ACCESS_MAX,
  ALL_SELECTABLE_ITEMS,
} from "@/hooks/use-quick-access";
import type { NavItem } from "@/config/navigation";

interface QuickAccessCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  isSelected: (href: string) => boolean;
  isFull: boolean;
  onToggle: (href: string) => void;
  onReset: () => void;
  selectedCount: number;
}

export function QuickAccessCustomizer({
  isOpen,
  onClose,
  isSelected,
  isFull,
  onToggle,
  onReset,
  selectedCount,
}: QuickAccessCustomizerProps) {
  const t = useTranslations("Home");
  const tItems = useTranslations("Menu.items");
  const tSections = useTranslations("Menu.sections");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid closing immediately on the trigger button click.
    const timer = setTimeout(
      () => document.addEventListener("mousedown", handleClick),
      0,
    );
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose]);

  // Close on Escape key.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Groups that have selectable items (exclude empty settings group).
  const groups = NAVIGATION.filter(
    (g) => g.id !== "settings" && g.items.length > 0,
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("quickAccess.customizeLabel")}
        className={cn(
          "fixed z-50 w-[min(92vw,420px)] rounded-2xl border border-border/60",
          "bg-background/95 shadow-2xl backdrop-blur-md",
          "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div>
            <h3 className="font-semibold">{t("quickAccess.customizeLabel")}</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t("quickAccess.customizeHint", {
                selected: selectedCount,
                max: QUICK_ACCESS_MAX,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Reset to defaults */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={onReset}
              title={t("quickAccess.reset")}
            >
              <RotateCcw className="size-3.5" />
            </Button>
            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Cap warning */}
        {isFull && (
          <div className="bg-amber-50 px-5 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            {t("quickAccess.capReached", { max: QUICK_ACCESS_MAX })}
          </div>
        )}

        {/* Scrollable item list grouped by navigation group */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {groups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.id}>
                  {/* Group label */}
                  <div className="mb-2 flex items-center gap-1.5">
                    {GroupIcon && (
                      <GroupIcon className="text-muted-foreground size-3.5" />
                    )}
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      {tSections(group.labelKey)}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const selected = isSelected(item.href);
                      const disabled = !selected && isFull;

                      return (
                        <button
                          key={item.href}
                          onClick={() => !disabled && onToggle(item.href)}
                          disabled={disabled}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
                            "text-sm transition-all duration-150",
                            "border",
                            selected
                              ? "border-primary/30 bg-primary/8 text-foreground"
                              : "border-transparent bg-muted/40 text-foreground hover:bg-muted/70",
                            disabled && "cursor-not-allowed opacity-40",
                          )}
                        >
                          {/* Icon */}
                          {ItemIcon && (
                            <span
                              className={cn(
                                "flex size-7 shrink-0 items-center justify-center rounded-lg",
                                selected ? "bg-primary/15" : "bg-muted",
                              )}
                            >
                              <ItemIcon
                                className={cn(
                                  "size-3.5",
                                  selected
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </span>
                          )}

                          {/* Title */}
                          <span className="flex-1 text-start font-medium">
                            {tItems(item.labelKey)}
                          </span>

                          {/* Check indicator */}
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full transition-all",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "border border-border",
                            )}
                          >
                            {selected && <Check className="size-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border/40 px-5 py-3">
          <Button size="sm" onClick={onClose}>
            {t("quickAccess.done")}
          </Button>
        </div>
      </div>
    </>
  );
}
