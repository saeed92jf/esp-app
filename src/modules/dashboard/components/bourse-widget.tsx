"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Briefcase, RefreshCw, AlertCircle } from "lucide-react";

interface BourseItem {
  id: string;
  l18: string;
  l30: string;
  price: number;
  change: number;
  percentChange: number;
  trend: "up" | "down" | "neutral";
}

export function BourseWidget() {
  const t = useTranslations("Dashboard.bourse");
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
    } catch (err) {
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

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-sm border border-border/40 overflow-hidden relative">
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Briefcase className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground/80">{t("title")}</h3>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <button
          onClick={() => fetchBourse(true)}
          disabled={refreshing || loading}
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground disabled:opacity-50"
          title={t("refresh")}
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="size-6 animate-spin text-muted-foreground/50" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-destructive/80 gap-2">
            <AlertCircle className="size-8" />
            <span className="text-sm font-medium">{t("error")}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60 gap-2">
            <span className="text-sm">{t("noData")}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 @xl:grid-cols-2 gap-3 pb-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col justify-between p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm truncate">{item.l18}</span>
                      <span className="text-[11px] text-muted-foreground truncate" title={item.l30}>
                        {item.l30}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-center size-7 rounded-full shrink-0",
                        item.trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        item.trend === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        item.trend === "neutral" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.trend === "up" && <TrendingUp className="size-4" />}
                      {item.trend === "down" && <TrendingDown className="size-4" />}
                      {item.trend === "neutral" && <Minus className="size-4" />}
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-base font-bold tracking-tight fa-num">
                        {item.price.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "text-xs font-semibold fa-num flex items-center gap-0.5",
                          item.trend === "up" && "text-emerald-600 dark:text-emerald-400",
                          item.trend === "down" && "text-rose-600 dark:text-rose-400",
                          item.trend === "neutral" && "text-muted-foreground"
                        )}
                        dir="ltr"
                      >
                        {item.trend === "up" ? "+" : item.trend === "down" ? "-" : ""}
                        {Math.abs(item.percentChange).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

