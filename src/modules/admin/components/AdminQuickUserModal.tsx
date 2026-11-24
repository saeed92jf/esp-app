"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
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
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "@/services";
import { User } from "../types/admin.types";
import {
  UserPlus,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Building2,
  Mail,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import {
  ESP_DEPARTMENTS,
  ESP_LOCATIONS,
  ESP_ROLES,
  ESP_EMPLOYMENT_STATUSES,
  toComboboxOptions,
} from "../data/esp-master-lists";
import {
  getOrganizationDepartmentOptions,
  getOrganizationRoleOptions,
} from "@/config/organization";

export interface AdminQuickUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: User) => void;
  existingUsersCount?: number;
}

const generateSecurePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let pwd = "Esp@";
  for (let i = 0; i < 6; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

export function AdminQuickUserModal({
  isOpen,
  onClose,
  onUserCreated,
  existingUsersCount = 738,
}: AdminQuickUserModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const nextCodeNum = String(existingUsersCount + 1).padStart(3, "0");

  const [fullNameFa, setFullNameFa] = useState("");
  const [fullNameEn, setFullNameEn] = useState("");
  const [personnelCode, setPersonnelCode] = useState(`ESP-${nextCodeNum}`);
  const [nationalId, setNationalId] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("مهندسی و طراحی");
  const [jobTitle, setJobTitle] = useState("");
  const [workLocation, setWorkLocation] = useState("کارخانه پرند یورواسلات");
  const [role, setRole] = useState("engineer");
  const [employmentStatus, setEmploymentStatus] = useState("فعال");
  const [password, setPassword] = useState(generateSecurePassword);
  const [showPassword, setShowPassword] = useState(false);
  const [sendCredentialsEmail, setSendCredentialsEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-suggest email based on English name
  const handleEnNameChange = (val: string) => {
    setFullNameEn(val);
    const trimmed = val.trim();
    if (trimmed && !email.includes("@")) {
      const parts = trimmed.toLowerCase().split(/\s+/);
      if (parts.length >= 2) {
        const firstInitial = parts[0][0];
        const lastName = parts.slice(1).join("").replace(/[^a-z0-9]/g, "");
        setEmail(`${firstInitial}.${lastName}@euroslotpars.com`);
      } else if (parts.length === 1 && parts[0].length > 1) {
        setEmail(`${parts[0].replace(/[^a-z0-9]/g, "")}@euroslotpars.com`);
      }
    }
  };

  const handleResetForm = () => {
    setFullNameFa("");
    setFullNameEn("");
    setPersonnelCode(`ESP-${String(existingUsersCount + 1).padStart(3, "0")}`);
    setNationalId("");
    setMobile("");
    setEmail("");
    setDepartment("مهندسی و طراحی");
    setJobTitle("");
    setWorkLocation("کارخانه پرند یورواسلات");
    setRole("engineer");
    setEmploymentStatus("فعال");
    setPassword(generateSecurePassword());
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullNameFa.trim()) {
      toast.warning(isRtl ? "لطفاً نام و نام خانوادگی به فارسی را وارد نمایید." : "Persian full name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const partsFa = fullNameFa.trim().split(/\s+/);
      const firstNameFa = partsFa[0];
      const lastNameFa = partsFa.slice(1).join(" ") || partsFa[0];

      const partsEn = (fullNameEn.trim() || fullNameFa.trim()).split(/\s+/);
      const firstName = partsEn[0];
      const lastName = partsEn.slice(1).join(" ") || partsEn[0];

      const cleanEmail = email.trim().toLowerCase();
      const prefix = cleanEmail ? cleanEmail.split("@")[0].replace(/[^a-z0-9]/g, "") : `user${Date.now()}`;
      const newId = `u-${prefix}`;

      const isInactive = employmentStatus.includes("غیرفعال") || employmentStatus.includes("قطع");

      const newUserPayload: any = {
        id: newId,
        name: fullNameFa.trim(),
        fullNameFa: fullNameFa.trim(),
        firstNameFa,
        lastNameFa,
        fullName: fullNameEn.trim() || fullNameFa.trim(),
        firstName,
        lastName,
        email: cleanEmail || `${prefix}@euroslotpars.com`,
        phone: mobile.trim() || undefined,
        mobile: mobile.trim() || undefined,
        nationalId: nationalId.trim() || undefined,
        employeeId: personnelCode.trim(),
        personnelCode: personnelCode.trim(),
        department,
        jobTitle: jobTitle.trim() || (isRtl ? "کارشناس" : "Specialist"),
        workLocation,
        company: "یورواسلات پارس",
        companyId: "esp",
        role,
        status: isInactive ? "inactive" : "offline",
        accountStatus: isInactive ? "inactive" : "active",
        employmentStatus: isInactive ? "قطع همکاری" : "فعال",
        password,
        joinedAt: new Date().toISOString().split("T")[0],
        isProfileCompleted: true,
        adminApproved: true,
        managerApproved: true,
      };

      const created = await api.admin.createUser(newUserPayload);
      const finalUser = created || newUserPayload;

      toast.success(
        isRtl
          ? `حساب کاربری جدید برای «${fullNameFa.trim()}» با موفقیت تعریف شد.`
          : `New user account created for "${fullNameFa.trim()}".`
      );

      onUserCreated(finalUser);
      handleResetForm();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در ایجاد کاربر جدید" : "Failed to create user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-border/60 bg-background shadow-2xl">
        <DialogHeader className="p-5 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isRtl ? "ساخت و تعریف کاربر جدید" : "Add New User Account"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "تعریف سریع پرسنل جدید یورواسلات پارس (ESP CORE) با اطلاعات پایه سازمانی و دسترسی"
                  : "Quickly provision new Euroslot Pars staff with organizational profile and credentials"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Full Name FA */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{isRtl ? "نام و نام خانوادگی (فارسی)" : "Full Name (Persian)"}</span>
                <span className="text-rose-500 text-[11px]">*</span>
              </Label>
              <Input
                value={fullNameFa}
                onChange={(e) => setFullNameFa(e.target.value)}
                placeholder="مثلاً: علیرضا حسینی"
                required
                className="h-9 text-xs rounded-xl bg-background border-border/60"
              />
            </div>

            {/* 2. Full Name EN */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "نام و نام خانوادگی (انگلیسی)" : "Full Name (English)"}
              </Label>
              <Input
                value={fullNameEn}
                onChange={(e) => handleEnNameChange(e.target.value)}
                placeholder="e.g. Alireza Hosseini"
                dir="ltr"
                className="h-9 text-xs rounded-xl bg-background border-border/60 text-start"
              />
            </div>

            {/* 3. Personnel Code */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "کد پرسنلی" : "Personnel Code"}
              </Label>
              <Input
                value={personnelCode}
                onChange={(e) => setPersonnelCode(e.target.value)}
                placeholder="ESP-739"
                dir="ltr"
                className="h-9 text-xs rounded-xl bg-background border-border/60 text-start font-mono fa-num"
              />
            </div>

            {/* 4. National ID */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "کد ملی" : "National ID"}
              </Label>
              <Input
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="0012345678"
                dir="ltr"
                maxLength={10}
                className="h-9 text-xs rounded-xl bg-background border-border/60 text-start font-mono fa-num"
              />
            </div>

            {/* 5. Mobile Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "شماره موبایل" : "Mobile Number"}
              </Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="09121234567"
                dir="ltr"
                className="h-9 text-xs rounded-xl bg-background border-border/60 text-start font-mono fa-num"
              />
            </div>

            {/* 6. Corporate Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "ایمیل سازمانی (@euroslotpars.com)" : "Corporate Email"}
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="a.hosseini@euroslotpars.com"
                dir="ltr"
                className="h-9 text-xs rounded-xl bg-background border-border/60 text-start font-mono"
              />
            </div>

            {/* 7. Department (Combobox) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "دپارتمان سازمانی" : "Department"}
              </Label>
              <Combobox
                options={getOrganizationDepartmentOptions(isRtl)}
                value={department}
                onChange={(val) => {
                  setDepartment(val);
                  const roles = getOrganizationRoleOptions(val, isRtl);
                  if (roles.length > 0 && !roles.some((r) => r.value === jobTitle)) {
                    setJobTitle(roles[0].value);
                  }
                }}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-9 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>

            {/* 8. Job Title (Combobox) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "عنوان شغلی / سمت" : "Job Title"}
              </Label>
              <Combobox
                options={getOrganizationRoleOptions(department, isRtl)}
                value={jobTitle}
                onChange={(val) => setJobTitle(val)}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-9 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>

            {/* 9. Work Location (Combobox) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "محل خدمت" : "Work Location"}
              </Label>
              <Combobox
                options={toComboboxOptions(ESP_LOCATIONS, isRtl)}
                value={workLocation}
                onChange={(val) => setWorkLocation(val)}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-9 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>

            {/* 10. Role (Combobox) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "نقش سیستمی" : "System Role"}
              </Label>
              <Combobox
                options={toComboboxOptions(ESP_ROLES, isRtl)}
                value={role}
                onChange={(val) => setRole(val)}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-9 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>

            {/* 11. Employment Status (Combobox) */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-foreground">
                {isRtl ? "وضعیت همکاری" : "Employment Status"}
              </Label>
              <Combobox
                options={toComboboxOptions(ESP_EMPLOYMENT_STATUSES, isRtl)}
                value={employmentStatus}
                onChange={(val) => setEmploymentStatus(val)}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-9 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>
          </div>

          {/* Password Card */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground block">
                {isRtl ? "کلمه عبور اولیه حساب" : "Initial Account Password"}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary select-all" dir="ltr">
                  {showPassword ? password : "••••••••••••"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  className="size-6 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(password);
                    toast.success(isRtl ? "رمز عبور کپی شد." : "Password copied.");
                  }}
                  className="size-6 text-muted-foreground hover:text-foreground"
                >
                  <Copy size={13} />
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                const nextPwd = generateSecurePassword();
                setPassword(nextPwd);
                toast.info(isRtl ? "رمز عبور جدید تولید شد." : "New password generated.");
              }}
              className="gap-1.5 text-xs rounded-xl cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>{isRtl ? "تولید رمز جدید" : "Regenerate"}</span>
            </Button>
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <UserPlus className="size-3.5" />
              )}
              <span>{isRtl ? "ثبت و ایجاد کاربر" : "Create User"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
