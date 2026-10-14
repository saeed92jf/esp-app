"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as React from "react";

export type MultiButtonVariant = "default" | "outline" | "secondary" | "ghost";
export type MultiButtonSize = "sm" | "md" | "lg";

export type MultiButtonItem = {
  id: string;
  icon: React.ElementType<{ className?: string }>;
  label: React.ReactNode;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  hoverClassName?: string;
};

export type MultiButtonGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

type MultiButtonRootProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onClick"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onSelect"
>;

export type MultiButtonProps = MultiButtonRootProps & {
  items: MultiButtonItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  highlightColor?: string;
  gooey?: boolean;
  variant?: MultiButtonVariant;
  size?: MultiButtonSize;
  syncWidthTo?: MultiButtonItem[];
};

export type CompactMultiButtonProps = MultiButtonProps & {
  selectedId: string;
  iconOnly?: boolean;
  restIcon?: MultiButtonItem["icon"];
  restAriaLabel?: string;
};

type MultiButtonGroupContextValue = {
  register: (id: string, labelWidth: number) => void;
  unregister: (id: string) => void;
  sharedLabelWidth: number;
};

const MultiButtonGroupContext = React.createContext<
  MultiButtonGroupContextValue | undefined
>(undefined);

const SIZE_CONFIG: Record<
  MultiButtonSize,
  {
    containerHeight: string;
    icon: string;
    text: string;
    baseItemWidth: number;
    expandBonus: number;
    expandedFlex: number;
    collapsedFlex: number;
  }
> = {
  sm: {
    containerHeight: "h-8",
    icon: "size-3.5",
    text: "text-[11px]",
    baseItemWidth: 54,
    expandBonus: 68,
    expandedFlex: 2.6,
    collapsedFlex: 0.8,
  },
  md: {
    containerHeight: "h-9",
    icon: "size-4",
    text: "text-xs",
    baseItemWidth: 60,
    expandBonus: 74,
    expandedFlex: 2.7,
    collapsedFlex: 0.8,
  },
  lg: {
    containerHeight: "h-10",
    icon: "size-[18px]",
    text: "text-xs sm:text-sm",
    baseItemWidth: 68,
    expandBonus: 82,
    expandedFlex: 2.8,
    collapsedFlex: 0.8,
  },
};

/**
 * MultiButtonGroup: Optional Context Provider for grouping multiple MultiButton rows
 */
const MultiButtonGroup = React.forwardRef<
  HTMLDivElement,
  MultiButtonGroupProps
