// src/modules/docs/components/docs-sidebar.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { DocCategory, DocArticle } from "../types/docs.types";
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Rocket,
  CheckSquare,
  Cpu,
  Shield,
  HelpCircle,
  FileText,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
  categories: DocCategory[];
  activeArticleId: string;
  onSelectArticle: (articleId: string) => void;
  className?: string;
  onCloseMobile?: () => void;
}

export function DocsSidebar({
  categories,
  activeArticleId,
  onSelectArticle,
  className,
  onCloseMobile,
}: DocsSidebarProps) {
  const t = useTranslations("Docs");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [searchQuery, setSearchQuery] = useState("");
  // Keep categories open by default
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Rocket":
      case "Sparkles":
        return Rocket;
      case "CheckSquare":
      case "Kanban":
      case "FolderKanban":
        return CheckSquare;
      case "BookOpen":
      case "Book":
        return BookOpen;
      case "Shield":
      case "ShieldCheck":
        return Shield;
      case "HelpCircle":
      case "Help":
        return HelpCircle;
      case "Cpu":
        return Cpu;
      default:
        return BookOpen;
    }
  };

  // Filtered categories and articles based on search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;

    return categories
      .map((cat) => {
        const matchingArticles = cat.articles.filter((art) => {
          return (
            art.titleFa.toLowerCase().includes(q) ||
            art.titleEn.toLowerCase().includes(q) ||
            art.subtitleFa.toLowerCase().includes(q) ||
            art.subtitleEn.toLowerCase().includes(q) ||
            art.tags.some((tag) => tag.toLowerCase().includes(q))
          );
        });

        const catMatches =
          cat.titleFa.toLowerCase().includes(q) ||
          cat.titleEn.toLowerCase().includes(q);

        if (catMatches) {
          return cat;
        }

        return {
          ...cat,
          articles: matchingArticles,
        };
      })
      .filter((cat) => cat.articles.length > 0);
  }, [categories, searchQuery]);

  return (
    <aside
      className={cn(
        "w-72 xl:w-80 shrink-0 flex flex-col h-full bg-card/40 border-e border-border/60 select-none",
        className
      )}
    >
      {/* Search Bar Header */}
      <div className="p-4 border-b border-border/60 space-y-3 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full text-xs rounded-xl bg-background border border-border/70 hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ps-9 pe-8 py-2.5 transition-colors placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 -translate-y-1/2 end-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 fa-num">
            <span>{t("searchResults")}</span>
            <span className="font-semibold text-foreground">
              {filteredCategories.reduce(
                (acc, cat) => acc + cat.articles.length,
                0
              )}{" "}
              {t("articlesCount")}
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
        {filteredCategories.length === 0 ? (
          <div className="p-6 text-center space-y-2 text-muted-foreground">
            <Search className="size-8 mx-auto opacity-30" />
            <p className="text-xs">{t("noSearchResults")}</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            const isCollapsed = collapsedCategories[cat.id];
            const catTitle = isRtl ? cat.titleFa : cat.titleEn;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Category Group Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-foreground/90 hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/10 text-primary">
                      <Icon className="size-3.5" />
                    </div>
                    <span>{catTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-[10px] font-mono fa-num px-1.5 py-0.5 rounded bg-muted/60">
                      {cat.articles.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      )}
                    />
                  </div>
                </button>

                {/* Articles inside category */}
                {!isCollapsed && (
                  <div className="space-y-0.5 ps-3 pt-1 border-s border-border/40 ms-3.5">
                    {cat.articles.map((art) => {
                      const isActive = activeArticleId === art.id;
                      const artTitle = isRtl ? art.titleFa : art.titleEn;

                      return (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => {
                            onSelectArticle(art.id);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={cn(
                            "w-full text-start text-xs py-2 px-3 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 group",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-normal"
                          )}
                        >
                          <span className="truncate">{artTitle}</span>
                          {art.standardRef && (
                            <span
                              className={cn(
                                "text-[9px] font-mono px-1 py-0.5 rounded uppercase shrink-0",
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                              )}
                            >
                              {art.standardRef.split(" ")[0]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Hint */}
      <div className="p-3 border-t border-border/60 bg-muted/20 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/60">
          <Sparkles className="size-4 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-[11px] truncate">
              {t("proTipTitle")}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {t("proTipDescription")}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
