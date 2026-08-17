"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, RotateCcw, Check, Search, Sparkles } from "lucide-react";
import { NAVIGATION, type NavItem } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { QUICK_ACCESS_MAX } from "@/hooks/use-quick-access";

interface GoogleShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSelected: (href: string) => boolean;
  isFull: boolean;
  onToggle: (href: string) => void;
  onReset: () => void;
  selectedCount: number;
}

export function GoogleShortcutModal({
  isOpen,
  onClose,
  isSelected,
  isFull,
  onToggle,
  onReset,
  selectedCount,
}: GoogleShortcutModalProps) {
  const t = useTranslations("Home");
  const tItems = useTranslations("Menu.items");
  const tSections = useTranslations("Menu.sections");
  const locale = useLocale();
  const tQA = useTranslations("Common.quickAccess");
  const isRtl = locale === "fa";
  const panelRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const groups = useMemo(
    () => NAVIGATION.filter((g) => g.id !== "settings" && g.items.length > 0),
    []
  );

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          let label = item.labelKey;
          try {
            label = tItems(item.labelKey);
          } catch {
            // fallback
          }
          return label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, searchQuery, tItems]);

  if (!isOpen) return null;

  return (
    <>
      {/* Google M3 Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Google M3 Dialog Surface */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("quickAccess.customizeLabel")}
        className={cn(
          "fixed z-50 w-[min(94vw,480px)] max-h-[85vh] flex flex-col rounded-[24px] border border-border/70",
          "bg-background/98 shadow-2xl backdrop-blur-md",
          "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-200"
        )}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/50 shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              {t("quickAccess.customize")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("quickAccess.customizeHint", {
                selected: selectedCount,
                max: QUICK_ACCESS_MAX,
              })}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Search filter */}
        <div className="px-6 py-2.5 shrink-0">
          <div className="relative">
            <Search className="absolute top-2.5 start-3 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={tQA("searchShortcuts")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 ps-9 text-xs rounded-full bg-muted/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 min-h-0">
          {filteredGroups.map((group) => {
            let groupTitle = group.labelKey;
            try {
              groupTitle = tSections(group.labelKey);
            } catch {
              // fallback
            }

            return (
              <div key={group.id} className="space-y-1.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  {groupTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {group.items.map((item) => {
                    const selected = isSelected(item.href);
                    const disabled = !selected && isFull;
                    const Icon = item.icon;
                    let title = item.labelKey;
                    try {
                      title = tItems(item.labelKey);
                    } catch {
                      // fallback
                    }

                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => onToggle(item.href)}
                        disabled={disabled}
                        className={cn(
                          "flex items-center gap-2.5 p-2 rounded-xl border text-start transition-all duration-150 select-none",
                          selected
                            ? "bg-primary/10 border-primary/40 text-primary font-medium shadow-2xs"
                            : disabled
                            ? "opacity-40 border-transparent bg-muted/20 cursor-not-allowed text-muted-foreground"
                            : "border-transparent bg-muted/40 hover:bg-muted text-foreground cursor-pointer"
                        )}
                      >
                        {/* Icon Circle */}
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-background text-foreground/80 border border-border/50"
                          )}
                        >
                          {Icon && <Icon className="size-4" strokeWidth={2} />}
                        </span>

                        {/* Title */}
                        <span className="text-xs truncate flex-1 leading-tight">
                          {title}
                        </span>

                        {/* Check Indicator */}
                        {selected && (
                          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20 rounded-b-[24px] shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs rounded-full gap-1.5 text-muted-foreground hover:text-foreground h-8 px-3"
          >
            <RotateCcw className="size-3" />
            <span>{t("quickAccess.reset")}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-full h-8 px-4 border-border/70"
            >
              {t("quickAccess.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-full h-8 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("quickAccess.done")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
