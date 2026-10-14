"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Gauge,
  Atom,
  Zap,
  Activity,
  Wind,
  Snowflake,
  ShieldAlert,
  Layers,
  Repeat,
  Volume2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DidYouKnowCard {
  id:
    | "card1"
    | "card2"
    | "card3"
    | "card4"
    | "card5"
    | "card6"
    | "card7"
    | "card8"
    | "card9"
    | "card10";
  icon: typeof Gauge;
  accent: string;
  glowGradient: string;
  borderAccent: string;
  link: string;
}

const CARDS: DidYouKnowCard[] = [
  {
    id: "card1",
    icon: Gauge,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    glowGradient: "from-blue-500/15 via-cyan-500/10 to-transparent",
    borderAccent: "hover:border-blue-500/40",
    link: "https://en.wikipedia.org/wiki/Cylinder_stress",
  },
  {
    id: "card2",
    icon: Atom,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    glowGradient: "from-emerald-500/15 via-teal-500/10 to-transparent",
    borderAccent: "hover:border-emerald-500/40",
    link: "https://en.wikipedia.org/wiki/Hydrocyclone",
  },
  {
    id: "card3",
    icon: Zap,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    glowGradient: "from-amber-500/15 via-orange-500/10 to-transparent",
    borderAccent: "hover:border-amber-500/40",
    link: "https://en.wikipedia.org/wiki/Cavitation",
  },
  {
    id: "card4",
    icon: Activity,
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    glowGradient: "from-rose-500/15 via-pink-500/10 to-transparent",
    borderAccent: "hover:border-rose-500/40",
    link: "https://en.wikipedia.org/wiki/Water_hammer",
  },
  {
    id: "card5",
    icon: Wind,
    accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
    glowGradient: "from-cyan-500/15 via-sky-500/10 to-transparent",
    borderAccent: "hover:border-cyan-500/40",
    link: "https://en.wikipedia.org/wiki/K%C3%A1rm%C3%A1n_vortex_street",
  },
  {
    id: "card6",
    icon: Snowflake,
    accent: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25",
    glowGradient: "from-teal-500/15 via-cyan-500/10 to-transparent",
    borderAccent: "hover:border-teal-500/40",
    link: "https://en.wikipedia.org/wiki/Joule%E2%80%93Thomson_effect",
  },
  {
    id: "card7",
    icon: ShieldAlert,
    accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25",
    glowGradient: "from-orange-500/15 via-amber-500/10 to-transparent",
    borderAccent: "hover:border-orange-500/40",
    link: "https://en.wikipedia.org/wiki/Hydrogen_embrittlement",
  },
  {
    id: "card8",
    icon: Layers,
    accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    glowGradient: "from-indigo-500/15 via-violet-500/10 to-transparent",
    borderAccent: "hover:border-indigo-500/40",
    link: "https://en.wikipedia.org/wiki/Two-phase_flow",
  },
  {
    id: "card9",
    icon: Repeat,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
    glowGradient: "from-violet-500/15 via-purple-500/10 to-transparent",
    borderAccent: "hover:border-violet-500/40",
    link: "https://en.wikipedia.org/wiki/Logarithmic_mean_temperature_difference",
  },
  {
    id: "card10",
    icon: Volume2,
    accent: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/25",
    glowGradient: "from-fuchsia-500/15 via-pink-500/10 to-transparent",
    borderAccent: "hover:border-fuchsia-500/40",
    link: "https://en.wikipedia.org/wiki/Choked_flow",
  },
];

const AUTOPLAY_DURATION_MS = 6500;

