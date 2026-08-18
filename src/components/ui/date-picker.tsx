// src/components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { Check, CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format } from "date-fns-jalali";
import { toPersianDigits } from "@/utils/textDirection";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";

const JALALI_MONTHS_FA = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const JALALI_MONTHS_EN = ["Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar", "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand"];

const GREGORIAN_MONTHS_FA = ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"];
const GREGORIAN_MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const JALALI_WEEK_DAYS_FA = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const JALALI_WEEK_DAYS_EN = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"];

const GREGORIAN_WEEK_DAYS_FA = ["ی", "د", "س", "چ", "پ", "ج", "ش"];
const GREGORIAN_WEEK_DAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Extract Jalali year, month (1..12), day (1..31) accurately from any Date
export function getJalaliDate(date: Date): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  let year = 1400, month = 1, day = 1;
  for (const part of parts) {
    if (part.type === "year") year = parseInt(part.value, 10);
    if (part.type === "month") month = parseInt(part.value, 10);
    if (part.type === "day") day = parseInt(part.value, 10);
  }
  return { year, month, day };
}

// Convert Jalali date (year, month: 1..12, day: 1..31) to a JavaScript Date object (UTC normalized)
export function jalaliToGregorianDate(jy: number, jm: number, jd: number): Date {
  let guess = new Date(Date.UTC(jy + 621, 2, 21, 12, 0, 0));

  function jalaliDayOfYear(m: number, d: number) {
    let days = 0;
    for (let i = 1; i < m; i++) {
      days += (i <= 6 ? 31 : 30);
    }
    return days + d;
  }

  const targetDay = jalaliDayOfYear(jm, jd);
  const guessParts = getJalaliDate(guess);
  const guessDay = jalaliDayOfYear(guessParts.month, guessParts.day);
  const diffDays = targetDay - guessDay + (jy - guessParts.year) * 365;

  guess = new Date(guess.getTime() + diffDays * 86400000);

  for (let offset = -3; offset <= 3; offset++) {
    const testDate = new Date(guess.getTime() + offset * 86400000);
    const testJ = getJalaliDate(testDate);
    if (testJ.year === jy && testJ.month === jm && testJ.day === jd) {
      return new Date(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate(), 12, 0, 0);
    }
  }
  return new Date(guess.getUTCFullYear(), guess.getUTCMonth(), guess.getUTCDate(), 12, 0, 0);
}

// Exact days in month for Jalali (matching time.ir & official Iranian calendar)
export function getJalaliDaysInMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Month 12 (Esfand) leap year check:
  const day30 = jalaliToGregorianDate(jy, 12, 30);
  const j = getJalaliDate(day30);
  return (j.year === jy && j.month === 12 && j.day === 30) ? 30 : 29;
}

// Exact days in month for Gregorian
export function getGregorianDaysInMonth(gy: number, gm: number): number {
  return new Date(gy, gm, 0).getDate();
}

function isSameDay(d1?: Date, d2?: Date): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isToday(d?: Date): boolean {
  if (!d) return false;
  return isSameDay(d, new Date());
}

// ─── CalendarContent ─────────────────────────────────────────────────────────
// Shared calendar body — used in both popover and inline modes.

interface CalendarContentProps {
  selectedDate?: Date;
  viewDate: Date;
  setViewDate: (d: Date) => void;
  isJalali: boolean;
  handleCalendarSwitch: (val: boolean) => void;
  handleSelect: (d?: Date) => void;
  startYear?: number;
  endYear?: number;
  getEventColors?: (date: Date) => string[];
}

