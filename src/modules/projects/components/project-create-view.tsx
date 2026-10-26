// src/modules/projects/components/project-create-view.tsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderKanban,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Send,
  Plus,
  RefreshCw,
  HardDrive,
  Clock,
  ShieldCheck,
  Check,
  User,
  AlertCircle,
  Tag,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ProjectItem,
  ProjectType,
  ProjectStatus,
  ProjectPhase,
  ProjectSubPackage,
} from "../types/projects.types";
import { cn } from "@/lib/utils";

export type ProjectStepId = "identity" | "commercial" | "schedule" | "packages" | "review";

export interface ProjectCreateViewProps {
  onCreateProject: (projectData: Omit<ProjectItem, "id">) => Promise<ProjectItem>;
  onCancel: () => void;
  onSuccess?: (createdProject: ProjectItem) => void;
  organizations?: string[];
}

interface DefaultPhaseItem {
  id: string;
  name: string;
  order: number;
  enabled: boolean;
}

const INITIAL_PHASES: DefaultPhaseItem[] = [
  { id: "ph-1", name: "مهندسی پایه و تهیه مدرک VDIS", order: 1, enabled: true },
  { id: "ph-2", name: "طراحی تفصیلی و محاسبات مکانیکی", order: 2, enabled: true },
  { id: "ph-3", name: "تدارکات و خرید متریال", order: 3, enabled: true },
  { id: "ph-4", name: "ساخت و مونتاژ کارخانه‌ای", order: 4, enabled: true },
  { id: "ph-5", name: "کنترل کیفیت NDT و آزمون هیدرواستاتیک", order: 5, enabled: true },
  { id: "ph-6", name: "رنگ‌آمیزی، بسته‌بندی و حمل", order: 6, enabled: true },
];

