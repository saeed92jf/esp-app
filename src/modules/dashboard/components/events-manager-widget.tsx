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
import { Users, Clock, Eye, Calendar as CalendarIcon, X, Flag, Store, PartyPopper, Filter, CalendarX2, CalendarDays, RotateCcw, Plus, Sparkles, ArrowLeft, Search as SearchIcon } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (events) setLocalEvents(events);
  }, [events]);

  const eventDateSet = React.useMemo(() => {
    return new Set(localEvents?.map(e => e.date));
  }, [localEvents]);

  const filteredEvents = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const result = localEvents.filter(e => {
        const matchesQuery = (e.title?.toLowerCase() || "").includes(q) || e.date.includes(q);
        const matchesType = typeFilter === "all" || e.type === typeFilter;
        return matchesQuery && matchesType;
      });
      return [...result].sort((a, b) => a.date.localeCompare(b.date));
    }
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

  const formattedSelectedDate = React.useMemo(() => {
    if (!selectedDate) return "";
    const { year, month, day } = getJalaliDate(selectedDate);
    return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
  }, [selectedDate]);

  const upcomingNearbyEvents = React.useMemo(() => {
    const todayJalali = getJalaliDate(new Date());
    const todayStr = `${todayJalali.year}-${String(todayJalali.month).padStart(2, "0")}-${String(todayJalali.day).padStart(2, "0")}`;
    return localEvents
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [localEvents]);

  const suggestedFairs = React.useMemo(() => {
    const fairs = localEvents.filter(e => e.type === "fair");
    const todayJalali = getJalaliDate(new Date());
    const todayStr = `${todayJalali.year}-${String(todayJalali.month).padStart(2, "0")}-${String(todayJalali.day).padStart(2, "0")}`;
    const upcoming = fairs.filter(e => e.date >= todayStr);
    return (upcoming.length > 0 ? upcoming : fairs).slice(0, 2);
  }, [localEvents]);

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
    <div className="bg-panel dark:bg-card/40 h-full rounded-xl rounded-br-none border border-border/50 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border/30 bg-muted/10 shrink-0">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <CalendarIcon className="size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground/80">{t("managerTitle")}</h3>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Column 1: Calendar */}
        <div className="w-full lg:w-[350px] p-4 flex flex-col min-h-0">
          <div className="w-full h-full flex-1 rounded-xl bg-white dark:bg-card border border-border/50 shadow-xs p-3.5 flex flex-col justify-center overflow-y-auto custom-scrollbar">
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
        <div className="flex-1 p-4 flex flex-col gap-3 min-h-0 overflow-hidden lg:border-x border-border/30">
          {/* Annual Events Search Bar */}
          <div className="relative w-full shrink-0">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="ps-9 pe-8 h-9 text-xs bg-white dark:bg-card border-border/50 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filters Bar (Fixed at top) */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border/30 shrink-0">
            {/* Filter Icon at start of row */}
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary shrink-0 flex items-center justify-center shadow-xs" title={t("filtersLabel")}>
              <Filter className="size-3.5" />
            </div>

            {/* View Mode */}
            <div className="h-8 flex items-center bg-white dark:bg-card p-0.5 rounded-lg border border-border/50 shadow-xs">
              {(["year", "month", "week", "day"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "h-full px-2.5 rounded-md text-[11px] font-medium transition-colors outline-none flex items-center justify-center",
                    viewMode === mode
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {t(`views.${mode}`)}
                </button>
              ))}
            </div>

            {/* Time Filter */}
            <div className="h-8 flex items-center bg-white dark:bg-card p-0.5 rounded-lg border border-border/50 shadow-xs">
              {(["all", "past", "upcoming"] as const).map(filter => (
                <button 
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "h-full px-2.5 rounded-md text-[11px] font-medium transition-colors outline-none flex items-center justify-center",
                    timeFilter === filter
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {t(`filters.${filter}`)}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="w-36 shrink-0">
              <Combobox 
                options={filterTypeOptions}
                value={typeFilter}
                onChange={(val) => setTypeFilter(val || "all")}
                className="h-8 w-full text-[11px] rounded-lg bg-white dark:bg-card border-border/50 shadow-xs rtl:text-right font-medium"
                showSearch={false}
              />
            </div>
          </div>

          <div className="flex items-center justify-between shrink-0">
            <h4 className="font-semibold text-base text-foreground/80">
              {t("eventsCount", { count: filteredEvents.length })}
            </h4>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <ul className="segmented-list padded-ends">
                {filteredEvents.map((event) => {
                  const typeKey = event.type as keyof typeof TYPE_ICONS;
                  const Icon = (TYPE_ICONS[typeKey] || CalendarIcon) as any;
                  const colorClass = TYPE_COLORS[typeKey] || "";

                  return (
                    <li 
                      key={event.id} 
                      className="segmented-item flex items-start justify-between gap-3 p-3 border-none bg-background cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 w-full min-w-0">
                        <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-normal text-foreground/80 leading-tight">
                            {event.titleKey ? t(event.titleKey as any) : event.title}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground mt-1 fa-num">
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
            </div>
          ) : (
            <div className="flex-1 w-full min-h-0 flex flex-col justify-between bg-white dark:bg-card border border-border/50 shadow-xs rounded-xl p-4 sm:p-5 overflow-hidden">
              {/* Upper Section: Visual Feedback & Context */}
              <div className="flex flex-col items-center text-center my-auto">
                <div className="size-11 sm:size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs mb-2">
                  <CalendarX2 className="size-5 sm:size-6" />
                </div>

                <h5 className="text-sm font-bold text-foreground mb-1">
                  {t("emptyTitle")}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mb-2.5">
                  {t("emptyDesc")}
                </p>

                {/* Selected Date Context Chip */}
                {selectedDate && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/40 border border-border/40 text-[11px] text-muted-foreground mb-3 fa-num">
                    <CalendarIcon className="size-3 text-primary" />
                    <span>{t("selectedDateLabel")} {formattedSelectedDate}</span>
                    <span className="text-border">·</span>
                    <span>{t(`views.${viewMode}`)}</span>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {viewMode === "day" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode("month")}
                      className="h-7 text-xs rounded-lg border-border/60 bg-background hover:bg-muted/50 gap-1.5"
                    >
                      <CalendarDays className="size-3 text-primary" />
                      {t("viewMonth")}
                    </Button>
                  )}

                  {(typeFilter !== "all" || timeFilter !== "all") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTypeFilter("all");
                        setTimeFilter("all");
                      }}
                      className="h-7 text-xs rounded-lg border-border/60 bg-background hover:bg-muted/50 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="size-3" />
                      {t("clearFilters")}
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const input = document.querySelector<HTMLTextAreaElement>("textarea[placeholder]");
                      input?.focus();
                    }}
                    className="h-7 text-xs rounded-lg gap-1.5 shadow-xs"
                  >
                    <Plus className="size-3" />
                    {t("quickAddEvent")}
                  </Button>
                </div>
              </div>

              {/* Lower Section: Smart Suggestions (Fairs & Highlights) */}
              <div className="w-full bg-muted/20 dark:bg-muted/10 border border-border/40 rounded-xl p-3 flex flex-col gap-2 mt-auto shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    {t("suggestions")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("fair");
                      setTimeFilter("all");
                      setViewMode("year");
                    }}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>{t("viewUpcomingFairs")}</span>
                    <ArrowLeft className="size-3 rtl:rotate-0 rotate-180" />
                  </button>
                </div>

                {/* Suggested Exhibition Cards (Responsive Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedFairs.map((fair) => (
                    <button
                      key={fair.id}
                      type="button"
                      onClick={() => {
                        setTypeFilter("fair");
                        setTimeFilter("all");
                        setViewMode("year");
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-background hover:bg-muted/50 border border-border/40 hover:border-primary/40 transition-all text-start group shadow-xs"
                    >
                      <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                        <Store className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {fair.titleKey ? t(fair.titleKey as any) : fair.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 fa-num">
                          {fair.date}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: New Event Only */}
        <div className="w-full lg:w-[280px] p-4 flex flex-col min-h-0">
          <div className="w-full h-full flex-1 rounded-xl bg-white dark:bg-card border border-border/50 shadow-xs p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-border/30 shrink-0">
              <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Plus className="size-4" />
              </div>
              <h4 className="font-semibold text-xs text-foreground/90">{t("quickAddEvent")}</h4>
            </div>

            {/* Form */}
            <form onSubmit={addEvent} className="flex flex-col gap-3 flex-1 pt-3 min-h-0 justify-between">
              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <Textarea
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder={t("addPlaceholder")}
                  className="text-xs shadow-none rtl:text-right resize-none flex-1 min-h-[90px] bg-background/50 border-border/50 focus-visible:ring-primary/20"
                />

                <Combobox 
                  options={eventTypeOptions}
                  value={newEventType}
                  onChange={(val) => setNewEventType(val || "event")}
                  className="h-9 text-xs rtl:text-right w-full bg-background/50 border-border/50 shadow-xs"
                  showSearch={false}
                />

                {selectedDate && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/40 text-[11px] text-muted-foreground fa-num">
                    <CalendarIcon className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{t("selectedDateLabel")} {formattedSelectedDate}</span>
                  </div>
                )}
              </div>

              <Button type="submit" variant="default" className="h-9 text-xs w-full shadow-xs mt-2 shrink-0">
                <Plus className="size-3.5" />
                <span>{t("add")}</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

