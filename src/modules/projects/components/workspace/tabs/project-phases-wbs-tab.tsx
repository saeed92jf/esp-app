// src/modules/projects/components/workspace/tabs/project-phases-wbs-tab.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ProjectItem, ProjectPhase } from "../../../types/projects.types";
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Sliders,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface ProjectPhasesWbsTabProps {
  project: ProjectItem;
  onAddPhase?: (phase: Omit<ProjectPhase, "id">) => Promise<void>;
  onUpdatePhase?: (phase: ProjectPhase) => Promise<void>;
}

export function ProjectPhasesWbsTab({
  project,
  onAddPhase,
  onUpdatePhase,
}: ProjectPhasesWbsTabProps) {
  const t = useTranslations("Projects");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseDesc, setNewPhaseDesc] = useState("");
  const [newPhaseLead, setNewPhaseLead] = useState("");
  const [newPhaseStart, setNewPhaseStart] = useState("");
  const [newPhaseEnd, setNewPhaseEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedPhases = [...(project.phases || [])].sort(
    (a, b) => a.order - b.order
  );

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseName.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddPhase) {
        await onAddPhase({
          name: newPhaseName.trim(),
          description: newPhaseDesc.trim() || undefined,
          leadName: newPhaseLead.trim() || undefined,
          order: sortedPhases.length + 1,
          progressPercent: 0,
          status: "pending",
          startDate: newPhaseStart || undefined,
          endDate: newPhaseEnd || undefined,
          isCustom: true,
        });
      }
      setNewPhaseName("");
      setNewPhaseDesc("");
      setNewPhaseLead("");
      setNewPhaseStart("");
      setNewPhaseEnd("");
      setIsAddOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ProjectPhase["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            تکمیل شده
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs">
            <Clock className="w-3 h-3 ml-1 animate-pulse" />
            در حال اجرا
          </Badge>
        );
      case "delayed":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs">
            <AlertCircle className="w-3 h-3 ml-1" />
            دارای تاخیر
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            در انتظار شروع
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">
              {t("phases.title")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("phases.subtitle")}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>{t("phases.addPhase")}</span>
        </Button>
      </div>

      {/* Phases Timeline & List */}
      <div className="space-y-3">
        {sortedPhases.map((phase, index) => (
          <div
            key={phase.id}
            className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm hover:border-primary/40 transition-colors space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center fa-num shrink-0">
                  {phase.order}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base text-foreground">
                      {phase.name}
                    </h3>
                    {phase.isCustom ? (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/5">
                        <Sparkles className="w-2.5 h-2.5 ml-1" />
                        {t("phases.isCustom")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {t("phases.standard")}
                      </Badge>
                    )}
                  </div>
                  {phase.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {phase.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {getStatusBadge(phase.status)}
              </div>
            </div>

            {/* Progress & Meta Info */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  پیشرفت فیزیکی این فاز:
                </span>
                <span className="font-semibold text-foreground fa-num">
                  %{phase.progressPercent}
                </span>
              </div>
              <Progress value={phase.progressPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs text-muted-foreground">
              {phase.leadName && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>مسئول فاز:</span>
                  <span className="font-medium text-foreground">
                    {phase.leadName}
                  </span>
                </div>
              )}
              {phase.startDate && phase.endDate && (
                <div className="flex items-center gap-1.5 fa-num">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>بازه زمانی:</span>
                  <span className="font-medium text-foreground">
                    {phase.startDate} تا {phase.endDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Phase Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle>{t("phases.addPhase")}</DialogTitle>
            <DialogDescription>
              تعریف مرحله اختصاصی برای ساختار شکست کار (WBS) این پروژه
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePhase} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="phase-name">{t("phases.phaseName")} *</Label>
              <Input
                id="phase-name"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                placeholder="مثلاً: عملیات حرارتی PWHT، عایق‌کاری، آزمون هیدرواستاتیک..."
                required
              />
            </div>

            <div className="space-y-1.5 text-right">
              <Label htmlFor="phase-lead">{t("phases.phaseLead")}</Label>
              <Input
                id="phase-lead"
                value={newPhaseLead}
                onChange={(e) => setNewPhaseLead(e.target.value)}
                placeholder="نام مهندس یا سرپرست کارگاهی..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-right">
                <Label htmlFor="phase-start">تاریخ شروع</Label>
                <Input
                  id="phase-start"
                  value={newPhaseStart}
                  onChange={(e) => setNewPhaseStart(e.target.value)}
                  placeholder="1403/08/01"
                />
              </div>
              <div className="space-y-1.5 text-right">
                <Label htmlFor="phase-end">تاریخ پایان</Label>
                <Input
                  id="phase-end"
                  value={newPhaseEnd}
                  onChange={(e) => setNewPhaseEnd(e.target.value)}
                  placeholder="1403/09/15"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <Label htmlFor="phase-desc">توضیحات تکمیلی</Label>
              <Input
                id="phase-desc"
                value={newPhaseDesc}
                onChange={(e) => setNewPhaseDesc(e.target.value)}
                placeholder="الزامات بازرسی، کد استاندارد مربوطه یا تحویل‌شدنی‌ها..."
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={isSubmitting || !newPhaseName.trim()}>
                {isSubmitting ? "در حال ثبت..." : "افزودن مرحله"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
