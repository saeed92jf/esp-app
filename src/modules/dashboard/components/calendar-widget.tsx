"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Users, Clock, Eye, Calendar as CalendarIcon } from "lucide-react";
import type { CalendarEvent } from "../services/dashboard.service";
import { DatePicker } from "@/components/ui/date-picker";
import * as React from "react";

const TYPE_ICONS = {
  meeting: Users,
  deadline: Clock,
  review: Eye,
  event: CalendarIcon,
} as const;

const TYPE_COLORS = {
  meeting: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  deadline: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
  review: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  event: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
} as const;

export function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  const t = useTranslations("Dashboard.calendar");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const eventDateSet = React.useMemo(() => {
    return new Set(events?.map(e => e.date));
  }, [events]);

  const hasEvent = React.useCallback((date: Date) => {
    const gy = date.getFullYear();
    const gm = String(date.getMonth() + 1).padStart(2, "0");
    const gd = String(date.getDate()).padStart(2, "0");
    return eventDateSet.has(`${gy}-${gm}-${gd}`);
  }, [eventDateSet]);

  const filteredEvents = React.useMemo(() => {
    if (!selectedDate) return [];
    const gy = selectedDate.getFullYear();
    const gm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const gd = String(selectedDate.getDate()).padStart(2, "0");
    const formatted = `${gy}-${gm}-${gd}`;
    return events?.filter(e => e.date === formatted) || [];
  }, [events, selectedDate]);

  return (
    <div className="bg-transparent p-4 @sm:p-5 flex flex-col gap-3 @sm:gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 @sm:gap-3">
        <div className="p-2 @sm:p-2.5 bg-primary/10 rounded-xl shrink-0">
          <CalendarIcon className="size-4 @sm:size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base @sm:text-lg">{t("title")}</h3>
      </div>

      {/* Inline Calendar */}
      <div className="bg-background/40 rounded-xl border border-border/40 p-3">
        <DatePicker
          mode="inline"
          value={selectedDate}
          onChange={setSelectedDate}
          hasEvent={hasEvent}
        />
      </div>

      {/* Events list */}
      {filteredEvents.length > 0 ? (
        <ul className="space-y-1.5 @sm:space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {filteredEvents.map((event) => {
            const typeKey = event.type as keyof typeof TYPE_ICONS;
            const Icon = (TYPE_ICONS[typeKey] || CalendarIcon) as any;

            return (
              <li
                key={event.id}
                className="group flex items-center gap-2 @sm:gap-3 px-2 @sm:px-3 py-1.5 @sm:py-2.5 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm transition-all duration-300"
              >
                <div className={cn("p-1.5 @sm:p-2 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110", TYPE_COLORS[typeKey] || "")}>
                  <Icon className="size-3 @sm:size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs @sm:text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors duration-300">
                    {event.title}
                  </p>
                  <p className="text-[10px] @sm:text-[11px] text-muted-foreground mt-0.5">
                    {event.date}
                    <span className="mx-1 @sm:mx-1.5 opacity-40">·</span>
                    <span className="uppercase tracking-wide font-bold opacity-70">
                      {t(`types.${event.type}`)}
                    </span>
                  </p>
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
