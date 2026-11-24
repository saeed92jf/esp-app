"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  UserCircle2,
  Briefcase,
  FileText,
  HeartPulse,
  GraduationCap,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  KeyRound,
  Edit2,
  Check,
  X,
  Save,
  Loader2,
  Hash,
  Award,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { api } from "@/services";
import { cn } from "@/lib/utils";
import { User } from "../types/admin.types";
import {
  ESP_DEPARTMENTS,
  ESP_LOCATIONS,
  ESP_ROLES,
  ESP_EMPLOYMENT_STATUSES,
  ESP_CONTRACT_TYPES,
  ESP_DEGREES,
  ESP_BASIC_INSURANCES,
  ESP_SUPPLEMENTARY_PLANS,
  ESP_SUPPLEMENTARY_PROVIDERS,
  ESP_MARITAL_STATUSES,
  ESP_MILITARY_STATUSES,
  toComboboxOptions,
} from "../data/esp-master-lists";

export type DossierCategory =
  | "personal"
  | "organizational"
  | "contract"
  | "insurance"
  | "education"
  | "system";

export interface AdminUserDossierPanelProps {
  user: User;
  onUserUpdated: (updatedUser: User) => void;
  onClose?: () => void;
}

export function AdminUserDossierPanel({
  user,
  onUserUpdated,
  onClose,
}: AdminUserDossierPanelProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeTab, setActiveTab] = useState<DossierCategory>("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Form Data state (populated from user)
  const [formData, setFormData] = useState<Partial<User>>({});

  // Reset form data whenever active tab or user changes
  const initFormData = () => {
    setFormData({
      firstNameFa: user.firstNameFa || user.fullNameFa?.split(" ")[0] || "",
      lastNameFa: user.lastNameFa || user.fullNameFa?.split(" ").slice(1).join(" ") || "",
      firstName: user.firstName || user.fullName?.split(" ")[0] || "",
      lastName: user.lastName || user.fullName?.split(" ").slice(1).join(" ") || "",
      nationalId: user.nationalId || "",
      phone: user.phone || user.mobile || "",
      mobile: user.mobile || user.phone || "",
      birthDate: user.birthDate || "",
      age: user.age || 30,
      gender: user.gender || "مرد",
      maritalStatus: user.maritalStatus || "مجرد",
      childrenCount: user.childrenCount ?? 0,
      militaryStatus: (user as any).militaryStatus || (user as any).militaryDuty || "پایان خدمت",
      address: user.address || "",

      // Organizational
      department: user.department || "مهندسی و طراحی",
      jobTitle: user.jobTitle || "",
      employeeId: user.employeeId || (user as any).personnelCode || "",
      personnelCode: (user as any).personnelCode || user.employeeId || "",
      manager: user.manager || "",
      workLocation: user.workLocation || "کارخانه پرند یورواسلات",
      joinedAt: user.joinedAt || user.createdAt || "",
      extensionNumber: (user as any).extensionNumber || "",

      // Contract
      employmentStatus: user.employmentStatus || (user.accountStatus === "inactive" ? "قطع همکاری" : "فعال"),
      accountStatus: user.accountStatus || "active",
      contractType: user.contractType || "تمام وقت",
      salary: user.salary || 350000000,
      hasOvertime: user.hasOvertime ?? true,
      maxOvertimeHours: user.maxOvertimeHours ?? 40,

      // Insurance
      insuranceType: user.insuranceType || "تأمین اجتماعی",
      insuranceCode: user.insuranceCode || "",
      supplementaryPlan: (user as any).supplementaryPlan || "طلایی (Golden)",
      supplementaryProvider: (user as any).supplementaryProvider || "SOS (کمک رسان ایران)",
      shebaNumber: user.shebaNumber || "",

      // Education
      educationDegree: user.educationDegree || "کارشناسی",
      educationField: user.educationField || "",
      university: user.university || "",
      graduationYear: (user as any).graduationYear || "",

      // System
      role: user.role || "engineer",
      email: user.email || "",
    });
  };

  // Init on mount or user change
  React.useEffect(() => {
    initFormData();
    setIsEditing(false);
  }, [user]);

  const handleSaveCurrentCategory = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<User> = { ...formData };
      
      // Auto-compute full names
      if (updates.firstNameFa || updates.lastNameFa) {
        updates.fullNameFa = `${updates.firstNameFa || ""} ${updates.lastNameFa || ""}`.trim();
        updates.name = updates.fullNameFa;
      }
      if (updates.firstName || updates.lastName) {
        updates.fullName = `${updates.firstName || ""} ${updates.lastName || ""}`.trim();
      }

      // Sync status
      if (updates.employmentStatus) {
        if (updates.employmentStatus.includes("غیرفعال") || updates.employmentStatus.includes("قطع")) {
          updates.accountStatus = "inactive" as any;
          updates.status = "offline";
        } else {
          updates.accountStatus = "active" as any;
        }
      }

      await api.admin.updateUser(user.id, updates);
      const mergedUser: User = { ...user, ...updates };
      onUserUpdated(mergedUser);
      setIsEditing(false);
      toast.success(
        isRtl ? "تغییرات با موفقیت در پایگاه داده ذخیره شد." : "Changes saved successfully."
      );
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ذخیره تغییرات" : "Failed to save changes"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    initFormData();
    setIsEditing(false);
  };

  // 6 Categorized Tabs Configuration with Icons
  const CATEGORIES = [
    { id: "personal" as const, labelFa: "هویتی و فردی", labelEn: "Personal", icon: UserCircle2, color: "text-blue-600 dark:text-blue-400" },
    { id: "organizational" as const, labelFa: "سازمانی و شغلی", labelEn: "Organizational", icon: Briefcase, color: "text-emerald-600 dark:text-emerald-400" },
    { id: "contract" as const, labelFa: "قرارداد و همکاری", labelEn: "Contract & Status", icon: FileText, color: "text-amber-600 dark:text-amber-400" },
    { id: "insurance" as const, labelFa: "بیمه و درمان", labelEn: "Insurance", icon: HeartPulse, color: "text-rose-600 dark:text-rose-400" },
    { id: "education" as const, labelFa: "تحصیلات و سوابق", labelEn: "Education", icon: GraduationCap, color: "text-purple-600 dark:text-purple-400" },
    { id: "system" as const, labelFa: "سیستم و دسترسی", labelEn: "System & Roles", icon: ShieldCheck, color: "text-indigo-600 dark:text-indigo-400" },
  ];

  return (
    <div className="flex flex-col gap-3.5 w-full text-xs">
      {/* ── Top Bar: User Identity Summary + Actions ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          {user.avatar || (user as any).photoUrl ? (
            <img
              src={user.avatar || (user as any).photoUrl}
              alt={user.name}
              className="size-11 rounded-2xl object-cover shrink-0 border border-border/60 shadow-xs"
            />
          ) : (
            <div
              className="size-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
              style={{ backgroundColor: user.avatarColor || "#0284c7" }}
            >
              {user.name ? user.name.slice(0, 2) : "ESP"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">{user.name}</h3>
              <Badge variant="outline" className="text-[10px] h-5 font-mono bg-muted/60 fa-num">
                #{user.employeeId || user.id}
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/25 font-semibold">
                یورواسلات پارس
              </Badge>
              {user.accountStatus === "inactive" || user.employmentStatus === "قطع همکاری" ? (
                <Badge variant="destructive" className="text-[10px] h-5 bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">
                  قطع همکاری
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  فعال (شاغل)
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate" dir="ltr">
              {user.email || "No email assigned"}
            </p>
          </div>
        </div>

        {/* Edit Mode Toggle & Save Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8.5 px-3.5 rounded-xl border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 text-xs font-semibold gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Edit2 className="size-3.5" />
              <span>{isRtl ? "ویرایش اطلاعات این بخش" : "Edit This Section"}</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="h-8.5 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5 me-1" />
                <span>{isRtl ? "انصراف" : "Cancel"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveCurrentCategory}
                disabled={isSaving}
                className="h-8.5 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm cursor-pointer"
              >
                {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>{isRtl ? "ذخیره تغییرات" : "Save Changes"}</span>
              </Button>
            </div>
          )}

          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
              title={isRtl ? "بستن" : "Close"}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Icon Tab Navigation (دسته‌بندی‌های مختلف در لبه آیکون) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-border/30">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <Button
              key={cat.id}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab(cat.id);
                setIsEditing(false); // Reset to View Mode on tab switch
              }}
              className={cn(
                "h-9 px-3.5 rounded-xl text-xs font-semibold gap-2 shrink-0 transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : cat.color)} />
              <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
            </Button>
          );
        })}
      </div>

      {/* ── Category Content Body: View Mode vs Edit Mode with Comboboxes ── */}
      <div className="p-4 rounded-2xl bg-background/90 dark:bg-slate-900/40 border border-border/50 shadow-xs">
        {/* ══════════════ TAB 1: PERSONAL / هویتی و فردی ══════════════ */}
        {activeTab === "personal" && (
          <div>
            {!isEditing ? (
              /* View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نام و نام خانوادگی (فارسی)" : "Full Name (FA)"}</span>
                  <span className="font-semibold text-foreground text-sm">{user.fullNameFa || user.name || "—"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نام و نام خانوادگی (انگلیسی)" : "Full Name (EN)"}</span>
                  <span className="font-semibold text-foreground text-sm" dir="ltr">{user.fullName || "—"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "کد ملی" : "National ID"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num">{user.nationalId || "—"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "شماره موبایل" : "Mobile Number"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num" dir="ltr">{user.phone || user.mobile || "—"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "وضعیت تأهل و تعداد فرزندان" : "Marital Status"}</span>
                  <span className="font-semibold text-foreground fa-num">
                    {user.maritalStatus === "married" || user.maritalStatus === "متاهل" ? "متأهل" : "مجرد"} • {user.childrenCount ?? 0} فرزند
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "وضعیت نظام وظیفه" : "Military Duty"}</span>
                  <span className="font-semibold text-foreground">{(user as any).militaryStatus || (user as any).militaryDuty || "پایان خدمت"}</span>
                </div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "آدرس محل سکونت" : "Residential Address"}</span>
                  <span className="font-medium text-foreground">{user.address || "تهران / حومه"}</span>
                </div>
              </div>
            ) : (
              /* Edit Mode with Comboboxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "نام (فارسی)" : "First Name (FA)"}</Label>
                  <Input
                    value={formData.firstNameFa || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, firstNameFa: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "نام خانوادگی (فارسی)" : "Last Name (FA)"}</Label>
                  <Input
                    value={formData.lastNameFa || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, lastNameFa: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "کد ملی" : "National ID"}</Label>
                  <Input
                    value={formData.nationalId || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, nationalId: e.target.value }))}
                    dir="ltr"
                    className="h-8.5 text-xs rounded-xl font-mono fa-num"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "شماره تماس / موبایل" : "Mobile Phone"}</Label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value, mobile: e.target.value }))}
                    dir="ltr"
                    className="h-8.5 text-xs rounded-xl font-mono fa-num"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "وضعیت تأهل" : "Marital Status"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_MARITAL_STATUSES, isRtl)}
                    value={formData.maritalStatus || "مجرد"}
                    onChange={(val) => setFormData((p) => ({ ...p, maritalStatus: val as any }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "وضعیت نظام وظیفه" : "Military Status"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_MILITARY_STATUSES, isRtl)}
                    value={(formData as any).militaryStatus || "پایان خدمت"}
                    onChange={(val) => setFormData((p) => ({ ...p, militaryStatus: val } as any))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <Label className="text-xs">{isRtl ? "نشانی کامل" : "Address"}</Label>
                  <Input
                    value={formData.address || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB 2: ORGANIZATIONAL / سازمانی و شغلی ══════════════ */}
        {activeTab === "organizational" && (
          <div>
            {!isEditing ? (
              /* View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "دپارتمان / واحد سازمانی" : "Department"}</span>
                  <span className="font-bold text-foreground text-sm">{user.department || "مهندسی و طراحی"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "عنوان شغلی / سمت" : "Job Title"}</span>
                  <span className="font-semibold text-foreground text-sm">{user.jobTitle || "کارشناس"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "کد پرسنلی" : "Personnel Code"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num">{user.employeeId || (user as any).personnelCode || "—"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "محل خدمت" : "Work Location"}</span>
                  <span className="font-semibold text-foreground">{user.workLocation || "کارخانه پرند یورواسلات"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "مدیر مستقیم" : "Direct Manager"}</span>
                  <span className="font-semibold text-foreground">{user.manager || "مدیرعامل / معاونت"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "شماره داخلی" : "Extension (EXT)"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num">{(user as any).extensionNumber || "101"}</span>
                </div>
              </div>
            ) : (
              /* Edit Mode with Comboboxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "دپارتمان سازمانی" : "Department"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_DEPARTMENTS, isRtl)}
                    value={formData.department || "مهندسی و طراحی"}
                    onChange={(val) => setFormData((p) => ({ ...p, department: val }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "عنوان شغلی" : "Job Title"}</Label>
                  <Input
                    value={formData.jobTitle || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, jobTitle: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "کد پرسنلی" : "Personnel Code"}</Label>
                  <Input
                    value={formData.employeeId || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, employeeId: e.target.value, personnelCode: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl font-mono fa-num"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "محل خدمت" : "Work Location"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_LOCATIONS, isRtl)}
                    value={formData.workLocation || "کارخانه پرند یورواسلات"}
                    onChange={(val) => setFormData((p) => ({ ...p, workLocation: val }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "مدیر مستقیم" : "Manager"}</Label>
                  <Input
                    value={formData.manager || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, manager: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "داخلی (EXT)" : "Extension"}</Label>
                  <Input
                    value={(formData as any).extensionNumber || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, extensionNumber: e.target.value } as any))}
                    className="h-8.5 text-xs rounded-xl font-mono fa-num"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB 3: CONTRACT / قرارداد و همکاری ══════════════ */}
        {activeTab === "contract" && (
          <div>
            {!isEditing ? (
              /* View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "وضعیت همکاری" : "Employment Status"}</span>
                  <div>
                    {user.accountStatus === "inactive" || user.employmentStatus === "قطع همکاری" ? (
                      <Badge variant="destructive" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">
                        غیرفعال (قطع همکاری)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                        فعال (شاغل)
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نوع قرارداد" : "Contract Type"}</span>
                  <span className="font-bold text-foreground text-sm">{user.contractType || "تمام وقت"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "حقوق ناخالص ماهیانه" : "Salary"}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono fa-num text-sm">
                    {(user.salary || 350000000).toLocaleString()} {isRtl ? "ریال" : "IRR"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "وضعیت اضافه کاری" : "Overtime Eligibility"}</span>
                  <span className="font-semibold text-foreground">
                    {user.hasOvertime ? (isRtl ? `مجاز (تا ${user.maxOvertimeHours || 40} ساعت)` : `Allowed (${user.maxOvertimeHours || 40}h)`) : (isRtl ? "غیرمجاز" : "Not Allowed")}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "تاریخ استخدام / پیوستن" : "Join Date"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num">{user.joinedAt || "—"}</span>
                </div>
              </div>
            ) : (
              /* Edit Mode with Comboboxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "وضعیت همکاری" : "Employment Status"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_EMPLOYMENT_STATUSES, isRtl)}
                    value={formData.employmentStatus || "فعال"}
                    onChange={(val) => setFormData((p) => ({ ...p, employmentStatus: val }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "نوع قرارداد" : "Contract Type"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_CONTRACT_TYPES, isRtl)}
                    value={formData.contractType || "تمام وقت"}
                    onChange={(val) => setFormData((p) => ({ ...p, contractType: val }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "حقوق ناخالص (ریال)" : "Salary (IRR)"}</Label>
                  <Input
                    type="number"
                    value={formData.salary || 0}
                    onChange={(e) => setFormData((p) => ({ ...p, salary: Number(e.target.value) }))}
                    dir="ltr"
                    className="h-8.5 text-xs rounded-xl font-mono fa-num"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB 4: INSURANCE / بیمه و درمان ══════════════ */}
        {activeTab === "insurance" && (
          <div>
            {!isEditing ? (
              /* View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نوع بیمه پایه" : "Basic Insurance"}</span>
                  <span className="font-bold text-foreground text-sm">{user.insuranceType || "تأمین اجتماعی"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "شماره بیمه پایه" : "Insurance Code"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num">{user.insuranceCode || "—"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "طرح بیمه تکمیلی" : "Supplementary Plan"}</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{(user as any).supplementaryPlan || "طلایی (Golden)"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "شرکت بیمه‌گر تکمیلی" : "Insurance Provider"}</span>
                  <span className="font-semibold text-foreground">{(user as any).supplementaryProvider || "SOS (کمک رسان ایران)"}</span>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "شماره شبا بانکی" : "IBAN / Sheba"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num" dir="ltr">{user.shebaNumber || "IR000000000000000000000000"}</span>
                </div>
              </div>
            ) : (
              /* Edit Mode with Comboboxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "بیمه پایه" : "Basic Insurance"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_BASIC_INSURANCES, isRtl)}
                    value={formData.insuranceType || "تأمین اجتماعی"}
                    onChange={(val) => setFormData((p) => ({ ...p, insuranceType: val as any }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "شماره بیمه" : "Insurance Code"}</Label>
                  <Input
                    value={formData.insuranceCode || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, insuranceCode: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl font-mono fa-num"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "طرح بیمه تکمیلی" : "Supplementary Plan"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_SUPPLEMENTARY_PLANS, isRtl)}
                    value={(formData as any).supplementaryPlan || "طلایی (Golden)"}
                    onChange={(val) => setFormData((p) => ({ ...p, supplementaryPlan: val } as any))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "بیمه‌گر تکمیلی" : "Provider"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_SUPPLEMENTARY_PROVIDERS, isRtl)}
                    value={(formData as any).supplementaryProvider || "SOS (کمک رسان ایران)"}
                    onChange={(val) => setFormData((p) => ({ ...p, supplementaryProvider: val } as any))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">{isRtl ? "شماره شبا (IBAN)" : "Sheba Number"}</Label>
                  <Input
                    value={formData.shebaNumber || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, shebaNumber: e.target.value }))}
                    dir="ltr"
                    className="h-8.5 text-xs rounded-xl font-mono fa-num"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB 5: EDUCATION / تحصیلات و سوابق ══════════════ */}
        {activeTab === "education" && (
          <div>
            {!isEditing ? (
              /* View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "مدرک تحصیلی" : "Degree"}</span>
                  <span className="font-bold text-foreground text-sm">{user.educationDegree || "کارشناسی"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "رشته تحصیلی" : "Field of Study"}</span>
                  <span className="font-semibold text-foreground text-sm">{user.educationField || "مهندسی مکانیک"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "دانشگاه محل تحصیل" : "University"}</span>
                  <span className="font-semibold text-foreground">{user.university || "دانشگاه صنعتی شریف"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "سال فارغ‌التحصیلی" : "Graduation Year"}</span>
                  <span className="font-semibold text-foreground font-mono fa-num">{(user as any).graduationYear || "1395"}</span>
                </div>
              </div>
            ) : (
              /* Edit Mode with Comboboxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "مدرک تحصیلی" : "Education Degree"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_DEGREES, isRtl)}
                    value={formData.educationDegree || "کارشناسی"}
                    onChange={(val) => setFormData((p) => ({ ...p, educationDegree: val }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "رشته تحصیلی" : "Field of Study"}</Label>
                  <Input
                    value={formData.educationField || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, educationField: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "دانشگاه محل تحصیل" : "University"}</Label>
                  <Input
                    value={formData.university || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, university: e.target.value }))}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB 6: SYSTEM & ACCESS / سیستم و دسترسی ══════════════ */}
        {activeTab === "system" && (
          <div>
            {!isEditing ? (
              /* View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "نقش سیستمی در پلتفرم" : "System Role"}</span>
                  <Badge variant="secondary" className="font-bold text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25">
                    {user.role}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "ایمیل سازمانی" : "Corporate Email"}</span>
                  <span className="font-mono text-xs text-foreground select-all" dir="ltr">{user.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "رمز عبور سامانه" : "Password Status"}</span>
                  <span className="font-mono text-xs text-muted-foreground">••••••••••••</span>
                </div>
              </div>
            ) : (
              /* Edit Mode with Comboboxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRtl ? "نقش کاربری" : "Role"}</Label>
                  <Combobox
                    options={toComboboxOptions(ESP_ROLES, isRtl)}
                    value={formData.role || "engineer"}
                    onChange={(val) => setFormData((p) => ({ ...p, role: val as any }))}
                    allowClear={false}
                    size="sm"
                    triggerClassName="w-full justify-between h-8.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">{isRtl ? "ایمیل سازمانی" : "Email"}</Label>
                  <Input
                    value={formData.email || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    dir="ltr"
                    className="h-8.5 text-xs rounded-xl font-mono text-start"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
