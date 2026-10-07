// src/components/ui/locale-switcher.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showFadeIn, setShowFadeIn] = useState(true);
  const [optimisticLocale, setOptimisticLocale] = useState(locale);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOptimisticLocale(locale);
  }, [locale]);

  function handleLocaleChange(nextLocale: string) {
    if (!nextLocale || nextLocale === locale || isFadingOut || isPending) return;

    // Optimistically update the UI to start the pill animation
    setOptimisticLocale(nextLocale);
    
    // Trigger the global page fade-out overlay
    setIsFadingOut(true);

    // Wait for animations (500ms) before actually routing
    setTimeout(() => {
      startTransition(() => {
        router.replace(pathname, { locale: nextLocale as Locale });
      });
    }, 500);
  }

  const shortNormal = optimisticLocale === "en" ? "EN" : "FA";
  const shortHover = optimisticLocale === "en" ? "FA" : "EN";

  return (
    <>
      {/* Global Page Fade Overlays (Portaled to body to escape Header stacking context) */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {isFadingOut && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="fixed inset-0 z-[99999] bg-background/95 backdrop-blur-2xl pointer-events-none"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showFadeIn && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                  onAnimationComplete={() => setShowFadeIn(false)}
                  className="fixed inset-0 z-[99998] bg-background/95 backdrop-blur-2xl pointer-events-none"
                />
              )}
            </AnimatePresence>
          </>,
          document.body
        )}

      <button
        className={cn(HEADER_ICON_BUTTON_CLASS, "relative group", className)}
        
        onClick={() => {
          const next = optimisticLocale === "en" ? "fa" : "en";
          handleLocaleChange(next);
        }}
        aria-label="Toggle Language"
      >
        <div className="relative flex items-center justify-center w-full h-full font-bold text-sm font-sans tracking-widest">
          <span
            className="absolute transition-all duration-500 ease-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-50"
          >
            {shortNormal}
          </span>
          <span
            className="absolute transition-all duration-500 ease-out opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"
          >
            {shortHover}
          </span>
        </div>
      </button>
    </>
  );
}

