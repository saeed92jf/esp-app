// src/modules/tasks/components/task-create-view.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  User,
  Building2,
  ShieldAlert,
  Users,
  UserCheck,
  Briefcase,
  Plus,
  Trash2,
  ListChecks,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  Check,
  ChevronRight,
  Loader2,
  FolderOpen,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import {
  TaskItem,
  TaskPriority,
  TaskStatus,
  SubTask,
  TaskAssignee,
  TaskScope,
} from "../types/tasks.types";
import type { ProjectItem } from "@/modules/projects/types/projects.types";
import { cn } from "@/lib/utils";

export type TaskEditingField =
  | null
  | "title"
  | "projectScope"
  | "description"
  | "subtasks"
  | "dueDate"
  | "priority"
  | "estimatedHours"
  | "company"
  | "category"
  | "collaborators"
  | "managerDirective";

export interface TaskCreateViewProps {
  onCreateTask: (
    data: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">
  ) => Promise<TaskItem>;
  onCancel?: () => void;
  onSuccess?: (createdTask: TaskItem) => void;
  categories: string[];
  companies?: string[];
  defaultStatus?: TaskStatus;
  initialScope?: TaskScope;
  currentUserName?: string;
  isAdmin?: boolean;
  userInvolvedProjects?: ProjectItem[];
}

