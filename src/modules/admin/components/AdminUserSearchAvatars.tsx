// src/modules/admin/components/AdminUserSearchAvatars.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getRoleRingClass } from "@/lib/role-avatar";
import { 
  Search, X, Code, TrendingUp, FolderKanban, Briefcase, FlaskConical,
  ChevronsRight, ChevronRight, ChevronLeft
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { User } from "../types/admin.types";

interface AdminUserSearchAvatarsProps {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (u: User) => void;
  className?: string;
}

export function AdminUserSearchAvatars({
  users,
  selectedUser,
  setSelectedUser,
  className,
}: AdminUserSearchAvatarsProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const deptConfig: Record<string, { icon: any; iconBg: string }> = {
    engineering: { icon: Code, iconBg: "bg-blue-500 shadow-blue-500/30" },
    Engineering: { icon: Code, iconBg: "bg-blue-500 shadow-blue-500/30" },
    marketDevelopment: { icon: TrendingUp, iconBg: "bg-emerald-500 shadow-emerald-500/30" },
    projectControl: { icon: FolderKanban, iconBg: "bg-amber-500 shadow-amber-500/30" },
    administrative: { icon: Briefcase, iconBg: "bg-slate-500 shadow-slate-500/30" },
    rAndD: { icon: FlaskConical, iconBg: "bg-purple-500 shadow-purple-500/30" },
  };

  const departments = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.department || "engineering")));
  }, [users]);

  const [depIndex, setDepIndex] = useState(0);
  const [userSearch, setUserSearch] = useState("");

  // Sync department when selectedUser changes
  useEffect(() => {
    if (selectedUser?.department) {
      const idx = departments.indexOf(selectedUser.department);
      if (idx !== -1) {
        setDepIndex((prev) => (prev !== idx ? idx : prev));
      }
    }
  }, [selectedUser?.id, selectedUser?.department, departments]);

  // If no user is selected at all, pick the first user of the current department
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      const depUsers = users.filter((u) => (u.department || "engineering") === departments[depIndex]);
      if (depUsers.length > 0) {
        setSelectedUser(depUsers[0]);
      }
    }
  }, [selectedUser, depIndex, departments, users, setSelectedUser]);

  const currentDepUsers = useMemo(() => {
    return users.filter((u) => (u.department || "engineering") === departments[depIndex]);
  }, [users, departments, depIndex]);

  const displayedPool = useMemo(() => {
    if (!userSearch.trim()) return currentDepUsers;
    const q = userSearch.trim().toLowerCase();
    const matches = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.includes(q)
    );
    return matches.length > 0 ? matches : currentDepUsers;
  }, [currentDepUsers, users, userSearch]);

  const displayUsers = useMemo(() => {
    if (displayedPool.length === 0) return [];
    const sIdx = displayedPool.findIndex((u) => u.id === selectedUser?.id);
    const len = displayedPool.length;
    if (len <= 4) return displayedPool;

    const res: User[] = [];
    const half = Math.floor(Math.min(5, len) / 2);
    for (let i = -half; i <= half; i++) {
      let idx = (sIdx + i) % len;
      if (idx < 0) idx += len;
      if (!res.some((u) => u.id === displayedPool[idx].id)) {
        res.push(displayedPool[idx]);
      }
    }
    return res;
  }, [displayedPool, selectedUser]);

  const handleNextUser = () => {
    if (displayedPool.length === 0) return;
    const sIdx = displayedPool.findIndex((u) => u.id === selectedUser?.id);
    const nextIdx = (sIdx + 1) % displayedPool.length;
    setSelectedUser(displayedPool[nextIdx]);
  };

  const handlePrevUser = () => {
    if (displayedPool.length === 0) return;
    const sIdx = displayedPool.findIndex((u) => u.id === selectedUser?.id);
    const prevIdx = (sIdx - 1 + displayedPool.length) % displayedPool.length;
    setSelectedUser(displayedPool[prevIdx]);
  };

  const handleNextDep = () => {
    setDepIndex((prev) => (prev + 1) % departments.length);
  };

  const handlePrevDep = () => {
    setDepIndex((prev) => (prev - 1 + departments.length) % departments.length);
  };

  const deptKey = departments[depIndex] || "engineering";
  const currentDept = deptConfig[deptKey] || deptConfig.engineering;

  return (
    <div
      className={cn(
        "bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[1.5rem] p-2.5 px-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0 shadow-2xs overflow-visible w-full",
        className
      )}
    >
      {/* Quick User Search Bar */}
      <div className="relative flex items-center h-9 bg-white dark:bg-slate-900 rounded-full border border-border/50 w-full sm:w-[260px] md:w-[280px] lg:w-[320px] px-3 shadow-xs focus-within:ring-1 focus-within:ring-primary/50 shrink-0">
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
            title="Clear"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Department Selector & Avatars Carousel */}
      <div className="flex items-center gap-1.5 bg-background/60 dark:bg-slate-900/40 rounded-full h-9 px-2 border border-border/30 max-w-full overflow-visible relative flex-wrap sm:flex-nowrap justify-center sm:justify-start">
        {/* Previous Department Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-7 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          onClick={handlePrevDep}
          title={t("previousDepartment") || "Previous department"}
        >
          <ChevronsRight size={15} className="rtl:rotate-0 rotate-180" />
        </Button>

        {/* Department Name Badge */}
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 shrink-0 select-none">
          <span className={`size-2 rounded-full ${currentDept.iconBg}`}></span>
          <span className="text-xs font-bold text-foreground truncate max-w-[130px] sm:max-w-[200px]" title={t.has(`departments.${deptKey}`) ? t(`departments.${deptKey}`) : deptKey}>
            {t.has(`departments.${deptKey}`) ? t(`departments.${deptKey}`) : deptKey}
          </span>
        </div>

        {/* Next Department Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-7 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          onClick={handleNextDep}
          title={t("nextDepartment") || "Next department"}
        >
          <ChevronsRight size={15} className="rtl:rotate-180 rotate-0" />
        </Button>

        <div className="h-4 w-px bg-border/40 mx-0.5 shrink-0" />

        {/* User Navigation: Previous */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-6 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          onClick={handlePrevUser}
          title={t("previousUser") || "Previous user"}
        >
          <ChevronRight size={13} className="rtl:rotate-0 rotate-180" />
        </Button>

        {/* Avatars Carousel */}
        <div className="flex items-center gap-1.5 overflow-visible px-1 py-1">
          {displayUsers.map((u) => {
            const isSelected = u.id === selectedUser?.id;
            const enName = (u.firstName || u.lastName)
              ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
              : (u.fullName || u.name || u.email?.split('@')[0] || "User");
            const faName = (u.firstNameFa || u.lastNameFa)
              ? `${u.firstNameFa || ''} ${u.lastNameFa || ''}`.trim()
              : (u.fullNameFa || u.name || enName);
            const displayName = isRtl ? faName : enName;
            const initial = isRtl
              ? (u.firstNameFa?.trim()?.charAt(0) || u.name?.trim()?.charAt(0) || "ک")
              : (u.firstName?.trim()?.charAt(0)?.toUpperCase() || u.name?.trim()?.charAt(0)?.toUpperCase() || "U");
            return (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={cn(
                  "relative rounded-full transition-all shrink-0 cursor-pointer -my-2.5",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-20"
                    : "opacity-75 hover:opacity-100 hover:scale-105 z-10"
                )}
                title={displayName}
              >
                <Avatar className="size-9 text-xs font-bold border-2 border-background dark:border-slate-800 shadow-md">
                  <AvatarFallback
                    className="bg-primary/20 text-primary font-bold"
                    style={u.avatarColor ? { backgroundColor: u.avatarColor, color: "#fff" } : undefined}
                  >
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            );
          })}
        </div>

        {/* User Navigation: Next */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-6 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          onClick={handleNextUser}
          title={t("nextUser") || "Next user"}
        >
          <ChevronLeft size={13} className="rtl:rotate-0 rotate-180" />
        </Button>
      </div>
    </div>
  );
}

