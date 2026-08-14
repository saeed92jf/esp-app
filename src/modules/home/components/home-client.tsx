"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, useScroll, useTransform } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

import {
  Mail,
  Rocket,
  CheckCircle2,
  ChevronDown,
  type LucideIcon,
  Plus,
} from "lucide-react";
import { NAVIGATION, NAV_COLOR_MAP, type NavColor } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { StatsSection } from "@/components/sections/stats-section";
import { STATS } from "@/data/stats";
import { SiteSearch } from "@/components/features/search/site-search";
import { FeatureCard } from "@/components/features/feature-card/feature-card";
import { QuickAccessSection } from "@/components/features/quick-access";
import { FullWidth, Container } from "@/components/layout/container";
import { HeroFlow } from "@/modules/hero-flow/HeroFlow";

function resolveIconClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"]?.icon ?? NAV_COLOR_MAP.slate.icon;
}

function resolveIconBgClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"]?.iconBg ?? NAV_COLOR_MAP.slate.iconBg;
}

function resolveCardBgClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"]?.bg ?? NAV_COLOR_MAP.slate.bg;
}

function resolveRingClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"]?.ring ?? NAV_COLOR_MAP.slate.ring;
}

function resolveHoverBgClass(color?: NavColor): string {
  return (
    NAV_COLOR_MAP[color ?? "slate"]?.iconHover ?? NAV_COLOR_MAP.slate.iconHover
  );
}

function resolveColorMap(color?: NavColor) {
  return {
    icon: resolveIconClass(color),
    iconBg: resolveIconBgClass(color),
    bg: resolveCardBgClass(color),
    ring: resolveRingClass(color),
    iconHover: resolveHoverBgClass(color),
  };
}

export function HomeClient() {
  const t = useTranslations("Home");
  const tSections = useTranslations("Menu.sections");
  const tItems = useTranslations("Menu.items");
  const tDesc = useTranslations("Menu.descriptions");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const { scrollY } = useScroll();
  const exploreOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  const heroFlowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroFlowProgress } = useScroll({
    target: heroFlowRef,
    offset: ["start start", "end start"],
  });
  const heroFlowOpacity = useTransform(heroFlowProgress, [0.4, 1], [1, 0]);

  const tabs = useMemo(
    () => [
      { id: "all", labelKey: "", icon: undefined as LucideIcon | undefined },
      ...NAVIGATION,
    ],
    [],
  );

  const visibleFeatures = useMemo(() => {
    if (activeTab === "all") return NAVIGATION.flatMap((g) => g.items);
    return NAVIGATION.find((g) => g.id === activeTab)?.items ?? [];
  }, [activeTab]);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <section
        id="hero"
        className="relative flex w-full flex-col bg-background"
      >
        {/* Centered Main Content Area taking full viewport height minus header overlap */}
        <div className="relative flex min-h-[100dvh] -mt-[64px] w-full flex-col items-center justify-center pt-[64px] pb-20 text-center">
          <Container>
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="relative mx-auto w-full flex flex-col items-center"
            >
              <div className="w-full max-w-2xl flex flex-col items-center">
                {/* Google-Inspired Badass Multicolored Logo */}
                <motion.div variants={fadeUp} className="mb-6 sm:mb-8 flex justify-center">
                  <Logo className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl" />
                </motion.div>

                {/* Google Search Bar */}
                <motion.div variants={fadeUp} className="w-full">
                  <SiteSearch
                    className="w-full"
                    placeholder={t("hero.searchPlaceholder")}
                    onOpenChange={setIsSearchOpen}
                    onOverviewClick={() => {
                      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  />
                </motion.div>
              </div>

              <div className="mt-7 sm:mt-9 w-full">
                <QuickAccessSection />
              </div>
            </motion.div>
          </Container>

          {/* Minimal Animated Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <motion.div
              style={{ opacity: exploreOpacity }}
              className="flex flex-col items-center text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer pointer-events-auto"
              onClick={() => {
                document.getElementById("hero-flow-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium mb-2">
                {isRtl ? "کشف کنید" : "Explore"}
              </span>
              <ChevronDown className="size-5 animate-bounce stroke-[1.5]" />
            </motion.div>
          </motion.div>
        </div>

        {/* The Animated Mesh/Globe below the fold */}
        <div className="w-full text-center">

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <FullWidth>
              <motion.div 
                ref={heroFlowRef}
                style={{ opacity: heroFlowOpacity }}
                id="hero-flow-section" 
                className="h-[100vh] w-full overflow-hidden scroll-mt-[64px]"
              >
                <HeroFlow />
              </motion.div>
            </FullWidth>
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative bg-muted/50 py-20 scroll-mt-6">
        <Container>
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="mb-10 text-center"
          >
            <motion.span variants={fadeUp} className="text-primary text-sm font-semibold tracking-wider uppercase inline-block">
              {t("features.eyebrow")}
            </motion.span>
            <motion.h2 variants={fadeUp} className="mt-2 text-3xl font-bold md:text-4xl">
              {t("features.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mx-auto mt-2 max-w-2xl">
              {t("features.subtitle")}
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-10 flex flex-wrap justify-center gap-2"
          >
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const label =
                tab.id === "all" ? t("features.all") : tSections(tab.labelKey);

              return (
                <motion.div key={tab.id} variants={fadeUp}>
                  <Button
                    variant={activeTab === tab.id ? "default" : "outline"}
                    onClick={() => setActiveTab(tab.id)}
                    className="gap-2"
                  >
                    {TabIcon && <TabIcon className="size-4" />}
                    {label}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-6"
          >
            {visibleFeatures.map((feature) => {
              const group = NAVIGATION.find((g) =>
                g.items.some((item) => item.href === feature.href),
              );

              const effectiveColor: NavColor = (feature.color ??
                group?.color ??
                "slate") as NavColor;

              const colorMap = resolveColorMap(effectiveColor);

              let description: string | undefined;
              try {
                description = tDesc(feature.labelKey);
              } catch {
                description = undefined;
              }

              return (
                <motion.div 
                  key={feature.href} 
                  variants={fadeUp} 
                  className="h-60 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]"
                >
                  <FeatureCard
                    href={feature.href}
                    icon={feature.icon}
                    title={tItems(feature.labelKey)}
                    description={description}
                    iconClassName={cn(colorMap.icon, colorMap.iconHover)}
                    iconBgClassName={colorMap.iconBg}
                    cardBgClassName={colorMap.bg}
                    borderClassName={colorMap.ring}
                    cta={t("features.explore")}
                    isRtl={isRtl}
                    className="h-full w-full"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </section>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
      >
        <StatsSection stats={STATS} />
      </motion.div>

      <section id="newsletter" className="py-20">
        <Container size="narrow" className="text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="bg-primary/10 mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl">
              <Mail className="text-primary size-9" />
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-3xl font-bold md:text-4xl">
              {t("newsletter.title")}
            </motion.h2>

            <motion.p variants={fadeUp} className="text-muted-foreground mt-2">
              {t("newsletter.subtitle")}
            </motion.p>

            <motion.div variants={fadeUp}>
              {submitted ? (
                <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-green-300 bg-green-50 p-4 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle2 className="size-5" />
                  {t("newsletter.success")}
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                >
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletter.placeholder")}
                    className="flex-1"
                  />
                  <Button type="submit" size="lg" className="gap-2">
                    {t("newsletter.subscribe")}
                    <Rocket className="size-4" />
                  </Button>
                </form>
              )}
            </motion.div>

            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 text-sm">
              {t("newsletter.disclaimer")}
            </motion.p>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
