"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  FileDown,
  ExternalLink,
  Info,
  Atom,
  Flame,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

/**
 * Helper to round all decimal numbers in a text or number to max 3 decimal places
 */
function roundNumbersInText(text: string | number | null | undefined, maxDecimals = 3): string {
  if (text === null || text === undefined) return "—";
  const str = String(text).trim();
  if (!str || str === "—" || str === "--") return "—";

  const num = Number(str);
  if (!isNaN(num) && isFinite(num)) {
    return parseFloat(num.toFixed(maxDecimals)).toString();
  }

  return str.replace(/\b\d+\.\d+\b/g, (match) => {
    const parsed = parseFloat(match);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parseFloat(parsed.toFixed(maxDecimals)).toString();
    }
    return match;
  });
}

/**
 * Resolves a valid public document URL for reference PDFs
 */
function normalizeDocUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str || str === "--" || str === "—") return null;
  if (str.startsWith("/coding-docs/")) return str;

  const normalized = str.replace(/\\/g, "/");
  const m = normalized.match(/Document\/(?:Document\/)?(.+)$/i);
  if (m) {
    return `/coding-docs/${m[1]}`;
  }
  if (normalized.toLowerCase().endsWith(".pdf")) {
    const filename = normalized.split("/").pop();
    return `/coding-docs/Reference Material/${filename}`;
  }
  return null;
}

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
          <Button asChild size="sm" className="h-8 rounded-xl text-xs gap-1.5 font-bold shadow-xs">
            <Link href="/engineering/esp-coding/material-coding">
              <Atom className="size-3.5" />
              <span>{isRtl ? "کدینگ هوشمند متریال" : "Material Coding"}</span>
            </Link>
          </Button>
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

      {/* Material Detail Modal with Categorized Tabs & PDF Document Viewer */}
      <Dialog open={!!selectedMaterial} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
        <DialogContent className="max-w-5xl sm:max-w-5xl w-full max-h-[92vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-background">
          <DialogHeader className="border-b border-border/40 p-5 sm:p-6 pb-4 bg-muted/20 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <DialogTitle className="text-lg font-bold flex items-center gap-2.5">
                <Database className="size-5 text-emerald-500 shrink-0" />
                <span className="tracking-tight">{selectedMaterial?.spec}</span>
                {selectedMaterial?.grade && (
                  <Badge variant="secondary" className="font-semibold text-xs font-mono">
                    Grade: {selectedMaterial?.grade}
                  </Badge>
                )}
                {selectedMaterial?.classVal && (
                  <Badge variant="outline" className="text-xs font-mono">
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
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 flex flex-wrap items-center gap-2">
              <span>Standard Group: <strong className="text-foreground font-medium">{selectedMaterial?.standardGroup || "—"}</strong></span>
              <span>•</span>
              <span>Form: <strong className="text-foreground font-medium">{selectedMaterial?.form || "—"}</strong></span>
              {selectedMaterial?.matId && (
                <>
                  <span>•</span>
                  <span>ID: <code className="font-mono text-xs">{selectedMaterial.matId}</code></span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedMaterial && (() => {
            // Extract all PDF and document links dynamically from rawProperties
            const docEntries: Array<{ title: string; refKey: string; docUrl: string; filename: string }> = [];
            const seenUrls = new Set<string>();

            // Explicit primary references
            if (selectedMaterial.refMaterial) {
              const url = normalizeDocUrl(selectedMaterial.refMaterial);
              if (url && !seenUrls.has(url)) {
                seenUrls.add(url);
                docEntries.push({
                  title: isRtl ? "مستند مشخصات متریال (Ref Material)" : "Material Specification (Ref Material)",
                  refKey: "Ref_Material",
                  docUrl: url,
                  filename: url.split("/").pop() || "Material-Spec.pdf",
                });
              }
            }
            if (selectedMaterial.rawProperties?.Ref_Material2023) {
              const url = normalizeDocUrl(selectedMaterial.rawProperties.Ref_Material2023);
              if (url && !seenUrls.has(url)) {
                seenUrls.add(url);
                docEntries.push({
                  title: isRtl ? "استاندارد مرجع 2023 (Ref Material 2023)" : "2023 Edition Reference (Ref Material 2023)",
                  refKey: "Ref_Material2023",
                  docUrl: url,
                  filename: url.split("/").pop() || "Material-2023.pdf",
                });
              }
            }
            if (selectedMaterial.refHeatTreatment) {
              const url = normalizeDocUrl(selectedMaterial.refHeatTreatment);
              if (url && !seenUrls.has(url)) {
                seenUrls.add(url);
                docEntries.push({
                  title: isRtl ? "دستورالعمل عملیات حرارتی (Heat Treatment)" : "Heat Treatment Procedure",
                  refKey: "Ref_Heat_Treatment",
                  docUrl: url,
                  filename: url.split("/").pop() || "Heat-Treatment.pdf",
                });
              }
            }

            // Inspect all other raw properties for document URLs
            Object.entries(selectedMaterial.rawProperties || {}).forEach(([key, val]) => {
              if (val && typeof val === "string") {
                const url = normalizeDocUrl(val);
                if (url && !seenUrls.has(url)) {
                  seenUrls.add(url);
                  const cleanTitle = key.replace(/_/g, " ").replace(/Ref1?$/, "").trim();
                  docEntries.push({
                    title: cleanTitle ? (cleanTitle + " Reference") : key,
                    refKey: key,
                    docUrl: url,
                    filename: url.split("/").pop() || "Document.pdf",
                  });
                }
              }
            });

            return (
              <Tabs defaultValue="mechanical" className="flex-1 flex flex-col min-h-0">
                <div className="px-5 sm:px-6 pt-3 bg-muted/10 border-b border-border/40 shrink-0">
                  <TabsList className="h-10 bg-muted/50 p-1 rounded-xl gap-1">
                    <TabsTrigger value="mechanical" className="text-xs font-medium rounded-lg gap-1.5">
                      <Sparkles className="size-3.5 text-emerald-500" />
                      <span>{isRtl ? "مکانیکی و فیزیکی" : "Mechanical & Physical"}</span>
                    </TabsTrigger>
                    <TabsTrigger value="metallurgy" className="text-xs font-medium rounded-lg gap-1.5">
                      <Layers className="size-3.5 text-violet-500" />
                      <span>{isRtl ? "جوش و متالورژی" : "Welding & Metallurgy"}</span>
                    </TabsTrigger>
                    <TabsTrigger value="thermal" className="text-xs font-medium rounded-lg gap-1.5">
                      <Flame className="size-3.5 text-amber-500" />
                      <span>{isRtl ? "حرارتی و فرمول‌ها" : "Thermal & Formulas"}</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs font-medium rounded-lg gap-1.5">
                      <FileDown className="size-3.5 text-blue-500" />
                      <span>{isRtl ? "مستندات و PDFها" : "Documents & PDFs"}</span>
                      {docEntries.length > 0 && (
                        <Badge variant="secondary" className="size-4 p-0 flex items-center justify-center text-[10px] rounded-full ms-1">
                          {docEntries.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="allProperties" className="text-xs font-medium rounded-lg gap-1.5">
                      <FileText className="size-3.5 text-primary" />
                      <span>{isRtl ? "کلیه ویژگی‌ها (۱۶۵)" : "All Raw Attributes"}</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Visual Physical Form Card Header */}
                  {selectedMaterial.pic && (
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col sm:flex-row items-center gap-4">
                      <div className="size-20 sm:size-24 rounded-xl bg-background border border-border/60 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={selectedMaterial.pic}
                          alt={selectedMaterial.form || "Material Form"}
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 text-center sm:text-start">
                        <span className="text-xs font-bold text-foreground">
                          {isRtl ? "طرح و فرم فیزیکی متریال" : "Material Standard Form & Physical Profile"}
                        </span>
                        <span className="text-sm font-semibold text-primary font-mono">
                          {selectedMaterial.form}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {isRtl
                            ? "تصویر مرجع کاتالوگ مهندسی و استاندارد مقاطع تولیدی"
                            : "Engineering catalog standard profile reference"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 1: Mechanical & Physical Properties */}
                  <TabsContent value="mechanical" className="mt-0 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "استحکام کششی (Tensile)" : "Tensile Strength:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {selectedMaterial.tensileMpa ? (roundNumbersInText(selectedMaterial.tensileMpa) + " MPa") : "—"}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "تنش تسلیم (Yield)" : "Yield Strength:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {selectedMaterial.yieldMpa ? (roundNumbersInText(selectedMaterial.yieldMpa) + " MPa") : "—"}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "چگالی (Density)" : "Density:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {selectedMaterial.density ? (roundNumbersInText(selectedMaterial.density) + " kg/m³") : "—"}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "ضریب پواسون" : "Poisson's Ratio:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.poissonsRatio)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1 col-span-2">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "مدول الاستیسیته (Elastic Modulus - گرد شده تا ۳ رقم)" : "Elastic Modulus (Rounded to 3 Decimals):"}</span>
                        <span className="font-mono font-bold text-xs text-foreground break-all leading-relaxed">
                          {roundNumbersInText(selectedMaterial.elasticModulus)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">PREN:</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.pren)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "نقطه ذوب" : "Melting Point:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.meltingPoint)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "افزایش طول ۵۰ میلیمتر" : "Elongation (50mm):"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.elongation50)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "افزایش طول ۲۰۰ میلیمتر" : "Elongation (200mm):"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.elongation200)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "تنش مجاز کشش" : "S-Allow Tensile:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.sAllowTensile)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "تنش مجاز تسلیم" : "S-Allow Yield:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.sAllowYield)}
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: Metallurgy, Standards & Welding */}
                  <TabsContent value="metallurgy" className="mt-0 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">P-Number Ref:</span>
                        <span className="font-mono text-foreground font-bold">{selectedMaterial.pNoRef || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">A-Number:</span>
                        <span className="font-mono text-foreground font-bold">{selectedMaterial.aNo || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">ISO 15608:</span>
                        <span className="font-mono text-foreground font-bold">{selectedMaterial.iso15608 || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">DIN Name:</span>
                        <span className="font-mono text-foreground font-bold">{selectedMaterial.dinName || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">DIN Number:</span>
                        <span className="font-mono text-foreground">{selectedMaterial.dinNumber || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">DIN EN Number:</span>
                        <span className="font-mono text-foreground">{selectedMaterial.dinEnNumber || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">PWHT:</span>
                        <span className="font-mono text-foreground">{selectedMaterial.pwht || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "کربن معادل (CE)" : "Carbon Equiv (CE):"}</span>
                        <span className="font-mono text-foreground font-bold">{roundNumbersInText(selectedMaterial.carbonEquivalent)}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1 sm:col-span-4">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "ترکیب اسمی متالورژی (Nominal Composition)" : "Nominal Composition:"}</span>
                        <span className="font-mono text-foreground font-bold text-sm">{selectedMaterial.nominalComposition || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">SMAW Electrode:</span>
                        <span className="font-mono text-foreground">{selectedMaterial.smaw || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">GTAW Wire:</span>
                        <span className="font-mono text-foreground">{selectedMaterial.gtaw || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">GMAW Wire:</span>
                        <span className="font-mono text-foreground">{selectedMaterial.gmaw || "—"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">SAW Flux/Wire:</span>
                        <span className="font-mono text-foreground">{selectedMaterial.saw || "—"}</span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: Thermal & Temperature Dependent Formulas */}
                  <TabsContent value="thermal" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "حداقل دما (Min Temp)" : "Minimum Temperature:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.minTemp)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground font-medium">{isRtl ? "حداکثر دما (Max Temp)" : "Maximum Temperature:"}</span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {roundNumbersInText(selectedMaterial.maxTemp)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1 col-span-1 sm:col-span-2">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {isRtl ? "فرمول انبساط حرارتی (Thermal Expansion Coeff A)" : "Thermal Expansion Coeff (A):"}
                        </span>
                        <span className="font-mono text-xs text-foreground break-all leading-relaxed bg-background p-2.5 rounded-lg border border-border/40 font-semibold">
                          {roundNumbersInText(selectedMaterial.rawProperties?.ThermalExpCoeff_A)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1 col-span-1 sm:col-span-2">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {isRtl ? "فرمول تنش نهایی بر حسب دما (Ultimate Tensile Acc Temp)" : "Ultimate Tensile vs. Temperature Formula:"}
                        </span>
                        <span className="font-mono text-xs text-foreground break-all leading-relaxed bg-background p-2.5 rounded-lg border border-border/40 font-semibold">
                          {roundNumbersInText(selectedMaterial.rawProperties?.Ultimate_Tens_Acc_Temp)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-1 col-span-1 sm:col-span-2">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {isRtl ? "فرمول تنش تسلیم بر حسب دما (Yield Stress Acc Temp)" : "Yield Stress vs. Temperature Formula:"}
                        </span>
                        <span className="font-mono text-xs text-foreground break-all leading-relaxed bg-background p-2.5 rounded-lg border border-border/40 font-semibold">
                          {roundNumbersInText(selectedMaterial.rawProperties?.Yield_St_Acc_Temp)}
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 4: Source Documents & PDFs */}
                  <TabsContent value="documents" className="mt-0 space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2.5">
                      <BookOpen className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>
                        {isRtl
                          ? "مستندات استاندارد، جداول کدهای ASME / API و مراجع فنی رسمی بارگذاری‌شده برای این متریال"
                          : "Authoritative engineering codes, ASME/API tables and standard reference documentation"}
                      </span>
                    </div>

                    {docEntries.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                        {isRtl ? "مستند PDF اختصاصی برای این متریال ثبت نشده است." : "No explicit PDF documentation attached to this material."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {docEntries.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-muted/20 border border-border/60 hover:border-primary/50 transition-all flex flex-col justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="size-9 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                                <FileText className="size-4.5" />
                              </div>
                              <div className="flex flex-col min-w-0 gap-0.5">
                                <span className="font-bold text-xs text-foreground truncate" title={doc.title}>
                                  {doc.title}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground truncate" title={doc.filename}>
                                  {doc.filename}
                                </span>
                                <span className="text-[10px] text-primary/80 font-mono">
                                  Field: {doc.refKey}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted"
                                asChild
                              >
                                <a href={doc.docUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="size-3.5" />
                                  <span>{isRtl ? "نمایش داکیومنت" : "View Document"}</span>
                                </a>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 px-3 text-xs gap-1.5 rounded-lg"
                                asChild
                              >
                                <a href={doc.docUrl} download={doc.filename}>
                                  <FileDown className="size-3.5" />
                                  <span>{isRtl ? "دانلود" : "Download"}</span>
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* TAB 5: All 165 Raw Master Data Properties Grid */}
                  <TabsContent value="allProperties" className="mt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span>{t("rawProperties")} ({Object.keys(selectedMaterial.rawProperties || {}).length} {isRtl ? "ویژگی کامل دیتابیس" : "total attributes"})</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {isRtl ? "تمامی ارقام به صورت سراسری تا ۳ رقم بعد از اعشار گرد شده‌اند" : "All numerical values globally rounded to 3 decimals"}
                      </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-background border border-border/60 font-mono text-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {Object.entries(selectedMaterial.rawProperties || {}).map(([key, val]) => {
                        const docUrl = normalizeDocUrl(val);
                        const roundedVal = roundNumbersInText(val);

                        return (
                          <div key={key} className="p-2.5 rounded-lg bg-muted/20 border border-border/30 flex flex-col justify-between gap-1 min-w-0">
                            <span className="text-[10px] text-muted-foreground font-medium truncate" title={key}>
                              {key}
                            </span>
                            <span className="font-semibold text-foreground text-xs break-all leading-tight" title={String(val)}>
                              {roundedVal}
                            </span>
                            {docUrl && (
                              <div className="pt-1 mt-1 border-t border-border/30 flex items-center gap-1.5">
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="size-3" />
                                  <span>{isRtl ? "نمایش سند" : "View Doc"}</span>
                                </a>
                                <span className="text-muted-foreground text-[10px]">•</span>
                                <a
                                  href={docUrl}
                                  download
                                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                  <FileDown className="size-3" />
                                  <span>{isRtl ? "دانلود" : "Download"}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
