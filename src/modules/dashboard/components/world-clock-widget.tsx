"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Globe, Settings2, Check } from "lucide-react";
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

  const [selectedIds, setSelectedIds] = React.useState<string[]>(["thr", "lon"]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleClock = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((x) => x !== id));
      }
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[1], id]); // Keep the second, replace the first
      }
    }
  };

  const selectedClocks = TIMEZONES.filter((tz) => selectedIds.includes(tz.id));

  return (
    <div className="flex flex-col h-full bg-card rounded-xl rounded-br-none border border-border/50 overflow-hidden relative transition-all duration-300">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Globe className="size-4" />
          </div>
          <h3 className="font-semibold text-base text-foreground/80">{t("title")}</h3>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ms-2",
            isEditing
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-md shadow-primary/20"
              : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-border/50 hover:text-foreground"
          )}
        >
          {isEditing ? <Check className="size-3" /> : <Settings2 className="size-3" />}
          <span>{isEditing ? t("done") : t("edit")}</span>
        </button>
      </div>

      {/* Content */}
      <div className={cn("flex-1 p-3 flex flex-col gap-3", isEditing ? "bg-muted/10" : "bg-transparent")}>
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
              className="flex flex-col sm:flex-row gap-3 h-full items-stretch justify-center"
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
                    className="flex-1 w-full bg-background/50 border border-border/40 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
                  >
                    <div className="absolute top-2 end-2 text-2xl opacity-10 group-hover:opacity-20 transition-opacity blur-[1px] group-hover:blur-none">
                      {clock.flag}
                    </div>
                    
                    <div className="flex flex-col items-center z-10 w-full">
                      <span className="text-xs font-medium text-primary/80 mb-0.5">
                        {isFa ? clock.labelFa : clock.labelEn}
                      </span>
                      <span className="text-3xl font-bold text-foreground/80 fa-num tracking-tight tabular-nums">
                        {formatterTime.format(now)}
                      </span>
                      <div className="flex flex-col items-center gap-2 mt-3 bg-muted/30 p-2 sm:px-3 sm:py-2.5 rounded-xl w-full">
                        <span className="text-[10px] text-foreground/90 font-medium fa-num leading-relaxed">
                          {formatterDateShamsi.format(now)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80 font-medium fa-num leading-relaxed">
                          {formatterDateQamari.format(now)}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60 font-medium fa-num leading-relaxed">
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

