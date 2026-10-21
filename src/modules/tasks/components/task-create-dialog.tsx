// src/modules/tasks/components/task-create-dialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  X,
  Plus,
  Calendar,
  Clock,
  Tag,
  User,
  Building2,
  ShieldAlert,
  Users,
  UserCheck,
  Briefcase,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
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

interface TaskCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (
    data: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">
  ) => Promise<TaskItem>;
  categories: string[];
  companies?: string[];
  defaultStatus?: TaskStatus;
  initialScope?: TaskScope;
  currentUserName?: string;
  isAdmin?: boolean;
  userInvolvedProjects?: ProjectItem[];
}

export function TaskCreateDialog({
  open,
  onClose,
  onCreateTask,
  categories,
  companies = ["یورو اسلات پارس", "نانو پالایش سرام"],
  defaultStatus = "pending",
  initialScope = "team",
  currentUserName,
  isAdmin = false,
  userInvolvedProjects = [],
}: TaskCreateDialogProps) {
  const t = useTranslations("Tasks");
  const userLead = currentUserName || "سعید جلیلی";

  // Non-admins can strictly ONLY create personal tasks.
  // Admins can toggle between 'team' (organizational) and 'personal'.
  const [scope, setScope] = useState<TaskScope>(isAdmin ? initialScope : "personal");

  // For personal tasks: linked to an involved project vs standalone
  const [personalType, setPersonalType] = useState<"project" | "standalone">("project");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [relatedProjectTitle, setRelatedProjectTitle] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "P&ID FLOW");
  const [company, setCompany] = useState(companies[0] || "یورو اسلات پارس");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [dueDate, setDueDate] = useState("1403/08/18");
  const [timelineDate, setTimelineDate] = useState("18 اسفند");
  const [estimatedHours, setEstimatedHours] = useState("16");
  const [initialProgress, setInitialProgress] = useState(0);
  const [isManagerDefined, setIsManagerDefined] = useState(isAdmin);

  // Assignees for team tasks (Admin only)
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

  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setScope(isAdmin ? initialScope : "personal");
      if (userInvolvedProjects.length > 0) {
        setSelectedProjectId(userInvolvedProjects[0].id);
        setRelatedProjectTitle(userInvolvedProjects[0].title);
        if (userInvolvedProjects[0].organization) {
          setCompany(userInvolvedProjects[0].organization);
        }
      }
    }
  }, [open, initialScope, isAdmin, userInvolvedProjects]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const handleAddCollaborator = () => {
    if (!extraCollabName.trim()) return;
    setCollaborators((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        name: extraCollabName.trim(),
        role: extraCollabRole.trim() || "همکار اجرایی",
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

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Non-admins are hard-locked to personal scope
      const isPersonalTask = !isAdmin || scope === "personal";
      const finalScope: TaskScope = isPersonalTask ? "personal" : "team";

      let linkedProjId: string | undefined = undefined;
      let linkedProjTitle: string | undefined = undefined;

      if (isPersonalTask && personalType === "project") {
        linkedProjId = selectedProjectId || (relatedProjectTitle ? "proj-custom" : undefined);
        linkedProjTitle = relatedProjectTitle.trim() || undefined;
      }

      await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || (isPersonalTask ? "یادداشت شخصی" : "عمومی"),
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
          : (isManagerDefined && isAdmin ? "مهندس علیرضا رضایی (مدیر مهندسی)" : userLead),
        assignedToName: isPersonalTask ? userLead : (assigneeName.trim() || userLead),
        assignedToRole: isPersonalTask ? "شخصی" : (assigneeRole.trim() || "کارشناس مهندسی"),
        assignees: isPersonalTask
          ? [
              {
                id: "usr-self",
                name: userLead,
                role: "شخصی",
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
                role: assigneeRole || "کارشناس مهندسی",
                isLead: true,
              },
            ],
        progressPercent: initialProgress,
        timelineDate: timelineDate.trim() || undefined,
        milestoneLabel: title.trim(),
        dueDate: dueDate.trim() || undefined,
        startDate: new Intl.DateTimeFormat("fa-IR").format(new Date()),
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        loggedHours: 0,
        isManagerDefined: isPersonalTask ? false : (isAdmin && isManagerDefined),
        subtasks,
      });

      // Reset Form
      setTitle("");
      setDescription("");
      setRelatedProjectTitle("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPersonalActive = !isAdmin || scope === "personal";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-card border border-border/80 shadow-2xl overflow-hidden fa-num animate-in zoom-in-95 duration-200"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "p-2 rounded-2xl",
                isPersonalActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary/10 text-primary"
              )}
            >
              {isPersonalActive ? <UserCheck className="size-5" /> : <ShieldAlert className="size-5" />}
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {isPersonalActive ? t("createModal.personalTitle") : t("createModal.title")}
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {isPersonalActive
                  ? t("createModal.personalSubtitle")
                  : "تسک سازمانی با تفکیک دو شرکت یورو اسلات پارس و نانو پالایش سرام"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 flex flex-col gap-4">
          {/* ── Scope Switcher: Team vs Personal (ADMIN ONLY) ── */}
          {isAdmin && (
            <div className="p-1 rounded-2xl bg-muted/30 border border-border/60 grid grid-cols-2 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setScope("team")}
                className={cn(
                  "py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  scope === "team"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <Briefcase className="size-3.5" />
                <span>{t("createModal.scopeTeam")}</span>
              </button>
              <button
                type="button"
                onClick={() => setScope("personal")}
                className={cn(
                  "py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  scope === "personal"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <UserCheck className="size-3.5" />
                <span>{t("createModal.scopePersonal")}</span>
              </button>
            </div>
          )}

          {/* ── Personal Task Association: Project-Linked vs Standalone ── */}
          {isPersonalActive && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-3">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Link2 className="size-3.5 text-emerald-600" />
                <span>{t("createModal.personalTypeLabel")}</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPersonalType("project")}
                  className={cn(
                    "p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    personalType === "project"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-white dark:bg-card text-muted-foreground border-border/60 hover:text-foreground"
                  )}
                >
                  <span>{t("createModal.personalTypeProject")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPersonalType("standalone")}
                  className={cn(
                    "p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    personalType === "standalone"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-white dark:bg-card text-muted-foreground border-border/60 hover:text-foreground"
                  )}
                >
                  <span>{t("createModal.personalTypeStandalone")}</span>
                </button>
              </div>

              {personalType === "project" && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                    {t("createModal.selectProjectLabel")}
                  </label>
                  {userInvolvedProjects.length > 0 ? (
                    <Combobox
                      options={userInvolvedProjects.map((p) => ({
                        value: p.id,
                        label: `${p.title} (${p.code})`,
                      }))}
                      value={selectedProjectId}
                      onChange={(val) => {
                        setSelectedProjectId(val);
                        const found = userInvolvedProjects.find((x) => x.id === val);
                        if (found) {
                          setRelatedProjectTitle(found.title);
                          if (found.organization) {
                            setCompany(found.organization);
                          }
                        }
                      }}
                      placeholder={t("createModal.selectProjectPlaceholder")}
                      className="text-xs rounded-xl bg-white dark:bg-card"
                    />
                  ) : (
                    <Input
                      value={relatedProjectTitle}
                      onChange={(e) => setRelatedProjectTitle(e.target.value)}
                      placeholder={t("createModal.customProjectPlaceholder")}
                      className="text-xs rounded-xl bg-white dark:bg-card"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span>{t("table.title")}</span>
              <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isPersonalActive
                  ? t("createModal.personalTitlePlaceholder")
                  : t("createModal.titlePlaceholder")
              }
              className="text-xs sm:text-sm rounded-xl"
              required
            />
          </div>

          {/* Company & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                <span>{t("createModal.company")}</span>
              </label>
              <Combobox
                options={[
                  { value: "یورو اسلات پارس", label: "یورو اسلات پارس (Euroslot Pars)" },
                  { value: "نانو پالایش سرام", label: "نانو پالایش سرام (Nano Palayesh Ceram)" },
                ]}
                value={company}
                onChange={setCompany}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="size-3.5 text-primary" />
                <span>{t("createModal.category")}</span>
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثلاً P&ID, ASME, QC, یادداشت شخصی"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("createModal.priority")}
              </label>
              <Combobox
                options={[
                  { value: "low", label: t("priority.low") },
                  { value: "medium", label: t("priority.medium") },
                  { value: "high", label: t("priority.high") },
                  { value: "urgent", label: t("priority.urgent") },
                ]}
                value={priority}
                onChange={(val) => setPriority(val as TaskPriority)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                <span>{t("table.dueDate")}</span>
              </label>
              <Input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="1403/08/20"
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>{t("createModal.estimatedHours")}</span>
              </label>
              <Input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="16"
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Assignees Section - ONLY FOR ADMIN IN TEAM SCOPE */}
          {isAdmin && scope === "team" && (
            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Users className="size-4 text-primary" />
                  <span>{t("createModal.teamCollaborators")}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {t("createModal.collaboratorsNotice")}
                </span>
              </div>

              {/* Collaborators Badges */}
              <div className="flex flex-wrap gap-2">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/60 text-xs shadow-2xs"
                  >
                    <User className="size-3 text-primary" />
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">({c.role})</span>
                    {collaborators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(c.id)}
                        className="size-3.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer ms-1"
                      >
                        <X className="size-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Add Extra Collaborator Inputs */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={extraCollabName}
                  onChange={(e) => setExtraCollabName(e.target.value)}
                  placeholder={t("createModal.newCollabNamePlaceholder")}
                  className="text-xs rounded-xl bg-background h-8"
                />
                <Input
                  value={extraCollabRole}
                  onChange={(e) => setExtraCollabRole(e.target.value)}
                  placeholder={t("createModal.newCollabRolePlaceholder")}
                  className="text-xs rounded-xl bg-background h-8"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCollaborator}
                  disabled={!extraCollabName.trim()}
                  className="rounded-xl h-8 text-xs shrink-0 cursor-pointer"
                >
                  {t("createModal.addCollab")}
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("createModal.description")}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("createModal.descriptionPlaceholder")}
              className="text-xs rounded-xl min-h-[75px] resize-none"
            />
          </div>

          {/* Subtasks checklist */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">
              {t("subtasks.title")}
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder={t("subtasks.placeholder")}
                className="text-xs rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubtask}
                disabled={!subtaskInput.trim()}
                className="rounded-xl text-xs shrink-0 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>{t("subtasks.add")}</span>
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                {subtasks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border/40 text-xs"
                  >
                    <span>{s.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(s.id)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official Manager Task Checkbox - ONLY FOR ADMIN IN TEAM SCOPE */}
          {isAdmin && scope === "team" && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/50 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isManagerDefined}
                  onChange={(e) => setIsManagerDefined(e.target.checked)}
                  className="size-4 rounded accent-primary cursor-pointer"
                />
                <span className="font-semibold text-foreground">
                  {t("createModal.managerDirective")}
                </span>
              </label>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl cursor-pointer"
            >
              {t("createModal.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || isSubmitting}
              className={cn(
                "text-xs font-semibold rounded-xl cursor-pointer shadow-2xs",
                isPersonalActive && "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              {isPersonalActive
                ? t("createModal.submitPersonal")
                : t("createModal.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
