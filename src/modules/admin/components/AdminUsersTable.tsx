import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types/admin.types";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, X, Eye, EyeOff, LayoutDashboard, 
  TableProperties, Mail, Phone, 
  FolderKanban, Award, Filter,
  ArrowUp, ArrowDown, ArrowUpDown, Check, RotateCcw,
  AlertCircle, KeyRound, Edit2, ShieldCheck, UserCheck,
  Building, GraduationCap, Calendar, Users, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NAVIGATION } from "@/config/navigation";

interface AdminUsersTableProps {
  users: User[];
  setUsers: (u: User[]) => void;
  selectedUser: User | null;
  setSelectedUser: (u: User) => void;
  setActiveTab: (tab: any) => void;
}

interface ColumnFilterState {
  // Column 1: User
  userRoles: string[];
  userNameQuery: string;

  // Column 2: Department
  departments: string[];

  // Column 3: Contact
  hasEmailOnly: boolean;
  hasPhoneOnly: boolean;

  // Column 4: Projects
  projectRanges: string[];

  // Column 6: Tenure (Days)
  tenureRanges: string[];

  // Column 7: Salary
  salaryRanges: string[];

  // Column 8: Working Format Focus
  workingFormats: string[];

  // Column 9: Status
  statuses: string[];
}

const initialFilters: ColumnFilterState = {
  userRoles: [],
  userNameQuery: "",
  departments: [],
  hasEmailOnly: false,
  hasPhoneOnly: false,
  projectRanges: [],
  tenureRanges: [],
  salaryRanges: [],
  workingFormats: [],
  statuses: []
};

