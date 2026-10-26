"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useQuickAccess, QUICK_ACCESS_MAX, ALL_SELECTABLE_ITEMS } from "@/hooks/use-quick-access";
import { NAVIGATION, type NavColor, resolveNavIconGradient } from "@/config/navigation";
import { GoogleShortcutTile } from "./GoogleShortcutTile";
import { AppIcon } from "@/components/ui/app-icon";
import { Check, Plus, RotateCcw, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconGradients } from "@/components/ui/icon-gradients";

interface QuickAccessSectionProps {
  className?: string;
  maxItems?: number;
  onEditModeChange?: (editing: boolean) => void;
  onHydrated?: () => void;
}

/**
 * Fast, lightweight motion variants for smooth enter and exit.
 * Uses GPU-accelerated opacity and scale with a sleek [0.16, 1, 0.3, 1] easing.
 */
const toolbarVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: {
      opacity: { duration: 0.08, ease: "easeIn" as const },
      height: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
      marginBottom: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: 14,
    transition: {
      height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.16, delay: 0.03, ease: "easeOut" as const },
      marginBottom: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
};

const editGridVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.14,
      staggerChildren: 0.016,
      delayChildren: 0.01,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeIn" as const,
    },
  },
};

const cardItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const normalRowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.16,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.08,
      ease: "easeIn" as const,
    },
  },
};

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
        {/* EDIT MODE TOOLBAR (Smooth Expand/Collapse with Height)   */}
        {/* ======================================================== */}
        <AnimatePresence initial={false}>
          {hydrated && editMode && (
            <motion.div
              key="edit-toolbar"
              variants={toolbarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full overflow-hidden"
            >
              <div className="w-full flex items-center justify-between gap-3 px-2 sm:px-4 pb-0.5">
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
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/60 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="size-3" />
                    <span>{tHome("quickAccess.reset")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleEditMode}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors cursor-pointer active:scale-95"
                  >
                    <Check className="size-3.5 stroke-[2.5]" />
                    <span>{tHome("quickAccess.done")}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* ITEMS DISPLAY AREA (Smooth Animated Switch)              */}
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
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {editMode ? (
              /* EDIT MODE: All selectable items with smooth stagger and oscillation */
              <motion.div
                key="edit-grid"
                variants={editGridVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full"
              >
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
                    <motion.div
                      key={item.href}
                      variants={cardItemVariants}
                      className="shrink-0"
                    >
                      <div
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
                          "group relative flex flex-col items-center justify-start w-[84px] sm:w-[104px] h-[96px] sm:h-[116px] text-center rounded-[12px] sm:rounded-[14px] cursor-pointer transition-all duration-150 select-none overflow-hidden",
                          isItemSelected
                            ? "border-2 border-primary bg-primary/[0.08] dark:bg-primary/[0.16] shadow-xs active:scale-95"
                            : "animate-oscillate border-2 border-dashed border-border/90 dark:border-border/70 hover:border-primary/70 dark:hover:border-primary bg-muted/20 dark:bg-muted/30 hover:bg-muted/40 dark:hover:bg-muted/50 active:scale-95"
                        )}
                        title={title}
                      >
                        {/* GPU-accelerated instant hover layer (matching .segmented-item color & speed) */}
                        <span 
                          className="absolute inset-0 rounded-[inherit] bg-[#98c1d9]/30 opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100 group-hover:duration-0 pointer-events-none" 
                          aria-hidden="true" 
                        />

                        {/* Selection Indicator Badge with Micro-Pop Transition */}
                        <AnimatePresence mode="wait" initial={false}>
                          {isItemSelected ? (
                            <motion.div
                              key="badge-check"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute top-1 end-1 sm:top-1.5 sm:end-1.5 size-5 sm:size-5.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-20 pointer-events-none"
                            >
                              <Check className="size-3 stroke-[2.5]" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="badge-plus"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute top-1 end-1 sm:top-1.5 sm:end-1.5 size-5 sm:size-5.5 rounded-full bg-background text-foreground/90 border border-border/80 group-hover:border-primary/70 dark:group-hover:border-primary group-hover:text-primary flex items-center justify-center shadow-xs z-20 transition-colors pointer-events-none"
                            >
                              <Plus className="size-3 stroke-[2.2]" />
                            </motion.div>
                          )}
                        </AnimatePresence>

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
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* NORMAL MODE: User's shortcuts + "Expand" tile as the final item in ONE single row */
              <motion.div
                key="normal-row"
                variants={normalRowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full overflow-x-auto no-scrollbar py-1"
              >
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
                      <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/90 shadow-xs">
                        <Expand className="size-4.5 sm:size-5.5 text-muted-foreground group-hover:text-foreground transition-colors stroke-[2.2]" />
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
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
