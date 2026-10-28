"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, Phone, ShieldCheck, ShieldAlert, GraduationCap, Users, UserCheck, 
  Briefcase, Eye, EyeOff, Building2
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

interface AdminProfileStatsProps {
  selectedUser: User;
}

export function AdminProfileStats({ selectedUser }: AdminProfileStatsProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const companyInfo = getCompanyFromEmail(selectedUser.email);
  const { colorId } = usePrimaryColor();
  const { user: currentUser } = useAuth();

  const [showSalary, setShowSalary] = useState(false);
  const [liveAvatarColor, setLiveAvatarColor] = useState<string | null>(null);

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

  const firstLetter = selectedUser.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-3 w-full h-full select-none">
      
      {/* ── 1. Profile Header Card (Avatar, Badges & Contacts) ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-2xs shrink-0 h-[210px] min-h-[210px] max-h-[210px] overflow-hidden">
        {/* Avatar Ring */}
        <div 
          className={`p-[2.5px] rounded-full shrink-0 transition-transform duration-300 ${
            isAdmin 
              ? "bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] shadow-md" 
              : "shadow-xs"
          }`}
          style={!isAdmin ? { backgroundColor: `${avatarBgColor}35` } : undefined}
        >
          <div className="p-1 rounded-full bg-white dark:bg-card">
            <div 
              className="size-16 sm:size-18 2xl:size-20 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl text-white select-none shadow-inner"
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
          {selectedUser.name}
        </h2>

        {/* Role & Company Badges */}
        <div className="flex items-center justify-center gap-1.5 flex-nowrap mt-1 max-w-full overflow-hidden">
          {isAdmin ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs shrink-0">
              <ShieldCheck size={11} className="stroke-[2.5]" />
              <span>{t("roleAdmin")}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs min-w-0 shrink">
              <UserCheck size={11} className="stroke-[2.5] shrink-0" />
              <span className="truncate max-w-[120px]">{selectedUser.jobTitle || t("roleUser")}</span>
            </div>
          )}

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
            <Building2 size={10} className="stroke-[2]" />
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
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        
        {/* ── 2. Education Card (مستقیماً زیر باکس آواتار) ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-2xl py-2 px-3 sm:px-3.5 flex items-center justify-center text-center shadow-2xs shrink-0 h-[44px] min-h-[44px] max-h-[44px] overflow-hidden">
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
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2.5 sm:p-3 flex flex-col justify-center shadow-2xs flex-[1.6] min-h-[145px] max-h-[185px] overflow-hidden">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full h-full min-h-0">
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
                      format={(val) => `$${val.toLocaleString()}`} 
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

        {/* ── 4. Personal Demographics Card ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2.5 sm:p-3 flex items-center justify-center shadow-2xs flex-1 min-h-[75px] max-h-[95px] overflow-hidden">
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

        {/* ── 5. Insurance & Healthcare Card ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs flex-[1.2] min-h-[110px] max-h-[135px] overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2 shrink-0">
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

          <div className="grid grid-cols-2 gap-2 bg-background/50 dark:bg-slate-900/30 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border border-border/20 flex-1 items-center">
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">{t("insPlanLabel")}</span>
              <span className="text-xs sm:text-sm lg:text-base font-bold text-foreground truncate">{insType !== 'none' ? t(`insurancePlans.${insPlan}`) : "-"}</span>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">{t("insDependentsLabel")}</span>
              <span className="text-xs sm:text-sm lg:text-base font-bold text-foreground truncate fa-num">
                {insType !== 'none' ? <><AnimatedNumber value={insDependents} /> <span className="text-[0.8em] font-medium text-muted-foreground">{t("personUnit")}</span></> : "-"}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