export function AdminUsersTable({
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  setActiveTab
}: AdminUsersTableProps) {
  const t = useTranslations("Admin");
  const tMenu = useTranslations("Menu");
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Global search input
  const [globalSearch, setGlobalSearch] = useState("");

  // Column-specific filters
  const [colFilters, setColFilters] = useState<ColumnFilterState>(initialFilters);

  // Sorting
  const [sortState, setSortState] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: "id",
    direction: "asc"
  });

  // Salary visibility toggle
  const [showSalaries, setShowSalaries] = useState(false);

  // Active accordion per user row
  const [activeAccordion, setActiveAccordion] = useState<{
    userId: string;
    type: 'view' | 'password' | 'edit' | 'access';
  } | null>(null);

  // State for Password Change accordion
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for Quick Edit accordion
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  // Extract unique departments with counts
  const departmentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => {
      const dep = u.department || 'engineering';
      map[dep] = (map[dep] || 0) + 1;
    });
    return map;
  }, [users]);

  const uniqueDepartments = useMemo(() => Object.keys(departmentCounts), [departmentCounts]);

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const handleSort = (field: string, forceDirection?: 'asc' | 'desc') => {
    setSortState(prev => {
      if (prev.field === field) {
        const nextDir = forceDirection || (prev.direction === 'asc' ? 'desc' : 'asc');
        return { field, direction: nextDir };
      }
      return { field, direction: forceDirection || 'asc' };
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (colFilters.userRoles.length > 0 || colFilters.userNameQuery.trim().length > 0) count++;
    if (colFilters.departments.length > 0) count++;
    if (colFilters.hasEmailOnly || colFilters.hasPhoneOnly) count++;
    if (colFilters.projectRanges.length > 0) count++;
    if (colFilters.tenureRanges.length > 0) count++;
    if (colFilters.salaryRanges.length > 0) count++;
    if (colFilters.workingFormats.length > 0) count++;
    if (colFilters.statuses.length > 0) count++;
    return count;
  }, [colFilters]);

  const clearAllFilters = () => {
    setColFilters(initialFilters);
    setGlobalSearch("");
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 0. Global Search
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchName = user.name?.toLowerCase().includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        const matchId = user.id?.toLowerCase().includes(q);
        const matchTitle = user.jobTitle?.toLowerCase().includes(q);
        const matchDept = user.department?.toLowerCase().includes(q);
        const matchPhone = user.phone?.includes(q);
        if (!matchName && !matchEmail && !matchId && !matchTitle && !matchDept && !matchPhone) {
          return false;
        }
      }

      // 1. Column 1: User Query & Roles
      if (colFilters.userNameQuery.trim()) {
        const q = colFilters.userNameQuery.toLowerCase().trim();
        if (!user.name?.toLowerCase().includes(q) && !user.id?.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (colFilters.userRoles.length > 0) {
        if (!colFilters.userRoles.includes(user.role)) return false;
      }

      // 2. Column 2: Departments
      if (colFilters.departments.length > 0) {
        const dep = user.department || 'engineering';
        if (!colFilters.departments.includes(dep)) return false;
      }

      // 3. Column 3: Contact Channels
      if (colFilters.hasEmailOnly && !user.email) return false;
      if (colFilters.hasPhoneOnly && !user.phone) return false;

      // 4. Column 4: Projects Range
      if (colFilters.projectRanges.length > 0) {
        const projects = user.doneProjects || 0;
        const matchesRange = colFilters.projectRanges.some(r => {
          if (r === 'ge10') return projects >= 10;
          if (r === '5to10') return projects >= 5 && projects < 10;
          if (r === 'lt5') return projects < 5;
          return false;
        });
        if (!matchesRange) return false;
      }

      // 6. Column 6: Tenure Range
      if (colFilters.tenureRanges.length > 0) {
        const days = user.daysInCompany || 0;
        const matchesTenure = colFilters.tenureRanges.some(r => {
          if (r === 'ge300') return days >= 300;
          if (r === '100to300') return days >= 100 && days < 300;
          if (r === 'lt100') return days < 100;
          return false;
        });
        if (!matchesTenure) return false;
      }

      // 7. Column 7: Salary Range
      if (colFilters.salaryRanges.length > 0) {
        const sal = user.salary || 10000;
        const matchesSalary = colFilters.salaryRanges.some(r => {
          if (r === 'ge15k') return sal >= 15000;
          if (r === '10to15k') return sal >= 10000 && sal < 15000;
          if (r === 'lt10k') return sal < 10000;
          return false;
        });
        if (!matchesSalary) return false;
      }

      // 8. Column 8: Working Format Focus
      if (colFilters.workingFormats.length > 0) {
        const wf = user.workingFormat || { office: 25, factory: 25, mission: 25, leave: 25 };
        const primaryFocus = Object.entries(wf).sort((a, b) => b[1] - a[1])[0][0];
        if (!colFilters.workingFormats.includes(primaryFocus)) return false;
      }

      // 9. Column 9: Status
      if (colFilters.statuses.length > 0) {
        if (!colFilters.statuses.includes(user.status)) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortState.field as keyof User];
      let valB: any = b[sortState.field as keyof User];

      if (sortState.field === 'id') {
        valA = parseInt(a.id) || 0;
        valB = parseInt(b.id) || 0;
      } else if (sortState.field === 'primaryFormat') {
        const wfA = a.workingFormat || { office: 0, factory: 0, mission: 0, leave: 0 };
        const wfB = b.workingFormat || { office: 0, factory: 0, mission: 0, leave: 0 };
        valA = Math.max(...Object.values(wfA));
        valB = Math.max(...Object.values(wfB));
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortState.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, globalSearch, colFilters, sortState]);

  const handleSelectAndGoHome = (user: User) => {
    setSelectedUser(user);
    setActiveTab('home');
  };

  const handleSelectAndGoConfig = (user: User) => {
    setSelectedUser(user);
    setActiveTab('add');
  };

  // Accordion Toggle
  const toggleAccordion = (userId: string, type: 'view' | 'password' | 'edit' | 'access') => {
    if (activeAccordion?.userId === userId && activeAccordion?.type === type) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion({ userId, type });
      setNewPassword("");
      setConfirmPassword("");
      if (type === 'edit') {
        const u = users.find(x => x.id === userId);
        if (u) {
          setEditFormData({
            name: u.name,
            email: u.email,
            phone: u.phone || "",
            department: u.department || "engineering",
            role: u.role || "user",
            jobTitle: u.jobTitle || ""
          });
        }
      }
    }
  };

  // Toggle user module access directly from table accordion
  const handleToggleUserAccess = (userId: string, moduleId: string, checked: boolean) => {
    const availableModules = NAVIGATION.filter(n => n.id !== "main" && n.id !== "dashboard");
    const updatedUsers = users.map(u => {
      if (u.id !== userId) return u;
      const updatedUser = { ...u };
      const currentList = updatedUser.modulesAccess ? [...updatedUser.modulesAccess] : [];

      const setItemAccess = (id: string, hasAccess: boolean) => {
        const idx = currentList.findIndex(m => m.moduleId === id);
        if (idx !== -1) {
          currentList[idx] = { ...currentList[idx], hasAccess };
        } else {
          currentList.push({ moduleId: id, hasAccess, accessLevel: 'read', usagePercentage: 0, hoursSpent: '00:00:00' });
        }
      };

      const parent = availableModules.find(m => m.id === moduleId);
      if (parent) {
        setItemAccess(moduleId, checked);
        parent.items?.forEach((item: any) => {
          setItemAccess(item.href, checked);
        });
      } else {
        setItemAccess(moduleId, checked);
        const parentGroup = availableModules.find(m => m.items?.some((i: any) => i.href === moduleId));
        if (parentGroup) {
          if (checked) {
            setItemAccess(parentGroup.id, true);
          } else {
            const anyItemChecked = parentGroup.items?.some((item: any) => {
              const ex = currentList.find(m => m.moduleId === item.href);
              return ex ? ex.hasAccess : false;
            });
            if (!anyItemChecked) {
              setItemAccess(parentGroup.id, false);
            }
          }
        }
      }

      updatedUser.modulesAccess = currentList;
      if (selectedUser?.id === userId) {
        setSelectedUser(updatedUser);
      }
      return updatedUser;
    });
    setUsers(updatedUsers);
    toast.success(t("accessUpdated"));
  };

  // Save Changed Password
  const handleSavePassword = (userId: string) => {
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }
    toast.success(t("passwordChangedSuccess"));
    setActiveAccordion(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  // Save Quick Edited Info
  const handleSaveEdit = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...editFormData };
        if (selectedUser?.id === userId) {
          setSelectedUser(updated);
        }
        return updated;
      }
      return u;
    });
    setUsers(updatedUsers);
    toast.success(t("userInfoUpdatedSuccess"));
    setActiveAccordion(null);
  };

  /* ── Header Cell Component with Excel Filter Popover ── */
  const renderExcelHeader = ({
    title,
    field,
    isFiltered,
    onClear,
    children,
    align = "center"
  }: {
    title: string;
    field: string;
    isFiltered: boolean;
    onClear: () => void;
    children: React.ReactNode;
    align?: "start" | "center";
  }) => {
    const isSorted = sortState.field === field;
    const sortDir = sortState.direction;

    return (
      <th className={cn(
        "py-3.5 px-3 text-xs font-bold select-none group text-slate-800 dark:text-slate-100 first:rounded-ts-2xl first:rounded-bs-none last:rounded-te-2xl last:rounded-be-none rounded-b-none",
        align === "start" ? "text-start" : "text-center",
        isFiltered && "bg-primary/10 text-primary"
      )}>
        <div className={cn(
          "inline-flex items-center gap-1.5",
          align === "start" ? "justify-start" : "justify-center"
        )}>
          {/* Column Title + Quick Sort Toggle */}
          <button
            type="button"
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer outline-none"
            title={`${title} - ${t("sortAsc")} / ${t("sortDesc")}`}
          >
            <span>{title}</span>
            {isSorted ? (
              sortDir === 'asc' ? (
                <ArrowUp className="size-3 text-primary stroke-[2.5]" />
              ) : (
                <ArrowDown className="size-3 text-primary stroke-[2.5]" />
              )
            ) : (
              <ArrowUpDown className="size-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
          </button>

          {/* Excel Filter Funnel Button with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "size-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer outline-none",
                  isFiltered 
                    ? "bg-primary text-primary-foreground shadow-2xs" 
                    : "text-muted-foreground/50 hover:text-foreground hover:bg-background/80"
                )}
                title={t("filterTooltip")}
              >
                <Filter className="size-3" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align={align === 'start' ? 'start' : 'center'}
              sideOffset={6}
              dir="rtl"
              className="w-64 p-3 bg-popover border border-border/60 shadow-xl rounded-2xl text-xs flex flex-col gap-2.5 rtl:text-right"
            >
              {/* Header Title & Sorting options */}
              <div className="flex flex-col gap-1 pb-2 border-b border-border/40">
                <span className="font-bold text-foreground text-[11px] text-muted-foreground">
                  {title}
                </span>

                <div className="flex flex-col gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => handleSort(field, 'asc')}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer",
                      isSorted && sortDir === 'asc' && "text-primary font-bold bg-primary/10"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <ArrowUp className="size-3.5" />
                      {t("sortAsc")}
                    </span>
                    {isSorted && sortDir === 'asc' && <Check className="size-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSort(field, 'desc')}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer",
                      isSorted && sortDir === 'desc' && "text-primary font-bold bg-primary/10"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <ArrowDown className="size-3.5" />
                      {t("sortDesc")}
                    </span>
                    {isSorted && sortDir === 'desc' && <Check className="size-3.5" />}
                  </button>
                </div>
              </div>

              {/* Custom Filter Body */}
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto custom-scrollbar pe-1">
                {children}
              </div>

              {/* Popover Footer: Clear column filter */}
              {isFiltered && (
                <div className="pt-2 border-t border-border/40 flex justify-end">
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-[11px] font-semibold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>{t("clearColumnFilter")}</span>
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </th>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-100/80 dark:bg-slate-900/40 border border-border/40 rounded-[2rem] p-4 sm:p-6 shadow-xs overflow-hidden">
      
      {/* ── Top Header & Global Search Bar (Unified in 1 Streamlined Row) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-border/40 shrink-0">
        
        {/* Left Side: Title + Total Count + Search Bar directly beside it */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <TableProperties className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">
                {t("usersTable")}
              </h2>
              <p className="text-[11px] text-muted-foreground fa-num">
                {t("totalUsersCount", { count: filteredUsers.length })}
              </p>
            </div>
          </div>

          {/* Search Bar placed directly in front of the Title */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm min-w-[180px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              name="admin_users_global_search"
              id="admin_users_global_search"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t("searchUsersPlaceholder")}
              className="h-9 text-xs ps-8.5 pe-8 rounded-xl bg-background/90 dark:bg-card/90 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/40 shadow-none transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Filters Clear & Salary Masking */}
        <div className="flex items-center gap-2 shrink-0">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 px-3 rounded-xl border-destructive/30 text-destructive text-xs font-semibold gap-1.5 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>{t("clearAllFilters")}</span>
              <span className="size-4.5 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center fa-num font-bold ms-1">
                {activeFiltersCount}
              </span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSalaries(!showSalaries)}
            className="h-9 px-3 rounded-xl border-border/50 text-xs font-semibold gap-2 bg-background/80 hover:bg-background transition-colors cursor-pointer"
          >
            {showSalaries ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            <span>{t("monthlySalary")}</span>
          </Button>
        </div>
      </div>

      {/* ── Table Container with Perfect Rounded Fillet Corners & Stacking Isolation ── */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-border/50 rounded-2xl bg-card shadow-inner mt-3.5 fa-num isolate">
        <table className="w-full text-sm text-start border-separate border-spacing-0 min-w-[960px]">
          
          {/* Distinct, High-Contrast Table Header */}
          <thead className="bg-slate-200/90 dark:bg-slate-800/95 sticky top-0 z-10 backdrop-blur-md border-b-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs rounded-t-2xl rounded-b-none">
            <tr>
              {/* ── Column 1: User ── */}
              {renderExcelHeader({
                title: t("userCol"),
                field: "name",
                align: "start",
                isFiltered: colFilters.userRoles.length > 0 || colFilters.userNameQuery.trim().length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, userRoles: [], userNameQuery: "" })),
                children: (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Search className="absolute start-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <Input
                        type="search"
                        name="admin_users_col_name_filter"
                        id="admin_users_col_name_filter"
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={colFilters.userNameQuery}
                        onChange={(e) => setColFilters(prev => ({ ...prev, userNameQuery: e.target.value }))}
                        placeholder={t("searchInColumn")}
                        className="h-7 text-[11px] ps-6 pe-2 rounded-md bg-muted/50 border-border/40"
                      />
                    </div>

                    <span className="font-semibold text-foreground/80 text-[10px] mt-1">{t("role")}</span>
                    {(['admin', 'user'] as const).map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.userRoles.includes(role)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            userRoles: toggleArrayItem(prev.userRoles, role)
                          }))}
                        />
                        <span>{role === 'admin' ? t("adminRole") : t("userRole")}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 2: Department & Title ── */}
              {renderExcelHeader({
                title: t("roleAndDeptCol"),
                field: "department",
                align: "start",
                isFiltered: colFilters.departments.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, departments: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("department")}</span>
                    {uniqueDepartments.map(dep => {
                      let depName = dep;
                      try {
                        depName = t(`departments.${dep}`);
                      } catch {
                        depName = dep;
                      }
                      return (
                        <label key={dep} className="flex items-center justify-between gap-2 cursor-pointer py-0.5 hover:text-foreground">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={colFilters.departments.includes(dep)}
                              onCheckedChange={() => setColFilters(prev => ({
                                ...prev,
                                departments: toggleArrayItem(prev.departments, dep)
                              }))}
                            />
                            <span>{depName}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {departmentCounts[dep]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )
              })}

              {/* ── Column 3: Contact Channels ── */}
              {renderExcelHeader({
                title: t("contactCol"),
                field: "email",
                align: "start",
                isFiltered: colFilters.hasEmailOnly || colFilters.hasPhoneOnly,
                onClear: () => setColFilters(prev => ({ ...prev, hasEmailOnly: false, hasPhoneOnly: false })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    <label className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                      <Checkbox
                        checked={colFilters.hasEmailOnly}
                        onCheckedChange={(c) => setColFilters(prev => ({ ...prev, hasEmailOnly: Boolean(c) }))}
                      />
                      <span>{t("hasEmail")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                      <Checkbox
                        checked={colFilters.hasPhoneOnly}
                        onCheckedChange={(c) => setColFilters(prev => ({ ...prev, hasPhoneOnly: Boolean(c) }))}
                      />
                      <span>{t("hasPhone")}</span>
                    </label>
                  </div>
                )
              })}

              {/* ── Column 4: Projects ── */}
              {renderExcelHeader({
                title: t("projectsCol"),
                field: "doneProjects",
                isFiltered: colFilters.projectRanges.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, projectRanges: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'ge10', label: t("projectsGe10") },
                      { key: '5to10', label: t("projects5to10") },
                      { key: 'lt5', label: t("projectsLt5") }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.projectRanges.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            projectRanges: toggleArrayItem(prev.projectRanges, item.key)
                          }))}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 5: Experience ── */}
              {renderExcelHeader({
                title: t("experienceCol"),
                field: "score",
                isFiltered: false,
                onClear: () => {},
                children: <span className="text-muted-foreground text-[11px]">{t("score")}</span>
              })}

              {/* ── Column 6: Tenure (Days in company) ── */}
              {renderExcelHeader({
                title: t("tenureCol"),
                field: "daysInCompany",
                isFiltered: colFilters.tenureRanges.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, tenureRanges: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'ge300', label: t("tenureGe300") },
                      { key: '100to300', label: t("tenure100to300") },
                      { key: 'lt100', label: t("tenureLt100") }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.tenureRanges.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            tenureRanges: toggleArrayItem(prev.tenureRanges, item.key)
                          }))}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 7: Salary ── */}
              {renderExcelHeader({
                title: t("salaryCol"),
                field: "salary",
                isFiltered: colFilters.salaryRanges.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, salaryRanges: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'ge15k', label: t("salaryGe15k") },
                      { key: '10to15k', label: t("salary10to15k") },
                      { key: 'lt10k', label: t("salaryLt10k") }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.salaryRanges.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            salaryRanges: toggleArrayItem(prev.salaryRanges, item.key)
                          }))}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 8: Working Format ── */}
              {renderExcelHeader({
                title: t("workingFormatCol"),
                field: "primaryFormat",
                isFiltered: colFilters.workingFormats.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, workingFormats: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterPrimaryFormat")}</span>
                    {[
                      { key: 'office', label: t("office") },
                      { key: 'factory', label: t("factory") },
                      { key: 'mission', label: t("mission") },
                      { key: 'leave', label: t("leave") }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.workingFormats.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            workingFormats: toggleArrayItem(prev.workingFormats, item.key)
                          }))}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {/* ── Column 9: Status ── */}
              {renderExcelHeader({
                title: t("statusCol"),
                field: "status",
                isFiltered: colFilters.statuses.length > 0,
                onClear: () => setColFilters(prev => ({ ...prev, statuses: [] })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    {[
                      { key: 'online', label: t("online"), dot: "bg-emerald-500" },
                      { key: 'offline', label: t("offline"), dot: "bg-slate-400" }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.statuses.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            statuses: toggleArrayItem(prev.statuses, item.key)
                          }))}
                        />
                        <div className="flex items-center gap-1.5">
                          <span className={cn("size-2 rounded-full", item.dot)} />
                          <span>{item.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/20">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-muted-foreground text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="size-6 text-muted-foreground/60" />
                    <span>{t("noUsersFound")}</span>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="mt-1 text-xs text-primary hover:underline cursor-pointer"
                      >
                        {t("clearAllFilters")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                const wf = user.workingFormat || { office: 25, factory: 25, mission: 25, leave: 25 };
                const departmentKey = user.department || 'engineering';
                let departmentName = departmentKey;
                try {
                  departmentName = t(`departments.${departmentKey}`);
                } catch {
                  departmentName = departmentKey;
                }

                const isAccordionOpen = activeAccordion?.userId === user.id;

                // Determine unclipped location badge (color & localized label)
                const getLocationBadge = () => {
                  const loc = user.workLocation?.toLowerCase();
                  if (loc === 'factory') return { colorClass: 'bg-[#3b82f6]', label: t("factory") };
                  if (loc === 'mission') return { colorClass: 'bg-[#f59e0b]', label: t("mission") };
                  if (loc === 'leave') return { colorClass: 'bg-[#94a3b8]', label: t("leave") };
                  if (loc === 'remote') return { colorClass: 'bg-purple-500', label: t("workLocationRemote") };
                  if (loc === 'office') return { colorClass: 'bg-[#22c55e]', label: t("office") };

                  if (wf) {
                    const entries = Object.entries(wf) as [string, number][];
                    entries.sort((a, b) => b[1] - a[1]);
                    const dominant = entries[0]?.[0];
                    if (dominant === 'factory') return { colorClass: 'bg-[#3b82f6]', label: t("factory") };
                    if (dominant === 'mission') return { colorClass: 'bg-[#f59e0b]', label: t("mission") };
                    if (dominant === 'leave') return { colorClass: 'bg-[#94a3b8]', label: t("leave") };
                    if (dominant === 'office') return { colorClass: 'bg-[#22c55e]', label: t("office") };
                  }

                  if (user.status === 'offline') {
                    return { colorClass: 'bg-slate-400', label: t("offline") };
                  }

                  return { colorClass: 'bg-[#22c55e]', label: t("office") };
                };
                const locationBadge = getLocationBadge();

                return (
                  <React.Fragment key={user.id}>
                    
                    {/* ── 1. Main User Data Row with Subtle Soft Shadow ── */}
                    <tr
                      className={cn(
                        "transition-all duration-200 group relative z-[2]",
                        "[&>td]:border-b [&>td]:border-border/30",
                        "[&>td]:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_-1px_rgba(15,23,42,0.03)] dark:[&>td]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.35)]",
                        isSelected 
                          ? "bg-primary/[0.07] dark:bg-primary/15 [&>td]:shadow-[0_4px_12px_-2px_rgba(var(--primary),0.15)]" 
                          : "bg-card hover:bg-slate-50/80 dark:hover:bg-slate-800/40 hover:[&>td]:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.09)]"
                      )}
                    >
                      {/* Column 1: User */}
                      <td className="py-3 px-3 text-start">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar with unclipped location tag */}
                          <div className="relative size-9 shrink-0">
                            <div 
                              className="size-full rounded-full bg-primary/10 border border-border/40 flex items-center justify-center overflow-hidden select-none"
                              style={user.avatarColor ? { backgroundColor: `${user.avatarColor}20`, borderColor: `${user.avatarColor}40` } : undefined}
                            >
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                    const fb = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                    if (fb) fb.style.display = 'inline';
                                  }}
                                />
                              ) : null}
                              <span 
                                className="avatar-fallback text-xs font-bold text-primary uppercase"
                                style={{ display: user.avatar ? 'none' : 'inline', color: user.avatarColor }}
                              >
                                {user.name ? user.name.trim().charAt(0) : "U"}
                              </span>
                            </div>
                            {/* Unclipped colored location status tag */}
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-background z-10 pointer-events-none shadow-2xs transition-colors",
                                locationBadge.colorClass
                              )}
                              title={`${t("workLocationLabel")}: ${locationBadge.label}`}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-foreground truncate max-w-[130px]">
                                {user.name}
                              </span>
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                                #{user.id}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                              {user.role === 'admin' ? t("adminRole") : t("userRole")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Department & Title */}
                      <td className="py-3 px-3 text-start">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                            {departmentName}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                            {user.jobTitle || t("userRole")}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Contact */}
                      <td className="py-3 px-3 text-start">
                        <div className="flex flex-col gap-0.5 min-w-0 text-xs">
                          {user.email ? (
                            <a
                              href={`mailto:${user.email}`}
                              dir="ltr"
                              className="text-primary hover:underline truncate max-w-[160px] flex items-center gap-1 font-medium"
                            >
                              <Mail className="size-3 shrink-0 text-muted-foreground" />
                              <span className="truncate">{user.email}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                          {user.phone && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1" dir="ltr">
                              <Phone className="size-2.5 shrink-0" />
                              <span>{user.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Projects */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <FolderKanban className="size-3" />
                          <span>{user.doneProjects || 0}</span>
                        </span>
                      </td>

                      {/* Column 5: Experience */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          <Award className="size-3" />
                          <span>350</span>
                        </span>
                      </td>

                      {/* Column 6: Tenure */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-medium text-foreground">
                          {user.daysInCompany || 0} <span className="text-[10px] text-muted-foreground">{t("daysUnit")}</span>
                        </span>
                      </td>

                      {/* Column 7: Salary */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {showSalaries 
                            ? `$${(user.salary || 10000).toLocaleString()}` 
                            : "••••••••"}
                        </span>
                      </td>

                      {/* Column 8: Working Format */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1 w-26 mx-auto">
                          <div className="w-full h-2 rounded-full overflow-hidden flex bg-muted/60">
                            <div style={{ width: `${wf.office}%` }} className="bg-[#22c55e] h-full" title={`${t("office")}: ${wf.office}%`} />
                            <div style={{ width: `${wf.factory}%` }} className="bg-[#3b82f6] h-full" title={`${t("factory")}: ${wf.factory}%`} />
                            <div style={{ width: `${wf.mission}%` }} className="bg-[#f59e0b] h-full" title={`${t("mission")}: ${wf.mission}%`} />
                            <div style={{ width: `${wf.leave}%` }} className="bg-[#94a3b8] h-full" title={`${t("leave")}: ${wf.leave}%`} />
                          </div>
                          <div className="flex items-center justify-between w-full text-[9px] text-muted-foreground font-medium">
                            <span className="text-emerald-600 dark:text-emerald-400">{wf.office}%</span>
                            <span className="text-blue-600 dark:text-blue-400">{wf.factory}%</span>
                            <span className="text-amber-600 dark:text-amber-400">{wf.mission}%</span>
                            <span>{wf.leave}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 9: Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                          user.status === 'online'
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                        )}>
                          <span className={cn(
                            "size-1.5 rounded-full",
                            user.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          )} />
                          {user.status === 'online' ? t("online") : t("offline")}
                        </span>
                      </td>
                    </tr>

                    {/* ── 2. Paper Pull-out & Bottom-Right Folder Tab ── */}
                    <tr className="border-0">
                      <td colSpan={9} className="p-0 border-0">
                        <div 
                          className={cn(
                            "w-full flex flex-col items-end px-3 sm:px-4",
                            isAccordionOpen ? "pb-4" : "pb-2.5"
                          )} 
                          dir="ltr"
                        >
                          {/* ── A. Content Container on Top (کانتینر محتواشون بالا باشه) ── */}
                          <AnimatePresence initial={false}>
                            {isAccordionOpen && (
                              <motion.div
                                key={`acc-content-${user.id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ 
                                  height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                                  opacity: { duration: 0.22, ease: "easeOut" }
                                }}
                                className="w-[660px] max-w-full overflow-hidden"
                              >
                                <div 
                                  dir={isRtl ? "rtl" : "ltr"}
                                  className="bg-card border border-border/60 rounded-t-2xl rounded-bl-2xl rounded-br-none -mt-px p-4 sm:p-5 shadow-none"
                                >
                            
                            {/* ── Mode A: View Details ── */}
                            {activeAccordion.type === 'view' && (
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                  <div className="flex items-center gap-2">
                                    <Eye size={15} className="text-primary" />
                                    <h4 className="text-xs font-bold text-foreground">
                                      {t("applicantDetailsTitle")} - {user.name}
                                    </h4>
                                    <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                      #{user.id}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={() => setActiveAccordion(null)}
                                    className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                  <div className="flex flex-col p-2.5 rounded-xl bg-muted/30 border border-border/30">
                                    <span className="text-[10px] text-muted-foreground font-medium">{t("nationalIdLabel")}</span>
                                    <span className="font-bold text-foreground mt-0.5 fa-num">{user.nationalId || "0012345678"}</span>
                                  </div>
                                  <div className="flex flex-col p-2.5 rounded-xl bg-muted/30 border border-border/30">
                                    <span className="text-[10px] text-muted-foreground font-medium">{t("phoneLabel")}</span>
                                    <span className="font-bold text-foreground mt-0.5 fa-num" dir="ltr">{user.phone || "09120000000"}</span>
                                  </div>
                                  <div className="flex flex-col p-2.5 rounded-xl bg-muted/30 border border-border/30">
                                    <span className="text-[10px] text-muted-foreground font-medium">{t("education")}</span>
                                    <span className="font-bold text-foreground mt-0.5 truncate">{user.educationField || "مهندسی نرم افزار"}</span>
                                  </div>
                                  <div className="flex flex-col p-2.5 rounded-xl bg-muted/30 border border-border/30">
                                    <span className="text-[10px] text-muted-foreground font-medium">{t("maritalStatus")} / {t("children")}</span>
                                    <span className="font-bold text-foreground mt-0.5 fa-num">
                                      {user.maritalStatus === 'married' ? t("married") : t("single")} ({user.childrenCount ?? 2} {t("child")})
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSelectAndGoHome(user)}
                                    className="h-8 px-3 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer inline-flex items-center gap-1.5"
                                  >
                                    <LayoutDashboard size={13} />
                                    <span>{t("viewInDashboard")}</span>
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* ── Mode B: Change Password ── */}
                            {activeAccordion.type === 'password' && (
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSavePassword(user.id);
                                }}
                                autoComplete="off"
                                className="flex flex-col gap-3"
                              >
                                {/* Hidden dummy inputs to safely absorb browser password manager autofill heuristics */}
                                <input 
                                  type="text" 
                                  name="fake_username_prevention" 
                                  tabIndex={-1} 
                                  style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} 
                                  autoComplete="username" 
                                />
                                <input 
                                  type="password" 
                                  name="fake_password_prevention" 
                                  tabIndex={-1} 
                                  style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} 
                                  autoComplete="current-password" 
                                />

                                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                  <div className="flex items-center gap-2">
                                    <KeyRound size={15} className="text-amber-500" />
                                    <h4 className="text-xs font-bold text-foreground">
                                      {t("changePassword")} - {user.name}
                                    </h4>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setActiveAccordion(null)}
                                    className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex-1 min-w-[180px]">
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("newPassword")}
                                    </label>
                                    <PasswordInput
                                      id={`new_pwd_${user.id}`}
                                      name={`new_pwd_${user.id}`}
                                      autoComplete="new-password"
                                      data-lpignore="true"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      placeholder="••••••••"
                                      className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                      dir="ltr"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-[180px]">
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("confirmPassword")}
                                    </label>
                                    <PasswordInput
                                      id={`confirm_pwd_${user.id}`}
                                      name={`confirm_pwd_${user.id}`}
                                      autoComplete="new-password"
                                      data-lpignore="true"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      placeholder="••••••••"
                                      className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                      dir="ltr"
                                    />
                                  </div>

                                  <div className="flex items-center gap-2 pt-5">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      className="h-8.5 px-4 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                    >
                                      {t("save")}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setActiveAccordion(null)}
                                      className="h-8.5 px-3 rounded-xl text-xs text-muted-foreground cursor-pointer"
                                    >
                                      {t("cancel")}
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            )}

                            {/* ── Mode C: Quick Edit User Info ── */}
                            {activeAccordion.type === 'edit' && (
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                  <div className="flex items-center gap-2">
                                    <Edit2 size={15} className="text-blue-500" />
                                    <h4 className="text-xs font-bold text-foreground">
                                      {t("editUserInfo")} - {user.name}
                                    </h4>
                                  </div>
                                  <button 
                                    onClick={() => setActiveAccordion(null)}
                                    className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("name")}
                                    </label>
                                    <Input
                                      value={editFormData.name || ""}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                      className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("email")}
                                    </label>
                                    <Input
                                      value={editFormData.email || ""}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                      dir="ltr"
                                      className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("phoneLabel")}
                                    </label>
                                    <Input
                                      value={editFormData.phone || ""}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                                      dir="ltr"
                                      className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("department")}
                                    </label>
                                    <select
                                      value={editFormData.department || "engineering"}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                                      className="h-8.5 w-full text-xs bg-background border border-border/50 rounded-xl px-2.5 outline-none focus:ring-1 focus:ring-primary"
                                    >
                                      {uniqueDepartments.map(dep => (
                                        <option key={dep} value={dep}>
                                          {t(`departments.${dep}`) || dep}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("role")}
                                    </label>
                                    <select
                                      value={editFormData.role || "user"}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value as any }))}
                                      className="h-8.5 w-full text-xs bg-background border border-border/50 rounded-xl px-2.5 outline-none focus:ring-1 focus:ring-primary"
                                    >
                                      <option value="user">{t("userRole")}</option>
                                      <option value="admin">{t("adminRole")}</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                      {t("jobTitle")}
                                    </label>
                                    <Input
                                      value={editFormData.jobTitle || ""}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                      className="h-8.5 text-xs bg-background rounded-xl border-border/50"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveAccordion(null)}
                                    className="h-8.5 px-3 rounded-xl text-xs text-muted-foreground cursor-pointer"
                                  >
                                    {t("cancel")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(user.id)}
                                    className="h-8.5 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                                  >
                                    {t("save")}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* ── Mode D: Module Access (دسترسی ماژول‌ها) ── */}
                            {activeAccordion.type === 'access' && (
                              <div className="flex flex-col gap-3.5">
                                <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                                  <div className="flex items-center gap-2.5">
                                    <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                      <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                        <span>{t("moduleAccess")}</span>
                                        <span className="text-[11px] font-normal text-muted-foreground">({user.name})</span>
                                      </h4>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {t("changeUserAccess")}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                      {(user.modulesAccess?.filter(m => m.hasAccess).length || 0)} {t("activeStatus")}
                                    </span>

                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSelectAndGoConfig(user)}
                                      className="h-7.5 px-2.5 rounded-lg text-xs gap-1.5 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                      title={t("managePermissions")}
                                    >
                                      <ExternalLink size={12} />
                                      <span className="hidden sm:inline">{t("managePermissions")}</span>
                                    </Button>

                                    <button
                                      type="button"
                                      onClick={() => setActiveAccordion(null)}
                                      className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                                      title={t("cancel")}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                  {NAVIGATION.filter(n => n.id !== "main" && n.id !== "dashboard").map(group => {
                                    const groupAccess = user.modulesAccess?.find(m => m.moduleId === group.id);
                                    const hasGroupAccess = groupAccess?.hasAccess ?? false;

                                    let label = group.id;
                                    try {
                                      label = tMenu(`sections.${group.labelKey}` as any) || group.id;
                                    } catch {
                                      label = group.id;
                                    }

                                    return (
                                      <div
                                        key={group.id}
                                        className={cn(
                                          "flex flex-col justify-between p-3 rounded-xl border transition-all",
                                          hasGroupAccess
                                            ? "bg-emerald-500/[0.04] border-emerald-500/30 text-foreground"
                                            : "bg-muted/20 border-border/40 text-muted-foreground opacity-75"
                                        )}
                                      >
                                        <div className="flex items-start justify-between gap-2 mb-2.5">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className={cn(
                                              "size-2 rounded-full shrink-0",
                                              hasGroupAccess ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                            )} />
                                            <span className="text-xs font-semibold truncate" title={label}>
                                              {label}
                                            </span>
                                          </div>

                                          {group.items && group.items.length > 0 && (
                                            <span className="text-[10px] text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                                              {group.items.length} {t("subItems")}
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                          <span className={cn(
                                            "text-[10px] font-medium",
                                            hasGroupAccess ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                          )}>
                                            {hasGroupAccess ? t("activeStatus") : t("inactiveStatus")}
                                          </span>

                                          <Button
                                            type="button"
                                            size="sm"
                                            variant={hasGroupAccess ? "outline" : "default"}
                                            onClick={() => handleToggleUserAccess(user.id, group.id, !hasGroupAccess)}
                                            className={cn(
                                              "h-6 px-2 text-[10px] rounded-lg cursor-pointer transition-all",
                                              hasGroupAccess
                                                ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                            )}
                                          >
                                            {hasGroupAccess ? t("revokeAccess") : t("grantAccess")}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* ── B. Icon Tab (در پایین سمت راست کانتینر محتوا، بدون سایه) ── */}
                            <div 
                              dir={isRtl ? "rtl" : "ltr"}
                              className={cn(
                                "flex items-center justify-between px-3 py-1 transition-colors select-none shrink-0 -mt-px",
                                isAccordionOpen
                                  ? "bg-card border-x border-b border-border/60 rounded-b-xl shadow-none"
                                  : "bg-slate-100/95 dark:bg-slate-800/95 border-x border-b border-border/50 rounded-b-xl text-muted-foreground hover:bg-slate-200/80 dark:hover:bg-slate-700/80 shadow-none"
                              )}
                            >
                              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                {/* 1. View User Details (مشاهده مشخصات) */}
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(user.id, 'view')}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                    isAccordionOpen && activeAccordion?.type === 'view'
                                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                                      : "text-muted-foreground hover:text-foreground hover:bg-background/80 dark:hover:bg-card"
                                  )}
                                  title={t("viewDetailsBtn")}
                                >
                                  <Eye size={13} className="shrink-0" />
                                  <span className="hidden sm:inline">{t("viewDetailsBtn")}</span>
                                </button>

                                {/* 2. Change Password (تغییر رمز عبور) */}
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(user.id, 'password')}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                    isAccordionOpen && activeAccordion?.type === 'password'
                                      ? "bg-amber-500 text-white shadow-2xs font-semibold"
                                      : "text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-background/80 dark:hover:bg-card"
                                  )}
                                  title={t("changePassword")}
                                >
                                  <KeyRound size={13} className="shrink-0" />
                                  <span className="hidden sm:inline">{t("changePassword")}</span>
                                </button>

                                {/* 3. Edit User Info (ویرایش مشخصات) */}
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(user.id, 'edit')}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                    isAccordionOpen && activeAccordion?.type === 'edit'
                                      ? "bg-blue-600 text-white shadow-2xs font-semibold"
                                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-background/80 dark:hover:bg-card"
                                  )}
                                  title={t("editUserInfo")}
                                >
                                  <Edit2 size={13} className="shrink-0" />
                                  <span className="hidden sm:inline">{t("editUserInfo")}</span>
                                </button>

                                {/* 4. Module Access (دسترسی ماژول‌ها - کشویی) */}
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(user.id, 'access')}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                    isAccordionOpen && activeAccordion?.type === 'access'
                                      ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                                      : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-background/80 dark:hover:bg-card"
                                  )}
                                  title={t("moduleAccess")}
                                >
                                  <ShieldCheck size={13} className="shrink-0" />
                                  <span className="hidden sm:inline">{t("moduleAccess")}</span>
                                </button>

                                <div className="h-3.5 w-px bg-border/40 mx-0.5 shrink-0" />

                                {/* 5. Open in Dashboard (مشاهده در داشبورد - بدون اسم، آیکون آخر) */}
                                <button
                                  type="button"
                                  onClick={() => handleSelectAndGoHome(user)}
                                  className="size-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  title={t("viewInDashboard")}
                                  aria-label={t("viewInDashboard")}
                                >
                                  <LayoutDashboard size={14} className="shrink-0" />
                                </button>
                              </div>

                              {/* ── Fixed 28px slot for Close (X) so the tab width NEVER shifts when X appears ── */}
                              <div className="size-7 flex items-center justify-center shrink-0 ms-1">
                                {isAccordionOpen && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveAccordion(null)}
                                    className="size-6.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 dark:hover:bg-card transition-colors cursor-pointer"
                                    title={t("cancel")}
                                    aria-label={t("cancel")}
                                  >
                                    <X size={13} className="shrink-0" />
                                  </button>
                                )}
                              </div>
                            </div>

                        </div>
                      </td>
                    </tr>

                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
