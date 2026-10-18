"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  BookA,
  Lightbulb,
  Headphones,
  UserPlus,
  LogIn,
} from "lucide-react";
import { SquaresFour } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { SiteSearch } from "@/components/features/search/site-search";
import { QuickAccessSection } from "@/components/features/quick-access";
import { Container } from "@/components/layout/container";
import { FeaturedModulesCard } from "@/modules/home/components/featured-modules-card";
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
  const tCommon = useTranslations("Common");
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

  const [activeGuestTab, setActiveGuestTab] = useState<GuestTab>("insights");
  const guestScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    guestScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeGuestTab]);

  const guestTabs = useMemo(() => [
    {
      id: "insights" as const,
      label: t("guestTabs.insights"),
      ariaLabel: t("guestTabs.insightsDesc"),
      icon: Lightbulb,
      onClick: () => setActiveGuestTab("insights"),
    },
    {
      id: "dictionary" as const,
      label: t("guestTabs.dictionary"),
      ariaLabel: t("guestTabs.dictionaryDesc"),
      icon: BookA,
      onClick: () => setActiveGuestTab("dictionary"),
    },
    {
      id: "featured" as const,
      label: t("guestTabs.featured"),
      ariaLabel: t("guestTabs.featuredDesc"),
      icon: SquaresFour,
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
    <div className="relative w-full flex-1 flex flex-col min-h-[var(--home-height)] select-none">
      {/* Docked Inline Home Sidebar */}
      <HomeSidebar />

      <div className="relative flex w-full flex-1">
        {/* Animated Spacer pushing the content aside on desktop ONLY */}
        <motion.div
          initial={false}
          animate={{
            width: isOpen && !isMobile ? 340 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="shrink-0 overflow-hidden pointer-events-none hidden sm:block"
          aria-hidden="true"
        />

        {/* Center content container */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative flex flex-col">
          {/* Backdrop click catcher when sidebar is open on desktop */}
          {isOpen && !isMobile && (
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
            <div className="relative flex flex-1 w-full flex-col items-center justify-center text-center py-3 sm:py-5 my-auto min-h-0">
              <Container>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={staggerContainer}
                  className="relative mx-auto w-full flex flex-col items-center"
                >
                  <div className="w-full max-w-2xl flex flex-col items-center">
                    {/* Google-Inspired Logo */}
                    <motion.div variants={fadeUp} className="mb-4 sm:mb-5 flex justify-center w-full">
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

                  {/* Quick Access Shortcuts - Brought slightly lower relative to search */}
                  <motion.div variants={fadeUp} className="mt-5 sm:mt-6 w-full">
                    <QuickAccessSection onEditModeChange={setIsQuickAccessEditing} />
                  </motion.div>
                </motion.div>
              </Container>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. GUEST / UNAUTHENTICATED SHOWCASE (4 TABS)             */
            /* ======================================================== */
            <div className="relative w-full flex-1 flex flex-col">
              {/* Tab Content Display Area */}
              <div
                ref={guestScrollRef}
                className="flex-1 w-full relative flex flex-col"
              >
                <AnimatePresence mode="wait">
                  {/* TAB 1: DICTIONARY (Specialized Engineering Dictionary & Daily Tips) */}
                  {activeGuestTab === "dictionary" && (
                    <motion.div
                      key="dictionary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full flex-1 flex flex-col items-center justify-start pt-0 pb-8 px-2 sm:px-4"
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
                      className="w-full flex-1 flex flex-col items-center justify-center pt-2 pb-3 px-2 sm:px-4 my-auto"
                    >
                      <DidYouKnowSection />
                    </motion.div>
                  )}

                  {/* TAB 3: FEATURED (Showcase of latest and most important modules) */}
                  {activeGuestTab === "featured" && (
                    <motion.div
                      key="featured"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full flex-1 relative flex flex-col items-center justify-center pt-2 pb-3 px-2 sm:px-4 my-auto"
                    >
                      <FeaturedModulesCard />
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
                      className="w-full flex-1 flex flex-col items-center justify-center pt-2 pb-3 px-2 sm:px-4 my-auto"
                    >
                      <SupportSection />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Navigation Dock & Action Bar (Cleanly Placed BELOW Content, No Top Border, Transparent Background) */}
              <div className="shrink-0 w-full bg-transparent py-2 sm:py-2.5 px-3 sm:px-6 z-30">
                <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                  {/* Left/Start: Welcome Navigation Tabs */}
                  <div className="flex items-center justify-center shrink-0">
                    <MultiButtonGroup>
                      <MultiButton
                        items={guestTabs}
                        selectedId={activeGuestTab}
                        onSelect={(val) => setActiveGuestTab(val as GuestTab)}
                        size="md"
                        className="shadow-none border border-border/60 bg-muted/40"
                      />
                    </MultiButtonGroup>
                  </div>

                  {/* Right/End: Flat, Shadowless Auth Buttons Without Primary or Blue Colors */}
                  <div className="flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto">
                    {/* Login Link */}
                    <Link
                      href="/login"
                      className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-muted/60 hover:bg-muted text-foreground px-3.5 sm:px-4 text-xs font-medium border border-border/60 shadow-none transition-colors active:scale-95"
                    >
                      <LogIn className="size-3.5 text-muted-foreground" />
                      <span>{tCommon("login")}</span>
                    </Link>

                    {/* Create Account Link (Neutral Monochromatic Flat) */}
                    <Link
                      href="/register"
                      className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90 px-3.5 sm:px-4 text-xs font-semibold border border-transparent shadow-none transition-colors active:scale-95"
                    >
                      <UserPlus className="size-3.5" />
                      <span>{tCommon("register")}</span>
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
