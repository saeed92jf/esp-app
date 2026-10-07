"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../services/dashboard.service";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import * as React from "react";
import { Users, Clock, Eye, Calendar as CalendarIcon, Flag, Store, PartyPopper } from "lucide-react";

const TYPE_ICONS = {
  meeting: Users,
  deadline: Clock,
  review: Eye,
  event: CalendarIcon,
  official: Flag,
  fair: Store,
  company_event: PartyPopper,
} as const;

const TYPE_COLORS = {
  meeting: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  deadline: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
  review: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  event: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  official: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  fair: "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20",
  company_event: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20",
} as const;

const TYPE_DOT_COLORS = {
  meeting: "bg-blue-500",
  deadline: "bg-rose-500",
  review: "bg-amber-500",
  event: "bg-emerald-500",
  official: "bg-purple-500",
  fair: "bg-cyan-500",
  company_event: "bg-indigo-500",
} as const;

export function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  const t = useTranslations("Dashboard.calendar");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  const eventDateSet = React.useMemo(() => {
    return new Set(events?.map(e => e.date));
  }, [events]);

  const filteredEvents = React.useMemo(() => {
    if (!selectedDate || !events) return [];

    const { year: gy, month: gm, day: gd } = getJalaliDate(selectedDate);

    const result = events.filter(e => {
      const [ey, em, ed] = e.date.split("-").map(Number);
      return ey === gy && em === gm && ed === gd;
    });

    return [...result].sort((a, b) => a.date.localeCompare(b.date));
  }, [events, selectedDate]);

  const getEventColors = (date: Date) => {
    const { year: gy, month: gm, day: gd } = getJalaliDate(date);
    
    // Find unique types for this day
    const typesOnDay = new Set<keyof typeof TYPE_DOT_COLORS>();
    events.forEach(e => {
      const [ey, em, ed] = e.date.split("-").map(Number);
      if (ey === gy && em === gm && ed === gd) {
        typesOnDay.add(e.type as keyof typeof TYPE_DOT_COLORS);
      }
    });

    return Array.from(typesOnDay).map(t => TYPE_DOT_COLORS[t] || "bg-primary");
  };

  return (
    <div className="bg-transparent px-4 pt-2 pb-4 @sm:px-5 @sm:pt-3 @sm:pb-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-2">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <CalendarIcon className="size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground/80">{t("title")}</h3>
      </div>

      {/* Inline Calendar */}
      <div className="bg-background/40 rounded-xl border border-border/40 p-3 relative">
        <DatePicker
          mode="inline"
          value={selectedDate}
          onChange={(d) => setSelectedDate(d)}
          getEventColors={getEventColors}
        />
      </div>

      {/* Events list */}
      <div className="flex flex-col gap-2 px-2 mb-1">
        <span className="text-[11px] font-semibold text-muted-foreground rtl:text-right">
          {t("eventsCount", { count: filteredEvents.length })}
        </span>
      </div>
      
      {filteredEvents.length > 0 ? (
        <ul className="space-y-1.5 flex-1 min-h-[150px] overflow-y-auto pr-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredEvents.map((event) => {
            const typeKey = event.type as keyof typeof TYPE_ICONS;
            const Icon = (TYPE_ICONS[typeKey] || CalendarIcon) as any;
            const colorClass = TYPE_COLORS[typeKey] || "";

            return (
              <li 
                key={event.id} 
                className="flex items-start justify-between gap-3 p-2.5 transition-colors group relative hover:opacity-80"
              >
                <div className="flex items-start gap-2.5 min-w-0 w-full">
                  <div className={cn("mt-0.5 p-1.5 rounded-md shrink-0", colorClass)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="text-[13px] font-normal text-foreground/80 leading-tight whitespace-normal break-words pr-2">
                      {event.title}
                    </span>
                    <span className="text-[11px] font-medium opacity-80 mt-0.5">
                      {event.date}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-70">
          <CalendarIcon className="size-10 mb-2 opacity-20" />
          <p className="text-sm font-medium">{t("empty")}</p>
        </div>
      )}
    </div>
  );
}

