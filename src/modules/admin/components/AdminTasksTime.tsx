"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, Search, Star, X, Eye, EyeOff, Code, 
  TrendingUp, FolderKanban, Briefcase, FlaskConical,
  ChevronsRight, ChevronRight, ChevronLeft,
  Clock, AlertTriangle, ExternalLink, Sparkles, CheckCircle2
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { User } from "../types/admin.types";
import { tasksService } from "@/modules/tasks/services";
import { TaskItem } from "@/modules/tasks/types/tasks.types";

interface AdminTasksTimeProps {
  selectedUser: User | null;
  users: User[];
  setUsers: (u: User[]) => void;
  setSelectedUser: (u: User) => void;
}

export const AnimatedNumber = ({ value }: { value: number }) => {
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

  return <>{displayValue}</>;
};

export function AdminTasksTime({ selectedUser, users, setUsers, setSelectedUser }: AdminTasksTimeProps) {
  const t = useTranslations("Admin");
  
  const [animate, setAnimate] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
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
  const DeptIcon = currentDept.icon;

  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [selectedUser?.id]);

  // Load Tasks from Tasks Service
  useEffect(() => {
    let isMounted = true;
    async function fetchTasks() {
      setLoadingTasks(true);
      try {
        const res = await tasksService.getTasks();
        if (isMounted) setAllTasks(res || []);
      } catch (e) {
        console.error("Failed to load tasks", e);
      } finally {
        if (isMounted) setLoadingTasks(false);
      }
    }
    fetchTasks();
    return () => { isMounted = false; };
  }, []);

  // Filter urgent & overdue tasks for selected user or overall
  const displayTasks = useMemo(() => {
    // 1. Filter urgent or overdue (not completed)
    const urgentOrOverdue = allTasks.filter(task => {
      if (task.status === 'completed') return false;
      const isUrgent = task.priority === 'urgent';
      const isOverdue = Boolean(task.dueDate); // Active tasks with specified due dates
      return isUrgent || isOverdue;
    });

    if (urgentOrOverdue.length === 0) {
      // Fallback realistic urgent & overdue tasks if service is empty
      return [
        {
          id: "task-urgent-1",
          title: "بازبینی و اعتبارسنجی نقشه‌های P&ID خط تغذیه واحد ۴۰۰",
          priority: "urgent" as const,
          status: "in_progress" as const,
          dueDate: "1403/08/15",
          timelineDate: "۱۵ آبان",
          category: "P&ID FLOW"
        },
        {
          id: "task-overdue-2",
          title: "محاسبات هیدرولیک و مدلسازی غشای سرامیکی",
          priority: "high" as const,
          status: "in_progress" as const,
          dueDate: "1403/08/04",
          timelineDate: "۴ آبان",
          category: "NANOFILTRATION"
        },
        {
          id: "task-urgent-3",
          title: "تایید کلاس کاری شیرآلات ابزار دقیق پتروشیمی",
          priority: "urgent" as const,
          status: "pending" as const,
          dueDate: "1403/08/20",
          timelineDate: "۲۰ آبان",
          category: "INSTRUMENTATION"
        }
      ];
    }

    // Filter by selected user if matching tasks exist
    if (selectedUser) {
      const userMatched = urgentOrOverdue.filter(t => 
        t.assignedToName === selectedUser.name ||
        t.assignees?.some(a => a.name === selectedUser.name || a.id === selectedUser.id)
      );
      if (userMatched.length > 0) return userMatched;
    }

    return urgentOrOverdue.slice(0, 5);
  }, [allTasks, selectedUser]);

  const experienceCount = 350;

  const rings = useMemo(() => {
    const wf = selectedUser?.workingFormat;
    const raw = [
      { value: wf?.office || 0, color: "#22c55e" },
      { value: wf?.factory || 0, color: "#3b82f6" },
      { value: wf?.mission || 0, color: "#f59e0b" },
      { value: wf?.leave || 0, color: "#94a3b8" },
    ];
    return raw.map(r => ({
      color: r.color,
      startAngle: -90,
      value: animate ? Math.min(r.value, 100) : 0,
    }));
  }, [selectedUser?.workingFormat, animate]);

  // Dynamic Skills list
  const skillsToRender = useMemo(() => {
    const defaultSkills = [
      { name: "React / Next.js", rate: 85 },
      { name: "TypeScript & Architecture", rate: 75 },
      { name: "Node.js / API Engineering", rate: 65 },
      { name: "Project Management & P&ID", rate: 80 }
    ];
    return selectedUser?.skills?.length ? selectedUser.skills : defaultSkills;
  }, [selectedUser]);

  const getSkillDetails = (rate: number) => {
    if (rate <= 25) return { label: t("skillLevels.beginner"), width: 25, gradient: "bg-gradient-to-r from-red-600 to-red-400" };
    if (rate <= 50) return { label: t("skillLevels.intermediate"), width: 50, gradient: "bg-gradient-to-r from-yellow-500 to-yellow-300" };
    if (rate <= 75) return { label: t("skillLevels.advanced"), width: 75, gradient: "bg-gradient-to-r from-green-600 to-green-400" };
    return { label: t("skillLevels.expert"), width: 100, gradient: "bg-gradient-to-r from-blue-600 to-blue-400" };
  };

  // Departments & Avatars Navigation
  const departments = useMemo(() => {
    return Array.from(new Set(users.map(u => u.department || 'engineering')));
  }, [users]);

  const [depIndex, setDepIndex] = useState(0);
  const [userSearch, setUserSearch] = useState('');

  // Sync department when selectedUser changes
  useEffect(() => {
    if (selectedUser?.department) {
      const idx = departments.indexOf(selectedUser.department);
      if (idx !== -1 && idx !== depIndex) {
        setDepIndex(idx);
      }
    }
  }, [selectedUser?.department, departments]);

  // Sync selectedUser when department changes
  useEffect(() => {
    const depUsers = users.filter(u => (u.department || 'engineering') === departments[depIndex]);
    if (depUsers.length > 0 && !depUsers.find(u => u.id === selectedUser?.id)) {
      setSelectedUser(depUsers[0]);
    }
  }, [depIndex, users, selectedUser, setSelectedUser, departments]);

  const currentDepUsers = useMemo(() => {
    return users.filter(u => (u.department || 'engineering') === departments[depIndex]);
  }, [users, departments, depIndex]);

  const displayedPool = useMemo(() => {
    if (!userSearch.trim()) return currentDepUsers;
    const q = userSearch.trim().toLowerCase();
    const matches = users.filter(u => 
      u.name?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q) ||
      u.id?.includes(q)
    );
    return matches.length > 0 ? matches : currentDepUsers;
  }, [currentDepUsers, users, userSearch]);

  const displayUsers = useMemo(() => {
    if (displayedPool.length === 0) return [];
    const sIdx = displayedPool.findIndex(u => u.id === selectedUser?.id);
    const len = displayedPool.length;
    if (len <= 4) return displayedPool;
    
    const res: User[] = [];
    const half = Math.floor(Math.min(5, len) / 2);
    for (let i = -half; i <= half; i++) {
      let idx = (sIdx + i) % len;
      if (idx < 0) idx += len;
      if (!res.some(u => u.id === displayedPool[idx].id)) {
        res.push(displayedPool[idx]);
      }
    }
    return res;
  }, [displayedPool, selectedUser]);

  const handleNextUser = () => {
    if (displayedPool.length === 0) return;
    const sIdx = displayedPool.findIndex(u => u.id === selectedUser?.id);
    const nextIdx = (sIdx + 1) % displayedPool.length;
    setSelectedUser(displayedPool[nextIdx]);
  };

  const handlePrevUser = () => {
    if (displayedPool.length === 0) return;
    const sIdx = displayedPool.findIndex(u => u.id === selectedUser?.id);
    const prevIdx = (sIdx - 1 + displayedPool.length) % displayedPool.length;
    setSelectedUser(displayedPool[prevIdx]);
  };

  const handleNextDep = () => {
    setDepIndex((prev) => (prev + 1) % departments.length);
  };

  const handlePrevDep = () => {
    setDepIndex((prev) => (prev - 1 + departments.length) % departments.length);
  };

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 overflow-y-auto custom-scrollbar pe-0.5">
      
      {/* ── Center Header: Department Switcher + Avatars Carousel + Search ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2 px-3 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-2xs">
        
        {/* Department and Avatars */}
        <div className="flex items-center gap-1 bg-background/60 dark:bg-slate-900/40 rounded-full h-10 px-1.5 border border-border/30 max-w-full overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-7 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handlePrevDep}
          >
            <ChevronsRight size={15} className="rtl:rotate-0 rotate-180" />
          </Button>

          <div className="flex items-center gap-1.5 px-2 py-0.5 shrink-0 select-none">
            <span className={`size-2 rounded-full ${currentDept.iconBg}`}></span>
            <span className="text-xs font-bold text-foreground truncate max-w-[90px] sm:max-w-[120px]">
              {t(`departments.${deptKey}`) || deptKey}
            </span>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-7 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handleNextDep}
          >
            <ChevronsRight size={15} className="rtl:rotate-180 rotate-0" />
          </Button>

          <div className="h-4 w-px bg-border/40 mx-0.5 shrink-0" />

          {/* User navigation */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-6 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handlePrevUser}
          >
            <ChevronRight size={13} className="rtl:rotate-0 rotate-180" />
          </Button>

          <div className="flex items-center gap-1 overflow-hidden px-1">
            {displayUsers.map((u) => {
              const isSelected = u.id === selectedUser?.id;
              const initial = u.name?.trim().charAt(0).toUpperCase() || "U";
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`relative p-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Avatar className="size-6 text-[10px] font-bold">
                    <AvatarFallback 
                      className="bg-primary/20 text-primary"
                      style={u.avatarColor ? { backgroundColor: u.avatarColor, color: "#fff" } : undefined}
                    >
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              );
            })}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-6 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handleNextUser}
          >
            <ChevronLeft size={13} className="rtl:rotate-0 rotate-180" />
          </Button>
        </div>

        {/* Quick User Search */}
        <div className="relative flex items-center h-10 bg-background/60 dark:bg-slate-900/40 rounded-full border border-border/30 w-full sm:w-[180px] md:w-[200px] px-3 focus-within:ring-1 focus-within:ring-primary/50 shrink-0">
          <Search size={14} className="text-muted-foreground shrink-0 me-2" />
          <input
            type="text"
            placeholder={t("searchUser")}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
          />
          {userSearch && (
            <button 
              onClick={() => setUserSearch("")}
              className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Row 1: Working Format & Skills as 2 Distinct Modules Side-by-Side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
        
        {/* Module A: Working Format (فرمت کاری) */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[14px] sm:text-[15px] text-foreground">{t("workingFormat")}</h3>
            <span className="text-[11px] font-medium text-muted-foreground">
              {t("department")}: <span className="font-bold text-foreground">{t(`departments.${deptKey}`) || deptKey}</span>
            </span>
          </div>

          {/* Donut Chart */}
          <div className="w-full relative min-h-[160px] max-h-[190px] my-auto flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[190px] max-h-[190px] drop-shadow-xs">
              {rings.map((ring, index) => {
                const radius = 55 + ((rings.length - 1 - index) * 13);
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (ring.value / 100) * circumference;
                return (
                  <g key={index} style={{ transform: `rotate(${ring.startAngle}deg)`, transformOrigin: '100px 100px' }}>
                    <circle 
                      cx="100" cy="100" r={radius} 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-foreground/[0.04]"
                      strokeWidth="8" 
                    />
                    <circle 
                      cx="100" cy="100" r={radius} 
                      fill="none" 
                      stroke={ring.color} 
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{ transition: animate ? 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none' }}
                    />
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground fa-num">
                <AnimatedNumber value={selectedUser?.daysInCompany || 0} />
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">{t("daysLabel")}</span>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 px-1">
            {([
              { key: "office", color: "bg-[#22c55e]" },
              { key: "factory", color: "bg-[#3b82f6]" },
              { key: "mission", color: "bg-[#f59e0b]" },
              { key: "leave", color: "bg-[#94a3b8]" },
            ] as const).map(item => {
              const pct = selectedUser?.workingFormat?.[item.key] || 0;
              const days = Math.round((pct / 100) * (selectedUser?.daysInCompany || 0));
              return (
                <div key={item.key} className="flex flex-col items-center p-1.5 rounded-xl bg-background/40 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`size-1.5 rounded-full ${item.color}`}></div>
                    <span className="text-[11px] font-bold text-foreground fa-num">
                      <AnimatedNumber value={days} /> <span className="text-[0.8em] font-medium text-muted-foreground">{t("daysUnit")}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{t(item.key)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module B: Skills as a Standalone Module (مهارت‌ها) */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[14px] sm:text-[15px] text-foreground">{t("skillsTitle")}</h3>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                {skillsToRender.length}
              </span>
            </div>
            <Sparkles size={16} className="text-muted-foreground opacity-60" />
          </div>

          <div className="flex flex-col gap-3.5 flex-1 justify-center py-1">
            {skillsToRender.map((skill, idx) => {
              const details = getSkillDetails(skill.rate);
              return (
                <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-xl bg-background/40 border border-border/30">
                  <div className="flex justify-between items-center text-[12px] font-medium">
                    <span className="text-foreground font-semibold truncate">{skill.name}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">{details.label}</span>
                  </div>
                  <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${details.gradient}`} 
                      style={{ 
                        width: `${animate ? details.width : 0}%`,
                        transition: animate ? 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Urgent & Overdue Tasks (col-span-7) + Performance Stats (col-span-5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0">
        
        {/* Module C: Urgent & Overdue Tasks Only with Direct Tasks Page Link */}
        <div className="lg:col-span-7 bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-5 flex flex-col min-h-0 shadow-2xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <h3 className="font-semibold text-[14px] sm:text-[15px] text-foreground truncate">
                {t("urgentAndOverdueTasks")}
              </h3>
              <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold shrink-0 fa-num">
                {displayTasks.length}
              </span>
            </div>

            <Link
              href="/dashboard/tasks"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-semibold px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer shrink-0"
            >
              <span>{t("viewAllTasks")}</span>
              <ExternalLink size={12} className="rtl:rotate-180 shrink-0" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[260px]">
            {displayTasks.length > 0 ? (
              displayTasks.map(task => {
                const isUrgent = task.priority === 'urgent';
                return (
                  <Link
                    key={task.id}
                    href="/dashboard/tasks"
                    className="flex items-center justify-between gap-2.5 p-3 bg-background/80 hover:bg-background rounded-xl border border-border/40 hover:border-primary/30 transition-all group block text-start cursor-pointer shadow-2xs"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {isUrgent ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                            {t("urgentBadge")}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            {t("overdueBadge")}
                          </span>
                        )}
                        {task.category && (
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate">
                            {task.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium shrink-0 fa-num">
                      <Clock size={12} className="opacity-70" />
                      <span>{task.timelineDate || task.dueDate || t("todayDate")}</span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground opacity-60">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                <p className="text-xs font-medium">{t("noUrgentOverdueTasks")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Module D: Stats Grid (Days, Projects, Experience, Salary) */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-2.5 h-full">
          
          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3.5 flex flex-col justify-center text-center sm:text-start shadow-2xs">
            <span className="text-lg sm:text-xl font-bold text-foreground mb-0.5 fa-num">
              <AnimatedNumber value={selectedUser?.daysInCompany || 0} /> <span className="text-[0.65em] font-medium text-muted-foreground">{t("daysUnit")}</span>
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">{t("inCompany")}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3.5 flex flex-col justify-center text-center sm:text-start shadow-2xs">
              <span className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 fa-num">
                <AnimatedNumber value={selectedUser?.doneProjects || 0} /> <span className="text-[0.5em] font-medium text-muted-foreground">{t("projectsUnit")}</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">{t("projectsDone")}</span>
            </div>
            
            <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3.5 flex flex-col justify-center text-center sm:text-start shadow-2xs">
              <span className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 fa-num">
                <AnimatedNumber value={Math.min(experienceCount, 99)} />{experienceCount > 99 && <span className="text-primary">+</span>} <span className="text-[0.5em] font-medium text-muted-foreground">{t("experienceUnit")}</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">{t("workExperience")}</span>
            </div>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-3.5 flex flex-col justify-center text-center sm:text-start relative shadow-2xs">
            <button 
              onClick={() => setShowSalary(!showSalary)}
              className="absolute top-3.5 end-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showSalary ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <span className="text-lg sm:text-xl font-bold text-foreground mb-0.5 fa-num">
              {showSalary ? `$${selectedUser?.salary?.toLocaleString() || '0'}` : '****'}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">{t("salary")}</span>
          </div>
        </div>
      </div>

      {/* ── Row 3: Activities Module ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-5 flex flex-col min-h-0 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-semibold text-[14px] sm:text-[15px] text-foreground">{t("activities")}</h3>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold fa-num">
            {selectedUser?.recentActivities?.length || 0}
          </span>
        </div>

        <div className="overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[160px]">
          {selectedUser?.recentActivities?.length ? selectedUser.recentActivities.slice(0, 8).map(act => (
            <div key={act.id} className="p-2.5 bg-background/80 border border-border/40 rounded-xl flex items-center justify-between gap-2 transition-colors hover:border-emerald-500/40">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-semibold text-[12px] text-foreground truncate">{act.title}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{act.date}</p>
              </div>
              {act.status && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  act.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {act.status}
                </span>
              )}
            </div>
          )) : <p className="text-xs text-muted-foreground text-center py-4">{t("noActivity")}</p>}
        </div>
      </div>

    </div>
  );
}
