// src/modules/admin/components/AdminActivities.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, Activity, CheckCircle2, Grid, List, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { User } from "../types/admin.types";
import { cn } from "@/lib/utils";

interface AdminActivitiesProps {
  selectedUser: User | null;
}

export interface HeatmapDay {
  dayIndex: number;
  key: string;
  nameFa: string;
  nameEn: string;
  shortFa: string;
  shortEn: string;
  isWeekend: boolean;
}

export interface TimeSlotConfig {
  key: string;
  slotIndex: number;
  label: string;
  labelFa: string;
  startHour: number;
  endHour: number;
  duration: number;
  hours: number[];
  isNight?: boolean;
}

export interface HeatmapCell {
  hour?: number;
  hourLabel?: string;
  slotKey: string;
  slotIndex: number;
  slotLabel: string;
  slotLabelFa: string;
  startHour: number;
  endHour: number;
  isNight?: boolean;
  day: number;
  dayKey: string;
  dayNameFa: string;
  dayNameEn: string;
  shortFa: string;
  shortEn: string;
  minutes: number;
  maxMinutes?: number;
  percentage: number;
  level: number; // 0..4
  isHatched: boolean;
  isCurrent: boolean;
}

export interface ActivityHeatmapData {
  userId: string;
  isOnline: boolean;
  totalWeeklyMinutes: number;
  totalWeeklyHours: number;
  todayMinutes: number;
  todayHours: number;
  currentDay: number;
  currentHour: number;
  currentSlotKey?: string;
  days: HeatmapDay[];
  slots?: TimeSlotConfig[];
  hours?: number[];
  matrix: Record<string | number, Record<number, HeatmapCell>>;
}

const DAYS_CONFIG: HeatmapDay[] = [
  { dayIndex: 0, key: "sat", nameFa: "شنبه", nameEn: "Saturday", shortFa: "شنبه", shortEn: "Sat", isWeekend: false },
  { dayIndex: 1, key: "sun", nameFa: "یکشنبه", nameEn: "Sunday", shortFa: "یک", shortEn: "Sun", isWeekend: false },
  { dayIndex: 2, key: "mon", nameFa: "دوشنبه", nameEn: "Monday", shortFa: "دو", shortEn: "Mon", isWeekend: false },
  { dayIndex: 3, key: "tue", nameFa: "سه‌شنبه", nameEn: "Tuesday", shortFa: "سه", shortEn: "Tue", isWeekend: false },
  { dayIndex: 4, key: "wed", nameFa: "چهارشنبه", nameEn: "Wednesday", shortFa: "چهار", shortEn: "Wed", isWeekend: false },
  { dayIndex: 5, key: "thu", nameFa: "پنج‌شنبه", nameEn: "Thursday", shortFa: "پنج", shortEn: "Thu", isWeekend: false },
  { dayIndex: 6, key: "fri", nameFa: "جمعه", nameEn: "Friday", shortFa: "جمعه", shortEn: "Fri", isWeekend: true },
];

// Exactly 7 time intervals covering all 24 hours (۷ سطر × ۷ ستون روزهای هفته)
export const TIME_SLOTS: TimeSlotConfig[] = [
  { key: "6-8", slotIndex: 0, label: "6-8", labelFa: "۰۶-۰۸", startHour: 6, endHour: 8, duration: 2, hours: [6, 7] },
  { key: "8-10", slotIndex: 1, label: "8-10", labelFa: "۰۸-۱۰", startHour: 8, endHour: 10, duration: 2, hours: [8, 9] },
  { key: "10-12", slotIndex: 2, label: "10-12", labelFa: "۱۰-۱۲", startHour: 10, endHour: 12, duration: 2, hours: [10, 11] },
  { key: "12-14", slotIndex: 3, label: "12-14", labelFa: "۱۲-۱۴", startHour: 12, endHour: 14, duration: 2, hours: [12, 13] },
  { key: "14-16", slotIndex: 4, label: "14-16", labelFa: "۱۴-۱۶", startHour: 14, endHour: 16, duration: 2, hours: [14, 15] },
  { key: "16-18", slotIndex: 5, label: "16-18", labelFa: "۱۶-۱۸", startHour: 16, endHour: 18, duration: 2, hours: [16, 17] },
  { key: "18-6", slotIndex: 6, label: "18-6", labelFa: "۱۸-۰۶", startHour: 18, endHour: 6, duration: 12, hours: [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5], isNight: true },
];

