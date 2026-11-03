"use client";
import type { UserRole } from "@/types/auth";

import React, { useState, useEffect } from "react";
import { 
  Mail, Phone, ShieldCheck, ShieldAlert, GraduationCap, Users, UserCheck, 
  Briefcase, Eye, EyeOff, Building2, RotateCw, Settings
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types/admin.types";
import { AnimatedNumber } from "./AdminTasksTime";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { PRIMARY_COLORS } from "@/config/settings";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { getCompanyFromEmail } from "../utils/company";
import { cn } from "@/lib/utils";
import { getRoleGradient, getRoleGlowShadow } from "@/lib/role-avatar";
import { api } from "@/services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminProfileStatsProps {
  selectedUser: User;
  onUpdateRole?: (userId: string, newRole: UserRole) => Promise<void>;
}

export function AdminProfileStats({ selectedUser, onUpdateRole }: AdminProfileStatsProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const companyInfo = getCompanyFromEmail(selectedUser.email);
  const { colorId } = usePrimaryColor();
  const { user: currentUser } = useAuth();

  const [showSalary, setShowSalary] = useState(false);
  const [liveAvatarColor, setLiveAvatarColor] = useState<string | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRoleForChange, setSelectedRoleForChange] = useState<UserRole>(selectedUser.role);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    setSelectedRoleForChange(selectedUser.role);
  }, [selectedUser.role]);

  const handleOpenRoleDialog = () => {
    setSelectedRoleForChange(selectedUser.role);
    setIsRoleDialogOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedRoleForChange || selectedRoleForChange === selectedUser.role) return;
    try {
      setIsUpdatingRole(true);
      if (onUpdateRole) {
        await onUpdateRole(selectedUser.id, selectedRoleForChange);
      } else {
        await api.admin.updateUser(selectedUser.id, { role: selectedRoleForChange });
        toast.success(
          isRtl
            ? `نقش کاربر «${selectedUser.name}» با موفقیت تغییر کرد.`
            : `User role successfully updated.`
        );
      }
      setIsRoleDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در تغییر نقش کاربر" : "Failed to change user role"));
    } finally {
      setIsUpdatingRole(false);
    }
  };

  useEffect(() => {
    const handleAvatarColorChange = (e: any) => {
      if (e?.detail?.avatarColor && selectedUser.id === currentUser?.id) {
        setLiveAvatarColor(e.detail.avatarColor);
      }
    };
    window.addEventListener("esp_avatar_color_changed", handleAvatarColorChange);
    return () => window.removeEventListener("esp_avatar_color_changed", handleAvatarColorChange);
  }, [selectedUser.id, currentUser?.id]);

  // Dynamic primary and avatar color syncing with profile management
  const effectiveAvatarColor = selectedUser.id === currentUser?.id
    ? (liveAvatarColor || currentUser?.avatarColor || selectedUser.avatarColor)
    : selectedUser.avatarColor;

  const effectivePrimaryColorId = selectedUser.id === currentUser?.id
    ? (currentUser?.primaryColor || colorId)
    : (selectedUser.primaryColor || colorId);

  const matchedPreset = PRIMARY_COLORS.find(c => c.id === effectivePrimaryColorId);
  const avatarBgColor = (effectiveAvatarColor?.startsWith('#') ? effectiveAvatarColor : undefined)
    || matchedPreset?.hex 
    || PRIMARY_COLORS.find(c => c.id === colorId)?.hex
    || '#3a86ff';

  const isSuperAdmin = selectedUser.role === 'superadmin';
  const isAdmin = selectedUser.role === 'admin';

  // Real or Fallback values
  const age = selectedUser.age || 32;
  const isMarried = selectedUser.maritalStatus ? selectedUser.maritalStatus === 'married' : true;
  const childrenCount = selectedUser.childrenCount ?? 2;
  const experienceCount = 350;
  
  const insType = selectedUser.insuranceType || 'complementary';
  const insStatus = insType === 'none' ? 'inactive' : 'active';
  const insPlan = insType === 'complementary' ? 'golden' : 'regular';
  const insDependents = childrenCount + (isMarried ? 1 : 0);

  const educationField = selectedUser.educationField || t("defaultEducationField");
  const educationDegree = selectedUser.educationDegree ? t(`degreesOptions.${selectedUser.educationDegree}` as any) : t("degreesOptions.master");

  const insuranceStyles = {
    active: {
      golden: { text: "text-amber-500", icon: ShieldCheck },
      silver: { text: "text-slate-400 dark:text-slate-300", icon: ShieldCheck },
      regular: { text: "text-sky-500", icon: ShieldCheck }
    },
    inactive: {
      golden: { text: "text-rose-500", icon: ShieldAlert },
      silver: { text: "text-rose-500", icon: ShieldAlert },
      regular: { text: "text-rose-500", icon: ShieldAlert }
    }
  };

  const currentIns = insuranceStyles[insStatus][insPlan];
  const InsIcon = currentIns.icon;

  const enName = (selectedUser.firstName || selectedUser.lastName)
    ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()
    : (selectedUser.fullName || selectedUser.name || selectedUser.email?.split('@')[0]);

  const faName = (selectedUser.firstNameFa || selectedUser.lastNameFa)
    ? `${selectedUser.firstNameFa || ''} ${selectedUser.lastNameFa || ''}`.trim()
    : (selectedUser.fullNameFa || selectedUser.name || enName);

  const displayName = isRtl ? faName : enName;

  const firstLetter = (displayName || selectedUser.name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-3 w-full h-full select-none">
      
      {/* ── 1. Profile Header Card (Avatar, Badges & Contacts) ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-2xs flex-1 min-h-[210px] overflow-hidden transition-all">
        {/* Avatar Ring */}
        <div 
          className={cn(
            "p-[3px] rounded-full shrink-0 transition-transform duration-300",
            getRoleGradient(selectedUser.role),
            getRoleGlowShadow(selectedUser.role),
            isSuperAdmin && "animate-[spin_10s_linear_infinite]"
          )}
        >
          <div className="p-1 rounded-full bg-white dark:bg-card">
            <div 
              className="size-16 sm:size-20 lg:size-24 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl lg:text-4xl text-white select-none shadow-inner transition-all duration-300"
              style={{ backgroundColor: avatarBgColor }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedUser.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {firstLetter}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* User Name */}
        <h2 className="text-foreground font-bold text-sm sm:text-base 2xl:text-lg mt-1.5 truncate max-w-full leading-tight">
          {displayName}
        </h2>

        {/* Role & Company Badges */}
        <div className="flex items-center justify-center gap-1.5 flex-nowrap mt-1 max-w-full overflow-hidden">
          <button
            type="button"
            onClick={handleOpenRoleDialog}
            title={isRtl ? "کلیک جهت تغییر نقش و سطح دسترسی" : "Click to manage user role and access"}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border shadow-2xs shrink-0 transition-colors cursor-pointer group",
              selectedUser.role === 'superadmin'
                ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border-rose-500/35 font-bold"
                : selectedUser.role === 'admin'
                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/35 font-bold"
                : selectedUser.role === 'dept_admin'
                ? "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                : selectedUser.role === 'office_admin'
                ? "bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/20"
                : selectedUser.role === 'manager'
                ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20"
                : selectedUser.role === 'engineer'
                ? "bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/20"
                : selectedUser.role === 'staff'
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : selectedUser.role === 'customer'
                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20"
            )}
          >
            {selectedUser.role === 'superadmin' || selectedUser.role === 'admin' ? (
              <ShieldCheck size={11} className="stroke-[2.5]" />
            ) : selectedUser.role === 'dept_admin' || selectedUser.role === 'manager' ? (
              <Users size={11} className="stroke-[2.5]" />
            ) : selectedUser.role === 'office_admin' ? (
              <Building2 size={11} className="stroke-[2.5]" />
            ) : selectedUser.role === 'engineer' ? (
              <Briefcase size={11} className="stroke-[2.5]" />
            ) : (
              <UserCheck size={11} className="stroke-[2.5]" />
            )}
            <span>
              {selectedUser.role === 'superadmin' ? t("roleSuperadmin") :
               selectedUser.role === 'admin' ? t("roleAdmin") :
               selectedUser.role === 'dept_admin' ? t("roleDeptAdmin") :
               selectedUser.role === 'office_admin' ? t("roleOfficeAdmin") :
               selectedUser.role === 'manager' ? t("roleManager") :
               selectedUser.role === 'engineer' ? t("roleEngineer") :
               selectedUser.role === 'staff' ? t("roleStaff") :
               selectedUser.role === 'customer' ? t("roleCustomer") :
               t("roleUser")}
            </span>
            <Settings size={9} className="opacity-50 group-hover:opacity-100 transition-opacity ms-0.5" />
          </button>

          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border shadow-2xs shrink-0",
              companyInfo.id === "npceram"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                : companyInfo.id === "holding"
                ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25"
                : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25"
            )}
          >

            <span className="truncate">{isRtl ? companyInfo.nameFa : companyInfo.nameEn}</span>
          </div>
        </div>

        {/* Contact Links */}
        <div className="flex items-center justify-center gap-x-2.5 mt-1.5 w-full text-[11px] text-muted-foreground flex-nowrap overflow-hidden max-w-full">
          {selectedUser.email && (
            <a
              href={`mailto:${selectedUser.email}`}
              dir="ltr"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[150px] font-medium"
              title={selectedUser.email}
            >
              <Mail size={11} className="shrink-0 opacity-70" />
              <span className="truncate">{selectedUser.email}</span>
            </a>
          )}
          {selectedUser.phone && (
            <span
              dir="ltr"
              className="inline-flex items-center gap-1 font-medium fa-num shrink-0"
              title={selectedUser.phone}
            >
              <Phone size={11} className="shrink-0 opacity-70" />
              <span>{selectedUser.phone}</span>
            </span>
          )}
        </div>

      </div>

      {/* ── Boxes Under Avatar: Expanded down to the end of the page ── */}
      <div className="flex flex-col gap-3 shrink-0 w-full">
        
        {/* ── 2. Education Card (مستقیماً زیر باکس آواتار) ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-2xl py-2 px-3 sm:px-3.5 flex items-center justify-center text-center shadow-2xs shrink-0 min-h-[44px] h-auto overflow-hidden w-full">
          <div 
            className="flex items-center justify-center gap-2 px-1 max-w-full"
            title={isRtl ? `${educationDegree} ${educationField}` : `${educationDegree} of ${educationField}`}
          >
            <GraduationCap size={15} className="stroke-[2.2] text-primary shrink-0" />
            <span className="text-xs sm:text-[13px] font-bold text-foreground truncate">
              {isRtl ? `${educationDegree} ${educationField}` : `${educationDegree} of ${educationField}`}
            </span>
          </div>
        </div>

        {/* ── 3. Performance & Career Stats Card ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2.5 sm:p-3 flex flex-col justify-center shadow-2xs shrink-0 min-h-[140px] h-auto overflow-hidden w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-2.5 w-full h-full min-h-0">
            {/* Days in Company */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col justify-center items-center text-center shadow-2xs min-w-0 overflow-hidden flex-1 h-full transition-all">
              <div className="flex items-baseline justify-center gap-1 leading-tight">
                <span className="text-sm sm:text-base lg:text-lg 2xl:text-xl font-bold text-foreground fa-num">
                  <AnimatedNumber value={selectedUser?.daysInCompany || 0} />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground truncate">{t("daysUnit")}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">{t("inCompany")}</span>
            </div>

            {/* Projects Done */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col justify-center items-center text-center shadow-2xs min-w-0 overflow-hidden flex-1 h-full transition-all">
              <div className="flex items-baseline justify-center gap-1 leading-tight">
                <span className="text-sm sm:text-base lg:text-lg 2xl:text-xl font-bold text-foreground fa-num">
                  <AnimatedNumber value={selectedUser?.doneProjects || 0} />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground truncate">{t("projectsUnit")}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">{t("projectsDone")}</span>
            </div>

            {/* Work Experience */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col justify-center items-center text-center shadow-2xs min-w-0 overflow-hidden flex-1 h-full transition-all">
              <div className="flex items-baseline justify-center gap-0.5 leading-tight">
                <span dir="ltr" className="inline-flex items-baseline font-bold text-sm sm:text-base lg:text-lg 2xl:text-xl text-foreground fa-num">
                  {experienceCount > 99 && <span className="text-primary font-bold text-xs sm:text-sm me-0.5">+</span>}
                  <AnimatedNumber value={Math.min(experienceCount, 99)} />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground truncate ms-1">{t("experienceUnit")}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">{t("workExperience")}</span>
            </div>

            {/* Salary with Eye Toggle */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col justify-center items-center text-center relative group shadow-2xs min-w-0 overflow-hidden flex-1 h-full transition-all">
              <button 
                type="button"
                onClick={() => setShowSalary(!showSalary)}
                className="absolute top-1 end-1 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10"
                title={showSalary ? t("hideSalary") : t("showSalary")}
              >
                {showSalary ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <div className="flex items-center justify-center w-full px-2 leading-tight">
                <span className="text-sm sm:text-base lg:text-lg 2xl:text-xl font-bold text-foreground font-mono truncate fa-num">
                  {showSalary ? (
                    <AnimatedNumber 
                      value={selectedUser?.salary || 0} 
                      format={(val) => `${val.toLocaleString()}`} 
                    />
                  ) : (
                    "••••••"
                  )}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">{t("salary")}</span>
            </div>
          </div>
        </div>

        {/* ── 4 & 5. Responsive Grid for Demographics and Insurance on Medium Screens ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 w-full">
          {/* ── 4. Personal Demographics Card ── */}
          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2.5 sm:p-3 flex items-center justify-center shadow-2xs shrink-0 min-h-[85px] h-auto overflow-hidden w-full">
            <div className="grid grid-cols-3 gap-1 divide-x divide-x-reverse divide-border/30 text-center bg-background/60 dark:bg-slate-900/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 lg:p-3 border border-border/30 w-full h-full items-center">
              {/* Age */}
              <div className="flex flex-col items-center justify-center px-1 min-w-0">
                <span className="text-sm sm:text-base lg:text-lg 2xl:text-xl font-bold text-foreground fa-num">
                  <AnimatedNumber value={age} />
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">{t("age")}</span>
              </div>

              {/* Marital Status */}
              <div className="flex flex-col items-center justify-center px-1 min-w-0">
                <span className="text-xs sm:text-sm lg:text-base 2xl:text-lg font-bold text-foreground truncate max-w-full">
                  {isMarried ? t("married") : t("single")}
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">{t("maritalStatus")}</span>
              </div>

              {/* Children */}
              <div className="flex flex-col items-center justify-center px-1 min-w-0">
                <span className="text-sm sm:text-base lg:text-lg 2xl:text-xl font-bold text-foreground fa-num">
                  <AnimatedNumber value={childrenCount} />
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">{t("children")}</span>
              </div>
            </div>
          </div>

          {/* ── 5. Insurance & Healthcare Card (باکس بیمه تکمیلی) ── */}
          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs shrink-0 min-h-[115px] h-auto overflow-hidden w-full">
            <div className="flex items-center justify-between gap-2 mb-2 px-0.5 shrink-0">
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm lg:text-base font-bold text-foreground truncate">
                  {insType !== 'none' ? t("insuranceTitle", { type: t(`insuranceOptions.${insType}`) }) : t("insuranceOptions.none")}
                </span>
                <span className={`text-[10px] sm:text-xs font-semibold ${currentIns.text}`}>
                  {t(`insuranceStatus.${insStatus}`)}
                </span>
              </div>
              <InsIcon size={20} className={`shrink-0 sm:size-6 ${currentIns.text}`} />
            </div>

            {/* کارتهای داخل باکس بیمه تکمیلی با فاصله و حاشیه استاندارد از لبه */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full flex-1">
              {/* Card 1: طرح بیمه */}
              <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center items-center text-center shadow-2xs border border-border/30 min-w-0 flex-1 transition-all">
                <span className="text-xs sm:text-sm font-bold text-foreground truncate max-w-full">
                  {insType !== 'none' ? t(`insurancePlans.${insPlan}`) : "-"}
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">
                  {t("insPlanLabel")}
                </span>
              </div>

              {/* Card 2: افراد تحت تکفل */}
              <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center items-center text-center shadow-2xs border border-border/30 min-w-0 flex-1 transition-all">
                <span className="text-xs sm:text-sm font-bold text-foreground truncate fa-num">
                  {insType !== 'none' ? (
                    <>
                      <AnimatedNumber value={insDependents} />
                      <span className="text-[0.8em] font-medium text-muted-foreground ms-1">{t("personUnit")}</span>
                    </>
                  ) : "-"}
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1 truncate">
                  {t("insDependentsLabel")}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Role Change Dialog ─── */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ShieldAlert className="size-5 text-primary" />
              <span>{isRtl ? "تعیین و تغییر نقش کاربر" : "Manage User Role"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isRtl
                ? `نقش و سطح دسترسی کاربر «${selectedUser.name}» را در سیستم تعیین نمایید.`
                : `Select the system role and permission level for ${selectedUser.name}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 max-h-[60vh] overflow-y-auto pe-1">
            {[
              ...(currentUser?.role === 'superadmin' ? [{
                role: "superadmin" as const,
                label: t("roleSuperadmin"),
                desc: t("roleSuperadminDesc"),
                icon: ShieldAlert,
                color: "text-rose-600 dark:text-rose-400",
                bg: "bg-rose-500/10",
                border: "border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/30",
                checkBg: "bg-rose-600",
              }] : []),
              {
                role: "admin" as const,
                label: t("roleAdmin"),
                desc: t("roleAdminDesc"),
                icon: ShieldCheck,
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30",
                checkBg: "bg-amber-600",
              },
              {
                role: "dept_admin" as const,
                label: t("roleDeptAdmin"),
                desc: t("roleDeptAdminDesc"),
                icon: Users,
                color: "text-indigo-600 dark:text-indigo-400",
                bg: "bg-indigo-500/10",
                border: "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/30",
                checkBg: "bg-indigo-600",
              },
              {
                role: "office_admin" as const,
                label: t("roleOfficeAdmin"),
                desc: t("roleOfficeAdminDesc"),
                icon: Building2,
                color: "text-teal-600 dark:text-teal-400",
                bg: "bg-teal-500/10",
                border: "border-teal-500 bg-teal-500/5 ring-1 ring-teal-500/30",
                checkBg: "bg-teal-600",
              },
              {
                role: "manager" as const,
                label: t("roleManager"),
                desc: t("roleManagerDesc"),
                icon: Users,
                color: "text-purple-600 dark:text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/30",
                checkBg: "bg-purple-500",
              },
              {
                role: "engineer" as const,
                label: t("roleEngineer"),
                desc: t("roleEngineerDesc"),
                icon: Briefcase,
                color: "text-sky-600 dark:text-sky-400",
                bg: "bg-sky-500/10",
                border: "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30",
                checkBg: "bg-sky-500",
              },
              {
                role: "staff" as const,
                label: t("roleStaff"),
                desc: t("roleStaffDesc"),
                icon: Building2,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30",
                checkBg: "bg-emerald-500",
              },
              {
                role: "customer" as const,
                label: t("roleCustomer"),
                desc: t("roleCustomerDesc"),
                icon: UserCheck,
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30",
                checkBg: "bg-amber-600",
              },
              {
                role: "user" as const,
                label: t("roleUser"),
                desc: t("roleUserDesc"),
                icon: UserCheck,
                color: "text-slate-600 dark:text-slate-400",
                bg: "bg-slate-500/10",
                border: "border-slate-500 bg-slate-500/5 ring-1 ring-slate-500/30",
                checkBg: "bg-slate-500",
              },
            ].map((rc) => {
              const IconComp = rc.icon;
              const isSelected = selectedRoleForChange === rc.role;
              return (
                <div
                  key={rc.role}
                  onClick={() => setSelectedRoleForChange(rc.role)}
                  className={cn(
                    "flex flex-col gap-1.5 p-3 rounded-2xl border cursor-pointer transition-all text-start group",
                    isSelected
                      ? cn("shadow-xs", rc.border)
                      : "border-border/60 hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-7 rounded-lg flex items-center justify-center shrink-0", rc.bg, rc.color)}>
                        <IconComp className="size-3.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {rc.label}
                      </span>
                    </div>
                    {isSelected && (
                      <span className={cn("size-4 rounded-full text-white flex items-center justify-center text-[10px]", rc.checkBg)}>
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                    {rc.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRoleDialogOpen(false)}
              className="rounded-xl"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isUpdatingRole || selectedRoleForChange === selectedUser.role}
              onClick={handleConfirmRoleChange}
              className="rounded-xl min-w-[100px]"
            >
              {isUpdatingRole ? (
                <span className="flex items-center gap-1.5">
                  <RotateCw className="size-3.5 animate-spin" />
                  <span>{isRtl ? "در حال ذخیره..." : "Saving..."}</span>
                </span>
              ) : (
                isRtl ? "ذخیره تغییرات" : "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
