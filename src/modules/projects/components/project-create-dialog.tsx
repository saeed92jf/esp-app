// src/modules/projects/components/project-create-dialog.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ProjectType,
  ProjectStatus,
  ProjectItem,
} from "../types/projects.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, FileText, HardDrive, DollarSign } from "lucide-react";

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: Omit<ProjectItem, "id">) => Promise<any>;
}

export function ProjectCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: ProjectCreateDialogProps) {
  const t = useTranslations("Projects");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [organization, setOrganization] = useState("یورو اسلات پارس");
  const [projectType, setProjectType] = useState<ProjectType>("internal");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [currency, setCurrency] = useState("IRR");
  const [dmsNetworkPath, setDmsNetworkPath] = useState("");
  const [startDate, setStartDate] = useState("1403/08/01");
  const [targetEndDate, setTargetEndDate] = useState("1404/04/30");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || !quotationNumber.trim()) return;
    setIsSubmitting(true);
    try {
      const generatedCode =
        code.trim() || `PRJ-ESP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      await onSubmit({
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
        budgetAmount: budgetAmount.trim() || "توافقی",
        currency,
        dmsNetworkPath:
          dmsNetworkPath.trim() || `\\\\DMS\\Projects\\${generatedCode}\\`,
        description: description.trim(),
        subPackages: [
          {
            id: `sp-${Date.now()}-1`,
            name: "پکیج اصلی و تجهیزات فرآیندی",
            code: `${generatedCode}-PKG-01`,
            equipmentType: "تجهیزات تحت فشار و فیلتراسیون",
            leadName: "مهندس ارشد پروژه",
            progressPercent: 0,
            modulesCount: 2,
          },
        ],
        phases: [
          {
            id: "ph-1",
            name: "مهندسی پایه و تهیه مدرک VDIS",
            order: 1,
            progressPercent: 0,
            status: "pending",
          },
          {
            id: "ph-2",
            name: "طراحی تفصیلی و محاسبات مکانیکی",
            order: 2,
            progressPercent: 0,
            status: "pending",
          },
          {
            id: "ph-3",
            name: "تدارکات و خرید متریال",
            order: 3,
            progressPercent: 0,
            status: "pending",
          },
          {
            id: "ph-4",
            name: "ساخت و مونتاژ کارخانه‌ای",
            order: 4,
            progressPercent: 0,
            status: "pending",
          },
          {
            id: "ph-5",
            name: "کنترل کیفیت NDT و آزمون هیدرواستاتیک",
            order: 5,
            progressPercent: 0,
            status: "pending",
          },
          {
            id: "ph-6",
            name: "رنگ‌آمیزی، بسته‌بندی و حمل",
            order: 6,
            progressPercent: 0,
            status: "pending",
          },
        ],
        team: [
          {
            id: "tm-1",
            name: "مدیر پروژه",
            role: "Project Manager",
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
            id: "rk-1",
            category: "thickness",
            title: "تنش‌زدایی و آزمون‌های سخت‌گیرانه کارفرما",
            description: "نیاز به بررسی الزامات NACE و مقاومت در برابر محیط‌های ترش H2S",
            severity: "medium",
            probability: "possible",
            riskScore: 6,
            mitigationPlan: "تهیه ITP با هماهنگی نماینده بازرسی شخص ثالث (TPI)",
            responsiblePerson: "مدیر کنترل کیفیت QC",
            status: "identified",
          },
        ],
        strategicGoals: [
          {
            id: "sg-1",
            objectiveTitle: "ارتقای توانمندی در طراحی تجهیزات صنعتی پیشرفته",
            corporateCategory: "بومی‌سازی و توسعه مهندسی",
            impactLevel: "high",
            contributionDescription: "افزایش دانش فنی و سابقه معتبر در وندورلیست کارفرمایان اصلی نفت و گاز",
          },
        ],
        roadmapNodes: [
          {
            id: "node-1",
            title: "شروع پروژه و تایید مدارک مهندسی",
            phaseId: "ph-1",
            date: startDate,
            status: "active",
            x: 80,
            y: 120,
            dependencies: [],
            progressPercent: 0,
          },
          {
            id: "node-2",
            title: "سفارش‌گذاری متریال و مواد اولیه",
            phaseId: "ph-3",
            date: "1403/09/01",
            status: "upcoming",
            x: 280,
            y: 120,
            dependencies: ["node-1"],
            progressPercent: 0,
          },
          {
            id: "node-3",
            title: "آغاز ساخت و مونتاژ تجهیزات",
            phaseId: "ph-4",
            date: "1403/11/01",
            status: "upcoming",
            x: 480,
            y: 120,
            dependencies: ["node-2"],
            progressPercent: 0,
          },
        ],
      });

      onOpenChange(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCode("");
    setClientName("");
    setQuotationNumber("");
    setContractNumber("");
    setBudgetAmount("");
    setDmsNetworkPath("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>{t("createModal.title")}</DialogTitle>
          <DialogDescription>
            مشخصات قرارداد، شماره کوتیشن، کارفرما، مسیر داکیومنت‌ها و مراحل پروژه را وارد کنید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5 text-right">
            <Label htmlFor="prj-title">{t("createModal.title")} *</Label>
            <Input
              id="prj-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("createModal.titlePlaceholder")}
              required
            />
          </div>

          {/* Code & Quotation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-code">{t("createModal.code")}</Label>
              <Input
                id="prj-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t("createModal.codePlaceholder")}
              />
            </div>
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-quotation">{t("createModal.quotation")} *</Label>
              <Input
                id="prj-quotation"
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                placeholder={t("createModal.quotationPlaceholder")}
                required
              />
            </div>
          </div>

          {/* Client & Contract */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-client">{t("createModal.client")} *</Label>
              <Input
                id="prj-client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("createModal.clientPlaceholder")}
                required
              />
            </div>
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-contract">{t("createModal.contract")}</Label>
              <Input
                id="prj-contract"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="CTR-2024-..."
              />
            </div>
          </div>

          {/* Organization & Project Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-org">{t("createModal.organization")}</Label>
              <select
                id="prj-org"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              >
                <option value="یورو اسلات پارس">یورو اسلات پارس (Euroslot Pars)</option>
                <option value="نانو پالایش سرام">نانو پالایش سرام (Nano Palayesh Ceram)</option>
              </select>
            </div>
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-type">{t("createModal.type")}</Label>
              <select
                id="prj-type"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
              >
                <option value="internal">{t("types.internal")}</option>
                <option value="export">{t("types.export")}</option>
                <option value="joint_venture">{t("types.joint_venture")}</option>
                <option value="rd">{t("types.rd")}</option>
                <option value="epc">{t("types.epc")}</option>
              </select>
            </div>
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-budget">{t("createModal.budget")}</Label>
              <Input
                id="prj-budget"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder={t("createModal.budgetPlaceholder")}
              />
            </div>
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-currency">واحد ارزی</Label>
              <select
                id="prj-currency"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="IRR">ریال (IRR)</option>
                <option value="USD">دلار آمریکا ($)</option>
                <option value="EUR">یورو (€)</option>
                <option value="AED">درهم امارات (AED)</option>
              </select>
            </div>
          </div>

          {/* DMS Path */}
          <div className="space-y-1.5 text-right">
            <Label htmlFor="prj-dms">{t("createModal.dmsPath")}</Label>
            <Input
              id="prj-dms"
              value={dmsNetworkPath}
              onChange={(e) => setDmsNetworkPath(e.target.value)}
              placeholder={t("createModal.dmsPathPlaceholder")}
              className="font-mono text-xs dir-ltr text-left"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-start">{t("createModal.startDate")}</Label>
              <Input
                id="prj-start"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="1403/08/01"
              />
            </div>
            <div className="space-y-1.5 text-right">
              <Label htmlFor="prj-target">{t("createModal.targetDate")}</Label>
              <Input
                id="prj-target"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                placeholder="1404/04/30"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-right">
            <Label htmlFor="prj-desc">{t("createModal.description")}</Label>
            <Textarea
              id="prj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("createModal.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("createModal.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !title.trim() ||
                !clientName.trim() ||
                !quotationNumber.trim()
              }
            >
              {isSubmitting ? "در حال ایجاد..." : t("createModal.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
