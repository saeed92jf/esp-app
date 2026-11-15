// src/modules/bug-reports/components/SupportRequestsList.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Search,
  Headset,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink,
  Mail,
  User,
  Layers,
  Paperclip,
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
import type { SupportRequest } from "../types";

interface SupportRequestsListProps {
  requests: SupportRequest[];
  onRefresh: () => void;
}

export function SupportRequestsList({
  requests,
  onRefresh,
}: SupportRequestsListProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = useMemo<ComboboxOption[]>(() => [
    { value: "all", label: isRtl ? "همه وضعیت‌ها" : "All Statuses" },
    { value: "Open", label: isRtl ? "باز" : "Open" },
    { value: "In Progress", label: isRtl ? "در حال پیگیری" : "In Progress" },
    { value: "Resolved", label: isRtl ? "پاسخ‌داده / رفع‌شده" : "Resolved" },
    { value: "Closed", label: isRtl ? "بسته‌شده" : "Closed" },
  ], [isRtl]);

  const priorityOptions = useMemo<ComboboxOption[]>(() => [
    { value: "all", label: isRtl ? "همه اولویت‌ها" : "All Priorities" },
    { value: "Urgent", label: isRtl ? "فوری" : "Urgent" },
    { value: "High", label: isRtl ? "بالا" : "High" },
    { value: "Medium", label: isRtl ? "متوسط" : "Medium" },
    { value: "Low", label: isRtl ? "پایین" : "Low" },
  ], [isRtl]);

  const filteredRequests = useMemo(() => {
    let list = requests;
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (priorityFilter !== "all") {
      list = list.filter((r) => r.priority.toLowerCase() === priorityFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.ticketNumber.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          (r.userEmail && r.userEmail.toLowerCase().includes(q))
      );
    }
    return list;
  }, [requests, statusFilter, priorityFilter, search]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await bugReportsService.updateSupportRequestStatus(id, newStatus);
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      onRefresh();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "آیا از حذف این درخواست پشتیبانی اطمینان دارید؟" : "Are you sure you want to delete this request?")) {
      return;
    }
    try {
      await bugReportsService.deleteSupportRequest(id);
      if (selectedRequest?.id === id) setSelectedRequest(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete request", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(isRtl ? `آیا از حذف تمام ${requests.length} درخواست پشتیبانی اطمینان دارید؟ این عملیات قابل بازگشت نیست.` : `Are you sure you want to delete all ${requests.length} support requests?`)) {
      return;
    }
    try {
      await bugReportsService.deleteAllSupportRequests();
      if (selectedRequest) setSelectedRequest(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete all support requests", err);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Search & Filter Header */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={
                isRtl
                  ? "جستجو در شماره تیکت، موضوع، کاربر یا متن درخواست..."
                  : "Search ticket, subject, user or request details..."
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
              className="h-10 min-w-[140px] rounded-xl bg-background border-border/80 text-xs font-medium"
            />

            <Combobox
              options={priorityOptions}
              value={priorityFilter}
              onChange={(val) => setPriorityFilter(val || "all")}
              size="sm"
              className="h-10 min-w-[130px] rounded-xl bg-background border-border/80 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Counter Info & Bulk Delete */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {isRtl
            ? `نمایش ${filteredRequests.length} مورد از مجموع ${requests.length} درخواست پشتیبانی`
            : `Showing ${filteredRequests.length} of ${requests.length} support requests`}
        </span>

        {requests.length > 0 && (
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

      {/* Table of Support Requests */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "شماره تیکت" : "Ticket"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "موضوع درخواست" : "Subject"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "دسته‌بندی" : "Category"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "ماژول" : "Module"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "اولویت" : "Priority"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "وضعیت" : "Status"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "درخواست‌دهنده" : "Requester"}</th>
                <th className="py-3 px-4 text-start font-bold">{isRtl ? "تاریخ ثبت" : "Date"}</th>
                <th className="py-3 px-4 text-center font-bold">{isRtl ? "عملیات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Headset className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                    {isRtl ? "هیچ درخواست پشتیبانی یافت نشد." : "No support requests found."}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {req.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors max-w-xs truncate">
                      {req.subject}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {req.category}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground uppercase text-[11px] font-mono whitespace-nowrap">
                      {req.moduleId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                          req.priority === "Urgent"
                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                            : req.priority === "High"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-muted text-muted-foreground border-border/60"
                        )}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                          req.status === "Resolved" || req.status === "Closed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : req.status === "In Progress"
                            ? "bg-sky-500/10 text-sky-600 border-sky-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        )}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground/80 whitespace-nowrap">
                      <div>{req.userName}</div>
                      {req.userEmail && (
                        <div className="text-[10px] text-muted-foreground">{req.userEmail}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}
                    </td>
                    <td
                      className="py-3.5 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(req)}
                          className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(req.id)}
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

      {/* Support Request Detail Dialog */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-w-2xl p-6 rounded-2xl">
          {selectedRequest && (
            <div className="space-y-5">
              <DialogHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg">
                    {selectedRequest.ticketNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                        selectedRequest.priority === "Urgent"
                          ? "bg-red-500/10 text-red-600 border-red-500/30"
                          : selectedRequest.priority === "High"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-muted text-muted-foreground border-border/60"
                      )}
                    >
                      {selectedRequest.priority}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                        selectedRequest.status === "Resolved" || selectedRequest.status === "Closed"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : selectedRequest.status === "In Progress"
                          ? "bg-sky-500/10 text-sky-600 border-sky-500/30"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      )}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground mt-2">
                  {selectedRequest.subject}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {new Date(selectedRequest.createdAt).toLocaleString(isRtl ? "fa-IR" : "en-US")}
                </DialogDescription>
              </DialogHeader>

              {/* Submitter Info Card */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="font-bold text-foreground">{selectedRequest.userName}</span>
                </div>
                {selectedRequest.userEmail && (
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                    <Mail className="size-3.5" />
                    <span>{selectedRequest.userEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{isRtl ? "ماژول:" : "Module:"}</span>
                  <span className="font-mono uppercase font-bold text-primary">{selectedRequest.moduleId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{isRtl ? "دسته:" : "Category:"}</span>
                  <span className="font-medium text-foreground">{selectedRequest.category}</span>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground">
                  {isRtl ? "متن کامل شرح درخواست پشتیبانی:" : "Request Description:"}
                </h4>
                <div className="p-4 rounded-xl bg-background border border-border/80 text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  {isRtl ? "تغییر وضعیت تیکت:" : "Change Status:"}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "Open" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedRequest.id, "Open")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg cursor-pointer"
                  >
                    {isRtl ? "باز" : "Open"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "In Progress" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedRequest.id, "In Progress")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg text-sky-600 cursor-pointer"
                  >
                    {isRtl ? "در حال پیگیری" : "In Progress"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "Resolved" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedRequest.id, "Resolved")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg text-emerald-600 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5 me-1" />
                    {isRtl ? "برطرف شد / پاسخ داده شد" : "Resolved"}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "Closed" ? "secondary" : "outline"}
                    onClick={() => handleUpdateStatus(selectedRequest.id, "Closed")}
                    disabled={isUpdating}
                    className="h-8 text-xs rounded-lg cursor-pointer"
                  >
                    {isRtl ? "بستن تیکت" : "Close"}
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

