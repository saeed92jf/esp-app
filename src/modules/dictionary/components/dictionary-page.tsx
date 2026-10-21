"use client";

import React, { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  BookA,
  BookOpen,
  Search,
  Plus,
  Star,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Share2,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Award,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  DiceOne,
  DiceTwo,
  DiceThree,
  DiceFour,
  DiceFive,
  DiceSix,
} from "@phosphor-icons/react";
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
import { useDictionary, type CustomDictionaryTermInput } from "../hooks/use-dictionary";
import type { DictionaryItem } from "@/modules/home/data/engineering-dictionary-data";
import { getCategoryTheme } from "@/modules/home/components/engineering-dictionary";

const DICE_FACES = [DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix];

const NAV_ITEMS = [
  { id: "browse", icon: BookOpen, labelFa: "واژگان و اصطلاحات", labelEn: "Browse & Search" },
  { id: "add", icon: Plus, labelFa: "افزودن واژه جدید", labelEn: "Add New Term" },
  { id: "bookmarks", icon: Star, labelFa: "نشان‌شده‌ها", labelEn: "Bookmarked Terms" },
  { id: "flashcards", icon: Sparkles, labelFa: "فلش‌کارت و یادگیری", labelEn: "Flashcards & Study" },
  { id: "manage", icon: Download, labelFa: "مدیریت و خروجی", labelEn: "Export & Backup" },
];

