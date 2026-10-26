"use client";

import React, { useState } from "react";
import { 
  Mail, Phone, ShieldCheck, ShieldAlert, GraduationCap, Users, UserCheck, 
  Briefcase, FolderKanban, Award, Eye, EyeOff, Calendar, Building2,
  ChevronRight, Sparkles, Layers
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
  const [activeDetailTab, setActiveDetailTab] = useState<'all' | 'personal' | 'insurance' | 'education'>('all');

  // Dynamic primary color syncing with profile management
  const userColorId = selectedUser.id === currentUser?.id
    ? (currentUser?.primaryColor || colorId)
    : (selectedUser.primaryColor || selectedUser.avatarColor);

  const matchedPreset = PRIMARY_COLORS.find(c => c.id === userColorId);
  const avatarBgColor = matchedPreset?.hex 
    || (selectedUser.avatarColor?.startsWith('#') ? selectedUser.avatarColor : undefined)
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
  const educationDegree = selectedUser.educationDegree ? t(`degreesOptions.${selectedUser.educationDegree}`) : t("degrees.master");

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
    <div className="flex flex-col gap-2.5 sm:gap-3 h-full min-h-0 overflow-y-auto custom-scrollbar pe-1 select-none">
      
      {/* ── 1. Profile Header Card (Adaptive Compact Avatar, Badges & Contacts) ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 2xl:p-4 flex flex-col items-center justify-center text-center shrink-0 shadow-2xs">
        
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
              className="size-16 sm:size-18 2xl:size-22 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl 2xl:text-4xl text-white select-none shadow-inner"
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
        <h2 className="text-foreground font-bold text-sm sm:text-base 2xl:text-lg mt-2 xl:mt-2.5 truncate max-w-full leading-tight">
          {selectedUser.name}
        </h2>

        {/* Role & Company Badges */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-1">
          {isAdmin ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
              <ShieldCheck size={11} className="stroke-[2.5]" />
              <span>{t("roleAdmin")}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <UserCheck size={11} className="stroke-[2.5]" />
              <span className="truncate max-w-[150px]">{selectedUser.jobTitle || t("roleUser")}</span>
            </div>
          )}

          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border shadow-2xs",
              companyInfo.id === "npceram"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25"
            )}
          >
            <Building2 size={10} className="stroke-[2]" />
            <span>{isRtl ? companyInfo.nameFa : companyInfo.nameEn}</span>
          </div>
        </div>

        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 mt-2 w-full text-[11px] text-muted-foreground">
          {selectedUser.email && (
            <a
              href={`mailto:${selectedUser.email}`}
              dir="ltr"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[170px] font-medium"
              title={selectedUser.email}
            >
              <Mail size={11} className="shrink-0 opacity-70" />
              <span className="truncate">{selectedUser.email}</span>
            </a>
          )}
          {selectedUser.phone && (
            <span
              dir="ltr"
              className="inline-flex items-center gap-1 font-medium fa-num"
              title={selectedUser.phone}
            >
              <Phone size={11} className="shrink-0 opacity-70" />
              <span>{selectedUser.phone}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Performance & Career Stats Card (Bulletproof Compact Grid, No Overflow) ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 2xl:p-4 flex flex-col justify-between shadow-2xs shrink-0 overflow-hidden">
        <div className="flex items-center justify-between text-muted-foreground px-0.5 mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Briefcase size={13} className="stroke-[2.2] text-primary" />
            <span className="text-[11px] font-bold text-foreground">{t("statsAndPerformance")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 2xl:gap-2.5 items-stretch">
          {/* Days in Company */}
          <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-2 sm:p-2.5 border border-border/30 flex flex-col justify-center text-center shadow-2xs overflow-hidden min-h-[50px]">
            <div className="flex items-baseline justify-center gap-1 leading-tight">
              <span className="text-sm sm:text-base 2xl:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={selectedUser?.daysInCompany || 0} />
              </span>
              <span className="text-[10px] font-medium text-muted-foreground truncate">{t("daysUnit")}</span>
            </div>
            <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{t("inCompany")}</span>
          </div>

          {/* Projects Done */}
          <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-2 sm:p-2.5 border border-border/30 flex flex-col justify-center text-center shadow-2xs overflow-hidden min-h-[50px]">
            <div className="flex items-baseline justify-center gap-1 leading-tight">
              <span className="text-sm sm:text-base 2xl:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={selectedUser?.doneProjects || 0} />
              </span>
              <span className="text-[10px] font-medium text-muted-foreground truncate">{t("projectsUnit")}</span>
            </div>
            <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{t("projectsDone")}</span>
          </div>

          {/* Work Experience */}
          <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-2 sm:p-2.5 border border-border/30 flex flex-col justify-center text-center shadow-2xs overflow-hidden min-h-[50px]">
            <div className="flex items-baseline justify-center gap-0.5 leading-tight">
              <span className="text-sm sm:text-base 2xl:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={Math.min(experienceCount, 99)} />
              </span>
              {experienceCount > 99 && <span className="text-primary font-bold text-xs">+</span>}
              <span className="text-[10px] font-medium text-muted-foreground truncate ms-0.5">{t("experienceUnit")}</span>
            </div>
            <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{t("workExperience")}</span>
          </div>

          {/* Salary with Eye Toggle */}
          <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-2 sm:p-2.5 border border-border/30 flex flex-col justify-center text-center relative group shadow-2xs overflow-hidden min-h-[50px]">
            <button 
              type="button"
              onClick={() => setShowSalary(!showSalary)}
              className="absolute top-1 end-1 p-0.5 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={showSalary ? t("hideSalary") : t("showSalary")}
            >
              {showSalary ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <span className="text-sm sm:text-base 2xl:text-lg font-bold text-foreground font-mono truncate px-1 fa-num leading-tight">
              {showSalary ? `$${(selectedUser?.salary || 0).toLocaleString()}` : "••••••••"}
            </span>
            <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{t("salary")}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Personnel Details Card (Adaptive Multi-View: Overview / Personal / Insurance / Education) ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 2xl:p-4 flex flex-col flex-1 min-h-[140px] shadow-2xs overflow-hidden">
        
        {/* Header with Segmented Filter Pills */}
        <div className="flex items-center justify-between gap-1 mb-2.5 px-0.5 shrink-0">
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <UserCheck size={13} className="stroke-[2.2] text-primary shrink-0" />
            <span className="text-[11px] font-bold text-foreground truncate">{t("personnelDetails")}</span>
          </div>

          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-background/60 dark:bg-slate-900/50 border border-border/40 text-[10px] font-semibold shrink-0">
            {(['all', 'personal', 'insurance', 'education'] as const).map(tabKey => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveDetailTab(tabKey)}
                className={cn(
                  "px-1.5 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap",
                  activeDetailTab === tabKey
                    ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tabKey === 'all' ? t("all")
                  : tabKey === 'personal' ? t("demographicsTab")
                  : tabKey === 'insurance' ? t("insuranceTab")
                  : t("educationTab")}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Adaptive Content Body */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden justify-center">
          {/* View Mode 1: Unified Concise Overview (All 3 compact rows in 1 card) */}
          {activeDetailTab === 'all' && (
            <div className="flex flex-col gap-1.5 flex-1 justify-between text-xs overflow-hidden">
              {/* Row A: Demographics Strip */}
              <div className="p-2 rounded-xl bg-background/60 dark:bg-slate-900/40 border border-border/30 flex items-center justify-between gap-1 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Users size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{t("demographics")}</span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] font-bold text-foreground shrink-0 fa-num">
                  <span>{age} <span className="text-[9px] font-normal text-muted-foreground">{t("yearsOldUnit")}</span></span>
                  <span className="text-border/80">•</span>
                  <span>{isMarried ? t("married") : t("single")}</span>
                  <span className="text-border/80">•</span>
                  <span>{childrenCount} <span className="text-[9px] font-normal text-muted-foreground">{t("child")}</span></span>
                </div>
              </div>

              {/* Row B: Healthcare & Insurance Strip */}
              <div className="p-2 rounded-xl bg-background/60 dark:bg-slate-900/40 border border-border/30 flex items-center justify-between gap-1 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <InsIcon size={12} className={`shrink-0 ${currentIns.text}`} />
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{t("insuranceTypeLabel")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-foreground shrink-0">
                  <span className={cn("text-[9.5px] px-1.5 py-0.2 rounded font-semibold", currentIns.text, insStatus === 'active' ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
                    {t(`insuranceStatus.${insStatus}`)}
                  </span>
                  <span className="truncate max-w-[80px]">{insType !== 'none' ? t(`insurancePlans.${insPlan}`) : "-"}</span>
                  {insType !== 'none' && (
                    <span className="text-[9.5px] text-muted-foreground fa-num font-medium">({insDependents} {t("personUnit")})</span>
                  )}
                </div>
              </div>

              {/* Row C: Education Strip */}
              <div className="p-2 rounded-xl bg-background/60 dark:bg-slate-900/40 border border-border/30 flex items-center justify-between gap-1 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <GraduationCap size={12} className="text-primary shrink-0" />
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{t("education")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-foreground shrink-0">
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold">
                    {educationDegree}
                  </span>
                  <span className="truncate max-w-[100px] text-foreground font-semibold" title={educationField}>
                    {educationField}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* View Mode 2: Dedicated Personal Demographics */}
          {activeDetailTab === 'personal' && (
            <div className="grid grid-cols-3 gap-1 divide-x divide-x-reverse divide-border/40 text-center flex-1 items-center bg-background/50 dark:bg-slate-900/30 rounded-xl p-2 border border-border/30">
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-base sm:text-lg font-bold text-foreground fa-num">
                  <AnimatedNumber value={age} /> <span className="text-[0.65em] font-medium text-muted-foreground">{t("yearsOldUnit")}</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{t("age")}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-base sm:text-lg font-bold text-foreground truncate max-w-full">
                  {isMarried ? t("married") : t("single")}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{t("maritalStatus")}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-base sm:text-lg font-bold text-foreground fa-num">
                  <AnimatedNumber value={childrenCount} /> <span className="text-[0.65em] font-medium text-muted-foreground">{t("child")}</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{t("children")}</span>
              </div>
            </div>
          )}

          {/* View Mode 3: Dedicated Insurance View */}
          {activeDetailTab === 'insurance' && (
            <div className="flex flex-col justify-between flex-1 gap-2 p-2.5 rounded-xl bg-background/50 dark:bg-slate-900/30 border border-border/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">
                    {insType !== 'none' ? t("insuranceTitle", { type: t(`insuranceOptions.${insType}`) }) : t("insuranceOptions.none")}
                  </span>
                  <span className={`text-[10.5px] font-semibold ${currentIns.text}`}>
                    {t(`insuranceStatus.${insStatus}`)}
                  </span>
                </div>
                <InsIcon size={24} className={`shrink-0 ${currentIns.text}`} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/30">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{t("insPlanLabel")}</span>
                  <span className="text-xs font-bold text-foreground truncate">{insType !== 'none' ? t(`insurancePlans.${insPlan}`) : "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{t("insDependentsLabel")}</span>
                  <span className="text-xs font-bold text-foreground truncate fa-num">
                    {insType !== 'none' ? <><AnimatedNumber value={insDependents} /> <span className="text-[0.8em] font-medium text-muted-foreground">{t("personUnit")}</span></> : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* View Mode 4: Dedicated Education View */}
          {activeDetailTab === 'education' && (
            <div className="flex flex-col justify-center flex-1 gap-1.5 p-3 rounded-xl bg-background/50 dark:bg-slate-900/30 border border-border/30 text-start">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <GraduationCap size={15} className="stroke-[2.2] text-primary" />
                  <span className="text-[11px] font-bold">{t("education")}</span>
                </div>
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {educationDegree}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate mt-1">
                {educationField}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
