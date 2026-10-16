"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Sparkles,
  BookA,
  Lightbulb,
  Headphones,
  UserPlus,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { SiteSearch } from "@/components/features/search/site-search";
import { QuickAccessSection } from "@/components/features/quick-access";
import { Container } from "@/components/layout/container";
import { HeroFlow } from "@/modules/hero-flow/HeroFlow";
import { HomeSidebar } from "@/modules/home/components/home-sidebar";
import { useHomeSidebar } from "@/modules/home/hooks/use-home-sidebar";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { EngineeringDictionary } from "@/modules/home/components/engineering-dictionary";
import { DidYouKnowSection } from "@/modules/home/components/did-you-know-section";
import { SupportSection } from "@/modules/home/components/support-section";
import { MultiButton, MultiButtonGroup } from "@/components/ui/multi-button";
import { Link } from "@/i18n/navigation";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

type GuestTab = "dictionary" | "insights" | "featured" | "support";

export function HomeClient() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return Boolean(localStorage.getItem("esp-auth-user"));
    }
    return false;
  });

  useEffect(() => {
    setIsAuthenticated(Boolean(user || (typeof window !== "undefined" && localStorage.getItem("esp-auth-user"))));
  }, [user]);

  const { isOpen, close } = useHomeSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAccessEditing, setIsQuickAccessEditing] = useState(false);

  const [activeGuestTab, setActiveGuestTab] = useState<GuestTab>("dictionary");

  const guestTabs = useMemo(() => [
    {
      id: "dictionary" as const,
      label: t("guestTabs.dictionary"),
      ariaLabel: t("guestTabs.dictionaryDesc"),
      icon: BookA,
      onClick: () => setActiveGuestTab("dictionary"),
    },
    {
      id: "insights" as const,
      label: t("guestTabs.insights"),
      ariaLabel: t("guestTabs.insightsDesc"),
      icon: Lightbulb,
      onClick: () => setActiveGuestTab("insights"),
    },
    {
      id: "featured" as const,
      label: t("guestTabs.featured"),
      ariaLabel: t("guestTabs.featuredDesc"),
      icon: Sparkles,
      onClick: () => setActiveGuestTab("featured"),
    },
    {
      id: "support" as const,
      label: t("guestTabs.support"),
      ariaLabel: t("guestTabs.supportDesc"),
      icon: Headphones,
      onClick: () => setActiveGuestTab("support"),
    },
  ], [t]);


  return (
    <div className="relative w-full h-[var(--home-height,calc(100dvh-var(--header-height)-var(--footer-height)))] max-h-[var(--home-height,calc(100dvh-var(--header-height)-var(--footer-height)))] overflow-hidden select-none">
      {/* Docked Inline Home Sidebar */}
      <HomeSidebar />

      <div className="relative flex w-full h-full">
        {/* Animated Spacer pushing the content aside */}
        <motion.div
          initial={false}
          animate={{
            width: isOpen ? (isMobile ? 300 : 340) : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="shrink-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        />

        {/* Center content container */}
        <div className="flex-1 min-w-0 h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden flex flex-col">
          {/* Backdrop click catcher when sidebar is open */}
          {isOpen && (
            <div
              onClick={close}
              className="absolute inset-0 z-50 cursor-pointer"
              aria-label="Close menu"
            />
          )}

          {isAuthenticated ? (
            /* ======================================================== */
            /* 1. AUTHENTICATED USER VIEW (HERO + SEARCH + QUICK ACCESS) */
            /* ======================================================== */
            <div className="relative flex h-full w-full flex-col items-center justify-center text-center pb-6 sm:pb-8 overflow-hidden">
              <Container>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={staggerContainer}
                  className="relative mx-auto w-full flex flex-col items-center"
                >
                  <div className="w-full max-w-2xl flex flex-col items-center">
                    {/* Google-Inspired Logo */}
                    <motion.div variants={fadeUp} className="mb-6 sm:mb-8 flex justify-center w-full">
                      <Logo
                        className="text-xl sm:text-2xl md:text-3xl lg:text-[34px]"
                        subtitleClassName="text-[0.32em] sm:text-[0.36em] font-semibold"
                      />
                    </motion.div>

                    {/* Google Search Bar */}
                    <motion.div variants={fadeUp} className="w-full">
                      <SiteSearch
                        className="w-full"
                        placeholder={t("hero.searchPlaceholder")}
                        onOpenChange={setIsSearchOpen}
                      />
                    </motion.div>
                  </div>

                  {/* Quick Access Shortcuts */}
                  <motion.div variants={fadeUp} className="mt-7 sm:mt-9 w-full">
                    <QuickAccessSection onEditModeChange={setIsQuickAccessEditing} />
                  </motion.div>
                </motion.div>
              </Container>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. GUEST / UNAUTHENTICATED SHOWCASE (4 FULL-HEIGHT TABS) */
            /* ======================================================== */
            <div className="relative w-full h-full flex flex-col overflow-hidden">
              {/* Tab Content Display Area */}
              <div className="flex-1 min-h-0 w-full overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {/* TAB 1: DICTIONARY (Specialized Engineering Dictionary & Daily Tips) */}
                  {activeGuestTab === "dictionary" && (
                    <motion.div
                      key="dictionary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full flex flex-col items-center justify-start pb-2 sm:pb-3 px-2 sm:px-4 overflow-hidden"
                    >
                      <EngineeringDictionary />
                    </motion.div>
                  )}

                  {/* TAB 2: INSIGHTS (Scientific & Engineering Did You Know Cards) */}
                  {activeGuestTab === "insights" && (
                    <motion.div
                      key="insights"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full flex flex-col items-center justify-center pb-2 sm:pb-3 px-2 sm:px-4 overflow-hidden"
                    >
                      <DidYouKnowSection />
                    </motion.div>
                  )}

                  {/* TAB 3: FEATURED (HeroFlow Interactive Canvas / Featured Simulation) */}
                  {activeGuestTab === "featured" && (
                    <motion.div
                      key="featured"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full relative overflow-hidden flex items-center justify-center pb-2 sm:pb-3"
                    >
                      <HeroFlow />
                    </motion.div>
                  )}

                  {/* TAB 4: SUPPORT (Direct Support Contact & Overview) */}
                  {activeGuestTab === "support" && (
                    <motion.div
                      key="support"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full flex flex-col items-center justify-center pb-2 sm:pb-3 px-2 sm:px-4 overflow-hidden"
                    >
                      <SupportSection />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Navigation Dock & Action Bar (Cleanly Placed BELOW the Content) */}
              <div className="shrink-0 w-full border-t border-border/50 bg-card/85 dark:bg-[#0c0e14]/90 backdrop-blur-xl py-2 sm:py-2.5 px-3 sm:px-6 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                  {/* Left/Start: Welcome Navigation Tabs */}
                  <div className="flex items-center justify-center shrink-0">
                    <MultiButtonGroup>
                      <MultiButton
                        items={guestTabs}
                        selectedId={activeGuestTab}
                        onSelect={(val) => setActiveGuestTab(val as GuestTab)}
                        size="sm"
                        className="shadow-xs border border-border/60 bg-muted/40"
                      />
                    </MultiButtonGroup>
                  </div>

                  {/* Center: Friendly Invitation Tagline (Hidden on mobile for compact layout) */}
                  <p className="hidden lg:block text-xs font-medium text-muted-foreground/80 text-center truncate max-w-md select-none">
                    {t("guestDockTitle")}
                  </p>

                  {/* Right/End: High-Quality Flat Auth Action Buttons */}
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
                    {/* Login Link */}
                    <Link
                      href="/login"
                      className="flex-1 sm:flex-none inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground/85 hover:text-foreground px-3.5 sm:px-4 text-xs font-semibold border border-border/50 shadow-2xs transition-all active:scale-95"
                    >
                      <LogIn className="size-3.5 text-muted-foreground" />
                      <span>{t("loginLong")}</span>
                    </Link>

                    {/* Create Account Link (Primary Glow Pill) */}
                    <Link
                      href="/register"
                      className="flex-1 sm:flex-none inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 sm:px-5 text-xs font-bold shadow-xs shadow-primary/25 transition-all active:scale-95"
                    >
                      <UserPlus className="size-3.5" />
                      <span>{t("createAccountLong")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
