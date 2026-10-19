// src/modules/projects/components/workspace/tabs/project-strategic-okrs-tab.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
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

interface ProjectStrategicOkrsTabProps {
  project: ProjectItem;
}

export function ProjectStrategicOkrsTab({
  project,
}: ProjectStrategicOkrsTabProps) {
  const t = useTranslations("Projects");
  const [goals, setGoals] = useState<StrategicGoalLink[]>(
    project.strategicGoals || []
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("توسعه بازارهای صادراتی");
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
            استراتژیک و حیاتی
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/30 text-xs">
            <TrendingUp className="w-3 h-3 ml-1" />
            تاثیرگذاری بالا
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            تاثیر متوسط
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
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">
              {t("strategic.title")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("strategic.subtitle")}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>پیوند به هدف کلان جدید</span>
        </Button>
      </div>

      {/* Strategic Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm hover:border-primary/40 transition-colors space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    محور: {goal.corporateCategory}
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
                نحوه تحقق و آورده این پروژه:
              </span>
              {goal.contributionDescription}
            </div>
          </div>
        ))}
      </div>

      {/* Add Strategic Goal Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle>پیوند پروژه با هدف کلان توسعه شرکت</DialogTitle>
            <DialogDescription>
              ثبت و مشخص‌سازی نقش این پروژه در اهداف کلان مدیریتی
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddGoal} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="goal-title">عنوان هدف استراتژیک *</Label>
              <Input
                id="goal-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثلاً: توسعه سهم بازار صادراتی تجهیزات فرآیندی در حوزه خلیج فارس"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-right">
                <Label htmlFor="goal-category">محور توسعه</Label>
                <select
                  id="goal-category"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="توسعه بازارهای صادراتی">توسعه صادرات</option>
                  <option value="بومی‌سازی و خودکفایی تکنولوژیک">بومی‌سازی تکنولوژی</option>
                  <option value="افزایش ظرفیت تولید و کاهش سربار">افزایش ظرفیت</option>
                  <option value="کسب استانداردهای بین‌المللی ASME">استانداردهای بین‌المللی</option>
                </select>
              </div>

              <div className="space-y-1.5 text-right">
                <Label htmlFor="goal-impact">سطح اثرگذاری</Label>
                <select
                  id="goal-impact"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value as any)}
                >
                  <option value="strategic">استراتژیک و حیاتی</option>
                  <option value="high">بالا</option>
                  <option value="medium">متوسط</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <Label htmlFor="goal-desc">نحوه مشارکت این پروژه</Label>
              <Input
                id="goal-desc"
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                placeholder="شرح چگونگی دستیابی به هدف از طریق این پروژه..."
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
              <Button type="submit" disabled={!newTitle.trim()}>
                ثبت و پیوند
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
