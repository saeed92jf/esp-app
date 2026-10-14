"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { SideMenuContent } from "@/components/layout/side-menu-content";
import { useHomeSidebar } from "@/modules/home/hooks/use-home-sidebar";

export function HomeSidebar() {
  const { isOpen, close } = useHomeSidebar();
  const locale = useLocale();
  const pathname = usePathname();
  const isRtl = locale === "fa";

  // Auto-close when pathname changes
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="home-sidebar-panel"
          initial={{
            x: isRtl ? "100%" : "-100%",
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          exit={{
            x: isRtl ? "100%" : "-100%",
            opacity: 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn(
            "fixed top-[calc(var(--header-height)+8px)] bottom-[calc(var(--footer-height)+8px)] start-0 z-40 w-[300px] sm:w-[340px] flex flex-col p-4",
            "bg-popover/95 dark:bg-card/95 backdrop-blur-2xl",
            "rounded-s-none rounded-e-[28px]",
            "border-y border-e border-s-0 border-border/40",
            "overflow-hidden shadow-none"
          )}
          aria-label="Home Navigation Sidebar"
        >
          <SideMenuContent onClose={close} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
