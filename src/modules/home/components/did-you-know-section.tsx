"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getDidYouKnowCards,
  type DidYouKnowCardItem,
} from "../data/did-you-know-data";

const AUTOPLAY_DURATION_MS = 6500;

interface DidYouKnowSectionProps {
  className?: string;
}

export function DidYouKnowSection({ className }: DidYouKnowSectionProps) {
  const t = useTranslations("Home.didYouKnow");
  const locale = useLocale();
  const isRtl = locale === "fa";

const STORAGE_KEY = "esp_dyk_seen_ids_v2";

  // Initial cards for SSR, then non-repeating cycle randomization on mount
  const initialCards = useMemo(() => getDidYouKnowCards(locale), [locale]);
  const [cards, setCards] = useState<DidYouKnowCardItem[]>(initialCards);

  // Non-repeating random cycle: Unseen cards appear first until ALL cards have been shown once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let seenIds: string[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(seenIds)) seenIds = [];

      const all = getDidYouKnowCards(locale);
      const allIds = new Set(all.map((c) => c.id));
      seenIds = seenIds.filter((id) => allIds.has(id));

      // When all cards have been seen once, start a fresh new cycle
      if (seenIds.length >= all.length) {
        seenIds = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }

      const unseen = all.filter((c) => !seenIds.includes(c.id));
      const seen = all.filter((c) => seenIds.includes(c.id));

      // Shuffle unseen cards randomly for this session
      const shuffledUnseen = [...unseen].sort(() => Math.random() - 0.5);
      // Seen cards follow behind to maintain full carousel length
      const shuffledSeen = [...seen].sort(() => Math.random() - 0.5);

      const finalDeck = [...shuffledUnseen, ...shuffledSeen];
      setCards(finalDeck);

      // Record the initial card as viewed in this session
      if (finalDeck.length > 0) {
        const firstId = finalDeck[0].id;
        if (!seenIds.includes(firstId)) {
          seenIds.push(firstId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seenIds));
        }
      }
    } catch {
      const randomSeed = Math.floor(Math.random() * 1000000) + 1;
      setCards(getDidYouKnowCards(locale, randomSeed));
    }
  }, [locale]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: isRtl ? "rtl" : "ltr",
    align: "center",
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());

    // Track viewed card in localStorage so it won't repeat at the top until all cards are viewed
    try {
      const currentCard = cards[index];
      if (currentCard) {
        const raw = localStorage.getItem(STORAGE_KEY);
        let seenIds: string[] = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(seenIds)) seenIds = [];
        if (!seenIds.includes(currentCard.id)) {
          seenIds.push(currentCard.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seenIds));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [emblaApi, cards]);

  const [progress, setProgress] = useState(0);

  // Reset progress when slide changes (manual click or loop advance)
  useEffect(() => {
    setProgress(0);
  }, [selectedIndex]);

  // Frame-accurate progress bar loop with instant hover freeze (hold)
  useEffect(() => {
    if (!emblaApi) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isPaused) {
        setProgress((prev) => {
          const next = prev + (delta / AUTOPLAY_DURATION_MS) * 100;
          if (next >= 100) {
            emblaApi.scrollNext();
            return 0;
          }
          return next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [emblaApi, isPaused]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto flex flex-col items-center select-none my-auto shrink-0",
        className
      )}
    >
      {/* 1. Header with Catchy Title & Carousel Controls (Width aligned to center card) */}
      <div className="w-[94%] sm:w-[86%] md:w-[80%] lg:w-[75%] max-w-4xl px-2 sm:px-3 mx-auto flex items-center justify-between mb-2 sm:mb-2.5 shrink-0">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label={t("prev")}
            className="size-8 sm:size-9 rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-xs"
          >
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label={t("next")}
            className="size-8 sm:size-9 rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-xs"
          >
            {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </div>
      </div>

      {/* 2. Timer Progress Line Above Cards */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="w-[94%] sm:w-[86%] md:w-[80%] lg:w-[75%] max-w-4xl px-2 sm:px-3 mx-auto mb-2 sm:mb-2.5 shrink-0"
      >
        <div className="h-1 sm:h-1.5 w-full bg-muted/60 dark:bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-none shadow-[0_0_8px_var(--primary)]"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }}
          />
        </div>
      </div>

      {/* 3. Embla Cards Track with side fade mask & generous shadow breathing room */}
      <div className="relative w-full">
        <div
          className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)]"
          ref={emblaRef}
        >
          <div className="flex w-full touch-pan-y pt-2.5 sm:pt-3 pb-7 sm:pb-9">
            {cards.map((card, index) => {
              const isActive = index === selectedIndex;

              return (
                <div
                  key={card.id}
                  className={cn(
                    "min-w-0 shrink-0 grow-0 basis-[94%] sm:basis-[86%] md:basis-[80%] lg:basis-[75%] max-w-4xl px-2 sm:px-3",
                    // Inactive (cut-off side) cards ignore pointer events completely so only the active card responds to hover
                    !isActive && "pointer-events-none"
                  )}
                >
                  {/* Card Container: Only active card takes hover border and holds autoplay */}
                  <div
                    className={cn(
                      "relative w-full h-[285px] sm:h-[310px] md:h-[325px] rounded-2xl sm:rounded-3xl transition-all duration-300",
                      "border bg-card/95 dark:bg-[#0e1017]/95 backdrop-blur-2xl p-4.5 sm:p-6 md:p-7 flex flex-col justify-between overflow-hidden",
                      isActive
                        ? cn(
                            "border-primary/25 shadow-md shadow-slate-950/10 dark:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.65)] opacity-100 scale-100 pointer-events-auto",
                            card.borderAccent
                          )
                        : "border-border/40 opacity-50 scale-[0.98] pointer-events-none select-none"
                    )}
                    onMouseEnter={() => {
                      if (isActive) setIsPaused(true);
                    }}
                    onMouseLeave={() => {
                      if (isActive) setIsPaused(false);
                    }}
                  >
                    {/* Glowing Aura */}
                    <div
                      className={cn(
                        "absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br blur-3xl pointer-events-none opacity-60",
                        card.glowGradient
                      )}
                    />

                    {/* Card Content Column - Vertically Spaced & Responsive */}
                    <div className="w-full flex flex-col justify-between h-full relative z-10">
                      {/* Top: Category Tag & Slide Counter */}
                      <div className="flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-auto py-1.5 px-3.5 sm:py-2 sm:px-4.5 text-xs sm:text-[13px] font-semibold rounded-full border shadow-2xs leading-none",
                              card.accent
                            )}
                          >
                            <span>{card.category}</span>
                          </Badge>
                          <span className="hidden sm:inline-flex items-center h-auto text-xs sm:text-[13px] font-medium text-muted-foreground px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-muted/60 border border-border/50 leading-none">
                            {card.tag}
                          </span>
                        </div>

                        {/* Slide Counter (e.g. 1 / 52) */}
                        <div
                          dir="ltr"
                          className="fa-num text-xs sm:text-sm font-sans font-semibold text-muted-foreground/90 bg-muted/50 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-border/50 tabular-nums select-none flex items-center justify-center"
                        >
                          <span>{index + 1}</span>
                          <span className="mx-0.5 sm:mx-1 text-muted-foreground/45 font-normal">/</span>
                          <span>{cards.length}</span>
                        </div>
                      </div>

                      {/* Middle: Question Hook & Detailed Scientific Fact */}
                      <div className="space-y-1.5 sm:space-y-2 my-auto py-1">
                        <h3 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-foreground leading-snug line-clamp-2">
                          {card.title}
                        </h3>

                        <p className="text-xs sm:text-[13px] md:text-sm text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-4">
                          {card.description}
                        </p>
                      </div>

                      {/* Bottom: Scientific Formula & External Reference Link */}
                      <div className="pt-2 sm:pt-2.5 shrink-0 flex items-center justify-between gap-2.5 border-t border-border/40 min-h-[44px]">
                        {/* Formula Container: Generous white/dark pill */}
                        <div className="inline-flex items-center px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-xs min-w-0 max-w-[65%] sm:max-w-[72%]">
                          <div
                            dir="ltr"
                            translate="no"
                            className="truncate text-xs sm:text-[13px] md:text-sm font-normal tracking-wide text-black dark:text-white select-all antialiased flex items-center"
                            style={{
                              fontFamily: "'LatinModernMath', 'NotoSansMath', 'Cambria Math', serif",
                              textRendering: "geometricPrecision",
                              WebkitFontSmoothing: "antialiased",
                              MozOsxFontSmoothing: "grayscale",
                            }}
                          >
                            <span>{card.formula}</span>
                          </div>
                        </div>

                        {/* Reference Link */}
                        <a
                          href={card.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-xl hover:bg-muted/70 shrink-0 border border-border/50 hover:border-border cursor-pointer shadow-2xs"
                          title={card.ref}
                        >
                          <BookOpen className="size-3.5 text-primary/80 shrink-0" />
                          <span className="truncate max-w-[95px] sm:max-w-[135px]">{card.ref}</span>
                          <ExternalLink className="size-3 opacity-70 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
