// src/components/ui/locale-switcher.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALES = [
  { id: "en", label: "EN" },
  { id: "fa", label: "FA" },
] as const;

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showFadeIn, setShowFadeIn] = useState(true);
  const [optimisticLocale, setOptimisticLocale] = useState(locale);
  const [mounted, setMounted] = useState(false);

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

  const [isHovered, setIsHovered] = useState(false);
  const textNormal = optimisticLocale === "en" ? "English" : "فارسی";
  const textHover = optimisticLocale === "en" ? "Switch to Persian" : "تبدیل به انگلیسی";
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
        className={cn(
          "relative flex items-center justify-center h-9 w-9 sm:w-auto sm:px-4 overflow-hidden rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-muted/50 text-[13px] font-semibold text-foreground transition-all duration-300",
          (isPending || isFadingOut) && "pointer-events-none opacity-50",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          const next = optimisticLocale === "en" ? "fa" : "en";
          handleLocaleChange(next);
        }}
        role="button"
        aria-label="Toggle Language"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Invisible placeholder ensures button width doesn't jitter on desktop */}
          <div className="invisible whitespace-nowrap hidden sm:block">
            {textHover}
          </div>
          
          {/* Animated Texts */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={false}
              animate={{ y: isHovered ? -24 : 0, opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute whitespace-nowrap flex items-center justify-center"
            >
              <span className="hidden sm:inline">{textNormal}</span>
              <span className="sm:hidden">{shortNormal}</span>
            </motion.span>
            
            <motion.span
              initial={false}
              animate={{ y: isHovered ? 0 : 24, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute whitespace-nowrap text-primary flex items-center justify-center"
            >
              <span className="hidden sm:inline">{textHover}</span>
              <span className="sm:hidden">{shortHover}</span>
            </motion.span>
          </div>
        </div>
      </button>
    </>
  );
}
