// src/modules/quality-guardian/components/GuardianViolationsTable.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Wrench,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import type {
  QualityViolation,
  ViolationCategory,
  ViolationSeverity,
  ViolationStatus,
} from "../types/guardian.types";

interface GuardianViolationsTableProps {
  violations: QualityViolation[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onFilterChange: (filters: {
    category?: string;
    severity?: string;
    status?: string;
    search?: string;
  }) => void;
  onInspect: (violation: QualityViolation) => void;
  onPreviewFix: (violation: QualityViolation) => void;
  onIgnore: (violation: QualityViolation) => void;
  onRunScan: (full?: boolean) => void;
  onBatchAutoFix: () => void;
}

export function GuardianViolationsTable({
  violations,
  total,
  page,
  limit,
  loading,
  onPageChange,
  onFilterChange,
  onInspect,
  onPreviewFix,
  onIgnore,
  onRunScan,
  onBatchAutoFix,
}: GuardianViolationsTableProps) {
  const t = useTranslations("QualityGuardian");
  const [searchVal, setSearchVal] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      search: searchVal,
      severity: selectedSeverity,
      category: selectedCategory,
      status: selectedStatus,
    });
  };

  const handleSeverityChange = (val: string) => {
    setSelectedSeverity(val);
    onFilterChange({
      search: searchVal,
      severity: val,
      category: selectedCategory,
      status: selectedStatus,
    });
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    onFilterChange({
      search: searchVal,
      severity: selectedSeverity,
      category: val,
      status: selectedStatus,
    });
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    onFilterChange({
      search: searchVal,
      severity: selectedSeverity,
      category: selectedCategory,
      status: val,
    });
  };

  const renderSeverityBadge = (sev: ViolationSeverity) => {
    switch (sev) {
      case "critical":
        return (
          <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-medium">
            {t("severity.critical")}
          </Badge>
        );
      case "high":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-5 px-1.5 font-medium border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10"
          >
            {t("severity.high")}
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-5 px-1.5 font-medium border-yellow-500/50 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
          >
            {t("severity.medium")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">
            {t("severity.low")}
          </Badge>
        );
    }
  };

  const renderStatusBadge = (status: ViolationStatus) => {
    switch (status) {
      case "resolved":
      case "remediated":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-5 px-1.5 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
          >
            {t("status.resolved")}
          </Badge>
        );
      case "ignored":
        return (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {t("status.ignored")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
            {t("status.pending")}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border shadow-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="ps-8.5 h-9 text-xs"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[110px] h-9 text-xs">
              <SelectValue placeholder={t("filters.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("status.pending")}</SelectItem>
              <SelectItem value="remediated">{t("status.remediated")}</SelectItem>
              <SelectItem value="ignored">{t("status.ignored")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Severity */}
          <Select value={selectedSeverity} onValueChange={handleSeverityChange}>
            <SelectTrigger className="w-[110px] h-9 text-xs">
              <SelectValue placeholder={t("filters.severity")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allSeverities")}</SelectItem>
              <SelectItem value="critical">{t("severity.critical")}</SelectItem>
              <SelectItem value="high">{t("severity.high")}</SelectItem>
              <SelectItem value="medium">{t("severity.medium")}</SelectItem>
              <SelectItem value="low">{t("severity.low")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Category */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder={t("filters.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
              <SelectItem value="non_standard_ui">{t("categories.non_standard_ui")}</SelectItem>
              <SelectItem value="hardcoded_text">{t("categories.hardcoded_text")}</SelectItem>
              <SelectItem value="rtl_ltr_inconsistency">{t("categories.rtl_ltr_inconsistency")}</SelectItem>
              <SelectItem value="i18n_missing_en">{t("categories.i18n_missing_en")}</SelectItem>
              <SelectItem value="i18n_missing_fa">{t("categories.i18n_missing_fa")}</SelectItem>
              <SelectItem value="inconsistent_design_system">{t("categories.inconsistent_design_system")}</SelectItem>
              <SelectItem value="accessibility">{t("categories.accessibility")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Action buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRunScan(false)}
            disabled={loading}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("actions.scan")}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onBatchAutoFix}
            disabled={loading}
            className="h-9 text-xs gap-1.5"
          >
            <Sparkles className="size-3.5" />
            {t("actions.autoFixSafe")}
          </Button>
        </div>
      </div>

      {/* Violations Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[90px]">{t("table.severity")}</TableHead>
              <TableHead className="w-[130px]">{t("table.rule")}</TableHead>
              <TableHead className="w-[220px]">{t("table.file")}</TableHead>
              <TableHead>{t("table.description")}</TableHead>
              <TableHead className="w-[90px] text-center">{t("table.status")}</TableHead>
              <TableHead className="w-[130px] text-end">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                  {t("table.loading")}
                </TableCell>
              </TableRow>
            ) : violations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-2" />
                  {t("table.noViolationsFound")}
                </TableCell>
              </TableRow>
            ) : (
              violations.map((violation) => (
                <TableRow key={violation.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>{renderSeverityBadge(violation.severity)}</TableCell>
                  <TableCell>
                    <span className="text-[11px] font-mono text-muted-foreground block truncate">
                      {violation.ruleId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs font-mono max-w-[210px] truncate" title={violation.filePath}>
                      <span className="truncate text-foreground font-semibold">
                        {violation.filePath.split("/").pop()}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {violation.filePath}:{violation.line}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 max-w-[420px]">
                      <span className="text-xs font-medium text-foreground truncate">
                        {violation.title}
                      </span>
                      {violation.codeSnippet && (
                        <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-xs truncate max-w-fit dir-ltr text-start">
                          {violation.codeSnippet}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{renderStatusBadge(violation.status)}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        title={t("actions.inspect")}
                        onClick={() => onInspect(violation)}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      {violation.canAutoRemediate && violation.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-primary hover:text-primary"
                          title={t("actions.previewFix")}
                          onClick={() => onPreviewFix(violation)}
                        >
                          <Wrench className="size-3.5" />
                        </Button>
                      )}
                      {violation.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title={t("actions.ignore")}
                          onClick={() => onIgnore(violation)}
                        >
                          <EyeOff className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t text-xs text-muted-foreground">
          <div>
            {t("table.totalRecords", { count: total })}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="me-2">
              {t("table.pageOf", { page, totalPages })}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronRight className="size-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

