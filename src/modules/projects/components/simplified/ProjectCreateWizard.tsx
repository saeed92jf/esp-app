// src/modules/projects/components/simplified/ProjectCreateWizard.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  FolderPlus,
  Calendar,
  FileText,
  ShieldCheck,
  Search,
  UserCheck,
  Plus,
  X,
  UploadCloud,
  Paperclip,
  Download,
  AlertCircle,
  Clock,
  Layers,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker, getJalaliDate } from "@/components/ui/date-picker";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { formatPersonName, formatRoleName } from "@/lib/person-names";
import { toast } from "sonner";
import type { User } from "@/types/auth";
import {
  SimplifiedProject,
  SimplifiedProjectCreate,
  ProjectCategory,
  PROJECT_CATEGORIES,
  PROJECT_TYPE_OPTIONS,
  ProjectDocument,
  ProjectSchedulePhase,
} from "../../types/simplified-projects.types";
import { simplifiedProjectsService } from "../../services/simplified-projects.service";
import { ProjectCategoryBadge } from "./ProjectCategoryBadge";
import { customersService } from "@/modules/customers/services/customers.service";
import { AddCustomerModal } from "@/modules/customers/components/AddCustomerModal";
import type { Customer } from "@/modules/customers/types/customers.types";
import {
  getAttachmentIcon,
  readAttachmentFile,
  downloadAttachment,
} from "@/modules/tasks/components/TaskAttachmentList";

interface ProjectCreateWizardProps {
  currentUser: User;
  onProjectCreated: (project: SimplifiedProject) => void;
  onCancel: () => void;
}

interface PersonnelItem {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  role?: string;
  company?: string;
  avatarColor?: string;
}

const DEFAULT_CLIENT_OPTIONS: ComboboxOption[] = [
  { value: "شرکت صنایع پتروشیمی خلیج فارس", label: "شرکت صنایع پتروشیمی خلیج فارس" },
  { value: "شرکت پتروشیمی نوری", label: "شرکت پتروشیمی نوری" },
  { value: "شرکت نفت و گاز پارس (POGDC)", label: "شرکت نفت و گاز پارس (POGDC)" },
  { value: "شرکت پالایش نفت اصفهان", label: "شرکت پالایش نفت اصفهان" },
  { value: "شرکت پالایش نفت بندرعباس", label: "شرکت پالایش نفت بندرعباس" },
  { value: "شرکت مهندسی و ساخت توربین مپنا (توگا)", label: "شرکت مهندسی و ساخت توربین مپنا (توگا)" },
  { value: "شرکت پتروشیمی بوعلی سینا", label: "شرکت پتروشیمی بوعلی سینا" },
  { value: "شرکت پتروشیمی پارس", label: "شرکت پتروشیمی پارس" },
  { value: "شرکت ملی نفت ایران (NIOC)", label: "شرکت ملی نفت ایران (NIOC)" },
];

const DEFAULT_SCHEDULE_PHASES: { id: string; title: string; titleEn: string; defaultDays: number }[] = [
  { id: "ph1", title: "مهندسی (Engineering)", titleEn: "Engineering", defaultDays: 20 },
  { id: "ph2", title: "نقشه‌های ارسالی جهت تایید (Drawing for Approval - DFA)", titleEn: "Drawing for Approval (DFA)", defaultDays: 15 },
  { id: "ph3", title: "تاییدیه کارفرما (Customer Approval)", titleEn: "Customer Approval", defaultDays: 10 },
  { id: "ph4", title: "تامین و ساخت (Procurement & Fabrication)", titleEn: "Procurement & Fabrication", defaultDays: 35 },
  { id: "ph5", title: "بسته‌بندی و بارگیری (Packaging & Loading)", titleEn: "Packaging & Loading", defaultDays: 10 },
];

