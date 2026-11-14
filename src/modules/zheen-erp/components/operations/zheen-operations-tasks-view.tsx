"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useZheenStore } from "../../store/zheen-store";
import { TaskCategory, TaskPriority } from "../../types/zheen-types";

export function ZheenOperationsTasksView() {
  const { tasks, toggleTaskStatus, verifyTask, addTask, employees, currentUser } = useZheenStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDesc, setTaskDesc] = useState<string>("");
  const [taskCat, setTaskCat] = useState<TaskCategory>("Opening");
  const [taskAssignedId, setTaskAssignedId] = useState<string>(employees[0]?.id || "");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("High");
  const [taskDueTime, setTaskDueTime] = useState<string>("08:00");

  const categories = [
    { id: "all", label: "همه چک‌لیست‌ها" },
    { id: "Opening", label: "چک‌لیست افتتاحیه" },
    { id: "Closing", label: "چک‌لیست اختتامیه" },
    { id: "DailyCleaning", label: "نظافت روزانه" },
    { id: "WeeklyCleaning", label: "نظافت هفتگی" },
    { id: "Barista", label: "روتین باریستا" },
    { id: "Kitchen", label: "وظایف بیکری و قنادی" },
  ];

  const filteredTasks = tasks.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory
  );

  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      toast.error("عنوان تسک الزامی است.");
      return;
    }

    const assignedEmp = employees.find((e) => e.id === taskAssignedId);

    addTask({
      title: taskTitle,
      description: taskDesc,
      category: taskCat,
      categoryTitleFa:
        taskCat === "Opening"
          ? "چک‌لیست افتتاحیه"
          : taskCat === "Closing"
          ? "چک‌لیست اختتامیه"
          : "عملیات کافه",
      assignedEmployeeId: taskAssignedId,
      assignedEmployeeName: assignedEmp?.fullName || "پرسنل شیفت",
      dueDate: new Date().toLocaleDateString("fa-IR"),
      dueTime: taskDueTime,
      frequency: "Daily",
      priority: taskPriority,
      status: "Pending",
      managerVerified: false,
    });

    setShowAddTaskModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CheckSquare className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                چک‌لیست‌ها و تسک‌های عملیاتی کافه ژین
              </h3>
              <p className="text-xs text-muted-foreground">
                کنترل فرآیندهای بازگشایی و تحویل شیفت، نظافت ماشین اسپرسو، پایش دما و تایید رسمی توسط سرپرست
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="default"
            onClick={() => setShowAddTaskModal(true)}
            className="h-9 px-3 rounded-md text-xs font-bold gap-1.5 bg-primary text-primary-foreground cursor-pointer shadow-2xs"
          >
            <Plus className="size-4" />
            تعریف تسک / چک‌لیست جدید
          </Button>
        </div>

        {/* Category Filter Pills - Strict low curve rounded-md */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-border/50 mt-3 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "h-8 px-3 rounded-md text-xs font-semibold shrink-0 transition-all border cursor-pointer select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isDone = task.status === "Completed";
          const isUrgent = task.priority === "Urgent";
          const isVerified = task.managerVerified;

          return (
            <Card
              key={task.id}
              className={cn(
                "rounded-lg border p-3.5 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                isDone ? "bg-muted/15 border-border/50" : "bg-card border-border/70"
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Interactive Checkbox Button */}
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  className={cn(
                    "size-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer",
                    isDone
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-border/80 bg-background hover:border-primary"
                  )}
                >
                  {isDone && <Check className="size-4 stroke-[3]" />}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5
                      className={cn(
                        "font-bold text-xs",
                        isDone ? "line-through text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {task.title}
                    </h5>
                    <Badge variant="outline" className="text-[10px] rounded-md py-0 text-muted-foreground">
                      {task.categoryTitleFa}
                    </Badge>
                    {isUrgent && (
                      <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] rounded-md py-0">
                        فوری و حیاتی
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      مسئول: {task.assignedEmployeeName}
                    </span>
                    <span className="flex items-center gap-1 fa-num">
                      <Clock className="size-3" />
                      ساعت اقدام: {task.dueTime}
                    </span>
                    {task.completedAt && (
                      <span className="text-emerald-600 font-bold fa-num">
                        انجام شده در {task.completedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Manager Verification Action - Strict low curve rounded-md */}
              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                {isVerified ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span>تایید شده توسط {task.managerName || "مدیر شیفت"}</span>
                  </div>
                ) : isDone ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => verifyTask(task.id, currentUser.name)}
                    className="h-8 rounded-md text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    تایید و امضای مدیر
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-[10px] rounded-md py-1 text-muted-foreground">
                    در انتظار اقدام پرسنل
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL: Add New Task */}
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              تعریف تسک / آیتم جدید در چک‌لیست
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">عنوان تسک:</label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="مثال: شستشوی فیلتر پمپ آب و یخ‌ساز"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">دسته‌بندی چک‌لیست:</label>
              <select
                value={taskCat}
                onChange={(e) => setTaskCat(e.target.value as TaskCategory)}
                className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
              >
                <option value="Opening">چک‌لیست افتتاحیه</option>
                <option value="Closing">چک‌لیست اختتامیه</option>
                <option value="DailyCleaning">نظافت روزانه</option>
                <option value="WeeklyCleaning">نظافت هفتگی</option>
                <option value="Barista">روتین باریستا</option>
                <option value="Kitchen">بیکری و قنادی</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">مسئول انجام:</label>
                <select
                  value={taskAssignedId}
                  onChange={(e) => setTaskAssignedId(e.target.value)}
                  className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">اولویت اقدام:</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  <option value="Urgent">فوری و حیاتی</option>
                  <option value="High">بالا</option>
                  <option value="Medium">متوسط</option>
                  <option value="Low">عادی</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">زمان سررسید (ساعت):</label>
              <Input
                value={taskDueTime}
                onChange={(e) => setTaskDueTime(e.target.value)}
                placeholder="08:00"
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">دستورالعمل و توضیحات اجرایی:</label>
              <Input
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="توضیحات تکمیلی برای پرسنل..."
                className="h-8 rounded-md text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTaskModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveTask}
              className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              ثبت در چک‌لیست
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