function MathFormula({ cardId }: { cardId: DidYouKnowCard["id"] }) {
  switch (cardId) {
    case "card1":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span><i>σ</i><sub className="text-[11px] sm:text-xs md:text-[13px]">hoop</sub></span>
          <span>=</span>
          <span>2<i>σ</i><sub className="text-[11px] sm:text-xs md:text-[13px]">long</sub></span>
          <span>=</span>
          <span className="inline-flex flex-col items-center align-middle text-center leading-none mx-0.5">
            <span className="border-b border-current pb-[1px] px-1 text-[12px] sm:text-[14px] md:text-[15px]"><i>P</i> · <i>D</i></span>
            <span className="pt-[1px] px-1 text-[12px] sm:text-[14px] md:text-[15px]">2<i>t</i></span>
          </span>
        </span>
      );
    case "card2":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span><i>F</i><sub className="text-[11px] sm:text-xs md:text-[13px]">c</sub></span>
          <span>=</span>
          <span className="inline-flex flex-col items-center align-middle text-center leading-none mx-0.5">
            <span className="border-b border-current pb-[1px] px-1 text-[12px] sm:text-[14px] md:text-[15px]"><i>m</i> · <i>v</i><sup className="text-[10px] sm:text-[11px] md:text-xs">2</sup></span>
            <span className="pt-[1px] px-1 text-[12px] sm:text-[14px] md:text-[15px]"><i>r</i></span>
          </span>
          <span>≫</span>
          <span><i>F</i><sub className="text-[11px] sm:text-xs md:text-[13px]">gravity</sub></span>
        </span>
      );
    case "card3":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span>NPSH<sub className="text-[11px] sm:text-xs md:text-[13px]">a</sub></span>
          <span>&gt;</span>
          <span>NPSH<sub className="text-[11px] sm:text-xs md:text-[13px]">r</sub> + 0.5 m</span>
        </span>
      );
    case "card4":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span>Δ<i>P</i></span>
          <span>=</span>
          <span><i>ρ</i> · <i>a</i> · Δ<i>v</i></span>
          <span className="text-[11px] sm:text-xs opacity-60 font-sans tracking-normal ml-0.5">(Joukowsky)</span>
        </span>
      );
    case "card5":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span><i>f</i><sub className="text-[11px] sm:text-xs md:text-[13px]">shed</sub></span>
          <span>=</span>
          <span className="inline-flex flex-col items-center align-middle text-center leading-none mx-0.5">
            <span className="border-b border-current pb-[1px] px-1 text-[12px] sm:text-[14px] md:text-[15px]"><i>St</i> · <i>v</i></span>
            <span className="pt-[1px] px-1 text-[12px] sm:text-[14px] md:text-[15px]"><i>D</i></span>
          </span>
          <span className="text-[11px] sm:text-xs opacity-60 font-sans tracking-normal ml-0.5">(<i>St</i> ≈ 0.2)</span>
        </span>
      );
    case "card6":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span><i>μ</i><sub className="text-[11px] sm:text-xs md:text-[13px]">JT</sub></span>
          <span>=</span>
          <span className="inline-flex items-center">
            <span className="text-base sm:text-lg leading-none font-light">(</span>
            <span className="inline-flex flex-col items-center align-middle text-center leading-none mx-0.5">
              <span className="border-b border-current pb-[1px] px-0.5 text-[12px] sm:text-[14px] md:text-[15px]">∂<i>T</i></span>
              <span className="pt-[1px] px-0.5 text-[12px] sm:text-[14px] md:text-[15px]">∂<i>P</i></span>
            </span>
            <span className="text-base sm:text-lg leading-none font-light">)</span>
            <sub className="text-[11px] sm:text-xs md:text-[13px] -ml-0.5"><i>h</i></sub>
          </span>
          <span>&gt;</span>
          <span>0</span>
        </span>
      );
    case "card7":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span>Hardness ≤ 22 HRC</span>
          <span className="text-[11px] sm:text-xs opacity-60 font-sans tracking-normal ml-0.5">(NACE Limit)</span>
        </span>
      );
    case "card8":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span><i>F</i><sub className="text-[11px] sm:text-xs md:text-[13px]">impact</sub></span>
          <span>=</span>
          <span><i>ρ</i><sub className="text-[11px] sm:text-xs md:text-[13px]">liq</sub> · <i>A</i> · <i>v</i><sub className="text-[11px] sm:text-xs md:text-[13px]">slug</sub><sup className="text-[10px] sm:text-[11px] md:text-xs">2</sup></span>
        </span>
      );
    case "card9":
      return (
        <span className="inline-flex items-center gap-1.5 font-['LatinModernMath',serif]">
          <span>LMTD<sub className="text-[11px] sm:text-xs md:text-[13px]">counter</sub></span>
          <span>&gt;</span>
          <span>LMTD<sub className="text-[11px] sm:text-xs md:text-[13px]">parallel</sub></span>
        </span>
      );
    case "card10":
      return (
        <span className="inline-flex items-center gap-1 font-['LatinModernMath',serif]">
          <span className="inline-flex flex-col items-center align-middle text-center leading-none mx-0.5">
            <span className="border-b border-current pb-[1px] px-1 text-[11px] sm:text-[13px] md:text-[14px]"><i>P</i><sub className="text-[9px] sm:text-[10px]">crit</sub></span>
            <span className="pt-[1px] px-1 text-[11px] sm:text-[13px] md:text-[14px]"><i>P</i><sub className="text-[9px] sm:text-[10px]">up</sub></span>
          </span>
          <span>=</span>
          <span className="inline-flex items-center">
            <span className="text-base sm:text-lg leading-none font-light">[</span>
            <span className="inline-flex flex-col items-center align-middle text-center leading-none mx-0.5">
              <span className="border-b border-current pb-[1px] px-1 text-[11px] sm:text-[13px] md:text-[14px]">2</span>
              <span className="pt-[1px] px-1 text-[11px] sm:text-[13px] md:text-[14px]"><i>k</i> + 1</span>
            </span>
            <span className="text-base sm:text-lg leading-none font-light">]</span>
            <sup className="inline-flex flex-col items-center text-[9px] sm:text-[10px] md:text-[11px] leading-none -mt-2.5 ml-0.5">
              <span className="border-b border-current pb-[0.5px]"><i>k</i></span>
              <span className="pt-[0.5px]"><i>k</i> − 1</span>
            </sup>
          </span>
        </span>
      );
    default:
      return null;
  }
}