function CalendarContent({
  selectedDate,
  viewDate,
  setViewDate,
  isJalali,
  handleCalendarSwitch,
  handleSelect,
  startYear,
  endYear,
  getEventColors,
}: CalendarContentProps) {
  const locale = useLocale();
    const t = useTranslations("Common.datePicker");
  const isFa = locale === "fa";
  const displayNum = React.useCallback((n: number | string) => isFa ? toPersianDigits(n.toString()) : n.toString(), [isFa]);

  const jalaliView = React.useMemo(() => getJalaliDate(viewDate), [viewDate]);
  const currentYear = isJalali ? jalaliView.year : viewDate.getFullYear();
  const currentMonth = isJalali ? jalaliView.month - 1 : viewDate.getMonth(); // 0 to 11

  const months = isJalali 
    ? (isFa ? JALALI_MONTHS_FA : JALALI_MONTHS_EN) 
    : (isFa ? GREGORIAN_MONTHS_FA : GREGORIAN_MONTHS_EN);

  const weekDays = isJalali 
    ? (isFa ? JALALI_WEEK_DAYS_FA : JALALI_WEEK_DAYS_EN) 
    : (isFa ? GREGORIAN_WEEK_DAYS_FA : GREGORIAN_WEEK_DAYS_EN);

  const calculatedStartYear = startYear ?? (isJalali ? 1350 : currentYear - 70);
  const calculatedEndYear = endYear ?? (isJalali ? 1500 : currentYear + 30);

  const years = React.useMemo(() => {
    return Array.from(
      { length: Math.max(1, calculatedEndYear - calculatedStartYear + 1) },
      (_, i) => calculatedStartYear + i
    );
  }, [calculatedStartYear, calculatedEndYear]);

  // Calendar cells generation for Jalali / Gregorian
  const gridCells = React.useMemo(() => {
    if (isJalali) {
      const jy = jalaliView.year;
      const jm = jalaliView.month; // 1 to 12
      const firstDayDate = jalaliToGregorianDate(jy, jm, 1);
      const daysInCurrentMonth = getJalaliDaysInMonth(jy, jm);

      // Saturday is column 0 in Persian calendar week (JS getDay(): 0=Sun, 6=Sat)
      const startDayOfWeek = (firstDayDate.getDay() + 1) % 7;

      const prevJm = jm === 1 ? 12 : jm - 1;
      const prevJy = jm === 1 ? jy - 1 : jy;
      const daysInPrevMonth = getJalaliDaysInMonth(prevJy, prevJm);

      const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

      // Leading days from previous month
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const d = jalaliToGregorianDate(prevJy, prevJm, dayNum);
        cells.push({ day: dayNum, isCurrentMonth: false, date: d });
      }

      // Current month days
      for (let i = 1; i <= daysInCurrentMonth; i++) {
        const d = jalaliToGregorianDate(jy, jm, i);
        cells.push({ day: i, isCurrentMonth: true, date: d });
      }

      // Trailing days from next month
      const remaining = (7 - (cells.length % 7)) % 7;
      const nextJm = jm === 12 ? 1 : jm + 1;
      const nextJy = jm === 12 ? jy + 1 : jy;
      for (let i = 1; i <= remaining; i++) {
        const d = jalaliToGregorianDate(nextJy, nextJm, i);
        cells.push({ day: i, isCurrentMonth: false, date: d });
      }

      return cells;
    } else {
      const gy = viewDate.getFullYear();
      const gm = viewDate.getMonth(); // 0 to 11
      const firstDayDate = new Date(gy, gm, 1);
      const daysInCurrentMonth = getGregorianDaysInMonth(gy, gm + 1);
      const startDayOfWeek = firstDayDate.getDay(); // 0 = Sunday

      const prevGm = gm === 0 ? 11 : gm - 1;
      const prevGy = gm === 0 ? gy - 1 : gy;
      const daysInPrevMonth = getGregorianDaysInMonth(prevGy, prevGm + 1);

      const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

      // Leading days from previous month
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const d = new Date(prevGy, prevGm, dayNum, 12, 0, 0);
        cells.push({ day: dayNum, isCurrentMonth: false, date: d });
      }

      // Current month days
      for (let i = 1; i <= daysInCurrentMonth; i++) {
        const d = new Date(gy, gm, i, 12, 0, 0);
        cells.push({ day: i, isCurrentMonth: true, date: d });
      }

      // Trailing days from next month
      const remaining = (7 - (cells.length % 7)) % 7;
      const nextGm = gm === 11 ? 0 : gm + 1;
      const nextGy = gm === 11 ? gy + 1 : gy;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(nextGy, nextGm, i, 12, 0, 0);
        cells.push({ day: i, isCurrentMonth: false, date: d });
      }

      return cells;
    }
  }, [viewDate, isJalali, jalaliView]);

  const handleMonthChange = (monthIndexStr: string) => {
    const monthIndex = parseInt(monthIndexStr, 10);
    if (isNaN(monthIndex)) return;

    if (isJalali) {
      const newMonth = monthIndex + 1;
      const maxDays = getJalaliDaysInMonth(jalaliView.year, newMonth);
      const newDay = Math.min(jalaliView.day, maxDays);
      setViewDate(jalaliToGregorianDate(jalaliView.year, newMonth, newDay));
    } else {
      const gy = viewDate.getFullYear();
      const maxDays = getGregorianDaysInMonth(gy, monthIndex + 1);
      const newDay = Math.min(viewDate.getDate(), maxDays);
      setViewDate(new Date(gy, monthIndex, newDay, 12, 0, 0));
    }
  };

  const handleYearChange = (yearStr: string) => {
    const newYear = parseInt(yearStr, 10);
    if (isNaN(newYear)) return;

    if (isJalali) {
      const maxDays = getJalaliDaysInMonth(newYear, jalaliView.month);
      const newDay = Math.min(jalaliView.day, maxDays);
      setViewDate(jalaliToGregorianDate(newYear, jalaliView.month, newDay));
    } else {
      const gm = viewDate.getMonth();
      const maxDays = getGregorianDaysInMonth(newYear, gm + 1);
      const newDay = Math.min(viewDate.getDate(), maxDays);
      setViewDate(new Date(newYear, gm, newDay, 12, 0, 0));
    }
  };

  const handlePrevMonth = () => {
    if (isJalali) {
      const prevM = jalaliView.month === 1 ? 12 : jalaliView.month - 1;
      const prevY = jalaliView.month === 1 ? jalaliView.year - 1 : jalaliView.year;
      const maxDays = getJalaliDaysInMonth(prevY, prevM);
      const newDay = Math.min(jalaliView.day, maxDays);
      setViewDate(jalaliToGregorianDate(prevY, prevM, newDay));
    } else {
      const gy = viewDate.getFullYear();
      const gm = viewDate.getMonth();
      const prevM = gm === 0 ? 11 : gm - 1;
      const prevY = gm === 0 ? gy - 1 : gy;
      const maxDays = getGregorianDaysInMonth(prevY, prevM + 1);
      const newDay = Math.min(viewDate.getDate(), maxDays);
      setViewDate(new Date(prevY, prevM, newDay, 12, 0, 0));
    }
  };

  const handleNextMonth = () => {
    if (isJalali) {
      const nextM = jalaliView.month === 12 ? 1 : jalaliView.month + 1;
      const nextY = jalaliView.month === 12 ? jalaliView.year + 1 : jalaliView.year;
      const maxDays = getJalaliDaysInMonth(nextY, nextM);
      const newDay = Math.min(jalaliView.day, maxDays);
      setViewDate(jalaliToGregorianDate(nextY, nextM, newDay));
    } else {
      const gy = viewDate.getFullYear();
      const gm = viewDate.getMonth();
      const nextM = gm === 11 ? 0 : gm + 1;
      const nextY = gm === 11 ? gy + 1 : gy;
      const maxDays = getGregorianDaysInMonth(nextY, nextM + 1);
      const newDay = Math.min(viewDate.getDate(), maxDays);
      setViewDate(new Date(nextY, nextM, newDay, 12, 0, 0));
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setViewDate(today);
    handleSelect(today);
  };

  const isEn = !isFa;
  const [isHovered, setIsHovered] = React.useState(false);
  const textNormal = isJalali ? (isEn ? "Jalali" : "جلالی") : (isEn ? "Gregorian" : "میلادی");
  const textHover = isJalali ? (isEn ? "Switch to Gregorian" : "تبدیل به میلادی") : (isEn ? "Switch to Jalali" : "تبدیل به جلالی");

  return (
    <div className={cn(isFa ? "fa-num" : "en-num")}>
      <style>{`
        .calendar-day-btn {
          transition: background-color 2200ms cubic-bezier(0.1, 0.85, 0.2, 1) 120ms,
                      color 2200ms cubic-bezier(0.1, 0.85, 0.2, 1) 120ms,
                      box-shadow 2200ms cubic-bezier(0.1, 0.85, 0.2, 1) 120ms,
                      border-color 2200ms cubic-bezier(0.1, 0.85, 0.2, 1) 120ms,
                      transform 200ms ease;
        }
        .calendar-day-btn:hover {
          transition: none !important;
          transform: scale(1.12) !important;
          z-index: 20;
        }
        .calendar-week-day {
          transition: background-color 1800ms cubic-bezier(0.1, 0.85, 0.2, 1) 100ms,
                      color 1800ms cubic-bezier(0.1, 0.85, 0.2, 1) 100ms;
        }
        .calendar-week-day:hover {
          transition: none !important;
          transform: scale(1.06);
        }
      `}</style>

      {/* Switch header between Jalali & Gregorian */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/30">
        <button
          type="button"
          className="relative h-8 px-4 overflow-hidden rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-muted/50 text-xs font-semibold text-foreground transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => handleCalendarSwitch(!isJalali)}
          aria-label="Toggle Calendar Type"
        >
          <div className="relative flex items-center justify-center">
            {/* Invisible placeholder ensures button width doesn't jitter */}
            <div className="invisible whitespace-nowrap">
              {textHover}
            </div>
            
            {/* Animated Texts */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={false}
                animate={{ y: isHovered ? -24 : 0, opacity: isHovered ? 0 : 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute whitespace-nowrap"
              >
                {textNormal}
              </motion.span>
              
              <motion.span
                initial={false}
                animate={{ y: isHovered ? 0 : 24, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute whitespace-nowrap text-primary"
              >
                {textHover}
              </motion.span>
            </div>
          </div>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleGoToToday}
          className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors rounded-md font-medium"
        >
          {t("today")}
        </Button>
      </div>

      {/* Month & Year Selects + Nav Buttons */}
      <div className="flex items-center justify-between gap-1.5 mb-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handlePrevMonth}
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors rounded-md"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4.5 rtl:rotate-180" />
        </Button>

        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <div className="flex-1 min-w-[100px]">
            <Combobox
              value={currentMonth.toString()}
              onChange={(val) => { if (val) handleMonthChange(val); }}
              options={months.map((m, i) => ({ value: i.toString(), label: m }))}
              showSearch={false}
              placeholder={t("selectMonth")}
              className="h-8 text-xs md:text-sm bg-background/50 border border-border/40 hover:border-primary/40 rounded-lg px-2"
            />
          </div>

          <div className="w-[90px]">
            <Combobox
              value={currentYear.toString()}
              onChange={(val) => { if (val) handleYearChange(val); }}
              options={years.map(y => ({ value: y.toString(), label: displayNum(y) }))}
              showSearch={true}
              placeholder={t("selectYear")}
              searchPlaceholder={t("search")}
              emptyText={t("notFound")}
              className="h-8 text-xs md:text-sm bg-background/50 border border-border/40 hover:border-primary/40 rounded-lg px-2"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleNextMonth}
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors rounded-md"
          aria-label="Next month"
        >
          <ChevronRight className="size-4.5 rtl:rotate-180" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDays.map((wd, i) => (
          <div
            key={wd}
            className={cn(
              "calendar-week-day text-xs font-medium text-muted-foreground/80 py-1 rounded-md select-none cursor-default",
              "hover:bg-primary/10 hover:text-primary hover:font-bold transition-all duration-300",
              isJalali && i === 6 && "text-rose-500/80 font-semibold hover:text-rose-500 hover:bg-rose-500/10",
              !isJalali && (i === 0 || i === 6) && "text-rose-500/80 font-semibold hover:text-rose-500 hover:bg-rose-500/10"
            )}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {gridCells.map((cell, idx) => {
          const isSelected = isSameDay(cell.date, selectedDate);
          const isCurrentDay = isToday(cell.date);
          const eventColors = getEventColors ? getEventColors(cell.date) : [];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(cell.date)}
              className={cn(
                "calendar-day-btn relative aspect-square w-full max-w-[36px] mx-auto flex items-center justify-center rounded-lg text-xs select-none font-normal cursor-pointer active:scale-95",
                !cell.isCurrentMonth && "text-muted-foreground/30 hover:bg-muted/50 hover:text-muted-foreground/60",
                cell.isCurrentMonth && !isSelected && !isCurrentDay && "text-foreground hover:bg-primary/10 hover:text-primary hover:font-bold hover:shadow-sm",
                isCurrentDay && !isSelected && "border border-primary/40 text-primary font-bold hover:bg-primary/10 hover:shadow-sm",
                isSelected && "!transition-none bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              {displayNum(cell.day)}
              {eventColors.length > 0 && (
                <div className="absolute bottom-0.5 flex gap-0.5 justify-center w-full">
                  {eventColors.map((color, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "w-1 h-1 rounded-full",
                        isSelected ? "bg-primary-foreground" : color
                      )} 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DatePickerProps ──────────────────────────────────────────────────────────

export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  isJalali?: boolean;
  onCalendarTypeChange?: (isJalali: boolean) => void;
  className?: string;
  /** Applied only to the popover trigger button (not the calendar content) */
  triggerClassName?: string;
  disabled?: boolean;
  startYear?: number;
  endYear?: number;
  size?: "xs" | "sm" | "default" | "lg";
  getEventColors?: (date: Date) => string[];
  /**
   * "popover" (default) — renders a trigger button that opens a popover with the calendar.
   * "inline" — renders the calendar directly on the page without any trigger/popover.
   */
  mode?: "popover" | "inline";
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

export function DatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  isJalali: controlledIsJalali,
  onCalendarTypeChange,
  className,
  triggerClassName,
  disabled = false,
  startYear,
  endYear,
  size = "default",
  getEventColors,
  mode = "popover",
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);
  const [viewDate, setViewDate] = React.useState<Date>(value || new Date());
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalIsJalali, setInternalIsJalali] = React.useState<boolean>(
    controlledIsJalali !== undefined ? controlledIsJalali : true
  );

  React.useEffect(() => {
    if (controlledIsJalali !== undefined) {
      setInternalIsJalali(controlledIsJalali);
    }
  }, [controlledIsJalali]);

  const prevValueTimestampRef = React.useRef<number | undefined>(value ? value.getTime() : undefined);

  React.useEffect(() => {
    const currentTimestamp = value ? value.getTime() : undefined;
    if (currentTimestamp !== prevValueTimestampRef.current) {
      prevValueTimestampRef.current = currentTimestamp;
      setInternalDate(value);
      if (value) {
        setViewDate(value);
      }
    }
  }, [value]);

  const isJalali =
    controlledIsJalali !== undefined ? controlledIsJalali : internalIsJalali;

  const handleCalendarSwitch = (checked: boolean) => {
    setInternalIsJalali(checked);
    onCalendarTypeChange?.(checked);
  };

  const selectedDate = value !== undefined ? value : internalDate;

  const handleSelect = (selected?: Date) => {
    setInternalDate(selected);
    onChange?.(selected);
    if (selected) {
      setViewDate(selected);
    }
    if (mode === "popover") {
      setIsOpen(false);
    }
  };

  const locale = useLocale();
  const isFa = locale === "fa";
  const displayNum = React.useCallback((n: number | string) => isFa ? toPersianDigits(n.toString()) : n.toString(), [isFa]);

  const formatted = React.useMemo(() => {
    if (!selectedDate) return "";
    if (isJalali) {
      const j = getJalaliDate(selectedDate);
      return displayNum(
        `${j.year}/${String(j.month).padStart(2, "0")}/${String(j.day).padStart(2, "0")}`
      );
    } else {
      const gy = selectedDate.getFullYear();
      const gm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const gd = String(selectedDate.getDate()).padStart(2, "0");
      return displayNum(`${gy}-${gm}-${gd}`);
    }
  }, [selectedDate, isJalali, displayNum]);

  const sizeClasses = {
    xs: "h-6 text-xs px-2",
    sm: "h-7 text-xs px-2.5",
    default: "h-8 text-sm px-2.5",
    lg: "h-10 text-sm px-3",
  };

  const calendarContent = (
    <CalendarContent
      selectedDate={selectedDate}
      viewDate={viewDate}
      setViewDate={setViewDate}
      isJalali={isJalali}
      handleCalendarSwitch={handleCalendarSwitch}
      handleSelect={handleSelect}
      startYear={startYear}
      endYear={endYear}
      getEventColors={getEventColors}
    />
  );

  // ── Inline mode ──
  if (mode === "inline") {
    return (
      <div className={cn("w-full", className)}>
        {calendarContent}
      </div>
    );
  }

  // ── Popover mode (default) ──
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 text-start font-medium border border-border/50 bg-card/40 backdrop-blur-md text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-card/80 shadow-sm rounded-xl select-none group",
            sizeClasses[size],
            !selectedDate && "text-muted-foreground",
            triggerClassName
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 opacity-70 group-hover:text-primary transition-colors" />
          <span className="truncate">
            {selectedDate ? formatted : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[315px] p-4 shadow-2xl rounded-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-xl border border-border/50 z-50",
          className
        )}
        align="start"
      >
        {calendarContent}
      </PopoverContent>
    </Popover>
  );
}