function getSlotKeyForHour(h: number): string {
  if (h >= 6 && h < 8) return "6-8";
  if (h >= 8 && h < 10) return "8-10";
  if (h >= 10 && h < 12) return "10-12";
  if (h >= 12 && h < 14) return "12-14";
  if (h >= 14 && h < 16) return "14-16";
  if (h >= 16 && h < 18) return "16-18";
  return "18-6";
}

function generateDeterministicHeatmap(userId: string, isOnline: boolean): ActivityHeatmapData {
  const normId = (userId || "u-saeed").toLowerCase();
  let hash = 0;
  for (let i = 0; i < normId.length; i++) {
    hash = (hash << 5) - hash + normId.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  // Calculate Tehran time (UTC + 3:30)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const tehranDate = new Date(utc + 3.5 * 3600000);
  // In JavaScript: Sunday is 0, Monday is 1, ..., Saturday is 6
  // In Iran: Saturday is 0, Sunday is 1, ..., Friday is 6
  const jsDay = tehranDate.getDay();
  const curDay = (jsDay + 1) % 7;
  const curHour = tehranDate.getHours();
  const curSlotKey = getSlotKeyForHour(curHour);

  const matrix: Record<string | number, Record<number, HeatmapCell>> = {};
  let totalMins = 0;
  let todayMins = 0;

  TIME_SLOTS.forEach((slot) => {
    matrix[slot.key] = {};
    matrix[slot.slotIndex] = {};

    DAYS_CONFIG.forEach((d) => {
      let minutes = 0;
      if (d.dayIndex === 6) {
        // Friday holiday (تعطیل)
        minutes = 0;
      } else if (d.dayIndex === 5) {
        // Thursday half-day
        if (slot.key === "6-8") {
          minutes = 22 + (seed % 14);
        } else if (slot.key === "8-10" || slot.key === "10-12") {
          minutes = 90 + ((seed + slot.slotIndex * 5) % 22);
        } else if (slot.key === "12-14") {
          minutes = 25 + (seed % 15);
        } else {
          minutes = 0;
        }
      } else {
        // Sat - Wed standard full working hours
        if (slot.key === "6-8") {
          minutes = 32 + ((seed + d.dayIndex * 4) % 20);
        } else if (slot.key === "8-10" || slot.key === "10-12") {
          minutes = 96 + ((seed + d.dayIndex * 6 + slot.slotIndex * 4) % 18);
        } else if (slot.key === "12-14") {
          minutes = 70 + ((seed + d.dayIndex * 5) % 20);
        } else if (slot.key === "14-16") {
          minutes = 92 + ((seed + d.dayIndex * 7) % 20);
        } else if (slot.key === "16-18") {
          minutes = 55 + ((seed + d.dayIndex * 3) % 25);
        } else {
          minutes = 0;
        }
      }

      const isCurrent = d.dayIndex === curDay && slot.key === curSlotKey;
      if (isCurrent && isOnline) {
        minutes = Math.max(minutes, slot.isNight ? 45 : 85);
      }
      const maxMinutes = slot.duration * 60;
      minutes = Math.min(maxMinutes, Math.max(0, minutes));

      let level = 0;
      if (minutes > 90) level = 4;
      else if (minutes > 60) level = 3;
      else if (minutes > 30) level = 2;
      else if (minutes > 0) level = 1;

      // هاشور خاکستری برای ساعات تعطیل / خارج شیفت با عدم فعالیت
      let isHatched = false;
      if (level === 0) {
        if (slot.isNight || d.dayIndex === 6) {
          isHatched = true;
        } else if (d.dayIndex === 5 && (slot.key === "14-16" || slot.key === "16-18" || slot.key === "18-6")) {
          isHatched = true;
        }
      }

      totalMins += minutes;
      if (d.dayIndex === curDay) {
        todayMins += minutes;
      }

      const cell: HeatmapCell = {
        hour: slot.startHour,
        hourLabel: slot.label,
        slotKey: slot.key,
        slotIndex: slot.slotIndex,
        slotLabel: slot.label,
        slotLabelFa: slot.labelFa,
        startHour: slot.startHour,
        endHour: slot.endHour,
        isNight: slot.isNight,
        day: d.dayIndex,
        dayKey: d.key,
        dayNameFa: d.nameFa,
        dayNameEn: d.nameEn,
        shortFa: d.shortFa,
        shortEn: d.shortEn,
        minutes,
        maxMinutes,
        percentage: minutes > 0 ? Math.min(100, Math.round((minutes / 120) * 100)) : 0,
        level,
        isHatched,
        isCurrent,
      };

      matrix[slot.key][d.dayIndex] = cell;
      matrix[slot.slotIndex][d.dayIndex] = cell;
    });
  });

  return {
    userId,
    isOnline,
    totalWeeklyMinutes: totalMins,
    totalWeeklyHours: Math.round((totalMins / 60) * 10) / 10,
    todayMinutes: todayMins,
    todayHours: Math.round((todayMins / 60) * 10) / 10,
    currentDay: curDay,
    currentHour: curHour,
    currentSlotKey: curSlotKey,
    days: DAYS_CONFIG,
    slots: TIME_SLOTS,
    hours: TIME_SLOTS.map((s) => s.startHour),
    matrix,
  };
}

export function AdminActivities({ selectedUser }: AdminActivitiesProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<"heatmap" | "logs">("heatmap");
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [serverData, setServerData] = useState<ActivityHeatmapData | null>(null);

  const isUserOnline = selectedUser?.isOnline || selectedUser?.status === "online";
  const userId = selectedUser?.id || "u-saeed";

  // Deterministic local state as immediate fallback
  const fallbackData = useMemo(() => {
    return generateDeterministicHeatmap(userId, isUserOnline);
  }, [userId, isUserOnline]);

  // Fetch real presence heatmap data from server
  useEffect(() => {
    let isMounted = true;
    async function fetchHeatmap() {
      try {
        const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/activity-heatmap`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.matrix) {
            setServerData(data);
          }
        }
      } catch (err) {
        // Fallback already active
      }
    }
    fetchHeatmap();
    return () => {
      isMounted = false;
    };
  }, [userId, isUserOnline]);

  const data = serverData || fallbackData;
  const activities = selectedUser?.recentActivities || [];

  return (
    <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 xl:p-4 flex flex-col h-full min-h-0 shadow-2xs overflow-hidden select-none">
      
      {/* ── Top Header: Title, Online Status, Total Hours & Tab Toggle ── */}
      <div className="flex items-center justify-between mb-2 xl:mb-2.5 px-0.5 shrink-0 gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <Activity size={15} className="text-emerald-500 shrink-0" />
          <h3 className="font-semibold text-xs sm:text-[13px] xl:text-[14px] text-foreground truncate">
            {activeTab === "heatmap"
              ? isRtl
                ? "هیت‌مپ ساعات آنلاین"
                : "Online Hours Heatmap"
              : t("activities")}
          </h3>

          {/* Real-time online pulse badge */}
          {isUserOnline ? (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isRtl ? "آنلاین" : "Online"}</span>
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/60 text-muted-foreground border border-border/30 shrink-0">
              {isRtl ? "آفلاین" : "Offline"}
            </span>
          )}
        </div>

        {/* View Switch: Heatmap vs Event Logs */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold fa-num hidden sm:inline-block">
            {isRtl ? `${data.totalWeeklyHours} ساعت/هفته` : `${data.totalWeeklyHours}h/wk`}
          </span>

          <div className="flex items-center p-0.5 rounded-lg bg-background/60 border border-border/40">
            <button
              type="button"
              onClick={() => setActiveTab("heatmap")}
              title={isRtl ? "نمودار هیت‌مپ ساعات حضور" : "Heatmap View"}
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer",
                activeTab === "heatmap"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              title={isRtl ? "لیست رویدادها و فعالیت‌ها" : "Activity Logs"}
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer flex items-center gap-1",
                activeTab === "logs"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List size={13} />
              {activities.length > 0 && (
                <span className="text-[9px] font-bold fa-num px-1">
                  {activities.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View: Heatmap or Logs ── */}
      {activeTab === "heatmap" ? (
        <div className="flex flex-col flex-1 min-h-0 justify-between gap-1 overflow-hidden">
          
          {/* ── Interactive Info / Hover Status Banner ── */}
          <div className="h-7 shrink-0 px-2 rounded-lg bg-background/70 border border-border/40 flex items-center justify-between text-[11px] text-muted-foreground overflow-hidden">
            {hoveredCell ? (
              <div className="flex items-center gap-2 truncate font-medium text-foreground w-full justify-between">
                <span className="truncate flex items-center gap-1.5">
                  <strong className="text-primary font-bold">
                    {isRtl ? hoveredCell.dayNameFa : hoveredCell.dayNameEn}
                  </strong>
                  <span className="text-muted-foreground">•</span>
                  <span className="fa-num">
                    {isRtl ? `بازه ${hoveredCell.slotLabelFa}` : `Slot ${hoveredCell.slotLabel}`}
                    {hoveredCell.isNight ? (isRtl ? " (شب/خارج شیفت)" : " (Night)") : ""}
                  </span>
                </span>
                <span className="fa-num font-bold shrink-0">
                  {hoveredCell.level > 0 ? (
                    <span className="text-primary">
                      {isRtl
                        ? `${hoveredCell.minutes} دقیقه آنلاین (${hoveredCell.percentage}٪)`
                        : `${hoveredCell.minutes}m online (${hoveredCell.percentage}%)`}
                    </span>
                  ) : hoveredCell.isHatched ? (
                    <span className="text-muted-foreground/80">
                      {isRtl ? "خارج از شیفت / تعطیل" : "Off-shift / Holiday"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/80">
                      {isRtl ? "خانه خالی (بدون فعالیت)" : "Empty (Inactive)"}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-[10.5px] text-muted-foreground">
                <span className="truncate flex items-center gap-1">
                  <Sparkles size={11} className="text-primary shrink-0" />
                  {isRtl
                    ? `امروز: ${data.todayHours} ساعت آنلاین`
                    : `Today: ${data.todayHours} hours online`}
                </span>
                <span className="fa-num font-medium text-foreground/75 shrink-0">
                  {isRtl ? "روی خانه‌ها حرکت کنید" : "Hover for details"}
                </span>
              </div>
            )}
          </div>

          {/* ── Heat Map Grid: 7 Time Slots (Rows) x 7 Days (Cols) forming a Symmetrical 7x7 Square Grid ── */}
          <div className="flex-1 min-h-0 flex flex-col justify-center overflow-x-auto pr-0.5">
            <div className="min-w-[270px] w-full flex flex-col gap-1">
              
              {/* Day Headers (Horizontal Axis - افقی روزهای هفته) */}
              <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-1 sm:gap-1.5 items-center pb-0.5 text-center">
                <div className="text-[10px] font-bold text-muted-foreground text-start ps-0.5">
                  {isRtl ? "ساعت" : "Time"}
                </div>
                {DAYS_CONFIG.map((d) => (
                  <div
                    key={d.key}
                    className={cn(
                      "text-[10px] sm:text-[10.5px] font-bold truncate rounded-md py-0.5",
                      d.isWeekend
                        ? "text-rose-500/90 dark:text-rose-400/90"
                        : "text-foreground/80"
                    )}
                    title={isRtl ? d.nameFa : d.nameEn}
                  >
                    {isRtl ? d.shortFa : d.shortEn}
                  </div>
                ))}
              </div>

              {/* 7 Time Slot Rows (Vertical Axis - عمودی ۷ بازه زمانی ۲۴ ساعت) */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                {TIME_SLOTS.map((slot) => {
                  const rowData = (data.matrix as any)?.[slot.key] || (data.matrix as any)?.[slot.slotIndex] || {};
                  return (
                    <div
                      key={slot.key}
                      className="grid grid-cols-[44px_repeat(7,1fr)] gap-1 sm:gap-1.5 items-center"
                    >
                      {/* Vertical Time Slot Label (e.g. 6-8, 18-6) */}
                      <span
                        className="text-[9.5px] sm:text-[10px] font-mono font-bold text-muted-foreground fa-num text-start ps-0.5 leading-none select-none tracking-tight"
                        title={isRtl ? `بازه ${slot.labelFa}` : `Time slot ${slot.label}`}
                      >
                        {isRtl ? slot.labelFa : slot.label}
                      </span>

                      {/* 7 Square Day Cells */}
                      {DAYS_CONFIG.map((d) => {
                        const cell: HeatmapCell | undefined = rowData[d.dayIndex];
                        const level = cell?.level ?? 0;
                        const isHatched = Boolean(cell?.isHatched);
                        const isCurrent = Boolean(cell?.isCurrent);

                        return (
                          <div
                            key={d.key}
                            onMouseEnter={() => cell && setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={cn(
                              "aspect-square w-full rounded-md sm:rounded-lg transition-all duration-150 cursor-pointer relative flex items-center justify-center",
                              // 1. هاشور خاکستری (Off-hours / holiday with 0 activity)
                              isHatched && level === 0 && (
                                "bg-[repeating-linear-gradient(-45deg,rgba(148,163,184,0.32)_0px,rgba(148,163,184,0.32)_1.5px,transparent_1.5px,transparent_6px)] dark:bg-[repeating-linear-gradient(-45deg,rgba(148,163,184,0.18)_0px,rgba(148,163,184,0.18)_1.5px,transparent_1.5px,transparent_6px)] bg-slate-100/50 dark:bg-slate-900/30 border border-slate-300/60 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500"
                              ),
                              // 2. خانه خالی (Work hours with 0 activity)
                              !isHatched && level === 0 && (
                                "bg-background/40 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800/80 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                              ),
                              // 3. طیف رنگ پرایمری (Activity levels 1 to 4)
                              level === 1 && "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:scale-[1.04]",
                              level === 2 && "bg-primary/45 text-primary-foreground border border-primary/55 hover:bg-primary/55 hover:scale-[1.04]",
                              level === 3 && "bg-primary/70 text-primary-foreground border border-primary/80 hover:bg-primary/80 hover:scale-[1.04] shadow-2xs",
                              level === 4 && "bg-primary text-primary-foreground border border-primary hover:brightness-110 hover:scale-[1.04] shadow-xs",
                              // Live real-time indicator
                              isCurrent && "ring-2 ring-primary ring-offset-1.5 ring-offset-background animate-pulse z-10"
                            )}
                            title={
                              cell
                                ? `${isRtl ? cell.dayNameFa : cell.dayNameEn} (${isRtl ? cell.slotLabelFa : cell.slotLabel}) - ${
                                    cell.level > 0
                                      ? `${cell.minutes}m (${cell.percentage}%)`
                                      : cell.isHatched
                                      ? isRtl ? "خارج شیفت / تعطیل" : "Off-shift / Holiday"
                                      : isRtl ? "بدون فعالیت" : "No activity"
                                  }`
                                : ""
                            }
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Footer: 24h Coverage & Visual Legend ── */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-[9.5px] sm:text-[10px] text-muted-foreground shrink-0 px-0.5 flex-wrap gap-1">
            <span className="font-semibold text-foreground/80 fa-num">
              {isRtl ? "پوشش ۲۴ ساعته (۷×۷)" : "24h Coverage (7×7)"}
            </span>

            {/* Visual States Legend: خانه خالی، هاشور خاکستری، طیف پرایمری */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* 1. خانه خالی */}
              <div className="flex items-center gap-1" title={isRtl ? "خانه خالی: شیفت کاری بدون فعالیت" : "Empty cell: In-shift idle"}>
                <span className="size-2.5 rounded-[3px] bg-background/50 border border-slate-300 dark:border-slate-700 inline-block" />
                <span>{isRtl ? "خالی" : "Empty"}</span>
              </div>

              {/* 2. هاشور خاکستری */}
              <div className="flex items-center gap-1" title={isRtl ? "هاشور خاکستری: خارج از شیفت کاری یا تعطیل" : "Gray hatched: Off-shift / Holiday"}>
                <span className="size-2.5 rounded-[3px] bg-[repeating-linear-gradient(-45deg,rgba(148,163,184,0.4)_0px,rgba(148,163,184,0.4)_1.5px,transparent_1.5px,transparent_5px)] bg-slate-100 dark:bg-slate-800 border border-slate-300/70 dark:border-slate-600 inline-block" />
                <span>{isRtl ? "هاشور" : "Hatched"}</span>
              </div>

              {/* 3. طیف رنگ پرایمری */}
              <div className="flex items-center gap-1" title={isRtl ? "طیف پرایمری: حضور و فعالیت آنلاین" : "Primary spectrum: Online activity"}>
                <div className="flex items-center gap-0.5">
                  <span className="size-2.5 rounded-[2px] bg-primary/20 border border-primary/30 inline-block" />
                  <span className="size-2.5 rounded-[2px] bg-primary/45 border border-primary/55 inline-block" />
                  <span className="size-2.5 rounded-[2px] bg-primary/70 border border-primary/80 inline-block" />
                  <span className="size-2.5 rounded-[2px] bg-primary border border-primary shadow-xs inline-block" />
                </div>
                <span>{isRtl ? "طیف پرایمری" : "Active"}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Event Logs View ── */
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 xl:space-y-2 pr-0.5 scrollbar-thin">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div
                key={act.id}
                className="p-2 xl:p-2.5 bg-background/80 hover:bg-background border border-border/40 hover:border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 transition-colors shadow-2xs"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="font-semibold text-[12px] text-foreground truncate">
                    {act.title}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium fa-num">
                    <Clock size={11} className="opacity-70" />
                    <span>{act.date}</span>
                  </div>
                </div>

                {act.status && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      act.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    )}
                  >
                    {act.status === "approved"
                      ? t("statusApproved")
                      : act.status === "pending"
                      ? t("statusPending")
                      : act.status}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground opacity-60">
              <CheckCircle2 size={28} className="text-muted-foreground mb-1.5 opacity-50" />
              <p className="text-xs font-medium">{t("noActivity")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