export function TaskCreateView({
  onCreateTask,
  onCancel,
  onSuccess,
  categories,
  companies = ["یورو اسلات پارس", "نانو پالایش سرام"],
  defaultStatus = "pending",
  initialScope = "team",
  currentUserName,
  isAdmin = false,
  userInvolvedProjects = [],
}: TaskCreateViewProps) {
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const userLead = currentUserName || "سعید جلیلی";

  // Active editor field state (matches profile-page.tsx pattern)
  const [editingField, setEditingField] = useState<TaskEditingField>(null);

  // Non-admins are strictly locked to personal scope
  const [scope, setScope] = useState<TaskScope>(isAdmin ? initialScope : "personal");

  // Personal task mode: project-linked vs standalone
  const [personalType, setPersonalType] = useState<"project" | "standalone">("project");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [relatedProjectTitle, setRelatedProjectTitle] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "P&ID FLOW");
  const [company, setCompany] = useState(companies[0] || "یورو اسلات پارس");
  const [priority, setPriority] = useState<TaskPriority>("high");

  // DatePicker state (initialized to 14 days from now)
  const [dueDateObj, setDueDateObj] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  });
  const [dueDate, setDueDate] = useState<string>("");
  const [timelineDate, setTimelineDate] = useState<string>("");

  const [estimatedHours, setEstimatedHours] = useState("16");
  const [initialProgress, setInitialProgress] = useState(0);
  const [isManagerDefined, setIsManagerDefined] = useState(isAdmin);

  // Assignees for admin team scope
  const [assigneeName, setAssigneeName] = useState(userLead);
  const [assigneeRole, setAssigneeRole] = useState(isAdmin ? "مدیر پروژه" : "کارشناس مهندسی");
  const [collaborators, setCollaborators] = useState<TaskAssignee[]>([
    {
      id: "lead",
      name: userLead,
      role: isAdmin ? "مدیر پروژه" : "کارشناس مهندسی",
      isLead: true,
      companies: ["یورو اسلات پارس", "نانو پالایش سرام"],
    },
  ]);
  const [extraCollabName, setExtraCollabName] = useState("");
  const [extraCollabRole, setExtraCollabRole] = useState("");

  // Subtasks / Checklist
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync date strings from Date object
  useEffect(() => {
    if (dueDateObj) {
      const { year, month, day } = getJalaliDate(dueDateObj);
      setDueDate(`${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`);
      const monthNamesFa = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
      ];
      setTimelineDate(`${day} ${monthNamesFa[month - 1] || ""}`);
    } else {
      setDueDate("");
      setTimelineDate("");
    }
  }, [dueDateObj]);

  // Project pre-selection for personal tasks
  useEffect(() => {
    if (userInvolvedProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(userInvolvedProjects[0].id);
      setRelatedProjectTitle(userInvolvedProjects[0].title);
      if (userInvolvedProjects[0].organization) {
        setCompany(userInvolvedProjects[0].organization);
      }
    }
  }, [userInvolvedProjects, selectedProjectId]);

  const handleAddCollaborator = () => {
    if (!extraCollabName.trim()) return;
    setCollaborators((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        name: extraCollabName.trim(),
        role: extraCollabRole.trim() || (isRtl ? "همکار اجرایی" : "Collaborator"),
      },
    ]);
    setExtraCollabName("");
    setExtraCollabRole("");
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `sub-${Date.now()}`, title: subtaskInput.trim(), completed: false },
    ]);
    setSubtaskInput("");
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleQuickAddDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDateObj(d);
  };

  const handleFinalSubmit = async () => {
    if (!title.trim()) {
      setEditingField("title");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const isPersonalTask = !isAdmin || scope === "personal";
      const finalScope: TaskScope = isPersonalTask ? "personal" : "team";

      let linkedProjId: string | undefined = undefined;
      let linkedProjTitle: string | undefined = undefined;

      if (isPersonalTask && personalType === "project") {
        linkedProjId = selectedProjectId || (relatedProjectTitle ? "proj-custom" : undefined);
        linkedProjTitle = relatedProjectTitle.trim() || undefined;
      }

      const created = await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || (isPersonalTask ? (isRtl ? "یادداشت شخصی" : "Personal Note") : (isRtl ? "عمومی" : "General")),
        company: (company as any) || "یورو اسلات پارس",
        priority,
        status: defaultStatus,
        scope: finalScope,
        isPersonal: isPersonalTask,
        relatedProjectId: linkedProjId,
        relatedProjectTitle: linkedProjTitle,
        createdBy: isPersonalTask ? "user" : (isManagerDefined && isAdmin ? "manager" : "user"),
        creatorName: isPersonalTask
          ? userLead
          : (isManagerDefined && isAdmin ? (isRtl ? "مهندس علیرضا رضایی (مدیر مهندسی)" : "Eng. Alireza Rezaei (Engineering Dir)") : userLead),
        assignedToName: isPersonalTask ? userLead : (assigneeName.trim() || userLead),
        assignedToRole: isPersonalTask ? (isRtl ? "شخصی" : "Personal") : (assigneeRole.trim() || (isRtl ? "کارشناس مهندسی" : "Engineering Specialist")),
        assignees: isPersonalTask
          ? [
              {
                id: "usr-self",
                name: userLead,
                role: isRtl ? "شخصی" : "Personal",
                isLead: true,
                companies: ["یورو اسلات پارس", "نانو پالایش سرام"],
              },
            ]
          : collaborators.length > 0
          ? collaborators
          : [
              {
                id: "default",
                name: assigneeName || userLead,
                role: assigneeRole || (isRtl ? "کارشناس مهندسی" : "Engineering Specialist"),
                isLead: true,
              },
            ],
        progressPercent: initialProgress,
        timelineDate: timelineDate.trim() || undefined,
        milestoneLabel: title.trim(),
        dueDate: dueDate.trim() || undefined,
        startDate: new Intl.DateTimeFormat(isRtl ? "fa-IR" : "en-US").format(new Date()),
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        loggedHours: 0,
        isManagerDefined: isPersonalTask ? false : (isAdmin && isManagerDefined),
        subtasks,
      });

      if (onSuccess) {
        onSuccess(created);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPersonalActive = !isAdmin || scope === "personal";

  // Common engineering category suggestions
  const defaultCategorySuggestions = [
    "P&ID FLOW",
    "MECHANICAL",
    "PIPING",
    "CIVIL",
    "ELECTRICAL",
    "INSTRUMENTATION",
    isRtl ? "یادداشت شخصی" : "Personal Note",
    isRtl ? "عمومی" : "General",
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER SUB-VIEW WHEN AN ITEM IS BEING EDITED (Exact profile-page.tsx structure)
  // ══════════════════════════════════════════════════════════════════════════════
  if (editingField) {
    let fieldTitle = "";
    let fieldDescription = "";
    let fieldContent: React.ReactNode = null;

    switch (editingField) {
      case "title":
        fieldTitle = t("createModal.fields.title");
        fieldDescription = t("createModal.descriptions.title");
        fieldContent = (
          <div className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="task-title" className="rtl:text-right block font-medium text-muted-foreground">
                {t("createModal.fields.title")}
              </Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRtl ? "مثال: بررسی و مدلسازی P&ID فاز ۲..." : "e.g., Review & Model P&ID Phase 2..."}
                className="h-14 bg-transparent border-t-0 border-x-0 border-b-2 border-primary/20 rounded-none px-0 text-lg focus-visible:ring-0 focus-visible:border-primary shadow-none"
                autoFocus
              />
            </div>
          </div>
        );
        break;

      case "projectScope":
        fieldTitle = t("createModal.fields.projectScope");
        fieldDescription = t("createModal.descriptions.projectScope");
        fieldContent = (
          <div className="space-y-6 max-w-2xl">
            {/* If admin: can choose team vs personal */}
            {isAdmin && (
              <div className="space-y-3 pb-4 border-b border-border/40">
                <Label className="rtl:text-right block font-medium text-muted-foreground">
                  {t("roles.roleMode")}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setScope("personal")}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                      scope === "personal"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 hover:border-primary/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className="size-5 text-primary" />
                      <div>
                        <div className="font-semibold text-sm">{t("createModal.scopePersonal")}</div>
                        <div className="text-xs text-muted-foreground">{t("createModal.personalWorkspace")}</div>
                      </div>
                    </div>
                    {scope === "personal" && <Check className="size-4 text-primary stroke-[3]" />}
                  </div>

                  <div
                    onClick={() => setScope("team")}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                      scope === "team"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 hover:border-primary/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="size-5 text-primary" />
                      <div>
                        <div className="font-semibold text-sm">{t("createModal.scopeTeam")}</div>
                        <div className="text-xs text-muted-foreground">{t("createModal.teamWorkspace")}</div>
                      </div>
                    </div>
                    {scope === "team" && <Check className="size-4 text-primary stroke-[3]" />}
                  </div>
                </div>
              </div>
            )}

            {/* If personal scope: choose Project-linked vs Standalone */}
            {isPersonalActive && (
              <div className="space-y-4">
                <Label className="rtl:text-right block font-medium text-muted-foreground">
                  {t("createModal.personalTypeLabel")}
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPersonalType("project")}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                      personalType === "project"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 hover:border-primary/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="size-5 text-primary" />
                      <div>
                        <div className="font-semibold text-sm">{t("createModal.personalTypeProject")}</div>
                        <div className="text-xs text-muted-foreground">{t("createModal.projectLinked")}</div>
                      </div>
                    </div>
                    {personalType === "project" && <Check className="size-4 text-primary stroke-[3]" />}
                  </div>

                  <div
                    onClick={() => {
                      setPersonalType("standalone");
                      setSelectedProjectId("");
                      setRelatedProjectTitle("");
                    }}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                      personalType === "standalone"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 hover:border-primary/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <User className="size-5 text-primary" />
                      <div>
                        <div className="font-semibold text-sm">{t("createModal.personalTypeStandalone")}</div>
                        <div className="text-xs text-muted-foreground">{t("createModal.personalStandalone")}</div>
                      </div>
                    </div>
                    {personalType === "standalone" && <Check className="size-4 text-primary stroke-[3]" />}
                  </div>
                </div>

                {/* Project Selection if Project-linked */}
                {personalType === "project" && (
                  <div className="space-y-3 pt-3">
                    <Label className="rtl:text-right block font-medium text-muted-foreground text-xs">
                      {t("createModal.selectProjectLabel")}
                    </Label>

                    {userInvolvedProjects.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {userInvolvedProjects.map((p) => {
                          const isSelected = selectedProjectId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedProjectId(p.id);
                                setRelatedProjectTitle(p.title);
                                if (p.organization) setCompany(p.organization);
                              }}
                              className={cn(
                                "p-3 rounded-xl border text-start cursor-pointer transition-all flex items-center justify-between",
                                isSelected
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border/50 hover:bg-muted/40 text-muted-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <FolderOpen className="size-4 text-primary shrink-0" />
                                <span className="text-sm font-medium truncate">{p.title}</span>
                                {p.organization && (
                                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                                    {p.organization}
                                  </span>
                                )}
                              </div>
                              {isSelected && <Check className="size-4 text-primary stroke-[3] shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-1.5 pt-1">
                      <Input
                        value={relatedProjectTitle}
                        onChange={(e) => {
                          setRelatedProjectTitle(e.target.value);
                          if (!e.target.value) setSelectedProjectId("");
                        }}
                        placeholder={t("createModal.customProjectPlaceholder")}
                        className="h-12 rounded-xl bg-card border-border/60 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        break;

      case "description":
        fieldTitle = t("createModal.fields.description");
        fieldDescription = t("createModal.descriptions.description");
        fieldContent = (
          <div className="space-y-4 max-w-2xl">
            <Label htmlFor="task-desc" className="rtl:text-right block font-medium text-muted-foreground">
              {t("createModal.fields.description")}
            </Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("createModal.descriptionPlaceholder")}
              rows={6}
              className="resize-none rounded-2xl bg-muted/20 border-border/60 p-4 text-base focus-visible:ring-1 focus-visible:border-primary shadow-none"
              autoFocus
            />
          </div>
        );
        break;

      case "subtasks":
        fieldTitle = t("createModal.fields.subtasks");
        fieldDescription = t("createModal.descriptions.subtasks");
        fieldContent = (
          <div className="space-y-6 max-w-2xl">
            {/* Add Subtask Input */}
            <div className="flex items-center gap-2">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder={t("createModal.subtaskPlaceholder")}
                className="h-12 text-sm rounded-xl bg-card border-border/60 flex-1"
                autoFocus
              />
              <Button
                type="button"
                onClick={handleAddSubtask}
                disabled={!subtaskInput.trim()}
                className="h-12 px-5 rounded-xl text-sm font-semibold gap-1.5 shrink-0"
              >
                <Plus className="size-4" />
                <span>{t("createModal.addSubtask")}</span>
              </Button>
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 ? (
              <div className="space-y-2 pt-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-2xl border transition-colors",
                      st.completed
                        ? "bg-muted/20 border-border/40 text-muted-foreground line-through"
                        : "bg-card border-border/60 text-foreground shadow-2xs"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-3 text-start flex-1 cursor-pointer outline-none min-w-0"
                    >
                      <div
                        className={cn(
                          "size-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                          st.completed
                            ? "bg-primary border-primary text-white"
                            : "border-border/80 hover:border-primary"
                        )}
                      >
                        {st.completed && <Check className="size-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-medium truncate">{st.title}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0 ms-2"
                      title={isRtl ? "حذف زیرتسک" : "Delete subtask"}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-border/60 text-center text-sm text-muted-foreground">
                {t("createModal.noSubtasks")}
              </div>
            )}
          </div>
        );
        break;

      case "dueDate":
        fieldTitle = t("createModal.fields.dueDate");
        fieldDescription = t("createModal.descriptions.dueDate");
        fieldContent = (
          <div className="space-y-6 max-w-lg">
            <div className="space-y-2">
              <Label className="rtl:text-right block font-medium text-muted-foreground">
                {t("createModal.fields.dueDate")}
              </Label>
              <DatePicker
                value={dueDateObj}
                onChange={(d) => setDueDateObj(d)}
                placeholder={t("createModal.dueDate")}
                className="w-full h-12 rounded-xl bg-muted/20 border-border/60 text-sm px-4 shadow-none font-medium"
              />
            </div>

            {/* Quick offset buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs text-muted-foreground block">
                {isRtl ? "انتخاب سریع بازه زمانی:" : "Quick timeline select:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { days: 3, label: isRtl ? "+۳ روز" : "+3 days" },
                  { days: 7, label: isRtl ? "+۱ هفته" : "+1 week" },
                  { days: 14, label: isRtl ? "+۲ هفته" : "+2 weeks" },
                  { days: 30, label: isRtl ? "+۱ ماه" : "+1 month" },
                ].map((item) => (
                  <Button
                    key={item.days}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAddDays(item.days)}
                    className="rounded-full text-xs font-medium px-4 h-8 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                  >
                    <CalendarClock className="size-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {dueDate && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-sm text-primary flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{t("createModal.selectedDateLabel", { date: dueDate })}</span>
              </div>
            )}
          </div>
        );
        break;

      case "priority":
        fieldTitle = t("createModal.fields.priority");
        fieldDescription = t("createModal.descriptions.priority");
        fieldContent = (
          <div className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: "low",
                  label: t("priority.low"),
                  colorClass: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
                  desc: isRtl ? "بدون فوریت زمانی خاص" : "Low urgency",
                },
                {
                  value: "medium",
                  label: t("priority.medium"),
                  colorClass: "text-amber-600 bg-amber-500/10 border-amber-500/30",
                  desc: isRtl ? "اولویت استاندارد کاری" : "Standard urgency",
                },
                {
                  value: "high",
                  label: t("priority.high"),
                  colorClass: "text-orange-600 bg-orange-500/10 border-orange-500/30",
                  desc: isRtl ? "مهم و نیازمند پیگیری روزانه" : "Important, daily track",
                },
                {
                  value: "urgent",
                  label: t("priority.urgent"),
                  colorClass: "text-rose-600 bg-rose-500/10 border-rose-500/30",
                  desc: isRtl ? "فوری و در اولویت اول" : "Highest immediate priority",
                },
              ].map((p) => {
                const isSelected = priority === p.value;
                return (
                  <div
                    key={p.value}
                    onClick={() => setPriority(p.value as TaskPriority)}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground shadow-xs"
                        : "border-border/60 hover:border-primary/40 text-muted-foreground"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border shrink-0", p.colorClass)}>
                          {p.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    {isSelected && <Check className="size-4 text-primary stroke-[3]" />}
                  </div>
                );
              })}
            </div>
          </div>
        );
        break;

      case "estimatedHours":
        fieldTitle = t("createModal.fields.estimatedHours");
        fieldDescription = t("createModal.descriptions.estimatedHours");
        fieldContent = (
          <div className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="estimated-hours" className="rtl:text-right block font-medium text-muted-foreground">
                {t("createModal.fields.estimatedHours")}
              </Label>
              <Input
                id="estimated-hours"
                type="number"
                min="1"
                max="500"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="h-14 bg-transparent border-t-0 border-x-0 border-b-2 border-primary/20 rounded-none px-0 text-xl font-mono focus-visible:ring-0 focus-visible:border-primary shadow-none"
                autoFocus
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs text-muted-foreground block">
                {isRtl ? "مقادیر متداول تخمین زمان:" : "Quick estimate presets:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { h: "4", label: isRtl ? "۴ ساعت" : "4h" },
                  { h: "8", label: isRtl ? "۸ ساعت (یک روز)" : "8h (1 day)" },
                  { h: "16", label: isRtl ? "۱۶ ساعت (دو روز)" : "16h (2 days)" },
                  { h: "40", label: isRtl ? "۴۰ ساعت (یک هفته)" : "40h (1 week)" },
                ].map((preset) => (
                  <Button
                    key={preset.h}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEstimatedHours(preset.h)}
                    className={cn(
                      "rounded-full text-xs font-medium px-4 h-8",
                      estimatedHours === preset.h && "border-primary bg-primary/10 text-primary"
                    )}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
        break;

      case "company":
        fieldTitle = t("createModal.fields.company");
        fieldDescription = t("createModal.descriptions.company");
        fieldContent = (
          <div className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companies.map((comp) => {
                const isSelected = company === comp;
                return (
                  <div
                    key={comp}
                    onClick={() => setCompany(comp)}
                    className={cn(
                      "p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground shadow-xs"
                        : "border-border/60 hover:border-primary/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className={cn("size-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-semibold text-sm">{comp}</span>
                    </div>
                    {isSelected && (
                      <div className="size-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        break;

      case "category":
        fieldTitle = t("createModal.fields.category");
        fieldDescription = t("createModal.descriptions.category");
        fieldContent = (
          <div className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="task-category" className="rtl:text-right block font-medium text-muted-foreground">
                {t("createModal.fields.category")}
              </Label>
              <Input
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="P&ID FLOW..."
                className="h-14 bg-transparent border-t-0 border-x-0 border-b-2 border-primary/20 rounded-none px-0 text-lg focus-visible:ring-0 focus-visible:border-primary shadow-none"
                autoFocus
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs text-muted-foreground block">
                {isRtl ? "دسته‌بندی‌های متداول مهندسی:" : "Common discipline tags:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {defaultCategorySuggestions.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "rounded-full text-xs font-medium px-3.5 h-8",
                      category === cat && "border-primary bg-primary/10 text-primary"
                    )}
                  >
                    <Tag className="size-3 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
        break;

      case "collaborators":
        fieldTitle = t("createModal.fields.assignees");
        fieldDescription = t("createModal.descriptions.assignees");
        fieldContent = (
          <div className="space-y-6 max-w-2xl">
            {/* Primary Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border/40">
              <div className="space-y-2">
                <Label className="rtl:text-right block font-medium text-muted-foreground">
                  {t("createModal.assignee")}
                </Label>
                <Input
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  className="h-12 rounded-xl bg-card border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label className="rtl:text-right block font-medium text-muted-foreground">
                  {t("collaborators.role")}
                </Label>
                <Input
                  value={assigneeRole}
                  onChange={(e) => setAssigneeRole(e.target.value)}
                  className="h-12 rounded-xl bg-card border-border/60"
                />
              </div>
            </div>

            {/* Extra Collaborators */}
            <div className="space-y-3">
              <Label className="rtl:text-right block font-medium text-muted-foreground">
                {t("createModal.collaborators")}
              </Label>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                  value={extraCollabName}
                  onChange={(e) => setExtraCollabName(e.target.value)}
                  placeholder={t("createModal.newCollabNamePlaceholder")}
                  className="h-11 rounded-xl bg-card border-border/60 text-sm flex-1"
                />
                <Input
                  value={extraCollabRole}
                  onChange={(e) => setExtraCollabRole(e.target.value)}
                  placeholder={t("createModal.newCollabRolePlaceholder")}
                  className="h-11 rounded-xl bg-card border-border/60 text-sm sm:w-48"
                />
                <Button
                  type="button"
                  onClick={handleAddCollaborator}
                  disabled={!extraCollabName.trim()}
                  className="h-11 px-4 rounded-xl text-xs font-semibold gap-1.5 shrink-0 w-full sm:w-auto"
                >
                  <Plus className="size-4" />
                  <span>{t("createModal.addCollab")}</span>
                </Button>
              </div>

              {/* Collaborators List */}
              {collaborators.length > 0 && (
                <div className="space-y-2 pt-2">
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="size-4 text-primary shrink-0" />
                        <span className="text-sm font-semibold">{c.name}</span>
                        {c.role && (
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                            {c.role}
                          </span>
                        )}
                        {c.isLead && (
                          <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-md bg-primary/10">
                            {t("collaborators.lead")}
                          </span>
                        )}
                      </div>
                      {!c.isLead && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(c.id)}
                          className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        break;

      case "managerDirective":
        fieldTitle = t("createModal.fields.managerDirective");
        fieldDescription = t("createModal.descriptions.managerDirective");
        fieldContent = (
          <div className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setIsManagerDefined(true)}
                className={cn(
                  "p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                  isManagerDefined
                    ? "border-primary bg-primary/5 text-foreground shadow-xs"
                    : "border-border/60 hover:border-primary/40 text-muted-foreground"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <ShieldAlert className="size-4 text-primary" />
                    <span>{t("createModal.managerDirectiveActive")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("drawer.managerTaskNotice")}
                  </p>
                </div>
                {isManagerDefined && <Check className="size-4 text-primary stroke-[3]" />}
              </div>

              <div
                onClick={() => setIsManagerDefined(false)}
                className={cn(
                  "p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                  !isManagerDefined
                    ? "border-primary bg-primary/5 text-foreground shadow-xs"
                    : "border-border/60 hover:border-primary/40 text-muted-foreground"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Users className="size-4 text-muted-foreground" />
                    <span>{t("createModal.managerDirectiveInactive")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("createModal.scopeTeam")}
                  </p>
                </div>
                {!isManagerDefined && <Check className="size-4 text-primary stroke-[3]" />}
              </div>
            </div>
          </div>
        );
        break;

      default:
        return null;
    }

    return (
      <div className="max-w-4xl mx-auto w-full py-8 px-4 animate-in slide-in-from-bottom-4 duration-300 fa-num">
        <div className="flex items-center gap-4 mb-8">
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
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl">{fieldDescription}</p>

          <div className="bg-white dark:bg-card border border-border/60 rounded-[24px] p-6 sm:p-8 shadow-sm">
            {fieldContent}

            <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setEditingField(null)}
                className="rounded-full px-6 font-medium text-primary hover:bg-primary/5"
              >
                {t("createModal.cancel")}
              </Button>
              <Button
                onClick={() => setEditingField(null)}
                className="rounded-full px-8 font-medium"
              >
                {t("createModal.confirm")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // OVERVIEW VIEW: SEGMENTED LIST GROUPS (Matches Profile Page Layout)
  // ══════════════════════════════════════════════════════════════════════════════
  const projectScopePreview = isPersonalActive
    ? personalType === "project"
      ? relatedProjectTitle.trim() || t("createModal.projectLinked")
      : t("createModal.personalStandalone")
    : t("createModal.scopeTeam");

  const subtasksPreview =
    subtasks.length > 0
      ? isRtl
        ? `${subtasks.length} مورد (${subtasks.filter((s) => s.completed).length} انجام شده)`
        : `${subtasks.length} items (${subtasks.filter((s) => s.completed).length} completed)`
      : t("createModal.notSet");

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-8 animate-in fade-in duration-300 fa-num">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-normal text-foreground">
          {isPersonalActive ? t("createModal.personalTitle") : t("createModal.title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t("createModal.segmentedDescription")}
        </p>
      </div>

      {/* ── Segmented List Groups ── */}
      <div className="space-y-8 mb-10">
        {/* GROUP 1: مشخصات و عنوان */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            {t("createModal.groups.core")}
          </h3>
          <div className="segmented-list">
            {/* Title */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("title")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <FileText className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.title")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">
                  {title.trim() ? title : <span className="text-muted-foreground/50 italic">{t("createModal.notSet")}</span>}
                </span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Scope & Project */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("projectScope")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <Briefcase className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.projectScope")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">{projectScopePreview}</span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Description */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("description")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <Layers className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.description")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">
                  {description.trim() ? description : <span className="text-muted-foreground/50 italic">{t("createModal.notSet")}</span>}
                </span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Subtasks */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("subtasks")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <ListChecks className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.subtasks")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">{subtasksPreview}</span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 2: زمان‌بندی و اولویت */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            {t("createModal.groups.schedule")}
          </h3>
          <div className="segmented-list">
            {/* Due Date */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("dueDate")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <CalendarIcon className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.dueDate")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">
                  {dueDate || <span className="text-muted-foreground/50 italic">{t("createModal.notSet")}</span>}
                </span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Priority */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("priority")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <AlertCircle className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.priority")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <div className="flex items-center text-start">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold border shrink-0 tracking-wide select-none shadow-2xs",
                      priority === "urgent" && "text-rose-600 bg-rose-500/10 border-rose-500/30",
                      priority === "high" && "text-orange-600 bg-orange-500/10 border-orange-500/30",
                      priority === "medium" && "text-amber-600 bg-amber-500/10 border-amber-500/30",
                      priority === "low" && "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
                    )}
                  >
                    {t(`priority.${priority}`)}
                  </span>
                </div>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Estimated Hours */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("estimatedHours")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <Clock className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.estimatedHours")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">
                  {estimatedHours
                    ? isRtl
                      ? `${estimatedHours} ساعت کاری`
                      : `${estimatedHours} work hours`
                    : <span className="text-muted-foreground/50 italic">{t("createModal.notSet")}</span>}
                </span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 3: سازمان و دسته‌بندی */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            {t("createModal.groups.organization")}
          </h3>
          <div className="segmented-list">
            {/* Company */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("company")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <Building2 className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.company")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">{company}</span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Category */}
            <div
              className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
              onClick={() => setEditingField("category")}
            >
              <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <Tag className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.category")}</span>
              </div>
              <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                <span className="text-sm text-muted-foreground text-start truncate px-2">
                  {category || <span className="text-muted-foreground/50 italic">{t("createModal.notSet")}</span>}
                </span>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 4: مدیریت و تخصیص (تنها برای اسکوپ سازمانی توسط مدیر) */}
        {isAdmin && !isPersonalActive && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
              {t("createModal.groups.management")}
            </h3>
            <div className="segmented-list">
              {/* Assignees */}
              <div
                className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
                onClick={() => setEditingField("collaborators")}
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
                <div className="flex items-center gap-4 w-1/3 min-w-0">
                  <Users className="size-5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.assignees")}</span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-sm text-muted-foreground text-start truncate px-2">
                    {collaborators.map((c) => c.name).join("، ")}
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Manager Directive */}
              <div
                className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
                onClick={() => setEditingField("managerDirective")}
              >
                <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none" aria-hidden="true" />
                <div className="flex items-center gap-4 w-1/3 min-w-0">
                  <ShieldAlert className="size-5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{t("createModal.fields.managerDirective")}</span>
                </div>
                <div className="flex items-center justify-between w-2/3 min-w-0 gap-2">
                  <span className="text-sm text-muted-foreground text-start truncate px-2">
                    {isManagerDefined ? (
                      <span className="text-primary font-semibold">{t("createModal.managerDirectiveActive")}</span>
                    ) : (
                      <span>{t("createModal.managerDirectiveInactive")}</span>
                    )}
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-primary shrink-0" />
          <span>{t("createModal.createHint")}</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="rounded-full px-6 font-medium text-muted-foreground hover:text-foreground"
            >
              {t("createModal.cancel")}
            </Button>
          )}

          <Button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="rounded-full px-8 font-medium h-11 shadow-sm"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />}
            <Check className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("createModal.submitTask")}
          </Button>
        </div>
      </div>
    </div>
  );
}
