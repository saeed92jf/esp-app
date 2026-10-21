"use client";

import React, { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { HelpCircle, BookOpen, MessageSquare, HeadphonesIcon, Video, Users, Bug, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import {
  segmentedAccordionMotion,
  getSegmentedAccordionHeaderClass,
} from "@/lib/animations/segmented-accordion";

export function HelpPopover({ triggerClassName, iconClassName }: { triggerClassName?: string; iconClassName?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = useState<"left" | "right">("right");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations("Help");
  const tHeader = useTranslations("Header");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";

  const menuItems = [
    {
      title: t("documentation"),
      icon: BookOpen,
      href: "/dashboard/help/docs",
    },
    {
      title: t("tutorials"),
      icon: Video,
      href: "/dashboard/help/tutorials",
    },
    {
      title: t("faq"),
      icon: HelpCircle,
      href: "/dashboard/help/faq",
    },
    {
      title: t("support"),
      icon: HeadphonesIcon,
      href: "/dashboard/help/support",
    }
  ];

  const contactItem = {
    title: t("contact"),
    icon: MessageSquare,
    href: "/dashboard/help/contact",
  };

  return (
    <Popover open={open} onOpenChange={(val) => {
      if (val && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setAnchorEdge(rect.left < window.innerWidth / 2 ? "left" : "right");
      }
      setOpen(val);
      if (!val) {
        setIsScrolled(false);
      }
    }}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                ref={triggerRef}
                variant="ghost" 
                size="icon" 
                className={cn("hidden sm:inline-flex", triggerClassName || HEADER_ICON_BUTTON_CLASS)}
              >
                <HelpCircle className={cn(iconClassName || HEADER_ICON_CLASS)} />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {tHeader("help")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <PopoverAnchor className={cn("fixed top-[calc(var(--header-height)+8px)] w-0 h-0 pointer-events-none", anchorEdge === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6")} />
      
      <PopoverContent 
        className="relative w-[calc(100vw-24px)] max-w-[380px] sm:w-[380px] max-h-[calc(100dvh-var(--header-height)-1.25rem)] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100] overflow-hidden" 
        align={anchorEdge === "left" ? (dir === "rtl" ? "end" : "start") : (dir === "rtl" ? "start" : "end")}
        side="bottom"
        sideOffset={0}
        collisionPadding={12}
      >
        {/* Sticky Header with centered Help title on scroll & concentric Close Button */}
        <div 
          className={cn(
            "absolute top-0 inset-x-0 z-30 flex items-center h-[46px] sm:h-[50px] transition-colors duration-200 pointer-events-auto rounded-t-[22px] sm:rounded-t-[26px]",
            isScrolled 
              ? "bg-[#dfe7f3] dark:bg-popover/95 dark:backdrop-blur-md border-b border-border/50" 
              : "bg-popover border-b border-transparent"
          )}
        >
          {/* Mini Help Summary (Centered in header, single line title with simple fade) */}
          <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none">
            <div className="flex items-center gap-2.5 max-w-full">
              <div 
                className={cn(
                  "transition-all duration-300 ease-out shrink-0 flex items-center justify-center",
                  isScrolled 
                    ? "opacity-100 scale-100 translate-y-0" 
                    : "opacity-0 scale-90 translate-y-2 pointer-events-none"
                )}
              >
                <span className="text-2xl sm:text-3xl font-black text-primary leading-none select-none">?</span>
              </div>
              <span 
                className={cn(
                  "text-sm font-semibold text-foreground truncate min-w-0 text-center transition-opacity duration-300 ease-out",
                  isScrolled 
                    ? "opacity-100" 
                    : "opacity-0 pointer-events-none"
                )}
              >
                {t("title")}
              </span>
            </div>
          </div>

          {/* Concentric Close Button (nested fillet: R_inner = R_outer - d = 22-6=16, 26-6=20) */}
          <button 
            type="button"
            onClick={() => setOpen(false)} 
            className="absolute top-[6px] end-[6px] size-8.5 sm:size-9 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#98c1d9]/30 transition-colors z-20"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

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
              {/* Group Header */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "segmented-item group relative flex items-center justify-between gap-3.5 p-4 sm:p-5 w-full outline-none cursor-pointer",
                  getSegmentedAccordionHeaderClass(isExpanded, { isTopRounded: true, fullCapsuleWhenClosed: true })
                )}
              >
                <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="flex items-center justify-center size-12 sm:size-14 shrink-0 select-none">
                    <span className="text-5xl sm:text-6xl font-black text-primary mb-1 leading-none">?</span>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                    <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight truncate w-full text-start">{t("title")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground text-start leading-tight truncate w-full">{t("description")}</p>
                  </div>
                </div>
                <ChevronDown className={cn("relative z-10 size-4.5 shrink-0 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
              </button>

              {/* Accordion Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={segmentedAccordionMotion.initial}
                    animate={segmentedAccordionMotion.animate}
                    exit={segmentedAccordionMotion.exit}
                    className="flex flex-col overflow-hidden gap-[2px]"
                  >
                    {menuItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isLast = idx === menuItems.length - 1;
                      return (
                        <Link 
                          key={idx}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "segmented-item relative flex items-center gap-3.5 py-3 px-5 outline-none group w-full",
                            "rounded-t-[6px]",
                            isLast ? "rounded-b-[32px]" : "rounded-b-[6px]"
                          )}
                        >
                          <div className="relative z-10 shrink-0 flex items-center justify-center size-5 text-muted-foreground group-hover:text-foreground transition-colors">
                            <Icon className="size-4.5" />
                          </div>
                          <span className="relative z-10 text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors flex-1 text-start">
                            {item.title}
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Separate Contact Item */}
            <Link 
              href={contactItem.href}
              onClick={() => setOpen(false)}
              className="segmented-item group relative flex items-center gap-3.5 py-3 px-5 outline-none rounded-[32px] mt-2.5 w-full"
            >
              <div className="relative z-10 shrink-0 flex items-center justify-center size-5 text-muted-foreground group-hover:text-foreground transition-colors">
                <contactItem.icon className="size-4.5" />
              </div>
              <span className="relative z-10 text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors flex-1 text-start">
                {contactItem.title}
              </span>
            </Link>
            
            {/* Footer */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground mt-4 mb-2">
               <Link href="/dashboard/help/community" onClick={() => setOpen(false)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">{t("community")}</Link>
               <span>•</span>
               <Link href="/dashboard/help/bug" onClick={() => setOpen(false)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">{t("bugReport")}</Link>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
