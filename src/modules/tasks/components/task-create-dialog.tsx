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
  AlertCircle,
  Building2,
  ShieldAlert,
  Users,
  Sliders,
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
} from "../types/tasks.types";

interface TaskCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (
    data: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">
  ) => Promise<TaskItem>;
  categories: string[];
  companies?: string[];
  defaultStatus?: TaskStatus;
}

export function TaskCreateDialog({
  open,
  onClose,
  onCreateTask,
  categories,
  companies = ["یورو اسلات پارس", "نانو پالایش سرام", "پترو اسپادانا"],
  defaultStatus = "pending",
}: TaskCreateDialogProps) {
  const t = useTranslations("Tasks");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "P&ID FLOW");
  const [company, setCompany] = useState(companies[0] || "یورو اسلات پارس");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [dueDate, setDueDate] = useState("1403/08/18");
  const [timelineDate, setTimelineDate] = useState("18 اسفند");
  const [estimatedHours, setEstimatedHours] = useState("16");
  const [initialProgress, setInitialProgress] = useState(0);
  const [isManagerDefined, setIsManagerDefined] = useState(true);

  // Assignees
  const [assigneeName, setAssigneeName] = useState("سعید جلیلی");
  const [assigneeRole, setAssigneeRole] = useState("سرپرست مهندسی فرآیند");
  const [collaborators, setCollaborators] = useState<TaskAssignee[]>([
    { id: "lead", name: "سعید جلیلی", role: "سرپرست مهندسی فرآیند", isLead: true },
    { id: "mgr", name: "مهندس علیرضا رضایی", role: "مدیر فنی و مهندسی" },
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
      await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || "عمومی",
        company,
        priority,
        status: defaultStatus,
        createdBy: "manager",
        creatorName: "مهندس علیرضا رضایی (مدیر مهندسی)",
        assignedToName: assigneeName.trim() || "سعید جلیلی",
        assignedToRole: assigneeRole.trim() || "سرپرست مهندسی فرآیند",
        assignees: collaborators.length > 0 ? collaborators : [
          { id: "default", name: assigneeName, role: assigneeRole, isLead: true }
        ],
        progressPercent: initialProgress,
        timelineDate: timelineDate.trim() || undefined,
        milestoneLabel: title.trim(),
        dueDate: dueDate.trim() || undefined,
        startDate: new Intl.DateTimeFormat("fa-IR").format(new Date()),
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        loggedHours: 0,
        isManagerDefined,
        subtasks,
      });

      // Reset
      setTitle("");
      setDescription("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-card border border-border/80 shadow-2xl overflow-hidden fa-num animate-in zoom-in-95 duration-200"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldAlert className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {t("createModal.title")}
              </h2>
              <span className="text-[11px] text-muted-foreground">
                تفکیک بر اساس شرکت و تخصیص تیم چندنفره
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span>{t("table.title")}</span>
              <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("createModal.titlePlaceholder")}
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
                  { value: "یورو اسلات پارس", label: "یورو اسلات پارس" },
                  { value: "نانو پالایش سرام", label: "نانو پالایش سرام" },
                  { value: "پترو اسپادانا", label: "پترو اسپادانا" },
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
                placeholder="مثلاً P&ID FLOW, ASME, QC"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Priority & Timeline Date Row */}
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
                <span>{t("createModal.timelineDate")}</span>
              </label>
              <Input
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
                placeholder="مثلاً ۱۸ اسفند"
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                <span>{t("createModal.dueDate")}</span>
              </label>
              <Input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="1403/08/20"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* ── Multiple Assignees Management ── */}
          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" />
                <span>{t("collaborators.title")}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                {collaborators.length} عضو درگیر
              </span>
            </div>

            {/* Existing Collaborators chips */}
            <div className="flex flex-wrap gap-1.5">
              {collaborators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-card border border-border/80 text-[11px] shadow-2xs"
                >
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
                placeholder="نام همکار جدید..."
                className="text-xs rounded-lg bg-background h-8"
              />
              <Input
                value={extraCollabRole}
                onChange={(e) => setExtraCollabRole(e.target.value)}
                placeholder="سمت (طراح، ناظر...)"
                className="text-xs rounded-lg bg-background h-8"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddCollaborator}
                disabled={!extraCollabName.trim()}
                className="rounded-lg h-8 text-xs shrink-0 cursor-pointer"
              >
                افزودن
              </Button>
            </div>
          </div>

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
                className="rounded-xl text-xs shrink-0"
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
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40 text-xs"
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

          {/* Initial Progress & Manager Defined Checkbox */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isManagerDefined}
                onChange={(e) => setIsManagerDefined(e.target.checked)}
                className="size-4 rounded accent-primary cursor-pointer"
              />
              <span className="font-semibold text-foreground">
                ابلاغ رسمی به عنوان تسک سازمانی مدیر
              </span>
            </label>
          </div>

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
              className="text-xs font-semibold rounded-xl cursor-pointer shadow-2xs"
            >
              {t("createModal.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
