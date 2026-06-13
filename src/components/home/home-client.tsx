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
import { QuickAccessCustomizer } from "@/components/features/quick-access/quick-access-customizer";

// ---------------------------------------------------------------------------
// Local hook: reveal a section once it scrolls into the viewport (one-way).
// A single IntersectionObserver is shared across all registered sections.
// ---------------------------------------------------------------------------
function useReveal() {
  // IDs of sections that have entered the viewport at least once.
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  // Map of section id -> DOM element, populated via the `register` callback.
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Mark every intersecting section as revealed (never reverts).
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

  // Callback ref factory: stores the element under the given id.
  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
  };

  // Whether a given section has been revealed yet.
  const isRevealed = (id: string) => revealed.has(id);

  return { register, isRevealed };
}

// ---------------------------------------------------------------------------
// Helpers: resolve color classes from NAV_COLOR_MAP for a given NavColor token.
// Falls back to "slate" if the item carries no color.
// ---------------------------------------------------------------------------

/** Returns icon text-color class for a nav item color token. */
function resolveIconClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"].icon;
}

/** Returns icon background class for a nav item color token. */
function resolveIconBgClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"].bg;
}

/** Returns card background tint class for a nav item color token. */
function resolveCardBgClass(color?: NavColor): string {
  // Re-use the same bg token; the card tint is intentionally subtle.
  return NAV_COLOR_MAP[color ?? "slate"].bg;
}

/** Returns hover-ring class for a nav item color token. */
function resolveRingClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"].ring;
}

/** Returns hover-bg class for a nav item color token (QuickAccessCard). */
function resolveHoverBgClass(color?: NavColor): string {
  return NAV_COLOR_MAP[color ?? "slate"].hover;
}

function resolveColorMap(color?: NavColor) {
  return NAV_COLOR_MAP[color ?? "slate"] ?? NAV_COLOR_MAP["slate"];
}

// ---------------------------------------------------------------------------

export function HomeClient() {
  const t = useTranslations("Home"); // page-scoped translator
  const tSections = useTranslations("Menu.sections"); // group labels
  const tItems = useTranslations("Menu.items"); // item labels
  const tDesc = useTranslations("Menu.descriptions"); // per-item descriptions
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { register, isRevealed } = useReveal();

  // Active feature tab; "all" shows every navigation item.
  const [activeTab, setActiveTab] = useState<string>("all");

  // Tabs = a synthetic "all" entry followed by every navigation group.
  const tabs = useMemo(
    () => [
      { id: "all", labelKey: "", icon: undefined as LucideIcon | undefined },
      ...NAVIGATION,
    ],
    [],
  );

  // Quick access hook: persisted, user-editable set of pinned nav items.
  const {
    items: quickAccessItems,
    selectedHrefs,
    toggle,
    reset,
    isFull,
    isSelected,
    hydrated,
  } = useQuickAccess();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Items shown in the features grid for the currently active tab.
  const visibleFeatures = useMemo(() => {
    if (activeTab === "all") return NAVIGATION.flatMap((g) => g.items);
    return NAVIGATION.find((g) => g.id === activeTab)?.items ?? [];
  }, [activeTab]);

  // Newsletter form local state.
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Fake submit: show a success message for 3s, then reset.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="hero"
        ref={register("hero")}
        className="relative flex min-h-[80vh] items-center justify-center"
      >
        <div className="container py-20 text-center">
          {/* Search wrapper — Logo is absolutely positioned above it */}
          <div
            className={cn(
              "relative mx-auto mt-10 max-w-xl transition-all delay-200 duration-700",
              isRevealed("hero") ? "opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            {/* Logo — centered above the search box */}
            <div
              className={cn(
                "absolute inset-x-0 flex justify-center transition-all delay-100 duration-700",
                isRevealed("hero") ? "opacity-100" : "translate-y-4 opacity-0",
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

          {/* ---- Quick Access row ---------------------------------------- */}
          <div
            className={cn(
              "mt-20 transition-all delay-300 duration-700",
              isRevealed("hero") ? "opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <div className="flex justify-center">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
                {/*
                 * Pinned cards — render QuickAccessCard (flat, borderless).
                 * Show skeleton placeholders while the hook is not yet hydrated
                 * from localStorage to avoid layout shift.
                 */}
                {(hydrated
                  ? quickAccessItems
                  : Array(QUICK_ACCESS_MAX).fill(null)
                ).map((item, i) =>
                  item ? (
                    <QuickAccessCard
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={tItems(item.labelKey)}
                      iconClassName={resolveIconClass(item.color)}
                      iconBgClassName={resolveIconBgClass(item.color)}
                      hoverBgClassName={resolveHoverBgClass(item.color)}
                      className="h-40"
                    />
                  ) : (
                    // Skeleton placeholder during SSR/hydration
                    <div
                      key={i}
                      className="bg-muted/50 h-40 w-full animate-pulse rounded-2xl"
                    />
                  ),
                )}

                {/* Customize / Add button */}
                <button
                  onClick={() => setIsCustomizerOpen(true)}
                  aria-label={t("quickAccess.customizeLabel")}
                  className={cn(
                    "group flex h-40 w-full flex-col items-center justify-center gap-2",
                    "rounded-2xl border-2 border-dashed border-border/50",
                    "text-muted-foreground transition-all duration-200",
                    "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                    "cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2 border-dashed",
                      "border-current transition-transform duration-200",
                      "group-hover:scale-110",
                    )}
                  >
                    <Plus className="size-4" />
                  </span>
                  <span className="text-xs font-medium">
                    {t("quickAccess.customize")}
                  </span>
                </button>
              </div>
            </div>

            {/* Customizer dialog */}
            <QuickAccessCustomizer
              isOpen={isCustomizerOpen}
              onClose={() => setIsCustomizerOpen(false)}
              isSelected={isSelected}
              isFull={isFull}
              onToggle={toggle}
              onReset={reset}
              selectedCount={selectedHrefs.length}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURES                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-muted/50 relative py-20">
        <div className="container">
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

          {/* Category filter tabs */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              // "all" uses a Home-scoped label; groups use Menu.sections.
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

          {/*
           * Features grid:
           * flex + justify-center keeps an incomplete last row centered
           * instead of left-aligning leftovers like CSS grid would.
           * Item widths mirror a 1/2/3/4 column breakpoint layout with
           * gap-6 (1.5rem) subtracted via calc to keep spacing consistent.
           *
           * Color classes are resolved from NAV_COLOR_MAP using the item's
           * own color token, falling back to the group's color if absent.
           */}
          <div className="flex flex-wrap justify-center gap-6">
            {visibleFeatures.map((feature) => {
              // Resolve effective color: item-level > group-level > "slate"
              const group = NAVIGATION.find((g) =>
                g.items.some((item) => item.href === feature.href),
              );

              // Safely resolve color — never falls outside NAV_COLOR_MAP keys
              const effectiveColor: NavColor = (feature.color ??
                group?.color ??
                "slate") as NavColor;
              const colorMap = resolveColorMap(effectiveColor);

              // Safe description resolution — tDesc.has() does NOT exist in next-intl.
              // Use try/catch instead to handle missing keys gracefully.
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
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* STATS                                                                */}
      {/* ------------------------------------------------------------------ */}
      <StatsSection stats={STATS} />

      {/* ------------------------------------------------------------------ */}
      {/* NEWSLETTER                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="newsletter" ref={register("newsletter")} className="py-20">
        <div className="container mx-auto max-w-2xl text-center">
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
        </div>
      </section>
    </>
  );
}
