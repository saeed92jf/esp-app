"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X,
  Calendar,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getJalaliDate } from "@/components/ui/date-picker";
import type { DailyRoutine } from "../../services/dashboard.service";

interface DailyRoutinesWidgetProps {
  initialRoutines?: DailyRoutine[];
  className?: string;
  isCompact?: boolean;
}

const STORAGE_KEY = "dashboard_user_daily_routines_v3";
const CALENDAR_PREF_KEY = "dashboard_routines_calendar_type";

type RoutineColor = "purple" | "emerald" | "rose" | "orange" | "blue" | "amber";

const COLOR_CONFIG: Record<
  RoutineColor,
  {
    text: string;
    bg: string;
    border: string;
    badge: string;
    lightText: string;
  }
> = {
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    badge: "bg-purple-500",
    lightText: "text-purple-400",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500",
    lightText: "text-emerald-400",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    badge: "bg-rose-500",
    lightText: "text-rose-400",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    badge: "bg-orange-500",
    lightText: "text-orange-400",
  },
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    badge: "bg-blue-500",
    lightText: "text-blue-400",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    badge: "bg-amber-500",
    lightText: "text-amber-400",
  },
};

const DEFAULT_ROUTINES: DailyRoutine[] = [
  {
    id: "rtn-1",
    title: "کتاب",
    color: "purple",
    completedDays: {},
  },
  {
    id: "rtn-2",
    title: "ورزش",
    color: "emerald",
    completedDays: {},
  },
  {
    id: "rtn-3",
    title: "آزمون نظام مهندسی",
    color: "rose",
    highlight: true,
    completedDays: {},
  },
  {
    id: "rtn-4",
    title: "متمتیکا و محاسبات",
    color: "orange",
    completedDays: {},
  },
];

const JALALI_MONTHS_FA = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const JALALI_MONTHS_EN = [
  "Farvardin",
  "Ordibehesht",
  "Khordad",
  "Tir",
  "Mordad",
  "Shahrivar",
  "Mehr",
  "Aban",
  "Azar",
  "Dey",
  "Bahman",
  "Esfand",
];

const GREGORIAN_MONTHS_FA = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];
const GREGORIAN_MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface WeekDayItem {
  name: string;
  fullName: string;
  isoDateStr: string;
  dayNumber: number;
  isToday: boolean;
}

