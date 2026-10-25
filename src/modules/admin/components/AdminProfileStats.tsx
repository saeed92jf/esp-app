"use client";

import React, { useState } from "react";
import { 
  Mail, Phone, ShieldCheck, ShieldAlert, GraduationCap, Users, UserCheck, 
  Briefcase, FolderKanban, Award, Eye, EyeOff, Calendar, Building2
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
    <div className="flex flex-col gap-3 h-full min-h-0 overflow-y-auto custom-scrollbar pe-0.5">
      
      {/* ── 1. Profile Header Card (Prominent Avatar, Admin Ring & Contacts) ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center shrink-0 shadow-2xs">
        
        {/* Avatar Ring: Multi-color gradient for Admin, Refined Primary Tint for User */}
        <div 
          className={`p-[3px] rounded-full shrink-0 transition-transform duration-300 ${
            isAdmin 
              ? "bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] shadow-md" 
              : "shadow-xs"
          }`}
          style={!isAdmin ? { backgroundColor: `${avatarBgColor}35` } : undefined}
        >
          <div className="p-1 rounded-full bg-white dark:bg-card">
            <div 
              className="size-20 sm:size-24 rounded-full flex items-center justify-center font-bold text-3xl sm:text-4xl text-white select-none shadow-inner"
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
        <h2 className="text-foreground font-bold text-base sm:text-lg mt-3 truncate max-w-full leading-tight">
          {selectedUser.name}
        </h2>

        {/* Role & Company Badges */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-1.5">
          {isAdmin ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
              <ShieldCheck size={12} className="stroke-[2.5]" />
              <span>{t("roleAdmin")}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <UserCheck size={12} className="stroke-[2.5]" />
              <span className="truncate max-w-[180px]">{selectedUser.jobTitle || t("roleUser")}</span>
            </div>
          )}

          <div
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs",
              companyInfo.id === "npceram"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25"
            )}
          >
            <Building2 size={11} className="stroke-[2]" />
            <span>{isRtl ? companyInfo.nameFa : companyInfo.nameEn}</span>
          </div>
        </div>

        {/* Contact Links */}
        <div className="flex flex-col items-center gap-1 mt-3 w-full">
          {selectedUser.email && (
            <a
              href={`mailto:${selectedUser.email}`}
              dir="ltr"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-full font-medium"
            >
              <Mail size={12} className="shrink-0 opacity-70" />
              <span className="truncate">{selectedUser.email}</span>
            </a>
          )}
          {selectedUser.phone && (
            <span
              dir="ltr"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-full font-medium fa-num"
            >
              <Phone size={12} className="shrink-0 opacity-70" />
              <span>{selectedUser.phone}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Sub-Avatar Responsive Flex Container (Stretches to bottom of page) ── */}
      <div className="flex flex-col flex-1 min-h-0 gap-3">
        {/* ── 2. Performance & Career Stats Card (Days, Projects, Experience, Salary) ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 sm:p-4.5 pb-5 sm:pb-5.5 flex flex-col justify-between flex-[1.45] min-h-[170px] shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground px-1 mb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} className="stroke-[2.2]" />
              <span className="text-[11px] font-bold">{t("statsAndPerformance")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 flex-1 items-stretch">
            {/* Days in Company */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-3 border border-border/30 flex flex-col justify-center text-center h-full shadow-2xs">
              <span className="text-base sm:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={selectedUser?.daysInCompany || 0} /> <span className="text-[0.65em] font-medium text-muted-foreground">{t("daysUnit")}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">{t("inCompany")}</span>
            </div>

            {/* Projects Done */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-3 border border-border/30 flex flex-col justify-center text-center h-full shadow-2xs">
              <span className="text-base sm:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={selectedUser?.doneProjects || 0} /> <span className="text-[0.65em] font-medium text-muted-foreground">{t("projectsUnit")}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">{t("projectsDone")}</span>
            </div>

            {/* Work Experience */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-3 border border-border/30 flex flex-col justify-center text-center h-full shadow-2xs">
              <span className="text-base sm:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={Math.min(experienceCount, 99)} />{experienceCount > 99 && <span className="text-primary">+</span>} <span className="text-[0.65em] font-medium text-muted-foreground">{t("experienceUnit")}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">{t("workExperience")}</span>
            </div>

            {/* Salary with Eye Toggle */}
            <div className="bg-background/70 dark:bg-slate-900/40 rounded-xl p-3 border border-border/30 flex flex-col justify-center text-center relative group h-full shadow-2xs">
              <button 
                type="button"
                onClick={() => setShowSalary(!showSalary)}
                className="absolute top-1.5 end-1.5 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={showSalary ? t("hideSalary") : t("showSalary")}
              >
                {showSalary ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <span className="text-base sm:text-lg font-bold text-foreground font-mono truncate px-1 fa-num">
                {showSalary ? `$${(selectedUser?.salary || 0).toLocaleString()}` : "••••••••"}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">{t("salary")}</span>
            </div>
          </div>
        </div>

        {/* ── 3. Unified Personal Demographics Card (Age, Marital, Children) ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3.5 flex flex-col justify-between flex-1 min-h-[90px] shadow-2xs">
          <div className="flex items-center gap-1.5 px-1 mb-1 text-muted-foreground shrink-0">
            <Users size={14} className="stroke-[2.2]" />
            <span className="text-[11px] font-bold">{t("demographics")}</span>
          </div>

          <div className="grid grid-cols-3 gap-1 divide-x divide-x-reverse divide-border/40 text-center flex-1 items-center">
            {/* Age */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-base sm:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={age} /> <span className="text-[0.65em] font-medium text-muted-foreground">{t("yearsOldUnit")}</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{t("age")}</span>
            </div>

            {/* Marital Status */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-base sm:text-lg font-bold text-foreground truncate max-w-full">
                {isMarried ? t("married") : t("single")}
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{t("maritalStatus")}</span>
            </div>

            {/* Children */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-base sm:text-lg font-bold text-foreground fa-num">
                <AnimatedNumber value={childrenCount} /> <span className="text-[0.65em] font-medium text-muted-foreground">{t("child")}</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{t("children")}</span>
            </div>
          </div>
        </div>

        {/* ── 4. Insurance & Healthcare Card ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3.5 flex flex-col justify-between flex-1 min-h-[110px] relative overflow-hidden shadow-2xs">
          <div className="flex items-start justify-between gap-3 shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] sm:text-[15px] font-bold text-foreground mb-0.5 truncate">
                {insType !== 'none' ? t("insuranceTitle", { type: t(`insuranceOptions.${insType}`) }) : t("insuranceOptions.none")}
              </span>
              <span className={`text-[11px] font-semibold ${currentIns.text}`}>
                {t(`insuranceStatus.${insStatus}`)}
              </span>
            </div>
            <InsIcon size={28} className={`shrink-0 ${currentIns.text}`} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/30">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">{t("insPlanLabel")}</span>
              <span className="text-sm sm:text-base font-bold text-foreground truncate">{insType !== 'none' ? t(`insurancePlans.${insPlan}`) : "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">{t("insDependentsLabel")}</span>
              <span className="text-sm sm:text-base font-bold text-foreground truncate fa-num">
                {insType !== 'none' ? <><AnimatedNumber value={insDependents} /> <span className="text-[0.8em] font-medium text-muted-foreground">{t("personUnit")}</span></> : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 5. Education & Academic Background Card ── */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3.5 flex flex-col justify-between flex-1 min-h-[85px] text-start shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <GraduationCap size={15} className="stroke-[2.2]" />
              <span className="text-[11px] font-bold">{t("education")}</span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {educationDegree}
            </span>
          </div>
          <p className="text-sm sm:text-[15px] font-bold text-foreground leading-snug truncate">
            {educationField}
          </p>
        </div>
      </div>

    </div>
  );
}
