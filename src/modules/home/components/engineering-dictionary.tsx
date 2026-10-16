"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Sparkles,
  BookA,
  BookOpen,
  Copy,
  Check,
  X,
  Shuffle,
  ShieldCheck,
  Lightbulb,
  ExternalLink,
  Layers,
  Wrench,
  Activity,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ENGINEERING_TERMS,
  DICTIONARY_CATEGORIES,
  type DictionaryTerm,
} from "../data/engineering-dictionary-data";

interface EngineeringDictionaryProps {
  className?: string;
}

export function EngineeringDictionary({ className }: EngineeringDictionaryProps) {
  const t = useTranslations("Home.dictionary");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalTerm, setActiveModalTerm] = useState<DictionaryTerm | null>(null);

  // Daily Term Algorithm (deterministic based on day of year, with manual shuffle ability)
  const [dailyIndex, setDailyIndex] = useState(0);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setDailyIndex(dayOfYear % ENGINEERING_TERMS.length);
  }, []);

  const dailyTerm = useMemo(() => {
    return ENGINEERING_TERMS[dailyIndex] || ENGINEERING_TERMS[0];
  }, [dailyIndex]);

  const handleShuffleDaily = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDailyIndex((prev) => (prev + 1 + Math.floor(Math.random() * (ENGINEERING_TERMS.length - 2))) % ENGINEERING_TERMS.length);
  };

  const handleCopy = (term: DictionaryTerm, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const textToCopy = `${term.termEn} (${term.termFa})\n\n${term.shortDescFa}\n${term.shortDescEn}\n\nنکته کلیدی: ${term.keyTipFa}${term.standards?.length ? `\nاستانداردها: ${term.standards.join(", ")}` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter terms based on category and search
  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return ENGINEERING_TERMS.filter((item) => {
      // Category match
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (!q) return true;

      const inEn = item.termEn.toLowerCase().includes(q);
      const inFa = item.termFa.toLowerCase().includes(q);
      const inDescFa = item.shortDescFa.toLowerCase().includes(q);
      const inDescEn = item.shortDescEn.toLowerCase().includes(q);
      const inAbbr = item.abbreviation?.toLowerCase().includes(q);
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const inStandards = item.standards?.some((s) => s.toLowerCase().includes(q));

      return inEn || inFa || inDescFa || inDescEn || inAbbr || inTags || inStandards;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryTheme = (category: DictionaryTerm["category"]) => {
    switch (category) {
      case "materials":
        return {
          pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
          dot: "bg-emerald-500",
        };
      case "equipment":
        return {
          pill: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
          dot: "bg-sky-500",
        };
      case "jargon":
        return {
          pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
          dot: "bg-amber-500",
        };
      case "inspection":
        return {
          pill: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
          dot: "bg-purple-500",
        };
      case "experience":
        return {
          pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
          dot: "bg-rose-500",
        };
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto flex flex-col h-full overflow-hidden px-2 sm:px-4",
        className
      )}
    >
      {/* 1. Header with Title & Stats */}
      <div className="shrink-0 mb-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <BookA className="size-5" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                {t("title")}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <Badge variant="outline" className="text-xs font-medium py-1 px-3 bg-muted/50 border-border/60">
              <span className="font-semibold text-primary fa-num">{filteredTerms.length}</span>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="text-muted-foreground fa-num">{ENGINEERING_TERMS.length} {t("all")}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. Daily Suggestion Card (Term of the Day) */}
      <div className="shrink-0 mb-3">
        <div
          onClick={() => setActiveModalTerm(dailyTerm)}
          className="relative group cursor-pointer overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-card p-3.5 sm:p-4.5 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Sparkles className="size-4.5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-bold text-primary tracking-wide uppercase">
                    {t("dailyWord")}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] py-0 px-2 leading-tight h-5", getCategoryTheme(dailyTerm.category).pill)}>
                    {isRtl ? dailyTerm.categoryFa : dailyTerm.categoryEn}
                  </Badge>
                  {dailyTerm.standards?.[0] && (
                    <span className="text-[10px] text-muted-foreground/80 font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                      {dailyTerm.standards[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {dailyTerm.termEn}
                  </h3>
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                    — {dailyTerm.termFa}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/90 line-clamp-1 mt-1 leading-relaxed">
                  {isRtl ? dailyTerm.shortDescFa : dailyTerm.shortDescEn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShuffleDaily}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                title={t("randomWord")}
              >
                <Shuffle className="size-3.5 mr-1.5" />
                <span>{t("randomWord")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleCopy(dailyTerm, e)}
                className="h-8 px-2.5 text-xs rounded-lg border-border/70"
              >
                {copiedId === dailyTerm.id ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Category Filter Pills */}
      <div className="shrink-0 space-y-2.5 mb-3">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none", isRtl ? "right-3.5" : "left-3.5")} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={cn("h-10 text-xs sm:text-sm bg-card/80 border-border/70 rounded-xl shadow-xs transition-all", isRtl ? "pr-10 pl-9" : "pl-10 pr-9")}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={cn("absolute top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-full hover:bg-muted/60 transition-colors", isRtl ? "left-2.5" : "right-2.5")}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DICTIONARY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer border flex items-center gap-1.5 shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                )}
              >
                <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
                {cat.id !== "all" && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full fa-num",
                      isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Terms Grid List (Scrollable Area) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-4 scrollbar-thin">
        {filteredTerms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <Search className="size-6 opacity-60" />
            </div>
            <h4 className="text-sm font-bold text-foreground">{t("noResults")}</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              عبارت دیگری جستجو کنید یا فیلتر دسته‌بندی را تغییر دهید.
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs rounded-xl"
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
                  onClick={() => setActiveModalTerm(term)}
                  className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-border/70 hover:border-primary/40 bg-card/90 dark:bg-[#0e1017]/90 hover:bg-card shadow-2xs hover:shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <div>
                    {/* Top Row: Category Badge, Abbreviation & Copy Action */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] py-0 px-2 font-medium leading-none h-5 border shadow-2xs", theme.pill)}
                        >
                          <span className={cn("size-1.5 rounded-full mr-1.5", theme.dot)} />
                          {isRtl ? term.categoryFa : term.categoryEn}
                        </Badge>
                        {term.abbreviation && (
                          <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                            {term.abbreviation}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleCopy(term, e)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                        title="کپی مشخصات واژه"
                      >
                        {copiedId === term.id ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </div>

                    {/* Term Titles: English prominently & Persian counterpart */}
                    <div className="space-y-0.5 mb-2">
                      <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {term.termEn}
                      </h4>
                      <div className="text-xs font-semibold text-muted-foreground">
                        {term.termFa}
                      </div>
                    </div>

                    {/* Bilingual Descriptions */}
                    <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2 mb-2">
                      {isRtl ? term.shortDescFa : term.shortDescEn}
                    </p>
                  </div>

                  {/* Bottom: Pro Tip Callout & Standards */}
                  <div className="space-y-2 pt-2 border-t border-border/40 shrink-0">
                    <div className="flex items-start gap-1.5 bg-muted/40 p-2 rounded-xl text-[11px] text-foreground/80 leading-normal">
                      <Lightbulb className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong className="text-foreground">{t("fieldTip")} </strong>
                        {isRtl ? term.keyTipFa : term.keyTipEn}
                      </span>
                    </div>

                    {term.standards && term.standards.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[10px] text-muted-foreground/60 shrink-0">{t("standards")}</span>
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                          {term.standards.map((std, sIdx) => (
                            <span key={sIdx} className="text-[9.5px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/30 whitespace-nowrap">
                              {std}
                            </span>
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

      {/* 5. Detailed Modal on Card Click */}
      <Dialog open={Boolean(activeModalTerm)} onOpenChange={(open) => !open && setActiveModalTerm(null)}>
        {activeModalTerm && (
          <DialogContent className={cn("sm:max-w-lg max-h-[90vh] overflow-y-auto", isRtl && "font-vazir fa-num")}>
            <DialogHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className={cn("text-xs py-0.5 px-2.5 font-medium", getCategoryTheme(activeModalTerm.category).pill)}>
                  {isRtl ? activeModalTerm.categoryFa : activeModalTerm.categoryEn}
                </Badge>
                {activeModalTerm.abbreviation && (
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                    {activeModalTerm.abbreviation}
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {activeModalTerm.termEn}
              </DialogTitle>
              <DialogDescription className="text-base font-semibold text-primary/90">
                {activeModalTerm.termFa}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Persian Detailed Explanation */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase">توضیح فارسی (مفهوم و کاربرد):</span>
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                  {activeModalTerm.shortDescFa}
                </p>
              </div>

              {/* English Explanation */}
              <div className="space-y-1" dir="ltr">
                <span className="text-xs font-bold text-muted-foreground uppercase">English Practical Definition:</span>
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50 font-sans">
                  {activeModalTerm.shortDescEn}
                </p>
              </div>

              {/* Key Practical Tip / Field Secret */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Lightbulb className="size-4" />
                  <span>فوت‌وفن کارگاهی و تجربه میدانی:</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {isRtl ? activeModalTerm.keyTipFa : activeModalTerm.keyTipEn}
                </div>
              </div>

              {/* Standards Tags */}
              {activeModalTerm.standards && activeModalTerm.standards.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">استانداردهای مهندسی مرجع:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalTerm.standards.map((std, sIdx) => (
                      <span key={sIdx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-card border border-border/60 text-foreground">
                        {std}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(activeModalTerm)}
                  className="rounded-xl text-xs gap-1.5"
                >
                  {copiedId === activeModalTerm.id ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-muted-foreground" />
                      <span>کپی اطلاعات واژه</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setActiveModalTerm(null)}
                  className="rounded-xl text-xs"
                >
                  بستن
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
