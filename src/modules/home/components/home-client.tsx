"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Sparkles,
  Layers,
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
import { FreeModulesBanner } from "@/modules/home/components/free-modules-banner";
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

type GuestTab = "modules" | "insights" | "featured" | "support";

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

  const [activeGuestTab, setActiveGuestTab] = useState<GuestTab>("modules");
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);

  const guestTabs = useMemo(() => [
    {
      id: "modules" as const,
      label: t("guestTabs.modules"),
      ariaLabel: t("guestTabs.modulesDesc"),
      icon: Layers,
      onClick: () => setActiveGuestTab("modules"),
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
              <div className="flex-1 min-h-0 w-full h-full overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {/* TAB 1: MODULES (Free & Featured Modules Banner) */}
                  {activeGuestTab === "modules" && (
                    <motion.div
                      key="modules"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full flex flex-col items-center justify-center pb-20 sm:pb-24 px-2 sm:px-4 overflow-hidden"
                    >
                      <FreeModulesBanner />
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
                      className="w-full h-full flex flex-col items-center justify-center pb-20 sm:pb-24 px-2 sm:px-4 overflow-hidden"
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
                      className="w-full h-full relative overflow-hidden flex items-center justify-center pb-12"
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
                      className="w-full h-full flex flex-col items-center justify-center pb-20 sm:pb-24 px-2 sm:px-4 overflow-hidden"
                    >
                      <SupportSection />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Floating Bottom Navigation Dock (MultiButtonGroup Tabs + Large Animated Auth Buttons) */}
              {/* Floating Bottom Navigation Dock (Compact MultiButton Tabs + Title + Larger Flat Auth Buttons) */}
              <div className="fixed bottom-[calc(var(--footer-height)+0.75rem)] inset-x-0 z-40 flex flex-col items-center justify-center pointer-events-none px-4">
                <div className="pointer-events-auto flex flex-col items-center gap-2 sm:gap-2.5">
                  {/* Row 1: Welcome Showcase Navigation Tabs (Compact MultiButton with bottom margin) */}
                  <div className="flex flex-col items-center mb-3 sm:mb-4">
                    <MultiButtonGroup>
                      <MultiButton
                        items={guestTabs}
                        selectedId={activeGuestTab}
                        onSelect={(val) => setActiveGuestTab(val as GuestTab)}
                        size="sm"
                        className="shadow-none border-0"
                      />
                    </MultiButtonGroup>
                  </div>

                  {/* Row 2: Longer Engaging Title under MultiButton */}
                  <p className="text-xs sm:text-[13px] font-medium text-muted-foreground/85 text-center max-w-lg tracking-tight select-none py-0.5 px-2">
                    {t("guestDockTitle")}
                  </p>

                  {/* Row 3: Larger Flat Auth Action Buttons (Visibly bigger than MultiButton, Non-Primary, Flat) */}
                  <div className="flex items-center gap-3">
                    {/* Create Account / Sign Up Button (With Animated Filling & Emptying Bounce Background) */}
                    <Link
                      href="/register"
                      onMouseEnter={() => setIsRegisterHovered(true)}
                      onMouseLeave={() => setIsRegisterHovered(false)}
                      className="relative isolate inline-flex h-11 sm:h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-800/60 px-6 sm:px-7 text-xs sm:text-sm font-semibold border-0 shadow-none ring-0 select-none cursor-pointer"
                    >
                      {/* Background Animated Filling & Emptying layer */}
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#18181b] dark:bg-slate-100"
                        initial={false}
                        animate={{
                          scale: isRegisterHovered ? 1 : 0,
                          opacity: isRegisterHovered ? 1 : 0,
                        }}
                        transition={{
                          scale: isRegisterHovered
                            ? {
                                type: "spring",
                                stiffness: 420,
                                damping: 24,
                                mass: 0.5,
                              }
                            : {
                                duration: 0.2,
                                ease: [0.4, 0, 0.2, 1],
                              },
                          opacity: {
                            duration: isRegisterHovered ? 0.18 : 0.14,
                          },
                        }}
                      />
                      <UserPlus
                        className={cn(
                          "size-4 sm:size-[18px] shrink-0 transition-colors duration-200",
                          isRegisterHovered
                            ? "text-white dark:text-slate-950"
                            : "text-foreground dark:text-slate-200"
                        )}
                      />
                      <span
                        className={cn(
                          "tracking-tight transition-colors duration-200",
                          isRegisterHovered
                            ? "text-white dark:text-slate-950"
                            : "text-foreground dark:text-slate-200"
                        )}
                      >
                        {t("createAccountLong")}
                      </span>
                    </Link>

                    {/* Login Button (Simple Flat Hover - Larger) */}
                    <Link
                      href="/login"
                      className="group relative inline-flex h-11 sm:h-12 items-center justify-center gap-2.5 rounded-full bg-slate-200/40 dark:bg-slate-800/40 px-6 sm:px-7 text-xs sm:text-sm font-medium text-muted-foreground border-0 shadow-none ring-0 transition-colors duration-200 hover:bg-slate-950/[0.08] dark:hover:bg-white/[0.08] hover:text-foreground"
                    >
                      <LogIn className="size-4 sm:size-[18px] shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                      <span className="tracking-tight">{t("loginLong")}</span>
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
