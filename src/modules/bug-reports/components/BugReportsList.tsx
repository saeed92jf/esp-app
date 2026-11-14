// src/modules/bug-reports/components/BugReportsList.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Search,
  Filter,
  Bug,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BugReport, BugStatus, BugSeverity, BugPriority } from "../types";

interface BugReportsListProps {
  reports: BugReport[];
  currentUserId?: string;
  onSelectReport: (report: BugReport) => void;
  activeFilterTab: "all" | "my";
  onFilterTabChange: (tab: "all" | "my") => void;
}

export function BugReportsList({
  reports,
  currentUserId,
  onSelectReport,
  activeFilterTab,
  onFilterTabChange,
}: BugReportsListProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredReports = useMemo(() => {
    let result = reports;

    if (activeFilterTab === "my" && currentUserId) {
      result = result.filter((r) => r.reporterId === currentUserId);
    }

    if (selectedStatus !== "all") {
      result = result.filter(
        (r) => r.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }
    if (selectedSeverity !== "all") {
      result = result.filter(
        (r) => r.severity.toLowerCase() === selectedSeverity.toLowerCase()
      );
    }
    if (selectedCategory !== "all") {
      result = result.filter(
        (r) => r.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ticketNumber.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.reporterName.toLowerCase().includes(q) ||
          (r.assigneeName && r.assigneeName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [
    reports,
    activeFilterTab,
    currentUserId,
    selectedStatus,
    selectedSeverity,
    selectedCategory,
    search,
  ]);

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* View Tab Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onFilterTabChange("all")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeFilterTab === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRtl ? "همه گزارش‌ها" : "All Reports"}
            </button>
            <button
              onClick={() => onFilterTabChange("my")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeFilterTab === "my"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRtl ? "گزارش‌های من" : "My Reports"}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={
                isRtl
                  ? "جستجو در شماره تیکت، عنوان، فرستنده یا توضیحات..."
                  : "Search ticket number, title, reporter or details..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 rounded-xl h-10 text-xs bg-background"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background border border-border/80 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="all">{isRtl ? "همه وضعیت‌ها" : "All Statuses"}</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Testing">Testing</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background border border-border/80 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="all">{isRtl ? "همه شدت‌ها" : "All Severities"}</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background border border-border/80 text-xs font-medium focus:ring-1 focus:ring-primary outline-none col-span-2 sm:col-span-1"
          >
            <option value="all">{isRtl ? "همه دسته‌بندی‌ها" : "All Categories"}</option>
            <option value="Functionality">Functionality</option>
            <option value="UI / UX">UI / UX</option>
            <option value="Performance">Performance</option>
            <option value="Authentication">Authentication</option>
            <option value="Data / Database">Data / Database</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Reports Count Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {isRtl
            ? `نمایش ${filteredReports.length} مورد از مجموع ${reports.length} تیکت`
            : `Showing ${filteredReports.length} of ${reports.length} tickets`}
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "شماره تیکت" : "Ticket"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "عنوان خطا" : "Title"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "دسته‌بندی" : "Category"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "ماژول" : "Module"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "شدت" : "Severity"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "وضعیت" : "Status"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "گزارش‌دهنده" : "Reporter"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "مسئول پیگیری" : "Assignee"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "تاریخ ثبت" : "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    {isRtl ? "هیچ تیکتی با مشخصات فیلتر شده یافت نشد." : "No matching tickets found."}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">
                      {report.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors max-w-xs truncate">
                      {report.title}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {report.category}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground uppercase text-[11px] font-mono whitespace-nowrap">
                      {report.moduleId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                          report.severity === "Critical"
                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                            : report.severity === "High"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-muted text-muted-foreground border-border/60"
                        )}
                      >
                        {report.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground/80 whitespace-nowrap">
                      {report.reporterName}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {report.assigneeName || (isRtl ? "تعیین‌نشده" : "Unassigned")}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {new Date(report.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

