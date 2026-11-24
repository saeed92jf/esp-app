"use client";

import React, { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Network,
  Users,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Sparkles,
  ArrowUpDown,
  UserPlus,
  RefreshCw,
  GitFork,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "../hooks/useAdmin";
import { User } from "../types/admin.types";
import {
  ORGANIZATION_DEPARTMENTS,
  OrganizationDepartmentDefinition,
  OrganizationRoleDefinition,
  getOrganizationDepartmentOptions,
  getOrganizationRoleOptions,
  resolveOrganizationDepartment,
  resolveOrganizationRole,
} from "@/config/organization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatPersonName } from "@/lib/person-names";

export function AdminOrgChart() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { users, setUsers, fetchData } = useAdmin();

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"tree" | "matrix" | "list">("tree");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Role Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<User | null>(null);
  const [targetDept, setTargetDept] = useState<string>("مهندسی و طراحی");
  const [targetRole, setTargetRole] = useState<string>("کارشناس مهندسی مکانیک");
  const [customManagerName, setCustomManagerName] = useState<string>("");
  const [autoCascade, setAutoCascade] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle tree node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === undefined ? false : !prev[nodeId],
    }));
  };

  // ─── Hierarchy Levels Mapping ──────────────────────────────────────────────
  const categorizedUsers = useMemo(() => {
    const executives: User[] = [];
    const managers: User[] = [];
    const supervisors: User[] = [];
    const specialists: User[] = [];
    const operators: User[] = [];

    users.forEach((u) => {
      const roleDef = resolveOrganizationRole(u.jobTitle, u.department);
      const title = (u.jobTitle || "").toLowerCase();
      const role = (u.role || "").toLowerCase();

      if (
        roleDef.level === "executive" ||
        title.includes("مدیر عامل") ||
        title.includes("هیئت مدیره") ||
        title.includes("معاونت") ||
        role === "superadmin"
      ) {
        executives.push(u);
      } else if (
        roleDef.level === "management" ||
        roleDef.isManagerial ||
        title.includes("مدیر دپارتمان") ||
        title.includes("مدیر پروژه") ||
        title.includes("مدیر کارخانه") ||
        title.includes("مدیر")
      ) {
        managers.push(u);
      } else if (
        roleDef.level === "supervisor" ||
        title.includes("سرپرست") ||
        title.includes("فورمن") ||
        title.includes("رئیس")
      ) {
        supervisors.push(u);
      } else if (
        roleDef.level === "specialist" ||
        title.includes("کارشناس") ||
        title.includes("مهندس") ||
        title.includes("طراح")
      ) {
        specialists.push(u);
      } else {
        operators.push(u);
      }
    });

    return { executives, managers, supervisors, specialists, operators };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const nameFa = (u.fullNameFa || u.name || "").toLowerCase();
        const nameEn = (u.fullName || "").toLowerCase();
        const code = (u.employeeId || u.personnelCode || "").toLowerCase();
        const job = (u.jobTitle || "").toLowerCase();
        const dept = (u.department || "").toLowerCase();
        if (!nameFa.includes(q) && !nameEn.includes(q) && !code.includes(q) && !job.includes(q) && !dept.includes(q)) {
          return false;
        }
      }

      // 2. Department Filter
      if (selectedDeptId !== "all") {
        const deptDef = ORGANIZATION_DEPARTMENTS.find((d) => d.id === selectedDeptId);
        const matchName = deptDef ? deptDef.nameFa.toLowerCase() : selectedDeptId.toLowerCase();
        const userDept = (u.department || "").toLowerCase();
        if (!userDept.includes(matchName) && !matchName.includes(userDept)) {
          return false;
        }
      }

      // 3. Level Filter
      if (selectedLevel !== "all") {
        const roleDef = resolveOrganizationRole(u.jobTitle, u.department);
        if (selectedLevel === "executive" && roleDef.level !== "executive") return false;
        if (selectedLevel === "management" && roleDef.level !== "management") return false;
        if (selectedLevel === "supervisor" && roleDef.level !== "supervisor") return false;
        if (selectedLevel === "specialist" && roleDef.level !== "specialist") return false;
        if (selectedLevel === "operator" && roleDef.level !== "operator" && roleDef.level !== "technician" && roleDef.level !== "general") return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedDeptId, selectedLevel]);

  // Open Assign Role Modal for a specific user
  const handleOpenAssignModal = (user?: User) => {
    if (user) {
      setAssignUser(user);
      setTargetDept(user.department || "مهندسی و طراحی");
      setTargetRole(user.jobTitle || "کارشناس مهندسی");
      setCustomManagerName(user.manager || "");
    } else {
      setAssignUser(users[0] || null);
      setTargetDept("مهندسی و طراحی");
      setTargetRole("کارشناس مهندسی");
      setCustomManagerName("");
    }
    setAutoCascade(true);
    setIsAssignModalOpen(true);
  };

  // Target Role Level & Cascade Calculation
  const selectedRoleDef = useMemo(() => {
    return resolveOrganizationRole(targetRole, targetDept);
  }, [targetRole, targetDept]);

  const isTargetManagerial = useMemo(() => {
    return (
      selectedRoleDef.isManagerial ||
      selectedRoleDef.level === "management" ||
      selectedRoleDef.level === "supervisor" ||
      selectedRoleDef.level === "executive" ||
      targetRole.includes("مدیر") ||
      targetRole.includes("سرپرست")
    );
  }, [selectedRoleDef, targetRole]);

  // Calculate Subordinates that will be automatically updated
  const affectedSubordinates = useMemo(() => {
    if (!assignUser || !isTargetManagerial) return [];
    const deptNorm = targetDept.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.id !== assignUser.id &&
        (u.department?.trim().toLowerCase() === deptNorm ||
          u.department?.trim().includes(targetDept.trim()) ||
          targetDept.trim().includes(u.department?.trim() || "---"))
    );
  }, [assignUser, isTargetManagerial, targetDept, users]);

  // Suggested Direct Manager for Specialist Roles
  const suggestedManager = useMemo(() => {
    if (isTargetManagerial) {
      return "مدیر عامل";
    }
    const deptNorm = targetDept.trim().toLowerCase();
    const deptMgr = users.find(
      (u) =>
        u.id !== assignUser?.id &&
        (u.department?.trim().toLowerCase() === deptNorm ||
          u.department?.trim().includes(targetDept.trim())) &&
        (u.jobTitle?.includes("مدیر") || u.jobTitle?.includes("سرپرست"))
    );
    return deptMgr ? deptMgr.name : "مدیر دپارتمان";
  }, [isTargetManagerial, targetDept, users, assignUser]);

  // Handle Form Submission for Role Assignment
  const handleConfirmAssignment = async () => {
    if (!assignUser) {
      toast.warning(isRtl ? "لطفاً کاربر را انتخاب کنید." : "Please select a user.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/org-chart/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: assignUser.id,
          department: targetDept,
          jobTitle: targetRole,
          manager: customManagerName.trim() || suggestedManager,
          directManager: customManagerName.trim() || suggestedManager,
          autoCascadeSubordinates: autoCascade,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || (isRtl ? "خطا در انتصاب سمت سازمانی" : "Failed to assign role"));
      }

      const resData = await res.json();

      // Update Frontend State in AdminContext
      const updatedUserMap = new Map<string, User>();
      (resData.updatedUsers || []).forEach((u: User) => {
        updatedUserMap.set(u.id, u);
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (updatedUserMap.has(u.id)) {
            return { ...u, ...updatedUserMap.get(u.id)! };
          }
          return u;
        })
      );

      toast.success(
        resData.message ||
          (isRtl
            ? `سمت «${targetRole}» با موفقیت برای «${assignUser.name}» اعمال شد.`
            : `Role "${targetRole}" successfully assigned to "${assignUser.name}".`)
      );

      if (resData.affectedSubordinatesCount > 0 && autoCascade) {
        toast.info(
          isRtl
            ? `مدیر مستقیم ${resData.affectedSubordinatesCount} نفر از پرسنل واحد به صورت خودکار به «${assignUser.name}» به‌روزرسانی گردید.`
            : `Direct manager of ${resData.affectedSubordinatesCount} team members was automatically updated to "${assignUser.name}".`
        );
      }

      if (fetchData) await fetchData();
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در انتصاب سمت" : "Assignment failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-12 animate-in fade-in duration-150">
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. Content Heading (Rule 5: Unified Tag & Content Heading) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
            <Network className="size-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span>{isRtl ? "چارت سازمانی و سلسله‌مراتب انتصابات" : "ESP Organizational Hierarchy"}</span>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                ESP CORE
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "مدیریت بصری ساختار سازمانی، انتصاب سمت‌ها و به‌روزرسانی هوشمند و آبشاری مدیران مستقیم پرسنل"
                : "Visual organizational tree, role assignment, and automated cascading of direct managers"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-background border border-border/50 rounded-xl shadow-2xs">
            <Button
              type="button"
              size="xs"
              variant={viewMode === "tree" ? "default" : "ghost"}
              onClick={() => setViewMode("tree")}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <GitFork className="size-3.5" />
              <span>{isRtl ? "نمودار درختی" : "Tree"}</span>
            </Button>
            <Button
              type="button"
              size="xs"
              variant={viewMode === "matrix" ? "default" : "ghost"}
              onClick={() => setViewMode("matrix")}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <LayoutGrid className="size-3.5" />
              <span>{isRtl ? "ماتریس دپارتمان‌ها" : "Departments"}</span>
            </Button>
            <Button
              type="button"
              size="xs"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <ListFilter className="size-3.5" />
              <span>{isRtl ? "لیست پرسنل" : "List"}</span>
            </Button>
          </div>

          {/* Primary Action: Assign Role Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => handleOpenAssignModal()}
            className="h-9 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="size-3.5 text-amber-300" />
            <span>{isRtl ? "انتصاب سمت سازمانی" : "Assign Role"}</span>
          </Button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. Key Metrics & Organizational Stats Strip */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/30 border border-border/40 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground block">{isRtl ? "کل پرسنل فعال" : "Total Personnel"}</span>
            <span className="text-lg font-bold text-foreground font-mono fa-num">{users.length}</span>
          </div>
          <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="size-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/30 border border-border/40 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground block">{isRtl ? "هیئت مدیره و ارشد" : "Board & Execs"}</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono fa-num">
              {categorizedUsers.executives.length}
            </span>
          </div>
          <div className="size-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldCheck className="size-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/30 border border-border/40 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground block">{isRtl ? "مدیران دپارتمان‌ها" : "Dept Managers"}</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono fa-num">
              {categorizedUsers.managers.length}
            </span>
          </div>
          <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="size-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/30 border border-border/40 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground block">{isRtl ? "سرپرستان واحدها" : "Supervisors"}</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono fa-num">
              {categorizedUsers.supervisors.length}
            </span>
          </div>
          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="size-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/30 border border-border/40 flex items-center justify-between col-span-2 sm:col-span-1">
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground block">{isRtl ? "دپارتمان‌های رسمی" : "Departments"}</span>
            <span className="text-lg font-bold text-foreground font-mono fa-num">{ORGANIZATION_DEPARTMENTS.length}</span>
          </div>
          <div className="size-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Building2 className="size-4" />
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 3. Search & Filter Bar */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "جستجوی پرسنل، سمت سازمانی یا کد پرسنلی..." : "Search personnel, role title or code..."}
            className="ps-9 h-9 bg-background border-border/60 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <Combobox
            options={[
              { value: "all", label: isRtl ? "همه دپارتمان‌ها" : "All Departments" },
              ...ORGANIZATION_DEPARTMENTS.map((d) => ({
                value: d.id,
                label: isRtl ? d.nameFa : d.nameEn,
                hint: d.code,
              })),
            ]}
            value={selectedDeptId}
            onChange={(val) => setSelectedDeptId(val)}
            allowClear={false}
            size="sm"
            triggerClassName="w-full md:w-52 justify-between h-9 rounded-xl bg-background border-border/60 text-xs"
          />

          {/* Level Filter */}
          <Combobox
            options={[
              { value: "all", label: isRtl ? "همه سطوح سازمانی" : "All Levels" },
              { value: "executive", label: isRtl ? "مدیریت ارشد و هیئت مدیره" : "Board & Executives" },
              { value: "management", label: isRtl ? "مدیران دپارتمان‌ها" : "Department Managers" },
              { value: "supervisor", label: isRtl ? "سرپرستان و روسای واحدها" : "Supervisors & Heads" },
              { value: "specialist", label: isRtl ? "کارشناسان و مهندسان" : "Specialists & Engineers" },
              { value: "operator", label: isRtl ? "نیروهای عملیاتی و تکنسین‌ها" : "Operators & Technicians" },
            ]}
            value={selectedLevel}
            onChange={(val) => setSelectedLevel(val)}
            allowClear={false}
            size="sm"
            triggerClassName="w-full md:w-48 justify-between h-9 rounded-xl bg-background border-border/60 text-xs"
          />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 4. Graphical Hierarchy Tree View */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === "tree" && (
        <div className="flex flex-col gap-6">
          {/* Level 1: Board of Directors & CEO */}
          <div className="flex flex-col items-center gap-3">
            <div className="px-4 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="size-3.5" />
              <span>{isRtl ? "سطح ۱: مدیریت ارشد، هیئت مدیره و مدیرعامل" : "Level 1: Executive Board & CEO"}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 w-full">
              {categorizedUsers.executives.map((u) => (
                <OrgPersonCard
                  key={u.id}
                  user={u}
                  onAssignRole={() => handleOpenAssignModal(u)}
                  isRtl={isRtl}
                  tierColor="border-rose-500/50 bg-rose-500/5"
                />
              ))}
            </div>
          </div>

          {/* Connecting Vertical Stem */}
          <div className="w-0.5 h-6 bg-border/80 mx-auto" />

          {/* Level 2: Department Managers */}
          <div className="flex flex-col items-center gap-3">
            <div className="px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Briefcase className="size-3.5" />
              <span>{isRtl ? "سطح ۲: مدیران دپارتمان‌های سازمانی" : "Level 2: Department Managers"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
              {categorizedUsers.managers.map((u) => (
                <OrgPersonCard
                  key={u.id}
                  user={u}
                  onAssignRole={() => handleOpenAssignModal(u)}
                  isRtl={isRtl}
                  tierColor="border-indigo-500/50 bg-indigo-500/5"
                  hasSubordinates
                />
              ))}
            </div>
          </div>

          {/* Connecting Vertical Stem */}
          <div className="w-0.5 h-6 bg-border/80 mx-auto" />

          {/* Level 3: Supervisors & Heads */}
          <div className="flex flex-col items-center gap-3">
            <div className="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <UserCheck className="size-3.5" />
              <span>{isRtl ? "سطح ۳: سرپرستان و روسای واحدها" : "Level 3: Unit Supervisors & Heads"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
              {categorizedUsers.supervisors.map((u) => (
                <OrgPersonCard
                  key={u.id}
                  user={u}
                  onAssignRole={() => handleOpenAssignModal(u)}
                  isRtl={isRtl}
                  tierColor="border-emerald-500/50 bg-emerald-500/5"
                  hasSubordinates
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 5. Department Matrix View */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === "matrix" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ORGANIZATION_DEPARTMENTS.map((dept) => {
            const deptUsers = users.filter((u) => {
              const uDept = (u.department || "").toLowerCase();
              return uDept.includes(dept.nameFa.toLowerCase()) || dept.nameFa.toLowerCase().includes(uDept);
            });

            const manager = deptUsers.find(
              (u) =>
                u.jobTitle?.includes("مدیر") ||
                u.role === "manager" ||
                u.jobTitle?.includes("معاونت") ||
                u.jobTitle?.includes("رئیس")
            );

            const supervisors = deptUsers.filter(
              (u) => u.id !== manager?.id && (u.jobTitle?.includes("سرپرست") || u.jobTitle?.includes("فورمن"))
            );

            const staffCount = deptUsers.length - (manager ? 1 : 0) - supervisors.length;

            return (
              <div
                key={dept.id}
                className="p-4 rounded-3xl bg-slate-100/90 dark:bg-slate-800/40 border border-border/50 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div>
                  {/* Department Header */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground">
                          {isRtl ? dept.nameFa : dept.nameEn}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-mono fa-num">
                          {deptUsers.length} {isRtl ? "نفر پرسنل" : "Members"}
                        </span>
                      </div>
                    </div>

                    <Badge variant="outline" className={cn("text-[10px] font-bold border", dept.badgeClass)}>
                      {dept.code}
                    </Badge>
                  </div>

                  {/* Active Manager Card */}
                  <div className="mt-3 p-3 rounded-2xl bg-background/80 border border-border/40 space-y-2">
                    <span className="text-[10px] font-semibold text-muted-foreground block">
                      {isRtl ? "مدیر مستقیم دپارتمان:" : "Direct Department Manager:"}
                    </span>
                    {manager ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 rounded-xl border border-border/60">
                            <AvatarImage src={manager.avatar} />
                            <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                              {manager.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-xs font-bold text-foreground block">{manager.name}</span>
                            <span className="text-[10px] text-primary block truncate max-w-[140px]">
                              {manager.jobTitle}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleOpenAssignModal(manager)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          title={isRtl ? "تغییر یا انتصاب مدیر" : "Change Manager"}
                        >
                          <ArrowUpDown className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs">
                        <span>{isRtl ? "بدون انتصاب مدیر فعال" : "No active manager"}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setTargetDept(dept.nameFa);
                            handleOpenAssignModal();
                          }}
                          className="text-[10px] h-6 rounded-lg gap-1"
                        >
                          <UserPlus className="size-3" />
                          <span>{isRtl ? "انتصاب مدیر" : "Assign"}</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Supervisors Section */}
                  {supervisors.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        {isRtl ? `سرپرستان واحدها (${supervisors.length} نفر):` : `Supervisors (${supervisors.length}):`}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {supervisors.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => handleOpenAssignModal(s)}
                            className="px-2 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-medium flex items-center gap-1 cursor-pointer hover:bg-emerald-500/15 transition-colors"
                          >
                            <span>{s.name}</span>
                            <span className="opacity-60 text-[9px]">({s.jobTitle?.split("سرپرست")[1]?.trim() || s.jobTitle})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{staffCount > 0 ? `${staffCount} نفر کارشناس و اپراتور` : "کادر مدیریتی"}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      setViewMode("list");
                    }}
                    className="text-primary hover:text-primary/90 text-xs gap-1 font-semibold"
                  >
                    <span>{isRtl ? "مشاهده اعضا" : "View Team"}</span>
                    <ArrowRight className="size-3 rtl:rotate-180" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 6. List View (Table of Hierarchy) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === "list" && (
        <div className="p-4 rounded-3xl bg-slate-100/90 dark:bg-slate-800/40 border border-border/40 shadow-xs overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3 text-start">{isRtl ? "نام پرسنل" : "Personnel Name"}</th>
                <th className="py-2.5 px-3 text-start">{isRtl ? "دپارتمان سازمانی" : "Department"}</th>
                <th className="py-2.5 px-3 text-start">{isRtl ? "سمت / نقش شغلی" : "Role / Position"}</th>
                <th className="py-2.5 px-3 text-start">{isRtl ? "مدیر مستقیم (Direct Manager)" : "Direct Manager"}</th>
                <th className="py-2.5 px-3 text-start">{isRtl ? "تعداد زیرمجموعه" : "Subordinates"}</th>
                <th className="py-2.5 px-3 text-end">{isRtl ? "عملیات" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredUsers.slice(0, 50).map((u) => {
                const roleDef = resolveOrganizationRole(u.jobTitle, u.department);
                const isManager =
                  roleDef.isManagerial ||
                  u.jobTitle?.includes("مدیر") ||
                  u.jobTitle?.includes("سرپرست");

                return (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7 rounded-xl border border-border/60 shrink-0">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {u.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-bold text-foreground block">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono fa-num">
                            {u.employeeId || u.personnelCode || "---"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-muted-foreground font-medium">
                      {u.department || "مهندسی"}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{u.jobTitle || "کارشناس"}</span>
                        {isManager && (
                          <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">
                            {isRtl ? "مدیریتی" : "Manager"}
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <UserCheck className="size-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{u.manager || u.directManager || "مدیرعامل"}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono fa-num text-muted-foreground">
                      {u.subordinates && u.subordinates.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                          {u.subordinates.length} {isRtl ? "نفر" : "users"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenAssignModal(u)}
                        className="rounded-lg text-[11px] gap-1 cursor-pointer"
                      >
                        <Sparkles className="size-3 text-amber-500" />
                        <span>{isRtl ? "تغییر سمت" : "Reassign"}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length > 50 && (
            <p className="text-[11px] text-muted-foreground text-center pt-3 border-t border-border/30">
              {isRtl
                ? `نمایش ۵۰ مورد از ${filteredUsers.length} نفر پرسنل منطبق با فیلترها`
                : `Showing 50 of ${filteredUsers.length} matching personnel`}
            </p>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 7. Interactive Role Assignment & Auto-Cascade Modal */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isAssignModalOpen} onOpenChange={(open) => !open && setIsAssignModalOpen(false)}>
        <DialogContent className="max-w-xl p-0 rounded-3xl border border-border/60 bg-background shadow-2xl overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Sparkles className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isRtl ? "انتصاب جایگاه و سمت سازمانی" : "Assign Organizational Position"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isRtl
                    ? "تغییر دپارتمان، عنوان شغلی و به‌روزرسانی خودکار و آبشاری مدیران مستقیم پرسنل"
                    : "Update department, role title, and automatically cascade direct manager updates"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* 1. User Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{isRtl ? "پرسنل مورد نظر" : "Selected Employee"}</span>
                <span className="text-rose-500 text-[11px]">*</span>
              </Label>
              <Combobox
                options={users.map((u) => ({
                  value: u.id,
                  label: `${u.name} (${u.employeeId || "ESP"}) - ${u.jobTitle || "کارشناس"}`,
                  hint: u.department,
                }))}
                value={assignUser?.id || ""}
                onChange={(val) => {
                  const found = users.find((u) => u.id === val);
                  if (found) {
                    setAssignUser(found);
                    setTargetDept(found.department || "مهندسی و طراحی");
                    setTargetRole(found.jobTitle || "کارشناس مهندسی");
                    setCustomManagerName(found.manager || "");
                  }
                }}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-10 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>

            {/* Current Dossier Preview */}
            {assignUser && (
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 rounded-xl border border-border/60">
                    <AvatarImage src={assignUser.avatar} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {assignUser.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{assignUser.name}</span>
                    <span className="text-[11px] text-muted-foreground block">
                      {assignUser.department} • {assignUser.jobTitle}
                    </span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[10px] text-muted-foreground block">{isRtl ? "مدیر مستقیم فعلی:" : "Current Manager:"}</span>
                  <span className="text-xs font-bold text-primary block">{assignUser.manager || "مدیرعامل"}</span>
                </div>
              </div>
            )}

            {/* 2. Target Department */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{isRtl ? "دپارتمان سازمانی جدید" : "New Department"}</span>
                <span className="text-rose-500 text-[11px]">*</span>
              </Label>
              <Combobox
                options={getOrganizationDepartmentOptions(isRtl)}
                value={targetDept}
                onChange={(val) => {
                  setTargetDept(val);
                  const availableRoles = getOrganizationRoleOptions(val, isRtl);
                  if (availableRoles.length > 0 && !availableRoles.some((r) => r.value === targetRole)) {
                    setTargetRole(availableRoles[0].value);
                  }
                }}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-10 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>

            {/* 3. Target Role / Job Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{isRtl ? "سمت سازمانی / نقش شغلی" : "Role / Job Title"}</span>
                <span className="text-rose-500 text-[11px]">*</span>
              </Label>
              <Combobox
                options={getOrganizationRoleOptions(targetDept, isRtl)}
                value={targetRole}
                onChange={(val) => setTargetRole(val)}
                allowClear={false}
                size="sm"
                triggerClassName="w-full justify-between h-10 rounded-xl bg-background border-border/60 text-xs"
              />
            </div>

            {/* 4. Automated Cascading Manager Alert & Controls */}
            {isTargetManagerial ? (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                      {isRtl ? "تشخیص جایگاه مدیریتی و آبشاری (Managerial Role)" : "Managerial Role Detected"}
                    </span>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {isRtl
                        ? `با انتصاب این کاربر به عنوان مدیر/سرپرست، مدیر مستقیم کلیه پرسنل واحد «${targetDept}» (${affectedSubordinates.length} نفر) به طور خودکار به «${assignUser?.name}» به‌روزرسانی خواهد شد.`
                        : `Assigning this managerial role will automatically update the direct manager of all ${affectedSubordinates.length} team members in "${targetDept}" to "${assignUser?.name}".`}
                    </p>
                  </div>
                </div>

                {affectedSubordinates.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-indigo-500/20">
                    <span className="text-[10px] font-semibold text-muted-foreground block">
                      {isRtl ? "پیش‌نمایش پرسنلی که مدیر مستقیمشان تغییر می‌کند:" : "Personnel whose direct manager will update:"}
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {affectedSubordinates.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-lg bg-background/80 border border-border/50 text-[10px] text-foreground font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="autoCascade"
                    checked={autoCascade}
                    onCheckedChange={(checked) => setAutoCascade(Boolean(checked))}
                  />
                  <Label htmlFor="autoCascade" className="text-xs font-semibold text-foreground cursor-pointer">
                    {isRtl
                      ? "به‌روزرسانی خودکار مدیر مستقیم برای تمامی اعضای این دپارتمان"
                      : "Automatically cascade manager update to all team members"}
                  </Label>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-sky-900 dark:text-sky-200">
                    <UserCheck className="size-4 text-sky-600 dark:text-sky-400" />
                    <span>{isRtl ? "مدیر مستقیم پیشنهادی (بر اساس دپارتمان):" : "Suggested Direct Manager:"}</span>
                  </span>
                  <span className="font-bold text-sky-700 dark:text-sky-300">{suggestedManager}</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    {isRtl ? "مدیر مستقیم (در صورت نیاز به تغییر):" : "Direct Manager (Optional custom):"}
                  </Label>
                  <Input
                    value={customManagerName}
                    onChange={(e) => setCustomManagerName(e.target.value)}
                    placeholder={suggestedManager}
                    className="h-9 bg-background border-border/60 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border/40 bg-muted/10 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAssignModalOpen(false)}
              className="rounded-xl text-xs"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || !assignUser}
              onClick={handleConfirmAssignment}
              className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              <span>{isSubmitting ? (isRtl ? "در حال اعمال..." : "Saving...") : (isRtl ? "تأیید و اعمال انتصاب" : "Confirm Assignment")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: Node Card in Tree Hierarchy
// ─────────────────────────────────────────────────────────────────────────────
interface OrgPersonCardProps {
  user: User;
  onAssignRole: () => void;
  isRtl: boolean;
  tierColor?: string;
  hasSubordinates?: boolean;
}

function OrgPersonCard({
  user,
  onAssignRole,
  isRtl,
  tierColor = "border-border/60 bg-background",
  hasSubordinates = false,
}: OrgPersonCardProps) {
  const isOnline = user.status === "online" || Boolean(user.isOnline);
  const isInactive = user.accountStatus === "inactive" || user.employmentStatus === "قطع همکاری";

  return (
    <div
      className={cn(
        "p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 w-full sm:w-[280px] bg-background/90 dark:bg-slate-800/60 shadow-2xs",
        tierColor
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-11 rounded-2xl border-2 border-border/80 shadow-inner">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {user.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-background",
                isInactive ? "bg-rose-500" : isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              )}
            />
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground block truncate max-w-[150px]">
              {user.name}
            </span>
            <span className="text-[11px] font-semibold text-primary block truncate max-w-[150px]">
              {user.jobTitle || (isRtl ? "کارشناس" : "Specialist")}
            </span>
            <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
              {user.department || (isRtl ? "مهندسی" : "Engineering")}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onAssignRole}
          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          title={isRtl ? "انتصاب یا تغییر سمت" : "Assign Role"}
        >
          <ArrowUpDown className="size-3.5" />
        </Button>
      </div>

      {/* Card Footer: Subordinates count & Manager tag */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="truncate max-w-[130px]">
          {isRtl ? "مدیر:" : "Mgr:"} {user.manager || "مدیرعامل"}
        </span>

        {user.subordinates && user.subordinates.length > 0 ? (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/25 fa-num">
            {user.subordinates.length} {isRtl ? "زیرمجموعه" : "Reports"}
          </span>
        ) : (
          <span className="text-[9px] opacity-60 font-mono fa-num">
            {user.employeeId || "ESP"}
          </span>
        )}
      </div>
    </div>
  );
}
