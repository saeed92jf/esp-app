"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "motion/react";
import { useQuickAccess, QUICK_ACCESS_MAX, ALL_SELECTABLE_ITEMS } from "@/hooks/use-quick-access";
import { NAVIGATION, type NavColor } from "@/config/navigation";
import { GoogleShortcutTile } from "./GoogleShortcutTile";
import { Check, X, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "motion/react";
import { IconGradients } from "@/components/ui/icon-gradients";

interface QuickAccessSectionProps {
  className?: string;
  maxItems?: number;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

export function QuickAccessSection({
  className,
  maxItems = QUICK_ACCESS_MAX,
}: QuickAccessSectionProps) {
  const tItems = useTranslations("Menu.items");
  const t = useTranslations("Common");
  const [editMode, setEditMode] = useState(false);

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

  return (
    <section
      aria-label="Quick Access Shortcuts"
      className={cn("w-full max-w-4xl mx-auto select-none mt-6 sm:mt-8", className)}
    >
      <IconGradients />
      <div className="flex flex-col items-center justify-center w-full">
        {/* Edit Mode Hint */}
        <AnimatePresence initial={false}>
          {hydrated && editMode && (
            <motion.div
              key="qa-edit-hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="fa-num mb-3 flex items-center gap-2 rounded-full bg-slate-100 py-1 ps-3.5 pe-1 text-xs text-muted-foreground dark:bg-slate-800/80">
                <span>{t("quickAccess.editHint", { max: maxItems })}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums transition-colors",
                    isFull
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {t("quickAccess.selectedCount", {
                    count: selectedHrefs.length,
                    max: maxItems,
                  })}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Items Area */}
        <div className="flex flex-wrap items-center justify-center gap-0 w-full">
          {!hydrated ? (
            Array.from({ length: 5 }).map((_, i) => {
              const isMobileHidden = i >= 3;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={cn(
                    "flex flex-col items-center justify-start w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] p-3 sm:p-4 rounded-2xl animate-pulse",
                    isMobileHidden && "hidden sm:flex"
                  )}
                >
                  <div className="size-10 sm:size-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="mt-2 sm:mt-3 h-3 w-14 rounded-md bg-slate-100 dark:bg-slate-800" />
                </motion.div>
              );
            })
          ) : (
            <AnimatePresence mode="popLayout">
              {(editMode ? ALL_SELECTABLE_ITEMS : items).map((item, index) => {
                let title = item.labelKey;
                try {
                  title = tItems(item.labelKey);
                } catch {}

                const group = NAVIGATION.find((g) =>
                  g.items.some((i) => i.href === item.href)
                );
                const effectiveColor = (item.color ?? group?.color ?? "sky") as NavColor;
                const isItemSelected = isSelected(item.href);
                const isMobileHidden = !editMode && index >= 3;

                return (
                  <motion.div
                    key={item.href}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "relative",
                      editMode && "cursor-pointer",
                      isMobileHidden && "hidden sm:block"
                    )}
                    onClick={(e) => {
                      if (editMode) {
                        e.preventDefault();
                        toggle(item.href);
                      }
                    }}
                  >
                    <div className={cn(
                      "transition-all duration-300", 
                      editMode && !isItemSelected && "opacity-50 scale-95 hover:scale-100 hover:opacity-90"
                    )}>
                      <GoogleShortcutTile
                        href={editMode ? "#" : item.href}
                        icon={item.icon}
                        color={effectiveColor}
                        title={title}
                        onClick={(e) => {
                          if (editMode) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    {editMode && isItemSelected && (
                      <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-green-500 text-white rounded-full p-0.5 shadow-md z-10 scale-90">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Customize Toggle Button */}
        {hydrated && (
          <div className="mt-4 w-full flex flex-col items-center">
            <button
              onClick={() => setEditMode(!editMode)}
              className="group relative outline-none text-muted-foreground/40 p-1.5 rounded-full flex items-center justify-center transition-colors group-hover:text-foreground"
              aria-label="Toggle Customize"
            >
              <span className="absolute inset-0 rounded-full bg-muted/50 opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100 pointer-events-none" aria-hidden="true" />
              <div className="relative z-10 flex items-center justify-center pointer-events-none group-hover:text-foreground transition-colors">
                {editMode ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
