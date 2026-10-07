"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../services/dashboard.service";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Users, Clock, Eye, Calendar as CalendarIcon, X, Flag, Store, PartyPopper } from "lucide-react";

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

export function EventsManagerWidget({ events }: { events: CalendarEvent[] }) {
  const t = useTranslations("Dashboard.calendar");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [localEvents, setLocalEvents] = React.useState<CalendarEvent[]>(events || []);
  const [newEventTitle, setNewEventTitle] = React.useState("");
  const [newEventType, setNewEventType] = React.useState<string>("event");
  const [viewMode, setViewMode] = React.useState<"year"|"month"|"week"|"day">("day");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [timeFilter, setTimeFilter] = React.useState<"all"|"past"|"upcoming">("all");

  React.useEffect(() => {
    if (events) setLocalEvents(events);
  }, [events]);

  const eventDateSet = React.useMemo(() => {
    return new Set(localEvents?.map(e => e.date));
  }, [localEvents]);

  const filteredEvents = React.useMemo(() => {
    let result = localEvents;

    // Apply Time Filter (always active)
    if (!selectedDate) {
      result = [];
    } else {
      const { year: gy, month: gm, day: gd } = getJalaliDate(selectedDate);

      // Week logic: Start from Saturday in Jalali, but DatePicker natively supports JS Date.
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 1) % 7)); // Sat=0
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      result = localEvents.filter(e => {
        const [ey, em, ed] = e.date.split("-").map(Number);
        if (viewMode === "year") return ey === gy;
        if (viewMode === "month") return ey === gy && em === gm;
        if (viewMode === "week") {
          return ey === gy && em === gm && Math.abs(ed - gd) <= 3;
        }
        return ey === gy && em === gm && ed === gd;
      });
    }


    // Apply timeFilter (past/upcoming)
    if (timeFilter !== "all") {
      const todayJalali = getJalaliDate(new Date());
      const todayStr = `${todayJalali.year}-${String(todayJalali.month).padStart(2, "0")}-${String(todayJalali.day).padStart(2, "0")}`;
      result = result.filter(e => {
        if (timeFilter === "past") return e.date < todayStr;
        if (timeFilter === "upcoming") return e.date >= todayStr;
        return true;
      });
    }

    // Apply Type Filter
    if (typeFilter !== "all") {
      result = result.filter(e => e.type === typeFilter);
    }

    return [...result].sort((a, b) => a.date.localeCompare(b.date));
  }, [localEvents, selectedDate, viewMode, typeFilter, timeFilter]);

  const deleteEvent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLocalEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const getEventColors = (date: Date) => {
    const { year: gy, month: gm, day: gd } = getJalaliDate(date);
    
    // Find unique types for this day
    const typesOnDay = new Set<keyof typeof TYPE_DOT_COLORS>();
    localEvents.forEach(e => {
      
      const [ey, em, ed] = e.date.split("-").map(Number);
      if (ey === gy && em === gm && ed === gd) {
        typesOnDay.add(e.type as keyof typeof TYPE_DOT_COLORS);
      }
    });

    // Return the background color classes for the badges
    return Array.from(typesOnDay).map(t => TYPE_DOT_COLORS[t] || "bg-primary");
  };

  const addEvent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newEventTitle.trim() || !selectedDate) return;
    
    const { year: gy, month: gm, day: gd } = getJalaliDate(selectedDate);
    const formatted = `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      date: formatted,
      type: newEventType as any,
    };
    
    setLocalEvents(prev => [...prev, newEvent]);
    setNewEventTitle("");
  };

  
  const eventTypeOptions = React.useMemo(() => [
    { value: "event", label: t("types.event"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.event)} /> },
    { value: "official", label: t("types.official"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.official)} /> },
    { value: "fair", label: t("types.fair"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.fair)} /> },
    { value: "meeting", label: t("types.meeting"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.meeting)} /> },
    { value: "company_event", label: t("types.company_event"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.company_event)} /> },
  ], [t]);

  const filterTypeOptions = React.useMemo(() => [
    { value: "all", label: t("views.all") },
    ...eventTypeOptions
  ], [t, eventTypeOptions]);

  return (
    <div className="bg-card h-full rounded-xl rounded-br-none border border-border/50 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border/30 bg-muted/10 shrink-0">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <CalendarIcon className="size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground/80">{t("managerTitle")}</h3>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Column 1: Calendar */}
        <div className="w-full lg:w-[350px] p-4 lg:border-l border-border/30 overflow-y-auto custom-scrollbar flex flex-col items-center">
          <div className="bg-background/40 w-full rounded-xl border border-border/40 p-3">
            <DatePicker
              mode="inline"
              value={selectedDate}
              onChange={(d) => {
                setSelectedDate(d);
                setViewMode("day");
                setTypeFilter("all");
              }}
              getEventColors={getEventColors}
            />
          </div>
        </div>

        {/* Column 2: Events List */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          
          {/* Compact Minimal Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border/30">
            {/* View Mode */}
            <div className="flex items-center bg-muted/40 p-0.5 rounded-full border border-border/40">
              {(["year", "month", "week", "day"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-medium transition-colors outline-none",
                    viewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`views.${mode}`)}
                </button>
              ))}
            </div>

            {/* Time Filter */}
            <div className="flex items-center bg-muted/40 p-0.5 rounded-full border border-border/40">
              {(["all", "past", "upcoming"] as const).map(filter => (
                <button 
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-medium transition-colors outline-none",
                    timeFilter === filter ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`filters.${filter}`)}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="w-32">
              <Combobox 
                options={filterTypeOptions}
                value={typeFilter}
                onChange={(val) => setTypeFilter(val || "all")}
                className="h-[28px] text-[11px] rounded-full bg-muted/40 border-border/40 shadow-none rtl:text-right"
                showSearch={false}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base text-foreground/80">
              {t("eventsCount", { count: filteredEvents.length })}
            </h4>
          </div>
          {filteredEvents.length > 0 ? (
            <ul className="space-y-2">
              {filteredEvents.map((event) => {
                const typeKey = event.type as keyof typeof TYPE_ICONS;
                const Icon = (TYPE_ICONS[typeKey] || CalendarIcon) as any;
                const colorClass = TYPE_COLORS[typeKey] || "";

                return (
                  <li 
                    key={event.id} 
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-start gap-3 w-full min-w-0">
                      <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-normal text-foreground/80 leading-tight">
                          {event.titleKey ? t(event.titleKey as any) : event.title}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground mt-1">
                          {event.date}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteEvent(e, event.id)}
                      className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground/60 py-12">
              <CalendarIcon className="size-12 mb-3 opacity-20" />
              <p className="text-sm">{t("empty")}</p>
            </div>
          )}
        </div>

        {/* Column 3: New Event Only */}
        <div className="w-full lg:w-[260px] p-4 bg-muted/5 flex flex-col gap-6 overflow-y-auto custom-scrollbar lg:border-r border-border/30">

          {/* New Event */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{t("addPlaceholder")}</h4>
            <form onSubmit={addEvent} className="flex flex-col gap-3 p-3 bg-background/50 rounded-xl border border-border/40 shadow-sm">
              <Textarea
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder={t("addPlaceholder")}
                className="text-xs shadow-none rtl:text-right resize-none min-h-[60px]"
              />
              <Combobox 
                options={eventTypeOptions}
                value={newEventType}
                onChange={(val) => setNewEventType(val || "event")}
                className="h-10 text-xs rtl:text-right w-full"
                showSearch={false}
              />
              <Button type="submit" variant="default" className="h-10 text-xs w-full shadow-sm mt-1">
                {t("add")}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

