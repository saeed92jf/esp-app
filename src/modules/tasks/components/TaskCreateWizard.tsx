// src/modules/tasks/components/TaskCreateWizard.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Check,
  Loader2,
  ClipboardList,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { newTasksService, NewTask, NewTaskCreate, NewTaskSubtask } from "../services/new-tasks.service";
import { toast } from "sonner";
import type { User } from "@/types/auth";

interface TaskCreateWizardProps {
  currentUser: User;
  onTaskCreated: (task: NewTask) => void;
  onCancel: () => void;
}

type Priority = "low" | "medium" | "high" | "critical";

interface WizardState {
  // Step 1
  title: string;
  description: string;
  subtasks: { title: string }[];
  hasAttachments: boolean;
  // Step 2
  assignees: { userId: string; name: string; email: string; role?: string }[];
  // Step 3
  deadline: string;
  priority: Priority;
  company: string;
  tags: string[];
}

const PRIORITY_OPTIONS: { value: Priority; labelFa: string; labelEn: string; color: string }[] = [
  { value: "low", labelFa: "عادی", labelEn: "Low", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
  { value: "medium", labelFa: "متوسط", labelEn: "Medium", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  { value: "high", labelFa: "مهم", labelEn: "High", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
  { value: "critical", labelFa: "فوری", labelEn: "Critical", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
];

const COMPANIES = ["یورو اسلات پارس", "نانو پالایش سرام"];

export function TaskCreateWizard({ currentUser, onTaskCreated, onCancel }: TaskCreateWizardProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, setState] = useState<WizardState>({
    title: "",
    description: "",
    subtasks: [],
    hasAttachments: false,
    assignees: [],
    deadline: "",
    priority: "medium",
    company: "",
    tags: [],
  });

  const [newSubtask, setNewSubtask] = useState("");
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");
  const [newAssigneeRole, setNewAssigneeRole] = useState("");
  const [newTag, setNewTag] = useState("");

  const steps = [
    { n: 1, labelFa: "محتوای تسک", labelEn: "Task Content", icon: ClipboardList },
    { n: 2, labelFa: "انتخاب مجریان", labelEn: "Assignees", icon: Users },
    { n: 3, labelFa: "زمان‌بندی", labelEn: "Schedule", icon: Calendar },
  ];

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setState((s) => ({ ...s, subtasks: [...s.subtasks, { title: newSubtask.trim() }] }));
    setNewSubtask("");
  };

  const removeSubtask = (i: number) => {
    setState((s) => ({ ...s, subtasks: s.subtasks.filter((_, idx) => idx !== i) }));
  };

  const addAssignee = () => {
    if (!newAssigneeName.trim()) return;
    setState((s) => ({
      ...s,
      assignees: [
        ...s.assignees,
        {
          userId: `u-${Date.now()}`,
          name: newAssigneeName.trim(),
          email: newAssigneeEmail.trim(),
          role: newAssigneeRole.trim() || undefined,
        },
      ],
    }));
    setNewAssigneeName("");
    setNewAssigneeEmail("");
    setNewAssigneeRole("");
  };

  const removeAssignee = (i: number) => {
    setState((s) => ({ ...s, assignees: s.assignees.filter((_, idx) => idx !== i) }));
  };

  const addTag = () => {
    if (!newTag.trim() || state.tags.includes(newTag.trim())) return;
    setState((s) => ({ ...s, tags: [...s.tags, newTag.trim()] }));
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setState((s) => ({ ...s, tags: s.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async () => {
    if (!state.title.trim()) {
      toast.error(isRtl ? "عنوان تسک الزامی است." : "Task title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: NewTaskCreate = {
        title: state.title.trim(),
        description: state.description.trim(),
        subtasks: state.subtasks.map((s, i) => ({ title: s.title, is_done: false })),
        assignees: state.assignees,
        created_by: currentUser.id,
        created_by_name: currentUser.fullNameFa || currentUser.fullName || currentUser.name || "مدیر",
        deadline: state.deadline || null,
        priority: state.priority,
        company: state.company || undefined,
        tags: state.tags,
      };

      const created = await newTasksService.createTask(payload);
      toast.success(isRtl ? "تسک با موفقیت ایجاد شد." : "Task created successfully.");
      onTaskCreated(created);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ایجاد تسک" : "Failed to create task"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = step === 1 ? state.title.trim().length > 0 : true;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.n;
          const isDone = step > s.n;
          return (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "size-10 rounded-full border-2 flex items-center justify-center transition-all",
                    isDone
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isRtl ? s.labelFa : s.labelEn}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mb-5 mx-2 transition-colors",
                    step > s.n ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-lg font-bold mb-1">{isRtl ? "محتوای تسک" : "Task Content"}</h2>
                <p className="text-sm text-muted-foreground">
                  {isRtl ? "عنوان، توضیحات و ریزتسک‌ها را وارد کنید." : "Enter title, description and subtasks."}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">{isRtl ? "عنوان تسک *" : "Task Title *"}</label>
                <Input
                  value={state.title}
                  onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
                  placeholder={isRtl ? "عنوان دقیق و گویا..." : "Clear and descriptive title..."}
                  className="rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">{isRtl ? "توضیحات" : "Description"}</label>
                <Textarea
                  value={state.description}
                  onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                  placeholder={isRtl ? "الزامات، دستورالعمل‌ها یا نکات اجرایی..." : "Requirements, instructions, or notes..."}
                  className="rounded-xl resize-none min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{isRtl ? "ریزتسک‌ها (اختیاری)" : "Subtasks (optional)"}</label>
                <div className="flex gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                    placeholder={isRtl ? "ریزتسک جدید..." : "New subtask..."}
                    className="rounded-xl flex-1"
                  />
                  <Button onClick={addSubtask} size="sm" className="rounded-xl px-4" disabled={!newSubtask.trim()}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                {state.subtasks.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {state.subtasks.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2">
                        <Check className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm flex-1">{sub.title}</span>
                        <button
                          onClick={() => removeSubtask(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-lg font-bold mb-1">{isRtl ? "انتخاب مجریان" : "Assignees"}</h2>
                <p className="text-sm text-muted-foreground">
                  {isRtl ? "فرد یا افرادی که این تسک را انجام می‌دهند." : "Who will work on this task."}
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isRtl ? "نام *" : "Name *"}
                    </label>
                    <Input
                      value={newAssigneeName}
                      onChange={(e) => setNewAssigneeName(e.target.value)}
                      placeholder={isRtl ? "نام کامل..." : "Full name..."}
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isRtl ? "سمت / نقش" : "Role"}
                    </label>
                    <Input
                      value={newAssigneeRole}
                      onChange={(e) => setNewAssigneeRole(e.target.value)}
                      placeholder={isRtl ? "مهندس، طراح..." : "Engineer, Designer..."}
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isRtl ? "ایمیل (اختیاری)" : "Email (optional)"}
                  </label>
                  <Input
                    value={newAssigneeEmail}
                    onChange={(e) => setNewAssigneeEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="rounded-xl h-9 text-sm"
                    type="email"
                  />
                </div>
                <Button
                  onClick={addAssignee}
                  size="sm"
                  className="rounded-xl gap-2"
                  disabled={!newAssigneeName.trim()}
                >
                  <Plus className="size-4" />
                  {isRtl ? "افزودن مجری" : "Add Assignee"}
                </Button>
              </div>

              {state.assignees.length > 0 ? (
                <div className="space-y-2">
                  {state.assignees.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border/50 p-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {a.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{a.name}</p>
                        {a.role && <p className="text-xs text-muted-foreground">{a.role}</p>}
                      </div>
                      <button
                        onClick={() => removeAssignee(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  {isRtl ? "هیچ مجری‌ای اضافه نشده است." : "No assignees added yet."}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-lg font-bold mb-1">{isRtl ? "زمان‌بندی و مشخصات" : "Schedule & Details"}</h2>
                <p className="text-sm text-muted-foreground">
                  {isRtl ? "تاریخ تحویل، اولویت، شرکت و تگ‌ها را تعیین کنید." : "Set deadline, priority, company and tags."}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">{isRtl ? "تاریخ تحویل" : "Deadline"}</label>
                <Input
                  type="date"
                  value={state.deadline}
                  onChange={(e) => setState((s) => ({ ...s, deadline: e.target.value }))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{isRtl ? "اولویت" : "Priority"}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setState((s) => ({ ...s, priority: opt.value }))}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2",
                        state.priority === opt.value
                          ? "border-current " + opt.color
                          : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {isRtl ? opt.labelFa : opt.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">{isRtl ? "شرکت" : "Company"}</label>
                <select
                  value={state.company}
                  onChange={(e) => setState((s) => ({ ...s, company: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{isRtl ? "انتخاب شرکت..." : "Select company..."}</option>
                  {COMPANIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{isRtl ? "تگ‌ها (اختیاری)" : "Tags (optional)"}</label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder={isRtl ? "تگ جدید..." : "New tag..."}
                    className="rounded-xl flex-1"
                  />
                  <Button onClick={addTag} size="sm" className="rounded-xl px-4" disabled={!newTag.trim()}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                {state.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {state.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => (step > 1 ? setStep(step - 1) : onCancel())}
          className="rounded-xl gap-2"
        >
          {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {step === 1 ? (isRtl ? "انصراف" : "Cancel") : (isRtl ? "مرحله قبل" : "Previous")}
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="rounded-xl gap-2"
            disabled={!canProceed}
          >
            {isRtl ? "مرحله بعد" : "Next"}
            {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="rounded-xl gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isRtl ? "در حال ثبت..." : "Creating..."}
              </>
            ) : (
              <>
                <Check className="size-4" />
                {isRtl ? "ایجاد تسک" : "Create Task"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
