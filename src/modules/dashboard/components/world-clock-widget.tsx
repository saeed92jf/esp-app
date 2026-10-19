"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Globe, Edit3, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TIMEZONES = [
  { id: "thr", labelEn: "Tehran", labelFa: "تهران", tz: "Asia/Tehran", flag: "🇮🇷" },
  { id: "nyc", labelEn: "New York", labelFa: "نیویورک", tz: "America/New_York", flag: "🇺🇸" },
  { id: "lon", labelEn: "London", labelFa: "لندن", tz: "Europe/London", flag: "🇬🇧" },
  { id: "bei", labelEn: "Beijing", labelFa: "پکن", tz: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "mow", labelEn: "Moscow", labelFa: "مسکو", tz: "Europe/Moscow", flag: "🇷🇺" },
  { id: "tok", labelEn: "Tokyo", labelFa: "توکیو", tz: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "dxb", labelEn: "Dubai", labelFa: "دبی", tz: "Asia/Dubai", flag: "🇦🇪" },
  { id: "par", labelEn: "Paris", labelFa: "پاریس", tz: "Europe/Paris", flag: "🇫🇷" },
];

export function WorldClockWidget() {
  const t = useTranslations("Dashboard.worldClock");
  const locale = useLocale();
  const isFa = locale === "fa";

  const [selectedIds, setSelectedIds] = React.useState<string[]>(["thr", "lon", "nyc", "bei"]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [now, setNow] = React.useState(new Date());
  const [timeOffset, setTimeOffset] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("https://timeapi.io/api/Time/current/zone?timeZone=UTC")
      .then(res => res.json())
      .then(data => {
        const internetTime = new Date(data.dateTime + "Z").getTime();
        const localTime = Date.now();
        setTimeOffset(internetTime - localTime);
        setNow(new Date(Date.now() + (internetTime - localTime)));
      })
      .catch(() => {
        setTimeOffset(0);
      });
  }, []);

  React.useEffect(() => {
    if (timeOffset === null) return;
    const timer = setInterval(() => setNow(new Date(Date.now() + timeOffset)), 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

  const toggleClock = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((x) => x !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([...selectedIds.slice(1), id]); // Keep the rest, replace the oldest
      }
    }
  };

  const selectedClocks = TIMEZONES.filter((tz) => selectedIds.includes(tz.id));

  return (
    <div className="flex flex-col h-full bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4 @container min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-2 shrink-0 pe-18 sm:pe-20">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <Globe className="size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground/80 shrink-0">{t("title")}</h3>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-xs transition-colors duration-150 ms-2",
            isEditing
              ? "border-primary/40 bg-white dark:bg-card text-primary ring-1 ring-primary/20"
              : "border-border/50 bg-white dark:bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground"
          )}
        >
          {isEditing ? <Check className="size-3" /> : <Edit3 className="size-3" />}
          <span>{isEditing ? t("done") : t("edit")}</span>
        </button>
      </div>

      {/* Content */}
      <div className={cn("flex-1 p-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col gap-3", isEditing ? "bg-muted/10 rounded-xl" : "bg-transparent")}>
        <AnimatePresence mode="popLayout">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-2 justify-center pb-2"
            >
              {TIMEZONES.map((tz) => {
                const isSelected = selectedIds.includes(tz.id);
                return (
                  <button
                    key={tz.id}
                    onClick={() => toggleClock(tz.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-background border-border hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="text-sm">{tz.flag}</span>
                    <span>{isFa ? tz.labelFa : tz.labelEn}</span>
                    {isSelected && <Check className="size-3 ms-1" />}
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 @[260px]:grid-cols-2 @[520px]:grid-cols-4 gap-2.5 h-full items-stretch content-start"
            >
              {selectedClocks.map((clock, idx) => {
                const formatterTime = new Intl.DateTimeFormat(isFa ? "fa-IR" : "en-US", {
                  timeZone: clock.tz,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                });
                const localeParam = isFa ? "fa-IR" : "en-US";
                const formatterDateShamsi = new Intl.DateTimeFormat(localeParam, {
                  timeZone: clock.tz,
                  calendar: "persian",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const formatterDateQamari = new Intl.DateTimeFormat(localeParam, {
                  timeZone: clock.tz,
                  calendar: "islamic-umalqura",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const formatterDateMiladi = new Intl.DateTimeFormat(localeParam, {
                  timeZone: clock.tz,
                  calendar: "gregory",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={clock.id}
                    className="w-full bg-background border border-border/40 rounded-xl p-3 flex flex-col items-center justify-between relative overflow-hidden group shadow-2xs min-h-[140px]"
                  >
                    <div className="absolute top-2 end-2 text-2xl opacity-10 group-hover:opacity-20 transition-opacity blur-[1px] group-hover:blur-none select-none">
                      {clock.flag}
                    </div>
                    
                    <div className="flex flex-col items-center z-10 w-full my-auto">
                      <span className="text-xs font-medium text-primary/90 mb-0.5">
                        {isFa ? clock.labelFa : clock.labelEn}
                      </span>
                      <span className="text-2xl @[180px]:text-3xl font-bold text-foreground/80 fa-num tracking-tight tabular-nums">
                        {formatterTime.format(now)}
                      </span>
                      <div className="flex flex-col items-center gap-1 mt-2.5 bg-muted/30 p-2 rounded-xl w-full text-center">
                        <span className="text-xs text-foreground/90 font-medium fa-num leading-tight">
                          {formatterDateShamsi.format(now)}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80 font-medium fa-num leading-tight">
                          {formatterDateQamari.format(now)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 font-medium fa-num leading-tight">
                          {formatterDateMiladi.format(now)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

