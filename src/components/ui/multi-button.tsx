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
  expandSelected?: boolean;
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
    containerHeight: "h-8.5",
    icon: "size-3.5",
    text: "text-[11px]",
    baseItemWidth: 54,
    expandBonus: 86,
    expandedFlex: 3.0,
    collapsedFlex: 0.85,
  },
  md: {
    containerHeight: "h-10",
    icon: "size-4",
    text: "text-xs font-semibold",
    baseItemWidth: 60,
    expandBonus: 104,
    expandedFlex: 3.2,
    collapsedFlex: 0.85,
  },
  lg: {
    containerHeight: "h-11",
    icon: "size-4.5",
    text: "text-xs sm:text-sm font-semibold",
    baseItemWidth: 68,
    expandBonus: 120,
    expandedFlex: 3.4,
    collapsedFlex: 0.85,
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
      expandSelected = true,
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
          "relative inline-flex items-center rounded-full p-1 overflow-hidden select-none",
          "shadow-none border border-border/60",
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
        <div className="flex w-full h-full items-stretch gap-1">
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            const isHovered = hoveredId === item.id;
            const isExpanded = isHovered || (expandSelected && isSelected && hoveredId === null);
            const Icon = item.icon;

            return (
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
                        duration: 0.32,
                        ease: [0.16, 1, 0.3, 1], // silky-smooth accordion glide matching settings color picker
                      }
                }
                className={cn(
                  "relative isolate h-full flex items-center justify-center p-0 m-0 outline-none select-none cursor-pointer overflow-hidden rounded-full disabled:cursor-not-allowed disabled:opacity-40 transition-colors duration-200",
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold shadow-xs"
                    : isHovered
                    ? "bg-foreground/[0.08] text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                  item.hoverClassName,
                  item.className
                )}
              >
                <div className="flex items-center justify-center h-full px-2.5 overflow-hidden min-w-0">
                  <Icon
                    className={cn(
                      cfg.icon,
                      "shrink-0 transition-colors duration-150",
                      isSelected
                        ? "text-white dark:text-slate-950"
                        : isHovered
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  />

                  {/* Silky smooth label expansion matching primary color settings */}
                  <motion.div
                    initial={false}
                    animate={{
                      maxWidth: isExpanded ? 180 : 0,
                      opacity: isExpanded ? 1 : 0,
                      marginInlineStart: isExpanded ? 6 : 0,
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            maxWidth: {
                              duration: 0.32,
                              ease: [0.16, 1, 0.3, 1],
                            },
                            marginInlineStart: {
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1],
                            },
                            opacity: {
                              duration: isExpanded ? 0.22 : 0.14,
                              ease: "easeOut",
                              delay: isExpanded ? 0.05 : 0,
                            },
                          }
                    }
                    className="overflow-hidden whitespace-nowrap flex items-center origin-left rtl:origin-right shrink-0"
                  >
                    <span
                      className={cn(
                        "leading-none whitespace-nowrap select-none transition-colors duration-150",
                        cfg.text,
                        isSelected
                          ? "text-white dark:text-slate-950 font-semibold"
                          : isHovered
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </div>
              </motion.button>
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
