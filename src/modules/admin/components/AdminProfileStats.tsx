"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => { setEmailOpen(false); }, [selectedUser.id]);

  const uId = parseInt(selectedUser.id.replace(/\D/g, '') || '0', 10);
  
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

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="bg-primary/10 rounded-[2rem] relative overflow-hidden flex-1 min-h-[200px] flex flex-col justify-end p-2.5 shrink-0">
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {selectedUser.avatar ? (
              <motion.img 
                key={selectedUser.avatar}
                src={selectedUser.avatar} 
                className="w-full h-full object-cover object-top absolute inset-0" 
                alt={selectedUser.name}
                initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : (
              <motion.span 
                key={selectedUser.name[0]}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="text-8xl font-black text-primary/20 uppercase absolute"
              >
                {selectedUser.name[0]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="relative bg-background/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-[1.5rem] p-5 flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-foreground font-bold text-[17px] mb-0.5 truncate">{selectedUser.name}</span>
            <span className="text-muted-foreground text-[11px] font-medium truncate">{selectedUser.jobTitle || t("userRole")}</span>
          </div>
          <div
            className="relative size-10 shrink-0"
            onMouseEnter={() => setEmailOpen(true)}
            onMouseLeave={() => setEmailOpen(false)}
          >
            <motion.div
              initial={false}
              animate={{ width: emailOpen && selectedUser.email ? "auto" : 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 end-0 h-10 z-20 flex flex-row-reverse items-center rounded-full overflow-hidden bg-foreground text-background shadow-lg max-w-[260px]"
            >
              <span className="size-10 shrink-0 flex items-center justify-center">
                <Mail size={15} />
              </span>
              {selectedUser.email && (
                <a
                  href={`mailto:${selectedUser.email}`}
                  dir="ltr"
                  tabIndex={emailOpen ? 0 : -1}
                  className={`text-[12px] font-medium whitespace-nowrap px-3 truncate hover:underline underline-offset-2 transition-opacity duration-200 ${emailOpen ? 'opacity-100' : 'opacity-0'}`}
                >
                  {selectedUser.email}
                </a>
              )}
            </motion.div>
          </div>
        </div>
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
