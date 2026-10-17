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
} from "lucide-react";
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

export function EngineeringDictionary({ className }: EngineeringDictionaryProps) {
  const t = useTranslations("Home.dictionary");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Initial deterministic list for SSR, then fresh client-side randomization on mount
  const initialTerms = useMemo(() => getDictionaryTerms(locale), [locale]);
  const [allTerms, setAllTerms] = useState<DictionaryItem[]>(initialTerms);
  const categories = useMemo(() => getDictionaryCategories(locale), [locale]);

  // Fresh randomization on each load / mount so user never sees repetitive initial cards
  useEffect(() => {
    const randomSeed = Math.floor(Math.random() * 1000000) + 1;
    setAllTerms(getDictionaryTerms(locale, randomSeed));
  }, [locale]);

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.label,
      triggerLabel: cat.label,
      hint: cat.id !== "all" ? `${cat.count}` : undefined,
    }));
  }, [categories]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalTerm, setActiveModalTerm] = useState<DictionaryItem | null>(null);

  const [diceIndex, setDiceIndex] = useState(4); // Default to DiceFive
  const [isRolling, setIsRolling] = useState(false);

  const handleOpenModal = (term: DictionaryItem) => {
    setActiveModalTerm(term);
  };

  // Random Term Suggestion Handler - rolling dice tumble animation & search result setting
  const handlePickRandomTerm = () => {
    if (!allTerms.length || isRolling) return;
    setIsRolling(true);

    let rollTicks = 0;
    const interval = setInterval(() => {
      setDiceIndex(Math.floor(Math.random() * DICE_FACES.length));
      rollTicks++;
      if (rollTicks >= 8) {
        clearInterval(interval);
        setIsRolling(false);
        const finalDice = Math.floor(Math.random() * DICE_FACES.length);
        setDiceIndex(finalDice);

        const randomIndex = Math.floor(Math.random() * allTerms.length);
        const picked = allTerms[randomIndex];
        if (selectedCategory !== "all" && picked.category !== selectedCategory) {
          setSelectedCategory("all");
        }
        setSearchQuery(picked.term);
      }
    }, 65);
  };

  const handleCopy = (term: DictionaryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const textToCopy = isRtl
      ? `${term.term}${term.secondaryTerm ? ` (${term.secondaryTerm})` : ""}${term.abbreviation ? ` [${term.abbreviation}]` : ""}\n\n${term.shortDesc}\n\nنکته طلایی: ${term.keyTip}${term.standards?.length ? `\nاستانداردها: ${term.standards.join(", ")}` : ""}`
      : `${term.term}${term.abbreviation ? ` [${term.abbreviation}]` : ""}\n\n${term.shortDesc}\n\nGolden Tip: ${term.keyTip}${term.standards?.length ? `\nStandards: ${term.standards.join(", ")}` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter terms based on category and search
  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allTerms.filter((item) => {
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
  }, [allTerms, searchQuery, selectedCategory]);

  const getCategoryTheme = (category: DictionaryItem["category"]) => {
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
  };

  const modalTheme = activeModalTerm ? getCategoryTheme(activeModalTerm.category) : null;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-full max-w-5xl mx-auto flex flex-col min-h-full px-2 sm:px-4 my-auto shrink-0",
          className
        )}
      >
      {/* 1 & 2. Sticky Header: Title, Stats, Search Bar & Category Combobox */}
      <div className="sticky top-0 z-20 shrink-0 w-full bg-background/95 dark:bg-[#0c0d12]/95 backdrop-blur-md pt-3 sm:pt-4 pb-3 sm:pb-3.5 border-b border-border/40 mb-3 sm:mb-4">
        {/* Title & Stats */}
        <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="text-xs font-medium py-1 px-3 bg-muted/40 border-border/60">
              <span className="font-semibold text-foreground fa-num">{filteredTerms.length}</span>
              <span className="mx-1 text-muted-foreground/60">/</span>
              <span className="text-muted-foreground fa-num">{allTerms.length}</span>
            </Badge>
          </div>
        </div>

        {/* Search Bar with Integrated Random Suggestion Button & Category Combobox */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Search Input with Integrated Random Suggestion Button */}
          <div className="relative flex-1 min-w-0">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none", isRtl ? "right-3.5" : "left-3.5")} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={cn(
                "h-10 sm:h-11 text-xs sm:text-sm rounded-full bg-white dark:bg-[#12141c] border border-border/80 shadow-sm focus-visible:ring-primary/25 transition-all",
                isRtl
                  ? (searchQuery ? "pr-11 pl-20 sm:pl-22" : "pr-11 pl-12 sm:pl-14")
                  : (searchQuery ? "pl-11 pr-20 sm:pr-22" : "pl-11 pr-12 sm:pr-14")
              )}
            />
            <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center gap-1", isRtl ? "left-2" : "right-2")}>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handlePickRandomTerm}
                    disabled={isRolling}
                    className={cn(
                      "p-1 sm:p-1.5 flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed bg-transparent border-0 shadow-none rounded-full",
                      isRolling
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    aria-label={t("randomWord")}
                  >
                    <motion.div
                      animate={
                        isRolling
                          ? {
                              rotate: [0, 180, 360, 540, 720],
                              scale: [1, 1.3, 0.85, 1.2, 1],
                            }
                          : { rotate: 0, scale: 1 }
                      }
                      transition={{ duration: 0.52, ease: "easeInOut" }}
                      className="flex items-center justify-center shrink-0"
                    >
                      {(() => {
                        const DiceFace = DICE_FACES[diceIndex] ?? DiceFive;
                        return <DiceFace weight="bold" className="size-5 sm:size-6 shrink-0" />;
                      })()}
                    </motion.div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t("randomWord")}
                </TooltipContent>
              </Tooltip>
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
                "h-10 sm:h-11 text-xs sm:text-sm rounded-full border border-border/80 bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-[#181b26] shadow-sm font-medium px-4",
                isRtl && "rtl:text-right"
              )}
              popoverClassName="w-56 sm:w-72 min-w-[220px] bg-white dark:bg-[#12141c] border-border/80 shadow-xl rounded-2xl p-1 [&_[data-slot=command]]:bg-white dark:[&_[data-slot=command]]:bg-[#12141c]"
            />
          </div>
        </div>
      </div>

      {/* 3. Terms Grid List */}
      <div className="w-full px-1 sm:px-2 pb-6">
        {filteredTerms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredTerms.map((term) => {
              const theme = getCategoryTheme(term.category);

              return (
                <div
                  key={term.id}
                  onClick={() => handleOpenModal(term)}
                  className={cn(
                    "group relative overflow-hidden flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 dark:bg-[#0e1017]/95 backdrop-blur-2xl shadow-md shadow-slate-950/5 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] transition-all duration-200 cursor-pointer",
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
                          <TooltipContent side="top">
                            {term.categoryName}
                          </TooltipContent>
                        </Tooltip>

                        {term.abbreviation && (
                          <FormulaTag size="md">
                            {term.abbreviation}
                          </FormulaTag>
                        )}
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(term, e)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                            aria-label={t("copyTerm")}
                          >
                            {copiedId === term.id ? (
                              <Check className="size-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {copiedId === term.id ? t("copied") : t("copyTerm")}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Term Titles */}
                    <div className="mb-2">
                      <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {term.term}
                      </h4>
                      {isRtl && term.secondaryTerm && (
                        <div className="text-xs sm:text-[13px] font-semibold text-muted-foreground/90 font-sans my-2 tracking-wide leading-snug" dir="ltr">
                          {term.secondaryTerm}
                        </div>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">
                      {term.shortDesc}
                    </p>
                  </div>

                  {/* Bottom: Pro Tip & Sharp Formula-font Standard Tags Without Shadow */}
                  <div className="relative z-10 space-y-2 pt-2.5 border-t border-border/40 shrink-0">
                    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-normal">
                      <Lightbulb className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">
                        <strong className="text-foreground font-medium">{t("fieldTip")} </strong>
                        {term.keyTip}
                      </span>
                    </div>

                    {term.standards && term.standards.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-hidden pt-0.5">
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1" dir="ltr">
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
            })}
          </div>
        )}
      </div>

      {/* 5. Deep Detail Modal Dialog */}
      <Dialog open={Boolean(activeModalTerm)} onOpenChange={(open) => !open && setActiveModalTerm(null)}>
        {activeModalTerm && modalTheme && (
          <DialogContent
            className={cn(
              "w-[94vw] max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[85vh] p-0 flex flex-col overflow-hidden rounded-3xl",
              "border border-border/80 bg-card/95 dark:bg-[#0e1017]/95 backdrop-blur-2xl shadow-2xl",
              modalTheme.borderAccent
            )}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Ambient Corner Glow in Modal */}
            <div
              className={cn(
                "pointer-events-none absolute -top-24 -end-24 size-64 rounded-full blur-3xl opacity-45 bg-gradient-to-br",
                modalTheme.glowGradient
              )}
            />

            {/* Modal Header */}
            <DialogHeader className={cn("relative z-10 space-y-2.5 px-5 pt-5 sm:px-7 sm:pt-7 pb-3.5 border-b border-border/60 shrink-0", isRtl ? "text-right" : "text-left")}>
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

              {/* Title & Subtitle Group */}
              <div className="space-y-1.5">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                  {activeModalTerm.term}
                </DialogTitle>
                {isRtl && activeModalTerm.secondaryTerm && (
                  <DialogDescription className="text-xs sm:text-sm font-semibold text-muted-foreground/90 font-sans tracking-normal leading-relaxed text-start">
                    {activeModalTerm.secondaryTerm}
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
                  {activeModalTerm.shortDesc}
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
                  {activeModalTerm.keyTip}
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
