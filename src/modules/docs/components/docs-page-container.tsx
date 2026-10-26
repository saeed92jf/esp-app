// src/modules/docs/components/docs-page-container.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AppHeader } from "@/components/layout/app-header";
import { DocsSidebar } from "./docs-sidebar";
import { DocsContentView } from "./docs-content-view";
import { DocsTableOfContents } from "./docs-table-of-contents";
import { DOCS_CATEGORIES } from "../data/docs-data";
import { Menu, X, BookOpen, Search, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function DocsPageContainer() {
  const t = useTranslations("Docs");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const router = useRouter();

  const allArticles = useMemo(() => {
    return DOCS_CATEGORIES.flatMap((cat) => cat.articles);
  }, []);

  const articleParam = searchParams?.get("article");
  const initialArticleId =
    allArticles.find((a) => a.id === articleParam)?.id ||
    allArticles[0]?.id ||
    "platform-overview";

  const [activeArticleId, setActiveArticleId] = useState<string>(initialArticleId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (articleParam && allArticles.some((a) => a.id === articleParam)) {
      setActiveArticleId(articleParam);
    }
  }, [articleParam, allArticles]);

  const currentIndex = allArticles.findIndex((a) => a.id === activeArticleId);
  const currentArticle =
    allArticles[currentIndex >= 0 ? currentIndex : 0] || allArticles[0];
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : null;

  const currentCategory = DOCS_CATEGORIES.find(
    (cat) => cat.id === currentArticle?.categoryId
  );

  const handleSelectArticle = (id: string) => {
    setActiveArticleId(id);
    setMobileSidebarOpen(false);

    try {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : ""
      );
      params.set("article", id);
      router.push(`?${params.toString()}`, { scroll: false });
    } catch {
      // Fallback
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* App Header with docs badge */}
      <AppHeader
        tag={
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
            <BookOpen className="size-3.5" />
            <span>{t("docsTag")}</span>
          </span>
        }
        onToggleMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        isMenuOpen={mobileSidebarOpen}
        showMenuButton={true}
      />

      {/* Mobile Bar for toggling docs menu */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/30">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground bg-card border border-border/70 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <Menu className="size-3.5 text-primary" />
          <span>{t("menuToggle")}</span>
        </button>

        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          {isRtl ? currentArticle?.titleFa : currentArticle?.titleEn}
        </span>
      </div>

      {/* Body Layout: Sidebar + Main Content + TOC */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sticky Sidebar */}
        <DocsSidebar
          categories={DOCS_CATEGORIES}
          activeArticleId={activeArticleId}
          onSelectArticle={handleSelectArticle}
          className="hidden lg:flex sticky top-[var(--header-height)] h-[calc(100dvh-var(--header-height)-var(--footer-height))] max-h-[calc(100dvh-var(--header-height)-var(--footer-height))]"
        />

        {/* Mobile Slide-Over Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar drawer content */}
            <div className="relative z-50 w-80 max-w-[85vw] bg-card h-full flex flex-col shadow-2xl border-e border-border">
              <div className="p-3 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <BookOpen className="size-4 text-primary" />
                  <span>{t("documentationTitle")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
                >
                  <X className="size-4" />
                </button>
              </div>

              <DocsSidebar
                categories={DOCS_CATEGORIES}
                activeArticleId={activeArticleId}
                onSelectArticle={handleSelectArticle}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                className="w-full border-none h-full"
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 lg:py-10">
          <DocsContentView
            article={currentArticle}
            category={currentCategory}
            prevArticle={prevArticle}
            nextArticle={nextArticle}
            onSelectArticle={handleSelectArticle}
          />
        </main>

        {/* Sticky Table of Contents on Right */}
        <aside className="p-8 ps-0 hidden lg:block">
          <DocsTableOfContents sections={currentArticle.sections} />
        </aside>
      </div>
    </div>
  );
}
