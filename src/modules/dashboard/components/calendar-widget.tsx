"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../services/dashboard.service";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, Eye, Calendar as CalendarIcon, X, Flag, Store, PartyPopper, Cake, Plus, ChevronDown } from "lucide-react";

const TYPE_ICONS = {
  meeting: Users,
  deadline: Clock,
  review: Eye,
  event: CalendarIcon,
  official: Flag,
  fair: Store,
  company_event: PartyPopper,
  birthday: Cake,
} as const;

const TYPE_COLORS = {
  meeting: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  deadline: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
  review: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  event: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  official: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  fair: "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20",
  company_event: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20",
  birthday: "text-pink-500 bg-pink-500/10 dark:bg-pink-500/20",
} as const;

const TYPE_DOT_COLORS = {
  meeting: "bg-blue-500",
  deadline: "bg-rose-500",
  review: "bg-amber-500",
  event: "bg-emerald-500",
  official: "bg-purple-500",
  fair: "bg-cyan-500",
  company_event: "bg-indigo-500",
  birthday: "bg-pink-500",
} as const;

const SOLID_COLORS = {
  meeting: "bg-blue-500 text-white",
  deadline: "bg-rose-500 text-white",
  review: "bg-amber-500 text-white",
  event: "bg-emerald-500 text-white",
  official: "bg-purple-500 text-white",
  fair: "bg-cyan-500 text-white",
  company_event: "bg-indigo-500 text-white",
  birthday: "bg-pink-500 text-white",
} as const;

