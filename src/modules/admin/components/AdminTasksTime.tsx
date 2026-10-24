import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, Search, Plus, Star, X, Eye, EyeOff, ArrowLeft, Code, 
  TrendingUp, FolderKanban, Briefcase, FlaskConical,
  ChevronsRight, ChevronsLeft, ChevronRight, ChevronLeft
} from "lucide-react";
import { useTranslations } from "next-intl";
import { User } from "../types/admin.types";

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
      // Use Math.round to reach endValue correctly
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
  
  const [activeChartTab, setActiveChartTab] = useState<'workingFormat' | 'skills'>('workingFormat');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [animate, setAnimate] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

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

  const handleAddTask = () => {
    if (!selectedUser || !newTaskTitle.trim()) return;
    const updatedUser = { ...selectedUser };
    if (!updatedUser.checklists) updatedUser.checklists = [];
    updatedUser.checklists.unshift({
      id: `c_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      creator: t("manager"),
      date: t("todayDate")
    } as any);
    setSelectedUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setNewTaskTitle('');
  };

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
  }, [selectedUser, animate]);

  const skillsToRender = useMemo(() => {
    const uId = parseInt(selectedUser?.id || '0') || 0;
    const defaultSkills = [
      { name: t("skillCommunication"), rate: 70 + ((uId * 3) % 25) },
      { name: t("skillTechnical"), rate: 65 + ((uId * 7) % 30) },
      { name: t("skillTeamwork"), rate: 60 + ((uId * 5) % 35) },
    ];
    return selectedUser?.skills?.length ? selectedUser.skills : defaultSkills;
  }, [selectedUser, t]);

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
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* ── Center Content Header: Department Switcher + Avatars Carousel + Search ── */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2 px-3 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-2xs">
        {/* Inline Department and Avatars */}
        <div className="flex items-center gap-1 bg-background/60 dark:bg-slate-900/40 rounded-full h-10 px-1.5 border border-border/30 max-w-full overflow-hidden">
          {/* Prev Department */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-7 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handlePrevDep}
          >
            <ChevronsRight size={15} className="rtl:rotate-0 rotate-180" />
          </Button>

          {/* Department Name */}
          <div className="min-w-[70px] max-w-[110px] text-center font-bold text-foreground text-xs whitespace-nowrap truncate px-1">
            {departments.length > 0 ? (
              (() => {
                try { return t(`departments.${departments[depIndex]}`); }
                catch { return departments[depIndex]; }
              })()
            ) : '...'}
          </div>

          {/* Prev User */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-6.5 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handlePrevUser}
          >
            <ChevronRight size={13} className="rtl:rotate-0 rotate-180" />
          </Button>

          {/* Avatars Carousel */}
          <div className="flex items-center px-1 min-w-[110px] justify-center h-full">
            <AnimatePresence mode="popLayout">
              {displayUsers.map((u) => {
                const isActive = u.id === selectedUser?.id;
                return (
                  <motion.div
                    layout
                    key={u.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="mx-0.5 z-10 hover:z-20 shrink-0"
                  >
                    <Avatar 
                      className={cn(
                        "border-[2px] border-card cursor-pointer transition-all duration-300 origin-center",
                        isActive 
                          ? "size-8 ring-2 ring-primary z-30 shadow-sm" 
                          : "size-6.5 opacity-60 hover:opacity-100 grayscale-[40%] hover:grayscale-0"
                      )} 
                      onClick={() => setSelectedUser(u)}
                      title={u.name}
                    >
                      
                      <AvatarFallback className="bg-muted text-foreground text-[10px] font-bold">{u.name[0]}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Next User */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-6.5 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handleNextUser}
          >
            <ChevronLeft size={13} className="rtl:rotate-0 rotate-180" />
          </Button>

          {/* Members Count */}
          <div className="text-center text-muted-foreground font-medium text-[10px] whitespace-nowrap px-1.5 fa-num hidden sm:block">
            {t("15members", { count: currentDepUsers.length })}
          </div>

          {/* Next Department */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full size-7 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" 
            onClick={handleNextDep}
          >
            <ChevronsLeft size={15} className="rtl:rotate-0 rotate-180" />
          </Button>
        </div>

        {/* User Search Input */}
        <div className="relative flex items-center h-10 bg-background/60 dark:bg-slate-900/40 rounded-full border border-border/30 w-full sm:w-[200px] md:w-[220px] px-3 transition-all focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 shrink-0">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <Input 
            className="flex-1 border-none bg-transparent h-full px-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
            placeholder={t("search")}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          {userSearch && (
            <button
              type="button"
              onClick={() => setUserSearch("")}
              className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main 4-Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 lg:grid-rows-[1fr_auto]">
      <div className="lg:col-span-5 lg:row-span-1 flex flex-col h-full min-h-0">
        {/* Working Format & Skills (Moved to Top) */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-6 flex flex-col flex-1 min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-xl">
              <button
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeChartTab === 'workingFormat' ? 'bg-white dark:bg-slate-600 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveChartTab('workingFormat')}
              >
                {t("workingFormat")}
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeChartTab === 'skills' ? 'bg-white dark:bg-slate-600 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveChartTab('skills')}
              >
                {t("skillsTitle")}
              </button>
            </div>
            <MoreVertical size={16} className="text-muted-foreground shrink-0" />
          </div>
          
          {activeChartTab === 'workingFormat' && (
            <>
              <div className="flex-1 w-full relative min-h-[160px] max-h-[220px] my-auto fade-in-0 animate-in zoom-in-95 duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] max-h-[200px] drop-shadow-sm">
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
                    <span className="text-2xl font-bold text-foreground"><AnimatedNumber value={selectedUser?.daysInCompany || 0} /></span>
                    <span className="text-[10px] text-muted-foreground font-medium">{t("daysLabel")}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 px-2 fade-in-0 animate-in zoom-in-95 duration-300">
                {([
                  { key: "office", color: "bg-[#22c55e]" },
                  { key: "factory", color: "bg-[#3b82f6]" },
                  { key: "mission", color: "bg-[#f59e0b]" },
                  { key: "leave", color: "bg-[#94a3b8]" },
                ] as const).map(item => {
                  const pct = selectedUser?.workingFormat?.[item.key] || 0;
                  const days = Math.round((pct / 100) * (selectedUser?.daysInCompany || 0));
                  return (
                    <div key={item.key} className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
                        <span className="text-[11px] font-bold text-foreground"><AnimatedNumber value={days} /> <span className="text-[0.8em] font-medium text-muted-foreground">{t("daysUnit")}</span></span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{t(item.key)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeChartTab === 'skills' && (
            <div className="flex flex-col gap-4 flex-1 overflow-hidden overflow-y-auto pr-1 my-auto fade-in-0 animate-in zoom-in-95 duration-300 justify-center">
              {skillsToRender.map((skill, idx) => {
                const details = getSkillDetails(skill.rate);
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[13px] font-medium">
                      <span className="text-foreground">{skill.name}</span>
                      <span className="text-muted-foreground">{details.label}</span>
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
          )}
        </div>
      </div>

      {/* Top Right: Checklists */}
      <div className="lg:col-span-7 lg:row-span-1 bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-6 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold text-[15px] text-foreground">{t("checklists")}</h3>
          <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{selectedUser?.checklists?.length || 0}</span>
        </div>
        
        <div className="shrink-0 flex gap-2 mb-3 items-start">
          <Textarea 
            placeholder={t("newTaskPlaceholder")} 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="min-h-[40px] max-h-[120px] pt-[11px] pb-2 px-3 bg-background border-border/40 rounded-xl text-xs flex-1 shadow-none focus-visible:ring-1 resize-y leading-tight"
            onKeyDown={e => {
              if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddTask();
              }
            }}
          />
          <Button 
            size="icon" 
            className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-0"
            onClick={handleAddTask}
          >
            <Plus size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
          {selectedUser?.checklists?.length ? selectedUser.checklists.map(check => (
            <div key={check.id} className="flex items-center justify-between gap-2 p-2.5 bg-background rounded-xl border border-border/40 group relative overflow-hidden transition-colors hover:border-destructive/30">
              <div className="flex flex-col flex-1 min-w-0 pr-1">
                <span className="text-[12px] font-medium truncate text-foreground">{check.title}</span>
                <span className="text-[9px] text-muted-foreground font-medium mt-0.5">
                  {((check as any).creator || t("user"))} • {((check as any).date || t("todayDate"))}
                </span>
              </div>
              <button 
                onClick={() => {
                  const updatedUser = { ...selectedUser };
                  updatedUser.checklists = updatedUser.checklists!.filter(c => c.id !== check.id);
                  setSelectedUser(updatedUser);
                  setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                }}
                className="text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100 transition-colors shrink-0 p-1"
              >
                <X size={14} />
              </button>
            </div>
          )) : <p className="text-[10px] text-muted-foreground text-center mt-4">{t("noTasks")}</p>}
        </div>
      </div>

      {/* Bottom Left: Stats Grid */}
      <div className="lg:col-span-5 lg:row-span-1 grid grid-cols-1 gap-3 h-full">
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start">
          <span className="text-lg sm:text-xl font-bold text-foreground mb-1"><AnimatedNumber value={selectedUser?.daysInCompany || 0} /> <span className="text-[0.7em] font-medium text-muted-foreground">{t("daysUnit")}</span></span>
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{t("inCompany")}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start">
            <span className="text-2xl sm:text-3xl font-bold text-foreground mb-1"><AnimatedNumber value={selectedUser?.doneProjects || 0} /> <span className="text-[0.5em] font-medium text-muted-foreground">{t("projectsUnit")}</span></span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{t("projectsDone")}</span>
          </div>
          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start">
            <span className="text-2xl sm:text-3xl font-bold text-foreground mb-1"><AnimatedNumber value={Math.min(experienceCount, 99)} />{experienceCount > 99 && <span className="text-primary">+</span>} <span className="text-[0.5em] font-medium text-muted-foreground">{t("experienceUnit")}</span></span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{t("workExperience")}</span>
          </div>
        </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-4 flex flex-col justify-center text-center sm:text-start relative">
            <button 
              onClick={() => setShowSalary(!showSalary)}
              className="absolute top-4 end-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSalary ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <span className="text-lg sm:text-xl font-bold text-foreground mb-1">
              {showSalary ? `$${selectedUser?.salary?.toLocaleString() || '0'}` : '****'}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{t("salary")}</span>
          </div>
      </div>

      {/* Bottom Right: Activities */}
      <div className="lg:col-span-7 lg:row-span-1 bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-6 flex flex-col min-h-0 h-full">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold text-[15px] text-foreground">{t("activities")}</h3>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">{selectedUser?.recentActivities?.length || 0}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
          {selectedUser?.recentActivities?.length ? selectedUser.recentActivities.slice(0,10).map(act => (
            <div key={act.id} className="p-2.5 bg-background border border-border/40 rounded-xl flex flex-col gap-1.5 group relative overflow-hidden transition-colors hover:border-emerald-500/40">
              <div className="flex flex-col gap-0.5 pr-1">
                <p className="font-semibold text-[12px] text-foreground truncate">{act.title}</p>
                <p className="text-[9px] text-muted-foreground font-medium">{act.date}</p>
              </div>
            </div>
          )) : <p className="text-[10px] text-muted-foreground text-center mt-4">{t("noActivity")}</p>}
        </div>
      </div>
    </div>
  </div>
  );
}
