"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  RefreshCw,
  Sparkles,
  Building2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/layout/app-header";
import { useLocale, useTranslations } from "next-intl";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelDetailModal } from "./PersonnelDetailModal";
import { DirectorySidebar, type DepartmentOption } from "./DirectorySidebar";
import type { PersonnelItem } from "../types";
import {
  getLocalizedText,
  getLocalizedJobTitle,
  getSingleLocalizedName,
} from "../utils";

export function PersonnelDirectory() {
  const locale = useLocale();
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-collapse sidebar on smaller screens on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

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

  // Extract unique departments with counts for sidebar
  const departmentOptions: DepartmentOption[] = useMemo(() => {
    const deptMap = new Map<string, DepartmentOption>();
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

      // 3. Search query (search across FA & EN names, extension, titles, email, departments)
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
      {/* ── 1. Dedicated Header with Hamburger Sidebar Controller ── */}
      <AppHeader
        tag="directory"
        variant="panel"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        showMenuButton={true}
        logoHref="/"
      />

      {/* ── 2. Unified Layout with Sidebar & Content ── */}
      <div className="flex flex-1 w-full relative">
        {/* Dedicated Collapsible Sidebar Navigation */}
        <DirectorySidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          departments={departmentOptions}
          stats={stats}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Hero Banner with Soft Gradient */}
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/85 via-card/50 to-muted/30 p-6 sm:p-7 shadow-xs backdrop-blur-xl">
            <div className="absolute top-0 end-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("badgeHero")}</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
                  {t("heroTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t("heroDescription")}
                </p>
              </div>

              {/* Quick Summary Pill Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card/80 border border-border/60 shadow-xs">
                  <span className="text-xs text-muted-foreground font-medium">
                    {t("stats.total")}:
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.total}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                    {stats.espCount}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    {stats.npcCount}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                    {stats.dualCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Active Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 pe-14 rounded-xl bg-background/80 border-border/50 text-sm h-10 shadow-none focus-visible:ring-1"
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

            {/* Active Filters and Reset */}
            <div className="flex items-center gap-2 shrink-0">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAllFilters}
                  className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl px-3"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t("filters.reset")}</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0"
                onClick={fetchDirectory}
                title={t("views.refresh")}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Results Summary Ribbon */}
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

            {selectedCompany !== "all" && (
              <Badge variant="outline" className="text-xs">
                {selectedCompany === "esp"
                  ? t("filters.espCompany")
                  : selectedCompany === "npc"
                  ? t("filters.npcCompany")
                  : t("filters.dualCompany")}
              </Badge>
            )}
          </div>

          {/* Main Grid / Table Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl border border-border/50 p-5 space-y-4 bg-card/40"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-xs">
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
                    const displayName = getSingleLocalizedName(person, locale);
                    const espTitle = getLocalizedJobTitle(person.esp, locale);
                    const npcTitle = getLocalizedJobTitle(person.npc, locale);
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
                              {(displayName || "E").slice(0, 1).toUpperCase()}
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
                        <td className="p-3.5 text-muted-foreground">{loc}</td>
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
