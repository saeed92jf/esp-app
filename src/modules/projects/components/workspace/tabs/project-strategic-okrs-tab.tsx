// src/modules/projects/components/workspace/tabs/project-strategic-okrs-tab.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { ProjectItem, StrategicGoalLink } from "../../../types/projects.types";
import {
  Target,
  Plus,
  TrendingUp,
  Award,
  Compass,
  CheckCircle,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface ProjectStrategicOkrsTabProps {
  project: ProjectItem;
}

export function ProjectStrategicOkrsTab({
  project,
}: ProjectStrategicOkrsTabProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [goals, setGoals] = useState<StrategicGoalLink[]>(
    project.strategicGoals || []
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(
    isRtl ? "توسعه بازارهای صادراتی" : "Export Market Expansion"
  );
  const [newImpact, setNewImpact] = useState<StrategicGoalLink["impactLevel"]>("strategic");
  const [newContribution, setNewContribution] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newGoal: StrategicGoalLink = {
      id: `goal-${Date.now()}`,
      objectiveTitle: newTitle.trim(),
      corporateCategory: newCategory,
      impactLevel: newImpact,
      contributionDescription: newContribution.trim(),
    };
    setGoals((prev) => [newGoal, ...prev]);
    setNewTitle("");
    setNewContribution("");
    setIsAddOpen(false);
  };

  const getImpactBadge = (level: StrategicGoalLink["impactLevel"]) => {
    switch (level) {
      case "strategic":
        return (
          <Badge className="bg-purple-500/10 text-purple-500 border border-purple-500/30 text-xs">
            <Award className="w-3 h-3 ml-1" />
            {isRtl ? "استراتژیک و حیاتی" : "Strategic & Critical"}
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/30 text-xs">
            <TrendingUp className="w-3 h-3 ml-1" />
            {isRtl ? "تاثیرگذاری بالا" : "High Impact"}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            {isRtl ? "تاثیر متوسط" : "Medium Impact"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-white dark:bg-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">
              {isRtl ? "همسویی با اهداف کلان و توسعه شرکت (OKRs)" : "Alignment with Corporate Goals (OKRs)"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {isRtl
              ? "پیوند دستاوردهای پروژه با راهبردهای رشد سازمانی، بومی‌سازی و توسعه صادرات"
              : "Linking project achievements with organizational growth, localization, and export strategies"}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? "پیوند به هدف کلان جدید" : "Link to New Corporate Goal"}</span>
        </Button>
      </div>

      {/* Strategic Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-2xl border border-border/60 bg-white dark:bg-card p-5 shadow-xs hover:border-primary/40 transition-colors space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {isRtl ? "محور:" : "Focus Area:"} {goal.corporateCategory}
                  </span>
                  <h3 className="font-semibold text-sm text-foreground mt-0.5">
                    {goal.objectiveTitle}
                  </h3>
                </div>
              </div>
              {getImpactBadge(goal.impactLevel)}
            </div>

            <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground/90 block mb-1">
                {isRtl ? "نحوه تحقق و آورده این پروژه:" : "Project contribution & realization:"}
              </span>
              {goal.contributionDescription}
            </div>
          </div>
        ))}
      </div>

      {/* Add Strategic Goal Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader className={isRtl ? "text-right" : "text-left"}>
            <DialogTitle>
              {isRtl ? "پیوند پروژه با هدف کلان توسعه شرکت" : "Link Project with Corporate Strategic Goal"}
            </DialogTitle>
            <DialogDescription>
              {isRtl
                ? "ثبت و مشخص‌سازی نقش این پروژه در اهداف کلان مدیریتی"
                : "Define the role of this project in corporate strategic objectives"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddGoal} className="space-y-4 pt-2">
            <div className={cn("space-y-1.5", isRtl ? "text-right" : "text-left")}>
              <Label htmlFor="goal-title">
                {isRtl ? "عنوان هدف استراتژیک *" : "Strategic Objective Title *"}
              </Label>
              <Input
                id="goal-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={
                  isRtl
                    ? "مثلاً: توسعه سهم بازار صادراتی تجهیزات فرآیندی در حوزه خلیج فارس"
                    : "e.g., Expand export market share of process equipment in the region"
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={cn("space-y-1.5", isRtl ? "text-right" : "text-left")}>
                <Label htmlFor="goal-category">{isRtl ? "محور توسعه" : "Strategic Area"}</Label>
                <select
                  id="goal-category"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value={isRtl ? "توسعه بازارهای صادراتی" : "Export Market Expansion"}>
                    {isRtl ? "توسعه صادرات" : "Export Growth"}
                  </option>
                  <option value={isRtl ? "بومی‌سازی و خودکفایی تکنولوژیک" : "Technological Localization"}>
                    {isRtl ? "بومی‌سازی تکنولوژی" : "Tech Localization"}
                  </option>
                  <option value={isRtl ? "افزایش ظرفیت تولید و کاهش سربار" : "Capacity Expansion & Overhead Reduction"}>
                    {isRtl ? "افزایش ظرفیت" : "Capacity Growth"}
                  </option>
                  <option value={isRtl ? "کسب استانداردهای بین‌المللی ASME" : "ASME International Certification"}>
                    {isRtl ? "استانداردهای بین‌المللی" : "International Standards"}
                  </option>
                </select>
              </div>

              <div className={cn("space-y-1.5", isRtl ? "text-right" : "text-left")}>
                <Label htmlFor="goal-impact">{isRtl ? "سطح اثرگذاری" : "Impact Level"}</Label>
                <select
                  id="goal-impact"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value as any)}
                >
                  <option value="strategic">{isRtl ? "استراتژیک و حیاتی" : "Strategic & Critical"}</option>
                  <option value="high">{isRtl ? "بالا" : "High"}</option>
                  <option value="medium">{isRtl ? "متوسط" : "Medium"}</option>
                </select>
              </div>
            </div>

            <div className={cn("space-y-1.5", isRtl ? "text-right" : "text-left")}>
              <Label htmlFor="goal-desc">{isRtl ? "نحوه مشارکت این پروژه" : "How this project contributes"}</Label>
              <Input
                id="goal-desc"
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                placeholder={
                  isRtl
                    ? "شرح چگونگی دستیابی به هدف از طریق این پروژه..."
                    : "Explain how this project achieves this objective..."
                }
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button type="submit" disabled={!newTitle.trim()}>
                {isRtl ? "ثبت و پیوند" : "Register & Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