>(({ children, className, ...props }, ref) => {
  const [registry, setRegistry] = React.useState<Record<string, number>>({});

  const register = React.useCallback((id: string, width: number) => {
    setRegistry((current) =>
      current[id] === width ? current : { ...current, [id]: width }
    );
  }, []);

  const unregister = React.useCallback((id: string) => {
    setRegistry((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const sharedLabelWidth = Math.max(0, ...Object.values(registry));
  const context = React.useMemo(
    () => ({ register, unregister, sharedLabelWidth }),
    [register, unregister, sharedLabelWidth]
  );

  return (
    <MultiButtonGroupContext.Provider value={context}>
      <div
        ref={ref}
        data-slot="multi-button-group"
        className={cn("contents", className)}
        {...props}
      >
        {children}
      </div>
    </MultiButtonGroupContext.Provider>
  );
});
MultiButtonGroup.displayName = "MultiButtonGroup";

/**
 * MultiButton: Flat, borderless segmented action rail
 * - Left and right ends: Fully pill / bean shaped (rounded-full)
 * - Inside cut lines: Straight vertical dividers (no pill radius between items)
 * - Active item: Soft deep black background with crisp white icon and text
 * - Hover item: Light soft black background
 * - Edge-to-edge flush coverage with zero padding
 * - Text reveals with zoom + soft bounce spring motion
 * - Slower, silky smooth flex gliding between items with zero jitter
 */
const MultiButton = React.forwardRef<HTMLDivElement, MultiButtonProps>(
  (
    {
      items,
      selectedId,
      onSelect,
      highlightColor,
      gooey = false,
      variant = "outline",
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const reduceMotion = Boolean(useReducedMotion());
    const cfg = SIZE_CONFIG[size];

    return (
      <div
        ref={ref}
        data-slot="multi-button"
        role="group"
        onMouseLeave={() => setHoveredId(null)}
        className={cn(
          "relative inline-flex items-center rounded-full p-0 overflow-hidden select-none",
          "shadow-none border-0 ring-0",
          "bg-slate-200/70 dark:bg-slate-900/80 backdrop-blur-md",
          cfg.containerHeight,
          className
        )}
        style={{
          width: items.length > 0 ? `${items.length * cfg.baseItemWidth + cfg.expandBonus}px` : undefined,
          maxWidth: "100%",
          ...style,
        }}
        {...props}
      >
        <div className="flex w-full h-full items-stretch">
          {items.map((item, index) => {
            const isSelected = selectedId === item.id;
            const isHovered = hoveredId === item.id;
            const isExpanded = isHovered;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <div
                    className="w-px h-full bg-slate-300/80 dark:bg-slate-700/60 shrink-0 pointer-events-none transition-colors"
                    aria-hidden="true"
                  />
                )}
                <motion.button
                  key={item.id}
                  type="button"
                  data-state={isSelected ? "active" : "inactive"}
                  data-multi-button-item-id={item.id}
                  aria-label={
                    item.ariaLabel ??
                    (typeof item.label === "string" ? item.label : item.id)
                  }
                  aria-pressed={isSelected}
                  disabled={item.disabled}
                  onClick={(event) => {
                    if (item.disabled) return;
                    item.onClick?.(event);
                    onSelect?.(item.id);
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onFocus={() => setHoveredId(item.id)}
                  onBlur={() => setHoveredId(null)}
                  animate={{
                    flex: isExpanded ? cfg.expandedFlex : cfg.collapsedFlex,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.22,
                          ease: [0.16, 1, 0.3, 1], // snappy, buttery-smooth gliding
                        }
                  }
                  className={cn(
                    "relative isolate h-full flex items-center justify-center p-0 m-0 outline-none select-none cursor-pointer overflow-hidden disabled:cursor-not-allowed disabled:opacity-40 transition-colors duration-200",
                    // Straight cut line between adjacent items (no bean/pill internally)
                    "rounded-none",
                    // Edge-to-edge flush coverage with zero padding from borders:
                    // In Light: Black background (#121212) + White text & icon
                    // In Dark: Inverted! White background (slate-100) + Black text & icon (slate-950)
                    isSelected
                      ? "bg-[#121212] text-white dark:bg-slate-100 dark:text-slate-950 font-semibold shadow-xs"
                      : isHovered
                      ? "bg-slate-950/[0.08] text-slate-950 dark:bg-white/[0.12] dark:text-slate-100"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
                    item.hoverClassName,
                    item.className
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5 px-2.5 overflow-hidden min-w-0">
                    <Icon
                      className={cn(
                        cfg.icon,
                        "shrink-0 transition-colors duration-150",
                        isSelected
                          ? "text-white dark:text-slate-950"
                          : isHovered
                          ? "text-slate-950 dark:text-slate-100"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                    />

                    {/* Label appearing and disappearing: both animated, fast & snappy */}
                    <motion.div
                      initial={false}
                      animate={{
                        maxWidth: isExpanded ? 200 : 0,
                        opacity: isExpanded ? 1 : 0,
                        scale: isExpanded ? 1 : 0.72,
                      }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              maxWidth: {
                                duration: isExpanded ? 0.22 : 0.18,
                                ease: [0.2, 0.8, 0.2, 1],
                              },
                              opacity: {
                                duration: isExpanded ? 0.18 : 0.14,
                                ease: "easeOut",
                              },
                              scale: isExpanded
                                ? {
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 24,
                                    mass: 0.5,
                                  }
                                : {
                                    duration: 0.16,
                                    ease: [0.4, 0, 0.2, 1],
                                  },
                            }
                      }
                      className="overflow-hidden whitespace-nowrap flex items-center origin-left rtl:origin-right shrink-0"
                    >
                      <span
                        className={cn(
                          "font-medium leading-none whitespace-nowrap select-none transition-colors duration-150",
                          cfg.text,
                          isSelected
                            ? "text-white dark:text-slate-950 font-semibold"
                            : isHovered
                            ? "text-slate-950 dark:text-slate-100 font-medium"
                            : "text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                  </div>
                </motion.button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }
);
MultiButton.displayName = "MultiButton";

/**
 * CompactMultiButton: Collapsed single-button at rest that expands on hover into the full straight-cut rail
 */
const CompactMultiButton = React.forwardRef<
  HTMLDivElement,
  CompactMultiButtonProps
>(
  (
    {
      items,
      selectedId,
      onSelect,
      restIcon: RestIcon,
      restAriaLabel = "Open actions",
      highlightColor,
      gooey = false,
      variant = "outline",
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const reduceMotion = Boolean(useReducedMotion());
    const cfg = SIZE_CONFIG[size];
    const selectedItem =
      items.find((item) => item.id === selectedId) ?? items[0];

    const TriggerIcon = RestIcon ?? selectedItem?.icon;

    return (
      <div
        ref={ref}
        data-slot="compact-multi-button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn("inline-flex items-center", className)}
        style={style}
        {...props}
      >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.button
              key="compact-collapsed"
              type="button"
              aria-label={restAriaLabel}
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative inline-flex items-center justify-center rounded-full cursor-pointer shadow-none border-0 ring-0 transition-colors",
                "bg-slate-200/70 dark:bg-slate-900/80 backdrop-blur-md px-4",
                cfg.containerHeight
              )}
            >
              {TriggerIcon && <TriggerIcon className={cfg.icon} />}
            </motion.button>
          ) : (
            <motion.div
              key="compact-expanded"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <MultiButton
                items={items}
                selectedId={selectedId}
                onSelect={(id) => {
                  onSelect?.(id);
                  setIsHovered(false);
                }}
                highlightColor={highlightColor}
                variant={variant}
                size={size}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
CompactMultiButton.displayName = "CompactMultiButton";

export { CompactMultiButton, MultiButton, MultiButtonGroup };
export default MultiButton;
