// src/modules/bug-reports/components/IdeasList.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Search,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
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
import type { IdeaSubmission } from "../types";

interface IdeasListProps {
  ideasList: IdeaSubmission[];
  onRefresh: () => void;
}

export function IdeasList({
  ideasList,
  onRefresh,
}: IdeasListProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIdea, setSelectedIdea] = useState<IdeaSubmission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = useMemo<ComboboxOption[]>(() => [
    { value: "all", label: isRtl ? "همه وضعیت‌ها" : "All Statuses" },
    { value: "Proposed", label: isRtl ? "پیشنهاد اولیه" : "Proposed" },
    { value: "Under Review", label: isRtl ? "در حال بررسی" : "Under Review" },
    { value: "Approved", label: isRtl ? "تأییدشده" : "Approved" },
    { value: "Planned", label: isRtl ? "برنامه‌ریزی‌شده" : "Planned" },
    { value: "Implemented", label: isRtl ? "پیاده‌سازی‌شده" : "Implemented" },
    { value: "Rejected", label: isRtl ? "رد شده" : "Rejected" },
  ], [isRtl]);

  const filteredList = useMemo(() => {
    let list = ideasList;
    if (statusFilter !== "all") {
      list = list.filter((i) => (i.status || "").toLowerCase() === statusFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.expectedBenefit && i.expectedBenefit.toLowerCase().includes(q)) ||
          i.userName.toLowerCase().includes(q) ||
          (i.userEmail && i.userEmail.toLowerCase().includes(q)) ||
          i.moduleId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [ideasList, statusFilter, search]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await bugReportsService.updateIdeaStatus(id, newStatus);
      if (selectedIdea && selectedIdea.id === id) {
        setSelectedIdea({ ...selectedIdea, status: newStatus });
      }
      onRefresh();
    } catch (err) {
      console.error("Failed to update idea status", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "آیا از حذف این ایده و پیشنهاد اطمینان دارید؟" : "Are you sure you want to delete this idea?")) {
      return;
    }
    try {
      await bugReportsService.deleteIdea(id);
      if (selectedIdea?.id === id) setSelectedIdea(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete idea", err);
    }
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
                  ? "جستجو در عنوان ایده، کاربر یا توضیحات پیشنهاد..."
                  : "Search idea title, description, user or module..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 rounded-xl h-10 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Combobox
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val || "all")}
              size="sm"
              className="h-10 min-w-[150px] rounded-xl bg-background border-border/80 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {isRtl
            ? `نمایش ${filteredList.length} مورد از مجموع ${ideasList.length} ایده و پیشنهاد`
            : `Showing ${filteredList.length} of ${ideasList.length} feature ideas`}
        </span>
      </div>

      {/* Ideas Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "عنوان ایده / قابلیت" : "Title"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "ماژول" : "Module"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "وضعیت بررسی" : "Status"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "پیشنهاددهنده" : "Submitter"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "شرح خلاصه" : "Summary"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "تاریخ ثبت" : "Date"}</th>
                <th className="py-3 px-4 text-center font-bold">{isRtl ? "عملیات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Lightbulb className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                    {isRtl ? "هیچ ایده یا پیشنهادی ثبت نشده است." : "No feature ideas recorded yet."}
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedIdea(item)}
                  >
                    <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground uppercase text-[11px] font-mono whitespace-nowrap">
                      {item.moduleId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-semibold border",
                          item.status === "Implemented"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : item.status === "Approved" || item.status === "Planned"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : item.status === "Under Review"
                            ? "bg-sky-500/10 text-sky-600 border-sky-500/30"
                            : item.status === "Rejected"
                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        )}
                      >
                        {item.status || "Proposed"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground/80 whitespace-nowrap">
                      <div>{item.userName}</div>
                      {item.userEmail && (
                        <div className="text-[10px] text-muted-foreground">{item.userEmail}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-normal text-muted-foreground max-w-sm truncate">
                      {item.description}
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
                          onClick={() => setSelectedIdea(item)}
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
        open={!!selectedIdea}
        onOpenChange={(open) => !open && setSelectedIdea(null)}
      >
        <DialogContent className="max-w-2xl p-6 rounded-2xl">
          {selectedIdea && (
            <div className="space-y-5">
              <DialogHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    <Sparkles className="size-3.5" />
                    <span>{isRtl ? "ایده و پیشنهاد قابلیت جدید" : "Feature Idea"}</span>
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                      selectedIdea.status === "Implemented"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : selectedIdea.status === "Approved" || selectedIdea.status === "Planned"
                        ? "bg-primary/10 text-primary border-primary/30"
                        : selectedIdea.status === "Under Review"
                        ? "bg-sky-500/10 text-sky-600 border-sky-500/30"
                        : selectedIdea.status === "Rejected"
                        ? "bg-red-500/10 text-red-600 border-red-500/30"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    )}
                  >
                    {selectedIdea.status || "Proposed"}
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground mt-2">
                  {selectedIdea.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {new Date(selectedIdea.createdAt).toLocaleString(isRtl ? "fa-IR" : "en-US")}
                </DialogDescription>
              </DialogHeader>

              {/* Submitter Info */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="font-bold text-foreground">{selectedIdea.userName}</span>
                </div>
                {selectedIdea.userEmail && (
                  <div className="flex items-center gap-1 text-muted-foreground font-mono">
                    <Mail className="size-3.5" />
                    <span>{selectedIdea.userEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{isRtl ? "ماژول هدف:" : "Target Module:"}</span>
                  <span className="font-mono uppercase font-bold text-primary">{selectedIdea.moduleId}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-muted-foreground">{isRtl ? "شرح کامل ایده / پیشنهاد:" : "Idea Description:"}</h4>
                <div className="p-4 rounded-xl bg-background border border-border/80 text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-sans">
                  {selectedIdea.description}
                </div>
              </div>

              {/* Expected Benefit */}
              {selectedIdea.expectedBenefit && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-muted-foreground">{isRtl ? "مزایا و فایده مورد انتظار:" : "Expected Benefit:"}</h4>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
                    {selectedIdea.expectedBenefit}
                  </div>
                </div>
              )}

              {/* Status Update Quick Buttons */}
              <div className="border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  {isRtl ? "بروزرسانی وضعیت ایده:" : "Update Idea Status:"}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedIdea.status === "Proposed" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedIdea.id, "Proposed")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg cursor-pointer"
                  >
                    {isRtl ? "پیشنهاد اولیه" : "Proposed"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedIdea.status === "Under Review" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedIdea.id, "Under Review")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg text-sky-600 cursor-pointer"
                  >
                    {isRtl ? "در حال بررسی" : "Reviewing"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedIdea.status === "Approved" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedIdea.id, "Approved")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg text-primary cursor-pointer"
                  >
                    {isRtl ? "تأیید شد" : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedIdea.status === "Implemented" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedIdea.id, "Implemented")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg text-emerald-600 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5 me-1" />
                    {isRtl ? "پیاده‌سازی شد" : "Implemented"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedIdea.status === "Rejected" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedIdea.id, "Rejected")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg text-destructive cursor-pointer"
                  >
                    {isRtl ? "رد شد" : "Reject"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

