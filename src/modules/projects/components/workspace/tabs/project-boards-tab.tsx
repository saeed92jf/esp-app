// src/modules/projects/components/workspace/tabs/project-boards-tab.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ProjectItem,
  ProjectTaskItem,
} from "../../../types/projects.types";
import {
  Kanban,
  ListTodo,
  Plus,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProjectBoardsTabProps {
  project: ProjectItem;
  roleMode?: "admin" | "user";
  currentUserName?: string;
  isManager?: boolean;
  onAddTask?: (task: Omit<ProjectTaskItem, "id">) => Promise<void>;
  onUpdateTaskStatus?: (
    taskId: string,
    status: ProjectTaskItem["status"]
  ) => Promise<void>;
}

export function ProjectBoardsTab({
  project,
  roleMode = "admin",
  currentUserName = "سعید جلیلی",
  isManager = true,
  onAddTask,
  onUpdateTaskStatus,
}: ProjectBoardsTabProps) {
  const t = useTranslations("Projects");
  const [activeView, setActiveView] = useState<"kanban" | "scrum">("kanban");
  const [taskFilter, setTaskFilter] = useState<"all" | "mine">(
    roleMode === "user" ? "mine" : "all"
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState(
    roleMode === "user" ? currentUserName : (project.team?.[0]?.name || currentUserName)
  );
  const [taskPriority, setTaskPriority] = useState<ProjectTaskItem["priority"]>("medium");
  const [taskPoints, setTaskPoints] = useState<number>(3);
  const [taskSprint, setTaskSprint] = useState("Sprint 1");
  const [taskDueDate, setTaskDueDate] = useState("1403/08/20");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns: {
    id: ProjectTaskItem["status"];
    label: string;
    borderClass: string;
    badgeClass: string;
  }[] = [
    {
      id: "backlog",
      label: t("boards.backlog"),
      borderClass: "border-border/60",
      badgeClass: "bg-muted text-muted-foreground",
    },
    {
      id: "todo",
      label: t("boards.todo"),
      borderClass: "border-blue-500/30",
      badgeClass: "bg-blue-500/10 text-blue-500",
    },
    {
      id: "in_progress",
      label: t("boards.inProgress"),
      borderClass: "border-amber-500/30",
      badgeClass: "bg-amber-500/10 text-amber-500",
    },
    {
      id: "review",
      label: t("boards.review"),
      borderClass: "border-purple-500/30",
      badgeClass: "bg-purple-500/10 text-purple-500",
    },
    {
      id: "done",
      label: t("boards.done"),
      borderClass: "border-emerald-500/30",
      badgeClass: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddTask) {
        await onAddTask({
          title: taskTitle.trim(),
          phaseId: project.phases?.[0]?.id || "phase-1",
          sprint: taskSprint,
          storyPoints: Number(taskPoints) || 3,
          status: "todo",
          priority: taskPriority,
          assignedToName: taskAssignee || "کارشناس فنی",
          dueDate: taskDueDate,
          progressPercent: 0,
          commentsCount: 0,
          attachmentsCount: 0,
        });
      }
      setTaskTitle("");
      setIsAddOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: ProjectTaskItem["priority"]) => {
    switch (p) {
      case "urgent":
        return (
          <Badge className="bg-rose-500/15 text-rose-500 border border-rose-500/30 text-[10px] px-1.5 py-0">
            فوری
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-500/15 text-orange-500 border border-orange-500/30 text-[10px] px-1.5 py-0">
            بالا
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-blue-500/15 text-blue-500 border border-blue-500/30 text-[10px] px-1.5 py-0">
            متوسط
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
            عادی
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-white dark:bg-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Kanban className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">
              {t("boards.title")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("boards.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          {/* My Tasks vs All Tasks Filter */}
          <div className="inline-flex rounded-lg border border-border/60 p-0.5 bg-slate-50/80 dark:bg-muted/40">
            <button
              type="button"
              onClick={() => setTaskFilter("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                taskFilter === "all"
                  ? "bg-white dark:bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("boards.filterAllTasks")}
            </button>
            <button
              type="button"
              onClick={() => setTaskFilter("mine")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                taskFilter === "mine"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="size-3" />
              <span>{t("boards.filterMyTasks")}</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-border/60 p-0.5 bg-slate-50/80 dark:bg-muted/40">
            <Button
              size="sm"
              variant={activeView === "kanban" ? "secondary" : "ghost"}
              className="h-7 px-3 text-xs gap-1.5 cursor-pointer"
              onClick={() => setActiveView("kanban")}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>{t("boards.kanbanView")}</span>
            </Button>
            <Button
              size="sm"
              variant={activeView === "scrum" ? "secondary" : "ghost"}
              className="h-7 px-3 text-xs gap-1.5 cursor-pointer"
              onClick={() => setActiveView("scrum")}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>{t("boards.scrumView")}</span>
            </Button>
          </div>

          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs cursor-pointer"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>{t("boards.addTask")}</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {activeView === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const tasksInCol = (project.tasks || []).filter((t) => {
              if (t.status !== col.id) return false;
              if (taskFilter === "mine") {
                return t.assignedToName?.toLowerCase().includes(currentUserName.toLowerCase());
              }
              return true;
            });
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-border/50 bg-slate-50/70 dark:bg-muted/20 p-3 min-w-[260px] h-full"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/40">
                  <span className="font-semibold text-sm text-foreground">
                    {col.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold fa-num ${col.badgeClass}`}
                  >
                    {tasksInCol.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {tasksInCol.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-lg">
                      تسک فعالی وجود ندارد
                    </div>
                  ) : (
                    tasksInCol.map((task) => {
                      const isMyTask = task.assignedToName?.toLowerCase().includes(currentUserName.toLowerCase());
                      return (
                      <div
                        key={task.id}
                        className={`rounded-xl border bg-white dark:bg-card p-3.5 space-y-3 shadow-xs transition-colors ${
                          isMyTask
                            ? "border-primary/40 ring-1 ring-primary/20 hover:border-primary"
                            : "border-border/60 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-xs text-foreground leading-snug">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isMyTask && (
                              <span className="text-[10px] bg-primary/10 text-primary border border-primary/25 rounded-md px-1.5 py-0.2 font-semibold">
                                {t("boards.myTaskBadge")}
                              </span>
                            )}
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-primary" />
                            <span className="truncate max-w-[100px]">
                              {task.assignedToName}
                            </span>
                          </div>
                          {task.storyPoints && (
                            <span className="font-mono text-xs bg-secondary/80 px-1.5 py-0.2 rounded fa-num">
                              {task.storyPoints} SP
                            </span>
                          )}
                        </div>

                        {/* Card Footer: Comments, Attachments & Next Status Action */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-2.5 fa-num">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {task.commentsCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              {task.attachmentsCount || 0}
                            </span>
                          </div>

                          {/* Quick move forward button */}
                          {col.id !== "done" && onUpdateTaskStatus && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 rounded-md hover:bg-primary/10 hover:text-primary"
                              title="انتقال به ستون بعدی"
                              onClick={() => {
                                const nextCol: Record<string, ProjectTaskItem["status"]> = {
                                  backlog: "todo",
                                  todo: "in_progress",
                                  in_progress: "review",
                                  review: "done",
                                };
                                const target = nextCol[col.id];
                                if (target) {
                                  onUpdateTaskStatus(task.id, target);
                                }
                              }}
                            >
                              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scrum Sprint View */}
      {activeView === "scrum" && (
        <div className="rounded-2xl border border-border/60 bg-white dark:bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-semibold text-base text-foreground">
                  اسپرینت فعال (Sprint 1)
                </h3>
                <p className="text-xs text-muted-foreground">
                  بازه اسپرینت: ۱۴ روز کاری • هدف اسپرینت: نهایی‌سازی مدارک پایه و تایید کارفرما
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs fa-num font-mono">
              {(project.tasks || []).reduce((acc, curr) => acc + (curr.storyPoints || 0), 0)} Total Story Points
            </Badge>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-xs text-right">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/60 font-medium">
                <tr>
                  <th className="p-3 text-right">عنوان تسک / فعالیت</th>
                  <th className="p-3 text-right">اسپرینت</th>
                  <th className="p-3 text-center">امتیاز (SP)</th>
                  <th className="p-3 text-center">اولویت</th>
                  <th className="p-3 text-right">مسئول انجام</th>
                  <th className="p-3 text-center">وضعیت</th>
                  <th className="p-3 text-center">تعاملات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {(project.tasks || [])
                  .filter((t) => {
                    if (taskFilter === "mine") {
                      return t.assignedToName?.toLowerCase().includes(currentUserName.toLowerCase());
                    }
                    return true;
                  })
                  .map((task) => (
                  <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium text-foreground">
                      {task.title}
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">
                      {task.sprint || "Sprint 1"}
                    </td>
                    <td className="p-3 text-center font-mono fa-num">
                      <span className="bg-secondary/80 px-2 py-0.5 rounded">
                        {task.storyPoints || 0}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="p-3 text-foreground/90">
                      {task.assignedToName}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-[10px]">
                        {t(`boards.${task.status === "in_progress" ? "inProgress" : task.status}`)}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2 fa-num text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />
                          {task.commentsCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Paperclip className="w-3 h-3" />
                          {task.attachmentsCount}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle>{t("boards.addTask")}</DialogTitle>
            <DialogDescription>
              تعریف تسک جدید در فضای کار اشتراکی پروژه
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="task-title">{t("boards.taskTitle")} *</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="مثلاً: مدلسازی سه‌بعدی نازل‌های بدنه طبق ASME Sec VIII"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-right">
                <Label htmlFor="task-assignee">{t("boards.assignee")}</Label>
                <Input
                  id="task-assignee"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  placeholder="نام مسئول..."
                />
              </div>
              <div className="space-y-1.5 text-right">
                <Label htmlFor="task-points">{t("boards.storyPoints")}</Label>
                <Input
                  id="task-points"
                  type="number"
                  value={taskPoints}
                  onChange={(e) => setTaskPoints(Number(e.target.value))}
                  min={1}
                  max={21}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-right">
                <Label htmlFor="task-priority">{t("boards.priority")}</Label>
                <select
                  id="task-priority"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                >
                  <option value="low">کم / عادی</option>
                  <option value="medium">متوسط</option>
                  <option value="high">بالا</option>
                  <option value="urgent">فوری و بحرانی</option>
                </select>
              </div>
              <div className="space-y-1.5 text-right">
                <Label htmlFor="task-sprint">{t("boards.sprint")}</Label>
                <Input
                  id="task-sprint"
                  value={taskSprint}
                  onChange={(e) => setTaskSprint(e.target.value)}
                  placeholder="Sprint 1"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={isSubmitting || !taskTitle.trim()}>
                {isSubmitting ? "در حال ثبت..." : "افزودن تسک"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
