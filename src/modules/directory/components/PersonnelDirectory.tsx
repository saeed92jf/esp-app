"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  Building2,
  Filter,
  Grid,
  List,
  Phone,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelDetailModal } from "./PersonnelDetailModal";
import type { PersonnelItem } from "../types";

export function PersonnelDirectory() {
  const [personnel, setPersonnel] = useState<PersonnelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<"all" | "esp" | "npc" | "dual">("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedPerson, setSelectedPerson] = useState<PersonnelItem | null>(null);
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

  // Extract unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set<string>();
    personnel.forEach((p) => {
      if (p.esp.department) {
        depts.add(p.esp.department.split("/")[0].trim());
      }
      if (p.npc.department) {
        depts.add(p.npc.department.split("/")[0].trim());
      }
    });
    return Array.from(depts).filter(Boolean);
  }, [personnel]);

  // Filtered personnel list
  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      // 1. Company filter
      if (selectedCompany === "esp" && !person.esp.hasRole) return false;
      if (selectedCompany === "npc" && !person.npc.hasRole) return false;
      if (selectedCompany === "dual" && !person.isDual) return false;

      // 2. Department filter
      if (selectedDept !== "all") {
        const espDeptMatch = person.esp.department?.includes(selectedDept);
        const npcDeptMatch = person.npc.department?.includes(selectedDept);
        if (!espDeptMatch && !npcDeptMatch) return false;
      }

      // 3. Search query (search across name, extension, titles, email)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName =
          person.fullNameFa.toLowerCase().includes(q) ||
          person.fullNameEn.toLowerCase().includes(q);
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

        if (!matchName && !matchExt && !matchEmail && !matchTitle && !matchDept) {
          return false;
        }
      }

      return true;
    });
  }, [personnel, selectedCompany, selectedDept, searchQuery]);

  const handleOpenDetails = (person: PersonnelItem) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/40 to-background/90 p-8 shadow-sm backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>شبکه ارتباطات سازمانی و دایرکتوری همکاران</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              راهنمای همکاران و شناسنامه سازمانی
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              دسترسی سریع به شماره‌های داخلی، ایمیل‌های کاری، جایگاه‌های شغلی و اطلاعات ارتباطی پرسنل شرکت‌های یورواسلات پارس و نانو پالایش سرام
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/60 shadow-sm min-w-[90px]">
              <span className="text-xs text-muted-foreground font-medium">کل همکاران</span>
              <span className="text-xl font-bold text-foreground font-mono">{stats.total}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 shadow-sm min-w-[90px]">
              <span className="text-xs text-sky-700 dark:text-sky-300 font-medium">یورواسلات</span>
              <span className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono">{stats.espCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-sm min-w-[90px]">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">نانوپالایش</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.npcCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-sm min-w-[90px]">
              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">سمت دوگانه</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">{stats.dualCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="جستجو بر اساس نام، شماره داخلی، دپارتمان، سمت سازمانی یا ایمیل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 rounded-xl bg-background/80 border-border/60 text-sm h-11"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* Department Filter & View Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="فیلتر دپارتمان"
              className="h-11 px-3.5 rounded-xl border border-border/60 bg-background/80 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">تمام دپارتمان‌ها</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  دپارتمان {dept}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-xl border border-border/60 p-1 bg-muted/30">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("grid")}
                title="چیدمان کارتی"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("table")}
                title="چیدمان جدولی"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={fetchDirectory}
              title="بارگذاری مجدد"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Company Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <span className="text-xs font-medium text-muted-foreground ml-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            فیلتر شرکت:
          </span>

          <Button
            variant={selectedCompany === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-xl text-xs h-8 px-3"
            onClick={() => setSelectedCompany("all")}
          >
            همه همکاران ({stats.total})
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
            <Building2 className="w-3 h-3 ml-1" />
            یورواسلات پارس ({stats.espCount})
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
            <Building2 className="w-3 h-3 ml-1" />
            نانو پالایش سرام ({stats.npcCount})
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
            <Sparkles className="w-3 h-3 ml-1" />
            سمت دوگانه و مشترک ({stats.dualCount})
          </Button>
        </div>
      </div>

      {/* Main Grid / Table Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl border border-border/50 p-5 space-y-4">
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
            همکاری با مشخصات مورد نظر یافت نشد
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            لطفاً عبارت جستجو را تغییر دهید یا فیلترهای انتخابی را بازنشانی کنید.
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
            بازنشانی فیلترها
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
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <th className="p-3.5">نام و نام خانوادگی</th>
                <th className="p-3.5">عضویت شرکتی</th>
                <th className="p-3.5">سمت سازمانی</th>
                <th className="p-3.5">دپارتمان</th>
                <th className="p-3.5 text-center">شماره داخلی</th>
                <th className="p-3.5">ایمیل سازمانی</th>
                <th className="p-3.5">محل خدمت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredPersonnel.map((person) => (
                <tr
                  key={person.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3.5 font-bold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                        style={{ backgroundColor: person.avatarColor || "#0284c7" }}
                      >
                        {person.fullNameFa.slice(0, 1)}
                      </div>
                      <div>
                        <div>{person.fullNameFa}</div>
                        <div className="text-[10px] text-muted-foreground font-mono dir-ltr text-right">
                          {person.fullNameEn}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    {person.isDual ? (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px]">
                        مشترک (ESP & NPC)
                      </Badge>
                    ) : person.isNpcOnly ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                        نانوپالایش
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px]">
                        یورواسلات
                      </Badge>
                    )}
                  </td>
                  <td className="p-3.5">
                    {person.isDual ? (
                      <div className="space-y-0.5">
                        <div className="text-sky-600 dark:text-sky-400">ESP: {person.esp.jobTitleFa}</div>
                        <div className="text-emerald-600 dark:text-emerald-400">NPC: {person.npc.jobTitleFa}</div>
                      </div>
                    ) : (
                      person.esp.jobTitleFa || person.npc.jobTitleFa
                    )}
                  </td>
                  <td className="p-3.5 text-muted-foreground">
                    {person.esp.department?.split("/")[0].trim() || person.npc.department?.split("/")[0].trim()}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-primary">
                    {person.contact.extension || "--"}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground dir-ltr text-right">
                    {person.esp.email || person.npc.email || "--"}
                  </td>
                  <td className="p-3.5 text-muted-foreground">
                    {person.contact.workLocation.split("/")[0].trim()}
                  </td>
                  <td className="p-3.5 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(person)}
                      className="rounded-lg text-xs h-7 px-2"
                    >
                      شناسنامه
                    </Button>
                  </td>
                </tr>
              ))}
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
