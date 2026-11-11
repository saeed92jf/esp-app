"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  Search, X, Code, TrendingUp, FolderKanban, Briefcase, FlaskConical,
  ChevronsRight, ChevronRight, ChevronLeft,
  Clock, AlertTriangle, ExternalLink, Sparkles, CheckCircle2, GraduationCap, Building2, IdCard, CreditCard, Award,
  CheckSquare, MessageSquare, PlusCircle, Calendar, UserCheck, PhoneCall, ShieldCheck, MapPin
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { User } from "../types/admin.types";
import { newTasksService, NewTask } from "@/modules/tasks/services/new-tasks.service";
import { AdminActivities } from "./AdminActivities";
import { AdminHeatmapModules } from "./AdminHeatmapModules";
import { formatPersonName } from "@/lib/person-names";

interface AdminTasksTimeProps {
  selectedUser: User | null;
  users: User[];
  setUsers: (u: User[]) => void;
  setSelectedUser: (u: User) => void;
  availableModules?: any[];
  tMenu?: any;
  handleToggleModuleAccess?: (moduleId: string, checked: boolean) => void;
  handleToggleAllModulesAccess?: (checked: boolean) => void;
  onNavigateToAccess?: () => void;
  hideSearchAvatarsOnMobile?: boolean;
}

export const AnimatedNumber = ({ 
  value, 
  format 
}: { 
  value: number; 
  format?: (val: number) => string | React.ReactNode;
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    if (startValue === endValue) {
      setDisplayValue(value);
      return;
    }

    const duration = 500;
    let startTime: number | null = null;
    let animationFrame: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentVal = startValue + (endValue - startValue) * easeOutCubic(progress);
      setDisplayValue(Math.round(currentVal));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        prevValueRef.current = endValue;
        setDisplayValue(endValue);
      }
    };
    
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <>{format ? format(displayValue) : displayValue}</>;
};

