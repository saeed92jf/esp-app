"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  Layers,
  Kanban,
  Video,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { GoogleSearchBox } from "@/components/features/search/GoogleSearchBox";
import { SearchFooter } from "./search-footer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { HelpPopover } from "@/components/layout/help-popover";
import { AppsPopover } from "@/components/layout/apps-popover";
import { DashboardAvatar } from "@/modules/dashboard/components/dashboard-avatar";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { cn } from "@/lib/utils";
import { useUniversalSearch } from "../hooks/use-universal-search";
import type { SearchCategory, SearchItem } from "../types/search.types";

const START_OFFSET_CLASS = "sm:w-[185px] md:w-[200px] shrink-0";

export function SearchResultsClient() {
  const t = useTranslations("Search");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const urlQuery = searchParams.get("q") || "";
  const urlCategory = (searchParams.get("category") as SearchCategory) || "all";

  const {
    query,
    setQuery,
    category,
    setCategory,
    response,
    isSearching,
  } = useUniversalSearch({
    initialQuery: urlQuery,
    initialCategory: urlCategory,
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync state if URL changes externally
  useEffect(() => {
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  const handleSearchSubmit = (searchQuery?: string) => {
    const trimmed = searchQuery?.trim() || query.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set("q", trimmed);
      if (category !== "all") params.set("category", category);
      router.push(`/search?${params.toString()}`);
    });
  };

  const handleCategoryChange = (cat: SearchCategory) => {
    setCategory(cat);
    startTransition(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (cat !== "all") params.set("category", cat);
      router.push(`/search?${params.toString()}`);
    });
  };

  const handleRelatedClick = (term: string) => {
    setQuery(term);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set("q", term);
      if (category !== "all") params.set("category", category);
      router.push(`/search?${params.toString()}`);
    });
  };

  const categoryTabs: { id: SearchCategory; label: string; icon: LucideIcon }[] = [
    { id: "all", label: t("tabs.all"), icon: SlidersHorizontal },
    { id: "modules", label: t("tabs.modules"), icon: Layers },
    { id: "tasks", label: t("tabs.tasks"), icon: Kanban },
    { id: "videos", label: t("tabs.videos"), icon: Video },
    { id: "dictionary", label: t("tabs.dictionary"), icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#121212] text-foreground transition-colors selection:bg-primary/20">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HEADER (Borderless at top, line attaches upon scrolling)  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-40 h-[64px] bg-background/95 dark:bg-[#171717]/95 backdrop-blur-md transition-colors duration-150",
          isScrolled ? "border-b border-border/60" : "border-b border-transparent"
        )}
      >
        <div className="w-full h-full px-2.5 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-6">
          {/* Start Section: Positioned Logo + Search Box */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Logo positioned with exact offset as if SideMenu button were present */}
            <div className={cn("flex items-center", START_OFFSET_CLASS)}>
              {/* Invisible spacer matching SideMenu button size + gap */}
              <div className="w-[32px] sm:w-[36px] me-1.5 sm:me-2.5 shrink-0" aria-hidden="true" />
              <Link
                href="/"
                dir="ltr"
                className="flex items-center select-none outline-none cursor-pointer transition-opacity duration-150 hover:opacity-90 shrink-0"
              >
                <Logo compact short className="text-[13px] sm:text-[15px]" />
              </Link>
            </div>

            {/* Header Search Box: Starts right after logo with slight distance, identical capabilities to hero home */}
            <div className="flex-1 max-w-2xl min-w-0">
              <GoogleSearchBox
                compact
                initialQuery={query}
                onSubmitSearch={handleSearchSubmit}
                placeholder={t("placeholder")}
                className="w-full max-w-2xl"
              />
            </div>
          </div>

          {/* End Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 origin-right rtl:origin-left">
            <ThemeToggle />
            <LocaleSwitcher />
            {user ? (
              <>
                <HelpPopover
                  triggerClassName={HEADER_ICON_BUTTON_CLASS}
                  iconClassName={HEADER_ICON_CLASS}
                />
                <AppsPopover
                  triggerClassName={cn(HEADER_ICON_BUTTON_CLASS, "hidden sm:inline-flex")}
                  iconClassName={HEADER_ICON_CLASS}
                />
                <DashboardAvatar />
              </>
            ) : (
              <Button asChild size="sm" variant="outline" className="rounded-full text-xs h-8 px-3">
                <Link href="/login">{tAuth("login")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. CATEGORY TABS (With top margin, aligned with Search Box)  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="mt-2.5 sm:mt-3.5 border-b border-border/60 bg-background/80 dark:bg-[#141414]/80 backdrop-blur-sm">
        <div className="w-full px-2.5 sm:px-6">
          <div className="flex items-center">
            {/* Spacer to align categories vertically with search box */}
            <div className={cn("hidden sm:block", START_OFFSET_CLASS)} aria-hidden="true" />

            <nav
              aria-label="Search Categories"
              className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar rtl:space-x-reverse"
            >
              {categoryTabs.map((tab) => {
                const isActive = category === tab.id;
                const count = response.categoryCounts[tab.id] ?? 0;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleCategoryChange(tab.id)}
                    className={cn(
                      "group relative flex shrink-0 items-center gap-1.5 py-2.5 px-3 text-[13px] sm:text-[13.5px] font-medium transition-colors cursor-pointer select-none",
                      isActive
                        ? "text-[#1a73e8] dark:text-[#8ab4f8]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 stroke-[2]" />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "ms-0.5 rounded-full px-1.5 py-0.2 text-[11px] tabular-nums font-semibold fa-num transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary dark:text-[#8ab4f8]"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                        )}
                      >
                        {count}
                      </span>
                    )}

                    {/* Google Blue Underline Indicator */}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-t-full bg-[#1a73e8] dark:bg-[#8ab4f8]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. RESULTS AREA (Vertically aligned with Search Box)        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <main className="w-full flex-1 px-2.5 sm:px-6 py-5">
        <div className="flex items-start">
          {/* Spacer to align results vertically with search box */}
          <div className={cn("hidden sm:block", START_OFFSET_CLASS)} aria-hidden="true" />

          <div className="w-full max-w-3xl min-w-0">
            {/* Search Stats Line (Google Style) */}
            <div className="mb-4 text-[13px] text-[#70757a] dark:text-[#9aa0a6] select-none fa-num">
              {isSearching ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary animate-ping" />
                  {isRtl ? "در حال جستجو..." : "Searching..."}
                </span>
              ) : response.query.trim().length > 0 ? (
                t("resultsStats", {
                  count: response.total,
                  time: response.executionTime,
                })
              ) : null}
            </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* RESULTS LIST                                                 */}
          {/* ──────────────────────────────────────────────────────────── */}
          {response.results.length > 0 ? (
            <div className="space-y-7 w-full">
              {response.results.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  query={response.query}
                  locale={locale}
                  isRtl={isRtl}
                  t={t}
                />
              ))}

              {/* Related Searches Pills (Like Google) */}
              {response.relatedSearches.length > 0 && (
                <div className="mt-10 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-xs w-full max-w-3xl">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="size-4 text-primary" />
                    <span>{t("relatedSearches")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {response.relatedSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleRelatedClick(term)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-foreground/90 transition-all hover:border-primary/60 hover:bg-primary/5 hover:text-primary cursor-pointer shadow-xs active:scale-98"
                      >
                        <Search className="size-3 text-muted-foreground" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ──────────────────────────────────────────────────────────── */
            /* EMPTY STATE: NO RESULTS (Google Style)                      */
            /* ──────────────────────────────────────────────────────────── */
            !isSearching && response.query.trim().length > 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-border/90 bg-muted/20 p-6 sm:p-8 w-full max-w-3xl">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Search className="size-5" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-base font-semibold text-foreground">
                      {t("noResultsTitle", { query: response.query })}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("noResultsSuggestions")}
                    </p>
                    <ul className="list-disc space-y-1.5 ps-5 text-sm text-muted-foreground/90">
                      <li>{t("suggestion1")}</li>
                      <li>{t("suggestion2")}</li>
                      <li>{t("suggestion3")}</li>
                      <li>{t("suggestion4")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>

    {/* ──────────────────────────────────────────────────────────── */}
    {/* 4. FOOTER (Non-fixed, IP Location & Useful Links)            */}
    {/* ──────────────────────────────────────────────────────────── */}
    <SearchFooter startOffsetClass={START_OFFSET_CLASS} />
  </div>
);
}

/**
 * Individual Google Search Result Card
 */
function SearchResultCard({
  item,
  query,
  locale,
  isRtl,
  t,
}: {
  item: SearchItem;
  query: string;
  locale: string;
  isRtl: boolean;
  t: (key: string) => string;
}) {
  const displayTitle = locale === "en" && item.titleEn ? item.titleEn : item.title;
  const displaySnippet = locale === "en" && item.snippetEn ? item.snippetEn : item.snippet;
  const displayBreadcrumbs =
    locale === "en" && item.breadcrumbsEn ? item.breadcrumbsEn : item.breadcrumbs;
  const displayBadge = locale === "en" && item.badgeEn ? item.badgeEn : item.badge;

  return (
    <article className="group/card flex flex-col w-full">
      {/* 1. Breadcrumbs / URL Source Line */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-[#70757a] dark:text-[#9aa0a6] mb-1">
        <span className="size-2 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
        <span className="font-medium text-foreground/80">esp.app</span>
        {displayBreadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="opacity-50">›</span>
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{crumb}</span>
          </React.Fragment>
        ))}
      </div>

      {/* 2. Google Blue Link Title */}
      <h3 className="text-[17px] sm:text-[19px] font-medium leading-snug">
        <Link
          href={item.href}
          className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline focus:outline-none focus:underline"
        >
          <HighlightMatch
            text={displayTitle}
            query={query}
            highlightClassName="bg-primary/10 dark:bg-primary/20 text-[#1a0dab] dark:text-[#8ab4f8] font-bold px-0.5 rounded-xs"
          />
        </Link>
      </h3>

      {/* 3. Snippet / Excerpt */}
      <p className="mt-1 text-[13.5px] sm:text-[14px] leading-relaxed text-[#4d5156] dark:text-[#bdc1c6] max-w-4xl">
        <HighlightMatch
          text={displaySnippet}
          query={query}
          highlightClassName="font-semibold text-foreground dark:text-white bg-black/5 dark:bg-white/10 px-0.5 rounded-xs"
        />
      </p>

      {/* 4. Badges & Meta Chips */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {displayBadge && (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary dark:text-[#8ab4f8]">
            {displayBadge}
          </span>
        )}

        {item.metadata?.standard && (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t("standard")}: {item.metadata.standard}
          </span>
        )}

        {item.metadata?.duration && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            {item.metadata.duration}
          </span>
        )}

        {item.metadata?.status && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {item.metadata.status}
          </span>
        )}

        <Link
          href={item.href}
          className="ms-auto inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline group-hover/card:text-primary/90"
        >
          <span>
            {item.category === "modules"
              ? t("openModule")
              : item.category === "videos"
              ? t("openVideo")
              : item.category === "tasks"
              ? t("openProject")
              : t("openTerm")}
          </span>
          {isRtl ? (
            <ArrowLeft className="size-3" />
          ) : (
            <ArrowRight className="size-3" />
          )}
        </Link>
      </div>
    </article>
  );
}
