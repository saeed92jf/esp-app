import React, { useState, useMemo } from "react";
import { User } from "../types/admin.types";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, X, Eye, EyeOff, LayoutDashboard, Settings2, 
  TableProperties, Mail, Phone, Building2, 
  FolderKanban, Award, Clock, DollarSign, Filter,
  ArrowUp, ArrowDown, ArrowUpDown, Check, RotateCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (colFilters.userRoles.length > 0) count++;
    if (colFilters.userNameQuery.trim().length > 0) count++;
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

  const handleSort = (field: string, direction?: 'asc' | 'desc') => {
    if (direction) {
      setSortState({ field, direction });
    } else {
      if (sortState.field === field) {
        setSortState({ field, direction: sortState.direction === 'asc' ? 'desc' : 'asc' });
      } else {
        setSortState({ field, direction: 'asc' });
      }
    }
  };

  // Helper to toggle item in array
  const toggleArrayItem = (list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. Global search
      const q = globalSearch.trim().toLowerCase();
      if (q) {
        const nameMatch = user.name?.toLowerCase().includes(q);
        const emailMatch = user.email?.toLowerCase().includes(q);
        const idMatch = user.id?.toLowerCase().includes(q);
        const jobMatch = user.jobTitle?.toLowerCase().includes(q);
        const phoneMatch = user.phone?.includes(q);
        const deptMatch = (user.department || '').toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !idMatch && !jobMatch && !phoneMatch && !deptMatch) {
          return false;
        }
      }

      // 2. Column 1: User name query
      if (colFilters.userNameQuery.trim()) {
        const uq = colFilters.userNameQuery.trim().toLowerCase();
        const nMatch = user.name?.toLowerCase().includes(uq);
        const iMatch = user.id?.toLowerCase().includes(uq);
        if (!nMatch && !iMatch) return false;
      }

      // Column 1: User role
      if (colFilters.userRoles.length > 0) {
        if (!colFilters.userRoles.includes(user.role)) return false;
      }

      // 3. Column 2: Department
      if (colFilters.departments.length > 0) {
        const userDep = user.department || 'engineering';
        if (!colFilters.departments.includes(userDep)) return false;
      }

      // 4. Column 3: Contact
      if (colFilters.hasEmailOnly && !user.email) return false;
      if (colFilters.hasPhoneOnly && !user.phone) return false;

      // 5. Column 4: Projects Range
      if (colFilters.projectRanges.length > 0) {
        const done = user.doneProjects || 0;
        const matchesRange = colFilters.projectRanges.some(r => {
          if (r === 'ge10') return done >= 10;
          if (r === '5to10') return done >= 5 && done < 10;
          if (r === 'lt5') return done < 5;
          return false;
        });
        if (!matchesRange) return false;
      }

      // 6. Column 6: Tenure (Days) Range
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
        "py-3 px-3 text-xs font-semibold select-none group",
        align === "start" ? "text-start" : "text-center"
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
    <div className="flex flex-col h-full min-h-0 bg-slate-100/70 dark:bg-slate-900/40 border border-border/40 rounded-[2rem] p-4 sm:p-6 shadow-xs overflow-hidden">
      {/* ── Top Header & Global Search Bar ── */}
      <div className="flex flex-col gap-3 pb-3 border-b border-border/40 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <TableProperties className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {t("usersTable")}
              </h2>
              <p className="text-xs text-muted-foreground fa-num">
                {t("totalUsersCount", { count: filteredUsers.length })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Filters Clear Button */}
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

            {/* Salary Masking Toggle */}
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

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={t("searchUsersPlaceholder")}
            className="h-9.5 ps-10 pe-9 bg-background/80 rounded-xl border-border/40 text-xs shadow-none focus-visible:ring-1"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => setGlobalSearch("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-border/40 rounded-2xl bg-background/90 dark:bg-card/70 mt-3.5 fa-num">
        <table className="w-full text-sm text-start border-collapse min-w-[1020px]">
          <thead className="bg-muted/70 dark:bg-muted/40 sticky top-0 z-10 backdrop-blur-md border-b border-border/40 text-muted-foreground">
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
                    {/* Search inside user name */}
                    <div className="relative">
                      <Search className="absolute start-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <Input
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
                      const count = departmentCounts[dep] || 0;
                      return (
                        <label key={dep} className="flex items-center justify-between gap-2 cursor-pointer py-1 hover:text-foreground">
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
                          <span className="text-[10px] text-muted-foreground font-mono">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                )
              })}

              {/* ── Column 3: Contact ── */}
              {renderExcelHeader({
                title: t("contactCol"),
                field: "email",
                align: "start",
                isFiltered: colFilters.hasEmailOnly || colFilters.hasPhoneOnly,
                onClear: () => setColFilters(prev => ({ ...prev, hasEmailOnly: false, hasPhoneOnly: false })),
                children: (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground/80 text-[10px]">{t("filterValues")}</span>
                    <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
                      <Checkbox
                        checked={colFilters.hasEmailOnly}
                        onCheckedChange={(checked) => setColFilters(prev => ({ ...prev, hasEmailOnly: !!checked }))}
                      />
                      <span>{t("hasEmail")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
                      <Checkbox
                        checked={colFilters.hasPhoneOnly}
                        onCheckedChange={(checked) => setColFilters(prev => ({ ...prev, hasPhoneOnly: !!checked }))}
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
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
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
                children: (
                  <div className="flex flex-col gap-1 text-muted-foreground text-center py-2">
                    <span>{t("sortAsc")} / {t("sortDesc")}</span>
                  </div>
                )
              })}

              {/* ── Column 6: Tenure (Days) ── */}
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
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
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
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
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
                      { key: 'office', label: t("office"), color: "bg-[#22c55e]" },
                      { key: 'factory', label: t("factory"), color: "bg-[#3b82f6]" },
                      { key: 'mission', label: t("mission"), color: "bg-[#f59e0b]" },
                      { key: 'leave', label: t("leave"), color: "bg-[#94a3b8]" }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer py-1 hover:text-foreground">
                        <Checkbox
                          checked={colFilters.workingFormats.includes(item.key)}
                          onCheckedChange={() => setColFilters(prev => ({
                            ...prev,
                            workingFormats: toggleArrayItem(prev.workingFormats, item.key)
                          }))}
                        />
                        <div className="flex items-center gap-1.5">
                          <span className={cn("size-2 rounded-full", item.color)} />
                          <span>{item.label}</span>
                        </div>
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

              {/* ── Column 10: Actions ── */}
              <th className="py-3 px-3 text-center text-xs font-semibold">
                {t("actionsCol")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/20">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-muted-foreground text-xs">
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

                return (
                  <tr
                    key={user.id}
                    className={cn(
                      "hover:bg-muted/40 transition-colors group",
                      isSelected && "bg-primary/5 dark:bg-primary/10"
                    )}
                  >
                    {/* ── Column 1: User ── */}
                    <td className="py-3 px-3 text-start">
                      <div className="flex items-center gap-2.5">
                        <div className="relative size-9.5 rounded-full bg-primary/10 border border-border/40 shrink-0 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary uppercase">{user.name[0]}</span>
                          )}
                          <span
                            className={cn(
                              "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background",
                              user.status === 'online' ? "bg-emerald-500" : "bg-slate-400"
                            )}
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

                    {/* ── Column 2: Department & Title ── */}
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

                    {/* ── Column 3: Contact ── */}
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
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="size-2.5 shrink-0" />
                            <span>{user.phone}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ── Column 4: Projects ── */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <FolderKanban className="size-3" />
                        <span>{user.doneProjects || 0}</span>
                      </span>
                    </td>

                    {/* ── Column 5: Experience ── */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                        <Award className="size-3" />
                        <span>350</span>
                      </span>
                    </td>

                    {/* ── Column 6: Tenure ── */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-medium text-foreground">
                        {user.daysInCompany || 0} <span className="text-[10px] text-muted-foreground">{t("daysUnit")}</span>
                      </span>
                    </td>

                    {/* ── Column 7: Salary ── */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {showSalaries 
                          ? `$${(user.salary || 10000).toLocaleString()}` 
                          : "••••••••"}
                      </span>
                    </td>

                    {/* ── Column 8: Working Format ── */}
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

                    {/* ── Column 9: Status ── */}
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

                    {/* ── Column 10: Actions ── */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSelectAndGoHome(user)}
                          title={t("viewInDashboard")}
                          className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSelectAndGoConfig(user)}
                          title={t("editUser")}
                          className="size-8 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          <Settings2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
