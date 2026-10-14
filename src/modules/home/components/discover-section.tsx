"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Gauge,
  Calculator,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface DiscoverItem {
  id: "item1" | "item2" | "item3" | "item4";
  icon: typeof Compass;
  href: string;
  gradient: string;
  accentBadge: string;
  glowBg: string;
}

const DISCOVER_ITEMS: DiscoverItem[] = [
  {
    id: "item1",
    icon: Gauge,
    href: "/Weight-Flow",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    accentBadge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    glowBg: "from-blue-600/10 to-cyan-600/10",
  },
  {
    id: "item2",
    icon: GitBranch,
    href: "/ESP-Flow",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    accentBadge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    glowBg: "from-emerald-600/10 to-teal-600/10",
  },
  {
    id: "item3",
    icon: Workflow,
    href: "/Weight-Flow",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    accentBadge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    glowBg: "from-amber-600/10 to-orange-600/10",
  },
  {
    id: "item4",
    icon: Calculator,
    href: "/dashboard",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    accentBadge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    glowBg: "from-purple-600/10 to-pink-600/10",
  },
];

export function DiscoverSection({ className }: { className?: string }) {
  const t = useTranslations("Home.discoverSection");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeItem = DISCOVER_ITEMS[selectedIdx];
  const IconComponent = activeItem.icon;
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div
      className={cn(
        "relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-3 sm:px-6 select-none",
        className
      )}
    >
      {/* Header Eyebrow & Title */}
      <div className="text-center mt-1 sm:mt-2 mb-5 sm:mb-7 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] sm:text-xs font-semibold text-primary mb-2">
          <Compass className="size-3.5" />
          <span>{t("eyebrow")}</span>
        </div>
        <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {t("subtitle")}
        </p>
      </div>

      {/* Main Interactive Showcase Card */}
      <div className="w-full relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shadow-xl shadow-slate-950/5 dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.6)]">
        {/* Ambient Top Glow */}
        <div
          className={cn(
            "pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-60 bg-gradient-to-b transition-colors duration-500",
            activeItem.gradient
          )}
        />

        {/* Content Grid */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Left: Interactive Selector Pills */}
          <div className="w-full md:w-5/12 flex flex-col gap-2">
            {DISCOVER_ITEMS.map((item, idx) => {
              const ItemIcon = item.icon;
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    "w-full text-start p-3 rounded-xl border transition-colors duration-200 flex items-center gap-3 cursor-pointer",
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-xs"
                      : "bg-transparent border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <ItemIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-semibold truncate",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {t(`items.${item.id}.title`)}
                    </p>
                    <p className="text-[11px] text-muted-foreground/75 truncate">
                      {t(`items.${item.id}.subtitle`)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[10px] px-2 py-0.5 border",
                      item.accentBadge
                    )}
                  >
                    {t(`items.${item.id}.badge`)}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Feature Showcase with Fluid Animation */}
          <div className="w-full md:w-7/12 min-h-[170px] flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <IconComponent className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground">
                        {t(`items.${activeItem.id}.title`)}
                      </h3>
                      <span className="text-[11px] font-medium text-primary">
                        {t(`items.${activeItem.id}.subtitle`)}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] border px-2.5 py-0.5", activeItem.accentBadge)}
                  >
                    {t(`items.${activeItem.id}.badge`)}
                  </Badge>
                </div>

                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed pt-1">
                  {t(`items.${activeItem.id}.desc`)}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    href={activeItem.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group"
                  >
                    <span>{t("cta")}</span>
                    <ArrowIcon className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
                  </Link>

                  {/* Dot navigation */}
                  <div className="flex items-center gap-1.5">
                    {DISCOVER_ITEMS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedIdx(i)}
                        className={cn(
                          "size-2 rounded-full transition-colors duration-200",
                          selectedIdx === i
                            ? "bg-primary w-4"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DiscoverSection;
