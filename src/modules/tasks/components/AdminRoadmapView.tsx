// src/modules/tasks/components/AdminRoadmapView.tsx
"use client";

import React from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { Clock, Users, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewTask } from "../services/new-tasks.service";

interface AdminRoadmapViewProps {
  tasks: NewTask[];
  onSelectTask: (task: NewTask) => void;
}

const COLUMNS = [
  {
    key: "todo" as const,
    labelFa: "برای انجام",
    labelEn: "To Do",
    color: "border-slate-300 bg-slate-50 dark:bg-slate-900/30",
    headerColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  {
    key: "in_progress" as const,
    labelFa: "در حال انجام",
    labelEn: "In Progress",
    color: "border-amber-300 bg-amber-50/50 dark:bg-amber-900/10",
    headerColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  {
    key: "review" as const,
    labelFa: "بازبینی",
    labelEn: "Review",
    color: "border-pink-300 bg-pink-50/50 dark:bg-pink-900/10",
    headerColor: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    dot: "bg-pink-400",
  },
  {
    key: "done" as const,
    labelFa: "انجام‌شده",
    labelEn: "Done",
    color: "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10",
    headerColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
];

export function AdminRoadmapView({ tasks, onSelectTask }: AdminRoadmapViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold">{isRtl ? "نقشه راه تسک‌ها" : "Task Roadmap"}</h2>
        <p className="text-sm text-muted-foreground">
          {isRtl ? "وضعیت همه تسک‌ها به تفکیک مرحله" : "All tasks organized by status"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className={cn("rounded-2xl border-2 overflow-hidden", col.color)}
            >
              {/* Column header */}
              <div className={cn("px-4 py-3 flex items-center justify-between", col.headerColor)}>
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", col.dot)} />
                  <span className="text-sm font-bold">
                    {isRtl ? col.labelFa : col.labelEn}
                  </span>
                </div>
                <span className="text-xs font-bold fa-num">{colTasks.length}</span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 min-h-[200px]">
                {colTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                    {isRtl ? "خالی" : "Empty"}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onSelectTask(task)}
                      className="bg-card rounded-xl border border-border/50 p-3 cursor-pointer hover:shadow-sm transition-all"
                    >
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {task.assignees?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            <span className="line-clamp-1">
                              {task.assignees[0].name}
                              {task.assignees.length > 1 ? ` +${task.assignees.length - 1}` : ""}
                            </span>
                          </span>
                        )}
                      </div>
                      {task.deadline && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{task.deadline}</span>
                        </div>
                      )}
                      {task.is_approved && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="size-3" />
                          <span>{isRtl ? "تایید شده" : "Approved"}</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
