// src/modules/bug-reports/components/AllRequestsList.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Search,
  Bug,
  Headset,
  MessageSquare,
  Lightbulb,
  ExternalLink,
  Layers,
  Star,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { bugReportsService } from "../services/bug-reports.service";
import type {
  BugReport,
  SupportRequest,
  FeedbackSubmission,
  IdeaSubmission,
} from "../types";

export type UnifiedRequestType = "bug" | "support" | "feedback" | "idea";

export interface UnifiedRequestItem {
  id: string;
  type: UnifiedRequestType;
  ticketNumber?: string;
  title: string;
  description: string;
  category?: string;
  moduleId: string;
  priority?: string;
  status: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  original: BugReport | SupportRequest | FeedbackSubmission | IdeaSubmission;
}

interface AllRequestsListProps {
  reports: BugReport[];
  supportRequests: SupportRequest[];
  feedbackList: FeedbackSubmission[];
  ideasList: IdeaSubmission[];
  onSelectBug: (bug: BugReport) => void;
  onSelectSupport: (support: SupportRequest) => void;
  onSelectFeedback: (fb: FeedbackSubmission) => void;
  onSelectIdea: (idea: IdeaSubmission) => void;
  onRefresh?: () => void;
}

export function AllRequestsList({
  reports,
  supportRequests,
  feedbackList,
  ideasList,
  onSelectBug,
  onSelectSupport,
  onSelectFeedback,
  onSelectIdea,
  onRefresh,
}: AllRequestsListProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const handleDeleteSingle = async (item: UnifiedRequestItem) => {
    if (!confirm(isRtl ? "آیا از حذف این مورد اطمینان دارید؟" : "Are you sure you want to delete this item?")) {
      return;
    }
    try {
      if (item.type === "bug") await bugReportsService.deleteBugReport(item.id);
      else if (item.type === "support") await bugReportsService.deleteSupportRequest(item.id);
      else if (item.type === "feedback") await bugReportsService.deleteFeedback(item.id);
      else if (item.type === "idea") await bugReportsService.deleteIdea(item.id);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(isRtl ? `آیا از حذف تمام ${unifiedList.length} درخواست اطمینان دارید؟ این عملیات تمام گزارش‌ها، تیکت‌ها و بازخوردها را پاک می‌کند.` : `Are you sure you want to delete all ${unifiedList.length} incoming requests? This will delete all bugs, support requests, feedback, and ideas.`)) {
      return;
    }
    try {
      await bugReportsService.deleteAllIssues();
      onRefresh?.();
    } catch (err) {
      console.error("Failed to delete all requests", err);
    }
  };

  const typeOptions = useMemo<ComboboxOption[]>(() => [
    { value: "all", label: isRtl ? "همه انواع درخواست‌ها" : "All Request Types" },
    { value: "bug", label: isRtl ? "اشکالات فنی و باگ‌ها" : "Bug Reports" },
    { value: "support", label: isRtl ? "درخواست‌های پشتیبانی" : "Support Requests" },
    { value: "feedback", label: isRtl ? "بازخورد کاربران" : "User Feedback" },
    { value: "idea", label: isRtl ? "پیشنهادات و ایده‌ها" : "Feature Ideas" },
  ], [isRtl]);

  const unifiedList = useMemo<UnifiedRequestItem[]>(() => {
    const list: UnifiedRequestItem[] = [];

    reports.forEach((r) => {
      list.push({
        id: r.id,
        type: "bug",
        ticketNumber: r.ticketNumber,
        title: r.title,
        description: r.description,
        category: r.category,
        moduleId: r.moduleId,
        priority: r.priority,
        status: r.status,
        userName: r.reporterName,
        userEmail: r.reporterEmail,
        createdAt: r.createdAt,
        original: r,
      });
    });

    supportRequests.forEach((s) => {
      list.push({
        id: s.id,
        type: "support",
        ticketNumber: s.ticketNumber,
        title: s.subject,
        description: s.description,
        category: s.category,
        moduleId: s.moduleId,
        priority: s.priority,
        status: s.status,
        userName: s.userName,
        userEmail: s.userEmail,
        createdAt: s.createdAt,
        original: s,
      });
    });

    feedbackList.forEach((f) => {
      list.push({
        id: f.id,
        type: "feedback",
        title: `${f.feedbackType || "Feedback"} (${f.rating}★)`,
        description: f.message,
        category: f.feedbackType,
        moduleId: f.moduleId,
        status: "Submitted",
        userName: f.userName,
        userEmail: f.userEmail,
        createdAt: f.createdAt,
        original: f,
      });
    });

    ideasList.forEach((i) => {
      list.push({
        id: i.id,
        type: "idea",
        title: i.title,
        description: i.description,
        moduleId: i.moduleId,
        status: i.status || "Proposed",
        userName: i.userName,
        userEmail: i.userEmail,
        createdAt: i.createdAt,
        original: i,
      });
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reports, supportRequests, feedbackList, ideasList]);

  const filteredList = useMemo(() => {
    let result = unifiedList;
    if (typeFilter !== "all") {
      result = result.filter((item) => item.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.ticketNumber && item.ticketNumber.toLowerCase().includes(q)) ||
          item.userName.toLowerCase().includes(q) ||
          (item.userEmail && item.userEmail.toLowerCase().includes(q)) ||
          item.moduleId.toLowerCase().includes(q)
      );
    }
    return result;
  }, [unifiedList, typeFilter, search]);

  const handleRowClick = (item: UnifiedRequestItem) => {
    if (item.type === "bug") onSelectBug(item.original as BugReport);
    else if (item.type === "support") onSelectSupport(item.original as SupportRequest);
    else if (item.type === "feedback") onSelectFeedback(item.original as FeedbackSubmission);
    else if (item.type === "idea") onSelectIdea(item.original as IdeaSubmission);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Search & Filter */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={
                isRtl
                  ? "جستجو در تمامی درخواست‌ها، شماره تیکت، عنوان یا کاربر..."
                  : "Search all incoming requests, ticket number, user or title..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 rounded-xl h-10 text-xs bg-background"
            />
          </div>

          <div className="w-full sm:w-auto">
            <Combobox
              options={typeOptions}
              value={typeFilter}
              onChange={(val) => setTypeFilter(val || "all")}
              size="sm"
              className="h-10 min-w-[180px] rounded-xl bg-background border-border/80 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Counter & Bulk Delete */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {isRtl
            ? `نمایش ${filteredList.length} مورد از مجموع ${unifiedList.length} درخواست دریافتی`
            : `Showing ${filteredList.length} of ${unifiedList.length} total incoming requests`}
        </span>

        {unifiedList.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAll}
            className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>{isRtl ? "حذف همه درخواست‌ها" : "Delete All Requests"}</span>
          </Button>
        )}
      </div>

      {/* Unified Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "نوع درخواست" : "Type"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "شناسه / تیکت" : "ID / Ticket"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "عنوان" : "Title"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "ماژول" : "Module"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "وضعیت" : "Status"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "ارسال‌کننده" : "Sender"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "تاریخ ثبت" : "Date"}</th>
                <th className="py-3 px-4 text-center font-bold">{isRtl ? "مشاهده" : "View"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    {isRtl ? "هیچ درخواستی با مشخصات فیلتر شده یافت نشد." : "No incoming requests match the filter."}
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.type === "bug" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
                          <Bug className="size-3" />
                          <span>{isRtl ? "باگ فنی" : "Bug"}</span>
                        </span>
                      ) : item.type === "support" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                          <Headset className="size-3" />
                          <span>{isRtl ? "پشتیبانی" : "Support"}</span>
                        </span>
                      ) : item.type === "feedback" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <MessageSquare className="size-3" />
                          <span>{isRtl ? "بازخورد" : "Feedback"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Lightbulb className="size-3" />
                          <span>{isRtl ? "ایده" : "Idea"}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground/80 whitespace-nowrap text-[11px]">
                      {item.ticketNumber || `#${item.id.slice(0, 8)}`}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground uppercase text-[11px] font-mono whitespace-nowrap">
                      {item.moduleId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/60">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground/80 whitespace-nowrap">
                      <div>{item.userName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}
                    </td>
                    <td
                      className="py-3.5 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRowClick(item)}
                          className="h-8 px-2.5 text-xs text-primary group-hover:bg-primary/10 rounded-lg cursor-pointer"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSingle(item)}
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
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

