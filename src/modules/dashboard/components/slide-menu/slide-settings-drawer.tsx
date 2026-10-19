// src/modules/dashboard/components/slide-menu/slide-settings-drawer.tsx
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Reorder, useDragControls, motion, AnimatePresence } from "motion/react";
import {
  ChevronUp,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Check,
  GripVertical,
  Plus,
} from "lucide-react";
import {
  ALL_SLIDE_ITEMS,
  DEFAULT_SLIDE_ITEMS,
  SlideMenuItemDef,
} from "./slide-menu-customizer-modal";
import { cn } from "@/lib/utils";

interface SlideSettingsDrawerProps {
  slideRailItems: string[];
  onChangeSlideRailItems: (newItems: string[]) => void;
}

const springPhysics = {
  type: "spring" as const,
  stiffness: 450,
  damping: 32,
  mass: 0.75,
};

interface SlideSettingsItemProps {
  id: string;
  index: number;
  total: number;
  onMove: (e: React.MouseEvent, index: number, direction: "up" | "down") => void;
  onToggle: (id: string, e?: React.MouseEvent) => void;
  canDisable: boolean;
}

function SlideSettingsItem({
  id,
  index,
  total,
  onMove,
  onToggle,
  canDisable,
}: SlideSettingsItemProps) {
  const t = useTranslations("Dashboard.slideCustomizer");
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = React.useState(false);

  const itemDef = ALL_SLIDE_ITEMS.find((it) => it.id === id);
  if (!itemDef) return null;
  const Icon = itemDef.icon as any;
  const title = t(`items.${itemDef.titleKey}` as any);

  return (
    <Reorder.Item
      key={id}
      value={id}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      layout="position"
      transition={springPhysics}
      animate={{
        scale: isDragging ? 1.02 : 1,
        zIndex: isDragging ? 40 : 1,
      }}
      className={cn(
        "relative flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-white dark:bg-card border select-none touch-none will-change-transform transition-shadow duration-150",
        isDragging
          ? "shadow-xl border-primary/50 ring-2 ring-primary/20 z-40 cursor-grabbing"
          : "shadow-2xs border-border/50 hover:border-primary/40 z-auto"
      )}
    >
      {/* Left: Drag Grip Handle + Checkbox + Icon + Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Dedicated Drag Handle with explicit pointer down */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground shrink-0 p-1 -m-1 rounded-md hover:bg-muted/50 transition-colors select-none"
          title="درگ برای جابجایی"
          style={{ touchAction: "none" }}
        >
          <GripVertical className="size-4" />
        </div>

        {/* Checkbox (Click toggles off) */}
        <button
          type="button"
          onClick={(e) => onToggle(id, e)}
          disabled={!canDisable}
          className={cn(
            "size-4.5 rounded-md flex items-center justify-center shrink-0 transition-colors shadow-2xs",
            !canDisable
              ? "bg-primary/50 text-primary-foreground cursor-not-allowed opacity-60"
              : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          )}
        >
          <Check className="size-3 stroke-[2.5]" />
        </button>

        {/* Icon */}
        <div className="size-6.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <Icon className="size-3.5" />
        </div>

        {/* Title */}
        <span className="text-xs sm:text-[13px] font-medium text-foreground truncate">
          {title}
        </span>
      </div>

      {/* Right: Quick Up / Down Arrows */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => onMove(e, index, "up")}
          disabled={index === 0}
          title={t("moveUp")}
          className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border border-border/40"
        >
          <ChevronUp className="size-3" />
        </button>
        <button
          type="button"
          onClick={(e) => onMove(e, index, "down")}
          disabled={index === total - 1}
          title={t("moveDown")}
          className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border border-border/40"
        >
          <ChevronDown className="size-3" />
        </button>
      </div>
    </Reorder.Item>
  );
}

export function SlideSettingsDrawer({
  slideRailItems,
  onChangeSlideRailItems,
}: SlideSettingsDrawerProps) {
  const t = useTranslations("Dashboard.slideCustomizer");

  // Keep responsive local state to decouple drag animation from top-level dashboard re-renders
  const [items, setItems] = React.useState<string[]>(slideRailItems);

  React.useEffect(() => {
    setItems(slideRailItems);
  }, [slideRailItems]);

  const commitChange = React.useCallback(
    (newItems: string[]) => {
      setItems(newItems);
      React.startTransition(() => {
        onChangeSlideRailItems(newItems);
      });
    },
    [onChangeSlideRailItems]
  );

  // Move active item up or down in the rail order
  const moveItem = (
    e: React.MouseEvent,
    index: number,
    direction: "up" | "down"
  ) => {
    e.stopPropagation();
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    commitChange(newItems);
  };

  // Toggle item active/inactive
  const toggleItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isActive = items.includes(id);
    let newItems: string[];
    if (isActive) {
      if (items.length <= 1) return; // Keep at least 1 item
      newItems = items.filter((i) => i !== id);
    } else {
      newItems = [...items, id];
    }
    commitChange(newItems);
  };

  const handleReset = () => {
    commitChange(DEFAULT_SLIDE_ITEMS);
  };

  const activeSet = new Set(items);
  const inactiveDefs = ALL_SLIDE_ITEMS.filter((it) => !activeSet.has(it.id));

  return (
    <div className="flex flex-col h-full min-h-0 bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4 select-none">
      {/* ── Widget Header matching other drawer modules ── */}
      <div className="flex items-center gap-2 px-1 mb-3 shrink-0 border-b border-border/40 pb-3">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <SlidersHorizontal className="size-5 text-primary" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-semibold text-base text-foreground/80 truncate">
            {t("simpleTitle")}
          </h3>
          <p className="text-[11px] text-muted-foreground font-normal truncate">
            {t("simpleSubtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted border border-border/50 transition-colors cursor-pointer ms-auto shrink-0 shadow-2xs"
          title={t("reset")}
        >
          <RotateCcw className="size-3.5" />
          <span>{t("reset")}</span>
        </button>
      </div>

      {/* ── Scrollable Body with Drag & Drop Reordering ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pe-1 space-y-3 min-h-0">
        {/* Active Items Section (Drag & Drop Reorderable) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-foreground/80">
              {t("activeItemsTitle")}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 fa-num">
              {items.length}
            </span>
          </div>

          <Reorder.Group
            axis="y"
            values={items}
            onReorder={commitChange}
            className="space-y-1.5"
          >
            {items.map((id, index) => (
              <SlideSettingsItem
                key={id}
                id={id}
                index={index}
                total={items.length}
                onMove={moveItem}
                onToggle={toggleItem}
                canDisable={items.length > 1}
              />
            ))}
          </Reorder.Group>
        </div>

        {/* Inactive Items Section */}
        {inactiveDefs.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("availableItemsTitle")}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground fa-num">
                {inactiveDefs.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {inactiveDefs.map((item) => {
                const Icon = item.icon as any;
                const title = t(`items.${itemKeySafe(item.titleKey)}` as any);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl border border-dashed border-border/50 bg-white/40 dark:bg-card/30 hover:bg-muted/30 hover:border-primary/40 text-start transition-colors cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Unchecked Box */}
                      <div className="size-4.5 rounded-md border border-border/60 bg-background group-hover:border-primary/60 flex items-center justify-center shrink-0 transition-colors" />

                      {/* Icon */}
                      <div className="size-6.5 rounded-lg bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 flex items-center justify-center shrink-0 border border-border/40 transition-colors">
                        <Icon className="size-3.5" />
                      </div>

                      {/* Title */}
                      <span className="text-xs sm:text-[13px] font-normal text-muted-foreground group-hover:text-foreground truncate transition-colors">
                        {title}
                      </span>
                    </div>

                    <Plus className="size-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function itemKeySafe(key: string): string {
  return key;
}
