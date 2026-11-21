// src/modules/admin/components/AdminPersonnelImportModal.tsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  UserCheck,
  UserPlus,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services";
import type { User } from "../types/admin.types";
import {
  parsePersonnelFile,
  downloadPersonnelTemplate,
} from "../utils/personnel-excel";

interface AdminPersonnelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUsers: User[];
  onImportSuccess: (updatedUsers: User[]) => void;
}

export function AdminPersonnelImportModal({
  isOpen,
  onClose,
  existingUsers,
  onImportSuccess,
}: AdminPersonnelImportModalProps) {
  const t = useTranslations("Admin");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<Partial<User>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Reset state on close
  const handleClose = () => {
    if (isSaving) return;
    setSelectedFile(null);
    setParsedUsers([]);
    setParseErrors([]);
    setSearchQuery("");
    setIsParsing(false);
    onClose();
  };

  // Analyze records against existing users
  const analysis = useMemo(() => {
    let updateCount = 0;
    let createCount = 0;

    const classified = parsedUsers.map((item) => {
      const email = (item.email || "").trim().toLowerCase();
      const uId = (item.id || "").trim();
      const natId = String(item.nationalId || "").trim();
      const empId = String(item.personnelCode || item.employeeId || "").trim();

      const existingMatch = existingUsers.find((u) => {
        if (uId && u.id === uId) return true;
        if (email && (u.email || "").trim().toLowerCase() === email) return true;
        if (natId && String(u.nationalId || "").trim() === natId) return true;
        if (empId && String(u.personnelCode || u.employeeId || "").trim() === empId) return true;
        return false;
      });

      const isUpdate = Boolean(existingMatch);
      if (isUpdate) updateCount++;
      else createCount++;

      return {
        item,
        isUpdate,
        existingUser: existingMatch,
      };
    });

    return {
      total: parsedUsers.length,
      updateCount,
      createCount,
      classified,
    };
  }, [parsedUsers, existingUsers]);

  // Filtered rows in review table
  const filteredClassified = useMemo(() => {
    if (!searchQuery.trim()) return analysis.classified;
    const q = searchQuery.trim().toLowerCase();
    return analysis.classified.filter(({ item }) => {
      const name = (item.fullNameFa || item.name || item.fullName || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      const natId = String(item.nationalId || "");
      const dept = (item.department || "").toLowerCase();
      const job = (item.jobTitle || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        natId.includes(q) ||
        dept.includes(q) ||
        job.includes(q)
      );
    });
  }, [analysis.classified, searchQuery]);

  const handleProcessFile = async (file: File) => {
    setIsParsing(true);
    setParseErrors([]);
    try {
      const res = await parsePersonnelFile(file);
      if (res.errors.length > 0) {
        setParseErrors(res.errors);
        toast.error(res.errors[0] || t("importError"));
      }
      if (res.users.length === 0) {
        toast.warning("هیچ رکوردی در فایل جهت ایمپورت تشخیص داده نشد.");
      } else {
        setSelectedFile(file);
        setParsedUsers(res.users);
      }
    } catch (err: any) {
      const msg = err?.message || t("importError");
      setParseErrors([msg]);
      toast.error(msg);
    } finally {
      setIsParsing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input value so re-uploading same file triggers event
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedUsers.length === 0) return;
    setIsSaving(true);
    try {
      const result = await api.admin.importUsers(parsedUsers);
      toast.success(
        t("importSuccess", { count: result.total || parsedUsers.length })
      );
      onImportSuccess(result.users);
      handleClose();
    } catch (err: any) {
      console.error("Import personnel failed:", err);
      toast.error(err?.message || t("importError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl animate-in fade-in duration-150"
        showCloseButton={!isSaving}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Upload className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                {t("importModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("importModalSubtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Step 1: Upload Dropzone if no file selected or want to change */}
          {parsedUsers.length === 0 ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.json"
                className="hidden"
                onChange={onFileInputChange}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer select-none text-center ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-border/70 hover:border-primary/50 hover:bg-muted/30 bg-card/60"
                }`}
              >
                <div className="size-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20 shadow-xs">
                  {isParsing ? (
                    <Loader2 className="size-8 animate-spin" />
                  ) : (
                    <Upload className="size-8" />
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
                  {t("importDropzoneTitle")}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mb-4">
                  {t("importDropzoneHint")}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="outline" className="gap-1.5 text-xs py-1 px-2.5 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    <FileSpreadsheet className="size-3.5" />
                    <span>Excel (.xlsx, .xls)</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 text-xs py-1 px-2.5 rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5">
                    <FileJson className="size-3.5" />
                    <span>JSON (.json)</span>
                  </Badge>
                </div>
              </div>

              {parseErrors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{parseErrors.join(" | ")}</span>
                </div>
              )}

              {/* Template Download Hint */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Sparkles className="size-4 text-primary shrink-0" />
                  <span>آیا به الگوی پیش‌فرض ستون‌ها نیاز دارید؟</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadPersonnelTemplate}
                  className="rounded-xl h-8 px-3 text-xs gap-1.5 border-border/60"
                >
                  <Download className="size-3.5" />
                  <span>{t("downloadExcelTemplate")}</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Review & Comparison */
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-card border border-border/50 shadow-xs flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {t("importSummaryTotal")}
                    </span>
                    <span className="text-base font-bold text-foreground fa-num">
                      {analysis.total} رکورد
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border/50 shadow-xs flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <UserCheck className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {t("importSummaryUpdates")}
                    </span>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400 fa-num">
                      {analysis.updateCount} پرسنل
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border/50 shadow-xs flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <UserPlus className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {t("importSummaryCreates")}
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 fa-num">
                      {analysis.createCount} کاربر جدید
                    </span>
                  </div>
                </div>
              </div>

              {/* Toolbar & Search within imported list */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="جستجو در رکوردهای خوانده‌شده..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8.5 text-xs ps-8.5 rounded-xl bg-muted/40 border-border/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {selectedFile?.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setParsedUsers([]);
                      setSearchQuery("");
                    }}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-xl"
                  >
                    <RotateCcw className="size-3" />
                    <span>تغییر فایل</span>
                  </Button>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/60 shadow-xs">
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-xs text-start border-collapse">
                    <thead className="bg-muted/70 sticky top-0 z-10 backdrop-blur-md border-b border-border/40 text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-start">عملیات</th>
                        <th className="py-2.5 px-3 text-start">نام و نام خانوادگی</th>
                        <th className="py-2.5 px-3 text-start">ایمیل سازمانی</th>
                        <th className="py-2.5 px-3 text-start">کد ملی</th>
                        <th className="py-2.5 px-3 text-start">سمت و دپارتمان</th>
                        <th className="py-2.5 px-3 text-start">کد پرسنلی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredClassified.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            موردی مطابق با جستجو یافت نشد.
                          </td>
                        </tr>
                      ) : (
                        filteredClassified.map(({ item, isUpdate }, i) => (
                          <tr
                            key={i}
                            className="hover:bg-muted/30 transition-colors fa-num"
                          >
                            <td className="py-2 px-3">
                              {isUpdate ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5 rounded-lg border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold"
                                >
                                  {t("importActionUpdate")}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5 rounded-lg border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-semibold"
                                >
                                  {t("importActionCreate")}
                                </Badge>
                              )}
                            </td>
                            <td className="py-2 px-3 font-semibold text-foreground">
                              {item.fullNameFa || item.name || item.fullName || "—"}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground font-mono text-[11px]">
                              {item.email || "—"}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">
                              {item.nationalId || "—"}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">
                              {item.jobTitle || item.department
                                ? `${item.jobTitle || ""} ${item.department ? `(${item.department})` : ""}`
                                : "—"}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">
                              {item.personnelCode || item.employeeId || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-3.5 border-t border-border/40 bg-muted/15 flex items-center justify-between sm:justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-xl h-9 text-xs"
          >
            {t("cancel")}
          </Button>

          {parsedUsers.length > 0 && (
            <Button
              type="button"
              variant="default"
              onClick={handleConfirmImport}
              disabled={isSaving || parsedUsers.length === 0}
              className="rounded-xl h-9 px-4 text-xs font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t("importSaving")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>{t("confirmAndSaveToDb")}</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
