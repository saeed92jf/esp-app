"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Plus,
  Search as SearchIcon,
  Filter,
  Lock,
  MessageSquare,
  Paperclip,
  Calendar,
  User,
  ShieldCheck,
  Mail,
  Trash2,
  Clock,
  Sparkles,
  Flame,
  X,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  DashboardTask,
  DetailedChecklistItem,
  DailyRoutine,
} from "../../services/dashboard.service";
import { TaskDetailModal } from "./task-detail-modal";
import { PeriodicChecklistWidget } from "./periodic-checklist-widget";
import { DailyRoutinesWidget } from "./daily-routines-widget";

interface TasksWorkspaceProps {
  initialTasks?: DashboardTask[];
  initialChecklist?: DetailedChecklistItem[];
  initialRoutines?: DailyRoutine[];
  hideSideWidgets?: boolean;
}

const STORAGE_KEY = "dashboard_user_tasks_workspace_v1";

export function TasksWorkspace({
  initialTasks = [],
  initialChecklist = [],
  initialRoutines = [],
  hideSideWidgets = false,
}: TasksWorkspaceProps) {
  const t = useTranslations("Dashboard.tasks");
  const locale = useLocale();
  const router = useRouter();

  const [tasks, setTasks] = React.useState<DashboardTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialTasks;
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<
    "all" | "manager" | "mine" | "in_progress" | "completed"
  >("all");
  const [selectedTask, setSelectedTask] = React.useState<DashboardTask | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isAddingTask, setIsAddingTask] = React.useState(false);

  // New task form state
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("");
  const [newPriority, setNewPriority] =
    React.useState<DashboardTask["priority"]>("medium");
  const [newDueDate, setNewDueDate] = React.useState("");

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const handleUpdateTask = (updated: DashboardTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  const handleToggleComplete = (task: DashboardTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus =
      task.status === "completed" ? "in_progress" : "completed";
    const updated: DashboardTask = {
      ...task,
      status: nextStatus,
      completedAt:
        nextStatus === "completed"
          ? locale === "fa"
            ? new Intl.DateTimeFormat("fa-IR").format(new Date())
            : new Date().toLocaleDateString()
          : undefined,
    };
    handleUpdateTask(updated);
  };

  const handleDeleteTask = (task: DashboardTask, e: React.MouseEvent) => {
    e.stopPropagation();
    // Prevent deleting manager tasks
    if (task.isManagerDefined) {
      alert(t("cannotDeleteManagerTask"));
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: DashboardTask = {
      id: `task-u-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || t("defaultCategory"),
      status: "pending",
      priority: newPriority,
      createdBy: "user",
      creatorName: "سعید جلیلی",
      assignedToName: "سعید جلیلی",
      dueDate: newDueDate.trim() || undefined,
      isManagerDefined: false,
      comments: [],
      attachments: [],
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewCategory("");
    setNewDueDate("");
    setIsAddingTask(false);
  };

  const filteredTasks = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesQuery =
        !q ||
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        task.category.toLowerCase().includes(q) ||
        task.creatorName.toLowerCase().includes(q);

      let matchesFilter = true;
      if (filterMode === "manager") matchesFilter = task.isManagerDefined;
      if (filterMode === "mine") matchesFilter = !task.isManagerDefined;
      if (filterMode === "in_progress")
        matchesFilter = task.status === "in_progress" || task.status === "pending";
      if (filterMode === "completed") matchesFilter = task.status === "completed";

      return matchesQuery && matchesFilter;
    });
  }, [tasks, searchQuery, filterMode]);

  // Statistics
  const totalTasks = tasks.length;
  const managerTasksCount = tasks.filter((t) => t.isManagerDefined).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = totalTasks - completedCount;

  return (
    <div className="flex flex-col gap-6 w-full pb-10 @container">
      {/* ── Top Metric Cards Bar ── */}
      <div className="grid grid-cols-1 @[360px]:grid-cols-2 @[720px]:grid-cols-4 gap-3 sm:gap-4 fa-num">
        <div className="p-4 rounded-xl border border-border/50 bg-white/70 dark:bg-card/60 backdrop-blur-xs flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">
              {t("stats.total")}
            </span>
            <span className="text-2xl font-bold text-foreground">
              {totalTasks}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <CheckSquare className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-white/70 dark:bg-card/60 backdrop-blur-xs flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-amber-600 dark:text-amber-400 block mb-1 font-medium flex items-center gap-1">
              <Lock className="size-3" />
              {t("stats.manager")}
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {managerTasksCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <ShieldCheck className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-white/70 dark:bg-card/60 backdrop-blur-xs flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-sky-600 dark:text-sky-400 block mb-1 font-medium">
              {t("stats.inProgress")}
            </span>
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {inProgressCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
            <Clock className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-white/70 dark:bg-card/60 backdrop-blur-xs flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-1 font-medium">
              {t("stats.completed")}
            </span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-5" />
          </div>
        </div>
      </div>

      {/* ── Main Task Workspace Grid ── */}
      <div className={cn("items-start", hideSideWidgets ? "w-full flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-12 gap-6")}>
        {/* ── Left / Main: Tasks List & Detail ── */}
        <div className={cn(hideSideWidgets ? "w-full flex flex-col gap-4" : "lg:col-span-8 flex flex-col gap-4")}>
          {/* Controls Bar: Search + Filter Tabs + New Task Button */}
          <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-panel dark:bg-card/40 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="ps-8.5 pe-7 h-9 text-xs bg-white dark:bg-card border-border/50 shadow-xs"
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

              <Button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="h-9 text-xs gap-1.5 px-3.5 font-medium shadow-xs shrink-0"
              >
                {isAddingTask ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                <span>{isAddingTask ? t("cancel") : t("createTask")}</span>
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
              {(
                [
                  { id: "all", label: t("filters.all") },
                  { id: "manager", label: t("filters.manager"), count: managerTasksCount },
                  { id: "mine", label: t("filters.mine") },
                  { id: "in_progress", label: t("filters.inProgress"), count: inProgressCount },
                  { id: "completed", label: t("filters.completed"), count: completedCount },
                ] as Array<{ id: string; label: string; count?: number }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5",
                    filterMode === tab.id
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-white/60 dark:bg-card/60 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-card border border-border/40"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-mono fa-num">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* New Task Inline Form */}
          <AnimatePresence>
            {isAddingTask && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateTask}
                className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t("taskTitlePlaceholder")}
                    className="h-9 text-xs bg-white dark:bg-card border-border/50 flex-1"
                    autoFocus
                  />
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={t("categoryPlaceholder")}
                    className="h-9 text-xs bg-white dark:bg-card border-border/50 w-32"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t("priority")}:
                    </span>
                    {(["low", "medium", "high", "urgent"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={cn(
                          "px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors",
                          newPriority === p
                            ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                            : "bg-white dark:bg-card border-border/50 text-muted-foreground"
                        )}
                      >
                        {t(`priorities.${p}`)}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 text-xs px-4 shadow-xs"
                    disabled={!newTitle.trim()}
                  >
                    {t("saveTask")}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Task Cards Grid */}
          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isManager = task.isManagerDefined;

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      router.push(`/dashboard/tasks/${encodeURIComponent(task.id)}`);
                    }}
                    className={cn(
                      "group/task relative p-4 rounded-xl border transition-colors duration-150 bg-white dark:bg-card/80 hover:border-primary/50 shadow-xs cursor-pointer select-none space-y-3",
                      isCompleted
                        ? "border-border/40 opacity-75 bg-muted/15"
                        : isManager
                        ? "border-amber-500/30 hover:border-amber-500/60"
                        : "border-border/50"
                    )}
                  >
                    {/* Top Row: Creator Badge, Priority, Actions */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isManager ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium flex items-center gap-1">
                            <Lock className="size-3" />
                            <span>{t("managerDefinedBadge")}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/40 font-medium">
                            {t("userCreatedBadge")}
                          </span>
                        )}

                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-medium",
                            task.priority === "urgent" && "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                            task.priority === "high" && "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20",
                            task.priority === "medium" && "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20",
                            task.priority === "low" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {t(`priorities.${task.priority}`)}
                        </span>

                        <span className="text-xs text-muted-foreground/80 font-medium">
                          {task.category}
                        </span>
                      </div>

                      {/* Right: Quick Complete Toggle + Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleToggleComplete(task, e)}
                          title={isCompleted ? t("markInProgress") : t("markCompleted")}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium",
                            isCompleted
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="size-4 text-emerald-500" />
                              <span className="hidden sm:inline">{t("statusCompleted")}</span>
                            </>
                          ) : (
                            <>
                              <Circle className="size-4" />
                              <span className="hidden sm:inline">{t("confirmComplete")}</span>
                            </>
                          )}
                        </button>

                        {/* Delete button: Only enabled for non-manager tasks */}
                        {!isManager ? (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTask(task, e)}
                            title={t("delete")}
                            className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-task:opacity-100"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : (
                          <div
                            title={t("cannotDeleteManagerTask")}
                            className="p-1.5 text-muted-foreground/30 cursor-not-allowed"
                          >
                            <Lock className="size-3.5" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="space-y-1">
                      <h4
                        className={cn(
                          "font-semibold text-sm sm:text-base transition-colors",
                          isCompleted
                            ? "line-through text-muted-foreground"
                            : "text-foreground/90 group-hover/task:text-primary"
                        )}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Completion Explanation Snippet */}
                    {task.completionExplanation && (
                      <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 leading-normal">
                        <strong>{t("completionNote")}:</strong> {task.completionExplanation}
                      </div>
                    )}

                    {/* Bottom Metadata & Counters */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30 text-xs text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="size-3.5 opacity-60" />
                          <span>{task.creatorName}</span>
                        </span>

                        {task.dueDate && (
                          <span className="flex items-center gap-1 fa-num">
                            <Calendar className="size-3.5 opacity-60 text-primary" />
                            <span>{task.dueDate}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {task.comments.length > 0 && (
                          <span className="flex items-center gap-1 text-[11px] fa-num">
                            <MessageSquare className="size-3.5 text-sky-500" />
                            <span>{task.comments.length}</span>
                          </span>
                        )}

                        {task.attachments.length > 0 && (
                          <span className="flex items-center gap-1 text-[11px] fa-num">
                            <Paperclip className="size-3.5 text-amber-500" />
                            <span>{task.attachments.length}</span>
                          </span>
                        )}

                        {isManager && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            {t("emailSentBadge")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 rounded-xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center text-center text-muted-foreground">
                <CheckSquare className="size-10 mb-2 opacity-25" />
                <p className="text-sm font-medium">{t("noTasksFound")}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Periodic Checklist & Daily Routines Sidebars (4 cols) ── */}
        {!hideSideWidgets && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Periodic Checklist */}
            <div className="h-[430px]">
              <PeriodicChecklistWidget initialItems={initialChecklist} />
            </div>

            {/* Daily Routines */}
            <div className="h-[430px]">
              <DailyRoutinesWidget initialRoutines={initialRoutines} />
            </div>
          </div>
        )}
      </div>

      {/* Task Detail & Comments Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}
