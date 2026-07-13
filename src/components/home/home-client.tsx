"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Mail,
  Rocket,
  CheckCircle2,
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
import { QuickAccessCard } from "@/components/features/quick-access/quick-access";
import { useQuickAccess, QUICK_ACCESS_MAX } from "@/hooks/use-quick-access";
import { FullWidth, Container } from "@/components/layout/container";
import { HeroFlow } from "@/modules/hero-flow/HeroFlow";

function useReveal() {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 },
    );

    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
  };

  const isRevealed = (id: string) => revealed.has(id);

  return { register, isRevealed };
}

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
  const { register, isRevealed } = useReveal();

  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = useMemo(
    () => [
      { id: "all", labelKey: "", icon: undefined as LucideIcon | undefined },
      ...NAVIGATION,
    ],
    [],
  );

  const { items: quickAccessItems, hydrated } = useQuickAccess();

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
        ref={register("hero")}
        className="relative flex min-h-screen w-full flex-col bg-background"
      >
        <div className="w-full py-20 text-center">
          <Container>
            <div
              className={cn(
                "relative mx-auto mt-40 max-w-xl transition-all delay-200 duration-700",
                isRevealed("hero") ? "opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              <div
                className={cn(
                  "absolute inset-x-0 flex justify-center transition-all delay-100 duration-700",
                  isRevealed("hero")
                    ? "opacity-100"
                    : "translate-y-4 opacity-0",
                )}
                style={{
                  bottom: "calc(100% + 1.5rem)",
                  zIndex: isSearchOpen ? "var(--z-logo)" : "var(--z-base)",
                }}
              >
                <Logo className="text-4xl md:text-6xl" />
              </div>

              <SiteSearch
                className="mx-auto max-w-xl"
                onOpenChange={setIsSearchOpen}
              />
            </div>

            <div
              className={cn(
                "mt-20 transition-all delay-300 duration-700",
                isRevealed("hero") ? "opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              <div className="flex flex-wrap justify-center gap-6">
                {(hydrated
                  ? quickAccessItems
                  : Array(QUICK_ACCESS_MAX).fill(null)
                ).map((item, i) => {
                  if (!item) {
                    return (
                      <div
                        key={i}
                        className="h-30 w-30 animate-pulse rounded-2xl bg-muted/50"
                      />
                    );
                  }

                  const colorMap = resolveColorMap(item.color);

                  return (
                    <QuickAccessCard
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      iconBgClassName={colorMap.iconBg}
                      iconClassName={cn(colorMap.icon, colorMap.iconHover)}
                      cardBgClassName={colorMap.bg}
                      borderClassName={colorMap.ring}
                      title={tItems(item.labelKey)}
                    />
                  );
                })}

                <button
                  onClick={() => {}}
                  aria-label={t("quickAccess.customizeLabel")}
                  className={cn(
                    "group flex h-30 w-30 cursor-pointer flex-col items-center justify-center gap-3.5 rounded-2xl text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full border border-dashed border-current transition-transform duration-200 group-hover:scale-100",
                    )}
                  >
                    <Plus className="size-5" />
                  </span>
                  <span className="text-sm font-normal"></span>
                </button>
              </div>
            </div>
          </Container>
          <FullWidth>
            <div className="h-162.5 w-full overflow-hidden">
              <HeroFlow />
            </div>
          </FullWidth>
        </div>
      </section>

      <section className="relative bg-muted/50 py-20">
        <Container>
          <div className="mb-10 text-center">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              {t("features.eyebrow")}
            </span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              {t("features.title")}
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-2xl">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const label =
                tab.id === "all" ? t("features.all") : tSections(tab.labelKey);

              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2"
                >
                  {TabIcon && <TabIcon className="size-4" />}
                  {label}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-6">
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
                <FeatureCard
                  key={feature.href}
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
                  className="h-60 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]"
                />
              );
            })}
          </div>
        </Container>
      </section>

      <StatsSection stats={STATS} />

      <section id="newsletter" ref={register("newsletter")} className="py-20">
        <Container size="narrow" className="text-center">
          <div className="bg-primary/10 mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl">
            <Mail className="text-primary size-9" />
          </div>

          <h2 className="text-3xl font-bold md:text-4xl">
            {t("newsletter.title")}
          </h2>

          <p className="text-muted-foreground mt-2">
            {t("newsletter.subtitle")}
          </p>

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

          <p className="text-muted-foreground mt-4 text-sm">
            {t("newsletter.disclaimer")}
          </p>
        </Container>
      </section>
    </>
  );
}
