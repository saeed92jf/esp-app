"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Copy,
  Check,
  X,
  Lightbulb,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Columns2,
  ScrollText,
} from "lucide-react";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { motion } from "motion/react";
import {
  DiceOne,
  DiceTwo,
  DiceThree,
  DiceFour,
  DiceFive,
  DiceSix,
} from "@phosphor-icons/react";

const DICE_FACES = [DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix];
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getDictionaryCategories,
  getDictionaryTerms,
  type DictionaryItem,
} from "../data/engineering-dictionary-data";

interface EngineeringDictionaryProps {
  className?: string;
}

const MATH_FORMULA_STYLE: React.CSSProperties = {
  fontFamily: "'LatinModernMath', 'NotoSansMath', 'Cambria Math', serif",
  textRendering: "geometricPrecision",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

interface FormulaTagProps {
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

function FormulaTag({ children, className, size = "md" }: FormulaTagProps) {
  return (
    <span
      dir="ltr"
      translate="no"
      style={MATH_FORMULA_STYLE}
      className={cn(
        "inline-flex items-center justify-center font-normal tracking-wide text-black dark:text-white select-all antialiased bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-xs shrink-0 whitespace-nowrap transition-colors",
        size === "xs" && "text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg sm:rounded-xl h-6 sm:h-6.5",
        size === "sm" && "text-xs sm:text-[13px] px-3 py-1 rounded-xl h-7 sm:h-7.5",
        size === "md" && "text-xs sm:text-sm px-3.5 py-1.5 rounded-xl h-7.5 sm:h-8",
        size === "lg" && "text-sm sm:text-base px-4 py-1.5 rounded-xl sm:rounded-2xl h-8 sm:h-9",
        className
      )}
    >
      {children}
    </span>
  );
}

interface DiceRollButtonProps {
  onPick: () => void;
  disabled?: boolean;
  tooltipText: string;
}

const DiceRollButton = React.memo(function DiceRollButton({
  onPick,
  disabled,
  tooltipText,
}: DiceRollButtonProps) {
  const [diceIndex, setDiceIndex] = useState(4); // DiceFive
  const [isRolling, setIsRolling] = useState(false);
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const handleRoll = () => {
    if (disabled || isRolling) return;
    setIsRolling(true);

    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    // Smooth tumble with gentle face shifts so GPU rotation runs at solid 60fps without VDOM churn
    const t1 = setTimeout(() => setDiceIndex((prev) => (prev + 2) % 6), 110);
    const t2 = setTimeout(() => setDiceIndex((prev) => (prev + 3) % 6), 230);
    const t3 = setTimeout(() => setDiceIndex((prev) => (prev + 1) % 6), 350);
    const tFinal = setTimeout(() => {
      const finalFace = Math.floor(Math.random() * DICE_FACES.length);
      setDiceIndex(finalFace);
      setIsRolling(false);
      onPick();
    }, 460);

    timeoutRefs.current.push(t1, t2, t3, tFinal);
  };

  const CurrentDice = DICE_FACES[diceIndex] ?? DiceFive;

  return (
    <>
      {/* Off-screen pre-warming container to ensure all 6 Phosphor SVGs are pre-compiled and GPU-cached immediately on load */}
      <div
        className="fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <DiceOne weight="bold" className="size-6" />
        <DiceTwo weight="bold" className="size-6" />
        <DiceThree weight="bold" className="size-6" />
        <DiceFour weight="bold" className="size-6" />
        <DiceFive weight="bold" className="size-6" />
        <DiceSix weight="bold" className="size-6" />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleRoll}
            disabled={disabled || isRolling}
            className={cn(
              "p-1 sm:p-1.5 flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed bg-transparent border-0 shadow-none rounded-full",
              isRolling ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
            aria-label={tooltipText}
          >
            <motion.div
              animate={
                isRolling
                  ? {
                      rotate: [0, 180, 360, 540, 720],
                      scale: [1, 1.25, 0.85, 1.15, 1],
                    }
                  : { rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform" }}
              className="flex items-center justify-center shrink-0"
            >
              <CurrentDice weight="bold" className="size-5 sm:size-6 shrink-0" />
            </motion.div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    </>
  );
});

export function getCategoryTheme(category: DictionaryItem["category"]) {
  switch (category) {
    case "materials":
      return {
        pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        dot: "bg-emerald-500",
        glowGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
        borderAccent: "hover:border-emerald-500/40",
      };
    case "equipment":
      return {
        pill: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
        dot: "bg-sky-500",
        glowGradient: "from-sky-500/20 via-blue-500/10 to-transparent",
        borderAccent: "hover:border-sky-500/40",
      };
    case "jargon":
      return {
        pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
        dot: "bg-amber-500",
        glowGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
        borderAccent: "hover:border-amber-500/40",
      };
    case "inspection":
      return {
        pill: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
        dot: "bg-purple-500",
        glowGradient: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
        borderAccent: "hover:border-purple-500/40",
      };
    case "experience":
      return {
        pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
        dot: "bg-rose-500",
        glowGradient: "from-rose-500/20 via-pink-500/10 to-transparent",
        borderAccent: "hover:border-rose-500/40",
      };
    case "corporate":
      return {
        pill: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
        dot: "bg-indigo-500",
        glowGradient: "from-indigo-500/20 via-violet-500/10 to-transparent",
        borderAccent: "hover:border-indigo-500/40",
      };
  }
}

interface DictionaryCardProps {
  term: DictionaryItem;
  isRtl: boolean;
  isCopied: boolean;
  query: string;
  onOpen: (term: DictionaryItem) => void;
  onCopy: (term: DictionaryItem, e?: React.MouseEvent) => void;
  tCopyTerm: string;
  tCopied: string;
  tFieldTip: string;
}

const DictionaryCard = React.memo(function DictionaryCard({
  term,
  isRtl,
  isCopied,
  query,
  onOpen,
  onCopy,
  tCopyTerm,
  tCopied,
  tFieldTip,
}: DictionaryCardProps) {
  const theme = getCategoryTheme(term.category);
  const isEnglishCard = !/[\u0600-\u06FF]/.test(term.term + " " + term.shortDesc);

  return (
    <div
      onClick={() => onOpen(term)}
      dir={isEnglishCard ? "ltr" : isRtl ? "rtl" : "ltr"}
      className={cn(
        "group relative overflow-hidden flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 dark:bg-[#0e1017]/95 backdrop-blur-2xl shadow-md shadow-slate-950/5 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] transition-all duration-200 cursor-pointer",
        isEnglishCard ? "text-left" : isRtl ? "text-right" : "text-left",
        theme.borderAccent
      )}
    >
      {/* Glowing Aura in corner based on category */}
      <div
        className={cn(
          "absolute -top-16 -end-16 size-44 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300",
          theme.glowGradient
        )}
      />

      <div className="relative z-10">
        {/* Top Row: Category Circle Dot Tag, Sharp Formula Abbr Tag & Copy Action */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center border shadow-none shrink-0 cursor-default select-none",
                    theme.pill
                  )}
                  aria-label={term.categoryName}
                >
                  <span className={cn("size-2 rounded-full shrink-0", theme.dot)} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">{term.categoryName}</TooltipContent>
            </Tooltip>

            {term.abbreviation && (
              <FormulaTag size="md">{term.abbreviation}</FormulaTag>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => onCopy(term, e)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                aria-label={tCopyTerm}
              >
                {isCopied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isCopied ? tCopied : tCopyTerm}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Term Titles with Search Keyword Highlighting */}
        <div className="mb-2">
          <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
            <HighlightMatch
              text={term.term}
              query={query}
              highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
            />
          </h4>
          {term.secondaryTerm && (
            <div
              className="text-xs sm:text-[13px] font-semibold text-muted-foreground/90 font-sans my-1 tracking-wide leading-snug line-clamp-1"
              dir="ltr"
            >
              <HighlightMatch
                text={term.secondaryTerm}
                query={query}
                highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
              />
            </div>
          )}
        </div>

        {/* Short Description with Search Keyword Highlighting */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
          <HighlightMatch
            text={term.shortDesc}
            query={query}
            highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
          />
        </p>
      </div>

      {/* Bottom: Pro Tip with Highlighting & Standards Tags */}
      <div className="relative z-10 space-y-2 pt-2.5 border-t border-border/40 shrink-0">
        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-normal">
          <Lightbulb className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span className="line-clamp-1">
            <strong className="text-foreground font-medium">{tFieldTip} </strong>
            <HighlightMatch
              text={term.keyTip}
              query={query}
              highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
            />
          </span>
        </div>

        {term.standards && term.standards.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-hidden pt-0.5">
            <div
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1"
              dir="ltr"
            >
              {term.standards.map((std, sIdx) => (
                <FormulaTag key={sIdx} size="sm">
                  {std}
                </FormulaTag>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export function EngineeringDictionary({ className }: EngineeringDictionaryProps) {
  const t = useTranslations("Home.dictionary");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Both Persian and English datasets loaded so language-specific search can instantly switch cards
  const initialTermsFa = useMemo(() => getDictionaryTerms("fa"), []);
  const initialTermsEn = useMemo(() => getDictionaryTerms("en"), []);
  const [termsFa, setTermsFa] = useState<DictionaryItem[]>(initialTermsFa);
  const [termsEn, setTermsEn] = useState<DictionaryItem[]>(initialTermsEn);
  const categories = useMemo(() => getDictionaryCategories(locale), [locale]);

  // Fresh randomization on each load / mount so user never sees repetitive initial cards
  useEffect(() => {
    const randomSeed = Math.floor(Math.random() * 1000000) + 1;
    setTermsFa(getDictionaryTerms("fa", randomSeed));
    setTermsEn(getDictionaryTerms("en", randomSeed));
  }, []);

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.label,
      triggerLabel: cat.label,
      hint: cat.id !== "all" ? `${cat.count}` : undefined,
    }));
  }, [categories]);

  // Immediate input state + deferred query for lag-free typing, clearing and backspacing
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = React.useDeferredValue(searchQuery);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalTerm, setActiveModalTerm] = useState<DictionaryItem | null>(null);
  const [viewMode, setViewMode] = useState<"paginated" | "scroll">("paginated");

  const handleOpenModal = (term: DictionaryItem) => {
    setActiveModalTerm(term);
  };

  // Detect whether the search query is Persian or English using deferred query
  const queryLanguage = useMemo<"fa" | "en" | "neutral">(() => {
    const q = deferredQuery.trim();
    if (!q) return "neutral";
    const hasFa = /[\u0600-\u06FF]/.test(q);
    const hasEn = /[a-zA-Z]/.test(q);
    if (hasFa && !hasEn) return "fa";
    if (hasEn && !hasFa) return "en";
    if (hasFa && hasEn) {
      const faCount = (q.match(/[\u0600-\u06FF]/g) || []).length;
      const enCount = (q.match(/[a-zA-Z]/g) || []).length;
      return faCount >= enCount ? "fa" : "en";
    }
    return "neutral";
  }, [deferredQuery]);

  // If user searched Persian -> Persian dataset. If English -> English dataset. Otherwise current locale dataset.
  const activeTermsDataset = useMemo(() => {
    if (queryLanguage === "fa") return termsFa;
    if (queryLanguage === "en") return termsEn;
    return locale === "fa" ? termsFa : termsEn;
  }, [queryLanguage, locale, termsFa, termsEn]);

  // Random Term Suggestion Handler (called upon completed dice roll)
  const handlePickRandomTerm = () => {
    if (!activeTermsDataset.length) return;
    const randomIndex = Math.floor(Math.random() * activeTermsDataset.length);
    const picked = activeTermsDataset[randomIndex];
    if (selectedCategory !== "all" && picked.category !== selectedCategory) {
      setSelectedCategory("all");
    }
    setSearchQuery(picked.term);
  };

  const handleCopy = (term: DictionaryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isEn = !/[\u0600-\u06FF]/.test(term.term + " " + term.shortDesc);
    const textToCopy = isEn
      ? `${term.term}${term.abbreviation ? ` [${term.abbreviation}]` : ""}\n\n${term.shortDesc}\n\nGolden Tip: ${term.keyTip}${term.standards?.length ? `\nStandards: ${term.standards.join(", ")}` : ""}`
      : `${term.term}${term.secondaryTerm ? ` (${term.secondaryTerm})` : ""}${term.abbreviation ? ` [${term.abbreviation}]` : ""}\n\n${term.shortDesc}\n\nنکته طلایی: ${term.keyTip}${term.standards?.length ? `\nاستانداردها: ${term.standards.join(", ")}` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter terms based on category and search query (using deferredQuery for zero-lag typing/clearing)
  const filteredTerms = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    const filterList = (list: DictionaryItem[]) => {
      return list.filter((item) => {
        // Category match
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
          return false;
        }

        // Search match
        if (!q) return true;

        const inTerm = item.term.toLowerCase().includes(q);
        const inSecondary = item.secondaryTerm?.toLowerCase().includes(q);
        const inDesc = item.shortDesc.toLowerCase().includes(q);
        const inAbbr = item.abbreviation?.toLowerCase().includes(q);
        const inTags = item.tags.some((tg) => tg.toLowerCase().includes(q));
        const inStandards = item.standards?.some((s) => s.toLowerCase().includes(q));

        return inTerm || inSecondary || inDesc || inAbbr || inTags || inStandards;
      });
    };

    const primaryResults = filterList(activeTermsDataset);
    if (primaryResults.length > 0 || !q) {
      return primaryResults;
    }

    // Fallback to the other language dataset if primary yielded 0 results
    const fallbackDataset = activeTermsDataset === termsFa ? termsEn : termsFa;
    return filterList(fallbackDataset);
  }, [activeTermsDataset, termsFa, termsEn, deferredQuery, selectedCategory]);

  // Fixed 2 cards per page so the entire component fits neatly without parent page scroll
  const ITEMS_PER_PAGE = 2;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredTerms.length / ITEMS_PER_PAGE));

  // Reset to page 1 whenever search query, category, or terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, selectedCategory, activeTermsDataset]);

  // Clamp current page within valid bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTerms = useMemo(() => {
    return filteredTerms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTerms, startIndex]);

  const fromItem = filteredTerms.length === 0 ? 0 : startIndex + 1;
  const toItem = Math.min(startIndex + ITEMS_PER_PAGE, filteredTerms.length);

  // Compute page numbers with sibling offset around active page
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis-end" as const, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis-start" as const,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "ellipsis-start" as const,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-end" as const,
      totalPages,
    ];
  }, [currentPage, totalPages]);

  const modalTheme = activeModalTerm ? getCategoryTheme(activeModalTerm.category) : null;
  const isModalEnglish = activeModalTerm ? !/[\u0600-\u06FF]/.test(activeModalTerm.term + " " + activeModalTerm.shortDesc) : false;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-full max-w-5xl mx-auto flex flex-col my-auto justify-center min-h-0",
          className
        )}
      >
        {/* 1. Header: Title, Mode Toggle, Search Bar & Category Combobox */}
        <div className="shrink-0 w-full bg-background/95 dark:bg-[#0c0d12]/95 backdrop-blur-md pt-2 sm:pt-3 pb-2.5 sm:pb-3 border-b border-border/40 mb-1 sm:mb-2">
          {/* Title with View Mode Toggle (80/80 badge removed as requested) */}
          <div className="flex items-center justify-between gap-3 mb-2 sm:mb-2.5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {t("title")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* View Mode Toggle: Paginated (2 Fixed Cards) vs Bounded Scroll */}
              <div className="flex items-center p-0.5 rounded-xl border border-border/70 bg-muted/40 shadow-2xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setViewMode("paginated")}
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer",
                        viewMode === "paginated"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                      aria-label={t("paginatedMode")}
                    >
                      <Columns2 className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("paginatedMode")}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setViewMode("scroll")}
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer",
                        viewMode === "scroll"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                      aria-label={t("scrollMode")}
                    >
                      <ScrollText className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("scrollMode")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Search Bar with Integrated Random Suggestion Button & Category Combobox */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            {/* Search Input with Integrated Random Suggestion Button */}
            <div className="relative flex-1 min-w-0">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none",
                  isRtl ? "right-3.5" : "left-3.5"
                )}
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                dir={isRtl ? "rtl" : "ltr"}
                className={cn(
                  "h-10 sm:h-10.5 text-xs sm:text-sm rounded-full bg-white dark:bg-[#12141c] border border-border/80 shadow-sm focus-visible:ring-primary/25 transition-all",
                  isRtl
                    ? (searchQuery ? "pr-11 pl-20 sm:pl-22 text-right rtl:text-right placeholder:text-right" : "pr-11 pl-12 sm:pl-14 text-right rtl:text-right placeholder:text-right")
                    : (searchQuery ? "pl-11 pr-20 sm:pr-22 text-left placeholder:text-left" : "pl-11 pr-12 sm:pr-14 text-left placeholder:text-left")
                )}
              />
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 flex items-center gap-1",
                  isRtl ? "left-2" : "right-2"
                )}
              >
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-full hover:bg-muted/60 transition-colors"
                    aria-label={t("clearSearch")}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
                <DiceRollButton
                  onPick={handlePickRandomTerm}
                  tooltipText={t("randomWord")}
                />
              </div>
            </div>

            {/* Category Combobox */}
            <div className="w-full sm:w-64 md:w-72 shrink-0">
              <Combobox
                options={categoryOptions}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val || "all")}
                placeholder={t("allCategories")}
                showSearch={false}
                className={cn(
                  "h-10 sm:h-10.5 text-xs sm:text-sm rounded-full border border-border/80 bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-[#181b26] shadow-sm font-medium px-4",
                  isRtl && "rtl:text-right"
                )}
                popoverClassName="w-56 sm:w-72 min-w-[220px] bg-white dark:bg-[#12141c] border-border/80 shadow-xl rounded-2xl p-1 [&_[data-slot=command]]:bg-white dark:[&_[data-slot=command]]:bg-[#12141c]"
              />
            </div>
          </div>
        </div>

        {/* 2. Main Content Area */}
        <div className="w-full min-h-0 flex flex-col justify-center">
          {filteredTerms.length === 0 ? (
            <div className="flex-1 w-full flex flex-col items-center justify-center my-auto py-10 text-center">
              <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
                <Search className="size-6 opacity-60" />
              </div>
              <h4 className="text-sm font-bold text-foreground">{t("noResults")}</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t("noResultsHint")}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs rounded-xl shadow-none"
                >
                  {t("clearSearch")}
                </Button>
              )}
            </div>
          ) : viewMode === "paginated" ? (
            /* View Mode 1: Paginated - 2 fixed cards centered vertically, pagination bar locked at bottom */
            <div className="w-full min-h-0 flex flex-col justify-center">
              {/* Vertically centered cards occupying the extra vertical space */}
              <div className="w-full flex flex-col items-center justify-center py-2 sm:py-3 min-h-0">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 items-stretch"
                >
                  {paginatedTerms.map((term) => (
                    <DictionaryCard
                      key={term.id}
                      term={term}
                      isRtl={isRtl}
                      isCopied={copiedId === term.id}
                      query={deferredQuery}
                      onOpen={handleOpenModal}
                      onCopy={handleCopy}
                      tCopyTerm={t("copyTerm")}
                      tCopied={t("copied")}
                      tFieldTip={t("fieldTip")}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Bottom Pagination Bar */}
              <div className="shrink-0 w-full pt-2.5 pb-1 px-1 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
                {/* Offset & Range Info */}
                <div className="flex items-center gap-2 select-none shrink-0">
                  <Badge variant="outline" className="font-normal text-xs py-1 px-3 bg-muted/40 border-border/60">
                    <span className="text-muted-foreground">
                      {t("offsetRange", {
                        from: fromItem,
                        to: toItem,
                        total: filteredTerms.length,
                      })}
                    </span>
                  </Badge>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                  {/* اول (First Page Button) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="size-8 sm:size-8.5 rounded-xl border-border/70 hover:bg-muted active:scale-95 transition-all shadow-none disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        aria-label={t("firstPage")}
                      >
                        <ChevronsLeft className="size-4 rtl:rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t("firstPage")}</TooltipContent>
                  </Tooltip>

                  {/* قبل (Previous Page Button) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="size-8 sm:size-8.5 rounded-xl border-border/70 hover:bg-muted active:scale-95 transition-all shadow-none disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        aria-label={t("prevPage")}
                      >
                        <ChevronLeft className="size-4 rtl:rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t("prevPage")}</TooltipContent>
                  </Tooltip>

                  {/* فعال و افست (Active & Offset Page Buttons) */}
                  <div className="flex items-center gap-1">
                    {pageNumbers.map((p, idx) => {
                      if (p === "ellipsis-start" || p === "ellipsis-end") {
                        return (
                          <span
                            key={`${p}-${idx}`}
                            className="size-8 sm:size-8.5 flex items-center justify-center text-muted-foreground select-none"
                          >
                            <MoreHorizontal className="size-4 opacity-50" />
                          </span>
                        );
                      }

                      const isActive = p === currentPage;

                      return (
                        <Tooltip key={p}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "size-8 sm:size-8.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 flex items-center justify-center cursor-pointer select-none",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-xs scale-105 font-bold"
                                  : "bg-card hover:bg-muted text-foreground border border-border/70 hover:border-border active:scale-95"
                              )}
                              aria-label={t("activePage", { page: p })}
                            >
                              <span className="fa-num">{p}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {t("page")} <span className="fa-num">{p}</span>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>

                  {/* بعد (Next Page Button) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="size-8 sm:size-8.5 rounded-xl border-border/70 hover:bg-muted active:scale-95 transition-all shadow-none disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        aria-label={t("nextPage")}
                      >
                        <ChevronRight className="size-4 rtl:rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t("nextPage")}</TooltipContent>
                  </Tooltip>

                  {/* اخر (Last Page Button) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="size-8 sm:size-8.5 rounded-xl border-border/70 hover:bg-muted active:scale-95 transition-all shadow-none disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        aria-label={t("lastPage")}
                      >
                        <ChevronsRight className="size-4 rtl:rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t("lastPage")}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          ) : (
            /* View Mode 2: Scroll Mode - Scrolls edge-to-edge, with breathing room at boundaries */
            <div className="w-full max-h-[50vh] min-h-0 flex flex-col justify-between overflow-hidden">
              {/* Scroll container touches top border line and bottom border line */}
              <div className="flex-1 w-full min-h-0 overflow-y-auto custom-scrollbar px-1 sm:px-2">
                {/* Inner grid has pt-3.5 and pb-4 padding so at start/end of scroll there is breathing room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-3.5 pb-4 sm:pt-4 sm:pb-5">
                  {filteredTerms.map((term) => (
                    <DictionaryCard
                      key={term.id}
                      term={term}
                      isRtl={isRtl}
                      isCopied={copiedId === term.id}
                      query={deferredQuery}
                      onOpen={handleOpenModal}
                      onCopy={handleCopy}
                      tCopyTerm={t("copyTerm")}
                      tCopied={t("copied")}
                      tFieldTip={t("fieldTip")}
                    />
                  ))}
                </div>
              </div>

              {/* Scroll Mode Bottom Summary Bar */}
              <div className="shrink-0 w-full pt-2 pb-1 px-1 border-t border-border/40 flex items-center justify-between gap-3 select-none">
                <Badge variant="outline" className="font-normal text-xs py-1 px-3 bg-muted/40 border-border/60">
                  <span className="text-muted-foreground">{t("showingAll", { count: filteredTerms.length })}</span>
                </Badge>
                <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
                  <ScrollText className="size-3.5 opacity-60" />
                  <span>{t("scrollModeHint")}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Deep Detail Modal Dialog */}
        <Dialog open={Boolean(activeModalTerm)} onOpenChange={(open) => !open && setActiveModalTerm(null)}>
          {activeModalTerm && modalTheme && (
            <DialogContent
              className={cn(
                "w-[94vw] max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[85vh] p-0 flex flex-col overflow-hidden rounded-3xl",
                "border border-border/80 bg-card/95 dark:bg-[#0e1017]/95 backdrop-blur-2xl shadow-2xl",
                modalTheme.borderAccent
              )}
              dir={isModalEnglish ? "ltr" : isRtl ? "rtl" : "ltr"}
            >
              {/* Ambient Corner Glow in Modal */}
              <div
                className={cn(
                  "pointer-events-none absolute -top-24 -end-24 size-64 rounded-full blur-3xl opacity-45 bg-gradient-to-br",
                  modalTheme.glowGradient
                )}
              />

              {/* Modal Header */}
              <DialogHeader className={cn("relative z-10 space-y-2.5 px-5 pt-5 sm:px-7 sm:pt-7 pb-3.5 border-b border-border/60 shrink-0", isModalEnglish ? "text-left" : isRtl ? "text-right" : "text-left")}>
                {/* Category & Abbr Tags Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs sm:text-[13px] h-7 px-3 font-semibold border shadow-none",
                      modalTheme.pill
                    )}
                  >
                    <span className={cn("size-2 rounded-full mr-2 shrink-0", modalTheme.dot)} />
                    {activeModalTerm.categoryName}
                  </Badge>
                  {activeModalTerm.abbreviation && (
                    <FormulaTag size="md">
                      {activeModalTerm.abbreviation}
                    </FormulaTag>
                  )}
                </div>

                {/* Title & Subtitle Group with Search Highlighting */}
                <div className="space-y-1.5">
                  <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    <HighlightMatch
                      text={activeModalTerm.term}
                      query={deferredQuery}
                      highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
                    />
                  </DialogTitle>
                  {activeModalTerm.secondaryTerm && (
                    <DialogDescription className="text-xs sm:text-sm font-semibold text-muted-foreground/90 font-sans tracking-normal leading-relaxed text-start" dir="ltr">
                      <HighlightMatch
                        text={activeModalTerm.secondaryTerm}
                        query={deferredQuery}
                        highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
                      />
                    </DialogDescription>
                  )}
                </div>
              </DialogHeader>

              {/* Scrollable Modal Body */}
              <div className="relative z-10 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5 space-y-3.5 custom-scrollbar">
                {/* 1. Primary Definition Card */}
                <div className="rounded-2xl border border-border/70 bg-muted/30 dark:bg-muted/15 p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2.5 text-primary font-bold">
                    <BookOpen className="size-4.5 shrink-0 text-primary" />
                    <span className="text-foreground text-sm sm:text-[15px] font-bold">
                      {t("definitionTitle")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed sm:leading-7 text-justify">
                    <HighlightMatch
                      text={activeModalTerm.shortDesc}
                      query={deferredQuery}
                      highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
                    />
                  </p>
                </div>

                {/* 2. Key Practical Tip / Field Experience Card */}
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2.5 text-amber-600 dark:text-amber-400 font-bold">
                    <Lightbulb className="size-4.5 shrink-0 text-amber-500" />
                    <span className="text-amber-700 dark:text-amber-300 text-sm sm:text-[15px] font-bold">
                      {t("keyTipTitle")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed sm:leading-7">
                    <HighlightMatch
                      text={activeModalTerm.keyTip}
                      query={deferredQuery}
                      highlightClassName="bg-amber-400/35 text-amber-950 dark:text-amber-200 dark:bg-amber-400/25 rounded-xs px-0.5 font-bold"
                    />
                  </p>
                </div>

                {/* 3. Standards Tags Card */}
                {activeModalTerm.standards && activeModalTerm.standards.length > 0 && (
                  <div className="rounded-2xl border border-border/70 bg-muted/30 dark:bg-muted/15 p-4 sm:p-5 shadow-2xs">
                    <div className="text-sm sm:text-[15px] font-bold text-foreground mb-3 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <span>{t("standardsTitle")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5" dir="ltr">
                      {activeModalTerm.standards.map((std, sIdx) => (
                        <FormulaTag key={sIdx} size="md">
                          {std}
                        </FormulaTag>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Bottom Actions */}
                <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(activeModalTerm)}
                    className="rounded-xl text-xs sm:text-sm font-medium h-9 px-4 gap-2 bg-muted/40 hover:bg-muted border-border/60 shadow-none transition-colors"
                  >
                    {copiedId === activeModalTerm.id ? (
                      <>
                        <Check className="size-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 text-muted-foreground" />
                        <span>{t("copyInfo")}</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setActiveModalTerm(null)}
                    className="rounded-xl text-xs sm:text-sm font-semibold h-9 px-5 shadow-xs"
                  >
                    {t("close")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
