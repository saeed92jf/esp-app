"use client";

import React from "react";
import { 
  Mail, ShieldCheck, ShieldAlert
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types/admin.types";
import { AnimatedNumber } from "./AdminTasksTime";

interface AdminProfileStatsProps {
  selectedUser: User;
}

export function AdminProfileStats({ selectedUser }: AdminProfileStatsProps) {
  const t = useTranslations("Admin");

  // Real or Fallback values
  const age = selectedUser.age || 32;
  const isMarried = selectedUser.maritalStatus ? selectedUser.maritalStatus === 'married' : true;
  const childrenCount = selectedUser.childrenCount ?? 2;
  
  const insType = selectedUser.insuranceType || 'complementary';
  const insStatus = insType === 'none' ? 'inactive' : 'active';
  const insPlan = insType === 'complementary' ? 'golden' : 'regular';
  const insDependents = childrenCount + (isMarried ? 1 : 0);

  const educationField = selectedUser.educationField || "مهندسی نرم افزار";
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
    <div className="flex flex-col gap-3 h-full min-h-0 overflow-y-auto custom-scrollbar">
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col items-center justify-center text-center shrink-0">
        <div className="size-16 sm:size-18 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-2xl sm:text-3xl select-none shrink-0 shadow-2xs">
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

        <span className="text-foreground font-bold text-base sm:text-lg mt-2.5 truncate max-w-full">
          {selectedUser.name}
        </span>

        {selectedUser.email && (
          <a
            href={`mailto:${selectedUser.email}`}
            dir="ltr"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-full mt-1 font-medium"
          >
            <Mail size={13} className="shrink-0 opacity-70" />
            <span className="truncate">{selectedUser.email}</span>
          </a>
        )}
      </div>

      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start">
        <span className="text-lg sm:text-xl font-bold text-foreground mb-1">
          <AnimatedNumber value={age} /> <span className="text-[0.7em] font-medium text-muted-foreground">{t("yearsOld")}</span>
        </span>
        <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
          {t("ageSub", { month: t("months.farvardin"), days: 2 })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start">
          <span className="text-lg sm:text-xl font-bold text-foreground mb-1">
            {isMarried ? t("married") : t("single")}
          </span>
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
            {t("maritalStatus")}
          </span>
        </div>

        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start">
          <span className="text-lg sm:text-xl font-bold text-foreground mb-1">
            <AnimatedNumber value={childrenCount} /> <span className="text-[0.7em] font-medium text-muted-foreground">{t("child")}</span>
          </span>
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
            {t("children")}
          </span>
        </div>
      </div>

      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-between gap-3 relative overflow-hidden min-h-[172px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-bold text-foreground mb-0.5 truncate">
              {insType !== 'none' ? t("insuranceTitle", { type: t(`insuranceOptions.${insType}`) }) : t("insuranceOptions.none")}
            </span>
            <span className={`text-[11px] sm:text-xs font-semibold ${currentIns.text}`}>
              {t(`insuranceStatus.${insStatus}`)}
            </span>
          </div>
          <InsIcon size={36} className={`shrink-0 ${currentIns.text}`} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground font-medium">{t("insPlanLabel")}</span>
            <span className="text-base sm:text-lg font-bold text-foreground">{insType !== 'none' ? t(`insurancePlans.${insPlan}`) : "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground font-medium">{t("insDependentsLabel")}</span>
            <span className="text-base sm:text-lg font-bold text-foreground">{insType !== 'none' ? <><AnimatedNumber value={insDependents} /> <span className="text-[0.8em] font-medium text-muted-foreground">{t("personUnit")}</span></> : "-"}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start">
        <span className="text-lg sm:text-xl font-bold text-foreground mb-1 leading-tight">
          {t("educationTitle", { field: educationField })}
        </span>
        <span className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
          {t("educationSub", { degree: educationDegree })}
        </span>
      </div>
    </div>
  );
}
