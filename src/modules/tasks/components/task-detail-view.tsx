// src/modules/tasks/components/task-detail-view.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  FileText,
  FolderGit2,
  Layers,
  Tag,
  Building2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calendar as CalendarIcon,
  Clock,
  ListChecks,
  Users,
  MessageSquare,
  Paperclip,
  Activity,
  Check,
  ChevronRight,
  ChevronDown,
  Trash2,
  Share2,
  Circle,
  Plus,
  Loader2,
  ShieldAlert,
  Edit2,
  Fingerprint,
  Lock,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import type { ProjectItem } from "@/modules/projects/types/projects.types";
import {
  TaskItem,
  TaskStatus,
  TaskPriority,
  TaskAttachment,
  TaskAssignee,
  SubTask,
} from "../types/tasks.types";
import { TaskCommentThread } from "./task-comment-thread";
import { TaskAttachmentsSection } from "./task-attachments-section";
import { cn } from "@/lib/utils";
import {
  segmentedAccordionMotion,
  getSegmentedAccordionHeaderClass,
} from "@/lib/animations/segmented-accordion";

export type TaskDetailEditingField =
  | null
  | "scope"
  | "description"
  | "category"
  | "company"
  | "hours"
  | "activity";

export interface TaskDetailViewProps {
  task: TaskItem;
  roleMode?: "admin" | "user";
  onBack: () => void;
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => Promise<void>;
  onAddComment: (taskId: string, content: string, attachments?: TaskAttachment[]) => Promise<void>;
  onAddReply: (
    taskId: string,
    commentId: string,
    content: string,
    attachments?: TaskAttachment[]
  ) => Promise<void>;
  onUploadAttachment: (
    taskId: string,
    file: { name: string; size: string; type: string; url?: string; isDrawing?: boolean }
  ) => Promise<void>;
  onDeleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAssignCollaborator?: (taskId: string, collaborator: TaskAssignee) => Promise<void>;
  onRemoveCollaborator?: (taskId: string, collaboratorId: string) => Promise<void>;
  onUpdateProgress?: (taskId: string, progress: number) => Promise<void>;
  onUpdateTask?: (updated: TaskItem) => Promise<any>;
  availableProjects?: ProjectItem[];
}