export function DailyRoutinesWidget({
  initialRoutines,
  className,
  isCompact = false,
}: DailyRoutinesWidgetProps) {
  const t = useTranslations("Dashboard.routines");
  const locale = useLocale();
  const isFa = locale === "fa";

  // Calendar mode: "jalali" (شمسی) vs "gregorian" (میلادی)
  const [calendarType, setCalendarType] = React.useState<"jalali" | "gregorian">(
    () => {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(CALENDAR_PREF_KEY);
          if (saved === "jalali" || saved === "gregorian") return saved;
        } catch {}
      }
      return isFa ? "jalali" : "gregorian";
    }
  );

  const isJalali = calendarType === "jalali";

  const handleToggleCalendar = () => {
    const next = isJalali ? "gregorian" : "jalali";
    setCalendarType(next);
    try {
      localStorage.setItem(CALENDAR_PREF_KEY, next);
    } catch {}
  };

  const [routines, setRoutines] = React.useState<DailyRoutine[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    if (initialRoutines && initialRoutines.length > 0) {
      return initialRoutines.map((r, i) => ({
        ...r,
        color:
          (r.color as RoutineColor) ||
          (["purple", "emerald", "rose", "orange"][i % 4] as RoutineColor),
        completedDays: r.completedDays || {},
      }));
    }
    return DEFAULT_ROUTINES;
  });

  // Week offset (can navigate to any week of the year: -52 to +52 or more)
  const [weekOffset, setWeekOffset] = React.useState<number>(0);
  const [isAdding, setIsAdding] = React.useState(false);

  // New Routine Form State
  type RoutineScope = "week" | "month" | "year" | "custom";
  const [newTitle, setNewTitle] = React.useState("");
  const [newColor, setNewColor] = React.useState<RoutineColor>("purple");
  const [newHighlight, setNewHighlight] = React.useState(false);
  const [newScope, setNewScope] = React.useState<RoutineScope>("week");
  const [customSubTab, setCustomSubTab] = React.useState<"month" | "year">("month");
  const [selectedMonthWeekIndices, setSelectedMonthWeekIndices] = React.useState<number[]>([]);
  const [selectedWeekNumbers, setSelectedWeekNumbers] = React.useState<number[]>([]);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
    } catch {}
  }, [routines]);

  // Today's date string (local timezone safe)
  const todayIsoStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Compute 7 days of the week based on calendarType and weekOffset, plus canonical week keys
  const {
    weekDays,
    weekRangeTitle,
    activeWeekKey,
    thisWeekKey,
    prevWeekKey,
    activeMonthKey,
    activeYearKey,
    activeMonthName,
    activeWeekNumber,
    activeWeekOfMonth,
    monthWeeksList,
  } = React.useMemo<{
    weekDays: WeekDayItem[];
    weekRangeTitle: string;
    activeWeekKey: string;
    thisWeekKey: string;
    prevWeekKey: string;
    activeMonthKey: string;
    activeYearKey: string;
    activeMonthName: string;
    activeWeekNumber: number;
    activeWeekOfMonth: number;
    monthWeeksList: { index: number; label: string; isCurrent: boolean }[];
  }>(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    // Baseline Saturday for stable weekKey across calendars
    const dayOfWeek = today.getDay(); // 0: Sun ... 6: Sat
    const daysSinceSaturday = (dayOfWeek + 1) % 7;
    const currentSaturday = new Date(
      today.getTime() - daysSinceSaturday * 86400000
    );
    currentSaturday.setHours(12, 0, 0, 0);

    const targetSaturday = new Date(
      currentSaturday.getTime() + weekOffset * 7 * 86400000
    );
    targetSaturday.setHours(12, 0, 0, 0);

    const formatWeekKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const thisWeek = formatWeekKey(currentSaturday);
    const activeWeek = formatWeekKey(targetSaturday);
    const prevWeek = formatWeekKey(new Date(targetSaturday.getTime() - 7 * 86400000));

    const result: WeekDayItem[] = [];

    if (isJalali) {
      // Jalali Week: Saturday to Friday
      const FA_NAMES = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
      const FA_FULL = [
        "شنبه",
        "یک‌شنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنج‌شنبه",
        "جمعه",
      ];
      const EN_NAMES = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"];
      const EN_FULL = [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ];

      for (let i = 0; i < 7; i++) {
        const d = new Date(targetSaturday.getTime() + i * 86400000);
        const j = getJalaliDate(d);
        const isoDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const isToday = weekOffset === 0 && i === daysSinceSaturday;

        result.push({
          name: isFa ? FA_NAMES[i] : EN_NAMES[i],
          fullName: isFa ? FA_FULL[i] : EN_FULL[i],
          isoDateStr,
          dayNumber: j.day,
          isToday,
        });
      }

      // Compute Week Range Title for Jalali
      const firstJ = getJalaliDate(new Date(targetSaturday.getTime()));
      const lastJ = getJalaliDate(new Date(targetSaturday.getTime() + 6 * 86400000));
      const mName1 = isFa
        ? JALALI_MONTHS_FA[firstJ.month - 1]
        : JALALI_MONTHS_EN[firstJ.month - 1];
      const mName2 = isFa
        ? JALALI_MONTHS_FA[lastJ.month - 1]
        : JALALI_MONTHS_EN[lastJ.month - 1];

      let range = "";
      if (firstJ.month === lastJ.month) {
        range = isFa
          ? `${firstJ.day} الی ${lastJ.day} ${mName1} ${firstJ.year}`
          : `${firstJ.day} - ${lastJ.day} ${mName1} ${firstJ.year}`;
      } else {
        range = isFa
          ? `${firstJ.day} ${mName1} تا ${lastJ.day} ${mName2} ${lastJ.year}`
          : `${firstJ.day} ${mName1} - ${lastJ.day} ${mName2} ${lastJ.year}`;
      }

      // Mid-week date for Jalali month & week number calculation
      const midDate = new Date(targetSaturday.getTime() + 3 * 86400000);
      const jMid = getJalaliDate(midDate);
      const yearKey = String(jMid.year);
      const monthKey = `${jMid.year}-${String(jMid.month).padStart(2, "0")}`;
      const monthName = isFa ? JALALI_MONTHS_FA[jMid.month - 1] : JALALI_MONTHS_EN[jMid.month - 1];

      const dayOfYear =
        jMid.month <= 6
          ? (jMid.month - 1) * 31 + jMid.day
          : 6 * 31 + (jMid.month - 7) * 30 + jMid.day;
      const weekNumber = Math.min(52, Math.max(1, Math.ceil(dayOfYear / 7)));
      const weekOfMonth = Math.min(5, Math.max(1, Math.ceil(jMid.day / 7)));
      const monthDays = jMid.month <= 6 ? 31 : jMid.month <= 11 ? 30 : 29;

      const mWeeks: { index: number; label: string; isCurrent: boolean }[] = [
        { index: 1, label: isFa ? `هفته ۱ (۱ الی ۷ ${monthName})` : `Week 1 (1 - 7 ${monthName})`, isCurrent: weekOfMonth === 1 },
        { index: 2, label: isFa ? `هفته ۲ (۸ الی ۱۴ ${monthName})` : `Week 2 (8 - 14 ${monthName})`, isCurrent: weekOfMonth === 2 },
        { index: 3, label: isFa ? `هفته ۳ (۱۵ الی ۲۱ ${monthName})` : `Week 3 (15 - 21 ${monthName})`, isCurrent: weekOfMonth === 3 },
        { index: 4, label: isFa ? `هفته ۴ (۲۲ الی ۲۸ ${monthName})` : `Week 4 (22 - 28 ${monthName})`, isCurrent: weekOfMonth === 4 },
        { index: 5, label: isFa ? `هفته ۵ (۲۹ الی ${monthDays} ${monthName})` : `Week 5 (29 - ${monthDays} ${monthName})`, isCurrent: weekOfMonth === 5 },
      ];

      return {
        weekDays: result,
        weekRangeTitle: range,
        activeWeekKey: activeWeek,
        thisWeekKey: thisWeek,
        prevWeekKey: prevWeek,
        activeMonthKey: monthKey,
        activeYearKey: yearKey,
        activeMonthName: monthName,
        activeWeekNumber: weekNumber,
        activeWeekOfMonth: weekOfMonth,
        monthWeeksList: mWeeks,
      };
    } else {
      // Gregorian Week: Monday to Sunday
      const gDayOfWeek = (today.getDay() + 6) % 7; // 0: Mon ... 6: Sun
      const currentMonday = new Date(today.getTime() - gDayOfWeek * 86400000);
      const targetMonday = new Date(
        currentMonday.getTime() + weekOffset * 7 * 86400000
      );

      const FA_NAMES = ["د", "س", "چ", "پ", "ج", "ش", "ی"];
      const FA_FULL = [
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنج‌شنبه",
        "جمعه",
        "شنبه",
        "یک‌شنبه",
      ];
      const EN_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
      const EN_FULL = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      for (let i = 0; i < 7; i++) {
        const d = new Date(targetMonday.getTime() + i * 86400000);
        const isoDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const isToday = weekOffset === 0 && i === gDayOfWeek;

        result.push({
          name: isFa ? FA_NAMES[i] : EN_NAMES[i],
          fullName: isFa ? FA_FULL[i] : EN_FULL[i],
          isoDateStr,
          dayNumber: d.getDate(),
          isToday,
        });
      }

      // Compute Week Range Title for Gregorian
      const d1 = new Date(targetMonday.getTime());
      const d2 = new Date(targetMonday.getTime() + 6 * 86400000);
      const m1 = isFa
        ? GREGORIAN_MONTHS_FA[d1.getMonth()]
        : GREGORIAN_MONTHS_EN[d1.getMonth()];
      const m2 = isFa
        ? GREGORIAN_MONTHS_FA[d2.getMonth()]
        : GREGORIAN_MONTHS_EN[d2.getMonth()];

      let range = "";
      if (d1.getMonth() === d2.getMonth()) {
        range = isFa
          ? `${d1.getDate()} الی ${d2.getDate()} ${m1} ${d1.getFullYear()}`
          : `${m1} ${d1.getDate()} - ${d2.getDate()}, ${d1.getFullYear()}`;
      } else {
        range = isFa
          ? `${d1.getDate()} ${m1} تا ${d2.getDate()} ${m2} ${d2.getFullYear()}`
          : `${m1} ${d1.getDate()} - ${m2} ${d2.getDate()}, ${d2.getFullYear()}`;
      }

      // Mid-week date for Gregorian month & week number calculation
      const gMidDate = new Date(targetMonday.getTime() + 3 * 86400000);
      const yearKey = String(gMidDate.getFullYear());
      const monthKey = `${gMidDate.getFullYear()}-${String(gMidDate.getMonth() + 1).padStart(2, "0")}`;
      const monthName = isFa ? GREGORIAN_MONTHS_FA[gMidDate.getMonth()] : GREGORIAN_MONTHS_EN[gMidDate.getMonth()];

      const dIso = new Date(Date.UTC(gMidDate.getFullYear(), gMidDate.getMonth(), gMidDate.getDate()));
      const dayNum = dIso.getUTCDay() || 7;
      dIso.setUTCDate(dIso.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(dIso.getUTCFullYear(), 0, 1));
      const weekNumber = Math.min(52, Math.max(1, Math.ceil((((dIso.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)));

      const gDay = gMidDate.getDate();
      const weekOfMonth = Math.min(5, Math.max(1, Math.ceil(gDay / 7)));
      const lastDayOfGMonth = new Date(gMidDate.getFullYear(), gMidDate.getMonth() + 1, 0).getDate();

      const mWeeks: { index: number; label: string; isCurrent: boolean }[] = [
        { index: 1, label: isFa ? `هفته ۱ (۱ الی ۷ ${monthName})` : `Week 1 (1 - 7 ${monthName})`, isCurrent: weekOfMonth === 1 },
        { index: 2, label: isFa ? `هفته ۲ (۸ الی ۱۴ ${monthName})` : `Week 2 (8 - 14 ${monthName})`, isCurrent: weekOfMonth === 2 },
        { index: 3, label: isFa ? `هفته ۳ (۱۵ الی ۲۱ ${monthName})` : `Week 3 (15 - 21 ${monthName})`, isCurrent: weekOfMonth === 3 },
        { index: 4, label: isFa ? `هفته ۴ (۲۲ الی ۲۸ ${monthName})` : `Week 4 (22 - 28 ${monthName})`, isCurrent: weekOfMonth === 4 },
        { index: 5, label: isFa ? `هفته ۵ (۲۹ الی ${lastDayOfGMonth} ${monthName})` : `Week 5 (29 - ${lastDayOfGMonth} ${monthName})`, isCurrent: weekOfMonth === 5 },
      ];

      return {
        weekDays: result,
        weekRangeTitle: range,
        activeWeekKey: activeWeek,
        thisWeekKey: thisWeek,
        prevWeekKey: prevWeek,
        activeMonthKey: monthKey,
        activeYearKey: yearKey,
        activeMonthName: monthName,
        activeWeekNumber: weekNumber,
        activeWeekOfMonth: weekOfMonth,
        monthWeeksList: mWeeks,
      };
    }
  }, [weekOffset, isJalali, isFa]);

  // Active routines belonging to the week being viewed (with Scope support: year, month, custom, week)
  const activeRoutines = React.useMemo(() => {
    return routines.filter((r) => {
      // 1. Whole year scope
      if (r.scope === "year") {
        return !r.yearKey || r.yearKey === activeYearKey;
      }
      // 2. Whole month scope
      if (r.scope === "month") {
        return r.monthKey === activeMonthKey;
      }
      // 3. Custom weeks scope
      if (r.scope === "custom") {
        if (r.weekKeys && r.weekKeys.includes(activeWeekKey)) return true;
        if (r.customWeekNumbers && r.customWeekNumbers.length > 0 && r.customWeekNumbers.includes(activeWeekNumber)) return true;
        if (r.monthKey === activeMonthKey && r.monthWeekIndices && r.monthWeekIndices.includes(activeWeekOfMonth)) return true;
        return false;
      }
      // 4. Default / specific week scope
      const rWeekKey = r.weekKey || thisWeekKey;
      return rWeekKey === activeWeekKey;
    });
  }, [routines, activeWeekKey, thisWeekKey, activeMonthKey, activeYearKey, activeWeekNumber, activeWeekOfMonth]);

  // Previous week routines for quick copy feature
  const prevWeekRoutines = React.useMemo(() => {
    return routines.filter((r) => (r.weekKey || thisWeekKey) === prevWeekKey);
  }, [routines, prevWeekKey, thisWeekKey]);

  const hasPreviousRoutines = prevWeekRoutines.length > 0;

  const handleCopyFromPreviousWeek = () => {
    const cloned: DailyRoutine[] = prevWeekRoutines.map((r, idx) => ({
      ...r,
      id: `rtn-${Date.now()}-${idx}`,
      weekKey: activeWeekKey,
      completedDays: {},
      completedToday: false,
    }));
    setRoutines((prev) => [...prev, ...cloned]);
  };

  // Toggle routine completion on a specific day
  const toggleRoutineDay = (routineId: string, isoDateStr: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== routineId) return r;
        const currentCompletedDays = r.completedDays || {};
        const isDone = Boolean(currentCompletedDays[isoDateStr]);
        const nextCompletedDays = {
          ...currentCompletedDays,
          [isoDateStr]: !isDone,
        };

        const completedToday =
          isoDateStr === todayIsoStr
            ? !isDone
            : Boolean(nextCompletedDays[todayIsoStr]);

        return {
          ...r,
          completedDays: nextCompletedDays,
          completedToday,
        };
      })
    );
  };

  // Toggle routine for today or all days of active week via main circle
  const toggleRoutineMainCheck = (routine: DailyRoutine) => {
    if (weekOffset === 0) {
      toggleRoutineDay(routine.id, todayIsoStr);
    } else {
      const allDone = weekDays.every((d) =>
        Boolean(routine.completedDays?.[d.isoDateStr])
      );
      setRoutines((prev) =>
        prev.map((r) => {
          if (r.id !== routine.id) return r;
          const next = { ...(r.completedDays || {}) };
          weekDays.forEach((d) => {
            next[d.isoDateStr] = !allDone;
          });
          return {
            ...r,
            completedDays: next,
            completedToday: Boolean(next[todayIsoStr]),
          };
        })
      );
    }
  };

  const deleteRoutine = (routineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdRoutine: DailyRoutine = {
      id: `rtn-${Date.now()}`,
      title: newTitle.trim(),
      color: newColor,
      highlight: newHighlight,
      scope: newScope,
      weekKey: activeWeekKey,
      monthKey: activeMonthKey,
      yearKey: activeYearKey,
      monthWeekIndices: newScope === "custom" ? selectedMonthWeekIndices : undefined,
      customWeekNumbers: newScope === "custom" ? selectedWeekNumbers : undefined,
      createdAtDate: todayIsoStr,
      completedDays: {},
      completedToday: false,
    };

    setRoutines((prev) => [...prev, createdRoutine]);
    setNewTitle("");
    setNewHighlight(false);
    setNewScope("week");
    setSelectedMonthWeekIndices([]);
    setSelectedWeekNumbers([]);
    setIsAdding(false);
  };

  // Completion calculation for active week:
  // Current week: completion percentage of active routines for today
  // Other weeks: completion percentage across the 7 days of that week
  const isCurrentWeek = weekOffset === 0;
  const progressPercentage = React.useMemo(() => {
    if (activeRoutines.length === 0) return 0;
    if (isCurrentWeek) {
      const completedTodayCount = activeRoutines.filter((r) =>
        Boolean(r.completedDays?.[todayIsoStr])
      ).length;
      return Math.round((completedTodayCount / activeRoutines.length) * 100);
    } else {
      const totalWeekSpots = activeRoutines.length * 7;
      const completedSpots = activeRoutines.reduce((acc, r) => {
        return (
          acc +
          weekDays.filter((d) => Boolean(r.completedDays?.[d.isoDateStr])).length
        );
      }, 0);
      return Math.round((completedSpots / totalWeekSpots) * 100);
    }
  }, [activeRoutines, isCurrentWeek, todayIsoStr, weekDays]);

  // Numbers container class: Use fa-num if locale is Persian
  const numbersClass = isFa ? "fa-num" : "";

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative p-3 sm:p-4 gap-2.5 @container select-none",
        numbersClass,
        className
      )}
    >
      {/* ── Top Header Bar (With safe spacing away from shell controls) ── */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 shrink-0",
          isCompact ? "pe-0" : "pe-18 sm:pe-20"
        )}
      >
        {/* Module Title: "روتین" / "Routine" (Fixed line-height & vertical padding for Persian descenders) */}
        <div className="flex items-center gap-2 min-w-0 py-1">
          <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0 text-emerald-500">
            <Flame className="size-4.5" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-foreground/90 leading-normal py-1 inline-block align-middle truncate">
            {t("title")}
          </h3>
        </div>

        {/* Action Controls: Switcher & Add New Routine Button (Identical Size) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Calendar System Switch (Matching 'New' button size) */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleToggleCalendar}
            className="h-7 text-xs gap-1 px-2 font-medium shadow-xs shrink-0 cursor-pointer"
            aria-label={isJalali ? t("gregorian") : t("jalali")}
          >
            <Calendar className="size-3.5 text-primary" />
            <span>{isJalali ? t("jalali") : t("gregorian")}</span>
          </Button>

          {/* Add New Routine Button */}
          <Button
            size="sm"
            variant={isAdding ? "outline" : "default"}
            onClick={() => {
              if (!isAdding) {
                // Initialize default selections when opening
                setSelectedMonthWeekIndices([activeWeekOfMonth]);
                setSelectedWeekNumbers([activeWeekNumber]);
              }
              setIsAdding(!isAdding);
            }}
            className="h-7 text-xs gap-1 px-2 font-medium shadow-xs shrink-0 cursor-pointer"
          >
            {isAdding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            <span className="hidden @[340px]:inline">
              {isAdding ? t("cancel") : t("addRoutine")}
            </span>
          </Button>
        </div>
      </div>

      {/* ── Progress Bar Under Header ("درصد رو همون نوار بذار زیرشون") ── */}
      <div className="flex items-center gap-2.5 shrink-0 px-0.5">
        <span className="text-[11px] text-muted-foreground font-medium shrink-0">
          {isCurrentWeek ? t("todayProgress") : t("weekProgress")}
        </span>
        <div className="flex-1 h-1.5 bg-muted/70 dark:bg-muted/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
          {progressPercentage}%
        </span>
      </div>

      {/* ── Year-Round Week Navigation Bar (Arrows Only for Prev/Next) ── */}
      <div className="flex items-center justify-between px-1 py-1 rounded-xl bg-muted/20 border border-border/40 shrink-0 text-xs">
        {/* Previous Week Navigation (Arrow Only) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((prev) => prev - (isFa ? 1 : -1))}
          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
          aria-label={t("prevWeek")}
        >
          {isFa ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>

        {/* Current Week / Jump to Today Button */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold text-foreground/80 px-2 truncate">
            {weekRangeTitle}
          </span>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
              aria-label={t("thisWeek")}
            >
              <RotateCcw className="size-2.5" />
              <span>{t("thisWeek")}</span>
            </button>
          )}
        </div>

        {/* Next Week Navigation (Arrow Only) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((prev) => prev + (isFa ? 1 : -1))}
          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
          aria-label={t("nextWeek")}
        >
          {isFa ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>

      {/* ── Add Routine Form (With Scope: This Week / Whole Month / Whole Year / Custom Weeks) ── */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddRoutine}
            className="flex flex-col gap-2.5 p-3 rounded-2xl bg-white dark:bg-card border border-border/70 shadow-sm shrink-0 overflow-hidden"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pb-0.5">
              <span>{t("addForThisWeek")}</span>
              <span className="text-foreground/80 font-semibold truncate">{weekRangeTitle}</span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("routinePlaceholder")}
                className="h-8.5 text-xs bg-muted/30 border-border/50 flex-1"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newTitle.trim()}
                className="h-8.5 text-xs px-3 shadow-xs shrink-0 cursor-pointer"
              >
                {t("save")}
              </Button>
            </div>

            {/* Scope Selection: [این هفته] [کل ماه] [کل سال] [هفته‌های خاص] */}
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-muted/30 border border-border/50 text-xs">
                <button
                  type="button"
                  onClick={() => setNewScope("week")}
                  className={cn(
                    "py-1 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center truncate",
                    newScope === "week"
                      ? "bg-white dark:bg-card text-foreground shadow-2xs font-semibold ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("scopeThisWeek")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewScope("month")}
                  className={cn(
                    "py-1 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center truncate",
                    newScope === "month"
                      ? "bg-white dark:bg-card text-foreground shadow-2xs font-semibold ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("scopeMonth")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewScope("year")}
                  className={cn(
                    "py-1 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center truncate",
                    newScope === "year"
                      ? "bg-white dark:bg-card text-foreground shadow-2xs font-semibold ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("scopeYear")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewScope("custom")}
                  className={cn(
                    "py-1 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center truncate",
                    newScope === "custom"
                      ? "bg-white dark:bg-card text-foreground shadow-2xs font-semibold ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("scopeCustom")}
                </button>
              </div>

              {/* Scope Hint Banner */}
              {newScope === "month" && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {isFa ? `این روتین در تمام هفته‌های ${activeMonthName} فعال خواهد بود.` : `This routine will be active for all weeks of ${activeMonthName}.`}
                </div>
              )}
              {newScope === "year" && (
                <div className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                  {isFa ? `این روتین در تمام هفته‌های سال ${activeYearKey} فعال خواهد بود.` : `This routine will be active for all weeks of ${activeYearKey}.`}
                </div>
              )}

              {/* Custom Weeks Checklist Section */}
              {newScope === "custom" && (
                <div className="flex flex-col gap-2 p-2 rounded-xl bg-muted/20 border border-border/50 text-xs">
                  {/* Sub-tabs: Month Weeks vs All Year Weeks */}
                  <div className="flex items-center justify-between gap-1 pb-1 border-b border-border/40">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCustomSubTab("month")}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer",
                          customSubTab === "month"
                            ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {t("monthWeeks")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomSubTab("year")}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer",
                          customSubTab === "year"
                            ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {t("allYearWeeks")}
                      </button>
                    </div>

                    {/* Quick presets for year view */}
                    {customSubTab === "year" && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setSelectedWeekNumbers(Array.from({ length: 26 }, (_, i) => (i + 1) * 2))}
                          className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {t("evenWeeks")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedWeekNumbers(Array.from({ length: 26 }, (_, i) => i * 2 + 1))}
                          className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {t("oddWeeks")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedWeekNumbers(Array.from({ length: 52 }, (_, i) => i + 1))}
                          className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {t("selectAll")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedWeekNumbers([])}
                          className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {t("clearAll")}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Month Weeks Checklist */}
                  {customSubTab === "month" && (
                    <div className="flex flex-col gap-1 py-0.5">
                      {monthWeeksList.map((mw) => {
                        const isChecked = selectedMonthWeekIndices.includes(mw.index);
                        return (
                          <label
                            key={mw.index}
                            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/40 cursor-pointer select-none transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedMonthWeekIndices((prev) =>
                                  prev.includes(mw.index)
                                    ? prev.filter((i) => i !== mw.index)
                                    : [...prev, mw.index]
                                );
                              }}
                              className="size-3.5 rounded accent-primary cursor-pointer"
                            />
                            <span className={cn("text-[11px]", isChecked ? "font-semibold text-foreground" : "text-muted-foreground")}>
                              {mw.label}
                            </span>
                            {mw.isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold ms-auto">
                                {t("thisWeek")}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Year Weeks 1-52 Grid */}
                  {customSubTab === "year" && (
                    <div className="flex flex-col gap-1 py-0.5">
                      <div className="grid grid-cols-7 sm:grid-cols-13 gap-1 max-h-28 overflow-y-auto custom-scrollbar p-0.5">
                        {Array.from({ length: 52 }, (_, i) => i + 1).map((wNum) => {
                          const isSelected = selectedWeekNumbers.includes(wNum);
                          const isCurrent = wNum === activeWeekNumber;
                          return (
                            <button
                              key={wNum}
                              type="button"
                              onClick={() => {
                                setSelectedWeekNumbers((prev) =>
                                  prev.includes(wNum)
                                    ? prev.filter((n) => n !== wNum)
                                    : [...prev, wNum]
                                );
                              }}
                              className={cn(
                                "h-6 text-[10px] rounded-md font-medium transition-all cursor-pointer flex items-center justify-center relative",
                                isSelected
                                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground",
                                isCurrent && !isSelected && "ring-1 ring-primary/60 font-bold text-primary"
                              )}
                              title={`Week ${wNum}`}
                            >
                              {wNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Color Palette & Options */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {t("color")}:
                </span>
                {(
                  ["purple", "emerald", "rose", "orange", "blue", "amber"] as RoutineColor[]
                ).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={cn(
                      "size-5 rounded-full transition-transform cursor-pointer flex items-center justify-center",
                      COLOR_CONFIG[c].badge,
                      newColor === c
                        ? "ring-2 ring-foreground/60 scale-110"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    {newColor === c && <Check className="size-3 text-white" />}
                  </button>
                ))}
              </div>

              {/* Yellow Highlight Strip Toggle */}
              <button
                type="button"
                onClick={() => setNewHighlight(!newHighlight)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer",
                  newHighlight
                    ? "bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/50"
                    : "text-muted-foreground border-border/50 hover:bg-muted/40"
                )}
              >
                <span className="size-2 rounded-full bg-amber-400" />
                <span>{t("highlight")}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Main Routines Matrix (Header + Rows) ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pe-0.5">
        <div className="flex flex-col gap-2 w-full min-w-0">
          {/* ── Week Days Header Row: Full width 7-day grid ── */}
          <div
            className={cn(
              "px-2 sm:px-3 py-1.5 text-xs shrink-0 border-b border-border/40 pb-2",
              isCompact
                ? "flex flex-col gap-1.5"
                : "flex flex-col @[480px]:flex-row @[480px]:items-center @[480px]:gap-3"
            )}
          >
            {/* Start side: Activities label (matching title column width) */}
            <div
              className={cn(
                "text-[11px] font-semibold text-foreground/85 shrink-0",
                isCompact ? "w-full" : "@[480px]:w-36 sm:@[480px]:w-40 md:@[480px]:w-44"
              )}
            >
              {t("activities")}
            </div>

            {/* End side: 7 Days Columns taking ENTIRE available width */}
            <div className="flex-1 grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((d) => (
                <div
                  key={d.isoDateStr}
                  className={cn(
                    "w-full flex flex-col items-center justify-center py-1 rounded-xl transition-colors",
                    d.isToday
                      ? "text-emerald-500 font-bold bg-emerald-500/10 ring-1 ring-emerald-500/30"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="text-xs sm:text-[13px] font-semibold leading-none">
                    {d.name}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium leading-none mt-1">
                    {d.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Routine Cards List ── */}
          <div className="flex flex-col gap-2 pt-1">
            {activeRoutines.map((routine) => {
              const colorKey = (routine.color as RoutineColor) || "purple";
              const colorTheme = COLOR_CONFIG[colorKey] || COLOR_CONFIG.purple;
              const isMainCircleCompleted = isCurrentWeek
                ? Boolean(routine.completedDays?.[todayIsoStr])
                : weekDays.every((d) => Boolean(routine.completedDays?.[d.isoDateStr]));

              return (
                <div
                  key={routine.id}
                  className={cn(
                    "group relative rounded-2xl bg-white/85 dark:bg-card/75 border border-border/60 hover:border-border/90 shadow-2xs transition-colors overflow-hidden",
                    isCompact
                      ? "flex flex-col gap-2 p-2.5"
                      : "flex flex-col @[480px]:flex-row @[480px]:items-center @[480px]:gap-3 p-2.5 sm:px-3 py-2.5"
                  )}
                >
                  {/* Optional Yellow Highlight Strip */}
                  {routine.highlight && (
                    <div className="absolute start-0 top-2 bottom-2 w-1.5 bg-amber-400 rounded-e-full shadow-2xs" />
                  )}

                  {/* Start side: Circle Checkbox + Title (Fixed line-height, no vertical clipping) + Delete */}
                  <div
                    className={cn(
                      "flex items-center gap-2 min-w-0 shrink-0",
                      isCompact
                        ? "justify-between w-full"
                        : "@max-[479px]:justify-between @max-[479px]:w-full @[480px]:w-36 sm:@[480px]:w-40 md:@[480px]:w-44"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 py-0.5">
                      {/* Main Circle Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleRoutineMainCheck(routine)}
                        className={cn(
                          "size-5.5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-2xs",
                          isMainCircleCompleted
                            ? cn(colorTheme.badge, "border-transparent text-white")
                            : "border-border/80 hover:border-primary text-transparent bg-transparent"
                        )}
                        aria-label={`${routine.title} - ${isCurrentWeek ? t("todayProgress") : t("weekProgress")}`}
                      >
                        <Check className="size-3 text-white stroke-[2.5]" />
                      </button>

                      {/* Title: Black, Truncated from Left in Persian, Line-Height Fixed (py-0.5 leading-normal inline-block align-middle) */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            dir={isFa ? "rtl" : "ltr"}
                            className={cn(
                              "font-bold text-xs sm:text-sm truncate inline-block align-middle py-0.5 leading-normal text-start cursor-default select-text",
                              "text-zinc-900 dark:text-zinc-100",
                              "flex-1 min-w-0"
                            )}
                          >
                            {routine.title}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-xs max-w-xs font-medium z-50 text-white bg-neutral-900 dark:bg-neutral-950 border border-white/10"
                        >
                          <p>{routine.title}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Scope Badge (if multi-scope) */}
                      {routine.scope === "year" && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium shrink-0">
                          {t("scopeYear")}
                        </span>
                      )}
                      {routine.scope === "month" && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                          {t("scopeMonth")}
                        </span>
                      )}
                      {routine.scope === "custom" && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium shrink-0">
                          {t("scopeCustom")}
                        </span>
                      )}
                    </div>

                    {/* Delete action on hover */}
                    <button
                      type="button"
                      onClick={(e) => deleteRoutine(routine.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/60 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-opacity cursor-pointer shrink-0"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* End side: 7 Interactive Day Spots Taking ENTIRE Remaining Width */}
                  <div
                    className={cn(
                      "flex-1 grid grid-cols-7 gap-1.5 sm:gap-2",
                      isCompact
                        ? "w-full pt-1.5 border-t border-border/30"
                        : "@max-[479px]:w-full @max-[479px]:pt-1.5 @max-[479px]:border-t @max-[479px]:border-border/30"
                    )}
                  >
                    {weekDays.map((d) => {
                      const isDone = Boolean(
                        routine.completedDays?.[d.isoDateStr]
                      );

                      return (
                        <button
                          key={d.isoDateStr}
                          type="button"
                          onClick={() =>
                            toggleRoutineDay(routine.id, d.isoDateStr)
                          }
                          className={cn(
                            "w-full h-8 sm:h-9 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer",
                            isDone
                              ? cn(colorTheme.bg, colorTheme.text, "font-bold shadow-2xs")
                              : "hover:bg-muted/40 text-muted-foreground/35 hover:text-muted-foreground"
                          )}
                          aria-label={`${routine.title} - ${d.fullName} (${d.dayNumber})`}
                        >
                          {isDone ? (
                            <Check className="size-4 stroke-[2.75]" />
                          ) : (
                            <span className="text-base font-semibold leading-none">
                              ×
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {activeRoutines.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2.5">
                <Sparkles className="size-7 text-muted-foreground/40 mb-1" />
                <p className="text-xs font-medium">{t("emptyWeek")}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAdding(true)}
                    className="h-7 text-xs gap-1 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>{t("addForThisWeek")}</span>
                  </Button>
                  {hasPreviousRoutines && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyFromPreviousWeek}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      <span>{t("copyFromPrevWeek")}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
