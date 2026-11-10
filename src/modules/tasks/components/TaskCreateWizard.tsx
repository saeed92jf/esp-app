// src/modules/tasks/components/TaskCreateWizard.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Building2,
  UserCheck,
  AlertCircle,
  UploadCloud,
  Paperclip,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { formatPersonName, formatRoleName } from "@/lib/person-names";
import { newTasksService, NewTask, NewTaskCreate, TaskAttachmentItem } from "../services/new-tasks.service";
import { TaskAttachmentList, readAttachmentFile } from "./TaskAttachmentList";
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
  attachments: TaskAttachmentItem[];
  // Project linkage
  is_independent: boolean;
  project_id: string | null;
  project_name: string | null;
  project_esp_number: string | null;
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

const COMPANY_COMBOBOX_OPTIONS: ComboboxOption[] = [
  {
    value: "یورو اسلات پارس",
    label: "یورو اسلات پارس",
    hint: "تجهیزات فیلتراسیون، صفحات غربال و اسلات‌دار",
  },
  {
    value: "نانو پالایش سرام",
    label: "نانو پالایش سرام",
    hint: "غشاهای نانوسرامیکی دمای بالا و کاتالیست",
  },
];

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
    attachments: [],
    is_independent: true,
    project_id: null,
    project_name: null,
    project_esp_number: null,
    assignees: [],
    deadline: "",
    priority: "medium",
    company: "یورو اسلات پارس",
    tags: [],
  });

  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
  const [newSubtask, setNewSubtask] = useState("");
  const [newTag, setNewTag] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFilesUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingFiles(true);
    const newItems: TaskAttachmentItem[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const item = await readAttachmentFile(file);
          newItems.push(item);
        } catch (err: any) {
          toast.error(err.message || `خطا در خواندن ${file.name}`);
        }
      }
      if (newItems.length > 0) {
        setState((s) => ({ ...s, attachments: [...s.attachments, ...newItems] }));
        toast.success(
          isRtl
            ? `${newItems.length} فایل پیوست اضافه شد.`
            : `${newItems.length} file(s) attached.`
        );
      }
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setState((s) => ({
      ...s,
      attachments: s.attachments.filter((_, idx) => idx !== index),
    }));
  };

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

  // Fetch real projects from /api/projects for project linkage
  const [projectsList, setProjectsList] = useState<{ id: string; name: string; espNumber: string; client?: string }[]>([]);
  useEffect(() => {
    let isMounted = true;
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const json = await res.json();
          const items: any[] = Array.isArray(json) ? json : (json.data || json.projects || []);
          if (isMounted) {
            setProjectsList(
              items.map((p) => ({
                id: p.id,
                name: p.name || p.title,
                espNumber: p.espNumber || p.quotationNumber || "",
                client: p.client || p.clientName || "",
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Failed to fetch projects for task wizard:", err);
      }
    }
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const projectComboboxOptions: ComboboxOption[] = useMemo(() => {
    return projectsList.map((p) => ({
      value: p.id,
      label: `${p.espNumber ? `${p.espNumber} | ` : ""}${p.name}`,
      hint: p.client ? `کارفرما: ${p.client}` : undefined,
    }));
  }, [projectsList]);

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

  const handleDeadlineDateChange = (d?: Date) => {
    setDeadlineDate(d);
    if (d) {
      if (isRtl) {
        const j = getJalaliDate(d);
        const jStr = `${j.year}/${String(j.month).padStart(2, "0")}/${String(j.day).padStart(2, "0")}`;
        setState((s) => ({ ...s, deadline: jStr }));
      } else {
        const iso = d.toISOString().split("T")[0];
        setState((s) => ({ ...s, deadline: iso }));
      }
    } else {
      setState((s) => ({ ...s, deadline: "" }));
    }
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

  const personnelCompanyComboboxOptions: ComboboxOption[] = useMemo(() => [
    { value: "all", label: isRtl ? "همه شرکت‌ها" : "All Companies" },
    { value: "یورو اسلات پارس", label: isRtl ? "یورو اسلات پارس" : "Euroslot Pars" },
    { value: "نانو پالایش سرام", label: isRtl ? "نانو پالایش سرام" : "Nano Palayesh Seram" },
  ], [isRtl]);

  const companyComboboxOptions: ComboboxOption[] = useMemo(() => [
    {
      value: "یورو اسلات پارس",
      label: isRtl ? "یورو اسلات پارس" : "Euroslot Pars",
      hint: isRtl ? "تجهیزات فیلتراسیون، صفحات غربال و اسلات‌دار" : "Filtration equipment, slotted & screen plates",
    },
    {
      value: "نانو پالایش سرام",
      label: isRtl ? "نانو پالایش سرام" : "Nano Palayesh Seram",
      hint: isRtl ? "غشاهای نانوسرامیکی دمای بالا و کاتالیست" : "High-temp nanoceramic membranes & catalysts",
    },
  ], [isRtl]);

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
        created_by_name: formatPersonName(currentUser.fullNameFa || currentUser.fullName || currentUser.name || "مدیر", locale),
        deadline: state.deadline || null,
        priority: state.priority,
        company: state.company || undefined,
        tags: state.tags,
        attachments: state.attachments,
        project_id: state.is_independent ? null : state.project_id,
        project_name: state.is_independent ? null : state.project_name,
        project_esp_number: state.is_independent ? null : state.project_esp_number,
        is_independent: state.is_independent,
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
                    ? "عنوان دقیق، شرح الزامات و در صورت لزوم چک‌لیست اقدامات زیرتسک‌ها را درج نمایید."
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

              {/* Project Linkage: Project Task vs Independent Task */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <FolderKanban className="size-4 text-primary" />
                    <span>{isRtl ? "ارتباط با پروژه (انتخاب پروژه یا تسک مستقل) *" : "Project Linkage (Project or Independent) *"}</span>
                  </label>
                  {state.is_independent ? (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                      {isRtl ? "تسک مستقل" : "Independent Task"}
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 font-bold text-primary">
                      {isRtl ? "متصل به پروژه" : "Linked to Project"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        is_independent: true,
                        project_id: null,
                        project_name: null,
                        project_esp_number: null,
                      }))
                    }
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 cursor-pointer select-none text-xs font-bold",
                      state.is_independent
                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                        : "border-border/60 bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span>{isRtl ? "تسک مستقل (بدون پروژه)" : "Independent Task"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setState((s) => ({
                        ...s,
                        is_independent: false,
                        project_id: projectsList[0]?.id || null,
                        project_name: projectsList[0]?.name || null,
                        project_esp_number: projectsList[0]?.espNumber || null,
                      }));
                    }}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 cursor-pointer select-none text-xs font-bold",
                      !state.is_independent
                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                        : "border-border/60 bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span>{isRtl ? "تسک مرتبط با پروژه" : "Project Task"}</span>
                  </button>
                </div>

                {/* Combobox to select project when not independent */}
                {!state.is_independent && (
                  <div className="pt-2 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      {isRtl ? "انتخاب پروژه از سیستم:" : "Select Project:"}
                    </label>
                    {projectsList.length > 0 ? (
                      <Combobox
                        options={projectComboboxOptions}
                        value={state.project_id || ""}
                        onChange={(val) => {
                          const p = projectsList.find((x) => x.id === val);
                          setState((s) => ({
                            ...s,
                            project_id: val,
                            project_name: p ? p.name : "",
                            project_esp_number: p ? p.espNumber : "",
                          }));
                        }}
                        placeholder={isRtl ? "انتخاب پروژه مربوطه..." : "Select project..."}
                        className="w-full h-10 rounded-xl text-sm"
                        allowClear={false}
                      />
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-xs text-amber-700 dark:text-amber-300">
                        {isRtl
                          ? "در حال حاضر هیچ پروژه‌ای در سیستم ثبت نشده است. این تسک به عنوان تسک مستقل ثبت می‌شود یا می‌توانید از صفحه پروژه‌ها پروژه جدید بسازید."
                          : "No projects registered yet. This will be an independent task."}
                      </div>
                    )}
                  </div>
                )}
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

              {/* File Attachments Section */}
              <div className="space-y-3 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Paperclip className="size-4 text-primary" />
                    <span>{isRtl ? "فایل‌ها و مستندات پیوست (نقشه‌ها، گزارشات و فایل‌های فنی)" : "Attachments & Technical Files"}</span>
                  </label>
                  <span className="text-xs text-muted-foreground fa-num">
                    {state.attachments.length} {isRtl ? "فایل" : "files"}
                  </span>
                </div>

                {/* Dropzone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesUpload(e.target.files)}
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    handleFilesUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center select-none",
                    isDraggingOver
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/70 hover:border-primary/50 bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    {isUploadingFiles ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <UploadCloud className="size-5" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {isUploadingFiles
                        ? (isRtl ? "در حال پردازش فایل‌ها..." : "Processing files...")
                        : (isRtl ? "برای انتخاب فایل کلیک کنید یا فایل‌ها را اینجا بکشید و رها کنید" : "Click to browse or drag & drop files here")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {isRtl
                        ? "پشتیبانی از نقشه‌های مهندسی (DWG, DXF)، گزارشات (PDF)، اکسل، عکس و ZIP (حداکثر ۱۵ مگابایت)"
                        : "Supports DWG, DXF, PDF, Excel, Images, and ZIP (Max 15MB)"}
                    </span>
                  </div>
                </div>

                {/* Attached files list */}
                {state.attachments.length > 0 && (
                  <div className="mt-3">
                    <TaskAttachmentList
                      attachments={state.attachments}
                      onRemove={removeAttachment}
                      isRtl={isRtl}
                    />
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
                        <span>{formatPersonName(a.name, locale)}</span>
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

              {/* Search & Company Filter Toolbar using Combobox */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={personnelSearch}
                    onChange={(e) => setPersonnelSearch(e.target.value)}
                    placeholder={isRtl ? "جستجوی نام، سمت، ایمیل یا دپارتمان..." : "Search personnel..."}
                    className="ps-9 rounded-xl h-10 text-xs sm:text-sm bg-background"
                  />
                </div>
                <div className="w-full sm:w-60">
                  <Combobox
                    options={personnelCompanyComboboxOptions}
                    value={personnelCompanyFilter}
                    onChange={(val) => setPersonnelCompanyFilter(val || "all")}
                    placeholder={isRtl ? "فیلتر شرکت..." : "Filter company..."}
                    className="w-full h-10 rounded-xl"
                    allowClear={false}
                  />
                </div>
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
                            {formatPersonName(person.name, locale).charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {formatPersonName(person.name, locale)}
                            </p>
                            {person.company && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {person.company === "یورو اسلات پارس" ? (isRtl ? "یورو اسلات پارس" : "Euroslot Pars") : (isRtl ? "نانو پالایش سرام" : "Nano Palayesh Seram")}
                              </p>
                            )}
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
                    ? "مهلت تحویل نهایی را با تقویم شمسی و شرکت را از فهرست انتخاب نمایید."
                    : "Specify final deadline with the date picker and select corporate ownership."}
                </p>
              </div>

              {/* Deadline (Custom DatePicker) & Company (Custom Combobox) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="size-4 text-primary" />
                    <span>{isRtl ? "مهلت و تاریخ تحویل (تقویم شمسی)" : "Deadline"}</span>
                  </label>
                  <DatePicker
                    value={deadlineDate}
                    onChange={handleDeadlineDateChange}
                    placeholder={isRtl ? "انتخاب تاریخ سررسید..." : "Select deadline..."}
                    isJalali={isRtl}
                    className="w-full h-11 rounded-xl text-sm"
                  />
                  {state.deadline && (
                    <p className="text-[11px] text-muted-foreground fa-num">
                      {isRtl ? "تاریخ ثبت‌شده:" : "Set date:"} {state.deadline}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Building2 className="size-4 text-primary" />
                    <span>{isRtl ? "شرکت مجری / کارفرما" : "Company"}</span>
                  </label>
                  <Combobox
                    options={companyComboboxOptions}
                    value={state.company}
                    onChange={(val) => setState((s) => ({ ...s, company: val }))}
                    placeholder={isRtl ? "انتخاب شرکت مربوطه..." : "Select company..."}
                    className="w-full h-11 rounded-xl text-sm"
                    allowClear={false}
                  />
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
