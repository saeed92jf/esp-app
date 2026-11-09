"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  Search, X, Code, TrendingUp, FolderKanban, Briefcase, FlaskConical,
  ChevronsRight, ChevronRight, ChevronLeft,
  Clock, AlertTriangle, ExternalLink, Sparkles, CheckCircle2, GraduationCap, Building2, IdCard, CreditCard, Award,
  CheckSquare, MessageSquare, PlusCircle
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { User } from "../types/admin.types";
import { newTasksService, NewTask } from "@/modules/tasks/services/new-tasks.service";
import { AdminActivities } from "./AdminActivities";
import { AdminHeatmapModules } from "./AdminHeatmapModules";
import { AdminUserSearchAvatars } from "./AdminUserSearchAvatars";
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
      
      {/* ── Center Header: Search + Department Switcher & Avatars Carousel ── */}
      <div className={cn("w-full shrink-0", hideSearchAvatarsOnMobile ? "hidden lg:block" : "block")}>
        <AdminUserSearchAvatars
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      </div>

      {/* ── Virtual Grid Row 1: Unified Personnel, Education & Insurance (col 1-2), Activities (col 3) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-[295px] xl:min-h-[315px]">
        
        {/* Unified Module: Personnel, Education & Insurance Profile (مشخصات پرسنلی، تحصیلات و بیمه) */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 xl:p-4 flex flex-col justify-between shadow-2xs h-full min-h-0 col-span-1 md:col-span-2 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-2 px-0.5 shrink-0 flex-wrap gap-2">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xl:gap-2.5 flex-1 justify-center py-0.5 overflow-hidden text-xs">
            {/* Column 1: Personnel & Administrative Specs */}
            <div className="flex flex-col gap-1.5 xl:gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "کد ملی:" : "National ID:"}</span>
                <span className="font-bold text-foreground fa-num">{selectedUser?.nationalId || "-"}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "سمت / واحد:" : "Position / Unit:"}</span>
                <span className="font-bold text-foreground truncate max-w-[155px] text-end">
                  {selectedUser?.jobPosition || selectedUser?.jobTitle || selectedUser?.subUnit || (selectedUser?.department ? (t.has(`departments.${selectedUser.department}`) ? t(`departments.${selectedUser.department}`) : selectedUser.department) : "-")}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "مدیر مستقیم:" : "Direct Manager:"}</span>
                <span className="font-bold text-foreground truncate max-w-[155px] text-end">
                  {selectedUser?.directManager || selectedUser?.manager
                    ? formatPersonName(selectedUser.directManager || selectedUser.manager, locale)
                    : "-"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "داخلی / محل:" : "Ext / Location:"}</span>
                <span className="font-bold text-foreground truncate max-w-[155px] text-end fa-num">
                  {selectedUser?.extensionNumber ? (isRtl ? `داخلی ${selectedUser.extensionNumber}` : `Ext ${selectedUser.extensionNumber}`) : ""} {selectedUser?.workLocation ? `(${isRtl ? (selectedUser.workLocation === 'office' ? 'دفتر مرکزی' : selectedUser.workLocation === 'factory' ? 'کارخانه' : selectedUser.workLocation) : selectedUser.workLocation})` : ""}
                </span>
              </div>
            </div>

            {/* Column 2: Education & Insurance Specs */}
            <div className="flex flex-col gap-1.5 xl:gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "رشته / دانشگاه:" : "Major / University:"}</span>
                <span className="font-bold text-foreground truncate max-w-[155px] text-end">
                  {selectedUser?.fieldOfStudy || selectedUser?.university ? `${selectedUser.fieldOfStudy || ''} (${selectedUser.university || ''})` : (selectedUser?.education || "-")}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "تاریخ استخدام:" : "Hire Date:"}</span>
                <span className="font-bold text-foreground fa-num">
                  {selectedUser?.employmentDate || selectedUser?.joinedAt || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "شماره بیمه:" : "Insurance No:"}</span>
                <span className="font-bold text-foreground truncate max-w-[155px] text-end fa-num">
                  {selectedUser?.insuranceNumber ? `${selectedUser.insuranceNumber} (${selectedUser.insuranceType || (isRtl ? 'تکمیلی' : 'Complementary')})` : "-"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30">
                <span className="text-muted-foreground text-[11px]">{isRtl ? "شماره حساب بانکی:" : "Bank Account:"}</span>
                <span className="font-bold text-foreground font-mono text-[10.5px] truncate max-w-[155px] text-end fa-num">
                  {selectedUser?.shebaNumber || selectedUser?.bankAccount || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Module C: Activities (فعالیت‌ها) */}
        <div className="col-span-1 h-full min-h-0 overflow-hidden">
          <AdminActivities selectedUser={selectedUser} />
        </div>
      </div>

      {/* ── Virtual Grid Row 2: Urgent Tasks (col 1-2), Module Access (col 3) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-[190px]">
        {/* Module D: Assigned User Tasks (تسک‌های متصل به کاربر در پنل ادمین) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3 sm:p-3.5 xl:p-4 flex flex-col h-full min-h-0 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between mb-2 xl:mb-2.5 px-0.5 shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <FolderKanban size={16} className="text-primary shrink-0" />
              <h3 className="font-semibold text-xs sm:text-[13px] xl:text-[14px] text-foreground truncate">
                {selectedUser
                  ? (isRtl
                      ? `تسک‌های محوله به ${formatPersonName(selectedUser.fullNameFa || selectedUser.fullName || selectedUser.name, locale)}`
                      : `Tasks assigned to ${formatPersonName(selectedUser.fullName || selectedUser.name, locale)}`)
                  : (isRtl ? "تسک‌های سازمانی" : "Organizational Tasks")}
              </h3>
              <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold shrink-0 fa-num">
                {userTasks.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {taskStats.inProgress > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 fa-num">
                  {taskStats.inProgress} {isRtl ? "در حال انجام" : "In Progress"}
                </span>
              )}
              {taskStats.review > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 fa-num">
                  {taskStats.review} {isRtl ? "بازبینی" : "Under Review"}
                </span>
              )}
              {taskStats.done > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 fa-num">
                  {taskStats.done} {isRtl ? "انجام‌شده" : "Completed"}
                </span>
              )}
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-semibold px-2 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer shrink-0 ms-1"
              >
                <span>{isRtl ? "مشاهده سیستم تسک‌ها" : "View Tasks System"}</span>
                <ExternalLink size={11} className="rtl:rotate-180 shrink-0" />
              </Link>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {userTasks.length > 0 ? (
              userTasks.map((task) => {
                const isUrgent = task.priority === "critical" || task.priority === "high";
                const doneSubs = task.subtasks?.filter((s) => s.is_done).length || 0;
                const totalSubs = task.subtasks?.length || 0;

                return (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between gap-2.5 p-3 bg-background/80 hover:bg-background rounded-xl border border-border/40 hover:border-primary/40 transition-all group block text-start cursor-pointer shadow-2xs"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Status Badge */}
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full border",
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
                            ? (isRtl ? "انجام‌شده" : "Completed")
                            : (isRtl ? "برای انجام" : "To Do")}
                        </span>

                        {/* Priority Badge */}
                        {isUrgent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {task.priority === "critical" ? (isRtl ? "فوری" : "Critical") : (isRtl ? "مهم" : "High")}
                          </span>
                        )}

                        {/* Linked Project */}
                        {task.project_name && (
                          <span className="text-[10px] text-primary font-medium truncate max-w-[180px]">
                            {task.project_esp_number ? `${task.project_esp_number} - ` : ""}
                            {task.project_name}
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </p>

                      <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground mt-0.5 flex-wrap">
                        {totalSubs > 0 && (
                          <span className="fa-num">
                            {isRtl ? `ریزتسک‌ها: ${doneSubs}/${totalSubs}` : `Subtasks: ${doneSubs}/${totalSubs}`}
                          </span>
                        )}
                        {(task.progress?.length || 0) > 0 && (
                          <span className="fa-num flex items-center gap-1">
                            <MessageSquare className="size-2.5 opacity-70" />
                            {task.progress.length} {isRtl ? "پیام در گفتگو" : "messages"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Deadline Badge */}
                    <div className="flex items-center gap-1 text-[11px] font-medium shrink-0 fa-num">
                      <Clock size={12} className="opacity-70 text-muted-foreground" />
                      {task.deadline ? (
                        <span className="font-semibold text-foreground/90">
                          {task.deadline}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">{isRtl ? "بدون مهلت" : "No deadline"}</span>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
                <CheckCircle2 size={30} className="text-emerald-500 opacity-80" />
                <p className="text-xs font-semibold">
                  {selectedUser
                    ? (isRtl
                        ? `هیچ تسکی به ${formatPersonName(selectedUser.fullNameFa || selectedUser.fullName || selectedUser.name, locale)} اختصاص نیافته است.`
                        : `No tasks assigned to ${formatPersonName(selectedUser.fullName || selectedUser.name, locale)}.`)
                    : (isRtl ? "هیچ تسکی در سیستم یافت نشد." : "No tasks found in the system.")}
                </p>
                <Link
                  href="/tasks?tab=create"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                >
                  <PlusCircle size={12} />
                  <span>{isRtl ? "تعریف تسک جدید برای این کاربر" : "Create new task for this user"}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Module E: Module Access (دسترسی‌ها - اختصاص ۱ ستون هم‌تراز با تسک‌ها) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col h-full min-h-0">
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
  );
}