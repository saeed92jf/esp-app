"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  Building2,
  Filter,
  Grid,
  List,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale, useTranslations } from "next-intl";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelDetailModal } from "./PersonnelDetailModal";
import type { PersonnelItem } from "../types";
import {
  getLocalizedText,
  getLocalizedJobTitle,
  getLocalizedName,
} from "../utils";

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

  // Extract unique departments for filter (localized)
  const departments = useMemo(() => {
    const deptMap = new Map<string, string>(); // localized -> rawKey
    personnel.forEach((p) => {
      if (p.esp.department) {
        const loc = getLocalizedText(p.esp.department, locale);
        if (loc) deptMap.set(loc, p.esp.department);
      }
      if (p.npc.department) {
        const loc = getLocalizedText(p.npc.department, locale);
        if (loc) deptMap.set(loc, p.npc.department);
      }
    });
    return Array.from(deptMap.keys()).sort();
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

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/40 to-background/90 p-6 sm:p-8 shadow-sm backdrop-blur-xl">
        <div className="absolute top-0 end-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("badgeHero")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t("heroDescription")}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/60 shadow-sm min-w-[90px]">
              <span className="text-xs text-muted-foreground font-medium">
                {t("stats.total")}
              </span>
              <span className="text-xl font-bold text-foreground font-mono">
                {stats.total}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 shadow-sm min-w-[90px]">
              <span className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                {t("stats.esp")}
              </span>
              <span className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono">
                {stats.espCount}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-sm min-w-[90px]">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                {t("stats.npc")}
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {stats.npcCount}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-sm min-w-[90px]">
              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                {t("stats.dual")}
              </span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                {stats.dualCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 pe-14 rounded-xl bg-background/80 border-border/60 text-sm h-11"
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

          {/* Department Filter & View Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label={t("filters.departmentLabel")}
              className="h-11 px-3.5 rounded-xl border border-border/60 bg-background/80 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">{t("filters.allDepartments")}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-xl border border-border/60 p-1 bg-muted/30">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("grid")}
                title={t("views.grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("table")}
                title={t("views.table")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={fetchDirectory}
              title={t("views.refresh")}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Company Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <span className="text-xs font-medium text-muted-foreground me-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {t("filters.companyLabel")}
          </span>

          <Button
            variant={selectedCompany === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-xl text-xs h-8 px-3"
            onClick={() => setSelectedCompany("all")}
          >
            {t("filters.allPersonnel")} ({stats.total})
          </Button>

          <Button
            variant={selectedCompany === "esp" ? "default" : "outline"}
            size="sm"
            className={`rounded-xl text-xs h-8 px-3 ${
              selectedCompany === "esp"
                ? "bg-sky-600 hover:bg-sky-700 text-white"
                : "border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10"
            }`}
            onClick={() => setSelectedCompany("esp")}
          >
            <Building2 className="w-3 h-3 me-1" />
            {t("filters.espCompany")} ({stats.espCount})
          </Button>

          <Button
            variant={selectedCompany === "npc" ? "default" : "outline"}
            size="sm"
            className={`rounded-xl text-xs h-8 px-3 ${
              selectedCompany === "npc"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            }`}
            onClick={() => setSelectedCompany("npc")}
          >
            <Building2 className="w-3 h-3 me-1" />
            {t("filters.npcCompany")} ({stats.npcCount})
          </Button>

          <Button
            variant={selectedCompany === "dual" ? "default" : "outline"}
            size="sm"
            className={`rounded-xl text-xs h-8 px-3 ${
              selectedCompany === "dual"
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
            }`}
            onClick={() => setSelectedCompany("dual")}
          >
            <Sparkles className="w-3 h-3 me-1" />
            {t("filters.dualCompany")} ({stats.dualCount})
          </Button>
        </div>
      </div>

      {/* Main Grid / Table Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl border border-border/50 p-5 space-y-4"
            >
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredPersonnel.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card/40">
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
            onClick={() => {
              setSearchQuery("");
              setSelectedCompany("all");
              setSelectedDept("all");
            }}
            className="rounded-xl text-xs"
          >
            {t("filters.reset")}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
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
            <tbody className="divide-y divide-border/40">
              {filteredPersonnel.map((person) => {
                const { primary: primaryName, secondary: secondaryName } =
                  getLocalizedName(person, locale);
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
                          className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-[10px] shrink-0"
                          style={{
                            backgroundColor:
                              person.avatarColor || "#0284c7",
                          }}
                        >
                          {(primaryName || "E").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div>{primaryName}</div>
                          {secondaryName ? (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {secondaryName}
                            </div>
                          ) : null}
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
                    <td className="p-3.5 text-center font-mono font-bold text-primary">
                      {person.contact.extension || "--"}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-muted-foreground dir-ltr text-start">
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

      {/* Details Modal */}
      <PersonnelDetailModal
        person={selectedPerson}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
