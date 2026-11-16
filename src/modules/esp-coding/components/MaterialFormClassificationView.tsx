"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Layers,
  Search,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EspCodingClientService } from "../services/esp-coding.service";
import { MaterialFormRecord } from "../types";

export function MaterialFormClassificationView() {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [forms, setForms] = useState<MaterialFormRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await EspCodingClientService.getMaterialForms();
        setForms(res.forms || []);
      } catch (err) {
        console.error("Failed to load material forms:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = forms.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.generalForm.toLowerCase().includes(q) ||
      f.categoryForm.toLowerCase().includes(q) ||
      f.subForm.toLowerCase().includes(q) ||
      f.materialFormName?.toLowerCase().includes(q) ||
      f.mtoDoc?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in duration-150">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Layers className="size-5 text-violet-500" />
            <span>{isRtl ? "طبقه‌بندی و فرم‌های متریال (MTO & Forms)" : "Material Form Classification"}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {isRtl
              ? "سلسله‌مراتب سه‌سطحی فرم عمومی، گروه و زیرفرم بر اساس TBL_Material_Coding_New"
              : "3-level classification hierarchy: General Form → Category Form → Sub Form"}
          </p>
        </div>

        <Badge variant="outline" className="px-3 py-1 font-mono text-xs w-fit">
          {forms.length} {isRtl ? "رکورد فرم" : "Form Records"}
        </Badge>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            isRtl
              ? "جستجو در فرم‌های عمومی، زیرفرم‌ها یا اسناد MTO..."
              : "Search general forms, sub-forms or MTO documents..."
          }
          className="ps-10 pe-4 h-10 bg-background border-border/60 rounded-xl text-xs sm:text-sm"
        />
      </div>

      {/* Forms Table */}
      <Card className="rounded-2xl border-border/50 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-bold w-12 text-center">ID</TableHead>
                <TableHead className="text-xs font-bold">{isRtl ? "فرم عمومی (General)" : "General Form"}</TableHead>
                <TableHead className="text-xs font-bold">{isRtl ? "دسته‌بندی (Category)" : "Category Form"}</TableHead>
                <TableHead className="text-xs font-bold">{isRtl ? "زیرفرم (Sub Form)" : "Sub Form"}</TableHead>
                <TableHead className="text-xs font-bold">{isRtl ? "کنترل نمایشی" : "View Control"}</TableHead>
                <TableHead className="text-xs font-bold">{isRtl ? "سند MTO" : "MTO Document"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    {isRtl ? "در حال بارگذاری فرم‌ها..." : "Loading forms..."}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    {isRtl ? "هیچ رکوردی یافت نشد." : "No records found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(0, 50).map((f) => (
                  <TableRow key={f.id} className="hover:bg-muted/30 transition-colors text-xs">
                    <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                      {f.id}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {f.generalForm}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {f.categoryForm}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {f.subForm}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {f.materialFormName || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {f.mtoDoc || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
