"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import {
  TreeStructure,
  Cpu,
  VideoCamera,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SlideConfig {
  id: "espFlow" | "vesselWeight" | "aparatAcademy";
  badgeKey: "free" | "accountRequired" | "accessRequired";
  href: string;
  icon: typeof TreeStructure;
  accentPill: string;
  glowGradient: string;
  canvasGradient: string;
  btnClass: string;
  chips: string[];
}

const SLIDES: SlideConfig[] = [
  {
    id: "espFlow",
    badgeKey: "accessRequired",
    href: "/ESP-Flow",
    icon: TreeStructure,
    accentPill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    glowGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    canvasGradient: "from-cyan-600/30 via-blue-600/20 to-slate-900/80 dark:from-cyan-950/80 dark:via-blue-950/60 dark:to-[#0a0d14]",
    btnClass: "bg-sky-600 hover:bg-sky-500 text-white",
    chips: ["chip1", "chip2", "chip3"],
  },
  {
    id: "vesselWeight",
    badgeKey: "accountRequired",
    href: "/Weight-Flow",
    icon: Cpu,
    accentPill: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    glowGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    canvasGradient: "from-amber-600/30 via-orange-600/20 to-slate-900/80 dark:from-amber-950/80 dark:via-orange-950/60 dark:to-[#0a0d14]",
    btnClass: "bg-amber-600 hover:bg-amber-500 text-white",
    chips: ["chip1", "chip2", "chip3"],
  },
  {
    id: "aparatAcademy",
    badgeKey: "free",
    href: "/aparat",
    icon: VideoCamera,
    accentPill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    glowGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    canvasGradient: "from-emerald-600/30 via-teal-600/20 to-slate-900/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-[#0a0d14]",
    btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
    chips: ["chip1", "chip2", "chip3"],
  },
];

interface FreeModulesBannerProps {
  className?: string;
}

export function FreeModulesBanner({ className }: FreeModulesBannerProps) {
  const t = useTranslations("Home.freeBanners");
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

  // Autoplay (5 seconds, pauses on hover)
  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused]);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto flex flex-col items-center select-none my-auto",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Header with Title & Prev/Next Controls (Width aligned to center card) */}
      <div className="w-[94%] sm:w-[88%] md:w-[82%] lg:w-[78%] px-2 sm:px-3 mx-auto flex items-center justify-between mb-2 sm:mb-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Carousel Trigger Buttons */}
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

      {/* 2. Embla Cards Viewport & Track with side fade mask & generous shadow breathing room */}
      <div className="relative w-full">
        <div
          className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)]"
          ref={emblaRef}
        >
          <div className="flex w-full touch-pan-y pt-2 pb-12 sm:pb-14">
          {SLIDES.map((slide, index) => {
            const isActive = index === selectedIndex;
            const IconComponent = slide.icon;

            return (
              <div
                key={slide.id}
                className="min-w-0 shrink-0 grow-0 basis-[94%] sm:basis-[88%] md:basis-[82%] lg:basis-[78%] px-2 sm:px-3"
              >
                <div
                  className={cn(
                    "relative w-full h-[295px] sm:h-[320px] md:h-[335px] rounded-2xl sm:rounded-3xl border bg-card/90 dark:bg-[#0e1017]/90 backdrop-blur-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300",
                    isActive
                      ? "border-border/80 shadow-xl shadow-slate-950/15 dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7)] opacity-100 scale-100 ring-1 ring-border/50"
                      : "border-border/40 opacity-55 scale-[0.98]"
                  )}
                >
                  {/* Module Text & Actions - Vertically Centered in Column */}
                  <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-7 z-10 min-h-0">
                    <div className="w-full flex flex-col justify-center gap-3 sm:gap-3.5 my-auto">
                      {/* Header Row: Badge + Slide Counter */}
                      <div className="flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-auto gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 text-xs font-semibold border rounded-full leading-none",
                              slide.accentPill
                            )}
                          >
                            <IconComponent weight="duotone" className="size-4 shrink-0" />
                            <span>{t(`badges.${slide.badgeKey}`)}</span>
                          </Badge>
                        </div>

                        <div
                          dir="ltr"
                          className="fa-num text-xs sm:text-sm font-sans font-semibold text-muted-foreground/90 bg-muted/50 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full border border-border/50 tabular-nums select-none flex items-center justify-center"
                        >
                          <span>{index + 1}</span>
                          <span className="mx-0.5 sm:mx-1 text-muted-foreground/45 font-normal">/</span>
                          <span>{SLIDES.length}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <div>
                          <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                            {t(`modules.${slide.id}.title`)}
                          </h3>
                          <p className="text-xs sm:text-sm font-medium text-primary/90 mt-0.5">
                            {t(`modules.${slide.id}.tagline`)}
                          </p>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl">
                          {t(`modules.${slide.id}.description`)}
                        </p>

                        {/* Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {slide.chips.map((chipKey) => (
                            <span
                              key={chipKey}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium bg-muted/60 dark:bg-muted/30 border border-border/50 text-foreground/80"
                            >
                              <CheckCircle2 className="size-3 sm:size-3.5 text-primary shrink-0" />
                              <span>{t(`modules.${slide.id}.${chipKey}`)}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA Action */}
                      <div className="pt-2 shrink-0 border-t border-border/40 flex items-center justify-between">
                        {(() => {
                          const isFree = slide.badgeKey === "free";
                          const targetHref = isFree ? `/${locale}${slide.href}` : `/${locale}/login`;

                          return (
                            <Button
                              asChild
                              size="sm"
                              className={cn(
                                "h-9 px-4 sm:px-6 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 outline-none cursor-pointer border-0 shadow-none",
                                slide.btnClass
                              )}
                            >
                              <Link href={targetHref}>
                                <span>{t("launch")}</span>
                                <ArrowIcon className="size-4 shrink-0" />
                              </Link>
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Banner Visual Preview (Pure Modern Gradient) */}
                  <div className="relative md:w-5/12 lg:w-1/2 h-36 sm:h-44 md:h-full shrink-0 overflow-hidden border-t md:border-t-0 md:border-s border-border/50">
                    {/* Main Theme Gradient */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br transition-all duration-700",
                        slide.canvasGradient
                      )}
                    />

                    {/* Ambient Glow & Radial Highlight */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_65%)] pointer-events-none" />

                    {/* Subtle Engineering Icon Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <IconComponent
                        weight="duotone"
                        className="size-28 sm:size-36 md:size-44 opacity-20 text-foreground transition-transform duration-700 hover:scale-105"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none z-10" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* 3. Pagination Dots (Indicator Group) */}
      <div className="flex items-center justify-center gap-2 shrink-0 mt-1 sm:mt-1.5 pb-0.5">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === selectedIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollTo(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300 outline-none cursor-pointer",
                isActive
                  ? "w-7 bg-primary shadow-xs shadow-primary/40"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
