// src/modules/tasks/components/task-table.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  Eye,
  Trash2,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { TaskItem, TaskStatus, TaskPriority } from "../types/tasks.types";
import { cn } from "@/lib/utils";
import { HighlightMatch, matchesSmartSearch } from "../utils/task-search";

interface TaskTableProps {
  tasks: TaskItem[];
  roleMode?: "admin" | "user";
  searchQuery?: string;
  onSelectTask: (task: TaskItem) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

type SortColumn =
  | "title"
  | "company"
  | "category"
  | "priority"
  | "status"
  | "progress"
  | "dueDate"
  | null;

type SortDirection = "asc" | "desc" | null;

interface ColumnFilters {
  titleText: string;
  companies: string[];
  categories: string[];
  priorities: TaskPriority[];
  statuses: TaskStatus[];
  progressBuckets: string[];
  assignees: string[];
  dueFilter: "all" | "has_date" | "no_date";
}

const INITIAL_FILTERS: ColumnFilters = {
  titleText: "",
  companies: [],
  categories: [],
  priorities: [],
  statuses: [],
  progressBuckets: [],
  assignees: [],
  dueFilter: "all",
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const STATUS_ORDER: Record<TaskStatus, number> = {
  pending: 1,
  in_progress: 2,
  review: 3,
  completed: 4,
};

export function TaskTable({
  tasks,
  roleMode = "admin",
  searchQuery = "",
  onSelectTask,
  onUpdateStatus,
  onDeleteTask,
}: TaskTableProps) {
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Column filter state
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(INITIAL_FILTERS);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Active popover column key
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Internal search filters for popovers with long lists
  const [categorySearch, setCategorySearch] = useState("");

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "low":
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  const getPriorityDotColor = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent": return "bg-rose-500";
      case "high":   return "bg-amber-500";
      case "medium": return "bg-sky-500";
      case "low":
      default:       return "bg-slate-400";
    }
  };

