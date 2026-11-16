"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
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
import { cn } from "@/lib/utils";
import { EspCodingClientService } from "../services/esp-coding.service";
import { MaterialMasterRecord } from "../types";

interface FormPreviewBlock {
  key: string;
  labelFa: string;
  labelEn: string;
  filterValue: string;
  pic: string;
}

const PREVIEW_BLOCKS: FormPreviewBlock[] = [
  {
    key: "Plate",
    labelFa: "ورق و پلیت",
    labelEn: "Plates & Sheets",
    filterValue: "Plate",
    pic: "/coding-docs/Production Form/Plate2.png",
  },
  {
    key: "Pipe",
    labelFa: "لوله صنعتی",
    labelEn: "Pipes (Welded & Smls)",
    filterValue: "Pipe",
    pic: "/coding-docs/Production Form/Pipe Seamless.png",
  },
  {
    key: "Tube",
    labelFa: "تیوب مبدل و کوره",
    labelEn: "Heat Exchanger Tubes",
    filterValue: "Tube",
    pic: "/coding-docs/Production Form/Tube Seamless1.png",
  },
  {
    key: "Forgings",
    labelFa: "قطعات فورج و رینگ",
    labelEn: "Forgings & Flanges",
    filterValue: "Forging",
    pic: "/coding-docs/Production Form/ForgedRing.png",
  },
  {
    key: "Fittings",
    labelFa: "فیتینگ و اتصالات",
    labelEn: "Fittings & Couplings",
    filterValue: "Fitting",
    pic: "/coding-docs/Production Form/Coupling.png",
  },
  {
    key: "Bolting",
    labelFa: "پیچ، مهره و استاد",
    labelEn: "Bolting & Studs",
    filterValue: "Bolt",
    pic: "/coding-docs/Production Form/Full Threaded (DIN 933).png",
  },
  {
    key: "Castings",
    labelFa: "ریخته‌گری و بدنه",
    labelEn: "Castings & Bodies",
    filterValue: "Casting",
    pic: "/coding-docs/Production Form/Casting Flange.png",
  },
  {
    key: "Bars",
    labelFa: "تسمه و مقاطع",
    labelEn: "Bars & Shapes",
    filterValue: "Bar",
    pic: "/coding-docs/Production Form/Bar.png",
  },
];

