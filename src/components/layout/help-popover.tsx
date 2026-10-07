"use client";

import React, { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { HelpCircle, BookOpen, MessageSquare, HeadphonesIcon, Video, Users, Bug, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function HelpPopover({ triggerClassName, iconClassName }: { triggerClassName?: string; iconClassName?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = useState<"left" | "right">("right");
  const [isExpanded, setIsExpanded] = useState(true);
  const t = useTranslations("Help");
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
    }}>
      <PopoverTrigger asChild>
        <Button 
          ref={triggerRef}
          variant="ghost" 
          size="icon" 
          className={cn("rounded-full text-zinc-700 dark:text-zinc-300 hover:text-foreground hover:bg-muted hidden sm:inline-flex size-8 sm:size-10", triggerClassName)}
        >
          <HelpCircle className={cn("size-4 sm:size-5", iconClassName)} />
        </Button>
      </PopoverTrigger>
      
      <PopoverAnchor className={cn("fixed top-[72px] w-0 h-0 pointer-events-none", anchorEdge === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6")} />
      
      <PopoverContent 
        className="w-[calc(100vw-32px)] sm:w-[340px] p-3 sm:p-4 bg-popover rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100]" 
        align={anchorEdge === "left" ? (dir === "rtl" ? "end" : "start") : (dir === "rtl" ? "start" : "end")}
        side="bottom"
        sideOffset={0}
        collisionPadding={16}
      >
        <div className="flex flex-col w-full gap-1">
          {/* Header (Close button) */}
          <div className="flex items-center justify-end px-1 pb-1">
             <button 
               onClick={() => setOpen(false)} 
               className="p-1.5 rounded-full hover:bg-[#98c1d9]/30 text-muted-foreground hover:text-foreground transition-colors"
             >
               <X className="size-5" />
             </button>
          </div>

          <div className="segmented-list flex flex-col gap-[2px] w-full">
            {/* Group Header */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "segmented-item group relative flex items-center justify-between gap-3 px-4 py-5 w-full outline-none cursor-pointer",
                isExpanded ? "rounded-t-[32px] rounded-b-[6px]" : "rounded-[32px]"
              )}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex items-center justify-center size-14">
                  <span className="text-6xl font-black text-primary mb-1">?</span>
                </div>
                <div className="flex flex-col items-start gap-1 pe-4">
                  <h3 className="font-extrabold text-xl text-foreground tracking-tight">{t("title")}</h3>
                  <p className="text-sm text-muted-foreground text-start leading-tight whitespace-nowrap">{t("description")}</p>
                </div>
              </div>
              <ChevronDown className={cn("relative z-10 size-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
            </button>

            {/* Accordion Items */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
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
                          "segmented-item relative flex items-center gap-3 py-2 px-3 outline-none group",
                          "rounded-t-[6px]",
                          isLast ? "rounded-b-[32px]" : "rounded-b-[6px]"
                        )}
                      >
                        <div className="relative z-10 shrink-0 flex items-center justify-center size-8 text-muted-foreground group-hover:text-foreground transition-colors">
                          <Icon className="size-4.5" />
                        </div>
                        <span className="relative z-10 text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
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
            className="segmented-item group relative flex items-center gap-3 py-2.5 px-4 outline-none rounded-[32px] mt-2"
          >
            <div className="relative z-10 shrink-0 flex items-center justify-center size-7 text-muted-foreground group-hover:text-foreground transition-colors">
              <contactItem.icon className="size-4.5" />
            </div>
            <span className="relative z-10 text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
              {contactItem.title}
            </span>
          </Link>
          
          {/* Footer */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground mt-4 mb-2">
             <Link href="/dashboard/help/community" onClick={() => setOpen(false)} className="hover:text-foreground transition-colors">{t("community")}</Link>
             <span>•</span>
             <Link href="/dashboard/help/bug" onClick={() => setOpen(false)} className="hover:text-foreground transition-colors">{t("bugReport")}</Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
