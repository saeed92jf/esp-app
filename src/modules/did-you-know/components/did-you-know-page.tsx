"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Lightbulb,
  Search,
  Plus,
  Star,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Share2,
  Sparkles,
  Layers,
  SlidersHorizontal,
  BookmarkCheck,
  CheckCircle2,
  Shuffle,
  Eye,
  BookOpen,
} from "lucide-react";
import {
  DiceOne,
  DiceTwo,
  DiceThree,
  DiceFour,
  DiceFive,
  DiceSix,
} from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/app-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { useDidYouKnow, type CustomCardInput } from "../hooks/use-did-you-know";
import type { DidYouKnowCardItem } from "@/modules/home/data/did-you-know-data";

const DICE_FACES = [DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix];

const MATH_FORMULA_STYLE: React.CSSProperties = {
  fontFamily: "'LatinModernMath', 'NotoSansMath', 'Cambria Math', serif",
  textRendering: "geometricPrecision",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

const NAV_ITEMS = [
  { id: "browse", icon: Lightbulb, labelFa: "کاوش کارت‌ها", labelEn: "Explore Cards" },
  { id: "add", icon: Plus, labelFa: "افزودن کارت جدید", labelEn: "Add New Card" },
  { id: "bookmarks", icon: Star, labelFa: "نشان‌شده‌ها", labelEn: "Saved Facts" },
  { id: "random", icon: Shuffle, labelFa: "کشف تصادفی", labelEn: "Random Fact" },
  { id: "manage", icon: Download, labelFa: "مدیریت و خروجی", labelEn: "Export & Manage" },
];

export function DidYouKnowPage() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") || "browse";
  const initialCardId = searchParams.get("card") || null;
  const initialQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "carousel" | "list">("grid");

  const [selectedCard, setSelectedCard] = useState<DidYouKnowCardItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hook for did-you-know data
  const {
    allCards,
    customCards,
    bookmarkedCards,
    isLoaded,
    addCustomCard,
    deleteCustomCard,
    toggleBookmark,
    isBookmarked,
    exportJSON,
    importJSON,
  } = useDidYouKnow(locale);

  // Auto-open modal or scroll to card if specified in URL
  useEffect(() => {
    if (initialCardId && allCards.length > 0) {
      const match = allCards.find(
        (c) => c.id === initialCardId || c.id === `card-${initialCardId}`
      );
      if (match) {
        setSelectedCard(match);
      }
    }
  }, [initialCardId, allCards]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyFormula = (formula: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(formula);
    setCopiedId(id);
    showToast(isRtl ? "فرمول در کلیپ‌بورد کپی شد" : "Formula copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCard = (card: DidYouKnowCardItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = `💡 آیا می‌دانید؟\n${card.title}\n\n${card.description}\n\nفرمول: ${card.formula}\nمرجع: ${card.ref}`;
    navigator.clipboard.writeText(text);
    setCopiedId(card.id);
    showToast(isRtl ? "متن کامل نکته علمی کپی شد" : "Fact copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract unique categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    for (const c of allCards) {
      if (c.category) set.add(c.category);
    }
    return Array.from(set);
  }, [allCards]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    let list = activeTab === "bookmarks" ? bookmarkedCards : allCards;

    if (selectedCategory !== "all") {
      if (selectedCategory === "custom") {
        list = list.filter((c) => c.id.startsWith("custom-dyk-"));
      } else {
        list = list.filter((c) => c.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const inTitle = c.title.toLowerCase().includes(q);
        const inDesc = c.description.toLowerCase().includes(q);
        const inTag = c.tag.toLowerCase().includes(q);
        const inCat = c.category.toLowerCase().includes(q);
        const inFormula = c.formula.toLowerCase().includes(q);
        const inRef = c.ref.toLowerCase().includes(q);
        return inTitle || inDesc || inTag || inCat || inFormula || inRef;
      });
    }

    return list;
  }, [allCards, bookmarkedCards, activeTab, selectedCategory, searchQuery]);

  // Carousel Hook for Presentation Mode
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: isRtl ? "rtl" : "ltr",
    align: "center",
  });

  const [carouselIndex, setCarouselIndex] = useState(0);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCarouselIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Form State for Adding New Card
  const [newCardForm, setNewCardForm] = useState<CustomCardInput>({
    title: "",
    category: "",
    tag: "",
    description: "",
    formula: "",
    ref: "",
    link: "",
    themeColor: "cyan",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardForm.title.trim() || !newCardForm.description.trim()) {
      showToast(isRtl ? "لطفاً عنوان و شرح نکته علمی را وارد کنید." : "Please enter title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = addCustomCard(newCardForm);
      setNewCardForm({
        title: "",
        category: "",
        tag: "",
        description: "",
        formula: "",
        ref: "",
        link: "",
        themeColor: "cyan",
      });
      showToast(isRtl ? "کارت جدید با موفقیت اضافه شد!" : "New fact card added successfully!");
      setSelectedCard(created);
      setActiveTab("browse");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Random Fact Discovery
  const [randomDice, setRandomDice] = useState(3);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [revealedRandomCard, setRevealedRandomCard] = useState<DidYouKnowCardItem | null>(null);

  const handleRollRandomFact = () => {
    if (isRollingDice || allCards.length === 0) return;
    setIsRollingDice(true);
    let step = 0;
    const interval = setInterval(() => {
      setRandomDice(Math.floor(Math.random() * 6));
      step++;
      if (step > 7) {
        clearInterval(interval);
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        setIsRollingDice(false);
        setRevealedRandomCard(randomCard);
      }
    }, 80);
  };

  useEffect(() => {
    if (activeTab === "random" && !revealedRandomCard && allCards.length > 0) {
      setRevealedRandomCard(allCards[0]);
    }
  }, [activeTab, revealedRandomCard, allCards]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importJSON(content);
        if (result.success) {
          showToast(isRtl ? `${result.count} کارت با موفقیت وارد شد!` : `${result.count} cards imported successfully!`);
        } else {
          showToast(result.error || (isRtl ? "خطا در پردازش فایل" : "Import failed"));
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const CurrentRandomDice = DICE_FACES[randomDice] ?? DiceFour;

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 1: BROWSE & EXPLORE VIEW                                */
  /* ──────────────────────────────────────────────────────────── */
  const renderBrowseView = () => (
    <div className="max-w-6xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Lightbulb className="size-7 text-amber-500 shrink-0" />
            <span>{isRtl ? "کارت‌های دانستنی‌های علمی و مهندسی (آیا می‌دانید؟)" : "Scientific & Engineering Did You Know Cards"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRtl
              ? "مجموعه‌ای از شگفت‌انگیزترین نکات علمی، پدیده‌های فیزیکی، روابط ترمودینامیکی و استانداردهای طراحی مخازن"
              : "Curated collection of fascinating physics principles, thermodynamics, fluid dynamics, and vessel engineering facts"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => setActiveTab("add")}
            className="rounded-full px-4 h-10 font-medium shadow-xs"
          >
            <Plus className="size-4 mr-1.5 rtl:ml-1.5 rtl:mr-0 shrink-0" />
            <span>{isRtl ? "افزودن نکته جدید" : "Add New Fact"}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setActiveTab("random")}
            className="rounded-full px-3.5 h-10 font-medium border-border/70 shadow-xs"
          >
            <Shuffle className="size-4 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-primary" />
            <span>{isRtl ? "کشف تصادفی" : "Random Fact"}</span>
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full mb-4">
        <div className="relative flex items-center w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
            <Search className="size-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "جستجو در نکات علمی، عنوان‌ها، فرمول‌ها (Hoop Stress، Re) یا استانداردها..." : "Search facts, scientific formulas, ASME codes, or categories..."}
            dir={isRtl ? "rtl" : "ltr"}
            className={cn(
              "w-full ps-11 pe-10 h-13 rounded-2xl bg-card border border-border/80 text-base shadow-xs focus-visible:ring-1 focus-visible:ring-primary",
              isRtl ? "text-right rtl:text-right placeholder:text-right" : "text-left placeholder:text-left"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-border/40">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none border",
              selectedCategory === "all"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
            )}
          >
            {isRtl ? "همه دسته‌ها" : "All Categories"} ({allCards.length})
          </button>

          {customCards.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory("custom")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none border flex items-center gap-1",
                selectedCategory === "custom"
                  ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              )}
            >
              <Sparkles className="size-3" />
              <span>{isRtl ? "کارت‌های من" : "My Cards"}</span>
              <span className="opacity-80">({customCards.length})</span>
            </button>
          )}

          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none border",
                selectedCategory === cat
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
              )}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                viewMode === "grid" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
              title={isRtl ? "نمایش شبکه‌ای" : "Grid view"}
            >
              <Layers className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("carousel")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                viewMode === "carousel" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
              title={isRtl ? "نمایش اسلایدر پرزنتیشن" : "Carousel view"}
            >
              <Eye className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                viewMode === "list" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
              title={isRtl ? "نمایش فهرست فشرده" : "List view"}
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground fa-num">
            {filteredCards.length} {isRtl ? "کارت" : "cards"}
          </span>
        </div>
      </div>

      {/* Cards View Rendering */}
      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card/60 rounded-3xl border border-dashed border-border/80">
          <Lightbulb className="size-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {isRtl ? "هیچ کارتی با این مشخصات یافت نشد" : "No fact cards match your search"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {isRtl ? "می‌توانید یک کارت جدید به‌صورت دستی اضافه کنید." : "You can add a custom card with this concept."}
          </p>
          <Button onClick={() => setActiveTab("add")} variant="outline" className="rounded-full">
            <Plus className="size-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
            <span>{isRtl ? "افزودن این نکته علمی" : "Add this card"}</span>
          </Button>
        </div>
      ) : viewMode === "carousel" ? (
        /* CAROUSEL PRESENTATION MODE */
        <div className="w-full flex flex-col items-center">
          <div className="w-full overflow-hidden" ref={emblaRef}>
            <div className="flex w-full touch-pan-y py-4">
              {filteredCards.map((card, idx) => (
                <div key={card.id} className="min-w-0 shrink-0 grow-0 basis-[92%] sm:basis-[80%] max-w-3xl px-3">
                  <div
                    className={cn(
                      "relative w-full rounded-3xl border bg-card/95 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-lg overflow-hidden transition-all duration-300",
                      card.borderAccent
                    )}
                  >
                    <div className={cn("absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br blur-3xl pointer-events-none opacity-60", card.glowGradient)} />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("py-1 px-3.5 text-xs font-semibold rounded-full border leading-none", card.accent)}>
                            {card.category}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground px-3 py-1 rounded-full bg-muted/60 border border-border/50">
                            {card.tag}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border fa-num">
                          {idx + 1} / {filteredCards.length}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                        {card.description}
                      </p>

                      {/* Formula Box */}
                      {card.formula && (
                        <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 flex items-center justify-between mb-4">
                          <span dir="ltr" style={MATH_FORMULA_STYLE} className="text-sm sm:text-base font-semibold text-foreground select-all">
                            {card.formula}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyFormula(card.formula, card.id, e)}
                            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            {copiedId === card.id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{card.ref}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleBookmark(card.id)}
                          className="size-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-amber-500"
                        >
                          <Star className={cn("size-4", isBookmarked(card.id) && "fill-amber-500 text-amber-500")} />
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCard(card)}
                          className="rounded-full text-xs h-8"
                        >
                          <Copy className="size-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                          <span>{isRtl ? "کپی نکته" : "Copy Fact"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Next / Prev Controls */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollPrev()}
              className="rounded-full size-10"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </Button>
            <span className="text-xs text-muted-foreground font-mono fa-num">
              {carouselIndex + 1} / {filteredCards.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              className="rounded-full size-10"
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const bookmarked = isBookmarked(card.id);
            const isCustom = card.id.startsWith("custom-dyk-");

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={cn(
                  "group relative rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none",
                  "bg-card/95 hover:bg-card hover:shadow-lg hover:border-primary/40 dark:bg-card/70 overflow-hidden",
                  bookmarked ? "border-amber-500/30" : "border-border/70"
                )}
              >
                <div className={cn("absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity", card.glowGradient)} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("px-3 py-1 rounded-full text-[11px] font-semibold border leading-tight", card.accent)}>
                        {card.category}
                      </span>
                      {isCustom && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Sparkles className="size-2.5" />
                          <span>{isRtl ? "دستی" : "Custom"}</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(card.id);
                      }}
                      className="size-7 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-amber-500"
                    >
                      <Star className={cn("size-4", bookmarked && "fill-amber-500 text-amber-500")} />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
                    <HighlightMatch text={card.title} query={searchQuery} />
                  </h3>

                  <p className="text-xs sm:text-[13px] text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                    <HighlightMatch text={card.description} query={searchQuery} />
                  </p>

                  {card.formula && (
                    <div
                      onClick={(e) => handleCopyFormula(card.formula, card.id, e)}
                      className="bg-muted/50 hover:bg-muted border border-border/50 rounded-xl px-3 py-2 flex items-center justify-between transition-colors mb-3 cursor-copy"
                    >
                      <span dir="ltr" style={MATH_FORMULA_STYLE} className="text-xs sm:text-[13px] font-semibold text-foreground truncate select-all">
                        {card.formula}
                      </span>
                      {copiedId === card.id ? (
                        <Check className="size-3.5 text-emerald-500 shrink-0 ms-1.5" />
                      ) : (
                        <Copy className="size-3.5 text-muted-foreground/60 shrink-0 ms-1.5" />
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground relative z-10">
                  <span className="truncate max-w-[70%] font-medium">{card.ref}</span>
                  <ChevronRight className="size-4 text-muted-foreground/60 rtl:rotate-180 group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-2">
          {filteredCards.map((card) => {
            const bookmarked = isBookmarked(card.id);

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(card.id);
                    }}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Star className={cn("size-4", bookmarked && "fill-amber-500 text-amber-500")} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </span>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold border", card.accent)}>
                        {card.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{card.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ps-3">
                  {card.formula && (
                    <span dir="ltr" style={MATH_FORMULA_STYLE} className="hidden md:inline-block text-xs bg-muted/60 px-2.5 py-1 rounded-lg border text-muted-foreground font-mono">
                      {card.formula}
                    </span>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground/60 rtl:rotate-180" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 2: ADD NEW CARD FORM                                    */
  /* ──────────────────────────────────────────────────────────── */
  const renderAddCardView = () => (
    <div className="max-w-3xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {isRtl ? "افزودن کارت جدید آیا می‌دانید" : "Add New Did You Know Fact"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRtl
            ? "نکات علمی، فرمول‌های شگفت‌انگیز و استانداردهای طراحی را به بانک دانستنی‌ها اضافه کنید."
            : "Add scientific insights, mathematical formulas, and codes to the engineering facts deck."}
        </p>
      </div>

      <form onSubmit={handleAddCardSubmit} className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="cardTitle" className="font-semibold text-xs sm:text-sm">
            {isRtl ? "عنوان نکته علمی (پرسش یا مفهوم جذاب) *" : "Fact Title (Question or Hook) *"}
          </Label>
          <Input
            id="cardTitle"
            required
            value={newCardForm.title}
            onChange={(e) => setNewCardForm({ ...newCardForm, title: e.target.value })}
            placeholder={isRtl ? "مثال: چرا لوله‌ها و مخازن همواره از راستای طولی شکافته می‌شوند؟" : "e.g. Why do cylindrical vessels always burst longitudinally?"}
            className="rounded-xl h-11"
            dir="auto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cardCategory" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "حوزه تخصصی / دسته‌بندی *" : "Engineering Discipline *"}
            </Label>
            <Input
              id="cardCategory"
              required
              value={newCardForm.category}
              onChange={(e) => setNewCardForm({ ...newCardForm, category: e.target.value })}
              placeholder={isRtl ? "مثال: مکانیک مخازن تحت فشار" : "e.g. Pressure Vessel Mechanics"}
              className="rounded-xl h-11"
              dir="auto"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cardTag" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "برچسب موضوعی" : "Topic Tag"}
            </Label>
            <Input
              id="cardTag"
              value={newCardForm.tag}
              onChange={(e) => setNewCardForm({ ...newCardForm, tag: e.target.value })}
              placeholder={isRtl ? "مثال: استاندارد ASME" : "e.g. ASME Code"}
              className="rounded-xl h-11"
              dir="auto"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cardDesc" className="font-semibold text-xs sm:text-sm">
            {isRtl ? "توضیح علمی و فنی *" : "Scientific Explanation *"}
          </Label>
          <Textarea
            id="cardDesc"
            required
            rows={4}
            value={newCardForm.description}
            onChange={(e) => setNewCardForm({ ...newCardForm, description: e.target.value })}
            placeholder={isRtl ? "دلیل فیزیکی، مهندسی یا تجربی این پدیده را به زبان شیوا و دقیق توضیح دهید..." : "Explain the physical or engineering principle..."}
            className="rounded-xl"
            dir="auto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cardFormula" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "فرمول یا رابطه ریاضی (اختیاری)" : "Mathematical Formula (Optional)"}
            </Label>
            <Input
              id="cardFormula"
              value={newCardForm.formula}
              onChange={(e) => setNewCardForm({ ...newCardForm, formula: e.target.value })}
              placeholder="e.g. σ_hoop = (P · D) / (2t)"
              className="rounded-xl h-11 font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cardRef" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "استاندارد یا منبع مرجع" : "Reference Standard / Source"}
            </Label>
            <Input
              id="cardRef"
              value={newCardForm.ref}
              onChange={(e) => setNewCardForm({ ...newCardForm, ref: e.target.value })}
              placeholder="e.g. ASME BPVC Section VIII Div 1"
              className="rounded-xl h-11"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-xs sm:text-sm block">
            {isRtl ? "تم رنگی و استایل کارت" : "Card Accent Theme"}
          </Label>
          <div className="flex items-center gap-2 flex-wrap">
            {(["blue", "emerald", "amber", "purple", "rose", "cyan"] as const).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewCardForm({ ...newCardForm, themeColor: color })}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer capitalize",
                  newCardForm.themeColor === color
                    ? "ring-2 ring-primary ring-offset-2 bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveTab("browse")}
            className="rounded-full px-5"
          >
            {isRtl ? "انصراف" : "Cancel"}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-full px-7 font-semibold">
            <Plus className="size-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
            <span>{isRtl ? "ثبت کارت جدید" : "Save Fact Card"}</span>
          </Button>
        </div>
      </form>
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 3: BOOKMARKS VIEW                                       */
  /* ──────────────────────────────────────────────────────────── */
  const renderBookmarksView = () => (
    <div className="max-w-5xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Star className="size-7 text-amber-500 fill-amber-500" />
            <span>{isRtl ? "نکات علمی نشان‌شده" : "Saved Fact Cards"}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRtl ? "کارت‌هایی که برای مراجعات بعدی خود ستاره‌دار کرده‌اید." : "Fact cards you bookmarked for future reference."}
          </p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-full fa-num">
          {bookmarkedCards.length} {isRtl ? "کارت" : "cards"}
        </span>
      </div>

      {bookmarkedCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/60 rounded-3xl border border-dashed border-border/80">
          <Star className="size-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {isRtl ? "هیچ کارتی نشان نشده است" : "No bookmarked cards yet"}
          </h3>
          <Button onClick={() => setActiveTab("browse")} className="rounded-full mt-4">
            <span>{isRtl ? "مشاهده کارت‌های علمی" : "Explore Cards"}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="group relative rounded-3xl border border-border/80 bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", card.accent)}>
                    {card.category}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(card.id);
                    }}
                    className="text-amber-500 hover:text-amber-600"
                  >
                    <Star className="size-4 fill-amber-500" />
                  </button>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{card.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px] truncate max-w-[75%]">{card.ref}</span>
                <Copy onClick={(e) => handleCopyCard(card, e)} className="size-3.5 hover:text-foreground cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 4: RANDOM FACT DISCOVERY                                */
  /* ──────────────────────────────────────────────────────────── */
  const renderRandomView = () => (
    <div className="max-w-2xl mx-auto w-full py-8 px-4 animate-in fade-in duration-300 flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Shuffle className="size-6 text-primary" />
          <span>{isRtl ? "کشف یک نکته علمی تصادفی" : "Random Scientific Fact"}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRtl ? "روی تاس کلیک کنید تا یک حقیقت مهندسی جدید به شما پیشنهاد شود." : "Roll the dice to discover an intriguing engineering insight."}
        </p>
      </div>

      <button
        type="button"
        onClick={handleRollRandomFact}
        disabled={isRollingDice}
        className="size-16 rounded-full bg-card border-2 border-primary/40 hover:border-primary shadow-md flex items-center justify-center text-primary hover:scale-105 active:scale-95 transition-all mb-8 cursor-pointer"
        aria-label="Roll dice for random fact"
      >
        <motion.div
          animate={
            isRollingDice
              ? { rotate: [0, 180, 360, 540, 720], scale: [1, 1.3, 0.8, 1.2, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <CurrentRandomDice weight="bold" className="size-8" />
        </motion.div>
      </button>

      {revealedRandomCard && (
        <motion.div
          key={revealedRandomCard.id}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative w-full rounded-3xl border bg-card/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl overflow-hidden",
            revealedRandomCard.borderAccent
          )}
        >
          <div className={cn("absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br blur-3xl pointer-events-none opacity-60", revealedRandomCard.glowGradient)} />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border leading-tight", revealedRandomCard.accent)}>
                {revealedRandomCard.category}
              </span>
              <span className="text-xs font-medium text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted border">
                {revealedRandomCard.tag}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-snug">
              {revealedRandomCard.title}
            </h3>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
              {revealedRandomCard.description}
            </p>

            {revealedRandomCard.formula && (
              <div className="bg-muted/50 border border-border/60 rounded-2xl p-4 flex items-center justify-between mb-4">
                <span dir="ltr" style={MATH_FORMULA_STYLE} className="text-sm sm:text-base font-semibold text-foreground select-all">
                  {revealedRandomCard.formula}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyFormula(revealedRandomCard.formula, revealedRandomCard.id, e)}
                  className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {copiedId === revealedRandomCard.id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>{revealedRandomCard.ref}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyCard(revealedRandomCard)}
                  className="rounded-full text-xs h-8"
                >
                  <Copy className="size-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                  <span>{isRtl ? "کپی" : "Copy"}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleRollRandomFact}
                  className="rounded-full text-xs h-8"
                >
                  <Shuffle className="size-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                  <span>{isRtl ? "نکته بعدی" : "Next Fact"}</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 5: DATA MANAGEMENT                                      */
  /* ──────────────────────────────────────────────────────────── */
  const renderManageView = () => (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {isRtl ? "مدیریت و پشتیبان‌گیری کارت‌های آیا می‌دانید" : "Manage & Export Fact Cards"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRtl
            ? "دانلود داده‌های کارت‌ها در قالب JSON یا بازیابی اطلاعات از فایل پشتیبان."
            : "Export fact cards to JSON or import cards from backup files."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Download className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">
              {isRtl ? "خروجی کارت‌ها (JSON)" : "Export Cards"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {isRtl ? "دانلود تمام کارت‌های علمی و مهندسی برای استفاده آفلاین." : "Download complete facts deck in JSON format."}
            </p>
          </div>
          <Button onClick={exportJSON} className="rounded-2xl w-full">
            <Download className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{isRtl ? "دانلود فایل JSON" : "Download JSON"}</span>
          </Button>
        </div>

        <div className="bg-card border border-border/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Upload className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">
              {isRtl ? "وارد کردن فایل کارت‌ها" : "Import Cards"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {isRtl ? "بارگذاری فایل JSON حاوی کارت‌های دانستنی‌ها." : "Upload a JSON file containing fact cards."}
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
              <span>{isRtl ? "انتخاب فایل JSON" : "Select File"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* List of Custom Added Cards */}
      <div className="bg-card border border-border/80 rounded-3xl p-6">
        <h3 className="font-bold text-base sm:text-lg text-foreground mb-4">
          {isRtl ? "کارت‌های ایجاد شده توسط من" : "My Custom Fact Cards"} ({customCards.length})
        </h3>
        {customCards.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            {isRtl ? "هنوز کارتی به‌صورت دستی اضافه نشده است." : "No custom cards added yet."}
          </p>
        ) : (
          <div className="space-y-2">
            {customCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50 text-sm"
              >
                <div>
                  <span className="font-bold text-foreground">{card.title}</span>
                  <span className="text-xs text-muted-foreground ms-2">({card.category})</span>
                  <p className="text-xs text-muted-foreground line-clamp-1">{card.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCustomCard(card.id)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh)] bg-panel dark:bg-background font-sans w-full overflow-hidden relative">
      {/* 1. App Header with Tag = "didYouKnow" */}
      <AppHeader
        tag="didYouKnow"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
        position="absolute"
      />

      {/* Toast Notification - Strictly centered on screen vertical axis */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-8 sm:top-10 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-2xl flex items-center justify-center gap-2 pointer-events-none text-center"
          >
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden w-full relative pt-[72px]">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* 2. Sidebar Navigation */}
        <aside
          className={cn(
            "flex flex-col shrink-0 h-full bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none",
            "absolute md:relative start-0 top-0",
            sidebarOpen
              ? "w-64 ps-3 sm:ps-6 pe-4 py-6 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "-translate-x-full rtl:translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto md:w-[90px] md:ps-6 md:pe-6 md:py-6"
          )}
        >
          <TooltipProvider>
            <nav className="flex flex-col gap-2.5 w-full items-start">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-none cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]",
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                    )}
                    aria-label={label}
                  >
                    <div className="aspect-square h-full shrink-0 flex items-center justify-center">
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-colors duration-150",
                          isActive ? "text-white" : "text-foreground/60 group-hover:text-foreground"
                        )}
                      />
                    </div>

                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                        isActive ? "font-semibold text-white" : "font-medium text-foreground/75 group-hover:text-foreground",
                        sidebarOpen
                          ? "opacity-100 max-w-[170px] pe-4 ps-1.5"
                          : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonElement;
              })}
            </nav>
          </TooltipProvider>
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent h-full w-full relative z-10">
          {activeTab === "browse" && renderBrowseView()}
          {activeTab === "add" && renderAddCardView()}
          {activeTab === "bookmarks" && renderBookmarksView()}
          {activeTab === "random" && renderRandomView()}
          {activeTab === "manage" && renderManageView()}
        </main>
      </div>

      {/* 4. Detail Dialog Modal */}
      <Dialog open={Boolean(selectedCard)} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 sm:p-8">
          {selectedCard && (
            <div>
              <DialogHeader className="mb-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", selectedCard.accent)}>
                    {selectedCard.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(selectedCard.id)}
                      className="size-8 rounded-full bg-muted flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"
                    >
                      <Star className={cn("size-4", isBookmarked(selectedCard.id) && "fill-amber-500 text-amber-500")} />
                    </button>
                  </div>
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {selectedCard.title}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
                  {selectedCard.tag} • {selectedCard.ref}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
                <p className="bg-muted/40 p-4 rounded-2xl border border-border/40 text-foreground">
                  {selectedCard.description}
                </p>

                {selectedCard.formula && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {isRtl ? "معادله و رابطه ریاضی:" : "Mathematical Equation:"}
                    </h4>
                    <div className="bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between">
                      <span dir="ltr" style={MATH_FORMULA_STYLE} className="text-base font-semibold text-foreground select-all">
                        {selectedCard.formula}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleCopyFormula(selectedCard.formula, selectedCard.id, e)}
                        className="rounded-full h-8"
                      >
                        {copiedId === selectedCard.id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <Button
                  onClick={() => handleCopyCard(selectedCard)}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4"
                >
                  <Copy className="size-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  <span>{isRtl ? "کپی مشخصات" : "Copy"}</span>
                </Button>

                <Button
                  onClick={() => setSelectedCard(null)}
                  size="sm"
                  className="rounded-full px-6"
                >
                  {isRtl ? "بستن" : "Close"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
