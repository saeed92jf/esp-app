'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowRight,
  Mail,
  Rocket,
  CheckCircle2,
  Search,
  Users,
  Building2,
  Star,
  Headset,
  type LucideIcon,
} from 'lucide-react';
import { NAVIGATION } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';
import { StatsSection } from '@/components/sections/stats-section';
import { STATS } from '@/data/stats';

// ---------------------------------------------------------------------------
// Local hook: reveal a section once it scrolls into the viewport (one-way).
// Uses a single IntersectionObserver shared across all registered sections.
// ---------------------------------------------------------------------------
function useReveal() {
  // Holds ids of sections that have entered the viewport at least once.
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  // Map of section id -> DOM element, populated via the `register` callback ref.
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

    // Observe all currently registered section elements.
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
// Local hook: animated number count-up using requestAnimationFrame.
// `active` gates the animation so it only runs when the section is visible.
// ---------------------------------------------------------------------------
function useCountUp(target: number, active: boolean, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();

    // Animate with an ease-out cubic curve for a smooth finish.
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

// Sharp, varied gradient palette for feature icon badges. Rotated by index so
// adjacent cards always differ. Each entry defines a matching shadow tint and a
// soft background glow revealed on hover.
const FEATURE_COLORS = [
  {
    icon: 'text-blue-500',
    ring: 'group-hover:ring-blue-500/40',
    bar: 'bg-blue-500',
  },
  {
    icon: 'text-emerald-500',
    ring: 'group-hover:ring-emerald-500/40',
    bar: 'bg-emerald-500',
  },
  {
    icon: 'text-violet-500',
    ring: 'group-hover:ring-violet-500/40',
    bar: 'bg-violet-500',
  },
  {
    icon: 'text-amber-500',
    ring: 'group-hover:ring-amber-500/40',
    bar: 'bg-amber-500',
  },
  {
    icon: 'text-rose-500',
    ring: 'group-hover:ring-rose-500/40',
    bar: 'bg-rose-500',
  },
  {
    icon: 'text-cyan-500',
    ring: 'group-hover:ring-cyan-500/40',
    bar: 'bg-cyan-500',
  },
] as const;

export function HomeClient() {
  const t = useTranslations('Home'); // page-scoped translator
  const tSections = useTranslations('Menu.sections'); // group labels
  const tItems = useTranslations('Menu.items'); // item labels
  const tDesc = useTranslations('Menu.descriptions'); // optional per-item descriptions
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const { register, isRevealed } = useReveal();

  // Active feature tab; "all" shows every navigation item.
  const [activeTab, setActiveTab] = useState<string>('all');

  // Tabs = a synthetic "all" tab followed by every navigation group.
  const tabs = useMemo(
    () => [
      { id: 'all', labelKey: '', icon: undefined as LucideIcon | undefined },
      ...NAVIGATION,
    ],
    [],
  );

  // Quick access = the first item of each group, capped at 6 cards.
  const quickAccess = useMemo(
    () => NAVIGATION.flatMap((g) => g.items.slice(0, 1)).slice(0, 6),
    [],
  );

  // Items shown in the features grid for the currently active tab.
  const visibleFeatures = useMemo(() => {
    if (activeTab === 'all') return NAVIGATION.flatMap((g) => g.items);
    return NAVIGATION.find((g) => g.id === activeTab)?.items ?? [];
  }, [activeTab]);

  // Newsletter form local state.
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Fake submit: show a success message for 3s, then reset.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      {/* ----------------------------- HERO ----------------------------- */}
      <section
        id="hero"
        ref={register('hero')}
        className="relative flex min-h-[80vh] items-center justify-center"
      >
        <div className="container py-20 text-center">
          {/* Brand logo — sits above the search box, scales down on mobile */}
          <div
            className={cn(
              'mb-8 flex justify-center transition-all delay-100 duration-700',
              isRevealed('hero') ? 'opacity-100' : 'translate-y-4 opacity-0',
            )}
          >
            <Logo className="text-4xl md:text-6xl" />
          </div>

          <div
            className={cn(
              'relative mx-auto mt-10 max-w-xl transition-all delay-200 duration-700',
              isRevealed('hero') ? 'opacity-100' : 'translate-y-4 opacity-0',
            )}
          >
            <Search className="text-muted-foreground pointer-events-none absolute inset-s-3 top-1/2 size-5 -translate-y-1/2" />
            <Input
              className="h-12 ps-11"
              placeholder={t('hero.searchPlaceholder')}
              aria-label={t('hero.searchPlaceholder')}
            />
          </div>

          {/* Quick access cards sourced from the navigation config */}
          <div
            className={cn(
              'mt-12 grid grid-cols-2 gap-4 transition-all delay-300 duration-700 md:grid-cols-3 lg:grid-cols-6',
              isRevealed('hero') ? 'opacity-100' : 'translate-y-4 opacity-0',
            )}
          >
            {quickAccess.map((item) => {
              const Icon = item.icon; // optional per NavItem type
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="group hover:border-primary h-full transition hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-2 p-4">
                      {Icon && <Icon className="text-primary size-6" />}
                      <span className="text-sm font-medium">
                        {tItems(item.labelKey)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {t('quickAccess.loginRequired')}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/* ----------------------------- STATS ---------------------------- */}
      <StatsSection stats={STATS} />;
      {/* ---------------------------- FEATURES -------------------------- */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              {t('features.eyebrow')}
            </span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-2xl">
              {t('features.subtitle')}
            </p>
          </div>

          {/* Category tabs */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              // "all" tab uses a Home-scoped label; groups use Menu.sections.
              const label =
                tab.id === 'all' ? t('features.all') : tSections(tab.labelKey);
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2"
                >
                  {TabIcon && <TabIcon className="size-4" />}
                  {label}
                </Button>
              );
            })}
          </div>

          {/* Features grid:
    flex + justify-center keeps an incomplete last row centered (grid-cols-*
    would left-align leftovers). Item widths mirror the 1/2/3/4 column layout,
    with the gap subtracted via calc to preserve gap-6 (1.5rem) spacing. */}
          <div className="flex flex-wrap justify-center gap-6">
            {visibleFeatures.map((feature, index) => {
              const Icon = feature.icon; // optional per NavItem type
              const color = FEATURE_COLORS[index % FEATURE_COLORS.length];
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]"
                >
                  <Card
                    className={cn(
                      'border-border/60 relative h-full overflow-hidden rounded-xl text-center',
                      // Minimal + fast hover: short duration, GPU transform, soft easing.
                      // Only transform/border/shadow animate, so it stays crisp and cheap.
                      'transform-gpu transition-[transform,border-color,box-shadow] duration-200 ease-out will-change-transform',
                      'hover:border-primary/50 hover:shadow-lg',
                      // Respect reduced-motion: disable lift for users who opt out
                      'motion-reduce:transform-none motion-reduce:transition-none',
                    )}
                  >
                    {/* Engineering accent: a thin top bar that wipes in from the
              start edge on hover. origin flips for RTL so it grows correctly. */}
                    <span
                      className={cn(
                        'pointer-events-none absolute inset-x-0 top-0 h-0.5 scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100',
                        isRtl ? 'origin-right' : 'origin-left',
                        color.bar,
                      )}
                    />

                    <CardContent className="relative flex flex-col items-center gap-3 p-6">
                      {/* Fixed neutral badge; only the icon carries color.
                Subtle scale + ring on hover for a tactile, precise feel. */}
                      <span
                        className={cn(
                          'bg-muted ring-border/50 flex size-14 items-center justify-center rounded-xl ring-1 transition-all duration-200 ease-out',
                          'group-hover:scale-105 group-hover:ring-2',
                          'motion-reduce:transform-none motion-reduce:transition-none',
                          color.ring,
                        )}
                      >
                        {Icon && (
                          <Icon
                            className={cn('size-7', color.icon)}
                            strokeWidth={2}
                          />
                        )}
                      </span>

                      {/* Smaller, balanced title */}
                      <h3 className="text-base leading-tight font-semibold">
                        {tItems(feature.labelKey)}
                      </h3>

                      {/* Optional description — rendered only if a translation exists */}
                      {tDesc.has(feature.labelKey) && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {tDesc(feature.labelKey)}
                        </p>
                      )}

                      {/* CTA hint fades in on hover (opacity only = minimal + smooth) */}
                      <span className="text-primary mt-1 inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
                        {t('features.explore')}
                        <ArrowRight
                          className={cn('size-4', isRtl && 'rotate-180')}
                        />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/* --------------------------- NEWSLETTER ------------------------- */}
      <section id="newsletter" ref={register('newsletter')} className="py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-primary/10 mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl">
            <Mail className="text-primary size-9" />
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">
            {t('newsletter.title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t('newsletter.subtitle')}
          </p>

          {submitted ? (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-green-300 bg-green-50 p-4 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="size-5" />
              {t('newsletter.success')}
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
                placeholder={t('newsletter.placeholder')}
                className="h-12 flex-1"
              />
              <Button type="submit" size="lg" className="gap-2">
                {t('newsletter.subscribe')}
                <Rocket className="size-4" />
              </Button>
            </form>
          )}
          <p className="text-muted-foreground mt-4 text-sm">
            {t('newsletter.disclaimer')}
          </p>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Presentational component for a single animated stat tile.
// ---------------------------------------------------------------------------
function StatItem({
  icon: Icon,
  value,
  suffix,
  label,
  active,
  delay,
}: {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  active: boolean;
  delay: number;
}) {
  const count = useCountUp(value, active);
  return (
    <Card
      className={cn(
        'transition-all duration-700',
        active ? 'opacity-100' : 'translate-y-4 opacity-0',
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="flex flex-col items-center gap-2 p-6">
        <Icon className="text-primary size-7" />
        <span className="text-3xl font-bold">
          {count.toLocaleString()}
          {suffix}
        </span>
        <span className="text-muted-foreground text-sm">{label}</span>
      </CardContent>
    </Card>
  );
}
