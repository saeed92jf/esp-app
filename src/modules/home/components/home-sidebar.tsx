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
        <>
          {/* Mobile Overlay Backdrop */}
          <motion.div
            key="home-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs sm:hidden"
            aria-hidden="true"
          />

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
              "fixed top-[calc(var(--header-height)+8px)] bottom-[calc(var(--footer-height)+10px)] start-0 z-50 w-[min(320px,calc(100vw-28px))] sm:w-[340px] flex flex-col p-0",
              "bg-popover/95 backdrop-blur-2xl",
              "rounded-s-none rounded-e-[22px] sm:rounded-e-[26px]",
              "border-y border-e border-s-0 border-border/40",
              "overflow-hidden shadow-2xl sm:shadow-none"
            )}
            aria-label="Home Navigation Sidebar"
          >
            <SideMenuContent onClose={close} showCloseButton={true} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
