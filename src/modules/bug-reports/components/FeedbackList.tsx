// src/modules/bug-reports/components/FeedbackList.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Search,
  MessageSquare,
  Star,
  Trash2,
  ExternalLink,
  User,
  Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { bugReportsService } from "../services/bug-reports.service";
import type { FeedbackSubmission } from "../types";

interface FeedbackListProps {
  feedbackList: FeedbackSubmission[];
  onRefresh: () => void;
}

export function FeedbackList({
  feedbackList,
  onRefresh,
}: FeedbackListProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSubmission | null>(null);

  const ratingOptions = useMemo<ComboboxOption[]>(() => [
    { value: "all", label: isRtl ? "همه امتیازها" : "All Ratings" },
    { value: "5", label: "⭐⭐⭐⭐⭐ (5/5)" },
    { value: "4", label: "⭐⭐⭐⭐ (4/5)" },
    { value: "3", label: "⭐⭐⭐ (3/5)" },
    { value: "2", label: "⭐⭐ (2/5)" },
    { value: "1", label: "⭐ (1/5)" },
  ], [isRtl]);

  const typeOptions = useMemo<ComboboxOption[]>(() => [
    { value: "all", label: isRtl ? "همه انواع بازخورد" : "All Types" },
    { value: "General", label: isRtl ? "عمومی" : "General" },
    { value: "UI / UX", label: isRtl ? "رابط کاربری (UI/UX)" : "UI / UX" },
    { value: "Performance", label: isRtl ? "کارایی و سرعت" : "Performance" },
    { value: "Feature", label: isRtl ? "امکانات" : "Feature" },
    { value: "Bug", label: isRtl ? "اشکال نرم‌افزاری" : "Bug" },
  ], [isRtl]);

  const filteredList = useMemo(() => {
    let list = feedbackList;
    if (ratingFilter !== "all") {
      list = list.filter((f) => String(f.rating) === ratingFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((f) => (f.feedbackType || "").toLowerCase() === typeFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.message.toLowerCase().includes(q) ||
          f.userName.toLowerCase().includes(q) ||
          (f.userEmail && f.userEmail.toLowerCase().includes(q)) ||
          f.moduleId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [feedbackList, ratingFilter, typeFilter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "آیا از حذف این بازخورد اطمینان دارید؟" : "Are you sure you want to delete this feedback?")) {
      return;
    }
    try {
      await bugReportsService.deleteFeedback(id);
      if (selectedFeedback?.id === id) setSelectedFeedback(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(isRtl ? `آیا از حذف تمام ${feedbackList.length} بازخورد کاربران اطمینان دارید؟ این عملیات قابل بازگشت نیست.` : `Are you sure you want to delete all ${feedbackList.length} feedback entries?`)) {
      return;
    }
    try {
      await bugReportsService.deleteAllFeedback();
      if (selectedFeedback) setSelectedFeedback(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete all feedback", err);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Search & Filters */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={
                isRtl
                  ? "جستجو در متن بازخورد، کاربر یا ماژول..."
                  : "Search feedback message, user or module..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 rounded-xl h-10 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Combobox
              options={ratingOptions}
              value={ratingFilter}
              onChange={(val) => setRatingFilter(val || "all")}
              size="sm"
              className="h-10 min-w-[140px] rounded-xl bg-background border-border/80 text-xs font-medium"
            />

            <Combobox
              options={typeOptions}
              value={typeFilter}
              onChange={(val) => setTypeFilter(val || "all")}
              size="sm"
              className="h-10 min-w-[140px] rounded-xl bg-background border-border/80 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Counter & Bulk Delete */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {isRtl
            ? `نمایش ${filteredList.length} مورد از مجموع ${feedbackList.length} بازخورد`
            : `Showing ${filteredList.length} of ${feedbackList.length} feedback entries`}
        </span>

        {feedbackList.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAll}
            className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>{isRtl ? "حذف همه بازخوردها" : "Delete All Feedback"}</span>
          </Button>
        )}
      </div>

      {/* Feedback Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "امتیاز" : "Rating"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "نوع بازخورد" : "Type"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "ماژول" : "Module"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "متن بازخورد" : "Message"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "فرستنده" : "User"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "تاریخ ثبت" : "Date"}</th>
                <th className="py-3 px-4 text-center font-bold">{isRtl ? "عملیات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <MessageSquare className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                    {isRtl ? "هیچ بازخوردی ثبت نشده است." : "No feedback recorded yet."}
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "size-3.5",
                              star <= item.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {item.feedbackType || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground uppercase text-[11px] font-mono whitespace-nowrap">
                      {item.moduleId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground max-w-md truncate">
                      {item.message}
                    </td>
                    <td className="py-3.5 px-4 text-foreground/80 whitespace-nowrap">
                      <div>{item.userName}</div>
                      {item.userEmail && (
                        <div className="text-[10px] text-muted-foreground">{item.userEmail}</div>
                      )}
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
                          onClick={() => setSelectedFeedback(item)}
                          className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
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

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedFeedback}
        onOpenChange={(open) => !open && setSelectedFeedback(null)}
      >
        <DialogContent className="max-w-xl p-6 rounded-2xl">
          {selectedFeedback && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "size-4",
                          star <= selectedFeedback.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                    <span className="ms-1.5 text-xs font-mono font-bold text-foreground">
                      ({selectedFeedback.rating}/5)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {selectedFeedback.feedbackType || "General"}
                  </span>
                </div>
                <DialogTitle className="text-base font-bold text-foreground mt-2">
                  {isRtl ? "جزئیات بازخورد ثبت‌شده" : "Feedback Details"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {new Date(selectedFeedback.createdAt).toLocaleString(isRtl ? "fa-IR" : "en-US")}
                </DialogDescription>
              </DialogHeader>

              {/* Submitter Box */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="font-bold text-foreground">{selectedFeedback.userName}</span>
                </div>
                {selectedFeedback.userEmail && (
                  <div className="flex items-center gap-1 text-muted-foreground font-mono">
                    <Mail className="size-3.5" />
                    <span>{selectedFeedback.userEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{isRtl ? "ماژول:" : "Module:"}</span>
                  <span className="font-mono uppercase font-bold text-primary">{selectedFeedback.moduleId}</span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-muted-foreground">{isRtl ? "متن کامل بازخورد:" : "Feedback Message:"}</h4>
                <div className="p-4 rounded-xl bg-background border border-border/80 text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans">
                  {selectedFeedback.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

