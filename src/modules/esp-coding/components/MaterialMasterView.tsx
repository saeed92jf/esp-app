"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Database,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EspCodingClientService } from "../services/esp-coding.service";
import { MaterialMasterRecord } from "../types";

export function MaterialMasterView() {
  const t = useTranslations("espCoding.materials");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [materials, setMaterials] = useState<MaterialMasterRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [search, setSearch] = useState(initialQuery);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialMasterRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async (currPage = 0, q = "") => {
    try {
      setLoading(true);
      const res = await EspCodingClientService.getMaterials({
        search: q,
        limit: pageSize,
        offset: currPage * pageSize,
      });
      setMaterials(res.items);
      setTotal(res.total);
      setPage(currPage);
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(0, initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMaterials(0, search);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Database className="size-5 text-emerald-500" />
            <span>{t("title")}</span>
          </h1>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Badge variant="outline" className="px-3 py-1 font-mono text-xs w-fit">
          {total.toLocaleString(isRtl ? "fa-IR" : "en-US")} {isRtl ? "قلم متریال" : "Materials"}
        </Badge>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9 pe-4 h-10 bg-background border-border/60 rounded-xl text-xs sm:text-sm"
          />
        </div>
        <Button type="submit" size="sm" className="h-10 px-4 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer">
          <Search className="size-3.5" />
          <span>{isRtl ? "جستجو" : "Search"}</span>
        </Button>
      </form>

      {/* Paginated Material Table */}
      <Card className="rounded-2xl border-border/50 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-bold w-12 text-center">#</TableHead>
                <TableHead className="text-xs font-bold">{t("specCol")}</TableHead>
                <TableHead className="text-xs font-bold">{t("gradeCol")}</TableHead>
                <TableHead className="text-xs font-bold">{t("classCol")}</TableHead>
                <TableHead className="text-xs font-bold">{t("unsCol")}</TableHead>
                <TableHead className="text-xs font-bold">{t("formCol")}</TableHead>
                <TableHead className="text-xs font-bold fa-num">{t("densityCol")}</TableHead>
                <TableHead className="text-xs font-bold fa-num">{t("tensileCol")}</TableHead>
                <TableHead className="text-xs font-bold fa-num">{t("yieldCol")}</TableHead>
                <TableHead className="text-xs font-bold text-center w-20">{t("actionsCol")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                    {isRtl ? "در حال بارگذاری اطلاعات..." : "Loading materials..."}
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                    {isRtl ? "هیچ متریالی با این مشخصات یافت نشد." : "No materials found."}
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m, idx) => (
                  <TableRow key={m.matId} className="hover:bg-muted/30 transition-colors text-xs">
                    <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                      {page * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-bold text-foreground font-mono">
                      {m.spec}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {m.grade}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {m.classVal || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-primary font-bold">
                      {m.uns}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.form}
                    </TableCell>
                    <TableCell className="font-mono fa-num text-foreground">
                      {m.density || "—"}
                    </TableCell>
                    <TableCell className="font-mono fa-num text-foreground">
                      {m.tensileMpa || "—"}
                    </TableCell>
                    <TableCell className="font-mono fa-num text-foreground">
                      {m.yieldMpa || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMaterial(m)}
                        className="size-7 p-0 rounded-lg text-muted-foreground hover:text-primary cursor-pointer"
                        title={t("viewDetails")}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-3 border-t border-border/30 bg-muted/20 text-xs">
          <span className="text-muted-foreground">
            {isRtl ? "صفحه" : "Page"} {page + 1} {isRtl ? "از" : "of"} {Math.max(1, totalPages)}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => fetchMaterials(page - 1, search)}
              className="size-8 p-0 rounded-lg"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => fetchMaterials(page + 1, search)}
              className="size-8 p-0 rounded-lg"
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Material Detail Modal for All 165 Properties */}
      <Dialog open={!!selectedMaterial} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
        <DialogContent className="max-w-5xl sm:max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8">
          <DialogHeader className="border-b border-border/40 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <DialogTitle className="text-lg font-bold flex items-center gap-2.5">
                <Database className="size-5 text-emerald-500 shrink-0" />
                <span>{selectedMaterial?.spec}</span>
                {selectedMaterial?.grade && (
                  <Badge variant="secondary" className="font-semibold text-xs">
                    Grade: {selectedMaterial?.grade}
                  </Badge>
                )}
                {selectedMaterial?.classVal && (
                  <Badge variant="outline" className="text-xs">
                    Class: {selectedMaterial?.classVal}
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {selectedMaterial?.uns && (
                  <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
                    UNS: {selectedMaterial?.uns}
                  </Badge>
                )}
                {selectedMaterial?.groupMat && (
                  <Badge variant="outline" className="text-xs px-2.5 py-1 bg-primary/5 text-primary border-primary/20">
                    {selectedMaterial?.groupMat}
                  </Badge>
                )}
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5">
              Standard Group: {selectedMaterial?.standardGroup || "—"} • Form: {selectedMaterial?.form || "—"}
            </DialogDescription>
          </DialogHeader>

          {selectedMaterial && (
            <div className="flex flex-col gap-6 pt-4">
              {/* Mechanical & Strength Properties */}
              <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 flex flex-col gap-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-500" />
                  <span>{isRtl ? "مشخصات مکانیکی، کششی و فیزیکی" : "Mechanical, Tensile & Physical Properties"}</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "استحکام کششی (Tensile)" : "Tensile Strength:"}</span>
                    <span className="font-mono font-bold text-sm text-foreground">{selectedMaterial.tensileMpa ? `${selectedMaterial.tensileMpa} MPa` : "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "تنش تسلیم (Yield)" : "Yield Strength:"}</span>
                    <span className="font-mono font-bold text-sm text-foreground">{selectedMaterial.yieldMpa ? `${selectedMaterial.yieldMpa} MPa` : "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "چگالی (Density)" : "Density:"}</span>
                    <span className="font-mono font-bold text-sm text-foreground">{selectedMaterial.density ? `${selectedMaterial.density} kg/m³` : "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "ضریب پواسون" : "Poisson's Ratio:"}</span>
                    <span className="font-mono font-bold text-sm text-foreground">{selectedMaterial.poissonsRatio || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "مدول الاستیسیته" : "Elastic Modulus:"}</span>
                    <span className="font-mono font-bold text-xs text-foreground">{selectedMaterial.elasticModulus || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">PREN:</span>
                    <span className="font-mono font-bold text-xs text-foreground">{selectedMaterial.pren || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "کربن معادل (CE)" : "Carbon Equiv:"}</span>
                    <span className="font-mono font-bold text-xs text-foreground">{selectedMaterial.carbonEquivalent || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "نقطه ذوب" : "Melting Point:"}</span>
                    <span className="font-mono font-bold text-xs text-foreground">{selectedMaterial.meltingPoint || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Fabrication, Standards & Welding Metallurgy */}
              <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 flex flex-col gap-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-violet-500" />
                  <span>{isRtl ? "استانداردها، جوشکاری و متالورژی" : "Welding, Fabrication & Metallurgy"}</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">P-Number Ref:</span>
                    <span className="font-mono text-foreground font-bold">{selectedMaterial.pNoRef || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">A-Number:</span>
                    <span className="font-mono text-foreground font-bold">{selectedMaterial.aNo || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">ISO 15608:</span>
                    <span className="font-mono text-foreground font-bold">{selectedMaterial.iso15608 || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">DIN Name:</span>
                    <span className="font-mono text-foreground font-bold">{selectedMaterial.dinName || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">DIN Number:</span>
                    <span className="font-mono text-foreground">{selectedMaterial.dinNumber || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium">PWHT:</span>
                    <span className="font-mono text-foreground">{selectedMaterial.pwht || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40 flex flex-col gap-1 sm:col-span-2">
                    <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "ترکیب اسمی (Nominal Composition)" : "Nominal Composition:"}</span>
                    <span className="font-mono text-foreground font-bold">{selectedMaterial.nominalComposition || "—"}</span>
                  </div>
                </div>
              </div>

              {/* All 165 Raw Master Data Properties Grid */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span>{t("rawProperties")} ({Object.keys(selectedMaterial.rawProperties || {}).length} {isRtl ? "ویژگی کامل دیتابیس" : "total attributes"})</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {isRtl ? "برگرفته از شیت TBL_Material_New" : "Source: TBL_Material_New"}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto p-4 rounded-xl bg-background border border-border/60 font-mono text-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(selectedMaterial.rawProperties || {}).map(([key, val]) => (
                    <div key={key} className="p-2 rounded-lg bg-muted/20 border border-border/30 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] text-muted-foreground font-medium truncate" title={key}>
                        {key}
                      </span>
                      <span className="font-semibold text-foreground text-xs break-all" title={String(val)}>
                        {val ? String(val) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
