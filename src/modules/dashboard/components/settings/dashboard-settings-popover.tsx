// src/modules/dashboard/components/settings/dashboard-settings-popover.tsx
"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  MODULES_REGISTRY,
  TabId,
} from "../../config/modules-registry";

interface DashboardSettingsPopoverProps {
  currentTab?: TabId;
  onChangeTab?: (tab: TabId) => void;
  tabWidgets?: Record<TabId, string[]>;
  onToggleWidgetInTab?: (tabId: TabId, widgetId: string) => void;
  slideRailItems?: string[];
  onToggleSlideRailItem?: (id: string) => void;
  onResetCurrentTab?: (tabId?: TabId) => void;
  triggerClassName?: string;
  iconClassName?: string;
}

type TabSelection = TabId | "rail";

export function DashboardSettingsPopover({
  currentTab = "tasks",
  onChangeTab,
  tabWidgets = { tasks: [], custom: [], administrative: [], market: [] },
  onToggleWidgetInTab,
  slideRailItems = [],
  onToggleSlideRailItem,
  onResetCurrentTab,
  triggerClassName,
  iconClassName,
}: DashboardSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = useState<"left" | "right">("right");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabSelection>(currentTab);

  const t = useTranslations("Dashboard");
  const tTabs = useTranslations("Dashboard.tabs");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    if (open) {
      setActiveTab(currentTab);
    }
  }, [open, currentTab]);

  const allTabs: Array<{ id: TabSelection; label: string }> = [
    { id: "tasks", label: tTabs("tasks") },
    { id: "custom", label: tTabs("custom") },
    { id: "administrative", label: tTabs("administrative") },
    { id: "market", label: tTabs("market") },
    { id: "rail", label: locale === "fa" ? "سایدبار" : "Sidebar" },
  ];

  const currentTabTitle =
    activeTab === "rail"
      ? locale === "fa"
        ? "سایدبار"
        : "Sidebar"
      : tTabs(activeTab);

  const currentActiveCount =
    activeTab === "rail"
      ? slideRailItems.length
      : tabWidgets[activeTab]?.length ?? 0;

  const handleToggle = (widgetId: string) => {
    if (activeTab === "rail") {
      onToggleSlideRailItem?.(widgetId);
    } else {
      onToggleWidgetInTab?.(activeTab, widgetId);
    }
  };

  const handleReset = () => {
    if (activeTab === "rail") {
      // Toggle or keep default
    } else {
      onResetCurrentTab?.(activeTab);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        if (val && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setAnchorEdge(rect.left < window.innerWidth / 2 ? "left" : "right");
        }
        setOpen(val);
        if (!val) {
          setIsScrolled(false);
        }
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  triggerClassName || HEADER_ICON_BUTTON_CLASS,
                  "relative"
                )}
                aria-label={t("schematic.settingsButton")}
              >
                <SlidersHorizontal
                  className={cn(iconClassName || HEADER_ICON_CLASS)}
                />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {t("schematic.settingsButton")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverAnchor
        className={cn(
          "fixed top-[calc(var(--header-height)+8px)] w-0 h-0 pointer-events-none",
          anchorEdge === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
        )}
      />

      <PopoverContent
        className="relative w-[calc(100vw-24px)] max-w-[380px] sm:w-[380px] max-h-[calc(100dvh-var(--header-height)-1.25rem)] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100] overflow-hidden"
        align={
          anchorEdge === "left"
            ? dir === "rtl"
              ? "end"
              : "start"
            : dir === "rtl"
            ? "start"
            : "end"
        }
        side="bottom"
        sideOffset={0}
        collisionPadding={12}
        dir={dir}
      >
        {/* ── Top Bar: Only Close Button ("بالا فقط ضربدر") with concentric fillet ── */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 z-30 flex items-center h-[46px] sm:h-[50px] transition-colors duration-200 pointer-events-auto rounded-t-[22px] sm:rounded-t-[26px]",
            isScrolled
              ? "bg-[#dfe7f3] dark:bg-popover/95 dark:backdrop-blur-md border-b border-border/50"
              : "bg-popover border-b border-transparent"
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-[6px] end-[6px] size-8.5 sm:size-9 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#98c1d9]/30 transition-colors z-20 cursor-pointer"
            aria-label={t("notifications.close")}
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* ── Scrollable Body Matching Notifications/Help Segmented List ── */}
        <ScrollArea
          className="w-full flex-1 min-h-0 popup-scroll"
          dir={dir}
          type="auto"
          onViewportScroll={(e) => {
            setIsScrolled(e.currentTarget.scrollTop > 8);
          }}
        >
          <div className="flex flex-col w-full p-3 sm:p-4 pt-[50px] sm:pt-[54px]">
            <div className="segmented-list flex flex-col gap-[2px] w-full">
              {/* ── Main Accordion Trigger (مثل هلپ و نوتیف) ── */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer",
                  isExpanded
                    ? "rounded-t-[32px] rounded-b-[6px]"
                    : "rounded-[32px]"
                )}
              >
                <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="flex items-center justify-center size-12 sm:size-14 shrink-0 select-none">
                    <SlidersHorizontal className="size-7 sm:size-8 text-foreground" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 w-full">
                      <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight truncate text-start">
                        {locale === "fa" ? "تنظیمات داشبورد" : "Dashboard Settings"}
                      </h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-foreground fa-num">
                        {currentActiveCount}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground text-start leading-tight truncate w-full">
                      {locale === "fa"
                        ? `${currentActiveCount} کارت فعال در ${currentTabTitle}`
                        : `${currentActiveCount} active cards in ${currentTabTitle}`}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "relative z-10 size-4.5 shrink-0 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {/* ── Accordion Items (سفید، با تیک‌های ساده) ── */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex flex-col overflow-hidden gap-[2px]"
                  >
                    {/* Inner Tabs Pill Control */}
                    <div className="segmented-item p-1 rounded-[6px] flex items-center gap-1 w-full overflow-x-auto custom-scrollbar">
                      {allTabs.map((tab) => {
                        const isTabActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(tab.id);
                              if (tab.id !== "rail" && onChangeTab) {
                                onChangeTab(tab.id);
                              }
                            }}
                            className={cn(
                              "relative z-10 flex-1 py-1 px-2 text-[11px] sm:text-xs font-semibold rounded-[4px] transition-all flex items-center justify-center shrink-0 cursor-pointer whitespace-nowrap",
                              isTabActive
                                ? "bg-muted text-foreground font-bold shadow-2xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Modules List with Simple Ticks ("چنتا تیک ساده") */}
                    {MODULES_REGISTRY.map((module, idx) => {
                      const isLast = idx === MODULES_REGISTRY.length - 1;
                      const Icon = module.icon as React.ComponentType<{ className?: string }>;
                      const isChecked =
                        activeTab === "rail"
                          ? slideRailItems.includes(module.id)
                          : tabWidgets[activeTab]?.includes(module.id) ?? false;

                      return (
                        <div
                          key={module.id}
                          onClick={() => handleToggle(module.id)}
                          className={cn(
                            "segmented-item relative flex items-center justify-between gap-3 p-3 sm:p-3.5 outline-none group w-full cursor-pointer select-none",
                            "rounded-t-[6px]",
                            isLast ? "rounded-b-[32px]" : "rounded-b-[6px]"
                          )}
                        >
                          <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
                            <div className="size-7.5 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 border border-border/40">
                              <Icon className="size-4" />
                            </div>
                            <div className="flex flex-col items-start min-w-0 flex-1">
                              <span
                                className={cn(
                                  "text-xs sm:text-[13px] truncate transition-colors text-start w-full",
                                  isChecked
                                    ? "font-semibold text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {locale === "fa" ? module.titleFa : module.titleEn}
                              </span>
                            </div>
                          </div>

                          {/* Minimalist Checkbox Indicator ("تیک ساده") */}
                          <div className="relative z-10 shrink-0">
                            <div
                              className={cn(
                                "size-5 rounded-md border flex items-center justify-center transition-all duration-150",
                                isChecked
                                  ? "bg-foreground border-foreground text-background"
                                  : "border-border/80 bg-background/50 group-hover:border-foreground/50"
                              )}
                            >
                              {isChecked && (
                                <Check className="size-3.5 stroke-[2.5]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Separate Pill Button ("یه لوبیایی بعد اکاردیون") ── */}
            <button
              type="button"
              onClick={handleReset}
              className="segmented-item group relative flex items-center justify-center gap-2.5 py-3 px-5 outline-none rounded-[32px] mt-2.5 w-full cursor-pointer transition-opacity select-none hover:opacity-90"
            >
              <div className="relative z-10 shrink-0 flex items-center justify-center size-5 text-muted-foreground group-hover:text-foreground transition-colors">
                <RotateCcw className="size-4" />
              </div>
              <span className="relative z-10 text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                {locale === "fa"
                  ? "بازنشانی چیدمان به پیش‌فرض"
                  : "Reset Layout to Default"}
              </span>
            </button>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