export function AdminTasksTime({ 
  selectedUser, 
  users, 
  setUsers, 
  setSelectedUser,
  availableModules = [],
  tMenu,
  handleToggleModuleAccess = () => {},
  handleToggleAllModulesAccess = () => {},
  onNavigateToAccess,
  hideSearchAvatarsOnMobile = true,
}: AdminTasksTimeProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";
  
  const [animate, setAnimate] = useState(false);
  const [allTasks, setAllTasks] = useState<NewTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const deptConfig: Record<string, { icon: any, containerBg: string, iconBg: string, badgeBg: string, text: string }> = {
    engineering: { icon: Code, containerBg: "bg-blue-500/10", iconBg: "bg-blue-500 shadow-blue-500/30", badgeBg: "bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
    marketDevelopment: { icon: TrendingUp, containerBg: "bg-emerald-500/10", iconBg: "bg-emerald-500 shadow-emerald-500/30", badgeBg: "bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    projectControl: { icon: FolderKanban, containerBg: "bg-amber-500/10", iconBg: "bg-amber-500 shadow-amber-500/30", badgeBg: "bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
    administrative: { icon: Briefcase, containerBg: "bg-slate-500/10", iconBg: "bg-slate-500 shadow-slate-500/30", badgeBg: "bg-slate-500/20", text: "text-slate-600 dark:text-slate-400" },
    rAndD: { icon: FlaskConical, containerBg: "bg-purple-500/10", iconBg: "bg-purple-500 shadow-purple-500/30", badgeBg: "bg-purple-500/20", text: "text-purple-600 dark:text-purple-400" }
  };

  const deptKey = selectedUser?.department || 'engineering';
  const currentDept = deptConfig[deptKey] || deptConfig.engineering;

  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [selectedUser?.id]);

  // Load Real Tasks from Live Backend Tasks Service
  useEffect(() => {
    let isMounted = true;
    async function fetchTasks() {
      setLoadingTasks(true);
      try {
        const res = await newTasksService.getTasks();
        if (isMounted) setAllTasks(res || []);
      } catch (e) {
        console.error("Failed to load real tasks in AdminTasksTime", e);
      } finally {
        if (isMounted) setLoadingTasks(false);
      }
    }
    fetchTasks();
    return () => { isMounted = false; };
  }, [selectedUser?.id]);

  // Filter real tasks for selected user (or all tasks if no user is selected)
  const userTasks = useMemo(() => {
    if (!selectedUser) return allTasks;
    const uid = (selectedUser.id || "").toLowerCase();
    const uname = (selectedUser.fullNameFa || selectedUser.fullName || selectedUser.name || "").toLowerCase();
    const uemail = (selectedUser.email || "").toLowerCase();
    const uemailPrefix = uemail ? uemail.split("@")[0] : "";

    return allTasks.filter((task) => {
      const isAssignee = task.assignees?.some((a) => {
        const aid = (a.userId || "").toLowerCase();
        const aname = (a.name || "").toLowerCase();
        const aemail = (a.email || "").toLowerCase();
        return (
          (aid && (aid === uid || aid.includes(uid) || uid.includes(aid))) ||
          (aname && (aname.includes(uname) || uname.includes(aname))) ||
          (aemail && (aemail === uemail || aemail.startsWith(uemailPrefix)))
        );
      });
      const isCreator =
        task.created_by &&
        (task.created_by.toLowerCase() === uid ||
          (task.created_by_name && task.created_by_name.toLowerCase().includes(uname)));

      return isAssignee || isCreator;
    });
  }, [allTasks, selectedUser]);

  const taskStats = useMemo(() => {
    return {
      total: userTasks.length,
      todo: userTasks.filter((t) => t.status === "todo").length,
      inProgress: userTasks.filter((t) => t.status === "in_progress").length,
      review: userTasks.filter((t) => t.status === "review").length,
      done: userTasks.filter((t) => t.status === "done").length,
    };
  }, [userTasks]);

  // Clean personnel data display without mock rings or skill bars

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* ── Main Layout: Personnel Profile (vertical down), Tasks beside it, and Heatmap + Access on 3rd col ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 flex-1 min-h-0 items-stretch">
        
        {/* Module 1: Personnel, Education & Insurance Profile (عمودی تا پایین) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 xl:p-4 flex flex-col shadow-2xs h-full min-h-[500px] overflow-hidden">
          <div className="flex items-center justify-between mb-2.5 px-0.5 shrink-0 flex-wrap gap-2 pb-2 border-b border-border/30">
            <div className="flex items-center gap-1.5 min-w-0">
              <Briefcase size={16} className="text-primary shrink-0" />
              <h3 className="font-semibold text-xs sm:text-[13px] xl:text-[14px] text-foreground truncate">
                {isRtl ? "مشخصات پرسنلی، تحصیلات و بیمه" : "Personnel, Education & Insurance Profile"}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              {selectedUser?.personnelCode && (
                <span className="text-[10px] xl:text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 fa-num shrink-0">
                  {isRtl ? `کد ${selectedUser.personnelCode}` : `ID: ${selectedUser.personnelCode}`}
                </span>
              )}
              {selectedUser?.education && (
                <span className="text-[10px] xl:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  {selectedUser.education}
                </span>
              )}
              {selectedUser?.insuranceType && selectedUser.insuranceType !== "none" && (
                <span className="text-[10px] xl:text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                  {isRtl ? `بیمه ${selectedUser.insuranceType}` : `Insurance: ${selectedUser.insuranceType}`}
                </span>
              )}
            </div>
          </div>

          {/* All 8 Specs Stacked Vertically & Sequentially (بدون space-between - لیبل بالا و مقدار زیر هم) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xl:gap-2.5 flex-1 justify-start py-1 overflow-y-auto pr-0.5 custom-scrollbar text-xs content-start">
            {/* National ID */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <IdCard size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "کد ملی" : "National ID"}</span>
              </span>
              <span className="font-bold text-foreground text-xs sm:text-[12px] truncate fa-num ps-0.5">
                {selectedUser?.nationalId || "-"}
              </span>
            </div>

            {/* Hire Date */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <Calendar size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "تاریخ استخدام" : "Hire Date"}</span>
              </span>
              <span className="font-bold text-foreground text-xs sm:text-[12px] truncate fa-num ps-0.5">
                {selectedUser?.employmentDate || selectedUser?.joinedAt || "-"}
              </span>
            </div>

            {/* Position / Unit */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <Building2 size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "سمت / واحد" : "Position / Unit"}</span>
              </span>
              <span className="font-bold text-foreground text-xs sm:text-[12px] truncate ps-0.5" title={selectedUser?.jobPosition || selectedUser?.jobTitle || selectedUser?.subUnit || (selectedUser?.department ? (t.has(`departments.${selectedUser.department}`) ? t(`departments.${selectedUser.department}`) : selectedUser.department) : "-")}>
                {selectedUser?.jobPosition || selectedUser?.jobTitle || selectedUser?.subUnit || (selectedUser?.department ? (t.has(`departments.${selectedUser.department}`) ? t(`departments.${selectedUser.department}`) : selectedUser.department) : "-")}
              </span>
            </div>

            {/* Direct Manager */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <UserCheck size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "مدیر مستقیم" : "Direct Manager"}</span>
              </span>
              <span className="font-bold text-foreground text-xs sm:text-[12px] truncate ps-0.5">
                {selectedUser?.directManager || selectedUser?.manager
                  ? formatPersonName(selectedUser.directManager || selectedUser.manager, locale)
                  : "-"}
              </span>
            </div>

            {/* Extension / Location */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <PhoneCall size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "داخلی / محل" : "Ext / Location"}</span>
              </span>
              <span className="font-bold text-foreground text-xs sm:text-[12px] truncate fa-num ps-0.5">
                {selectedUser?.extensionNumber ? (isRtl ? `داخلی ${selectedUser.extensionNumber}` : `Ext ${selectedUser.extensionNumber}`) : "-"} {selectedUser?.workLocation ? `(${isRtl ? (selectedUser.workLocation === 'office' ? 'دفتر' : selectedUser.workLocation === 'factory' ? 'کارخانه' : selectedUser.workLocation) : selectedUser.workLocation})` : ""}
              </span>
            </div>

            {/* Major / University */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <GraduationCap size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "رشته / دانشگاه" : "Major / University"}</span>
              </span>
              <span className="font-bold text-foreground text-xs sm:text-[12px] truncate ps-0.5" title={selectedUser?.fieldOfStudy || selectedUser?.university ? `${selectedUser.fieldOfStudy || ''} (${selectedUser.university || ''})` : (selectedUser?.education || "-")}>
                {selectedUser?.fieldOfStudy || selectedUser?.university ? `${selectedUser.fieldOfStudy || ''} (${selectedUser.university || ''})` : (selectedUser?.education || "-")}
              </span>
            </div>

            {/* Insurance */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "شماره بیمه" : "Insurance No"}</span>
              </span>
              <span className="font-bold text-foreground text-xs sm:text-[12px] truncate fa-num ps-0.5">
                {selectedUser?.insuranceNumber ? `${selectedUser.insuranceNumber} (${selectedUser.insuranceType || (isRtl ? 'تکمیلی' : 'Complementary')})` : "-"}
              </span>
            </div>

            {/* Bank Account */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 hover:bg-background/90 border border-border/30 hover:border-primary/30 transition-all shadow-2xs group">
              <span className="text-muted-foreground/80 text-[10.5px] font-medium flex items-center gap-1.5">
                <CreditCard size={12} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">{isRtl ? "شماره حساب / شبا" : "Bank Account"}</span>
              </span>
              <span className="font-bold text-foreground font-mono text-[11px] truncate fa-num ps-0.5">
                {selectedUser?.shebaNumber || selectedUser?.bankAccount || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Module 2: Assigned User Tasks (عرض کمتر: lg:col-span-3، نمایش اطلاعات ساده‌تر و بهینه) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 xl:p-4 flex flex-col h-full min-h-[500px] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between mb-2 xl:mb-2.5 px-0.5 shrink-0 gap-1.5 pb-2 border-b border-border/30">
            <div className="flex items-center gap-1.5 min-w-0">
              <FolderKanban size={16} className="text-primary shrink-0" />
              <h3 className="font-semibold text-xs sm:text-[13px] text-foreground truncate">
                {isRtl ? "تسک‌های محوله" : "Assigned Tasks"}
              </h3>
              <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full font-bold shrink-0 fa-num">
                {userTasks.length}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {taskStats.inProgress > 0 && (
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 fa-num">
                  {taskStats.inProgress} {isRtl ? "جاری" : "Active"}
                </span>
              )}
              {taskStats.done > 0 && (
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 fa-num">
                  {taskStats.done} {isRtl ? "تکمیل" : "Done"}
                </span>
              )}
              <Link
                href="/tasks"
                title={isRtl ? "مشاهده تمام تسک‌ها" : "View All Tasks"}
                className="p-1 rounded-md hover:bg-primary/15 text-primary transition-colors cursor-pointer shrink-0 ms-0.5"
              >
                <ExternalLink size={12} className="rtl:rotate-180 shrink-0" />
              </Link>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
            {userTasks.length > 0 ? (
              userTasks.map((task) => {
                const isUrgent = task.priority === "critical" || task.priority === "high";
                const doneSubs = task.subtasks?.filter((s) => s.is_done).length || 0;
                const totalSubs = task.subtasks?.length || 0;

                return (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex flex-col gap-1.5 p-2.5 bg-background/80 hover:bg-background rounded-xl border border-border/40 hover:border-primary/40 transition-all group block text-start cursor-pointer shadow-2xs"
                  >
                    {/* Top Row: Status chip + Priority + Deadline */}
                    <div className="flex items-center justify-between gap-1.5 text-[10px]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 font-bold rounded-md border text-[9px]",
                            task.status === "in_progress"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : task.status === "review"
                              ? "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20"
                              : task.status === "done"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                          )}
                        >
                          {task.status === "in_progress"
                            ? (isRtl ? "در حال انجام" : "In Progress")
                            : task.status === "review"
                            ? (isRtl ? "بازبینی" : "Review")
                            : task.status === "done"
                            ? (isRtl ? "انجام‌شده" : "Done")
                            : (isRtl ? "برای انجام" : "To Do")}
                        </span>

                        {isUrgent && (
                          <span className="px-1.5 py-0.5 font-bold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px]">
                            {task.priority === "critical" ? (isRtl ? "فوری" : "Critical") : (isRtl ? "مهم" : "High")}
                          </span>
                        )}
                      </div>

                      {task.deadline && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium fa-num shrink-0">
                          <Clock size={10} className="opacity-70" />
                          <span>{task.deadline}</span>
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <p className="text-[11.5px] font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {task.title}
                    </p>

                    {/* Bottom Row: Project / Subtasks */}
                    {(task.project_name || totalSubs > 0) && (
                      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/20">
                        {task.project_name && (
                          <span className="text-primary/90 font-medium truncate max-w-[130px] text-[9.5px]">
                            {task.project_esp_number ? `${task.project_esp_number} ` : ""}
                            {task.project_name}
                          </span>
                        )}
                        {totalSubs > 0 && (
                          <span className="fa-num text-[9px] shrink-0 ms-auto">
                            {isRtl ? `${doneSubs}/${totalSubs} زیرتسک` : `${doneSubs}/${totalSubs} subs`}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
                <CheckCircle2 size={26} className="text-emerald-500 opacity-80" />
                <p className="text-xs font-semibold">
                  {selectedUser
                    ? (isRtl
                        ? `هیچ تسکی به این کاربر اختصاص نیافته است.`
                        : `No tasks assigned to this user.`)
                    : (isRtl ? "هیچ تسکی در سیستم یافت نشد." : "No tasks found.")}
                </p>
                <Link
                  href="/tasks?tab=create"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                >
                  <PlusCircle size={12} />
                  <span>{isRtl ? "تعریف تسک جدید" : "Create Task"}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Module 3 & 4: Online Heatmap & Module Access (ستون سوم: گسترش‌یافته به lg:col-span-5) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-5 flex flex-col gap-3 h-full min-h-0">
          <div className="flex-1 min-h-[260px]">
            <AdminActivities selectedUser={selectedUser} />
          </div>
          <div className="flex-1 min-h-[220px]">
            <AdminHeatmapModules 
              selectedUser={selectedUser}
              availableModules={availableModules}
              tMenu={tMenu}
              handleToggleModuleAccess={handleToggleModuleAccess}
              handleToggleAllModulesAccess={handleToggleAllModulesAccess}
              onNavigateToAccess={onNavigateToAccess}
            />
          </div>
        </div>
      </div>

    </div>
  );
}