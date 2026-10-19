// src/modules/projects/components/workspace/tabs/project-risks-tab.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  User,
  Sliders,
  Filter,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import {
  ProjectItem,
  ProjectRiskItem,
  RiskSeverity,
  RiskProbability,
} from "../../../types/projects.types";
import { cn } from "@/lib/utils";

interface ProjectRisksTabProps {
  project: ProjectItem;
  onAddRisk: (risk: Omit<ProjectRiskItem, "id">) => Promise<void>;
  onUpdateRiskStatus: (
    riskId: string,
    status: ProjectRiskItem["status"]
  ) => Promise<void>;
}

export function ProjectRisksTab({
  project,
  onAddRisk,
  onUpdateRiskStatus,
}: ProjectRisksTabProps) {
  const t = useTranslations("Projects.risks");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // New Risk Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectRiskItem["category"]>("material");
  const [severity, setSeverity] = useState<RiskSeverity>("high");
  const [probability, setProbability] = useState<RiskProbability>("likely");
  const [mitigationPlan, setMitigationPlan] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("سارا محمدی");

  const risks = project.risks || [];

  const filteredRisks = risks.filter((r) => {
    if (filterCategory !== "all" && r.category !== filterCategory) return false;
    return true;
  });

  const getSeverityBadge = (sev: RiskSeverity) => {
    switch (sev) {
      case "critical":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold";
      case "medium":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "low":
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  const getStatusBadge = (st: ProjectRiskItem["status"]) => {
    switch (st) {
      case "controlled":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "mitigating":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "closed":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
      case "identified":
      default:
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  const calculateScore = (sev: RiskSeverity, prob: RiskProbability) => {
    const sevMap = { low: 2, medium: 3, high: 4, critical: 5 };
    const probMap = { unlikely: 1, possible: 2, likely: 3, almost_certain: 4 };
    return sevMap[sev] * probMap[prob];
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAddRisk({
      category,
      title: title.trim(),
      description: description.trim(),
      severity,
      probability,
      riskScore: calculateScore(severity, probability),
      mitigationPlan: mitigationPlan.trim() || "تعیین دستورالعمل کنترل کیفیت و هماهنگی جلسه اضطراری",
      responsiblePerson: responsiblePerson.trim() || "مدیر پروژه",
      status: "mitigating",
    });

    setTitle("");
    setDescription("");
    setMitigationPlan("");
    setIsAddOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-4 fa-num">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {t("title")}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {t("subtitle")}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="rounded-xl text-xs font-semibold gap-1.5 h-8.5 cursor-pointer shadow-2xs"
        >
          <Plus className="size-3.5" />
          <span>{t("addRisk")}</span>
        </Button>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1">
        <button
          type="button"
          onClick={() => setFilterCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap",
            filterCategory === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-2xs"
              : "bg-white dark:bg-card text-muted-foreground border-border/60 hover:text-foreground"
          )}
        >
          همه ریسک‌ها ({risks.length})
        </button>

        {[
          { id: "material", label: t("categories.material") },
          { id: "thickness", label: t("categories.thickness") },
          { id: "fabrication", label: t("categories.fabrication") },
          { id: "special_equipment", label: t("categories.special_equipment") },
        ].map((cat) => {
          const count = risks.filter((r) => r.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                filterCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-white dark:bg-card text-muted-foreground border-border/60 hover:text-foreground"
              )}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted/50">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Risks List Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRisks.map((risk) => (
          <div
            key={risk.id}
            className="p-4 rounded-2xl border border-border/60 bg-white dark:bg-card shadow-xs flex flex-col justify-between gap-3"
          >
            <div className="flex flex-col gap-2">
              {/* Category & Score Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                  {t(`categories.${risk.category}`)}
                </span>
                <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                  امتیاز ریسک: {risk.riskScore}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-xs sm:text-[13px] font-bold text-foreground leading-snug">
                {risk.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {risk.description}
              </p>

              {/* Mitigation Box */}
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 flex flex-col gap-1 text-[11px]">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span>اقدام کنترلی و پیشگیرانه:</span>
                </span>
                <span className="text-muted-foreground leading-relaxed">
                  {risk.mitigationPlan}
                </span>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="size-3 text-primary" />
                <span>{risk.responsiblePerson}</span>
              </div>

              <select
                value={risk.status}
                onChange={(e) =>
                  onUpdateRiskStatus(risk.id, e.target.value as any)
                }
                className={cn(
                  "px-2 py-0.5 rounded-md border font-bold text-[10px] outline-none cursor-pointer bg-background",
                  getStatusBadge(risk.status)
                )}
              >
                <option value="identified">شناسایی شده</option>
                <option value="mitigating">در حال اقدام کنترلی</option>
                <option value="controlled">کنترل شده</option>
                <option value="closed">بسته شده</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Risk Modal ── */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-card border border-border shadow-2xl p-4 sm:p-5 fa-num flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">
                  شناسایی و ثبت ریسک مهندسی پروژه
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="size-6 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">
                  عنوان ریسک:
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلا: ضخامت بالای ورق و الزام به کوره تنش‌زدایی PWHT"
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">رده ریسک:</label>
                  <Combobox
                    options={[
                      { value: "material", label: "متریال خاص و آلیاژها" },
                      { value: "fabrication", label: "ساخت پیچیده و تلرانس" },
                      { value: "thickness", label: "ضخامت بالا و PWHT" },
                      { value: "special_equipment", label: "تجهیزات خاص" },
                      { value: "procurement", label: "تدارکات و خرید خارجی" },
                    ]}
                    value={category}
                    onChange={(v) => setCategory(v as any)}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">شدت اثر:</label>
                  <Combobox
                    options={[
                      { value: "low", label: "کم" },
                      { value: "medium", label: "متوسط" },
                      { value: "high", label: "زیاد" },
                      { value: "critical", label: "بسیار بحرانی" },
                    ]}
                    value={severity}
                    onChange={(v) => setSeverity(v as any)}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted-foreground">احتمال:</label>
                  <Combobox
                    options={[
                      { value: "unlikely", label: "کم" },
                      { value: "possible", label: "محتمل" },
                      { value: "likely", label: "زیاد" },
                      { value: "almost_certain", label: "قطعی" },
                    ]}
                    value={probability}
                    onChange={(v) => setProbability(v as any)}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">
                  شرح دقیق چالش فنی:
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="علت بروز ریسک و خطرات آن..."
                  className="text-xs rounded-xl min-h-[60px] resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">
                  اقدام کنترلی و پیشگیرانه (Mitigation Action):
                </label>
                <Textarea
                  value={mitigationPlan}
                  onChange={(e) => setMitigationPlan(e.target.value)}
                  placeholder="برنامه شرکت جهت مهار یا پیشگیری از این ریسک..."
                  className="text-xs rounded-xl min-h-[60px] resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">
                  مسئول پایش و پیگیری:
                </label>
                <Input
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  انصراف
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  ثبت ریسک در ماتریس
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
