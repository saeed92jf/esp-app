'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Rocket, CheckCircle2, type LucideIcon } from 'lucide-react';
import { NAVIGATION } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';
import { StatsSection } from '@/components/sections/stats-section';
import { STATS } from '@/data/stats';
import { SiteSearch } from '@/components/features/search/site-search';
import { FeatureCard } from '@/components/shared/feature-card';

// ---------------------------------------------------------------------------
// Local hook: reveal a section once it scrolls into the viewport (one-way).
// A single IntersectionObserver is shared across all registered sections.
// ---------------------------------------------------------------------------
function useReveal() {
  // Ids of sections that have entered the viewport at least once.
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  // Map of section id -> DOM element, populated via the `register` ref.
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

// Varied gradient palette for feature icon badges. Rotated by index so
// adjacent cards always differ. Each entry pairs an icon color, a hover ring
// tint, and a matching top-bar color consumed by FeatureCard.
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
  const tDesc = useTranslations('Menu.descriptions'); // per-item descriptions
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
          {/* Brand logo — sits above the search box, scales down on mobile. */}
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
            <SiteSearch className="mx-auto max-w-xl" />
          </div>

          {/* Quick access cards sourced from the navigation config. */}
          <div
            className={cn(
              'mt-12 grid grid-cols-2 gap-4 transition-all delay-300 duration-700 md:grid-cols-3 lg:grid-cols-6',
              isRevealed('hero') ? 'opacity-100' : 'translate-y-4 opacity-0',
            )}
          >
            {quickAccess.map((item) => (
              <FeatureCard
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={tItems(item.labelKey)}
                badge={t('quickAccess.loginRequired')}
                isRtl={isRtl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- STATS ---------------------------- */}
      <StatsSection stats={STATS} />

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

          {/* Category tabs. */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              // "all" uses a Home-scoped label; groups use Menu.sections.
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
              flex + justify-center keeps an incomplete last row centered
              (grid-cols-* would left-align leftovers). Item widths mirror the
              1/2/3/4 column layout, with the gap subtracted via calc to keep
              the gap-6 (1.5rem) spacing intact. */}
          <div className="flex flex-wrap justify-center gap-6">
            {visibleFeatures.map((feature, index) => {
              const color = FEATURE_COLORS[index % FEATURE_COLORS.length];
              return (
                <FeatureCard
                  key={feature.href}
                  href={feature.href}
                  icon={feature.icon}
                  title={tItems(feature.labelKey)}
                  // Render description only when a translation exists.
                  description={
                    tDesc.has(feature.labelKey)
                      ? tDesc(feature.labelKey)
                      : undefined
                  }
                  cta={t('features.explore')}
                  iconClassName={color.icon}
                  barClassName={color.bar}
                  ringClassName={color.ring}
                  isRtl={isRtl}
                  className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]"
                />
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