export function TaskDetailView({
  task,
  roleMode = "admin",
  onBack,
  onUpdateStatus,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onAddComment,
  onAddReply,
  onUploadAttachment,
  onDeleteAttachment,
  onDeleteTask,
  onAssignCollaborator,
  onRemoveCollaborator,
  onUpdateProgress,
  onUpdateTask,
  availableProjects = [],
}: TaskDetailViewProps) {
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Sub-view modal for editing deep fields (category, company, etc.)
  const [editingField, setEditingField] = useState<TaskDetailEditingField>(null);

  // Accordion open/close states (Smooth motion animated)
  const [isOverviewOpen, setIsOverviewOpen] = useState<boolean>(true);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"subtasks" | "comments" | "documents">("subtasks");
  const [isTeamOpen, setIsTeamOpen] = useState<boolean>(false);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState<boolean>(false);

  // Inline title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);

  // Local state initialized from task prop
  const [description, setDescription] = useState(task.description || "");
  const [category, setCategory] = useState(task.category || "P&ID FLOW");
  const [company, setCompany] = useState<"یورو اسلات پارس" | "نانو پالایش سرام">(
    (task.company as any) || "یورو اسلات پارس"
  );
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [progress, setProgress] = useState(task.progressPercent || 0);
  const [selectedProjectId, setSelectedProjectId] = useState(task.relatedProjectId || "");
  const [relatedProjectTitle, setRelatedProjectTitle] = useState(task.relatedProjectTitle || "");
  const [isPersonal, setIsPersonal] = useState(task.isPersonal || false);

  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [timelineDate, setTimelineDate] = useState(task.timelineDate || "");
  const [dueDateObj, setDueDateObj] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [estimatedHours, setEstimatedHours] = useState(task.estimatedHours ? String(task.estimatedHours) : "");
  const [loggedHours, setLoggedHours] = useState(task.loggedHours ? String(task.loggedHours) : "0");

  // Subtasks local state
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");

  // Auto-progress calculation state (defaults to true if task has subtasks)
  const [isAutoProgress, setIsAutoProgress] = useState<boolean>(
    Boolean(task.subtasks && task.subtasks.length > 0)
  );

  // Assignees local state
  const [assignees, setAssignees] = useState<TaskAssignee[]>(
    task.assignees && task.assignees.length > 0
      ? task.assignees
      : [
          {
            id: "default",
            name: task.assignedToName || "سعید جلیلی",
            role: task.assignedToRole || (isRtl ? "کارشناس مهندسی" : "Engineering Specialist"),
            isLead: true,
          },
        ]
  );
  const [newCollabName, setNewCollabName] = useState("");
  const [newCollabRole, setNewCollabRole] = useState("");
  const [isAddingCollab, setIsAddingCollab] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Sync state if task prop changes
  useEffect(() => {
    setTitleInput(task.title);
    setDescription(task.description || "");
    setCategory(task.category || "P&ID FLOW");
    if (task.company) setCompany(task.company as any);
    setStatus(task.status);
    setPriority(task.priority);
    setProgress(task.progressPercent || 0);
    setSelectedProjectId(task.relatedProjectId || "");
    setRelatedProjectTitle(task.relatedProjectTitle || "");
    setIsPersonal(task.isPersonal || false);
    setDueDate(task.dueDate || "");
    setTimelineDate(task.timelineDate || "");
    setEstimatedHours(task.estimatedHours ? String(task.estimatedHours) : "");
    setLoggedHours(task.loggedHours ? String(task.loggedHours) : "0");
    setSubtasks(task.subtasks || []);
    setIsAutoProgress(Boolean(task.subtasks && task.subtasks.length > 0));
    if (task.assignees && task.assignees.length > 0) {
      setAssignees(task.assignees);
    }
  }, [task]);

  // Sync date strings from DatePicker object
  useEffect(() => {
    if (dueDateObj) {
      const { year, month, day } = getJalaliDate(dueDateObj);
      const formatted = `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
      setDueDate(formatted);
      const monthNamesFa = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
      ];
      setTimelineDate(`${day} ${monthNamesFa[month - 1] || ""}`);
      setShowDatePicker(false);
      persistChanges({ dueDate: formatted });
    }
  }, [dueDateObj]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDelete = async () => {
    if (task.isManagerDefined) {
      alert(t("drawer.cannotDeleteManager"));
      return;
    }
    if (window.confirm(t("detailPage.deleteConfirm"))) {
      await onDeleteTask(task.id);
      onBack();
    }
  };

  // Helper to persist updated task fields
  const persistChanges = async (updates: Partial<TaskItem>) => {
    if (onUpdateTask) {
      setIsSaving(true);
      try {
        const updatedTask: TaskItem = {
          ...task,
          ...updates,
          activities: [
            {
              id: `act-${Date.now()}`,
              type: "status_change",
              authorName: "سعید جلیلی",
              timestamp: new Intl.DateTimeFormat(isRtl ? "fa-IR" : "en-US").format(new Date()),
              details: updates.status ? `وضعیت به ${updates.status} تغییر کرد.` : "مشخصات تسک به‌روزرسانی شد.",
            },
            ...(task.activities || []),
          ],
        };
        await onUpdateTask(updatedTask);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Inline Title Save
  const handleSaveTitleInline = async () => {
    if (!titleInput.trim()) {
      setTitleInput(task.title);
      setIsEditingTitle(false);
      return;
    }
    setIsEditingTitle(false);
    await persistChanges({ title: titleInput.trim() });
  };

  // Direct Status Update
  const handleDirectStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    await onUpdateStatus(task.id, newStatus);
    if (newStatus === "completed" && progress < 100) {
      setProgress(100);
      if (onUpdateProgress) {
        await onUpdateProgress(task.id, 100);
      } else {
        await persistChanges({ progressPercent: 100, status: newStatus });
      }
    }
  };

  // Direct Priority Update
  const handleDirectPriorityChange = async (newPriority: TaskPriority) => {
    setPriority(newPriority);
    await persistChanges({ priority: newPriority });
  };

  // Direct Progress Update (Manual)
  const handleDirectProgressChange = async (newVal: number) => {
    setProgress(newVal);
    if (onUpdateProgress) {
      await onUpdateProgress(task.id, newVal);
    } else {
      await persistChanges({ progressPercent: newVal });
    }
    if (newVal === 100 && status !== "completed") {
      setStatus("completed");
      await onUpdateStatus(task.id, "completed");
    } else if (newVal < 100 && status === "completed") {
      setStatus("in_progress");
      await onUpdateStatus(task.id, "in_progress");
    }
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  // Subtasks actions with Auto Progress calculation
  const handleToggleSubtaskLocal = async (subtaskId: string, completed: boolean) => {
    const updated = subtasks.map((s) => (s.id === subtaskId ? { ...s, completed } : s));
    setSubtasks(updated);
    await onToggleSubtask(task.id, subtaskId, completed);

    if (isAutoProgress && updated.length > 0) {
      const completedCount = updated.filter((s) => s.completed).length;
      const newPercent = Math.round((completedCount / updated.length) * 100);
      setProgress(newPercent);
      if (onUpdateProgress) {
        await onUpdateProgress(task.id, newPercent);
      } else {
        await persistChanges({ progressPercent: newPercent });
      }

      // Organic status sync
      if (newPercent === 100 && status !== "completed") {
        setStatus("completed");
        await onUpdateStatus(task.id, "completed");
      } else if (newPercent < 100 && status === "completed") {
        setStatus("in_progress");
        await onUpdateStatus(task.id, "in_progress");
      }
    }
  };

  const handleAddSubtaskLocal = async () => {
    if (!newSubtaskInput.trim()) return;
    const itemTitle = newSubtaskInput.trim();
    setNewSubtaskInput("");
    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: itemTitle,
      completed: false,
    };
    const updated = [...subtasks, newSub];
    setSubtasks(updated);
    await onAddSubtask(task.id, itemTitle);

    if (isAutoProgress) {
      const completedCount = updated.filter((s) => s.completed).length;
      const newPercent = Math.round((completedCount / updated.length) * 100);
      setProgress(newPercent);
      if (onUpdateProgress) {
        await onUpdateProgress(task.id, newPercent);
      }
    }
  };

  const handleRemoveSubtaskLocal = async (subtaskId: string) => {
    const updated = subtasks.filter((s) => s.id !== subtaskId);
    setSubtasks(updated);
    if (onDeleteSubtask) {
      await onDeleteSubtask(task.id, subtaskId);
    }
    if (isAutoProgress && updated.length > 0) {
      const completedCount = updated.filter((s) => s.completed).length;
      const newPercent = Math.round((completedCount / updated.length) * 100);
      setProgress(newPercent);
      if (onUpdateProgress) {
        await onUpdateProgress(task.id, newPercent);
      }
    }
  };

  // Collaborators actions
  const handleAddCollaboratorLocal = async () => {
    if (!newCollabName.trim()) return;
    const newCollab: TaskAssignee = {
      id: `collab-${Date.now()}`,
      name: newCollabName.trim(),
      role: newCollabRole.trim() || (isRtl ? "همکار پروژه" : "Project Collaborator"),
      companies: [company],
    };
    const updated = [...assignees, newCollab];
    setAssignees(updated);
    setNewCollabName("");
    setNewCollabRole("");
    setIsAddingCollab(false);
    if (onAssignCollaborator) {
      await onAssignCollaborator(task.id, newCollab);
    }
  };

  const handleRemoveCollaboratorLocal = async (collabId: string) => {
    const updated = assignees.filter((a) => a.id !== collabId);
    setAssignees(updated);
    if (onRemoveCollaborator) {
      await onRemoveCollaborator(task.id, collabId);
    }
  };

  const getPriorityInfo = (p: TaskPriority) => {
    switch (p) {
      case "urgent":
        return {
          label: t("priority.urgent"),
          dotColor: "bg-rose-500",
          badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        };
      case "high":
        return {
          label: t("priority.high"),
          dotColor: "bg-amber-500",
          badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "medium":
        return {
          label: t("priority.medium"),
          dotColor: "bg-sky-500",
          badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        };
      case "low":
      default:
        return {
          label: t("priority.low"),
          dotColor: "bg-slate-400 dark:bg-slate-500",
          badgeClass: "bg-muted text-muted-foreground border-border/40",
        };
    }
  };

  const getStatusInfo = (s: TaskStatus) => {
    switch (s) {
      case "completed":
        return {
          label: t("status.completed"),
          badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          dotColor: "bg-emerald-500",
        };
      case "review":
        return {
          label: t("status.review"),
          badgeClass: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
          dotColor: "bg-pink-500",
        };
      case "in_progress":
        return {
          label: t("status.in_progress"),
          badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          dotColor: "bg-amber-500",
        };
      case "pending":
      default:
        return {
          label: t("status.pending"),
          badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          dotColor: "bg-indigo-500",
        };
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // FOCUSED SUB-VIEWS (For deep parameters like Category, Company, Description)
  // ══════════════════════════════════════════════════════════════════════════════
  if (editingField) {
    let fieldTitle = "";
    let fieldDescription = "";
    let fieldContent: React.ReactNode = null;

    switch (editingField) {
      case "description":
        fieldTitle = t("detailPage.fields.description");
        fieldDescription = t("createModal.descriptions.description");
        fieldContent = (
          <div className="space-y-4 max-w-2xl">
            <Label htmlFor="task-desc" className="rtl:text-right block font-medium text-muted-foreground">
              {t("detailPage.fields.description")}
            </Label>
            <Textarea
              id="task-desc"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("createModal.descriptionPlaceholder")}
              className="resize-none rounded-2xl bg-muted/20 border-border/70 p-4 text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus
            />
          </div>
        );
        break;

      case "category":
        fieldTitle = t("detailPage.fields.category");
        fieldDescription = t("createModal.descriptions.category");
        fieldContent = (
          <div className="space-y-6 max-w-xl">
            <div className="flex flex-wrap gap-2">
              {[
                "P&ID FLOW",
                "MECHANICAL",
                "PIPING",
                "CIVIL",
                "ELECTRICAL",
                "INSTRUMENTATION",
                isRtl ? "یادداشت شخصی" : "Personal Note",
                isRtl ? "عمومی" : "General",
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer",
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-muted/30 text-foreground border-border/60 hover:bg-muted/70"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        );
        break;

      case "company":
        fieldTitle = t("detailPage.fields.company");
        fieldDescription = t("createModal.descriptions.company");
        fieldContent = (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {(["یورو اسلات پارس", "نانو پالایش سرام"] as const).map((comp) => (
              <div
                key={comp}
                onClick={() => setCompany(comp)}
                className={cn(
                  "p-5 rounded-2xl border text-start cursor-pointer transition-all",
                  company === comp
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-muted/20 border-border/60 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className={cn("size-5", company === comp ? "text-primary" : "text-muted-foreground")} />
                  {company === comp && <Check className="size-4 text-primary" />}
                </div>
                <div className="font-bold text-sm text-foreground">{comp}</div>
              </div>
            ))}
          </div>
        );
        break;

      case "scope":
        fieldTitle = t("detailPage.fields.scope");
        fieldDescription = t("createModal.descriptions.projectScope");
        fieldContent = (
          <div className="space-y-6 max-w-xl">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPersonal(false)}
                className={cn(
                  "p-4 rounded-2xl border text-start transition-all cursor-pointer",
                  !isPersonal ? "bg-primary/10 border-primary" : "bg-muted/20 border-border/60 hover:border-border"
                )}
              >
                <div className="font-bold text-sm text-foreground mb-1">{t("createModal.scopeTeam")}</div>
                <div className="text-xs text-muted-foreground">{t("createModal.teamWorkspace")}</div>
              </button>

              <button
                type="button"
                onClick={() => setIsPersonal(true)}
                className={cn(
                  "p-4 rounded-2xl border text-start transition-all cursor-pointer",
                  isPersonal ? "bg-primary/10 border-primary" : "bg-muted/20 border-border/60 hover:border-border"
                )}
              >
                <div className="font-bold text-sm text-foreground mb-1">{t("createModal.scopePersonal")}</div>
                <div className="text-xs text-muted-foreground">{t("createModal.personalWorkspace")}</div>
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-title" className="rtl:text-right block font-medium text-muted-foreground">
                {t("createModal.selectProjectLabel")}
              </Label>
              {availableProjects && availableProjects.length > 0 ? (
                <Combobox
                  options={[
                    { value: "", label: t("createModal.optionalProjectLink") },
                    ...availableProjects.map((p) => ({
                      value: p.id,
                      label: `${p.title} (${p.code})${p.organization ? ` • ${p.organization}` : ""}`,
                    })),
                  ]}
                  value={selectedProjectId}
                  onChange={(val) => {
                    setSelectedProjectId(val);
                    const found = availableProjects.find((x) => x.id === val);
                    if (found) {
                      setRelatedProjectTitle(found.title);
                      if (found.organization) {
                        setCompany(found.organization as any);
                      }
                    } else {
                      setRelatedProjectTitle("");
                    }
                  }}
                  placeholder={t("createModal.selectProjectPlaceholder")}
                  emptyText={t("createModal.noProjectsFound")}
                  className="h-11 rounded-xl bg-muted/20 border-border/60 rtl:text-right w-full"
                />
              ) : (
                <Input
                  id="project-title"
                  value={relatedProjectTitle}
                  onChange={(e) => setRelatedProjectTitle(e.target.value)}
                  placeholder={t("createModal.customProjectPlaceholder")}
                  className="h-11 rounded-xl bg-muted/20 border-border/60"
                />
              )}
            </div>
          </div>
        );
        break;

      case "hours":
        fieldTitle = t("detailPage.fields.hours");
        fieldDescription = t("createModal.descriptions.estimatedHours");
        fieldContent = (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="hours-est" className="rtl:text-right block font-medium text-muted-foreground">
                {t("drawer.hoursEstimated")}
              </Label>
              <Input
                id="hours-est"
                type="number"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="h-11 rounded-xl bg-muted/20 border-border/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours-log" className="rtl:text-right block font-medium text-muted-foreground">
                {t("drawer.hoursLogged")}
              </Label>
              <Input
                id="hours-log"
                type="number"
                min="0"
                value={loggedHours}
                onChange={(e) => setLoggedHours(e.target.value)}
                className="h-11 rounded-xl bg-muted/20 border-border/60"
              />
            </div>
          </div>
        );
        break;

      case "activity":
        fieldTitle = t("detailPage.fields.activity");
        fieldDescription = t("detailPage.activity");
        fieldContent = (
          <div className="space-y-3 max-w-2xl">
            {!task.activities || task.activities.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground">
                {t("detailPage.noActivities")}
              </div>
            ) : (
              task.activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex items-start gap-3 text-xs"
                >
                  <Activity className="size-4 text-zinc-900 dark:text-zinc-100 mt-0.5 shrink-0" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="font-semibold text-foreground flex items-center justify-between">
                      <span>{act.authorName}</span>
                      <span className="text-[10px] text-muted-foreground opacity-80">{act.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{act.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        );
        break;

      default:
        return null;
    }

    return (
      <div className="max-w-4xl mx-auto w-full py-8 px-4 animate-in slide-in-from-bottom-4 duration-300 fa-num">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted/60"
            onClick={() => setEditingField(null)}
          >
            <ArrowLeft className="size-6 text-foreground rtl:rotate-180" />
          </Button>
          <h2 className="text-2xl sm:text-3xl font-normal text-foreground">{fieldTitle}</h2>
        </div>

        <div className="ps-0 sm:ps-14">
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl">{fieldDescription}</p>

          <div className="bg-white dark:bg-card border border-border/60 rounded-[24px] p-6 sm:p-8 shadow-sm">
            {fieldContent}

            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setEditingField(null)}
                className="rounded-full px-6 font-medium text-muted-foreground hover:bg-muted/50"
              >
                {t("detailPage.close")}
              </Button>
              <Button
                onClick={async () => {
                  await persistChanges({
                    description: description.trim(),
                    category: category.trim(),
                    company,
                    relatedProjectId: selectedProjectId || undefined,
                    relatedProjectTitle: relatedProjectTitle.trim() || undefined,
                    isPersonal,
                    scope: isPersonal ? "personal" : "team",
                    estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
                    loggedHours: loggedHours ? Number(loggedHours) : 0,
                  });
                  setEditingField(null);
                }}
                disabled={isSaving}
                className="rounded-full px-8 font-medium gap-1.5"
              >
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                <span>{t("detailPage.saveAndClose")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN VIEW: PURE SEGMENTED-LIST ACCORDIONS WITH SMOOTH ANIMATIONS
  // ══════════════════════════════════════════════════════════════════════════════
  const statusInfo = getStatusInfo(status);
  const priorityInfo = getPriorityInfo(priority);

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-8 animate-in fade-in duration-300 fa-num space-y-6">
      {/* ── 1. Top Navigation Bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-muted/60"
            title={t("detailPage.backToBoard")}
          >
            <ArrowLeft className="size-6 text-foreground rtl:rotate-180" />
          </Button>

          {/* Breadcrumb Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted/80 text-foreground border border-border/50">
              {category}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {company}
            </span>
            {isPersonal ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {isRtl ? "شخصی" : "Personal"}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {isRtl ? "سازمانی" : "Team"}
              </span>
            )}
            {task.isManagerDefined && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <ShieldAlert className="size-3 text-zinc-900 dark:text-zinc-100" />
                <span>{t("tabs.manager")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="rounded-full gap-1.5 text-xs font-medium cursor-pointer h-9 px-3.5"
            title={t("detailPage.copyLink")}
          >
            {isCopied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">{t("detailPage.linkCopied")}</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 text-zinc-900 dark:text-zinc-100" />
                <span>{t("detailPage.copyLink")}</span>
              </>
            )}
          </Button>

          {!task.isManagerDefined && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="rounded-full gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer h-9 px-3.5"
            >
              <Trash2 className="size-3.5 text-rose-600" />
              <span>{t("drawer.deleteTask")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 2. SECTION 1: OVERVIEW & CONTROLS ACCORDION (Segmented, Collapsible with smooth motion) ── */}
      <div className="segmented-list w-full">
        {/* Accordion Header as segmented-item */}
        <button
          type="button"
          onClick={() => setIsOverviewOpen(!isOverviewOpen)}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 px-6 py-4.5 w-full outline-none cursor-pointer text-start",
            getSegmentedAccordionHeaderClass(isOverviewOpen, { isTopRounded: false })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
            <SlidersHorizontal className="size-5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <h2 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight truncate">
                {titleInput}
              </h2>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", statusInfo.badgeClass)}>
                {statusInfo.label}
              </span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", priorityInfo.badgeClass)}>
                {priorityInfo.label}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20">
                {progress}%
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <ChevronDown
              className={cn(
                "size-5 text-zinc-900 dark:text-zinc-100 transition-transform duration-300 ease-out",
                isOverviewOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Animated Expandable Overview Content */}
        <AnimatePresence initial={false}>
          {isOverviewOpen && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              {/* Item 1: Title & Description inline edit */}
              <div className="segmented-item no-hover-bg p-5 sm:p-6 space-y-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitleInline();
                        if (e.key === "Escape") {
                          setTitleInput(task.title);
                          setIsEditingTitle(false);
                        }
                      }}
                      className="h-11 text-lg font-bold bg-muted/30 border-primary rounded-xl"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveTitleInline}
                      className="rounded-xl h-9 px-3.5 font-semibold shrink-0"
                    >
                      {t("detailPage.inlineEditSave")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTitleInput(task.title);
                        setIsEditingTitle(false);
                      }}
                      className="rounded-xl h-9 px-3 shrink-0"
                    >
                      {t("detailPage.inlineEditCancel")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 group">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-snug">
                      {titleInput}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      className="size-7 rounded-lg flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-muted/70 opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      title={t("detailPage.editTitle")}
                    >
                      <Edit2 className="size-3.5 text-zinc-900 dark:text-zinc-100" />
                    </button>
                  </div>
                )}

                <div
                  onClick={() => setEditingField("description")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer leading-relaxed line-clamp-2"
                  title={t("detailPage.clickToEdit")}
                >
                  {description || <span className="italic opacity-60">{t("detailPage.noDescription")}</span>}
                </div>
              </div>

              {/* Item 2: Status & Priority Selector */}
              <div className="segmented-item no-hover-bg p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Status block */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border border-border/40">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>{t("detailPage.quickStatusUpdate")}</span>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", statusInfo.badgeClass)}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {(["pending", "in_progress", "review", "completed"] as TaskStatus[]).map((st) => {
                        const isActive = status === st;
                        const info = getStatusInfo(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleDirectStatusChange(st)}
                            className={cn(
                              "py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-2xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                            title={info.label}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0",
                                isActive ? "bg-white" : info.dotColor
                              )}
                            />
                            <span className="truncate">{info.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority block */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border border-border/40">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>{t("detailPage.quickPriorityUpdate")}</span>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", priorityInfo.badgeClass)}>
                        {priorityInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => {
                        const isActive = priority === p;
                        const info = getPriorityInfo(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleDirectPriorityChange(p)}
                            className={cn(
                              "py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-center",
                              isActive
                                ? cn(info.badgeClass, "font-bold shadow-2xs")
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                          >
                            {info.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Item 3: Progress Track with Auto / Manual toggle */}
              <div className="segmented-item no-hover-bg p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">{t("detailPage.fields.progress")}:</span>
                    <span className="font-extrabold text-foreground text-sm">{progress}%</span>
                  </div>

                  {/* Auto vs Manual Mode Switcher */}
                  <button
                    type="button"
                    onClick={() => setIsAutoProgress(!isAutoProgress)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                      isAutoProgress
                        ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                        : "bg-muted/60 text-muted-foreground border-border/40 hover:bg-muted"
                    )}
                    title={t("detailPage.toggleAutoProgress")}
                  >
                    <Sparkles className="size-3 text-zinc-900 dark:text-zinc-100" />
                    <span>
                      {isAutoProgress
                        ? `${t("detailPage.autoProgress")} (${completedSubtasksCount}/${subtasks.length})`
                        : t("detailPage.manualProgress")}
                    </span>
                  </button>
                </div>

                <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden border border-border/30">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {!isAutoProgress && (
                  <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-150">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleDirectProgressChange(val)}
                        className={cn(
                          "flex-1 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer",
                          progress === val
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted"
                        )}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Item 4: Due Date & Lead Assignee */}
              <div className="segmented-item no-hover-bg p-4 sm:p-5 rounded-b-[32px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Due Date Indicator with Toggle */}
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-4 text-zinc-900 dark:text-zinc-100" />
                      <span className="text-xs text-muted-foreground font-medium">{t("detailPage.fields.dueDate")}:</span>
                      <span className="text-xs font-bold text-foreground">{dueDate || t("detailPage.notSet")}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {showDatePicker ? t("detailPage.close") : t("detailPage.clickToEdit")}
                    </button>
                  </div>

                  {/* Lead Assignee Pill */}
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-6 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                          {(assignees[0]?.name || "س").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{assignees[0]?.name || "سعید جلیلی"}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{assignees[0]?.role || "لیدر پروژه"}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {t("detailPage.leadAssignee")}
                    </span>
                  </div>
                </div>

                {/* Embedded DatePicker dropdown if toggled */}
                {showDatePicker && (
                  <div className="p-4 mt-3 rounded-2xl bg-white dark:bg-card border border-border/70 shadow-sm flex flex-col items-center gap-3 animate-in fade-in duration-150">
                    <DatePicker
                      value={dueDateObj}
                      onChange={(d) => setDueDateObj(d)}
                    />
                    <div className="flex items-center gap-2 text-xs flex-wrap justify-center">
                      {[
                        { days: 3, label: "+۳ روز" },
                        { days: 7, label: "+۱ هفته" },
                        { days: 14, label: "+۲ هفته" },
                        { days: 30, label: "+۱ ماه" },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + preset.days);
                            setDueDateObj(d);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. SECTION 2: UNIFIED OPERATIONAL ACCORDION WITH 3 TABS (Tasks, Comments, Files) ── */}
      <div className="segmented-list w-full">
        {/* Accordion Header as segmented-item */}
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 px-6 py-4.5 w-full outline-none cursor-pointer text-start",
            getSegmentedAccordionHeaderClass(isWorkspaceOpen, { isTopRounded: false })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
            <Layers className="size-5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight truncate">
                {t("detailPage.workspaceSectionTitle")}
              </h3>
              {/* 3 mini summary badges */}
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted/80 text-foreground border border-border/40">
                {subtasks.length} {isRtl ? "اقدام" : "tasks"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted/80 text-foreground border border-border/40">
                {task.comments?.length || 0} {isRtl ? "نظر" : "comments"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted/80 text-foreground border border-border/40">
                {task.attachments?.length || 0} {isRtl ? "پیوست" : "files"}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <ChevronDown
              className={cn(
                "size-5 text-zinc-900 dark:text-zinc-100 transition-transform duration-300 ease-out",
                isWorkspaceOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Animated Expandable Body: Three Tabs Side-by-Side + Tab Content */}
        <AnimatePresence initial={false}>
          {isWorkspaceOpen && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden rounded-b-[32px]"
            >
              <div className="segmented-item no-hover-bg p-5 sm:p-7 w-full space-y-6 rounded-b-[32px]">
                {/* ── Tabs Row (Simple, concise text-only tabs like main dashboard) ── */}
                <div className="flex items-center justify-start gap-6 sm:gap-8 border-b border-border/40 pb-0">
                  {[
                    { id: "subtasks", label: t("detailPage.tabSubtasks") },
                    { id: "comments", label: t("detailPage.tabComments") },
                    { id: "documents", label: t("detailPage.tabAttachments") },
                  ].map((tab) => {
                    const isActive = activeWorkspaceTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveWorkspaceTab(tab.id as any)}
                        className={cn(
                          "relative pb-3 text-sm font-semibold transition-colors outline-none cursor-pointer select-none whitespace-nowrap shrink-0",
                          isActive
                            ? "text-primary font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span>{tab.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="workspace-active-tab-indicator"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.5,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ── Tab Content Views with Smooth Transition ── */}
                <AnimatePresence mode="wait">
                  {/* View 1: Subtasks */}
                  {activeWorkspaceTab === "subtasks" && (
                    <motion.div
                      key="subtasks-tab"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      {/* Header row with mini progress */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground font-semibold">
                          {completedSubtasksCount} از {subtasks.length} اقدام تکمیل شده است
                        </div>
                        <div className="w-28 bg-muted/60 rounded-full h-2 overflow-hidden border border-border/30">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: subtasks.length > 0 ? `${(completedSubtasksCount / subtasks.length) * 100}%` : "0%",
                            }}
                          />
                        </div>
                      </div>

                      {/* Quick Add Subtask Input */}
                      <div className="flex items-center gap-2">
                        <Input
                          value={newSubtaskInput}
                          onChange={(e) => setNewSubtaskInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubtaskLocal();
                            }
                          }}
                          placeholder={t("subtasks.placeholder")}
                          className="h-11 rounded-xl bg-muted/20 border-border/60 text-xs sm:text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleAddSubtaskLocal}
                          className="rounded-xl h-11 px-4 text-xs font-semibold gap-1.5 shrink-0"
                        >
                          <Plus className="size-4" />
                          <span>{t("subtasks.add")}</span>
                        </Button>
                      </div>

                      {/* Checklist Items */}
                      <div className="space-y-2 pt-1">
                        {subtasks.length === 0 ? (
                          <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground">
                            {t("detailPage.noSubtasks")}
                          </div>
                        ) : (
                          subtasks.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors group"
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleSubtaskLocal(sub.id, !sub.completed)}
                                className="flex items-center gap-3 text-start flex-1 min-w-0 cursor-pointer"
                              >
                                {sub.completed ? (
                                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="size-5 text-muted-foreground/60 shrink-0 group-hover:text-primary transition-colors" />
                                )}
                                <span
                                  className={cn(
                                    "text-xs sm:text-sm font-medium transition-all",
                                    sub.completed ? "line-through text-muted-foreground" : "text-foreground"
                                  )}
                                >
                                  {sub.title}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveSubtaskLocal(sub.id)}
                                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                title={t("collaborators.remove")}
                              >
                                <Trash2 className="size-3.5 text-zinc-900 dark:text-zinc-100" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* View 2: Comments */}
                  {activeWorkspaceTab === "comments" && (
                    <motion.div
                      key="comments-tab"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <TaskCommentThread
                        taskId={task.id}
                        comments={task.comments || []}
                        onAddComment={onAddComment}
                        onAddReply={onAddReply}
                      />
                    </motion.div>
                  )}

                  {/* View 3: Documents / Attachments */}
                  {activeWorkspaceTab === "documents" && (
                    <motion.div
                      key="documents-tab"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <TaskAttachmentsSection
                        taskId={task.id}
                        attachments={task.attachments || []}
                        onUploadAttachment={onUploadAttachment}
                        onDeleteAttachment={onDeleteAttachment}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 4. SECTION 3: SYSTEM IDENTITY & STATIC METADATA ACCORDION ── */}
      <div className="segmented-list w-full">
        {/* Header as authentic segmented-item */}
        <button
          type="button"
          onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 px-6 py-4.5 w-full outline-none cursor-pointer text-start",
            getSegmentedAccordionHeaderClass(isMetadataExpanded, { isTopRounded: false })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
            <Fingerprint className="size-5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate">
                {t("detailPage.systemMetadataTitle")}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/40">
                {t("detailPage.readOnly")}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <ChevronDown
              className={cn(
                "size-5 text-zinc-900 dark:text-zinc-100 transition-transform duration-300 ease-out",
                isMetadataExpanded && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* When metadata accordion is open with smooth motion */}
        <AnimatePresence initial={false}>
          {isMetadataExpanded && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              {/* 1. Task ID (IMMUTABLE) */}
              <div className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none h-[64px] bg-muted/10">
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <Lock className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.taskId")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40 truncate">
                    {task.id}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded">
                    {t("detailPage.readOnly")}
                  </span>
                </div>
              </div>

              {/* 2. Creator (IMMUTABLE) */}
              <div className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none h-[64px] bg-muted/10">
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <Lock className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.creator")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-xs sm:text-sm text-foreground truncate px-2 font-semibold">
                    {task.creatorName || (isRtl ? "کاربر سیستم" : "System User")}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded">
                    {t("detailPage.readOnly")}
                  </span>
                </div>
              </div>

              {/* 3. Registration Date (IMMUTABLE) */}
              <div className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none h-[64px] bg-muted/10">
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <Lock className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.createdDate")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground truncate px-2">
                    {task.startDate || "۱۴۰۳/۰۸/۰۱"}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded">
                    {t("detailPage.readOnly")}
                  </span>
                </div>
              </div>

              {/* 4. Scope & Project (EDITABLE) */}
              <div
                className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none cursor-pointer group h-[64px]"
                onClick={() => setEditingField("scope")}
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <FolderGit2 className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.fields.scope")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground text-start truncate px-2">
                    {relatedProjectTitle || (isPersonal ? (isRtl ? "تسک شخصی" : "Personal Task") : (isRtl ? "تسک سازمانی" : "Team Task"))}
                  </span>
                  <ChevronRight className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* 5. Company (EDITABLE) */}
              <div
                className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none cursor-pointer group h-[64px]"
                onClick={() => setEditingField("company")}
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <Building2 className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.fields.company")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground text-start truncate px-2">
                    {company}
                  </span>
                  <ChevronRight className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* 6. Technical Category (EDITABLE) */}
              <div
                className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none cursor-pointer group h-[64px]"
                onClick={() => setEditingField("category")}
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <Tag className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.fields.category")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted/80 text-foreground border border-border/40 truncate">
                    {category}
                  </span>
                  <ChevronRight className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* 7. Workload Hours (EDITABLE) */}
              <div
                className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none cursor-pointer group h-[64px]"
                onClick={() => setEditingField("hours")}
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <Clock className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.fields.hours")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground text-start truncate px-2">
                    {estimatedHours ? `${estimatedHours} ساعت` : t("detailPage.notSet")}
                    {loggedHours ? ` (ثبت شده: ${loggedHours}h)` : ""}
                  </span>
                  <ChevronRight className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* 8. Activity History (VIEWABLE) */}
              <div
                className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none cursor-pointer group h-[64px] rounded-b-[32px]"
                onClick={() => setEditingField("activity")}
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
                <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                  <Activity className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {t("detailPage.fields.activity")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground text-start truncate px-2">
                    {task.activities?.length || 0} {isRtl ? "رویداد ثبت شده" : "logged events"}
                  </span>
                  <ChevronRight className="size-4 text-zinc-900 dark:text-zinc-100 shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 5. SECTION 4: TEAM & COLLABORATORS ACCORDION ── */}
      <div className="segmented-list w-full">
        {/* Header as authentic segmented-item */}
        <button
          type="button"
          onClick={() => setIsTeamOpen(!isTeamOpen)}
          className={cn(
            "segmented-item group relative flex items-center justify-between gap-3.5 px-6 py-4.5 w-full outline-none cursor-pointer text-start",
            getSegmentedAccordionHeaderClass(isTeamOpen, { isTopRounded: false })
          )}
        >
          <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
            <Users className="size-5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate">
                {t("detailPage.teamSectionTitle")}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted/80 text-foreground border border-border/40">
                {assignees.length}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsTeamOpen(true);
                setIsAddingCollab(!isAddingCollab);
              }}
              className="text-xs font-semibold text-foreground hover:underline cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/40"
            >
              <Plus className="size-3.5 text-zinc-900 dark:text-zinc-100" />
              <span>{t("collaborators.add")}</span>
            </span>
            <ChevronDown
              className={cn(
                "size-5 text-zinc-900 dark:text-zinc-100 transition-transform duration-300 ease-out",
                isTeamOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* When team is open with smooth motion */}
        <AnimatePresence initial={false}>
          {isTeamOpen && (
            <motion.div
              initial={segmentedAccordionMotion.initial}
              animate={segmentedAccordionMotion.animate}
              exit={segmentedAccordionMotion.exit}
              className="overflow-hidden flex flex-col gap-[2px] rounded-b-[32px]"
            >
              {isAddingCollab && (
                <div className="segmented-item no-hover-bg p-4 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <Input
                      value={newCollabName}
                      onChange={(e) => setNewCollabName(e.target.value)}
                      placeholder={t("detailPage.collabName")}
                      className="sm:col-span-2 h-10 rounded-xl bg-muted/20 border-border/60 text-xs"
                    />
                    <Input
                      value={newCollabRole}
                      onChange={(e) => setNewCollabRole(e.target.value)}
                      placeholder={t("detailPage.collabRole")}
                      className="sm:col-span-2 h-10 rounded-xl bg-muted/20 border-border/60 text-xs"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCollaboratorLocal}
                      className="rounded-xl h-10 text-xs font-semibold shrink-0"
                    >
                      {t("detailPage.addCollabBtn")}
                    </Button>
                  </div>
                </div>
              )}

              {assignees.map((assignee, idx) => (
                <div
                  key={assignee.id}
                  className={cn(
                    "segmented-item no-hover-bg shadow-none flex items-center justify-between px-6 relative outline-none h-[64px]",
                    idx === assignees.length - 1 && "rounded-b-[32px]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 border border-border/50">
                      <AvatarFallback className="bg-muted text-foreground font-bold text-xs">
                        {assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <span>{assignee.name}</span>
                        {assignee.isLead && (
                          <span className="text-[10px] font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/40">
                            {t("detailPage.leadAssignee")}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{assignee.role}</div>
                    </div>
                  </div>

                  {!assignee.isLead && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaboratorLocal(assignee.id)}
                      className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title={t("collaborators.remove")}
                    >
                      <Trash2 className="size-3.5 text-zinc-900 dark:text-zinc-100" />
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