export function ProjectCreateView({
  onCreateProject,
  onCancel,
  onSuccess,
  organizations = ["یورو اسلات پارس", "نانو پالایش سرام", "مهندسی و بازرگانی"],
}: ProjectCreateViewProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // ── Form State ──
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [organization, setOrganization] = useState(organizations[0] || "یورو اسلات پارس");
  const [projectType, setProjectType] = useState<ProjectType>("internal");

  const [quotationNumber, setQuotationNumber] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [currency, setCurrency] = useState("IRR");
  const [dmsNetworkPath, setDmsNetworkPath] = useState("");

  const [startDate, setStartDate] = useState("1403/08/01");
  const [targetEndDate, setTargetEndDate] = useState("1404/04/30");
  const [phases, setPhases] = useState<DefaultPhaseItem[]>(INITIAL_PHASES);
  const [newCustomPhaseName, setNewCustomPhaseName] = useState("");

  const [subPackageName, setSubPackageName] = useState("پکیج اصلی و تجهیزات فرآیندی");
  const [equipmentType, setEquipmentType] = useState("تجهیزات تحت فشار و فیلتراسیون");
  const [leadName, setLeadName] = useState("مهندس ارشد پروژه");
  const [description, setDescription] = useState("");

  // ── Accordion / Step Progression State ──
  const [activeStep, setActiveStep] = useState<ProjectStepId>("identity");
  const [completedSteps, setCompletedSteps] = useState<Set<ProjectStepId>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-generate project code
  const handleAutoGenerateCode = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const orgPrefix = organization.includes("نانو") ? "NPS" : "ESP";
    const generated = `PRJ-${orgPrefix}-${year}-${randomNum}`;
    setCode(generated);
    if (!dmsNetworkPath.trim() || dmsNetworkPath.includes("PRJ-")) {
      setDmsNetworkPath(`\\\\DMS\\Projects\\${generated}\\`);
    }
  };

  // Step definitions in order
  const stepsList: { id: ProjectStepId; icon: React.ComponentType<{ className?: string }>; order: number }[] = [
    { id: "identity", icon: FolderKanban, order: 1 },
    { id: "commercial", icon: DollarSign, order: 2 },
    { id: "schedule", icon: Calendar, order: 3 },
    { id: "packages", icon: Layers, order: 4 },
    { id: "review", icon: Sparkles, order: 5 },
  ];

  // Helper for progress percentage
  const currentStepIndex = stepsList.findIndex((s) => s.id === activeStep);
  const progressPercent = Math.round(((completedSteps.size) / (stepsList.length - 1)) * 100);

  // Check if step is valid
  const validateStep = (stepId: ProjectStepId): boolean => {
    setValidationError(null);
    if (stepId === "identity") {
      if (!title.trim() || !clientName.trim()) {
        setValidationError(t("createModal.validationError"));
        return false;
      }
      return true;
    }
    if (stepId === "commercial") {
      if (!quotationNumber.trim()) {
        setValidationError(t("createModal.validationError"));
        return false;
      }
      return true;
    }
    return true;
  };

  // Navigate to Next Step
  const handleGoToNext = (fromStep: ProjectStepId) => {
    if (!validateStep(fromStep)) {
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, fromStep]));

    const currentIndex = stepsList.findIndex((s) => s.id === fromStep);
    if (currentIndex < stepsList.length - 1) {
      const nextStep = stepsList[currentIndex + 1].id;
      setActiveStep(nextStep);
    }
  };

  // Navigate to Previous Step
  const handleGoToPrev = (fromStep: ProjectStepId) => {
    setValidationError(null);
    const currentIndex = stepsList.findIndex((s) => s.id === fromStep);
    if (currentIndex > 0) {
      const prevStep = stepsList[currentIndex - 1].id;
      setActiveStep(prevStep);
    }
  };

  // Toggle or jump to step
  const handleStepHeaderClick = (stepId: ProjectStepId) => {
    if (activeStep === stepId) {
      // Allow collapsing or keep active
      setActiveStep(stepId);
    } else {
      setActiveStep(stepId);
      setValidationError(null);
    }
  };

  // Toggle phase in schedule
  const handleTogglePhase = (phaseId: string) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, enabled: !p.enabled } : p))
    );
  };

  // Add custom phase
  const handleAddCustomPhase = () => {
    if (!newCustomPhaseName.trim()) return;
    const newPhase: DefaultPhaseItem = {
      id: `custom-ph-${Date.now()}`,
      name: newCustomPhaseName.trim(),
      order: phases.length + 1,
      enabled: true,
    };
    setPhases((prev) => [...prev, newPhase]);
    setNewCustomPhaseName("");
  };

  // Final submit handler
  const handleFinalSubmit = async () => {
    if (!title.trim() || !clientName.trim() || !quotationNumber.trim()) {
      setActiveStep(!title.trim() || !clientName.trim() ? "identity" : "commercial");
      setValidationError(t("createModal.validationError"));
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const generatedCode =
        code.trim() ||
        `PRJ-ESP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      const enabledPhasesList: ProjectPhase[] = phases
        .filter((p) => p.enabled)
        .map((p, index) => ({
          id: p.id,
          name: p.name,
          order: index + 1,
          progressPercent: 0,
          status: "pending",
        }));

      const finalSubPackage: ProjectSubPackage = {
        id: `sp-${Date.now()}-1`,
        name: subPackageName.trim() || "پکیج اصلی و تجهیزات فرآیندی",
        code: `${generatedCode}-PKG-01`,
        equipmentType: equipmentType.trim() || "تجهیزات تحت فشار و فیلتراسیون",
        leadName: leadName.trim() || "مهندس ارشد پروژه",
        progressPercent: 0,
        modulesCount: 2,
      };

      const projectData: Omit<ProjectItem, "id"> = {
        code: generatedCode,
        title: title.trim(),
        clientName: clientName.trim(),
        organization,
        quotationNumber: quotationNumber.trim(),
        contractNumber: contractNumber.trim() || undefined,
        projectType,
        status: "tendering",
        progressPercent: 0,
        plannedProgressPercent: 5,
        startDate,
        targetEndDate,
        budgetAmount: budgetAmount.trim() ? `${budgetAmount.trim()} ${currency}` : (isRtl ? "توافقی" : "Negotiable"),
        currency,
        dmsNetworkPath:
          dmsNetworkPath.trim() || `\\\\DMS\\Projects\\${generatedCode}\\`,
        description: description.trim(),
        subPackages: [finalSubPackage],
        phases: enabledPhasesList,
        team: [
          {
            id: "tm-1",
            name: leadName.trim() || "مهندس ارشد پروژه",
            role: "Project Lead",
            department: "مدیریت مهندسی",
            email: "pm@euroslotpars.com",
            isManager: true,
            raci: "Accountable",
          },
        ],
        tasks: [],
        vdisDocuments: [],
        transmittals: [],
        risks: [
          {
            id: `rk-${Date.now()}`,
            category: "thickness",
            title: isRtl ? "تنش‌زدایی و آزمون‌های سخت‌گیرانه کارفرما" : "Stress Relief & Client Inspection",
            description: isRtl ? "بررسی الزامات NACE و مقاومت در برابر محیط ترش H2S" : "Verification of NACE requirements for H2S sour service",
            severity: "medium",
            probability: "possible",
            riskScore: 6,
            mitigationPlan: isRtl ? "تهیه ITP با هماهنگی نماینده بازرسی شخص ثالث (TPI)" : "Prepare ITP with Third-party Inspector",
            responsiblePerson: isRtl ? "مدیر کنترل کیفیت QC" : "QC Manager",
            status: "identified",
          },
        ],
        strategicGoals: [
          {
            id: `sg-${Date.now()}`,
            objectiveTitle: isRtl ? "ارتقای توانمندی در طراحی تجهیزات صنعتی پیشرفته" : "Enhance Advanced Industrial Equipment Capabilities",
            corporateCategory: isRtl ? "بومی‌سازی و توسعه مهندسی" : "Engineering Localization",
            impactLevel: "high",
            contributionDescription: isRtl ? "افزایش دانش فنی و سابقه معتبر در وندورلیست کارفرمایان اصلی" : "Expanding vendor list approvals and technical know-how",
          },
        ],
        roadmapNodes: [
          {
            id: "node-1",
            title: isRtl ? "شروع پروژه و تایید مدارک مهندسی" : "Kick-off & Engineering Documents Approval",
            phaseId: enabledPhasesList[0]?.id || "ph-1",
            date: startDate,
            status: "active",
            x: 80,
            y: 120,
            dependencies: [],
            progressPercent: 0,
          },
          {
            id: "node-2",
            title: isRtl ? "سفارش‌گذاری متریال و مواد اولیه" : "Material & Raw Procurement Ordering",
            phaseId: enabledPhasesList[2]?.id || "ph-3",
            date: "1403/09/01",
            status: "upcoming",
            x: 280,
            y: 120,
            dependencies: ["node-1"],
            progressPercent: 0,
          },
          {
            id: "node-3",
            title: isRtl ? "آغاز ساخت و مونتاژ کارخانه‌ای تجهیزات" : "Commence Workshop Fabrication & Assembly",
            phaseId: enabledPhasesList[3]?.id || "ph-4",
            date: "1403/11/01",
            status: "upcoming",
            x: 480,
            y: 120,
            dependencies: ["node-2"],
            progressPercent: 0,
          },
        ],
      };

      const created = await onCreateProject(projectData);
      setSubmitSuccess(true);
      if (onSuccess) {
        onSuccess(created);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary preview labels for each step when collapsed
  const getStepPreview = (stepId: ProjectStepId): string => {
    switch (stepId) {
      case "identity":
        return title.trim()
          ? `${title.trim()} (${clientName.trim() || t("createModal.notSet")})`
          : t("createModal.notSet");
      case "commercial":
        return quotationNumber.trim()
          ? `${quotationNumber.trim()} • ${budgetAmount.trim() ? `${budgetAmount.trim()} ${currency}` : (isRtl ? "بودجه توافقی" : "Negotiable")}`
          : t("createModal.notSet");
      case "schedule":
        return `${startDate} ◄ ${targetEndDate} (${phases.filter((p) => p.enabled).length} فاز)`;
      case "packages":
        return `${subPackageName} • ${equipmentType}`;
      case "review":
        return t("createModal.steps.reviewDesc");
      default:
        return "";
    }
  };

  const getStepStatus = (stepId: ProjectStepId) => {
    if (completedSteps.has(stepId)) return "completed";
    if (activeStep === stepId) return "active";
    return "pending";
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto w-full py-6 sm:py-8 px-3 sm:px-6 animate-in fade-in duration-300 fa-num">
      {/* ── Page Header & Progress ── */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="size-5" />
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {t("title")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            {t("createModal.title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t("createModal.subtitle")}
          </p>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="rounded-full text-xs font-semibold px-4 cursor-pointer"
          >
            {t("createModal.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleFinalSubmit}
            disabled={isSubmitting || !title.trim() || !clientName.trim() || !quotationNumber.trim()}
            className="rounded-full text-xs font-semibold px-5 bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-xs"
          >
            {isSubmitting && <RefreshCw className="size-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 animate-spin" />}
            <span>{t("createModal.finalSubmit")}</span>
          </Button>
        </div>
      </div>

      {/* ── Step Progress Tracker Bar ── */}
      <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2.5">
          <span>{t("createModal.stepCounter", { current: currentStepIndex + 1, total: stepsList.length })}</span>
          <span className="text-primary font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(10, progressPercent)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Indicator Chips */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-border/30">
          {stepsList.map((st, i) => {
            const status = getStepStatus(st.id);
            const isCurrent = activeStep === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStepHeaderClick(st.id)}
                className={cn(
                  "flex items-center justify-center sm:justify-start gap-1.5 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-colors cursor-pointer truncate",
                  isCurrent
                    ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                    : status === "completed"
                    ? "text-emerald-600 dark:text-emerald-400 hover:bg-muted/40"
                    : "text-muted-foreground hover:bg-muted/40"
                )}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <span className={cn("size-4 rounded-full flex items-center justify-center text-[10px] shrink-0", isCurrent ? "bg-primary text-white font-bold" : "bg-muted text-muted-foreground")}>
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline truncate">{t(`createModal.steps.${st.id}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation alert banner */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2.5 text-xs font-semibold overflow-hidden"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{validationError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Segmented Accordion List Container ── */}
      <div className="space-y-4">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 1: مشخصات و هویت قرارداد (Core Identity)            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/70 bg-white dark:bg-card shadow-2xs overflow-hidden transition-all duration-200">
          {/* Accordion Header */}
          <div
            onClick={() => handleStepHeaderClick("identity")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-muted/20 transition-colors select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", activeStep === "identity" ? "bg-primary text-white" : completedSteps.has("identity") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                {completedSteps.has("identity") ? <CheckCircle2 className="size-5" /> : <FolderKanban className="size-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    {t("createModal.steps.identity")}
                  </h3>
                  <Badge variant={completedSteps.has("identity") ? "default" : activeStep === "identity" ? "secondary" : "outline"} className={cn("text-[10px] px-2 py-0.5", completedSteps.has("identity") && "bg-emerald-500 text-white hover:bg-emerald-600")}>
                    {completedSteps.has("identity") ? t("createModal.completedBadge") : activeStep === "identity" ? t("createModal.inProgressBadge") : t("createModal.pendingBadge")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-md">
                  {getStepPreview("identity")}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("size-5 text-muted-foreground shrink-0 transition-transform duration-200", activeStep === "identity" && "rotate-180")} />
          </div>

          {/* Accordion Content */}
          <AnimatePresence initial={false}>
            {activeStep === "identity" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-border/40"
              >
                <div className="p-4 sm:p-6 space-y-5 bg-muted/5">
                  {/* Field: Title */}
                  <div className="space-y-1.5 text-start">
                    <Label htmlFor="create-prj-title" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5 text-muted-foreground" />
                      <span>{t("createModal.title")}</span>
                      <span className="text-destructive font-bold">*</span>
                    </Label>
                    <Input
                      id="create-prj-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("createModal.titlePlaceholder")}
                      className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-medium"
                      required
                    />
                  </div>

                  {/* Field: Code with Auto Generate */}
                  <div className="space-y-1.5 text-start">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="create-prj-code" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Hash className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.code")}</span>
                      </Label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateCode}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        <Sparkles className="size-3" />
                        <span>{t("createModal.autoGenerate")}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="create-prj-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={t("createModal.codePlaceholder")}
                        dir="ltr"
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoGenerateCode}
                        className="h-11 rounded-xl px-3 shrink-0 text-xs font-semibold"
                      >
                        {t("createModal.autoGenerate")}
                      </Button>
                    </div>
                  </div>

                  {/* Field: Client & Organization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="create-prj-client" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.client")}</span>
                        <span className="text-destructive font-bold">*</span>
                      </Label>
                      <Input
                        id="create-prj-client"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder={t("createModal.clientPlaceholder")}
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.organization")}</span>
                      </Label>
                      <Combobox
                        value={organization}
                        onChange={setOrganization}
                        options={organizations.map((org) => ({ value: org, label: org }))}
                        placeholder={t("createModal.organization")}
                        className="w-full h-11 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Field: Project Type Selector */}
                  <div className="space-y-2 text-start pt-1">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Tag className="size-3.5 text-muted-foreground" />
                      <span>{t("createModal.type")}</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {(["internal", "export", "rd", "joint_venture", "epc"] as ProjectType[]).map((typeKey) => {
                        const isSelected = projectType === typeKey;
                        return (
                          <button
                            key={typeKey}
                            type="button"
                            onClick={() => setProjectType(typeKey)}
                            className={cn(
                              "p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer",
                              isSelected
                                ? "bg-primary text-white border-primary shadow-xs font-semibold"
                                : "bg-background border-border/70 text-foreground/80 hover:bg-muted/40"
                            )}
                          >
                            {t(`types.${typeKey}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Bottom Next Bar */}
                  <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {title && clientName ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="size-3.5" />
                          <span>اطلاعات الزامی این بخش تکمیل است</span>
                        </span>
                      ) : (
                        <span>وارد کردن عنوان و نام کارفرما الزامی است</span>
                      )}
                    </span>
                    <Button
                      type="button"
                      onClick={() => handleGoToNext("identity")}
                      className="rounded-full text-xs font-semibold px-6 cursor-pointer"
                    >
                      <span>{t("createModal.next")}</span>
                      {isRtl ? <ArrowLeft className="size-3.5 mr-1" /> : <ArrowRight className="size-3.5 ml-1" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 2: اسناد، قرارداد و بازرگانی (Commercial & Documents)*/}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/70 bg-white dark:bg-card shadow-2xs overflow-hidden transition-all duration-200">
          {/* Accordion Header */}
          <div
            onClick={() => handleStepHeaderClick("commercial")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-muted/20 transition-colors select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", activeStep === "commercial" ? "bg-primary text-white" : completedSteps.has("commercial") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                {completedSteps.has("commercial") ? <CheckCircle2 className="size-5" /> : <DollarSign className="size-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    {t("createModal.steps.commercial")}
                  </h3>
                  <Badge variant={completedSteps.has("commercial") ? "default" : activeStep === "commercial" ? "secondary" : "outline"} className={cn("text-[10px] px-2 py-0.5", completedSteps.has("commercial") && "bg-emerald-500 text-white hover:bg-emerald-600")}>
                    {completedSteps.has("commercial") ? t("createModal.completedBadge") : activeStep === "commercial" ? t("createModal.inProgressBadge") : t("createModal.pendingBadge")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-md">
                  {getStepPreview("commercial")}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("size-5 text-muted-foreground shrink-0 transition-transform duration-200", activeStep === "commercial" && "rotate-180")} />
          </div>

          {/* Accordion Content */}
          <AnimatePresence initial={false}>
            {activeStep === "commercial" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-border/40"
              >
                <div className="p-4 sm:p-6 space-y-5 bg-muted/5">
                  {/* Field: Quotation & Contract */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="create-prj-quote" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Send className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.quotation")}</span>
                        <span className="text-destructive font-bold">*</span>
                      </Label>
                      <Input
                        id="create-prj-quote"
                        value={quotationNumber}
                        onChange={(e) => setQuotationNumber(e.target.value)}
                        placeholder={t("createModal.quotationPlaceholder")}
                        dir="ltr"
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="create-prj-contract" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.contract")}</span>
                      </Label>
                      <Input
                        id="create-prj-contract"
                        value={contractNumber}
                        onChange={(e) => setContractNumber(e.target.value)}
                        placeholder={t("createModal.contractPlaceholder")}
                        dir="ltr"
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Field: Budget & Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5 text-start">
                      <Label htmlFor="create-prj-budget" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <DollarSign className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.budget")}</span>
                      </Label>
                      <Input
                        id="create-prj-budget"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        placeholder={t("createModal.budgetPlaceholder")}
                        dir="ltr"
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label className="text-xs font-semibold text-foreground">
                        {t("createModal.currency")}
                      </Label>
                      <div className="grid grid-cols-4 gap-1.5 h-11 items-center">
                        {["IRR", "USD", "EUR", "AED"].map((curr) => {
                          const isSel = currency === curr;
                          return (
                            <button
                              key={curr}
                              type="button"
                              onClick={() => setCurrency(curr)}
                              className={cn(
                                "h-11 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                                isSel
                                  ? "bg-primary text-white border-primary shadow-xs"
                                  : "bg-background border-border/70 text-foreground/75 hover:bg-muted/40"
                              )}
                            >
                              {curr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Field: DMS Path */}
                  <div className="space-y-1.5 text-start">
                    <Label htmlFor="create-prj-dms" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <HardDrive className="size-3.5 text-muted-foreground" />
                      <span>{t("createModal.dmsPath")}</span>
                    </Label>
                    <Input
                      id="create-prj-dms"
                      value={dmsNetworkPath}
                      onChange={(e) => setDmsNetworkPath(e.target.value)}
                      placeholder={t("createModal.dmsPathPlaceholder")}
                      dir="ltr"
                      className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  {/* Navigation Bar */}
                  <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGoToPrev("commercial")}
                      className="rounded-full text-xs font-semibold px-5 cursor-pointer"
                    >
                      {isRtl ? <ArrowRight className="size-3.5 ml-1" /> : <ArrowLeft className="size-3.5 mr-1" />}
                      <span>{t("createModal.prev")}</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleGoToNext("commercial")}
                      className="rounded-full text-xs font-semibold px-6 cursor-pointer"
                    >
                      <span>{t("createModal.next")}</span>
                      {isRtl ? <ArrowLeft className="size-3.5 mr-1" /> : <ArrowRight className="size-3.5 ml-1" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 3: زمان‌بندی و فازهای اجرایی WBS (Schedule & Phases)  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/70 bg-white dark:bg-card shadow-2xs overflow-hidden transition-all duration-200">
          {/* Accordion Header */}
          <div
            onClick={() => handleStepHeaderClick("schedule")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-muted/20 transition-colors select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", activeStep === "schedule" ? "bg-primary text-white" : completedSteps.has("schedule") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                {completedSteps.has("schedule") ? <CheckCircle2 className="size-5" /> : <Calendar className="size-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    {t("createModal.steps.schedule")}
                  </h3>
                  <Badge variant={completedSteps.has("schedule") ? "default" : activeStep === "schedule" ? "secondary" : "outline"} className={cn("text-[10px] px-2 py-0.5", completedSteps.has("schedule") && "bg-emerald-500 text-white hover:bg-emerald-600")}>
                    {completedSteps.has("schedule") ? t("createModal.completedBadge") : activeStep === "schedule" ? t("createModal.inProgressBadge") : t("createModal.pendingBadge")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-md">
                  {getStepPreview("schedule")}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("size-5 text-muted-foreground shrink-0 transition-transform duration-200", activeStep === "schedule" && "rotate-180")} />
          </div>

          {/* Accordion Content */}
          <AnimatePresence initial={false}>
            {activeStep === "schedule" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-border/40"
              >
                <div className="p-4 sm:p-6 space-y-5 bg-muted/5">
                  {/* Field: Start & Target End Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="create-prj-start" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.startDate")}</span>
                      </Label>
                      <Input
                        id="create-prj-start"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="1403/08/01"
                        dir="ltr"
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="create-prj-target" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.targetDate")}</span>
                      </Label>
                      <Input
                        id="create-prj-target"
                        value={targetEndDate}
                        onChange={(e) => setTargetEndDate(e.target.value)}
                        placeholder="1404/04/30"
                        dir="ltr"
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* WBS Phases Checklist */}
                  <div className="space-y-3 pt-2 text-start">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("createModal.phasesTitle")}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t("createModal.phasesSubtitle")}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {phases.map((ph, idx) => (
                        <div
                          key={ph.id}
                          onClick={() => handleTogglePhase(ph.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                            ph.enabled
                              ? "bg-white dark:bg-card border-primary/40 shadow-2xs"
                              : "bg-muted/30 border-border/40 opacity-60"
                          )}
                        >
                          <div
                            className={cn(
                              "size-5 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                              ph.enabled ? "bg-primary text-white border-primary" : "border-border/70 bg-background"
                            )}
                          >
                            {ph.enabled && <Check className="size-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="text-xs font-medium text-foreground truncate">
                            {ph.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Phase input */}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={newCustomPhaseName}
                        onChange={(e) => setNewCustomPhaseName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCustomPhase()}
                        placeholder={t("createModal.newPhasePlaceholder")}
                        className="h-10 rounded-xl bg-background border-border/70 text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomPhase}
                        className="h-10 rounded-xl px-3 shrink-0 text-xs font-semibold"
                      >
                        <Plus className="size-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                        <span>{t("createModal.addCustomPhase")}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Navigation Bar */}
                  <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGoToPrev("schedule")}
                      className="rounded-full text-xs font-semibold px-5 cursor-pointer"
                    >
                      {isRtl ? <ArrowRight className="size-3.5 ml-1" /> : <ArrowLeft className="size-3.5 mr-1" />}
                      <span>{t("createModal.prev")}</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleGoToNext("schedule")}
                      className="rounded-full text-xs font-semibold px-6 cursor-pointer"
                    >
                      <span>{t("createModal.next")}</span>
                      {isRtl ? <ArrowLeft className="size-3.5 mr-1" /> : <ArrowRight className="size-3.5 ml-1" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 4: پکیج‌های تجهیزاتی و الزامات فنی (Packages & Scope) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/70 bg-white dark:bg-card shadow-2xs overflow-hidden transition-all duration-200">
          {/* Accordion Header */}
          <div
            onClick={() => handleStepHeaderClick("packages")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-muted/20 transition-colors select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", activeStep === "packages" ? "bg-primary text-white" : completedSteps.has("packages") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                {completedSteps.has("packages") ? <CheckCircle2 className="size-5" /> : <Layers className="size-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    {t("createModal.steps.packages")}
                  </h3>
                  <Badge variant={completedSteps.has("packages") ? "default" : activeStep === "packages" ? "secondary" : "outline"} className={cn("text-[10px] px-2 py-0.5", completedSteps.has("packages") && "bg-emerald-500 text-white hover:bg-emerald-600")}>
                    {completedSteps.has("packages") ? t("createModal.completedBadge") : activeStep === "packages" ? t("createModal.inProgressBadge") : t("createModal.pendingBadge")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-md">
                  {getStepPreview("packages")}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("size-5 text-muted-foreground shrink-0 transition-transform duration-200", activeStep === "packages" && "rotate-180")} />
          </div>

          {/* Accordion Content */}
          <AnimatePresence initial={false}>
            {activeStep === "packages" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-border/40"
              >
                <div className="p-4 sm:p-6 space-y-5 bg-muted/5">
                  {/* Field: Sub-Package Name & Equipment Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="create-prj-pkg-name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Layers className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.subPackageName")}</span>
                      </Label>
                      <Input
                        id="create-prj-pkg-name"
                        value={subPackageName}
                        onChange={(e) => setSubPackageName(e.target.value)}
                        placeholder={t("createModal.subPackageNamePlaceholder")}
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 text-start">
                      <Label htmlFor="create-prj-pkg-eq" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FolderKanban className="size-3.5 text-muted-foreground" />
                        <span>{t("createModal.equipmentType")}</span>
                      </Label>
                      <Input
                        id="create-prj-pkg-eq"
                        value={equipmentType}
                        onChange={(e) => setEquipmentType(e.target.value)}
                        placeholder={t("createModal.equipmentTypePlaceholder")}
                        className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Field: Lead Name */}
                  <div className="space-y-1.5 text-start">
                    <Label htmlFor="create-prj-pkg-lead" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <User className="size-3.5 text-muted-foreground" />
                      <span>{t("createModal.leadName")}</span>
                    </Label>
                    <Input
                      id="create-prj-pkg-lead"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder={t("createModal.leadNamePlaceholder")}
                      className="h-11 rounded-xl bg-background border-border/70 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  {/* Field: Technical Scope Description */}
                  <div className="space-y-1.5 text-start">
                    <Label htmlFor="create-prj-desc" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5 text-muted-foreground" />
                      <span>{t("createModal.description")}</span>
                    </Label>
                    <Textarea
                      id="create-prj-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("createModal.descriptionPlaceholder")}
                      rows={3}
                      className="rounded-xl bg-background border-border/70 text-xs sm:text-sm resize-none"
                    />
                  </div>

                  {/* Navigation Bar */}
                  <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGoToPrev("packages")}
                      className="rounded-full text-xs font-semibold px-5 cursor-pointer"
                    >
                      {isRtl ? <ArrowRight className="size-3.5 ml-1" /> : <ArrowLeft className="size-3.5 mr-1" />}
                      <span>{t("createModal.prev")}</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleGoToNext("packages")}
                      className="rounded-full text-xs font-semibold px-6 cursor-pointer"
                    >
                      <span>{t("createModal.next")}</span>
                      {isRtl ? <ArrowLeft className="size-3.5 mr-1" /> : <ArrowRight className="size-3.5 ml-1" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 5: بازبینی نهایی و تایید (Review & Final Submission) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/70 bg-white dark:bg-card shadow-2xs overflow-hidden transition-all duration-200">
          {/* Accordion Header */}
          <div
            onClick={() => handleStepHeaderClick("review")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-muted/20 transition-colors select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", activeStep === "review" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    {t("createModal.steps.review")}
                  </h3>
                  <Badge variant={activeStep === "review" ? "default" : "outline"} className="text-[10px] px-2 py-0.5">
                    {activeStep === "review" ? t("createModal.inProgressBadge") : t("createModal.pendingBadge")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-md">
                  {t("createModal.steps.reviewDesc")}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("size-5 text-muted-foreground shrink-0 transition-transform duration-200", activeStep === "review" && "rotate-180")} />
          </div>

          {/* Accordion Content */}
          <AnimatePresence initial={false}>
            {activeStep === "review" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-border/40"
              >
                <div className="p-4 sm:p-6 space-y-6 bg-muted/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Summary Card 1: Core */}
                    <div className="p-4 rounded-xl bg-background border border-border/60 shadow-2xs space-y-2 text-start">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <FolderKanban className="size-3.5" />
                          <span>{t("createModal.steps.identity")}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveStep("identity")}
                          className="h-6 text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2"
                        >
                          ویرایش
                        </Button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div><strong className="text-foreground">عنوان:</strong> <span className="text-muted-foreground">{title || t("createModal.notSet")}</span></div>
                        <div><strong className="text-foreground">کارفرما:</strong> <span className="text-muted-foreground">{clientName || t("createModal.notSet")}</span></div>
                        <div><strong className="text-foreground">سازمان:</strong> <span className="text-muted-foreground">{organization}</span></div>
                        <div><strong className="text-foreground">نوع قرارداد:</strong> <span className="text-muted-foreground">{t(`types.${projectType}`)}</span></div>
                      </div>
                    </div>

                    {/* Summary Card 2: Commercial */}
                    <div className="p-4 rounded-xl bg-background border border-border/60 shadow-2xs space-y-2 text-start">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <DollarSign className="size-3.5" />
                          <span>{t("createModal.steps.commercial")}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveStep("commercial")}
                          className="h-6 text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2"
                        >
                          ویرایش
                        </Button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div><strong className="text-foreground">شماره کوتیشن:</strong> <span className="text-muted-foreground font-mono">{quotationNumber || t("createModal.notSet")}</span></div>
                        <div><strong className="text-foreground">شماره قرارداد:</strong> <span className="text-muted-foreground font-mono">{contractNumber || "-"}</span></div>
                        <div><strong className="text-foreground">برآورد بودجه:</strong> <span className="text-muted-foreground">{budgetAmount ? `${budgetAmount} ${currency}` : (isRtl ? "توافقی" : "Negotiable")}</span></div>
                        <div><strong className="text-foreground">مسیر DMS:</strong> <span className="text-muted-foreground font-mono truncate block">{dmsNetworkPath || "-"}</span></div>
                      </div>
                    </div>

                    {/* Summary Card 3: Schedule */}
                    <div className="p-4 rounded-xl bg-background border border-border/60 shadow-2xs space-y-2 text-start">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          <span>{t("createModal.steps.schedule")}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveStep("schedule")}
                          className="h-6 text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2"
                        >
                          ویرایش
                        </Button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div><strong className="text-foreground">تاریخ آغاز:</strong> <span className="text-muted-foreground font-mono">{startDate}</span></div>
                        <div><strong className="text-foreground">تاریخ تحویل:</strong> <span className="text-muted-foreground font-mono">{targetEndDate}</span></div>
                        <div><strong className="text-foreground">فازهای فعال:</strong> <span className="text-muted-foreground">{phases.filter((p) => p.enabled).length} فاز WBS</span></div>
                      </div>
                    </div>

                    {/* Summary Card 4: Packages & Lead */}
                    <div className="p-4 rounded-xl bg-background border border-border/60 shadow-2xs space-y-2 text-start">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Layers className="size-3.5" />
                          <span>{t("createModal.steps.packages")}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveStep("packages")}
                          className="h-6 text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2"
                        >
                          ویرایش
                        </Button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div><strong className="text-foreground">نام پکیج:</strong> <span className="text-muted-foreground">{subPackageName}</span></div>
                        <div><strong className="text-foreground">نوع تجهیز:</strong> <span className="text-muted-foreground">{equipmentType}</span></div>
                        <div><strong className="text-foreground">مدیر پروژه:</strong> <span className="text-muted-foreground">{leadName}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Final Creation Button Banner */}
                  <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGoToPrev("review")}
                      className="rounded-full text-xs font-semibold px-5 w-full sm:w-auto cursor-pointer"
                    >
                      {isRtl ? <ArrowRight className="size-3.5 ml-1" /> : <ArrowLeft className="size-3.5 mr-1" />}
                      <span>{t("createModal.prev")}</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting || !title.trim() || !clientName.trim() || !quotationNumber.trim()}
                      className="rounded-full text-sm font-semibold px-8 py-5 bg-primary text-white hover:bg-primary/90 shadow-md w-full sm:w-auto cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="size-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                          <span>در حال ایجاد پروژه...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          <span>{t("createModal.finalSubmit")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