export function MaterialMasterView() {
  const t = useTranslations("espCoding.materials");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [materials, setMaterials] = useState<MaterialMasterRecord[]>([]);
  const [allComboMaterials, setAllComboMaterials] = useState<MaterialMasterRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [search, setSearch] = useState(initialQuery);
  const [activeFormFilter, setActiveFormFilter] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialMasterRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Load combobox options on mount
  useEffect(() => {
    async function loadAllOptions() {
      try {
        const res = await EspCodingClientService.getMaterials({ limit: 1400 });
        setAllComboMaterials(res.items);
      } catch (err) {
        console.error("Failed to load all material options:", err);
      }
    }
    loadAllOptions();
  }, []);

  const comboboxOptions: ComboboxOption[] = useMemo(() => {
    const map = new Map<string, ComboboxOption>();
    allComboMaterials.forEach((m) => {
      const label = `${m.spec}${m.grade ? ` - ${m.grade}` : ""}`;
      const searchTerms = [m.spec, m.grade, m.uns, m.groupMat, m.form].filter(Boolean);
      if (!map.has(label)) {
        map.set(label, {
          value: m.spec + (m.grade ? ` ${m.grade}` : ""),
          label: label,
          hint: `${m.form || "—"}${m.uns ? ` • UNS: ${m.uns}` : ""}`,
          searchTerms: searchTerms,
        });
      }
    });
    return Array.from(map.values());
  }, [allComboMaterials]);

  const fetchMaterials = async (currPage = 0, q = "", formFilter = activeFormFilter) => {
    try {
      setLoading(true);
      const res = await EspCodingClientService.getMaterials({
        search: q,
        form: formFilter || undefined,
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
    fetchMaterials(0, initialQuery, activeFormFilter);
  }, [initialQuery]);

  const handleSelectFormBlock = (filterVal: string) => {
    const nextVal = activeFormFilter === filterVal ? "" : filterVal;
    setActiveFormFilter(nextVal);
    fetchMaterials(0, search, nextVal);
  };

  const handleComboboxSelect = (val: string) => {
    setSearch(val);
    fetchMaterials(0, val, activeFormFilter);
  };

  const handleResetFilters = () => {
    setSearch("");
    setActiveFormFilter("");
    fetchMaterials(0, "", "");
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

        <div className="flex items-center gap-2">
          {(search || activeFormFilter) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>{isRtl ? "پاکسازی فیلترها" : "Clear Filters"}</span>
            </Button>
          )}
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs w-fit">
            {total.toLocaleString(isRtl ? "fa-IR" : "en-US")} {isRtl ? "قلم متریال" : "Materials"}
          </Badge>
        </div>
      </div>

      {/* Visual Form Preview Blocks Carousel / Grid */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon className="size-4 text-emerald-500" />
            <span>{isRtl ? "بلوک‌های پریویو فرم متریال (کلیک برای فیلتر سریع)" : "Material Form Preview Blocks (Click to Filter)"}</span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {activeFormFilter ? `${isRtl ? "فیلتر فعال:" : "Active:"} ${activeFormFilter}` : isRtl ? "همه فرم‌ها" : "All forms"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {PREVIEW_BLOCKS.map((block) => {
            const isSelected = activeFormFilter === block.filterValue;
            return (
              <button
                key={block.key}
                type="button"
                onClick={() => handleSelectFormBlock(block.filterValue)}
                className={cn(
                  "flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all text-center group cursor-pointer relative overflow-hidden",
                  isSelected
                    ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                    : "bg-card border-border/60 hover:border-primary/40 hover:bg-muted/30 shadow-2xs"
                )}
              >
                <div className="relative size-12 rounded-lg bg-muted/40 p-1 flex items-center justify-center overflow-hidden border border-border/40 group-hover:scale-105 transition-transform">
                  <img
                    src={block.pic}
                    alt={block.labelEn}
                    className="size-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col min-w-0 w-full">
                  <span
                    className={cn(
                      "text-[11px] font-bold truncate leading-tight transition-colors",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {isRtl ? block.labelFa : block.labelEn}
                  </span>
                  <span className="text-[9px] text-muted-foreground truncate mt-0.5 font-mono">
                    {block.filterValue}
                  </span>
                </div>
                {isSelected && (
                  <span className="absolute top-1 end-1 size-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter / Search Bar with Combobox Autocomplete & Highlight */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        <div className="flex-1">
          <Combobox
            options={comboboxOptions}
            value={search}
            onChange={handleComboboxSelect}
            placeholder={isRtl ? "جستجو و انتخاب متریال (کد استاندارد، گرید، UNS یا فرم)..." : "Search & Select Material (Spec, Grade, UNS, Form)..."}
            searchPlaceholder={isRtl ? "عبارت مورد نظر را تایپ کنید..." : "Type spec or grade to search..."}
            emptyText={isRtl ? "متریالی یافت نشد." : "No materials found."}
            allowClear={true}
            className="w-full"
            triggerClassName="h-11 rounded-xl text-xs sm:text-sm bg-background border-border/60 shadow-2xs"
            renderTrigger={(selected) => (
              <div className="flex items-center gap-2.5 min-w-0 flex-1 text-start">
                <Search className="size-4 text-muted-foreground shrink-0" />
                {selected ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-foreground font-mono">
                      <HighlightMatch text={selected.label} query={search} />
                    </span>
                    {selected.hint && (
                      <span className="text-xs text-muted-foreground truncate">
                        ({selected.hint})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    {search || (isRtl ? "جستجو و انتخاب هوشمند متریال..." : "Search & Select Material...")}
                  </span>
                )}
              </div>
            )}
          />
        </div>

        {search && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleComboboxSelect("")}
            className="h-11 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <X className="size-4 me-1" />
            <span>{isRtl ? "حذف سرچ" : "Clear"}</span>
          </Button>
        )}
      </div>

      {/* Paginated Material Table */}
      <Card className="rounded-2xl border-border/50 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-bold w-12 text-center">#</TableHead>
                <TableHead className="text-xs font-bold w-14 text-center">{isRtl ? "طرح/فرم" : "Form"}</TableHead>
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
                  <TableCell colSpan={11} className="h-32 text-center text-xs text-muted-foreground">
                    {isRtl ? "در حال بارگذاری اطلاعات..." : "Loading materials..."}
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center text-xs text-muted-foreground">
                    {isRtl ? "هیچ متریالی با این مشخصات یافت نشد." : "No materials found."}
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m, idx) => (
                  <TableRow key={m.matId} className="hover:bg-muted/30 transition-colors text-xs">
                    <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                      {page * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="text-center p-1.5">
                      {m.pic ? (
                        <div
                          className="size-8 rounded-md bg-muted/40 p-0.5 border border-border/40 mx-auto flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedMaterial(m)}
                          title={isRtl ? "مشاهده جزئیات و نقشه" : "View Details & Form"}
                        >
                          <img
                            src={m.pic}
                            alt={m.form}
                            className="size-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-foreground font-mono">
                      <HighlightMatch text={m.spec} query={search} />
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      <HighlightMatch text={m.grade} query={search} />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {m.classVal || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-primary font-bold">
                      <HighlightMatch text={m.uns} query={search} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <HighlightMatch text={m.form} query={search} />
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
              onClick={() => fetchMaterials(page - 1, search, activeFormFilter)}
              className="size-8 p-0 rounded-lg"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => fetchMaterials(page + 1, search, activeFormFilter)}
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
              {/* Material Form Visual Header if Image Attached */}
              {selectedMaterial.pic && (
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col sm:flex-row items-center gap-4">
                  <div className="size-24 rounded-xl bg-background border border-border/60 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <img
                      src={selectedMaterial.pic}
                      alt={selectedMaterial.form || "Material Form"}
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 text-center sm:text-start">
                    <span className="text-xs font-bold text-foreground">
                      {isRtl ? "طرح و استاندارد فیزیکی فرم متریال" : "Material Standard Form & Physical Profile"}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {selectedMaterial.form}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {isRtl
                        ? "تصویر مرجع استاندارد متناظر از بانک اطلاعات کاتالوگ مهندسی"
                        : "Authoritative engineering visual reference from master catalog"}
                    </span>
                  </div>
                </div>
              )}

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