export function ProjectCreateWizard({
  currentUser,
  onProjectCreated,
  onCancel,
}: ProjectCreateWizardProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer options loading & modal
  const [customerOptions, setCustomerOptions] = useState<ComboboxOption[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // Personnel loading
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = useState(true);

  // Step 1: Base Details
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("COLUMN INT.");
  const [client, setClient] = useState("شرکت صنایع پتروشیمی خلیج فارس");
  const [espNumber, setEspNumber] = useState(`ESP-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [service, setService] = useState("");
  const [managerId, setManagerId] = useState(currentUser.id);
  const [managerName, setManagerName] = useState(
    currentUser.fullNameFa || currentUser.fullName || currentUser.name || (isRtl ? "سعید جلیلی" : "Saeed Jalili")
  );
  const [projectTypes, setProjectTypes] = useState<string[]>(["مهندسی", "ساخت"]);
  const [company, setCompany] = useState("یورو اسلات پارس");
  const [description, setDescription] = useState("");

  // Step 2: Schedule
  const [startDateObj, setStartDateObj] = useState<Date | undefined>(new Date());
  const [startDateStr, setStartDateStr] = useState<string>("");
  const [phases, setPhases] = useState<
    { id: string; title: string; titleEn: string; durationDays: number }[]
  >(DEFAULT_SCHEDULE_PHASES.map((p) => ({ ...p, durationDays: p.defaultDays })));

  // Step 3: Documents
  const [docTitleInput, setDocTitleInput] = useState("");
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load personnel
  useEffect(() => {
    let isMounted = true;
    async function loadPersonnel() {
      setIsLoadingPersonnel(true);
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const json = await res.json();
          const items: any[] = Array.isArray(json) ? json : (json.data || json.users || []);
          if (isMounted) {
            const mapped = items.map((u) => ({
              id: u.id,
              name: u.fullNameFa || u.name || u.fullName || u.email?.split("@")[0] || "کاربر",
              email: u.email || "",
              jobTitle: u.jobTitle || u.role || "کارشناس",
              role: u.role,
              company: u.company || (u.companyId === "nano" ? "نانو پالایش سرام" : "یورو اسلات پارس"),
              avatarColor: u.avatarColor || "#0284c7",
            }));
            setPersonnelList(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to load personnel:", err);
      } finally {
        if (isMounted) setIsLoadingPersonnel(false);
      }
    }
    loadPersonnel();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Customers options
  useEffect(() => {
    let isMounted = true;
    async function loadCustomers() {
      try {
        setIsLoadingCustomers(true);
        const opts = await customersService.getCustomerOptions(undefined, 800);
        if (isMounted && opts.length > 0) {
          const seen = new Set<string>();
          const mapped: ComboboxOption[] = [];
          for (const c of opts) {
            let val = (c.value || c.label || "").trim();
            if (!val) continue;
            if (seen.has(val)) {
              const extra = (c.company_name_en && c.company_name_en !== val) ? c.company_name_en : c.city;
              if (extra) {
                val = `${val} (${extra})`;
              } else {
                val = `${val} - ${c.id}`;
              }
            }
            if (!seen.has(val)) {
              seen.add(val);
              const petroHint = c.holding_name_fa ? `هلدینگ ${c.holding_name_fa}` : (c.is_petrochemical ? "صنایع پتروشیمی" : undefined);
              mapped.push({
                value: val,
                label: val,
                hint: petroHint || (c.industry ? `${c.industry}${c.city ? ` - ${c.city}` : ""}` : c.city || undefined),
              });
            }
          }
          setCustomerOptions(mapped);
        } else if (isMounted) {
          setCustomerOptions(DEFAULT_CLIENT_OPTIONS);
        }
      } catch {
        if (isMounted) setCustomerOptions(DEFAULT_CLIENT_OPTIONS);
      } finally {
        if (isMounted) setIsLoadingCustomers(false);
      }
    }
    loadCustomers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNewCustomerAdded = (newCust: Customer) => {
    const custName = (newCust.persian_title_fa || newCust.company_name_en).trim();
    const petroHint = newCust.holding_name_fa ? `هلدینگ ${newCust.holding_name_fa}` : (newCust.is_petrochemical ? "صنایع پتروشیمی" : undefined);
    const newOpt: ComboboxOption = {
      value: custName,
      label: custName,
      hint: petroHint || (newCust.industry ? `${newCust.industry}${newCust.city ? ` - ${newCust.city}` : ""}` : newCust.city || undefined),
    };
    setCustomerOptions((prev) => [newOpt, ...prev]);
    setClient(custName);
    toast.success(
      isRtl ? `کارفرمای «${custName}» انتخاب شد.` : `Client "${custName}" selected.`
    );
  };

  // Compute Jalali start date on mount
  useEffect(() => {
    if (startDateObj) {
      const j = getJalaliDate(startDateObj);
      setStartDateStr(`${j.year}/${String(j.month).padStart(2, "0")}/${String(j.day).padStart(2, "0")}`);
    }
  }, [startDateObj]);

  // Compute Total Days from sum of phase durations
  const totalDays = useMemo(() => {
    return phases.reduce((acc, p) => acc + (Number(p.durationDays) || 0), 0);
  }, [phases]);

  const steps = [
    { n: 1, labelFa: "مشخصات پایه", labelEn: "Base Details", icon: FolderPlus },
    { n: 2, labelFa: "اسکجول و زمان‌بندی", labelEn: "Schedule", icon: Calendar },
    { n: 3, labelFa: "مستندات و فایل‌ها", labelEn: "Documents", icon: FileText },
    { n: 4, labelFa: "ریویو و تایید نهایی", labelEn: "Review & Approval", icon: ShieldCheck },
  ];

  const toggleProjectType = (typeId: string) => {
    setProjectTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handlePhaseDaysChange = (phaseId: string, days: number) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, durationDays: Math.max(0, days) } : p))
    );
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const title = docTitleInput.trim() || (isRtl ? "مستند فنی پروژه" : "Project Document");
    setIsUploadingDocs(true);
    const newDocs: ProjectDocument[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const item = await readAttachmentFile(file);
          newDocs.push({
            id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: files.length > 1 ? `${title} (${i + 1})` : title,
            fileName: item.name,
            fileSize: item.size,
            fileType: item.type,
            url: item.url,
            uploadedAt: new Date().toISOString(),
            uploadedBy: managerName,
          });
        } catch (err: any) {
          toast.error(err.message || `خطا در خواندن فایل ${file.name}`);
        }
      }

      if (newDocs.length > 0) {
        setDocuments((prev) => [...prev, ...newDocs]);
        setDocTitleInput("");
        toast.success(
          isRtl
            ? `${newDocs.length} مستند اضافه شد.`
            : `${newDocs.length} document(s) uploaded.`
        );
      }
    } finally {
      setIsUploadingDocs(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const canProceed = () => {
    if (step === 1) {
      return name.trim().length > 0 && espNumber.trim().length > 0 && client.trim().length > 0;
    }
    if (step === 2) {
      return totalDays > 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(isRtl ? "نام پروژه الزامی است." : "Project name is required.");
      return;
    }
    if (!espNumber.trim()) {
      toast.error(isRtl ? "شماره ESP الزامی است." : "ESP Number is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const schedulePhases: ProjectSchedulePhase[] = phases.map((p) => ({
        id: p.id,
        title: p.title,
        titleEn: p.titleEn,
        durationDays: p.durationDays,
        progress: 0,
        status: "pending",
      }));

      const payload: SimplifiedProjectCreate = {
        name: name.trim(),
        category,
        client: client.trim(),
        espNumber: espNumber.trim(),
        service: service.trim() || (isRtl ? "سرویس استاندارد نفت و گاز" : "Standard Process Service"),
        managerId,
        managerName,
        projectTypes: projectTypes.length > 0 ? projectTypes : ["مهندسی", "ساخت"],
        documents,
        schedule: {
          totalDays,
          startDate: startDateStr,
          phases: schedulePhases,
        },
        company,
        description: description.trim(),
        status: "todo",
      };

      const created = await simplifiedProjectsService.createProject(payload);
      toast.success(isRtl ? "پروژه با موفقیت ایجاد شد." : "Project created successfully.");
      onProjectCreated(created);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ایجاد پروژه" : "Failed to create project"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "COLUMN INT.", label: "COLUMN INT. (اینترنال‌های برج)", hint: "سینی‌های تقطیر، غربالی، پکینگ‌های ساختاریافته" },
      { value: "SEPARATOR INT.", label: "SEPARATOR INT. (اینترنال‌های تفکیک‌گر)", hint: "سیستم‌های کوالسر، وین‌پک و جداسازها" },
      { value: "FILTRATION", label: "FILTRATION (فیلتراسیون)", hint: "المنت‌های اسلات‌دار، سبدهای صافی، بسترهای شنی" },
      { value: "REACTOR INT.", label: "REACTOR INT. (اینترنال‌های راکتور)", hint: "توزیع‌کننده‌ها و شبکه‌های نگهدارنده کاتالیست" },
      { value: "SPECIAL ITEMS", label: "SPECIAL ITEMS (اقلام و تجهیزات خاص)", hint: "تجهیزات سفارشی مهندسی و آلیاژهای پیشرفته" },
      { value: "MISCELLANEOUS", label: "MISCELLANEOUS (متفرقه)", hint: "اسپول‌های پایپینگ و تجهیزات جانبی" },
      { value: "PROCESSING PKG.", label: "PROCESSING PKG. (پکیج‌های فرآیندی)", hint: "اسکیدها و پکیج‌های یکپارچه فرآیندی" },
    ],
    []
  );

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      {/* ── Steps Indicator ── */}
      <div className="flex items-center justify-between gap-1 mb-8 max-w-2xl mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.n;
          const isDone = step > s.n;
          return (
            <React.Fragment key={s.n}>
              <div
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => (isDone ? setStep(s.n) : null)}
              >
                <div
                  className={cn(
                    "size-10 sm:size-11 rounded-full border-2 flex items-center justify-center transition-all",
                    isDone
                      ? "bg-primary border-primary text-white shadow-xs"
                      : isActive
                      ? "bg-primary/10 border-primary text-primary ring-4 ring-primary/10"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="size-4 stroke-[3]" /> : <Icon className="size-4" />}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold whitespace-nowrap",
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {isRtl ? s.labelFa : s.labelEn}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mb-5 mx-2 transition-colors",
                    step > s.n ? "bg-primary" : "bg-border/60"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Wizard Body Container ── */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-xs">
        <AnimatePresence mode="wait">
          {/* ═════════ STEP 1: BASE DETAILS ═════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-1 text-foreground flex items-center gap-2">
                  <FolderPlus className="size-5 text-primary" />
                  <span>{isRtl ? "مرحله اول: مشخصات و اطلاعات پایه پروژه" : "Step 1: Project Information"}</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? "نام پروژه، دسته‌بندی تجهیزات، کارفرما، شماره ESP، سرویس و مدیر پروژه را تعیین نمایید."
                    : "Enter project title, equipment category, client, ESP number, and PM."}
                </p>
              </div>

              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                  <span>{isRtl ? "نام پروژه *" : "Project Name *"}</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isRtl
                      ? "مثال: طراحی و ساخت اینترنال‌های برج تقطیر واحد الفین..."
                      : "e.g. Design and Fabrication of Olefin Distillation Column Internals..."
                  }
                  className="rounded-xl h-11 text-sm bg-background"
                  autoFocus
                />
              </div>

              {/* Equipment Category * (Combobox without icons) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <span>{isRtl ? "دسته‌بندی تجهیزات (Equipment Category) *" : "Equipment Category *"}</span>
                  </label>
                  <ProjectCategoryBadge category={category} size="sm" />
                </div>
                <Combobox
                  options={categoryOptions}
                  value={category}
                  onChange={(val) => setCategory((val || "COLUMN INT.") as ProjectCategory)}
                  placeholder={isRtl ? "انتخاب دسته‌بندی تجهیزات..." : "Select equipment category..."}
                  className="w-full h-11 rounded-xl text-sm"
                  allowClear={false}
                />
              </div>

              {/* Client & ESP Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                      <Building2 className="size-4 text-primary" />
                      <span>{isRtl ? "کارفرما (مشتری) *" : "Client *"}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerModalOpen(true)}
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="size-3" />
                      <span>{isRtl ? "افزودن کارفرمای جدید" : "Add Client"}</span>
                    </button>
                  </div>
                  <Combobox
                    options={customerOptions.length > 0 ? customerOptions : DEFAULT_CLIENT_OPTIONS}
                    value={client}
                    onChange={(val) => setClient(val || "")}
                    placeholder={
                      isLoadingCustomers
                        ? (isRtl ? "در حال دریافت کارفرمایان..." : "Loading clients...")
                        : (isRtl ? "انتخاب یا جستجوی کارفرما..." : "Select client...")
                    }
                    className="w-full h-11 rounded-xl text-sm"
                    allowClear={false}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <span>{isRtl ? "شماره پروژه ESP (ESP Number) *" : "ESP Number *"}</span>
                  </label>
                  <Input
                    value={espNumber}
                    onChange={(e) => setEspNumber(e.target.value)}
                    placeholder="e.g. ESP-2026-105"
                    className="rounded-xl h-11 text-sm bg-background font-mono uppercase"
                  />
                </div>
              </div>

              {/* Service & Project Manager */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <span>{isRtl ? "سرویس (شرایط فرآیندی / سیال کاری)" : "Operating Service / Fluid"}</span>
                  </label>
                  <Input
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder={isRtl ? "مثال: Sour Gas & H2S, Sour Crude, Steam..." : "e.g. Acid Gas & Hydrocarbons"}
                    className="rounded-xl h-11 text-sm bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <UserCheck className="size-4 text-primary" />
                    <span>{isRtl ? "مدیر پروژه (Project Manager)" : "Project Manager"}</span>
                  </label>
                  <select
                    value={managerId}
                    onChange={(e) => {
                      setManagerId(e.target.value);
                      const found = personnelList.find((p) => p.id === e.target.value);
                      if (found) setManagerName(found.name);
                    }}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {personnelList.length > 0 ? (
                      personnelList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {formatPersonName(p.name, locale)}
                        </option>
                      ))
                    ) : (
                      <option value={currentUser.id}>{formatPersonName(managerName, locale)}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Project Types (Multi-select) */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <label className="text-xs sm:text-sm font-semibold block">
                  {isRtl
                    ? "نوع پروژه (امکان انتخاب هم‌زمان چند گزینه: مهندسی، ساخت، تامین، قطعات یدکی، تحقیق و توسعه...)"
                    : "Project Types (Multi-select)"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPE_OPTIONS.map((t) => {
                    const isSelected = projectTypes.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleProjectType(t.id)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer select-none",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                            : "bg-muted/40 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[3]" />}
                        <span>{isRtl ? t.labelFa : t.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="text-xs sm:text-sm font-semibold">
                  {isRtl ? "توضیحات و الزامات فنی پروژه (اختیاری)" : "Technical Scope & Requirements"}
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isRtl
                      ? "استانداردها (ASME Sec VIII, NACE)، متریال، مشخصات تحویل..."
                      : "Engineering standards, MTCs, special criteria..."
                  }
                  className="rounded-xl resize-none min-h-[90px] text-sm bg-background"
                />
              </div>
            </motion.div>
          )}

          {/* ═════════ STEP 2: SCHEDULE & PHASES ═════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-1 text-foreground flex items-center gap-2">
                  <Calendar className="size-5 text-primary" />
                  <span>{isRtl ? "مرحله دوم: اسکجول و زمان‌بندی فازهای پروژه" : "Step 2: Project Schedule"}</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? "توتال تایم کل پروژه و مدت زمان روزهای هر یک از فازهای ۵ گانه را وارد نمایید."
                    : "Specify project timeline, total duration, and phase breakdown."}
                </p>
              </div>

              {/* Total Time & Start Date Summary Banner */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{isRtl ? "توتال تایم کل پروژه:" : "Total Project Duration:"}</span>
                    <p className="text-xl font-extrabold text-primary fa-num">
                      {totalDays} {isRtl ? "روز کاری" : "working days"}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground mb-1">{isRtl ? "تاریخ شروع پروژه:" : "Start Date:"}</span>
                    <DatePicker
                      value={startDateObj}
                      onChange={(d) => {
                        setStartDateObj(d);
                        if (d) {
                          const j = getJalaliDate(d);
                          setStartDateStr(`${j.year}/${String(j.month).padStart(2, "0")}/${String(j.day).padStart(2, "0")}`);
                        }
                      }}
                      isJalali={isRtl}
                      className="h-10 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Phase Breakdown Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>{isRtl ? "توزیع زمانی فازهای اجرایی:" : "Timeline Phase Distribution:"}</span>
                  <span className="fa-num">100%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden flex">
                  {phases.map((ph, idx) => {
                    const widthPct = totalDays > 0 ? (ph.durationDays / totalDays) * 100 : 20;
                    const colors = [
                      "bg-blue-500",
                      "bg-amber-500",
                      "bg-emerald-500",
                      "bg-violet-500",
                      "bg-rose-500",
                    ];
                    return (
                      <div
                        key={ph.id}
                        className={cn("h-full transition-all", colors[idx % colors.length])}
                        style={{ width: `${widthPct}%` }}
                        title={`${ph.title}: ${ph.durationDays} ${isRtl ? "روز" : "days"}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 5 Specific Phases Inputs */}
              <div className="space-y-3 pt-2">
                <label className="text-xs sm:text-sm font-semibold block">
                  {isRtl ? "تعیین مدت زمان هر فاز (روز):" : "Duration for each phase (days):"}
                </label>

                {phases.map((ph, idx) => (
                  <div
                    key={ph.id}
                    className="p-3.5 rounded-2xl border border-border/60 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-7 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 fa-num">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-foreground">{ph.title}</p>
                        <p className="text-[11px] text-muted-foreground">{ph.titleEn}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Input
                        type="number"
                        min="1"
                        value={ph.durationDays}
                        onChange={(e) => handlePhaseDaysChange(ph.id, parseInt(e.target.value) || 0)}
                        className="w-24 h-10 rounded-xl text-center font-bold fa-num bg-background text-sm"
                      />
                      <span className="text-xs text-muted-foreground">{isRtl ? "روز" : "days"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═════════ STEP 3: DOCUMENTS & ATTACHMENTS ═════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-1 text-foreground flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <span>{isRtl ? "مرحله سوم: مستندات، نقشه‌ها و فایل‌های فنی" : "Step 3: Documents & Drawings"}</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? "عنوان مستند را وارد کرده و فایل‌های مربوطه (DWG, PDF, Excel و ...) را به تعداد نامحدود پیوست نمایید."
                    : "Add document title and attach unlimited engineering files and drawings."}
                </p>
              </div>

              {/* Title input + Upload trigger */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold">
                    {isRtl ? "عنوان یا موضوع مدرک / نقشه" : "Document / Drawing Title"}
                  </label>
                  <Input
                    value={docTitleInput}
                    onChange={(e) => setDocTitleInput(e.target.value)}
                    placeholder={
                      isRtl
                        ? "مثال: نقشه چیدمان عمومی، دیتاشیت تجهیز، مشخصات متریال..."
                        : "e.g. General Arrangement Drawing, Process Datasheet..."
                    }
                    className="rounded-xl h-11 text-sm bg-background"
                  />
                </div>

                {/* Dropzone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center select-none border-border/70 hover:border-primary/50 bg-background/50 hover:bg-muted/40"
                >
                  <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    {isUploadingDocs ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <UploadCloud className="size-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {isUploadingDocs
                        ? (isRtl ? "در حال آپلود و پردازش..." : "Uploading...")
                        : (isRtl ? "برای انتخاب فایل کلیک کنید یا فایل‌ها را اینجا رها کنید" : "Click to browse or drop files here")}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isRtl
                        ? "پشتیبانی از فایل‌های اتوکد (DWG, DXF)، اسناد PDF، اکسل و تصاویر (تعداد نامحدود)"
                        : "Supports DWG, DXF, PDF, Excel, and Images (Unlimited)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Paperclip className="size-4 text-primary" />
                    <span>{isRtl ? "فهرست مستندات پیوست‌شده:" : "Attached Documents:"}</span>
                  </span>
                  <span className="fa-num">
                    {documents.length} {isRtl ? "مستند" : "document(s)"}
                  </span>
                </div>

                {documents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl bg-muted/10">
                    {isRtl ? "هنوز فایلی پیوست نشده است." : "No documents attached yet."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {documents.map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="p-3 rounded-2xl border border-border/60 bg-background hover:bg-muted/30 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 border border-border/40">
                            {getAttachmentIcon(doc.fileType, doc.fileName, "size-5")}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-foreground truncate" title={doc.title}>
                              {doc.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate" title={doc.fileName}>
                              {doc.fileName} {doc.fileSize ? `• ${doc.fileSize}` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {doc.url && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadAttachment({ name: doc.fileName, url: doc.url })}
                              className="size-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                              title={isRtl ? "دانلود فایل" : "Download"}
                            >
                              <Download className="size-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(idx)}
                            className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title={isRtl ? "حذف" : "Remove"}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═════════ STEP 4: REVIEW & APPROVAL ═════════ */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-1 text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-600" />
                  <span>{isRtl ? "مرحله چهارم: بررسی و تایید نهایی پروژه" : "Step 4: Review & Approval"}</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? "مشخصات ثبت‌شده پروژه را بررسی کرده و برای ثبت نهایی روی دکمه تایید کلیک کنید."
                    : "Review project information before final confirmation."}
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-3xl bg-muted/20 border border-border/60 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <ProjectCategoryBadge category={category} size="md" className="mb-2" />
                    <h3 className="text-lg font-extrabold text-foreground">{name}</h3>
                    <p className="text-xs font-mono text-primary font-bold mt-0.5">{espNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{isRtl ? "کارفرما:" : "Client:"}</span>
                    <span className="font-bold text-foreground">{client}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{isRtl ? "مدیر پروژه:" : "PM:"}</span>
                    <span className="font-bold text-foreground">{formatPersonName(managerName, locale)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{isRtl ? "سرویس فرآیندی:" : "Service:"}</span>
                    <span className="font-bold text-foreground">{service || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{isRtl ? "مدت کل زمان:" : "Total Time:"}</span>
                    <span className="font-bold text-primary fa-num">{totalDays} {isRtl ? "روز" : "days"}</span>
                  </div>
                </div>

                {projectTypes.length > 0 && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground block mb-1.5">{isRtl ? "نوع پروژه:" : "Types:"}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {projectTypes.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Timeline Preview */}
              <div className="p-4 rounded-2xl border border-border/60 bg-card space-y-2.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" />
                  <span>{isRtl ? "برنامه زمان‌بندی فازها:" : "Phases Schedule:"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {phases.map((ph, idx) => (
                    <div key={ph.id} className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block truncate">{ph.title}</span>
                      <span className="text-sm font-extrabold text-foreground fa-num">
                        {ph.durationDays} {isRtl ? "روز" : "d"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Count Summary */}
              <div className="p-4 rounded-2xl border border-border/60 bg-card flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">{isRtl ? "مستندات و نقشه‌های بارگذاری‌شده:" : "Attached Documents:"}</span>
                </div>
                <span className="text-xs font-bold fa-num text-primary">
                  {documents.length} {isRtl ? "مستند آماده ذخیره" : "document(s)"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onCustomerAdded={handleNewCustomerAdded}
      />

      {/* ── Wizard Navigation Footer ── */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => (step > 1 ? setStep(step - 1) : onCancel())}
          className="rounded-xl gap-2 h-11 px-5"
        >
          {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          <span>{step === 1 ? (isRtl ? "انصراف" : "Cancel") : (isRtl ? "مرحله قبل" : "Previous")}</span>
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="rounded-xl gap-2 h-11 px-6 font-semibold"
            disabled={!canProceed()}
          >
            <span>{isRtl ? "مرحله بعد" : "Next"}</span>
            {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="rounded-xl gap-2 h-11 px-8 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isSubmitting || !canProceed()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{isRtl ? "در حال ثبت پروژه..." : "Creating..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>{isRtl ? "ثبت نهایی و ساخت پروژه" : "Create Project"}</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

