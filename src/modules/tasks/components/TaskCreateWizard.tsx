// src/modules/tasks/components/TaskCreateWizard.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  CheckCircle2,
  Building2,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { newTasksService, NewTask, NewTaskCreate } from "../services/new-tasks.service";
import { toast } from "sonner";
import type { User } from "@/types/auth";

interface TaskCreateWizardProps {
  currentUser: User;
  onTaskCreated: (task: NewTask) => void;
  onCancel: () => void;
}

type Priority = "low" | "medium" | "high" | "critical";

interface SystemPersonnel {
  id: string;
  name: string;
  fullName?: string;
  fullNameFa?: string;
  email: string;
  jobTitle?: string;
  role?: string;
  department?: string;
  company?: string;
  avatarColor?: string;
  avatar?: string;
}

interface WizardState {
  // Step 1
  title: string;
  description: string;
  subtasks: { title: string }[];
  // Step 2
  assignees: { userId: string; name: string; email: string; role?: string; avatar?: string }[];
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

  // Personnel loading state
  const [personnelList, setPersonnelList] = useState<SystemPersonnel[]>([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = useState(true);
  const [personnelSearch, setPersonnelSearch] = useState("");
  const [personnelCompanyFilter, setPersonnelCompanyFilter] = useState("all");

  const [state, setState] = useState<WizardState>({
    title: "",
    description: "",
    subtasks: [],
    assignees: [],
    deadline: "",
    priority: "medium",
    company: "",
    tags: [],
  });

  const [newSubtask, setNewSubtask] = useState("");
  const [newTag, setNewTag] = useState("");

  // Fetch real system personnel from /api/admin/users
  useEffect(() => {
    let isMounted = true;
    async function fetchPersonnel() {
      setIsLoadingPersonnel(true);
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const json = await res.json();
          const items: any[] = Array.isArray(json) ? json : (json.data || json.users || []);
          if (isMounted) {
            const mapped: SystemPersonnel[] = items.map((u) => {
              const displayName = u.fullNameFa || u.name || u.fullName || u.email?.split("@")[0] || "کاربر";
              return {
                id: u.id,
                name: displayName,
                fullName: u.fullName,
                fullNameFa: u.fullNameFa,
                email: u.email || "",
                jobTitle: u.jobTitle || u.role || "کارشناس",
                role: u.role,
                department: u.department,
                company: u.company || (u.companyId === "nano" ? "نانو پالایش سرام" : "یورو اسلات پارس"),
                avatarColor: u.avatarColor || "#0284c7",
                avatar: u.avatar,
              };
            });
            setPersonnelList(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch system personnel, using fallback:", err);
      } finally {
        if (isMounted) setIsLoadingPersonnel(false);
      }
    }
    fetchPersonnel();
    return () => {
      isMounted = false;
    };
  }, []);

  const steps = [
    { n: 1, labelFa: "محتوای تسک", labelEn: "Task Content", icon: ClipboardList },
    { n: 2, labelFa: "انتخاب مجریان", labelEn: "Assignees", icon: Users },
    { n: 3, labelFa: "زمان‌بندی و اولویت", labelEn: "Schedule & Details", icon: Calendar },
  ];

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setState((s) => ({ ...s, subtasks: [...s.subtasks, { title: newSubtask.trim() }] }));
    setNewSubtask("");
  };

  const removeSubtask = (i: number) => {
    setState((s) => ({ ...s, subtasks: s.subtasks.filter((_, idx) => idx !== i) }));
  };

  const toggleAssignee = (p: SystemPersonnel) => {
    setState((s) => {
      const exists = s.assignees.some((a) => a.userId === p.id);
      if (exists) {
        return {
          ...s,
          assignees: s.assignees.filter((a) => a.userId !== p.id),
        };
      }
      return {
        ...s,
        assignees: [
          ...s.assignees,
          {
            userId: p.id,
            name: p.name,
            email: p.email,
            role: p.jobTitle || p.role,
            avatar: p.avatar,
          },
        ],
      };
    });
  };

  const removeAssigneeById = (userId: string) => {
    setState((s) => ({
      ...s,
      assignees: s.assignees.filter((a) => a.userId !== userId),
    }));
  };

  const addTag = () => {
    if (!newTag.trim() || state.tags.includes(newTag.trim())) return;
    setState((s) => ({ ...s, tags: [...s.tags, newTag.trim()] }));
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setState((s) => ({ ...s, tags: s.tags.filter((t) => t !== tag) }));
  };

  const filteredPersonnel = useMemo(() => {
    return personnelList.filter((p) => {
      if (personnelCompanyFilter !== "all" && p.company !== personnelCompanyFilter) {
        return false;
      }
      if (personnelSearch.trim()) {
        const q = personnelSearch.toLowerCase().trim();
        const hay = [p.name, p.fullName, p.fullNameFa, p.email, p.jobTitle, p.department, p.company]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [personnelList, personnelSearch, personnelCompanyFilter]);

  const handleSubmit = async () => {
    if (!state.title.trim()) {
      toast.error(isRtl ? "عنوان تسک الزامی است." : "Task title is required.");
      return;
    }
    if (state.assignees.length === 0) {
      toast.error(isRtl ? "حداقل یک نفر باید به عنوان مجری تسک انتخاب شود." : "Please select at least one assignee.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: NewTaskCreate = {
        title: state.title.trim(),
        description: state.description.trim(),
        subtasks: state.subtasks.map((s) => ({ title: s.title, is_done: false })),
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

  const canProceed = () => {
    if (step === 1) return state.title.trim().length > 0;
    if (step === 2) return state.assignees.length > 0;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-10">
      {/* Step Indicator */}
      <div className="flex items-center justify-between gap-0 mb-8 max-w-xl mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.n;
          const isDone = step > s.n;
          return (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => (isDone ? setStep(s.n) : null)}>
                <div
                  className={cn(
                    "size-10 sm:size-11 rounded-full border-2 flex items-center justify-center transition-all",
                    isDone
                      ? "bg-primary border-primary text-white shadow-xs"
                      : isActive
                      ? "bg-primary/10 border-primary text-primary ring-4 ring-primary/10"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="size-4 stroke-[3]" /> : <Icon className="size-4" />}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold whitespace-nowrap",
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {isRtl ? s.labelFa : s.labelEn}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mb-5 mx-2 transition-colors",
                    step > s.n ? "bg-primary" : "bg-border/60"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-xs">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-1 text-foreground">
                  {isRtl ? "مرحله اول: مشخصات و شرح تسک" : "Step 1: Task Specifications"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? "عنوان دقیق، شرح الزامات و در صورت لزوم مراحل و چک‌لیست زیرتسک‌ها را درج نمایید."
                    : "Enter a descriptive title, requirements, and optional checklist subtasks."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                  <span>{isRtl ? "عنوان دقیق تسک *" : "Task Title *"}</span>
                </label>
                <Input
                  value={state.title}
                  onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
                  placeholder={isRtl ? "مثال: طراحی نقشه فلنج‌های خط ورودی واحد ۳..." : "e.g. Design intake flange schematics for Unit 3..."}
                  className="rounded-xl h-11 text-sm bg-background"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold">
                  {isRtl ? "توضیحات و الزامات فنی (اختیاری)" : "Technical Details & Requirements"}
                </label>
                <Textarea
                  value={state.description}
                  onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                  placeholder={isRtl ? "دستورالعمل‌ها، استانداردها، رفرنس‌های مهندسی یا توضیحات لازم را اینجا بنویسید..." : "Engineering standards, guidelines, or instructions..."}
                  className="rounded-xl resize-none min-h-[110px] text-sm bg-background"
                />
              </div>

              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold">
                    {isRtl ? "چک‌لیست و زیرتسک‌های اجرایی (اختیاری)" : "Execution Checklist & Subtasks"}
                  </label>
                  <span className="text-xs text-muted-foreground fa-num">
                    {state.subtasks.length} {isRtl ? "زیرتسک" : "subtasks"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                    placeholder={isRtl ? "اقدام یا مرحله بعدی را بنویسید و Enter بزنید..." : "Next checklist action..."}
                    className="rounded-xl h-10 text-sm bg-background flex-1"
                  />
                  <Button onClick={addSubtask} size="sm" className="rounded-xl px-4 h-10 gap-1.5" disabled={!newSubtask.trim()}>
                    <Plus className="size-4" />
                    <span>{isRtl ? "افزودن" : "Add"}</span>
                  </Button>
                </div>

                {state.subtasks.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {state.subtasks.map((sub, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/40 rounded-xl px-3.5 py-2.5 border border-border/40">
                        <Check className="size-4 text-primary shrink-0" />
                        <span className="text-xs sm:text-sm flex-1 font-medium">{sub.title}</span>
                        <button
                          type="button"
                          onClick={() => removeSubtask(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <X className="size-4" />
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
                <h2 className="text-xl font-bold mb-1 text-foreground">
                  {isRtl ? "مرحله دوم: انتخاب مجریان تسک" : "Step 2: Assign Team Members"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? "فرد یا افرادی که مسئولیت انجام این تسک را بر عهده دارند از لیست پرسنل موجود انتخاب کنید."
                    : "Select one or more personnel from the organization who will execute this task."}
                </p>
              </div>

              {/* Selected Assignees Summary Bar */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1.5">
                    <UserCheck className="size-4" />
                    <span>{isRtl ? "افراد انتخاب‌شده:" : "Selected Assignees:"}</span>
                  </span>
                  <span className="font-bold fa-num text-primary">
                    {state.assignees.length} {isRtl ? "نفر" : "person(s)"}
                  </span>
                </div>

                {state.assignees.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    {isRtl ? "هنوز فردی انتخاب نشده است. از لیست زیر یک یا چند نفر را انتخاب کنید." : "No one selected yet. Click any member below."}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {state.assignees.map((a) => (
                      <span
                        key={a.userId}
                        className="inline-flex items-center gap-1.5 bg-card border border-primary/30 text-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-2xs"
                      >
                        <span className="size-2 rounded-full bg-primary" />
                        <span>{a.name}</span>
                        {a.role && <span className="text-[10px] text-muted-foreground font-normal">({a.role})</span>}
                        <button
                          type="button"
                          onClick={() => removeAssigneeById(a.userId)}
                          className="hover:text-destructive transition-colors ms-1"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search & Company Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={personnelSearch}
                    onChange={(e) => setPersonnelSearch(e.target.value)}
                    placeholder={isRtl ? "جستجوی نام، سمت، ایمیل یا دپارتمان..." : "Search personnel..."}
                    className="ps-9 rounded-xl h-10 text-xs sm:text-sm bg-background"
                  />
                </div>
                <select
                  value={personnelCompanyFilter}
                  onChange={(e) => setPersonnelCompanyFilter(e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10"
                >
                  <option value="all">{isRtl ? "همه شرکت‌ها" : "All Companies"}</option>
                  <option value="یورو اسلات پارس">یورو اسلات پارس</option>
                  <option value="نانو پالایش سرام">نانو پالایش سرام</option>
                </select>
              </div>

              {/* Personnel Cards Grid */}
              {isLoadingPersonnel ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <span className="text-xs">{isRtl ? "در حال بارگذاری لیست پرسنل..." : "Loading personnel..."}</span>
                </div>
              ) : filteredPersonnel.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  {isRtl ? "هیچ فردی با این مشخصات یافت نشد." : "No personnel found."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pe-1 custom-scrollbar">
                  {filteredPersonnel.map((person) => {
                    const isSelected = state.assignees.some((a) => a.userId === person.id);
                    return (
                      <div
                        key={person.id}
                        onClick={() => toggleAssignee(person)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3",
                          isSelected
                            ? "bg-primary/10 border-primary ring-1 ring-primary/40 shadow-xs"
                            : "bg-background hover:bg-muted/50 border-border/60"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="size-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-2xs"
                            style={{ backgroundColor: person.avatarColor || "#0284c7" }}
                          >
                            {person.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {person.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {person.jobTitle} {person.company ? `• ${person.company}` : ""}
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : "border-border/80 text-transparent"
                          )}
                        >
                          <Check className="size-3.5 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })}
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
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-1 text-foreground">
                  {isRtl ? "مرحله سوم: زمان‌بندی، اولویت و شرکت" : "Step 3: Scheduling & Metadata"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? "مهلت تحویل نهایی، اولویت کاری، شرکت تابعه و برچسب‌های تسک را تعیین نمایید."
                    : "Specify final deadline, task priority, company ownership, and tags."}
                </p>
              </div>

              {/* Deadline & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="size-4 text-primary" />
                    <span>{isRtl ? "مهلت و تاریخ تحویل" : "Deadline"}</span>
                  </label>
                  <Input
                    type="date"
                    value={state.deadline}
                    onChange={(e) => setState((s) => ({ ...s, deadline: e.target.value }))}
                    className="rounded-xl h-11 text-sm bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Building2 className="size-4 text-primary" />
                    <span>{isRtl ? "شرکت مجری / کارفرما" : "Company"}</span>
                  </label>
                  <select
                    value={state.company}
                    onChange={(e) => setState((s) => ({ ...s, company: e.target.value }))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-11"
                  >
                    <option value="">{isRtl ? "انتخاب شرکت..." : "Select company..."}</option>
                    {COMPANIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2.5">
                <label className="text-xs sm:text-sm font-semibold block">
                  {isRtl ? "سطح فوریت و اولویت کاری" : "Priority Level"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setState((s) => ({ ...s, priority: opt.value }))}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center gap-1.5 cursor-pointer",
                        state.priority === opt.value
                          ? "border-current shadow-xs " + opt.color
                          : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {opt.value === "critical" && <AlertCircle className="size-3.5" />}
                      <span>{isRtl ? opt.labelFa : opt.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="text-xs sm:text-sm font-semibold block">
                  {isRtl ? "برچسب‌ها و تگ‌های موضوعی (اختیاری)" : "Tags & Labels (optional)"}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder={isRtl ? "برچسب جدید (مثل: مهندسی فرآیند، متریال، بازرسی...)" : "New tag..."}
                    className="rounded-xl h-10 text-sm bg-background flex-1"
                  />
                  <Button onClick={addTag} size="sm" className="rounded-xl px-4 h-10" disabled={!newTag.trim()}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                {state.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {state.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                        <span>#{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
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

      {/* Wizard Footer Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => (step > 1 ? setStep(step - 1) : onCancel())}
          className="rounded-xl gap-2 h-11 px-5"
        >
          {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          <span>{step === 1 ? (isRtl ? "انصراف" : "Cancel") : (isRtl ? "مرحله قبل" : "Previous")}</span>
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="rounded-xl gap-2 h-11 px-6 font-semibold"
            disabled={!canProceed()}
          >
            <span>{isRtl ? "مرحله بعد" : "Next"}</span>
            {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="rounded-xl gap-2 h-11 px-7 font-bold shadow-md bg-primary hover:bg-primary/95 text-white"
            disabled={isSubmitting || !canProceed()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{isRtl ? "در حال ایجاد تسک..." : "Creating..."}</span>
              </>
            ) : (
              <>
                <Check className="size-4 stroke-[3]" />
                <span>{isRtl ? "ثبت نهایی و ساخت تسک" : "Create Task"}</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