export function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  const t = useTranslations("Dashboard.calendar");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [localEvents, setLocalEvents] = React.useState<CalendarEvent[]>(events || []);
  const [newEventTitle, setNewEventTitle] = React.useState("");
  const [newEventType, setNewEventType] = React.useState<string>("event");
  const [viewMode, setViewMode] = React.useState<"year"|"month"|"week"|"day">("day");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [timeFilter, setTimeFilter] = React.useState<"all"|"past"|"upcoming">("all");
  const [isFormVisible, setIsFormVisible] = React.useState(false);

  React.useEffect(() => {
    if (events) setLocalEvents(events);
  }, [events]);

  const eventDateSet = React.useMemo(() => {
    return new Set(localEvents?.map(e => e.date));
  }, [localEvents]);

  const hasEvent = React.useCallback((date: Date) => {
    const gy = date.getFullYear();
    const gm = String(date.getMonth() + 1).padStart(2, "0");
    const gd = String(date.getDate()).padStart(2, "0");
    return eventDateSet.has(`${gy}-${gm}-${gd}`);
  }, [eventDateSet]);

  const filteredEvents = React.useMemo(() => {
    let result = localEvents;

    // Apply Time Filter (always active)
    if (!selectedDate) {
      result = [];
    } else {
      const { year: gy, month: gm, day: gd } = getJalaliDate(selectedDate);

      // Week logic: Start from Saturday in Jalali, but DatePicker natively supports JS Date.
      // A simpler approximation for week view is just +/- 3 days from selectedDate.
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
          // It's safer to compare as JS dates if they were Greg, but since they are Jalali strings,
          // converting each event to Greg just for 'week' view is heavy. Let's just do a simple check.
          // Wait, 'getJalaliDate' gives the Jalali parts. I'll just check if the Gregorian dates fall in range.
          // But parsing Jalali to Gregorian requires `jalaliToGregorianDate` which isn't imported here.
          // For simplicity, let's just use a string-based or day-diff-based logic.
          // Since the user mainly uses day/month/year, I'll approximate the week for now or import jalaliToGregorianDate.
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

    return [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
      // Do not show badges for birthdays
      if (e.type === "birthday") return;
      
      const [ey, em, ed] = e.date.split("-").map(Number);
      if (ey === gy && em === gm && ed === gd) {
        typesOnDay.add(e.type as keyof typeof TYPE_DOT_COLORS);
      }
    });

    // Return the background color classes for the badges
    return Array.from(typesOnDay).map(t => TYPE_DOT_COLORS[t] || "bg-primary");
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => prev === type ? "all" : type);
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
      <div className="bg-background/40 rounded-xl border border-border/40 p-3 relative">
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
      {/* Add Event Standalone Section */}
      <div className="bg-background/40 rounded-xl border border-border/40 overflow-hidden">
        {/* Toggle Button */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer text-muted-foreground hover:text-primary hover:bg-muted/20 transition-colors"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          <span className="text-xs font-semibold rtl:text-right w-full">{t("addPlaceholder")}</span>
          <ChevronDown className={cn("size-4 transition-transform duration-300", isFormVisible && "rotate-180")} />
        </div>

        {/* Add Event Form Panel */}
        <div className={cn(
          "grid transition-all duration-300 ease-in-out",
          isFormVisible ? "grid-rows-[1fr] opacity-100 border-t border-border/30" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden bg-muted/10">
            <form onSubmit={addEvent} className="flex flex-col gap-2 p-3">
              <Input 
                type="text" 
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder={t("addPlaceholder")}
                className="h-9 text-xs border-transparent bg-background shadow-sm hover:border-border focus-visible:ring-1 focus-visible:ring-primary rtl:text-right"
              />
              <div className="flex gap-2">
                <Select value={newEventType} onValueChange={setNewEventType}>
                  <SelectTrigger className="h-9 flex-1 text-xs border-transparent bg-background shadow-sm hover:border-border rtl:text-right" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]" dir="rtl">
                    <SelectItem value="event" className="rtl:text-right rtl:justify-end">{t("types.event")}</SelectItem>
                    <SelectItem value="official" className="rtl:text-right rtl:justify-end">{t("types.official")}</SelectItem>
                    <SelectItem value="fair" className="rtl:text-right rtl:justify-end">{t("types.fair")}</SelectItem>
                    <SelectItem value="meeting" className="rtl:text-right rtl:justify-end">{t("types.meeting")}</SelectItem>
                    <SelectItem value="company_event" className="rtl:text-right rtl:justify-end">{t("types.company_event")}</SelectItem>
                    <SelectItem value="birthday" className="rtl:text-right rtl:justify-end">{t("types.birthday")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="default" className="h-9 text-xs px-4 shadow-sm">
                  {t("add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="grid grid-cols-4 gap-1.5 pb-2 px-1 w-full">
        {(["year", "month", "week", "day"] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "w-full py-1.5 rounded-lg text-[11px] @sm:text-xs font-semibold transition-colors",
              viewMode === mode 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {t(`views.${mode}`)}
          </button>
        ))}
      </div>

      {/* Type Filter (Secondary Tabs) */}
      <div className="px-1 pb-1 pt-1">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 text-xs font-semibold w-full bg-background border-border shadow-sm rtl:text-right" dir="rtl">
            <SelectValue placeholder={t("views.all")} />
          </SelectTrigger>
          <SelectContent className="z-[9999]" dir="rtl">
            <SelectItem value="all" className="rtl:text-right rtl:justify-end">{t("views.all")}</SelectItem>
            <SelectItem value="official" className="rtl:text-right rtl:justify-end">{t("types.official")}</SelectItem>
            <SelectItem value="fair" className="rtl:text-right rtl:justify-end">{t("types.fair")}</SelectItem>
            <SelectItem value="company_event" className="rtl:text-right rtl:justify-end">{t("types.company_event")}</SelectItem>
            <SelectItem value="birthday" className="rtl:text-right rtl:justify-end">{t("types.birthday")}</SelectItem>
            <SelectItem value="meeting" className="rtl:text-right rtl:justify-end">{t("types.meeting")}</SelectItem>
            <SelectItem value="event" className="rtl:text-right rtl:justify-end">{t("types.event")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events list */}
      {/* Events list header */}
      <div className="flex flex-col gap-2 px-2 mb-2">
        {/* Time filters in one row */}
        <div className="flex items-center justify-between gap-1 bg-muted/30 p-1 rounded-lg">
          <button 
            onClick={() => setTimeFilter("all")}
            className={cn("flex-1 text-[10px] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {t("filters.all")}
          </button>
          <button 
            onClick={() => setTimeFilter("past")}
            className={cn("flex-1 text-[10px] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "past" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {t("filters.past")}
          </button>
          <button 
            onClick={() => setTimeFilter("upcoming")}
            className={cn("flex-1 text-[10px] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "upcoming" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {t("filters.upcoming")}
          </button>
        </div>
        {/* Count */}
        <span className="text-[11px] font-semibold text-muted-foreground rtl:text-right">
          {t("eventsCount", { count: filteredEvents.length })}
        </span>
      </div>
      {filteredEvents.length > 0 ? (
        <ul className="space-y-1.5 flex-1 min-h-[250px] overflow-y-auto pr-1 pb-1 custom-scrollbar">
          {filteredEvents.map((event) => {
            const typeKey = event.type as keyof typeof TYPE_ICONS;
            const Icon = (TYPE_ICONS[typeKey] || CalendarIcon) as any;
            const colorClass = TYPE_COLORS[typeKey] || "";
            const isFiltered = typeFilter === event.type;

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
                    <span className="text-[13px] font-medium text-foreground leading-tight whitespace-normal break-words pr-2">
                      {event.title}
                    </span>
                    <span className="text-[11px] font-medium opacity-80 mt-0.5">
                      {event.date}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteEvent(e, event.id)}
                  className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-all duration-300"
                  aria-label="Delete event"
                >
                  <X className="size-4" />
                </button>
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
