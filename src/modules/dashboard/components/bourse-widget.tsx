"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import { useDashboardSettings } from "../store/use-dashboard-settings";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BourseItem {
  id: string;
  l18: string;
  l30: string;
  price: number;
  change: number;
  percentChange: number;
  trend: "up" | "down" | "neutral";
  category?: "petrochemical" | "refinery";
}

const CATEGORIES = ["petrochemical", "refinery"] as const;

export function BourseWidget() {
  const t = useTranslations("Dashboard.bourse");
  const locale = useLocale();
  const isFa = locale === "fa";
  const { isToman } = useDashboardSettings();

  const [activeCategory, setActiveCategory] = React.useState<typeof CATEGORIES[number]>("petrochemical");
  const [items, setItems] = React.useState<BourseItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchBourse = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(false);
    try {
      const res = await fetch(`/api/bourse?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBourse();
    const interval = setInterval(() => fetchBourse(true), 60000);
    return () => clearInterval(interval);
  }, [fetchBourse]);

  const formattedDate = new Intl.DateTimeFormat(isFa ? "fa-IR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (item.category) return item.category === activeCategory;
      const isRefinery =
        item.l18.startsWith("ش") ||
        item.l30.includes("پالایش") ||
        item.l30.includes("پالايش") ||
        item.l30.includes("نفت");
      return activeCategory === "refinery" ? isRefinery : !isRefinery;
    });
  }, [items, activeCategory]);

  return (
    <div className="flex flex-col h-full bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative @container min-h-0">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-3.5 sm:px-4 pt-3.5 sm:pt-4 pb-3 border-b border-border/50 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between pe-18 sm:pe-20">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground/80">
                {t("title")}
                <span className="text-xs font-normal text-muted-foreground ms-1 hidden @[520px]:inline-block">
                  ({formattedDate})
                </span>
              </h3>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchBourse(true)}
            disabled={refreshing || loading}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
            title={t("refresh")}
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative flex-1 py-1.5 text-xs font-medium cursor-pointer"
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="bourse-tab"
                  className="absolute inset-0 bg-background shadow-xs rounded-lg"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 transition-colors",
                  activeCategory === cat
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                {t(`categories.${cat}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0 relative">
        <div className="p-3.5 sm:p-4">
          {loading && !items.length ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse flex flex-col gap-3 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-muted/40 rounded-xl w-full" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive/80 gap-2">
              <AlertCircle className="size-8" />
              <span className="text-sm font-medium">{t("error")}</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60 gap-2">
              <span className="text-sm">{t("noData")}</span>
            </div>
          ) : (
            <div className="grid gap-2.5 relative">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => {
                  const isUp = item.trend === "up";
                  const isDown = item.trend === "down";

                  const priceDisplay = isToman ? Math.round(item.price / 10) : item.price;
                  const priceUnit = isToman ? t("toman") : t("rial");
                  const secondaryPriceDisplay = isToman ? item.price : Math.round(item.price / 10);
                  const secondaryUnit = isToman ? t("rial") : t("toman");

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-background border-border/40 hover:border-border/80 transition-colors"
                    >
                      {/* Left: Ticker badge & Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-9 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/15 shadow-2xs">
                          {item.l18.slice(0, 4)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.l18}
                          </p>
                          <p
                            className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[140px] @[400px]:max-w-[220px]"
                            title={item.l30}
                          >
                            {item.l30}
                          </p>
                        </div>
                      </div>

                      {/* Right: Percent & Price */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* % change */}
                            <span
                              className={cn(
                                "text-[10px] font-medium flex items-center fa-num",
                                isUp
                                  ? "text-emerald-500"
                                  : isDown
                                  ? "text-rose-500"
                                  : "text-muted-foreground"
                              )}
                            >
                              {isUp ? (
                                <TrendingUp className="size-3 me-0.5" />
                              ) : isDown ? (
                                <TrendingDown className="size-3 me-0.5" />
                              ) : (
                                <Minus className="size-3 me-0.5" />
                              )}
                              <span dir="ltr">
                                {isUp ? "+" : ""}
                                {item.percentChange.toFixed(2)}%
                              </span>
                            </span>

                            {/* Primary price */}
                            <span className="text-sm font-bold fa-num">
                              {priceDisplay.toLocaleString("en-US")} {priceUnit}
                            </span>
                          </div>

                          {/* Secondary price */}
                          <p className="text-[10px] text-muted-foreground mt-0.5 fa-num">
                            {secondaryPriceDisplay.toLocaleString("en-US")} {secondaryUnit}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Footer Source (با ذکر منبع) ─────────────────────────── */}
      <div className="px-3.5 py-2 border-t border-border/40 bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 fa-num">
        <div className="flex items-center gap-1.5">
          <span>{t("source")}:</span>
          <a
            href="https://tsetmc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold"
          >
            {t("tsetmc")}
          </a>
        </div>
        <span className="text-[10px] text-muted-foreground/70 hidden @[320px]:inline-block">
          {t("marketName")}
        </span>
      </div>
    </div>
  );
}