  const getPriorityAbbr = (priority: TaskPriority, rtl: boolean): string => {
    if (rtl) {
      switch (priority) {
        case "urgent": return "فوری";
        case "high":   return "مهم";
        case "medium": return "متوسط";
        case "low":    return "عادی";
      }
    }
    switch (priority) {
      case "urgent": return "Urgent";
      case "high":   return "High";
      case "medium": return "Med";
      case "low":    return "Low";
    }
  };

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "review":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30";
      case "in_progress":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "pending":
      default:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    }
  };

  const getCompanyColor = (company?: string) => {
    if (company?.includes("یورو اسلات") || company?.includes("Euroslot")) {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
    }
    if (company?.includes("نانو پالایش") || company?.includes("Nano")) {
      return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30";
    }
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
  };

  const getCompanyAbbr = (company?: string) => {
    if (company?.includes("یورو اسلات") || company?.includes("Euroslot")) return "ESP";
    if (company?.includes("نانو پالایش") || company?.includes("Nano")) return "NPC";
    return company ?? "-";
  };

  const getStatusDotColor = (status: TaskStatus) => {
    switch (status) {
      case "completed": return "bg-emerald-500";
      case "review":    return "bg-pink-500";
      case "in_progress": return "bg-amber-500";
      case "pending":
      default:          return "bg-indigo-500";
    }
  };

  // Format a dueDate string (ISO or fa-IR formatted) to short Persian form: e.g. "12 آبان"
  const formatShortDate = (dateStr?: string | null): string => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Distinct values for filtering
  const distinctData = useMemo(() => {
    const compMap = new Map<string, number>();
    const catMap = new Map<string, number>();
    const prioMap = new Map<TaskPriority, number>();
    const statusMap = new Map<TaskStatus, number>();
    const assigneeMap = new Map<string, number>();
    const progressCounts = { "100": 0, "50": 0, "1": 0, "0": 0 };

    tasks.forEach((task) => {
      // Company
      if (task.company) {
        compMap.set(task.company, (compMap.get(task.company) || 0) + 1);
      }
      // Category
      if (task.category) {
        catMap.set(task.category, (catMap.get(task.category) || 0) + 1);
      }
      // Priority
      prioMap.set(task.priority, (prioMap.get(task.priority) || 0) + 1);
      // Status
      statusMap.set(task.status, (statusMap.get(task.status) || 0) + 1);
      // Assignees
      const names = new Set<string>();
      if (task.assignedToName) names.add(task.assignedToName);
      (task.assignees || []).forEach((a) => {
        if (a.name) names.add(a.name);
      });
      names.forEach((name) => {
        assigneeMap.set(name, (assigneeMap.get(name) || 0) + 1);
      });
      // Progress
      const p = task.progressPercent || 0;
      if (p === 100) progressCounts["100"]++;
      else if (p >= 50) progressCounts["50"]++;
      else if (p >= 1) progressCounts["1"]++;
      else progressCounts["0"]++;
    });

    return {
      companies: Array.from(compMap.entries()).map(([value, count]) => ({ value, count })),
      categories: Array.from(catMap.entries()).map(([value, count]) => ({ value, count })),
      priorities: (["urgent", "high", "medium", "low"] as TaskPriority[]).map((value) => ({
        value,
        count: prioMap.get(value) || 0,
      })),
      statuses: (["pending", "in_progress", "review", "completed"] as TaskStatus[]).map((value) => ({
        value,
        count: statusMap.get(value) || 0,
      })),
      assignees: Array.from(assigneeMap.entries()).map(([value, count]) => ({ value, count })),
      progressCounts,
    };
  }, [tasks]);

  // Handle Sort Toggle
  const handleSort = (column: SortColumn, direction: SortDirection) => {
    if (sortColumn === column && sortDirection === direction) {
      setSortColumn(null);
      setSortDirection(null);
    } else {
      setSortColumn(column);
      setSortDirection(direction);
    }
  };

  // Toggle multi-select items
  const toggleArrayFilter = <T extends string>(
    key: keyof Pick<
      ColumnFilters,
      "companies" | "categories" | "priorities" | "statuses" | "progressBuckets" | "assignees"
    >,
    value: T
  ) => {
    setColumnFilters((prev) => {
      const current = prev[key] as T[];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  // Select all / deselect all for array filter
  const toggleSelectAll = <T extends string>(
    key: keyof Pick<
      ColumnFilters,
      "companies" | "categories" | "priorities" | "statuses" | "progressBuckets" | "assignees"
    >,
    allValues: T[]
  ) => {
    setColumnFilters((prev) => {
      const current = prev[key] as T[];
      const allSelected = allValues.every((val) => current.includes(val));
      return {
        ...prev,
        [key]: allSelected ? [] : allValues,
      };
    });
  };

  // Reset all filters
  const resetAllFilters = () => {
    setColumnFilters(INITIAL_FILTERS);
    setSortColumn(null);
    setSortDirection(null);
  };

  // Check if any filter is active
  const isAnyFilterActive =
    Boolean(columnFilters.titleText.trim()) ||
    columnFilters.companies.length > 0 ||
    columnFilters.categories.length > 0 ||
    columnFilters.priorities.length > 0 ||
    columnFilters.statuses.length > 0 ||
    columnFilters.progressBuckets.length > 0 ||
    columnFilters.assignees.length > 0 ||
    columnFilters.dueFilter !== "all" ||
    sortColumn !== null;

  // Process tasks with filtering and sorting
  const processedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // 1. Title Filter
        if (columnFilters.titleText.trim()) {
          if (!matchesSmartSearch([task.title, task.titleEn], columnFilters.titleText)) {
            return false;
          }
        }

        // 2. Company Filter
        if (columnFilters.companies.length > 0) {
          if (!task.company || !columnFilters.companies.includes(task.company)) return false;
        }

        // 3. Category Filter
        if (columnFilters.categories.length > 0) {
          if (!task.category || !columnFilters.categories.includes(task.category)) return false;
        }

        // 4. Priority Filter
        if (columnFilters.priorities.length > 0) {
          if (!columnFilters.priorities.includes(task.priority)) return false;
        }

        // 5. Status Filter
        if (columnFilters.statuses.length > 0) {
          if (!columnFilters.statuses.includes(task.status)) return false;
        }

        // 6. Progress Filter
        if (columnFilters.progressBuckets.length > 0) {
          const p = task.progressPercent || 0;
          const match = columnFilters.progressBuckets.some((bucket) => {
            if (bucket === "100") return p === 100;
            if (bucket === "50") return p >= 50 && p < 100;
            if (bucket === "1") return p >= 1 && p < 50;
            if (bucket === "0") return p === 0;
            return false;
          });
          if (!match) return false;
        }

        // 7. Assignee Filter
        if (columnFilters.assignees.length > 0) {
          const names: string[] = [];
          if (task.assignedToName) names.push(task.assignedToName);
          (task.assignees || []).forEach((a) => {
            if (a.name) names.push(a.name);
          });
          const hasMatch = columnFilters.assignees.some((name) => names.includes(name));
          if (!hasMatch) return false;
        }

        // 8. Due Date Filter
        if (columnFilters.dueFilter === "has_date" && !task.dueDate) return false;
        if (columnFilters.dueFilter === "no_date" && task.dueDate) return false;

        return true;
      })
      .sort((a, b) => {
        if (!sortColumn || !sortDirection) return 0;
        const dir = sortDirection === "asc" ? 1 : -1;

        switch (sortColumn) {
          case "title":
            return a.title.localeCompare(b.title, "fa") * dir;
          case "company":
            return (a.company || "").localeCompare(b.company || "", "fa") * dir;
          case "category":
            return (a.category || "").localeCompare(b.category || "", "fa") * dir;
          case "priority":
            return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
          case "status":
            return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * dir;
          case "progress":
            return ((a.progressPercent || 0) - (b.progressPercent || 0)) * dir;
          case "dueDate":
            return (a.dueDate || "").localeCompare(b.dueDate || "") * dir;
          default:
            return 0;
        }
      });
  }, [tasks, columnFilters, sortColumn, sortDirection]);

  // Reusable Excel Header Cell
  const renderHeaderCell = (
    columnKey: SortColumn,
    label: string,
    isFiltered: boolean,
    popoverBody: React.ReactNode,
    className?: string
  ) => {
    const isSorted = sortColumn === columnKey;

    return (
      <th
        className={cn(
          "p-3 text-start select-none group/th transition-colors whitespace-nowrap",
          isFiltered && "bg-primary/5",
          className
        )}
      >
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs text-muted-foreground group-hover/th:text-foreground transition-colors truncate">
              {label}
            </span>
            {isSorted && (
              <span className="text-primary font-bold shrink-0">
                {sortDirection === "asc" ? (
                  <ArrowUp className="size-3 stroke-[2.5]" />
                ) : (
                  <ArrowDown className="size-3 stroke-[2.5]" />
                )}
              </span>
            )}
          </div>

          <Popover
            open={activePopover === columnKey}
            onOpenChange={(open) => setActivePopover(open ? columnKey : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "size-5 rounded-md flex items-center justify-center transition-colors outline-none cursor-pointer shrink-0",
                  isFiltered
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground/40 hover:text-foreground hover:bg-muted"
                )}
                title={isFiltered ? t("table.columnFiltered") : t("table.filterColumn")}
              >
                <Filter className={cn("size-3", isFiltered && "fill-current")} />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align={isRtl ? "start" : "end"}
              sideOffset={4}
              className="w-64 p-3 rounded-2xl bg-card border border-border/70 shadow-xl space-y-3 z-50 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/40 font-semibold text-foreground">
                <span className="flex items-center gap-1.5 text-xs">
                  <SlidersHorizontal className="size-3.5 text-primary" />
                  <span>{label}</span>
                </span>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      if (columnKey === "title") {
                        setColumnFilters((p) => ({ ...p, titleText: "" }));
                      } else if (columnKey === "company") {
                        setColumnFilters((p) => ({ ...p, companies: [] }));
                      } else if (columnKey === "category") {
                        setColumnFilters((p) => ({ ...p, categories: [] }));
                      } else if (columnKey === "priority") {
                        setColumnFilters((p) => ({ ...p, priorities: [] }));
                      } else if (columnKey === "status") {
                        setColumnFilters((p) => ({ ...p, statuses: [] }));
                      } else if (columnKey === "progress") {
                        setColumnFilters((p) => ({ ...p, progressBuckets: [] }));
                      } else if (columnKey === "dueDate") {
                        setColumnFilters((p) => ({ ...p, dueFilter: "all" }));
                      }
                    }}
                    className="text-[11px] text-destructive hover:underline font-medium"
                  >
                    {t("table.clearFilter")}
                  </button>
                )}
              </div>

              {/* Sort Options */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {t("table.sortSection")}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSort(columnKey, "asc")}
                    className={cn(
                      "flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors",
                      isSorted && sortDirection === "asc"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 bg-muted/20 hover:bg-muted text-foreground"
                    )}
                  >
                    <ArrowUp className="size-3" />
                    <span>{t("table.sortAsc")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSort(columnKey, "desc")}
                    className={cn(
                      "flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors",
                      isSorted && sortDirection === "desc"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 bg-muted/20 hover:bg-muted text-foreground"
                    )}
                  >
                    <ArrowDown className="size-3" />
                    <span>{t("table.sortDesc")}</span>
                  </button>
                </div>
              </div>

              {/* Custom Filter Body */}
              {popoverBody}
            </PopoverContent>
          </Popover>
        </div>
      </th>
    );
  };

  return (
    <div className="w-full space-y-3 fa-num">
      {/* ── Active Excel Filter Summary Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-border/60">
            {t("table.showingResults", {
              filtered: processedTasks.length,
              total: tasks.length,
            })}
          </Badge>

          {isAnyFilterActive && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground">{t("table.activeFilters")}</span>

              {columnFilters.titleText && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, titleText: "" }))}
                >
                  <span>{t("table.filterTitle")}: {columnFilters.titleText}</span>
                  <X className="size-3" />
                </Badge>
              )}

              {columnFilters.companies.length > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, companies: [] }))}
                >
                  <span>{t("table.filterCompany")}: {columnFilters.companies.join("، ")}</span>
                  <X className="size-3" />
                </Badge>
              )}

              {columnFilters.categories.length > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, categories: [] }))}
                >
                  <span>{t("table.filterCategory")} ({columnFilters.categories.length})</span>
                  <X className="size-3" />
                </Badge>
              )}

              {columnFilters.priorities.length > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, priorities: [] }))}
                >
                  <span>{t("table.filterPriority")} ({columnFilters.priorities.length})</span>
                  <X className="size-3" />
                </Badge>
              )}

              {columnFilters.statuses.length > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, statuses: [] }))}
                >
                  <span>{t("table.filterStatus")} ({columnFilters.statuses.length})</span>
                  <X className="size-3" />
                </Badge>
              )}

              {columnFilters.progressBuckets.length > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, progressBuckets: [] }))}
                >
                  <span>{t("table.filterProgress")}</span>
                  <X className="size-3" />
                </Badge>
              )}

              {columnFilters.assignees.length > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, assignees: [] }))}
                >
                  <span>{t("table.filterAssignee")} ({columnFilters.assignees.length})</span>
                  <X className="size-3" />
                </Badge>
              )}

              {columnFilters.dueFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer"
                  onClick={() => setColumnFilters((p) => ({ ...p, dueFilter: "all" }))}
                >
                  <span>
                    {columnFilters.dueFilter === "has_date"
                      ? t("table.hasDueDate")
                      : t("table.noDueDate")}
                  </span>
                  <X className="size-3" />
                </Badge>
              )}

              {sortColumn && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10.5px] px-2 py-0 cursor-pointer bg-primary/10 text-primary border-primary/20"
                  onClick={() => {
                    setSortColumn(null);
                    setSortDirection(null);
                  }}
                >
                  <span>{t("table.sortSection")}: {t(`table.filter${sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1)}`)}</span>
                  <X className="size-3" />
                </Badge>
              )}
            </div>
          )}
        </div>

        {isAnyFilterActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>{t("table.clearAllFilters")}</span>
          </Button>
        )}
      </div>

      {/* ── Table Container ── */}
      <div className="w-full overflow-x-auto rounded-2xl border border-border/60 bg-white dark:bg-card shadow-xs custom-scrollbar">
        <table className="w-full min-w-[880px] text-start border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-semibold">
              {/* 1. Title Column */}
              {renderHeaderCell(
                "title",
                t("table.title"),
                Boolean(columnFilters.titleText.trim()),
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    {t("table.textContains")}
                  </span>
                  <div className="relative">
                    <Search className="size-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("table.textPlaceholder")}
                      value={columnFilters.titleText}
                      onChange={(e) =>
                        setColumnFilters((p) => ({ ...p, titleText: e.target.value }))
                      }
                      className="h-8 text-xs ps-8"
                    />
                  </div>
                </div>,
                "min-w-[200px]"
              )}

              {/* 2. Company Column */}
              {renderHeaderCell(
                "company",
                isRtl ? "شرکت" : "Co.",
                columnFilters.companies.length > 0,
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <Checkbox
                        checked={
                          distinctData.companies.length > 0 &&
                          distinctData.companies.every((c) =>
                            columnFilters.companies.includes(c.value)
                          )
                        }
                        onCheckedChange={() =>
                          toggleSelectAll(
                            "companies",
                            distinctData.companies.map((c) => c.value)
                          )
                        }
                      />
                      <span>{t("table.selectAll")}</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    {distinctData.companies.map((comp) => (
                      <label
                        key={comp.value}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/40 cursor-pointer text-xs select-none"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Checkbox
                            checked={columnFilters.companies.includes(comp.value)}
                            onCheckedChange={() => toggleArrayFilter("companies", comp.value)}
                          />
                          <span className="truncate">{comp.value}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 fa-num">
                          {comp.count}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>,
                "w-[75px] min-w-[75px]"
              )}

              {/* 3. Category Column */}
              {renderHeaderCell(
                "category",
                t("table.category"),
                columnFilters.categories.length > 0,
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <Input
                    placeholder={t("table.searchPlaceholder")}
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <div className="flex items-center justify-between pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <Checkbox
                        checked={
                          distinctData.categories.length > 0 &&
                          distinctData.categories.every((c) =>
                            columnFilters.categories.includes(c.value)
                          )
                        }
                        onCheckedChange={() =>
                          toggleSelectAll(
                            "categories",
                            distinctData.categories.map((c) => c.value)
                          )
                        }
                      />
                      <span>{t("table.selectAll")}</span>
                    </label>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {distinctData.categories
                      .filter((c) => c.value.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map((cat) => (
                        <label
                          key={cat.value}
                          className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-muted/40 cursor-pointer text-xs select-none"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Checkbox
                              checked={columnFilters.categories.includes(cat.value)}
                              onCheckedChange={() => toggleArrayFilter("categories", cat.value)}
                            />
                            <span className="truncate">{cat.value}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 fa-num">
                            {cat.count}
                          </Badge>
                        </label>
                      ))}
                  </div>
                </div>,
                "w-[110px] min-w-[110px]"
              )}

              {/* 4. Priority Column */}
              {renderHeaderCell(
                "priority",
                t("table.priority"),
                columnFilters.priorities.length > 0,
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <Checkbox
                        checked={
                          distinctData.priorities.length > 0 &&
                          distinctData.priorities.every((p) =>
                            columnFilters.priorities.includes(p.value)
                          )
                        }
                        onCheckedChange={() =>
                          toggleSelectAll(
                            "priorities",
                            distinctData.priorities.map((p) => p.value)
                          )
                        }
                      />
                      <span>{t("table.selectAll")}</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    {distinctData.priorities.map((prio) => (
                      <label
                        key={prio.value}
                        className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-muted/40 cursor-pointer text-xs select-none"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Checkbox
                            checked={columnFilters.priorities.includes(prio.value)}
                            onCheckedChange={() => toggleArrayFilter("priorities", prio.value)}
                          />
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-semibold border",
                              getPriorityBadgeClass(prio.value)
                            )}
                          >
                            {t(`priority.${prio.value}`)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 fa-num">
                          {prio.count}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>,
                "w-[85px] min-w-[85px]"
              )}

              {/* 5. Status Column */}
              {renderHeaderCell(
                "status",
                t("table.status"),
                columnFilters.statuses.length > 0,
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <Checkbox
                        checked={
                          distinctData.statuses.length > 0 &&
                          distinctData.statuses.every((s) =>
                            columnFilters.statuses.includes(s.value)
                          )
                        }
                        onCheckedChange={() =>
                          toggleSelectAll(
                            "statuses",
                            distinctData.statuses.map((s) => s.value)
                          )
                        }
                      />
                      <span>{t("table.selectAll")}</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    {distinctData.statuses.map((st) => (
                      <label
                        key={st.value}
                        className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-muted/40 cursor-pointer text-xs select-none"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Checkbox
                            checked={columnFilters.statuses.includes(st.value)}
                            onCheckedChange={() => toggleArrayFilter("statuses", st.value)}
                          />
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-semibold border",
                              getStatusBadgeClass(st.value)
                            )}
                          >
                            {t(`stats.${st.value === "in_progress" ? "inProgress" : st.value}`)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 fa-num">
                          {st.count}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>,
                "w-[145px] min-w-[145px]"
              )}

              {/* 6. Progress Column */}
              {renderHeaderCell(
                "progress",
                t("table.progress"),
                columnFilters.progressBuckets.length > 0,
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <Checkbox
                        checked={
                          columnFilters.progressBuckets.length === 4
                        }
                        onCheckedChange={() =>
                          toggleSelectAll("progressBuckets", ["100", "50", "1", "0"])
                        }
                      />
                      <span>{t("table.selectAll")}</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    {[
                      { key: "100", label: t("table.progress100"), count: distinctData.progressCounts["100"] },
                      { key: "50", label: t("table.progress50"), count: distinctData.progressCounts["50"] },
                      { key: "1", label: t("table.progress1"), count: distinctData.progressCounts["1"] },
                      { key: "0", label: t("table.progress0"), count: distinctData.progressCounts["0"] },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-muted/40 cursor-pointer text-xs select-none"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Checkbox
                            checked={columnFilters.progressBuckets.includes(item.key)}
                            onCheckedChange={() => toggleArrayFilter("progressBuckets", item.key)}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 fa-num">
                          {item.count}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>,
                "w-[85px] min-w-[85px]"
              )}

              {/* 7. Due Date Column */}
              {renderHeaderCell(
                "dueDate",
                t("table.dueDate"),
                columnFilters.dueFilter !== "all",
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div className="space-y-1">
                    {[
                      { key: "all", label: t("table.progressAll") },
                      { key: "has_date", label: t("table.hasDueDate") },
                      { key: "no_date", label: t("table.noDueDate") },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40 cursor-pointer text-xs select-none",
                          columnFilters.dueFilter === opt.key && "bg-muted font-semibold"
                        )}
                      >
                        <input
                          type="radio"
                          name="dueFilter"
                          checked={columnFilters.dueFilter === opt.key}
                          onChange={() =>
                            setColumnFilters((p) => ({ ...p, dueFilter: opt.key as any }))
                          }
                          className="size-3.5 text-primary border-border focus:ring-primary"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>,
                "w-[95px] min-w-[95px]"
              )}

              {/* 8. Actions Column (No filter) */}
              <th className="p-3 text-end font-semibold text-xs text-muted-foreground whitespace-nowrap w-[65px] min-w-[65px]">
                {t("table.actions")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {processedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-xs sm:text-sm font-medium">{t("widget.empty")}</p>
                    {isAnyFilterActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetAllFilters}
                        className="rounded-full text-xs h-8"
                      >
                        <RotateCcw className="size-3 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                        <span>{t("table.clearAllFilters")}</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              processedTasks.map((task) => {
                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-muted/20 transition-colors cursor-pointer group"
                  >
                    {/* Title – fills remaining width, always truncates at end */}
                    <td className="p-3 font-medium text-foreground max-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {task.isManagerDefined && (
                          <span
                            className="text-amber-500 shrink-0"
                            title={t("tabs.manager")}
                          >
                            <ShieldAlert className="size-3.5" />
                          </span>
                        )}
                        <span
                          dir="auto"
                          className="truncate group-hover:text-primary transition-colors font-semibold block min-w-0"
                          title={task.title}
                        >
                          <HighlightMatch
                            text={task.title}
                            queries={[searchQuery, columnFilters.titleText]}
                          />
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="p-3 whitespace-nowrap w-[75px] min-w-[75px]">
                      {task.company ? (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit tracking-wide",
                            getCompanyColor(task.company)
                          )}
                        >
                          {getCompanyAbbr(task.company)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3 text-muted-foreground whitespace-nowrap w-[110px] min-w-[110px]">
                      <span className="px-2 py-0.5 rounded-md bg-muted/40 text-[10px] font-bold uppercase border border-border/40">
                        {task.category}
                      </span>
                    </td>

                    {/* Priority – dot + abbreviated label, uniform neutral size */}
                    <td className="p-3 whitespace-nowrap w-[85px] min-w-[85px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-2 rounded-full shrink-0",
                            getPriorityDotColor(task.priority)
                          )}
                        />
                        <span className="text-[11px] font-semibold text-foreground">
                          {getPriorityAbbr(task.priority, isRtl)}
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td
                      className="p-3 whitespace-nowrap w-[145px] min-w-[145px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 rounded-full shrink-0",
                            getStatusDotColor(task.status)
                          )}
                        />
                        <Combobox
                          options={[
                            { value: "pending", label: t("status.pending") },
                            { value: "in_progress", label: t("status.in_progress") },
                            { value: "review", label: t("status.review") },
                            { value: "completed", label: t("status.completed") },
                          ]}
                          value={task.status}
                          onChange={(val) => onUpdateStatus(task.id, val as TaskStatus)}
                          className="h-7 text-[11px] rounded-lg px-2 border font-medium w-[110px] bg-muted/40 text-foreground border-border/50"
                        />
                      </div>
                    </td>

                    {/* Progress – number above bar, narrower column */}
                    <td className="p-3 whitespace-nowrap w-[85px] min-w-[85px]">
                      <div className="flex flex-col gap-0.5 w-[64px]">
                        <span className="text-[10px] text-muted-foreground font-semibold text-end">
                          {task.progressPercent || 0}%
                        </span>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              task.status === "completed"
                                ? "bg-emerald-500"
                                : task.status === "review"
                                ? "bg-pink-500"
                                : "bg-primary"
                            )}
                            style={{ width: `${task.progressPercent || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td
                      className="p-3 whitespace-nowrap text-muted-foreground text-xs w-[95px] min-w-[95px]"
                      title={formatFullDate(task.dueDate)}
                    >
                      <span className="cursor-default">
                        {task.dueDate ? formatShortDate(task.dueDate) : "-"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="p-3 text-end whitespace-nowrap w-[65px] min-w-[65px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onSelectTask(task)}
                          className="rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title={t("drawer.details")}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={roleMode !== "admin" && task.isManagerDefined}
                          onClick={() => {
                            if (confirm(t("drawer.deleteConfirm"))) {
                              onDeleteTask(task.id);
                            }
                          }}
                          className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30"
                          title={
                            roleMode !== "admin" && task.isManagerDefined
                              ? "تنها مدیر سیستم امکان حذف تسک‌های سازمانی را دارد"
                              : t("drawer.deleteTask")
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
