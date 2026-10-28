"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { GoogleSearchBox } from "@/components/features/search/GoogleSearchBox";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { HelpPopover } from "@/components/layout/help-popover";
import { NotificationsPopover } from "@/modules/dashboard/components/notifications/notifications-popover";
import { AppsPopover } from "@/components/layout/apps-popover";
import { DashboardAvatar } from "@/modules/dashboard/components/dashboard-avatar";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { cn } from "@/lib/utils";
import { SearchEmptyState } from "./search-empty-state";
import { SearchFooter } from "./search-footer";
import { useUniversalSearch } from "../hooks/use-universal-search";
import type { SearchCategory, SearchItem } from "../types/search.types";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";

const START_OFFSET_CLASS = "sm:w-[220px] md:w-[240px] shrink-0";

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

  const [, startTransition] = useTransition();

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

  const [isAdvancedMenuOpen, setIsAdvancedMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"most_relevant" | "newest" | "oldest">("most_relevant");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  const categoryTabs: { id: SearchCategory; label: string }[] = [
    { id: "all", label: t("tabs.all") },
    { id: "videos", label: t("tabs.videos") },
    { id: "projects", label: t("tabs.projects") },
    { id: "tasks", label: t("tabs.tasks") },
  ];

  const moduleOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "all", label: t("filterModule.allModules") },
      { value: "esp-flow", label: "ESP-Flow (محاسبات فرایندی)" },
      { value: "projects", label: isRtl ? "مدیریت پروژه‌ها (VDIS)" : "Projects Management (VDIS)" },
      { value: "tasks", label: isRtl ? "مدیریت تسک‌ها و وظایف" : "Tasks & Kanban Management" },
      { value: "dictionary", label: isRtl ? "واژه‌نامه تخصصی مهندسی" : "Engineering Dictionary" },
      { value: "did-you-know", label: isRtl ? "دانستنی‌های علمی" : "Did You Know" },
      { value: "aparat", label: isRtl ? "ویدیوها و آموزش‌ها" : "Video Tutorials" },
      { value: "dashboard", label: isRtl ? "داشبورد مرکزی" : "Central Dashboard" },
      { value: "admin", label: isRtl ? "پنل ادمین و سیستم" : "Admin Panel" },
    ],
    [isRtl, t]
  );

  const displayedResults = useMemo<SearchItem[]>(() => {
    let list = [...response.results];

    // Module filter from Combobox
    if (selectedModule && selectedModule !== "all") {
      list = list.filter((item) => {
        if (selectedModule === "esp-flow") return item.id.includes("esp-flow") || item.href.includes("ESP-Flow");
        if (selectedModule === "projects") return item.category === "projects" || item.id.startsWith("proj-") || item.href.includes("/projects");
        if (selectedModule === "tasks") return item.category === "tasks" || item.id.startsWith("task-") || item.href.includes("/tasks");
        if (selectedModule === "dictionary") return item.category === "dictionary" || item.href.includes("/dictionary");
        if (selectedModule === "did-you-know") return item.category === "didYouKnow" || item.href.includes("/did-you-know");
        if (selectedModule === "aparat") return item.category === "videos" || item.href.includes("/aparat");
        if (selectedModule === "dashboard") return item.id.includes("dashboard") || item.href.includes("/dashboard");
        if (selectedModule === "admin") return item.id.includes("admin") || item.href.includes("/admin");
        return true;
      });
    }

    // Sorting: most_relevant, newest, oldest
    if (sortBy === "newest") {
      list.sort((a, b) => {
        const dateA = a.metadata?.date || "";
        const dateB = b.metadata?.date || "";
        if (dateA && dateB) return dateB.localeCompare(dateA);
        if (dateA) return -1;
        if (dateB) return 1;
        return (b.score || 0) - (a.score || 0);
      });
    } else if (sortBy === "oldest") {
      list.sort((a, b) => {
        const dateA = a.metadata?.date || "";
        const dateB = b.metadata?.date || "";
        if (dateA && dateB) return dateA.localeCompare(dateB);
        if (dateA) return 1;
        if (dateB) return -1;
        return (a.score || 0) - (b.score || 0);
      });
    }

    return list;
  }, [response.results, selectedModule, sortBy]);

  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Reset pagination when query, category or filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [response.query, category, sortBy, selectedModule]);

  const paginatedResults = useMemo(() => {
    return displayedResults.slice(0, visibleCount);
  }, [displayedResults, visibleCount]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#121212] text-foreground transition-colors selection:bg-primary/20">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HEADER (Borderless at top, line attaches upon scrolling)  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full h-[var(--header-height)] min-h-[var(--header-height)] max-h-[var(--header-height)] bg-background/95 dark:bg-[#121212]/95 backdrop-blur-md border-none box-border transition-colors duration-150"
        )}
      >
        <div className="w-full h-full px-2.5 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-6">
          {/* Start Section: Positioned Logo + Search Box */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Logo + Side Menu Button for Advanced Search */}
            <div className={cn("flex items-center", START_OFFSET_CLASS)}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIsAdvancedMenuOpen((prev) => !prev)}
                      className={cn(
                        HEADER_ICON_BUTTON_CLASS,
                        "me-1.5 sm:me-2.5 shrink-0 cursor-pointer text-foreground/80 hover:text-foreground",
                        isAdvancedMenuOpen && "bg-foreground/10 text-foreground"
                      )}
                      aria-label={isRtl ? "تنظیمات پیشرفته جستجو" : "Advanced Search Settings"}
                    >
                      <AnimatedHamburger isOpen={isAdvancedMenuOpen} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isRtl ? "ابزارهای پیشرفته جستجو" : "Advanced Search Tools"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

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
                showAiModeButton={false}
                showClearButton={true}
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
                <NotificationsPopover
                  triggerClassName={HEADER_ICON_BUTTON_CLASS}
                  iconClassName="size-5 shrink-0"
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
      {/* 2. CATEGORY TABS (Scrolls naturally with page content)       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full bg-background dark:bg-[#121212] pt-1 sm:pt-1.5 transition-colors">
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

            {/* Advanced Filters Toggle Button (Icon only) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsAdvancedMenuOpen((prev) => !prev)}
                    className={cn(
                      "ms-auto size-8 flex items-center justify-center rounded-full border transition-colors cursor-pointer shrink-0",
                      isAdvancedMenuOpen
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                    aria-label={t("advancedSearch")}
                  >
                    <SlidersHorizontal className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {t("advancedSearch")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Pinned border line under header upon scroll */}
      <div
        className="sticky top-[var(--header-height)] z-30 w-full h-px bg-border/60 dark:bg-border/40"
        aria-hidden="true"
      />

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. RESULTS AREA (Vertically aligned with Search Box)        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <main className="w-full flex-1 px-2.5 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start w-full">
          {/* Side Menu & Spacer: Anchored to START_OFFSET_CLASS so results NEVER move/shift */}
          <aside
            className={cn(
              "self-start pe-3 sm:pe-4 transition-all duration-150",
              START_OFFSET_CLASS,
              isAdvancedMenuOpen
                ? "block mb-5 sm:mb-0 sm:sticky sm:top-[calc(var(--header-height)+16px)]"
                : "hidden sm:block sm:invisible pointer-events-none select-none"
            )}
            aria-hidden={!isAdvancedMenuOpen}
          >
            <div className="space-y-4 pt-0.5">
              {/* Sorting: جدیدترین - منطبق‌ترین - قدیمی‌ترین */}
              <div className="space-y-1">
                {[
                  { id: "newest", label: t("sort.newest") },
                  { id: "most_relevant", label: t("sort.mostRelevant") },
                  { id: "oldest", label: t("sort.oldest") },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id as typeof sortBy)}
                    className={cn(
                      "w-full text-start px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between",
                      sortBy === opt.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <span className="size-1.5 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>

              {/* Modules Combobox */}
              <div>
                <Combobox
                  options={moduleOptions}
                  value={selectedModule}
                  onChange={(val) => setSelectedModule(val || "all")}
                  placeholder={t("filterModule.placeholder")}
                  searchPlaceholder={t("filterModule.placeholder")}
                  size="sm"
                  className="w-full"
                  triggerClassName="w-full justify-between rtl:text-right text-xs h-8 bg-transparent hover:bg-muted/40 border-border/60"
                  align={isRtl ? "end" : "start"}
                  allowClear={false}
                />
              </div>

              {/* Reset Filters Link */}
              {(sortBy !== "most_relevant" || selectedModule !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("most_relevant");
                    setSelectedModule("all");
                  }}
                  className="text-[11px] text-primary hover:underline cursor-pointer block px-1"
                >
                  {t("resetFilters")}
                </button>
              )}
            </div>
          </aside>

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
          {displayedResults.length > 0 ? (
            <div className="space-y-7 w-full">
              {paginatedResults.map((item, idx) => {
                const midpointIndex = Math.min(3, Math.max(1, Math.floor(paginatedResults.length / 2)));
                const showRelatedHere = response.relatedSearches.length > 0 && idx === midpointIndex - 1;

                return (
                  <React.Fragment key={item.id}>
                    <SearchResultCard
                      item={item}
                      query={response.query}
                      locale={locale}
                      isRtl={isRtl}
                      t={t}
                    />

                    {/* Engineering-Style Related Searches (In the middle of results, No Icons, No Fillet / Sharp Corners) */}
                    {showRelatedHere && (
                      <div className="my-7 sm:my-9 rounded-none border border-border/80 bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 backdrop-blur-xs">
                        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <span>{t("relatedSearches")}</span>
                          <span className="text-[11px] font-mono text-muted-foreground/60 fa-num">
                            {response.relatedSearches.length} {isRtl ? "مورد" : "items"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {response.relatedSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleRelatedClick(term)}
                              className="px-3 py-1.5 rounded-none border border-border/80 bg-background/90 hover:bg-muted/70 text-foreground/90 hover:text-foreground text-xs font-medium transition-colors cursor-pointer hover:border-primary/50 shadow-2xs"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Load More Button for Speed & High Performance */}
              {displayedResults.length > visibleCount && (
                <div className="pt-4 pb-2 flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="h-10 px-6 rounded-full border border-border/80 bg-background hover:bg-muted font-medium text-xs shadow-xs hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <ChevronDown className="size-4 me-1.5" />
                    <span>{isRtl ? "بارگذاری موارد بیشتر" : "Load More Results"}</span>
                    <span className="ms-1.5 text-muted-foreground text-[11px] fa-num">
                      ({displayedResults.length - visibleCount} {isRtl ? "مورد دیگر" : "more"})
                    </span>
                  </Button>
                  <span className="text-[11px] text-muted-foreground fa-num">
                    {isRtl
                      ? `نمایش ۱ تا ${Math.min(visibleCount, displayedResults.length)} از ${displayedResults.length} نتیجه`
                      : `Showing 1 - ${Math.min(visibleCount, displayedResults.length)} of ${displayedResults.length} results`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* ──────────────────────────────────────────────────────────── */
            /* EMPTY STATE: NO RESULTS (Google Style + Animated Robot SVG) */
            /* ──────────────────────────────────────────────────────────── */
            !isSearching && response.query.trim().length > 0 && (
              <SearchEmptyState
                query={response.query}
                isRtl={isRtl}
                t={t}
              />
            )
          )}
        </div>
      </div>
    </main>

    {/* ──────────────────────────────────────────────────────────── */}
    {/* 4. DEDICATED SEARCH RESULTS FOOTER                          */}
    {/* ──────────────────────────────────────────────────────────── */}
    <SearchFooter startOffsetClass={START_OFFSET_CLASS} />
    </div>
  );
}

/**
 * Individual Google Search Result Card (Language-adaptive based on query)
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
  const isQueryEn = /[a-zA-Z]/.test(query) && !/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(query);
  const isQueryFa = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(query);
  const showEnglish = isQueryEn || (locale === "en" && !isQueryFa);

  const displayTitle = showEnglish && item.titleEn ? item.titleEn : item.title;
  const displaySnippet = showEnglish && item.snippetEn ? item.snippetEn : item.snippet;
  const displayBreadcrumbs =
    showEnglish && item.breadcrumbsEn && item.breadcrumbsEn.length > 0
      ? item.breadcrumbsEn
      : item.breadcrumbs;
  const displayBadge = showEnglish && item.badgeEn ? item.badgeEn : item.badge;

  const actionLabel = showEnglish
    ? item.category === "modules"
      ? "Open Tool"
      : item.category === "videos"
      ? "Watch Video"
      : item.category === "tasks"
      ? "View Project"
      : "View in Dictionary"
    : item.category === "modules"
    ? t("openModule")
    : item.category === "videos"
    ? t("openVideo")
    : item.category === "tasks"
    ? t("openProject")
    : t("openTerm");

  const standardLabel = showEnglish ? "Standard" : t("standard");
  const cardDir = showEnglish ? "ltr" : isRtl ? "rtl" : "ltr";

  return (
    <article
      dir={cardDir}
      className={cn(
        "group/card flex flex-col w-full text-start",
        showEnglish ? "text-left" : isRtl ? "text-right" : "text-left"
      )}
    >
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
            {standardLabel}: {item.metadata.standard}
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
          <span>{actionLabel}</span>
          {showEnglish ? (
            <ArrowRight className="size-3" />
          ) : isRtl ? (
            <ArrowLeft className="size-3" />
          ) : (
            <ArrowRight className="size-3" />
          )}
        </Link>
      </div>
    </article>
  );
}