export function DictionaryPage() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") || "browse";
  const initialTermId = searchParams.get("term") || null;
  const initialQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selected term for detail modal
  const [selectedTerm, setSelectedTerm] = useState<DictionaryItem | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Speech synthesis state
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Dice roll state
  const [diceIndex, setDiceIndex] = useState(4);
  const [isRolling, setIsRolling] = useState(false);

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Hook for dictionary data & storage
  const {
    allTerms,
    customTerms,
    categories,
    bookmarkedTerms,
    bookmarkedIds,
    isLoaded,
    addCustomTerm,
    deleteCustomTerm,
    toggleBookmark,
    isBookmarked,
    exportCustomJSON,
    exportAllJSON,
    exportCustomCSV,
    importCustomJSON,
    clearCustomTerms,
  } = useDictionary(locale);

  // Auto-open modal if URL has ?term=...
  useEffect(() => {
    if (initialTermId && allTerms.length > 0) {
      const match = allTerms.find(
        (t) =>
          t.id === initialTermId ||
          t.term.toLowerCase() === initialTermId.toLowerCase() ||
          t.id === `dict-${initialTermId}`
      );
      if (match) {
        setSelectedTerm(match);
      }
    }
  }, [initialTermId, allTerms]);

  // Audio Pronunciation using Web Speech API
  const speakTerm = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast(isRtl ? "مرورگر شما از تلفظ صوتی پشتیبانی نمی‌کند." : "Speech synthesis not supported.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick Copy
  const handleCopy = (term: DictionaryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const textToCopy = `${term.term} ${term.secondaryTerm ? `(${term.secondaryTerm})` : ""}\n\nتعریف: ${term.shortDesc}\n\nنکته کلیدی: ${term.keyTip}${term.standards ? `\n\nاستانداردها: ${term.standards.join(", ")}` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    showToast(isRtl ? `مشخصات واژه «${term.term}» کپی شد` : `Term "${term.term}" copied`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Roll Dice for Random Term
  const handleRollDice = () => {
    if (isRolling || allTerms.length === 0) return;
    setIsRolling(true);

    const faces = [0, 1, 2, 3, 4, 5];
    let step = 0;
    const interval = setInterval(() => {
      setDiceIndex(faces[Math.floor(Math.random() * faces.length)]);
      step++;
      if (step > 6) {
        clearInterval(interval);
        const randomTerm = allTerms[Math.floor(Math.random() * allTerms.length)];
        setIsRolling(false);
        setSelectedTerm(randomTerm);
        showToast(isRtl ? `واژه پیشنهادی: ${randomTerm.term}` : `Featured term: ${randomTerm.term}`);
      }
    }, 80);
  };

  // Filtered terms
  const filteredTerms = useMemo(() => {
    let list = activeTab === "bookmarks" ? bookmarkedTerms : allTerms;

    if (selectedCategory !== "all") {
      if (selectedCategory === "custom") {
        list = list.filter((t) => t.id.startsWith("custom-"));
      } else {
        list = list.filter((t) => t.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const inTerm = t.term.toLowerCase().includes(q);
        const inSecondary = t.secondaryTerm?.toLowerCase().includes(q);
        const inAbbr = t.abbreviation?.toLowerCase().includes(q);
        const inDesc = t.shortDesc.toLowerCase().includes(q);
        const inTip = t.keyTip.toLowerCase().includes(q);
        const inTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        const inStandards = t.standards?.some((s) => s.toLowerCase().includes(q));
        return inTerm || inSecondary || inAbbr || inDesc || inTip || inTags || inStandards;
      });
    }

    return list;
  }, [allTerms, bookmarkedTerms, activeTab, selectedCategory, searchQuery]);

  // Flashcards filtered deck
  const flashcardDeck = useMemo(() => {
    return allTerms.filter((t) => t.term && t.shortDesc);
  }, [allTerms]);

  const currentFlashcard = flashcardDeck[flashcardIndex] || flashcardDeck[0];

  const handleNextFlashcard = () => {
    setIsCardFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % flashcardDeck.length);
  };

  const handlePrevFlashcard = () => {
    setIsCardFlipped(false);
    setFlashcardIndex((prev) => (prev - 1 + flashcardDeck.length) % flashcardDeck.length);
  };

  // Form State for Adding Custom Word
  const [newTermForm, setNewTermForm] = useState<CustomDictionaryTermInput>({
    term: "",
    secondaryTerm: "",
    abbreviation: "",
    category: "materials",
    shortDesc: "",
    keyTip: "",
    standards: [],
    tags: [],
  });
  const [formStandardsInput, setFormStandardsInput] = useState("");
  const [formTagsInput, setFormTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermForm.term.trim() || !newTermForm.shortDesc.trim()) {
      showToast(isRtl ? "لطفاً واژه و شرح آن را وارد کنید." : "Please fill in term and definition.");
      return;
    }

    setIsSubmitting(true);
    try {
      const standardsList = formStandardsInput
        .split(/[,،;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const tagsList = formTagsInput
        .split(/[,،;]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const created = addCustomTerm({
        ...newTermForm,
        standards: standardsList,
        tags: tagsList,
      });

      setNewTermForm({
        term: "",
        secondaryTerm: "",
        abbreviation: "",
        category: "materials",
        shortDesc: "",
        keyTip: "",
        standards: [],
        tags: [],
      });
      setFormStandardsInput("");
      setFormTagsInput("");

      showToast(isRtl ? `واژه «${created.term}» با موفقیت افزوده شد!` : `Term "${created.term}" added successfully!`);
      // Open created term details
      setSelectedTerm(created);
      setActiveTab("browse");
    } finally {
      setIsSubmitting(false);
    }
  };

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importCustomJSON(content);
        if (result.success) {
          showToast(isRtl ? `${result.count} واژه با موفقیت وارد شد!` : `${result.count} terms imported successfully!`);
        } else {
          showToast(result.error || (isRtl ? "خطا در واردسازی فایل" : "Import failed"));
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const CurrentDice = DICE_FACES[diceIndex] ?? DiceFive;

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 1: BROWSE & SEARCH VIEW                                 */
  /* ──────────────────────────────────────────────────────────── */
  const renderBrowseView = () => (
    <div className="max-w-6xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <BookA className="size-7 text-primary shrink-0" />
            <span>{isRtl ? "دیکشنری و واژه‌نامه تخصصی مهندسی" : "Technical Engineering Dictionary"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRtl
              ? "جامع‌ترین مرجع اصطلاحات مکانیک، مخازن تحت فشار، پایپینگ، متالورژی و استانداردهای ASME و API"
              : "Comprehensive reference for mechanical, pressure vessels, metallurgy, ASME, and API codes"}
          </p>
        </div>

        {/* Action Controls: Add Word Button & Random Dice Roll */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => setActiveTab("add")}
            className="rounded-full px-4 h-10 font-medium shadow-xs"
          >
            <Plus className="size-4 mr-1.5 rtl:ml-1.5 rtl:mr-0 shrink-0" />
            <span>{isRtl ? "افزودن دستی لغت" : "Add New Term"}</span>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleRollDice}
                  disabled={isRolling}
                  className="size-10 rounded-full border border-border/70 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
                  aria-label={isRtl ? "انتخاب واژه تصادفی" : "Pick Random Term"}
                >
                  <motion.div
                    animate={
                      isRolling
                        ? { rotate: [0, 180, 360, 540, 720], scale: [1, 1.25, 0.85, 1.15, 1] }
                        : { rotate: 0, scale: 1 }
                    }
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                  >
                    <CurrentDice weight="bold" className="size-5 text-primary" />
                  </motion.div>
                </button>
              </TooltipTrigger>
              <TooltipContent>{isRtl ? "واژه تصادفی (تاس مهندسی)" : "Random Term Dice"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            placeholder={isRtl ? "جستجو در واژگان، ترجمه فارسی، استانداردها (ASME، API) یا اصطلاحات کارگاهی..." : "Search terms, definitions, standards (ASME, API), or workshop tips..."}
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

      {/* Categories Filter Bar & Stats Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-border/40">
        {/* Category Chips */}
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
            {isRtl ? "همه دسته‌ها" : "All Categories"} ({allTerms.length})
          </button>

          {customTerms.length > 0 && (
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
              <span>{isRtl ? "لغات من" : "My Custom Words"}</span>
              <span className="opacity-80">({customTerms.length})</span>
            </button>
          )}

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none border",
                selectedCategory === cat.id
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
              )}
            >
              <span>{cat.label}</span>
              <span className="ms-1 opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Grid / List */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                viewMode === "grid" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <Layers className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                viewMode === "list" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground fa-num">
            {filteredTerms.length} {isRtl ? "مورد" : "items"}
          </span>
        </div>
      </div>

      {/* Terms Grid / List Container */}
      {filteredTerms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card/60 rounded-3xl border border-dashed border-border/80">
          <BookA className="size-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {isRtl ? "واژه‌ای یافت نشد" : "No terms found"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {isRtl ? "عبارت دیگری را جستجو کنید یا یک واژه جدید به‌صورت دستی اضافه نمایید." : "Try searching for another term or add a new term manually."}
          </p>
          <Button onClick={() => setActiveTab("add")} variant="outline" className="rounded-full">
            <Plus className="size-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
            <span>{isRtl ? "افزودن این واژه" : "Add this term"}</span>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredTerms.map((term) => {
            const theme = getCategoryTheme(term.category);
            const bookmarked = isBookmarked(term.id);
            const isCustom = term.id.startsWith("custom-");

            return (
              <div
                key={term.id}
                onClick={() => setSelectedTerm(term)}
                className={cn(
                  "group relative rounded-2xl sm:rounded-3xl border p-4.5 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none",
                  "bg-card/95 hover:bg-card hover:shadow-md hover:border-primary/40 dark:bg-card/60",
                  bookmarked ? "border-amber-500/30" : "border-border/70"
                )}
              >
                {/* Glowing Top Aura */}
                <div
                  className={cn(
                    "absolute -top-12 -right-12 size-36 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity",
                    theme?.glowGradient
                  )}
                />

                <div>
                  {/* Card Header: Category & Action Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border leading-tight",
                          theme?.pill
                        )}
                      >
                        {term.categoryName}
                      </span>
                      {term.abbreviation && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border/40">
                          {term.abbreviation}
                        </span>
                      )}
                      {isCustom && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Sparkles className="size-2.5" />
                          <span>{isRtl ? "دستی" : "Custom"}</span>
                        </span>
                      )}
                    </div>

                    {/* Bookmark & Speaker Quick Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakTerm(term.term, term.id);
                        }}
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                          speakingId === term.id
                            ? "bg-primary text-white"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        aria-label="Pronounce"
                      >
                        <Volume2 className={cn("size-3.5", speakingId === term.id && "animate-pulse")} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(term.id);
                        }}
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                          bookmarked
                            ? "text-amber-500 bg-amber-500/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        aria-label="Bookmark"
                      >
                        <Star className={cn("size-3.5", bookmarked && "fill-amber-500")} />
                      </button>
                    </div>
                  </div>

                  {/* Term Name & Secondary */}
                  <div className="mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      <HighlightMatch text={term.term} query={searchQuery} />
                    </h3>
                    {term.secondaryTerm && (
                      <p className="text-xs sm:text-[13px] font-medium text-muted-foreground mt-0.5">
                        <HighlightMatch text={term.secondaryTerm} query={searchQuery} />
                      </p>
                    )}
                  </div>

                  {/* Short Definition */}
                  <p className="text-xs sm:text-[13px] text-muted-foreground/90 line-clamp-2 leading-relaxed mb-3">
                    <HighlightMatch text={term.shortDesc} query={searchQuery} />
                  </p>
                </div>

                {/* Footer: Standards / Tip / Copy */}
                <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground relative z-10">
                  <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                    {term.standards && term.standards.length > 0 ? (
                      <span className="font-mono text-[10.5px] bg-muted/60 px-2 py-0.5 rounded-md border border-border/40 truncate">
                        {term.standards[0]}
                      </span>
                    ) : term.tags && term.tags.length > 0 ? (
                      <span className="truncate">#{term.tags[0]}</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(term, e)}
                      className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title={isRtl ? "کپی اطلاعات" : "Copy"}
                    >
                      {copiedId === term.id ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode View */
        <div className="flex flex-col gap-2">
          {filteredTerms.map((term) => {
            const theme = getCategoryTheme(term.category);
            const bookmarked = isBookmarked(term.id);

            return (
              <div
                key={term.id}
                onClick={() => setSelectedTerm(term)}
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(term.id);
                    }}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Star className={cn("size-4", bookmarked && "fill-amber-500 text-amber-500")} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                        {term.term}
                      </span>
                      {term.secondaryTerm && (
                        <span className="text-xs text-muted-foreground">({term.secondaryTerm})</span>
                      )}
                      <span className={cn("px-2 py-0.2 rounded-full text-[10px] font-semibold border", theme?.pill)}>
                        {term.categoryName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{term.shortDesc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ps-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakTerm(term.term, term.id);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Volume2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(term, e)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {copiedId === term.id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </button>
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
  /* TAB 2: ADD NEW TERM VIEW (FORM)                             */
  /* ──────────────────────────────────────────────────────────── */
  const renderAddWordView = () => (
    <div className="max-w-3xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {isRtl ? "افزودن دستی واژه و اصطلاح جدید" : "Add Custom Engineering Term"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRtl
            ? "واژگان و اصطلاحات دلخواه خود را اضافه کنید. داده‌ها به‌صورت دائمی ذخیره شده و در جستجو و فلش‌کارت‌ها در دسترس خواهند بود."
            : "Add your custom technical vocabulary. Data persists locally and is fully indexed in search and flashcards."}
        </p>
      </div>

      <form onSubmit={handleAddTermSubmit} className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        {/* Row 1: Term & Secondary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="termInput" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "واژه / اصطلاح انگلیسی *" : "English Term *"}
            </Label>
            <Input
              id="termInput"
              required
              value={newTermForm.term}
              onChange={(e) => setNewTermForm({ ...newTermForm, term: e.target.value })}
              placeholder="e.g. Hydrostatic Test"
              className="rounded-xl h-11"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="secondaryInput" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "ترجمه یا معادل فارسی" : "Persian Translation / Synonym"}
            </Label>
            <Input
              id="secondaryInput"
              value={newTermForm.secondaryTerm}
              onChange={(e) => setNewTermForm({ ...newTermForm, secondaryTerm: e.target.value })}
              placeholder={isRtl ? "مثال: آزمون هیدرواستاتیک مخزن" : "e.g. تست هیدرواستاتیک"}
              className="rounded-xl h-11"
              dir="rtl"
            />
          </div>
        </div>

        {/* Row 2: Abbreviation & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="abbrInput" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "علامت اختصاری (مخفف)" : "Abbreviation"}
            </Label>
            <Input
              id="abbrInput"
              value={newTermForm.abbreviation}
              onChange={(e) => setNewTermForm({ ...newTermForm, abbreviation: e.target.value })}
              placeholder="e.g. HT / NDT / PWHT"
              className="rounded-xl h-11 font-mono uppercase"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="catSelect" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "دسته‌بندی تخصصی *" : "Category *"}
            </Label>
            <select
              id="catSelect"
              value={newTermForm.category}
              onChange={(e) => setNewTermForm({ ...newTermForm, category: e.target.value as any })}
              className="w-full h-11 rounded-xl bg-background border border-border/80 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="materials">{isRtl ? "متریال و فولادها" : "Materials & Metallurgy"}</option>
              <option value="equipment">{isRtl ? "تجهیزات و اتصالات" : "Equipment & Components"}</option>
              <option value="jargon">{isRtl ? "اصطلاحات کارگاهی" : "Field & Workshop Jargon"}</option>
              <option value="inspection">{isRtl ? "بازرسی و آزمون" : "Inspection & Testing"}</option>
              <option value="experience">{isRtl ? "فوت‌وفن و تجربیات" : "Field Experience & Tips"}</option>
              <option value="corporate">{isRtl ? "واژگان شرکتی و پروژه" : "Corporate & Projects"}</option>
            </select>
          </div>
        </div>

        {/* Definition */}
        <div className="space-y-1.5">
          <Label htmlFor="descInput" className="font-semibold text-xs sm:text-sm">
            {isRtl ? "شرح و مفهوم کاربردی واژه *" : "Definition & Practical Meaning *"}
          </Label>
          <Textarea
            id="descInput"
            required
            rows={3}
            value={newTermForm.shortDesc}
            onChange={(e) => setNewTermForm({ ...newTermForm, shortDesc: e.target.value })}
            placeholder={isRtl ? "توضیح دهید این واژه یا فرایند در صنعت به چه معناست..." : "Explain what this term or concept means..."}
            className="rounded-xl"
            dir="auto"
          />
        </div>

        {/* Key Tip */}
        <div className="space-y-1.5">
          <Label htmlFor="tipInput" className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>{isRtl ? "نکته طلایی و فوت‌وفن کارگاهی" : "Key Tip & Practical Note"}</span>
          </Label>
          <Textarea
            id="tipInput"
            rows={2}
            value={newTermForm.keyTip}
            onChange={(e) => setNewTermForm({ ...newTermForm, keyTip: e.target.value })}
            placeholder={isRtl ? "نکته‌ای تجربی که در طراحی یا بازرسی باید به آن دقت شود..." : "Crucial field tip or engineering insight..."}
            className="rounded-xl"
            dir="auto"
          />
        </div>

        {/* Standards & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="standardsInput" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "استانداردها (با کاما جدا کنید)" : "Standards (comma separated)"}
            </Label>
            <Input
              id="standardsInput"
              value={formStandardsInput}
              onChange={(e) => setFormStandardsInput(e.target.value)}
              placeholder="e.g. ASME VIII Div 1, API 510"
              className="rounded-xl h-11"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagsInput" className="font-semibold text-xs sm:text-sm">
              {isRtl ? "برچسب‌ها (با کاما جدا کنید)" : "Tags (comma separated)"}
            </Label>
            <Input
              id="tagsInput"
              value={formTagsInput}
              onChange={(e) => setFormTagsInput(e.target.value)}
              placeholder={isRtl ? "مثال: تست فشار، جوشکاری، ضخامت" : "e.g. pressure, welding, quality"}
              className="rounded-xl h-11"
              dir="auto"
            />
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
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full px-7 font-semibold"
          >
            <Plus className="size-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
            <span>{isRtl ? "ثبت و ذخیره واژه" : "Save Custom Term"}</span>
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
            <span>{isRtl ? "واژگان نشان‌شده و برگزیده" : "Bookmarked Vocabulary"}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRtl ? "لغاتی که برای مرور سریع یا مطالعه بعدی ستاره‌دار کرده‌اید." : "Terms you starred for quick reference and study."}
          </p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-full fa-num">
          {bookmarkedTerms.length} {isRtl ? "واژه" : "terms"}
        </span>
      </div>

      {bookmarkedTerms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/60 rounded-3xl border border-dashed border-border/80">
          <Star className="size-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {isRtl ? "هیچ واژه‌ای نشان نشده است" : "No bookmarked terms yet"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {isRtl
              ? "در بخش مرور واژگان، روی آیکون ستاره هر کارت کلیک کنید تا به این بخش اضافه شود."
              : "Click the star icon on any card in the browse tab to save it here."}
          </p>
          <Button onClick={() => setActiveTab("browse")} className="rounded-full">
            <span>{isRtl ? "رفتن به فهرست واژگان" : "Browse Dictionary"}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedTerms.map((term) => {
            const theme = getCategoryTheme(term.category);

            return (
              <div
                key={term.id}
                onClick={() => setSelectedTerm(term)}
                className="group relative rounded-3xl border border-border/80 bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", theme?.pill)}>
                      {term.categoryName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(term.id);
                      }}
                      className="text-amber-500 hover:text-amber-600"
                    >
                      <Star className="size-4 fill-amber-500" />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {term.term}
                  </h3>
                  {term.secondaryTerm && (
                    <p className="text-xs text-muted-foreground mb-2">{term.secondaryTerm}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{term.shortDesc}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[11px] truncate max-w-[75%]">
                    {term.standards?.[0] || term.tags?.[0] || ""}
                  </span>
                  <Copy
                    onClick={(e) => handleCopy(term, e)}
                    className="size-3.5 hover:text-foreground cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 4: FLASHCARDS & STUDY MODE                              */
  /* ──────────────────────────────────────────────────────────── */
  const renderFlashcardsView = () => {
    if (!currentFlashcard) return null;
    const theme = getCategoryTheme(currentFlashcard.category);

    return (
      <div className="max-w-2xl mx-auto w-full py-6 px-4 animate-in fade-in duration-300 flex flex-col items-center">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <span>{isRtl ? "فلش‌کارت و یادگیری تعاملی" : "Interactive Flashcards"}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRtl ? "روی کارت کلیک کنید تا بچرخد و معنی، نکات کلیدی و استانداردهای آن را ببینید." : "Click the card to flip and reveal the definition, tips, and standards."}
          </p>
        </div>

        {/* Score & Counter Stats */}
        <div className="flex items-center justify-between w-full max-w-lg mb-4 text-xs font-semibold px-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="size-3.5" />
              <span>{isRtl ? "مسلط شدم" : "Mastered"}:</span>
              <span className="fa-num font-bold">{knownCount}</span>
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              <RotateCcw className="size-3.5" />
              <span>{isRtl ? "مرور مجدد" : "Need Review"}:</span>
              <span className="fa-num font-bold">{reviewCount}</span>
            </span>
          </div>

          <span className="text-muted-foreground fa-num">
            {flashcardIndex + 1} / {flashcardDeck.length}
          </span>
        </div>

        {/* 3D Flip Flashcard */}
        <div
          onClick={() => setIsCardFlipped(!isCardFlipped)}
          className="relative w-full max-w-lg h-[320px] sm:h-[350px] cursor-pointer perspective-1000 select-none group"
        >
          <motion.div
            animate={{ rotateY: isCardFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full h-full relative rounded-3xl"
          >
            {/* Front of Card */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 w-full h-full rounded-3xl bg-card border-2 border-primary/30 p-6 sm:p-8 flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", theme?.pill)}>
                  {currentFlashcard.categoryName}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakTerm(currentFlashcard.term, currentFlashcard.id);
                  }}
                  className="size-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  <Volume2 className="size-4" />
                </button>
              </div>

              <div className="text-center my-auto">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2" dir="ltr">
                  {currentFlashcard.term}
                </h3>
                {currentFlashcard.abbreviation && (
                  <span className="inline-block px-3 py-1 rounded-lg bg-muted text-xs font-mono font-bold text-muted-foreground mb-2">
                    {currentFlashcard.abbreviation}
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-4 animate-pulse">
                  {isRtl ? "👆 برای مشاهده تعریف کلیک کنید" : "👆 Click to reveal definition"}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
                <span>{currentFlashcard.standards?.[0] || "ASME / API"}</span>
                <span>{isRtl ? "کارت آموزشی مهندسی" : "Engineering Card"}</span>
              </div>
            </div>

            {/* Back of Card */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              className="absolute inset-0 w-full h-full rounded-3xl bg-card/95 border-2 border-primary/50 p-6 sm:p-8 flex flex-col justify-between shadow-xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg text-primary">{currentFlashcard.term}</h4>
                  <span className="text-xs text-muted-foreground font-semibold">{currentFlashcard.secondaryTerm}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">{currentFlashcard.shortDesc}</p>

                {currentFlashcard.keyTip && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-900 dark:text-amber-200 mb-3">
                    <span className="font-bold block mb-1">💡 {isRtl ? "نکته کلیدی:" : "Key Tip:"}</span>
                    {currentFlashcard.keyTip}
                  </div>
                )}
              </div>

              <div className="border-t border-border/40 pt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{currentFlashcard.standards?.join(", ") || ""}</span>
                <span className="text-[11px] opacity-70">{isRtl ? "کلیک برای چرخش" : "Click to flip"}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls: Prev, Know/Don't Know, Next */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevFlashcard}
            className="rounded-full size-11"
            aria-label="Previous card"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" />
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setReviewCount((c) => c + 1);
              handleNextFlashcard();
            }}
            className="rounded-full px-5 h-11 text-rose-600 hover:bg-rose-500/10 border-rose-500/30 font-medium"
          >
            {isRtl ? "نیاز به مرور 🔄" : "Review Later 🔄"}
          </Button>

          <Button
            onClick={() => {
              setKnownCount((c) => c + 1);
              handleNextFlashcard();
            }}
            className="rounded-full px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            {isRtl ? "بلدم ✅" : "Got It ✅"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextFlashcard}
            className="rounded-full size-11"
            aria-label="Next card"
          >
            <ChevronRight className="size-5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    );
  };

  /* ──────────────────────────────────────────────────────────── */
  /* TAB 5: DATA MANAGEMENT & BACKUP VIEW                        */
  /* ──────────────────────────────────────────────────────────── */
  const renderManageView = () => (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 sm:px-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {isRtl ? "مدیریت داده‌ها، خروجی و پشتیبان‌گیری" : "Data Management & Export"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRtl
            ? "از واژگان دستی یا کل دیکشنری خروجی اکسل/JSON بگیرید و یا لغات جدید را از فایل وارد نمایید."
            : "Export custom or complete vocabulary to JSON/CSV or import from backup files."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Export Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Download className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">
              {isRtl ? "پشتیبان‌گیری و خروجی" : "Export Vocabulary"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {isRtl
                ? "دانلود فایل داده‌ها برای استفاده آفلاین یا انتقال به سایر سیستم‌ها."
                : "Download vocabulary data for offline use or backup."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={exportCustomJSON} variant="outline" className="rounded-2xl justify-between">
              <span>{isRtl ? "خروجی لغات من (JSON)" : "Export My Custom Words (JSON)"}</span>
              <span className="text-xs text-muted-foreground">({customTerms.length})</span>
            </Button>
            <Button onClick={exportCustomCSV} variant="outline" className="rounded-2xl justify-between">
              <span>{isRtl ? "خروجی لغات من برای اکسل (CSV)" : "Export My Custom Words (CSV)"}</span>
              <FileText className="size-4 text-muted-foreground" />
            </Button>
            <Button onClick={exportAllJSON} className="rounded-2xl justify-between">
              <span>{isRtl ? "خروجی کل دیکشنری (JSON)" : "Export Full Dictionary (JSON)"}</span>
              <span className="text-xs opacity-80">({allTerms.length})</span>
            </Button>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Upload className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">
              {isRtl ? "وارد کردن فایل پشتیبان" : "Import Vocabulary"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {isRtl
                ? "یک فایل JSON از پیش آماده شده شامل واژگان را بارگذاری کنید."
                : "Upload a JSON file containing vocabulary items."}
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
              <span>{isRtl ? "انتخاب فایل JSON و بارگذاری" : "Select JSON File"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* List of Custom Added Terms */}
      <div className="bg-card border border-border/80 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base sm:text-lg text-foreground">
            {isRtl ? "فهرست لغات دستی من" : "My Custom Terms List"} ({customTerms.length})
          </h3>
          {customTerms.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(isRtl ? "آیا از حذف تمام لغات دستی خود اطمینان دارید؟" : "Are you sure you want to clear all custom terms?")) {
                  clearCustomTerms();
                  showToast(isRtl ? "تمام لغات دستی پاک شدند" : "Custom terms cleared");
                }
              }}
              className="rounded-full text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="size-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
              <span>{isRtl ? "حذف همه لغات دستی" : "Clear All"}</span>
            </Button>
          )}
        </div>

        {customTerms.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            {isRtl ? "هنوز هیچ واژه دستی ثبت نشده است." : "No custom terms added yet."}
          </p>
        ) : (
          <div className="space-y-2">
            {customTerms.map((term) => (
              <div
                key={term.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50 text-sm"
              >
                <div>
                  <span className="font-bold text-foreground">{term.term}</span>
                  {term.secondaryTerm && <span className="text-xs text-muted-foreground ms-2">({term.secondaryTerm})</span>}
                  <p className="text-xs text-muted-foreground line-clamp-1">{term.shortDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCustomTerm(term.id)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                  title={isRtl ? "حذف واژه" : "Delete"}
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
      {/* 1. App Header with Tag = "dictionary" */}
      <AppHeader
        tag="dictionary"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
        position="absolute"
      />

      {/* Toast Notification Popup - Strictly centered on screen vertical axis */}
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
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* 2. Sidebar Navigation (Directly following Profile Page Layout) */}
        <aside
          className={cn(
            "flex flex-col shrink-0 h-full bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none",
            "absolute md:relative start-0 top-0",
            sidebarOpen
              ? "w-64 ps-3 sm:ps-6 pe-4 py-6 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "max-md:-translate-x-full max-md:rtl:translate-x-full max-md:opacity-0 max-md:pointer-events-none md:translate-x-0 md:rtl:translate-x-0 rtl:md:translate-x-0 md:opacity-100 md:pointer-events-auto md:w-[90px] md:px-0 md:py-6"
          )}
        >
          <TooltipProvider>
            <nav className={cn("flex flex-col gap-2.5 w-full", sidebarOpen ? "items-start ps-3 sm:ps-6" : "items-center px-0")}>
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
          {activeTab === "add" && renderAddWordView()}
          {activeTab === "bookmarks" && renderBookmarksView()}
          {activeTab === "flashcards" && renderFlashcardsView()}
          {activeTab === "manage" && renderManageView()}
        </main>
      </div>

      {/* 4. Complete Detail Modal for Selected Term */}
      <Dialog open={Boolean(selectedTerm)} onOpenChange={(open) => !open && setSelectedTerm(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 sm:p-8" dir={isRtl ? "rtl" : "ltr"}>
          {selectedTerm && (
            <div>
              <DialogHeader className="mb-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", getCategoryTheme(selectedTerm.category)?.pill)}>
                    {selectedTerm.categoryName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => speakTerm(selectedTerm.term, selectedTerm.id)}
                      className="size-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      title={isRtl ? "تلفظ صوتی" : "Pronounce"}
                    >
                      <Volume2 className={cn("size-4", speakingId === selectedTerm.id && "animate-pulse")} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(selectedTerm.id)}
                      className="size-8 rounded-full bg-muted flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"
                      title={isRtl ? "نشان کردن" : "Bookmark"}
                    >
                      <Star className={cn("size-4", isBookmarked(selectedTerm.id) && "fill-amber-500 text-amber-500")} />
                    </button>
                  </div>
                </div>

                <DialogTitle className="text-2xl font-bold text-foreground" dir="ltr">
                  {selectedTerm.term}
                </DialogTitle>
                {selectedTerm.secondaryTerm && (
                  <DialogDescription className="text-sm font-semibold text-primary mt-0.5">
                    {selectedTerm.secondaryTerm}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Definition */}
              <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {isRtl ? "مفهوم کاربردی و شرح مهندسی:" : "Engineering Definition:"}
                  </h4>
                  <p className="bg-muted/40 p-3.5 rounded-2xl border border-border/40 text-foreground">
                    {selectedTerm.shortDesc}
                  </p>
                </div>

                {selectedTerm.keyTip && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                      <Sparkles className="size-3.5" />
                      <span>{isRtl ? "نکته طلایی و فوت‌وفن کارگاهی:" : "Key Field Tip:"}</span>
                    </h4>
                    <p className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-amber-950 dark:text-amber-200">
                      {selectedTerm.keyTip}
                    </p>
                  </div>
                )}

                {selectedTerm.standards && selectedTerm.standards.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {isRtl ? "استانداردهای مهندسی مرجع:" : "Reference Codes & Standards:"}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTerm.standards.map((std, i) => (
                        <span key={i} className="font-mono text-xs bg-muted px-2.5 py-1 rounded-xl border border-border/50">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTerm.tags && selectedTerm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {selectedTerm.tags.map((tag, i) => (
                      <span key={i} className="text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <Button
                  onClick={() => handleCopy(selectedTerm)}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4"
                >
                  <Copy className="size-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  <span>{isRtl ? "کپی مشخصات" : "Copy Info"}</span>
                </Button>

                <Button
                  onClick={() => setSelectedTerm(null)}
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
