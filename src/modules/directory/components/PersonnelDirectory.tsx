"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  RefreshCw,
  Sparkles,
  Building2,
  X,
  Grid,
  List,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/layout/app-header";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useLocale, useTranslations } from "next-intl";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelDetailModal } from "./PersonnelDetailModal";
import { DirectorySidebar } from "./DirectorySidebar";
import type { PersonnelItem } from "../types";
import {
  getLocalizedText,
  getLocalizedJobTitle,
  getSingleLocalizedName,
} from "../utils";

interface DepartmentInfo {
  id: string;
  label: string;
  count: number;
}

export function PersonnelDirectory() {
  const locale = useLocale();
  const isFa = locale === "fa";
  const t = useTranslations("Directory");

  const [personnel, setPersonnel] = useState<PersonnelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<
    "all" | "esp" | "npc" | "dual"
  >("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedPerson, setSelectedPerson] = useState<PersonnelItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch personnel directory from API
  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/directory");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPersonnel(json.data);
      }
    } catch (err) {
      console.error("Failed to load directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = personnel.length;
    const espCount = personnel.filter((p) => p.esp.hasRole).length;
    const npcCount = personnel.filter((p) => p.npc.hasRole).length;
    const dualCount = personnel.filter((p) => p.isDual).length;
    return { total, espCount, npcCount, dualCount };
  }, [personnel]);

  // Extract unique departments with counts
  const departmentOptions: DepartmentInfo[] = useMemo(() => {
    const deptMap = new Map<string, DepartmentInfo>();
    personnel.forEach((p) => {
      const espLoc = getLocalizedText(p.esp.department, locale);
      if (espLoc) {
        const cur = deptMap.get(espLoc) || {
          id: espLoc,
          label: espLoc,
          count: 0,
        };
        cur.count++;
        deptMap.set(espLoc, cur);
      }
      if (p.isDual) {
        const npcLoc = getLocalizedText(p.npc.department, locale);
        if (npcLoc && npcLoc !== espLoc) {
          const cur = deptMap.get(npcLoc) || {
            id: npcLoc,
            label: npcLoc,
            count: 0,
          };
          cur.count++;
          deptMap.set(npcLoc, cur);
        }
      }
    });
    return Array.from(deptMap.values()).sort((a, b) => b.count - a.count);
  }, [personnel, locale]);

  // Transform departments into Combobox options
  const departmentComboboxOptions: ComboboxOption[] = useMemo(() => {
    const allOption: ComboboxOption = {
      value: "all",
      label: t("filters.allDepartments"),
    };
    const options: ComboboxOption[] = departmentOptions.map((dept) => ({
      value: dept.id,
      label: `${dept.label} (${dept.count})`,
    }));
    return [allOption, ...options];
  }, [departmentOptions, t]);

  // Filtered personnel list
  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      // 1. Company filter
      if (selectedCompany === "esp" && !person.esp.hasRole) return false;
      if (selectedCompany === "npc" && !person.npc.hasRole) return false;
      if (selectedCompany === "dual" && !person.isDual) return false;

      // 2. Department filter
      if (selectedDept !== "all") {
        const espLoc = getLocalizedText(person.esp.department, locale);
        const npcLoc = getLocalizedText(person.npc.department, locale);
        if (espLoc !== selectedDept && npcLoc !== selectedDept) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName =
          person.fullNameFa?.toLowerCase().includes(q) ||
          person.fullNameEn?.toLowerCase().includes(q);
        const matchExt = person.contact.extension?.includes(q);
        const matchEmail =
          person.esp.email?.toLowerCase().includes(q) ||
          person.npc.email?.toLowerCase().includes(q);
        const matchTitle =
          person.esp.jobTitleFa?.toLowerCase().includes(q) ||
          person.npc.jobTitleFa?.toLowerCase().includes(q) ||
          person.esp.jobTitleEn?.toLowerCase().includes(q) ||
          person.npc.jobTitleEn?.toLowerCase().includes(q);
        const matchDept =
          person.esp.department?.toLowerCase().includes(q) ||
          person.npc.department?.toLowerCase().includes(q);

        if (
          !matchName &&
          !matchExt &&
          !matchEmail &&
          !matchTitle &&
          !matchDept
        ) {
          return false;
        }
      }

      return true;
    });
  }, [personnel, selectedCompany, selectedDept, searchQuery, locale]);

  const handleOpenDetails = (person: PersonnelItem) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const hasActiveFilters =
    selectedCompany !== "all" ||
    selectedDept !== "all" ||
    searchQuery.trim().length > 0;

  const resetAllFilters = () => {
    setSelectedCompany("all");
    setSelectedDept("all");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Dedicated Header with Profile-Style Menu Controller ── */}
      <AppHeader
        tag="directory"
        variant="panel"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        showMenuButton={true}
        logoHref="/"
      />

      {/* ── 2. Unified Layout with Profile-Manager Style Sidebar & Compact Content ── */}
      <div className="flex flex-1 w-full relative">
        {/* Profile-Manager Style Side Menu */}
        <DirectorySidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area: Centered with compact, elegant width (max-w-5xl) */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {/* Hero Header Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/85 via-card/50 to-muted/30 p-6 sm:p-7 shadow-xs backdrop-blur-xl">
              <div className="absolute top-0 end-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 start-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t("badgeHero")}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                    {t("heroTitle")}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t("heroDescription")}
                  </p>
                </div>

                {/* Quick Summary Pill Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/90 border border-border/60 shadow-xs">
                    <span className="text-xs text-muted-foreground font-medium">
                      {t("stats.total")}:
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {stats.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                      {stats.espCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      {stats.npcCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      {stats.dualCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Filter Bar Above Cards: Company Options + Department Combobox + Search ── */}
            <div className="space-y-3 p-4 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-xs">
              {/* Row 1: Company Selection Options (Pills) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border/40">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground me-1">
                    {t("filters.companyLabel")}
                  </span>

                  {/* All */}
                  <Button
                    variant={selectedCompany === "all" ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl text-xs h-8 px-3 font-medium transition-all"
                    onClick={() => setSelectedCompany("all")}
                  >
                    {t("filters.allPersonnel")} ({stats.total})
                  </Button>

                  {/* ESP */}
                  <Button
                    variant={selectedCompany === "esp" ? "default" : "outline"}
                    size="sm"
                    className={`rounded-xl text-xs h-8 px-3 font-medium transition-all ${
                      selectedCompany === "esp"
                        ? "bg-sky-600 hover:bg-sky-700 text-white"
                        : "border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10"
                    }`}
                    onClick={() => setSelectedCompany("esp")}
                  >
                    <Building2 className="w-3 h-3 me-1.5" />
                    {t("filters.espCompany")} ({stats.espCount})
                  </Button>

                  {/* NPC */}
                  <Button
                    variant={selectedCompany === "npc" ? "default" : "outline"}
                    size="sm"
                    className={`rounded-xl text-xs h-8 px-3 font-medium transition-all ${
                      selectedCompany === "npc"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                    onClick={() => setSelectedCompany("npc")}
                  >
                    <Building2 className="w-3 h-3 me-1.5" />
                    {t("filters.npcCompany")} ({stats.npcCount})
                  </Button>

                  {/* Dual */}
                  <Button
                    variant={selectedCompany === "dual" ? "default" : "outline"}
                    size="sm"
                    className={`rounded-xl text-xs h-8 px-3 font-medium transition-all ${
                      selectedCompany === "dual"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                    }`}
                    onClick={() => setSelectedCompany("dual")}
                  >
                    <Sparkles className="w-3 h-3 me-1.5" />
                    {t("filters.dualCompany")} ({stats.dualCount})
                  </Button>
                </div>

                {/* View Switcher (Grid / Table) */}
                <div className="flex items-center rounded-xl border border-border/50 p-0.5 bg-muted/40">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => setViewMode("grid")}
                    title={t("views.grid")}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => setViewMode("table")}
                    title={t("views.table")}
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Row 2: Search Input + Department Combobox Component + Reset */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={t("search.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-9 pe-14 rounded-xl bg-background border-border/60 text-xs sm:text-sm h-10 shadow-none focus-visible:ring-1"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-medium px-1"
                    >
                      {t("search.clear")}
                    </button>
                  )}
                </div>

                {/* Department Selection via Project's Own Combobox Component */}
                <div className="w-full sm:w-64 shrink-0">
                  <Combobox
                    options={departmentComboboxOptions}
                    value={selectedDept}
                    onChange={(val) => setSelectedDept(val || "all")}
                    placeholder={t("filters.allDepartments")}
                    searchPlaceholder={
                      isFa ? "جستجوی دپارتمان..." : "Search department..."
                    }
                    emptyText={
                      isFa ? "دپارتمانی یافت نشد" : "No department found"
                    }
                    allowClear={false}
                    className="w-full"
                    triggerClassName="h-10 rounded-xl bg-background border-border/60 text-xs font-medium"
                  />
                </div>

                {/* Reset & Refresh Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetAllFilters}
                      className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-xl px-2.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t("filters.reset")}</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl shrink-0 bg-background"
                    onClick={fetchDirectory}
                    title={t("views.refresh")}
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count Banner */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <div>
                <span>نمایش </span>
                <strong className="text-foreground">
                  {filteredPersonnel.length}
                </strong>
                <span> نفر از مجموع </span>
                <strong className="text-foreground">{stats.total}</strong>
                <span> همکار</span>
              </div>

              {selectedDept !== "all" && (
                <Badge variant="outline" className="text-xs bg-card/60">
                  دپارتمان: {selectedDept}
                </Badge>
              )}
            </div>

            {/* ── Main Personnel Content (Cards with White Background) ── */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 rounded-2xl border border-border/50 p-5 space-y-4 bg-white dark:bg-card shadow-xs"
                  >
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredPersonnel.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/70 bg-card/30">
                <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
                  <Users className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  {t("empty.title")}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  {t("empty.desc")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAllFilters}
                  className="rounded-xl text-xs"
                >
                  {t("filters.reset")}
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPersonnel.map((person) => (
                  <PersonnelCard
                    key={person.id}
                    person={person}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white dark:bg-card shadow-xs">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/50 text-muted-foreground font-semibold">
                      <th className="p-3.5 text-start">{t("table.fullName")}</th>
                      <th className="p-3.5 text-start">{t("table.company")}</th>
                      <th className="p-3.5 text-start">{t("table.jobTitle")}</th>
                      <th className="p-3.5 text-start">{t("table.department")}</th>
                      <th className="p-3.5 text-center">{t("table.extension")}</th>
                      <th className="p-3.5 text-start">{t("table.email")}</th>
                      <th className="p-3.5 text-start">{t("table.location")}</th>
                      <th className="p-3.5 text-center">{t("table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredPersonnel.map((person) => {
                      const displayName = getSingleLocalizedName(
                        person,
                        locale
                      );
                      const espTitle = getLocalizedJobTitle(
                        person.esp,
                        locale
                      );
                      const npcTitle = getLocalizedJobTitle(
                        person.npc,
                        locale
                      );
                      const espDept = getLocalizedText(
                        person.esp.department,
                        locale
                      );
                      const npcDept = getLocalizedText(
                        person.npc.department,
                        locale
                      );
                      const loc = getLocalizedText(
                        person.contact.workLocation,
                        locale
                      );

                      return (
                        <tr
                          key={person.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-foreground">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
                                style={{
                                  backgroundColor:
                                    person.avatarColor || "#0284c7",
                                }}
                              >
                                {(displayName || "E")
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </div>
                              <div className="font-semibold text-foreground">
                                {displayName}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {person.isDual ? (
                              <Badge
                                variant="outline"
                                className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px]"
                              >
                                {t("card.dualBadge")}
                              </Badge>
                            ) : person.isNpcOnly ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                              >
                                {t("card.npcBadge")}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px]"
                              >
                                {t("card.espBadge")}
                              </Badge>
                            )}
                          </td>
                          <td className="p-3.5">
                            {person.isDual ? (
                              <div className="space-y-0.5">
                                <div className="text-sky-600 dark:text-sky-400">
                                  ESP: {espTitle}
                                </div>
                                <div className="text-emerald-600 dark:text-emerald-400">
                                  NPC: {npcTitle}
                                </div>
                              </div>
                            ) : (
                              espTitle || npcTitle || "--"
                            )}
                          </td>
                          <td className="p-3.5 text-muted-foreground">
                            {espDept || npcDept || "--"}
                          </td>
                          <td className="p-3.5 text-center font-bold text-primary">
                            {person.contact.extension || "--"}
                          </td>
                          <td className="p-3.5 text-[11px] text-muted-foreground dir-ltr text-start">
                            {person.esp.email || person.npc.email || "--"}
                          </td>
                          <td className="p-3.5 text-muted-foreground">
                            {loc}
                          </td>
                          <td className="p-3.5 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetails(person)}
                              className="rounded-lg text-xs h-7 px-2"
                            >
                              {t("table.profile")}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      <PersonnelDetailModal
        person={selectedPerson}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
