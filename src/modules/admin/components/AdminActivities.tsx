"use client";

import React from "react";
import { Clock, Activity, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { User } from "../types/admin.types";

interface AdminActivitiesProps {
  selectedUser: User | null;
}

export function AdminActivities({ selectedUser }: AdminActivitiesProps) {
  const t = useTranslations("Admin");

  const activities = selectedUser?.recentActivities || [];

  return (
    <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 xl:p-4 flex flex-col h-full min-h-0 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between mb-2 xl:mb-2.5 px-0.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Activity size={15} className="text-emerald-500 shrink-0" />
          <h3 className="font-semibold text-xs sm:text-[13px] xl:text-[14px] text-foreground truncate">
            {t("activities")}
          </h3>
        </div>
        <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold fa-num shrink-0">
          {activities.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 xl:space-y-2 pr-0.5 scrollbar-thin">
        {activities.length > 0 ? (
          activities.map((act) => (
            <div 
              key={act.id} 
              className="p-2 xl:p-2.5 bg-background/80 hover:bg-background border border-border/40 hover:border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 transition-colors shadow-2xs"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-semibold text-[12px] text-foreground truncate">{act.title}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium fa-num">
                  <Clock size={11} className="opacity-70" />
                  <span>{act.date}</span>
                </div>
              </div>

              {act.status && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  act.status === 'approved' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {act.status === "approved" ? t("statusApproved") : act.status === "pending" ? t("statusPending") : act.status}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground opacity-60">
            <CheckCircle2 size={28} className="text-muted-foreground mb-1.5 opacity-50" />
            <p className="text-xs font-medium">{t("noActivity")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