interface DidYouKnowSectionProps {
  className?: string;
}

export function DidYouKnowSection({ className }: DidYouKnowSectionProps) {
  const t = useTranslations("Home.didYouKnow");
  const locale = useLocale();
  const isRtl = locale === "fa";

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

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

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
        "w-full max-w-5xl mx-auto flex flex-col items-center select-none my-auto",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Header with Catchy Title & Carousel Controls (Width aligned to center card) */}
      <div className="w-[96%] sm:w-[88%] md:w-[82%] px-2 sm:px-3 mx-auto flex items-center justify-between mb-2 sm:mb-3 shrink-0">
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

      {/* 2. Embla Cards Track with side fade mask & generous shadow breathing room */}
      <div className="relative w-full">
        <div
          className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)]"
          ref={emblaRef}
        >
          <div className="flex w-full touch-pan-y pt-2 pb-12 sm:pb-14">
          {CARDS.map((card, index) => {
            const isActive = index === selectedIndex;

            return (
              <div
                key={card.id}
                className="min-w-0 shrink-0 grow-0 basis-[96%] sm:basis-[88%] md:basis-[82%] px-2 sm:px-3"
              >
                {/* Outer Card Wrapper with exact rounded-2xl sm:rounded-3xl fillet */}
                <div
                  className={cn(
                    "relative w-full h-[310px] sm:h-[335px] md:h-[350px] rounded-2xl sm:rounded-3xl transition-all duration-300",
                    isActive
                      ? "p-[2.5px] shadow-xl shadow-slate-950/15 dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7)] opacity-100 scale-100"
                      : "p-px opacity-55 scale-[0.98]"
                  )}
                >
                  {/* Border Progress Ring for Active Card / Subtle Border for Inactive (Concentric Fillet) */}
                  {isActive ? (
                    <div
                      className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none overflow-hidden"
                      style={{
                        background: `conic-gradient(from 0deg at 50% 50%, var(--primary) 0%, var(--primary) ${progress}%, color-mix(in srgb, var(--primary) 18%, transparent) ${progress}%, color-mix(in srgb, var(--primary) 18%, transparent) 100%)`,
                        filter: "drop-shadow(0 0 6px var(--primary))",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none bg-border/40" />
                  )}

                  {/* Card Content Interior with exact concentric fillet */}
                  <div
                    className={cn(
                      "relative size-full rounded-[calc(1rem-2.5px)] sm:rounded-[calc(1.5rem-2.5px)] bg-card/95 dark:bg-[#0e1017]/95 backdrop-blur-2xl p-5 sm:p-7 md:p-8 flex flex-col justify-center overflow-hidden transition-all duration-300",
                      card.borderAccent
                    )}
                  >
                    {/* Glowing Aura */}
                    <div
                      className={cn(
                        "absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br blur-3xl pointer-events-none opacity-60",
                        card.glowGradient
                      )}
                    />

                    {/* Card Content Column - Vertically Centered */}
                    <div className="w-full flex flex-col justify-center gap-3.5 sm:gap-4 relative z-10 my-auto">
                      {/* Top: Category Tag (No icon, generous border padding) & Slide Counter (Correct Sans font 2/10) */}
                      <div className="flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-auto py-2 px-4 sm:py-2.5 sm:px-5 text-xs sm:text-[13px] font-semibold rounded-full border shadow-2xs leading-none",
                              card.accent
                            )}
                          >
                            <span>{t(`cards.${card.id}.category`)}</span>
                          </Badge>
                          <span className="hidden sm:inline-flex items-center h-auto text-xs sm:text-[13px] font-medium text-muted-foreground px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-muted/60 border border-border/50 leading-none">
                            {t(`cards.${card.id}.tag`)}
                          </span>
                        </div>

                        {/* Slide Counter: Standard Sans font with Tabular Nums & proper LTR direction (e.g. 2/10) */}
                        <div
                          dir="ltr"
                          className="fa-num text-xs sm:text-sm font-sans font-semibold text-muted-foreground/90 bg-muted/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-border/50 tabular-nums select-none flex items-center justify-center"
                        >
                          <span>{index + 1}</span>
                          <span className="mx-0.5 sm:mx-1 text-muted-foreground/45 font-normal">/</span>
                          <span>{CARDS.length}</span>
                        </div>
                      </div>

                      {/* Middle: Question Hook & Detailed Scientific Fact */}
                      <div className="space-y-2 sm:space-y-2.5">
                        <h3 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
                          {t(`cards.${card.id}.title`)}
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-4">
                          {t(`cards.${card.id}.description`)}
                        </p>
                      </div>

                      {/* Bottom: Scientific Formula (Icon removed, generous white pill, larger readable font) & External Reference Link */}
                      <div className="pt-2.5 shrink-0 flex items-center justify-between gap-2.5 border-t border-border/40 min-h-[50px]">
                        {/* Formula Container: No icon, larger space, pure white pill */}
                        <div className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-xs min-w-0 max-w-[70%] sm:max-w-[74%]">
                          <div
                            dir="ltr"
                            translate="no"
                            className="truncate text-sm sm:text-base md:text-[18px] font-normal tracking-wide text-black dark:text-white select-all antialiased flex items-center"
                            style={{
                              fontFamily: "'LatinModernMath', 'NotoSansMath', 'Cambria Math', serif",
                              textRendering: "geometricPrecision",
                              WebkitFontSmoothing: "antialiased",
                              MozOsxFontSmoothing: "grayscale",
                            }}
                          >
                            <MathFormula cardId={card.id} />
                          </div>
                        </div>

                        <a
                          href={card.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2 px-2.5 sm:px-3 rounded-xl hover:bg-muted/70 shrink-0 border border-border/50 hover:border-border cursor-pointer shadow-2xs"
                          title={t(`cards.${card.id}.ref`)}
                        >
                          <BookOpen className="size-3.5 text-primary/80 shrink-0" />
                          <span className="truncate max-w-[95px] sm:max-w-[135px]">{t(`cards.${card.id}.ref`)}</span>
                          <ExternalLink className="size-3 opacity-70 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* 3. Pagination Dots (Indicator Group for 10 Slides) */}
      <div className="flex items-center justify-center gap-1.5 shrink-0 mt-1 sm:mt-1.5 pb-0.5">
        {CARDS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              "h-1.5 sm:h-2 rounded-full transition-all duration-300 outline-none cursor-pointer",
              i === selectedIndex
                ? "w-5 sm:w-6 bg-primary shadow-xs shadow-primary/40"
                : "w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
