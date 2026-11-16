"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Binary,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  RotateCcw,
  PlusCircle,
  BookmarkCheck,
  Info,
  ImageIcon,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EspCodingClientService } from "../services/esp-coding.service";
import { CodeGenerationResult } from "../types";

export function ProductCodingView() {
  const t = useTranslations("espCoding.products");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [options, setOptions] = useState<{
    categories: Array<{ id: string; name: string; code: string }>;
    internalProducts: Array<{ id: string; name: string; code: string; categoryId: string }>;
    productTypes: Array<{ id: string; name: string; code: string; internalProductId: string }>;
    shapes: Array<{ id: string; name: string; code: string }>;
    types: Array<{ id: string; name: string; code: string }>;
    liftSizes: Array<{ id: string; name: string; code: string }>;
    thicknesses: Array<{ id: string; name: string; code: string }>;
    picLookup?: Record<string, string>;
  }>({
    categories: [],
    internalProducts: [],
    productTypes: [],
    shapes: [],
    types: [],
    liftSizes: [],
    thicknesses: [],
    picLookup: {},
  });

  // Selected State
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedInternalProduct, setSelectedInternalProduct] = useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [selectedShape, setSelectedShape] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLiftSize, setSelectedLiftSize] = useState<string>("");
  const [selectedThickness, setSelectedThickness] = useState<string>("");

  // Preview Modal for Document / Drawing
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Dynamic Parameters (P1-P4)
  const [p1Value, setP1Value] = useState("");
  const [p2Value, setP2Value] = useState("");
  const [p3Value, setP3Value] = useState("");
  const [p4Value, setP4Value] = useState("");
  const [parameterValue, setParameterValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<CodeGenerationResult | null>(null);

  // Load hierarchy options on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await EspCodingClientService.getHierarchyOptions();
        if (res.available && res.options) {
          setOptions(res.options);
          // Set sensible defaults from first item
          if (res.options.categories.length > 0) {
            setSelectedCategory(res.options.categories[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Filtered dropdowns based on cascades
  const filteredInternalProducts = useMemo(() => {
    const catObj = options.categories.find((c) => c.name === selectedCategory);
    if (!catObj) return options.internalProducts;
    return options.internalProducts.filter((ip) => ip.categoryId === catObj.id);
  }, [selectedCategory, options]);

  const filteredProductTypes = useMemo(() => {
    const ipObj = options.internalProducts.find((ip) => ip.name === selectedInternalProduct);
    if (!ipObj) return options.productTypes;
    return options.productTypes.filter((pt) => pt.internalProductId === ipObj.id);
  }, [selectedInternalProduct, options]);

  // Active matching drawing / image from production tree
  const activeProductPic = useMemo(() => {
    const lookup = options.picLookup;
    if (!lookup) return "";

    const k4 = `${selectedCategory}||${selectedInternalProduct}||${selectedProductType}||${selectedShape}`;
    if (selectedShape && lookup[k4]) return lookup[k4];

    const k3 = `${selectedCategory}||${selectedInternalProduct}||${selectedProductType}`;
    if (selectedProductType && lookup[k3]) return lookup[k3];

    const k2 = `${selectedCategory}||${selectedInternalProduct}`;
    if (selectedInternalProduct && lookup[k2]) return lookup[k2];

    const k1 = selectedCategory;
    if (selectedCategory && lookup[k1]) return lookup[k1];

    return "";
  }, [selectedCategory, selectedInternalProduct, selectedProductType, selectedShape, options.picLookup]);

  // Recalculate code whenever selections change
  useEffect(() => {
    const catObj = options.categories.find((c) => c.name === selectedCategory);
    const ipObj = options.internalProducts.find((ip) => ip.name === selectedInternalProduct);
    const ptObj = options.productTypes.find((pt) => pt.name === selectedProductType);
    const shapeObj = options.shapes.find((s) => s.name === selectedShape);
    const typeObj = options.types.find((t) => t.name === selectedType);
    const liftObj = options.liftSizes.find((l) => l.name === selectedLiftSize);
    const thkObj = options.thicknesses.find((th) => th.name === selectedThickness);

    const attributes: Record<string, string> = {
      ESP_Code: "E",
      Production_Code: catObj?.code || "",
      Internal_Product_Code: ipObj?.code || "",
      Product_Type_Code: ptObj?.code || "",
      Shape_Code: shapeObj?.code || "",
      Type_Code: typeObj?.code || "",
      Lift_Size_Code: liftObj?.code || "",
      Thk_Code: thkObj?.code || "",
      P1: p1Value,
      P2: p2Value,
      P3: p3Value,
      P4: p4Value,
      Parameter: parameterValue,
    };

    EspCodingClientService.generateCode({
      attributes,
    })
      .then((res) => {
        setGeneratedResult(res);
      })
      .catch((err) => {
        console.error("Auto generation error:", err);
      });
  }, [
    selectedCategory,
    selectedInternalProduct,
    selectedProductType,
    selectedShape,
    selectedType,
    selectedLiftSize,
    selectedThickness,
    p1Value,
    p2Value,
    p3Value,
    p4Value,
    parameterValue,
    options,
  ]);

  const handleCopyCode = () => {
    if (generatedResult?.code) {
      navigator.clipboard.writeText(generatedResult.code);
      toast.success(isRtl ? "کد در حافظه کپی شد" : "Code copied to clipboard");
    }
  };

  const handleReset = () => {
    setSelectedCategory(options.categories[0]?.name || "");
    setSelectedInternalProduct("");
    setSelectedProductType("");
    setSelectedShape("");
    setSelectedType("");
    setSelectedLiftSize("");
    setSelectedThickness("");
    setP1Value("");
    setP2Value("");
    setP3Value("");
    setP4Value("");
    setParameterValue("");
  };

  const handleReserve = async () => {
    if (!generatedResult?.code) {
      toast.error(isRtl ? "کد معتبری برای رزرو وجود ندارد" : "No valid code to reserve");
      return;
    }

    try {
      setIsSubmitting(true);
      await EspCodingClientService.registerProduct({
        productCode: generatedResult.code,
        action: "reserve",
        productionCategory: selectedCategory,
        internalProduct: selectedInternalProduct,
        productType: selectedProductType,
        shape: selectedShape,
        type: selectedType,
        liftHoleSize: selectedLiftSize,
        thk: selectedThickness,
        attributes: {
          P1: p1Value,
          P2: p2Value,
          P3: p3Value,
          P4: p4Value,
          Parameter: parameterValue,
        },
      });
      toast.success(t("reservedSuccess"));
    } catch (err: any) {
      toast.error(err.message || "Failed to reserve code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!generatedResult?.code) {
      toast.error(isRtl ? "کد معتبری برای ثبت وجود ندارد" : "No valid code to register");
      return;
    }

    try {
      setIsSubmitting(true);
      await EspCodingClientService.registerProduct({
        productCode: generatedResult.code,
        action: "register",
        productionCategory: selectedCategory,
        internalProduct: selectedInternalProduct,
        productType: selectedProductType,
        shape: selectedShape,
        type: selectedType,
        liftHoleSize: selectedLiftSize,
        thk: selectedThickness,
        attributes: {
          P1: p1Value,
          P2: p2Value,
          P3: p3Value,
          P4: p4Value,
          Parameter: parameterValue,
        },
      });
      toast.success(t("registeredSuccess"));
    } catch (err: any) {
      toast.error(err.message || "Failed to register product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
      {/* Top Title & Reset Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Binary className="size-5 text-primary" />
            <span>{t("title")}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {isRtl
              ? "انتخاب مشخصات، پیش‌نمایش آنی تفکیک اجزا و رزرو یا ثبت قطعی محصول در مستر دیتا"
              : "Cascading attribute selection, real-time segment breakdown & master registration"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="rounded-xl gap-1.5 text-xs cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>{isRtl ? "تنظیم مجدد فرم" : "Reset Form"}</span>
        </Button>
      </div>

      {/* Two Column Layout: Classification Cascades & Live Code Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Classification Cascades & Dynamic Attributes (8 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-5 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <span>{isRtl ? "۱. سلسله‌مراتب دسته‌بندی محصول" : "1. Product Classification Hierarchy"}</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                8 Levels
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Category */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] fa-num shrink-0">
                    1
                  </span>
                  <Label className="text-xs font-semibold text-foreground">
                    {t("selectCategory")}
                  </Label>
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                    setSelectedInternalProduct("");
                    setSelectedProductType("");
                  }}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.categories.map((c) => (
                      <SelectItem key={c.id} value={c.name} className="text-xs">
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Internal Product */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] fa-num shrink-0">
                    2
                  </span>
                  <Label className="text-xs font-semibold text-foreground">
                    {t("selectInternalProduct")}
                  </Label>
                </div>
                <Select
                  value={selectedInternalProduct}
                  onValueChange={(val) => {
                    setSelectedInternalProduct(val);
                    setSelectedProductType("");
                  }}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                    <SelectValue placeholder={t("selectInternalProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInternalProducts.map((ip) => (
                      <SelectItem key={ip.id} value={ip.name} className="text-xs">
                        {ip.name} ({ip.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Product Type */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] fa-num shrink-0">
                    3
                  </span>
                  <Label className="text-xs font-semibold text-foreground">
                    {t("selectProductType")}
                  </Label>
                </div>
                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                    <SelectValue placeholder={t("selectProductType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProductTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.name} className="text-xs">
                        {pt.name} ({pt.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Shape */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] fa-num shrink-0">
                    4
                  </span>
                  <Label className="text-xs font-semibold text-foreground">
                    {t("selectShape")}
                  </Label>
                </div>
                <Select value={selectedShape} onValueChange={setSelectedShape}>
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                    <SelectValue placeholder={t("selectShape")} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.shapes.map((s) => (
                      <SelectItem key={s.id} value={s.name} className="text-xs">
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Type */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] fa-num shrink-0">
                    5
                  </span>
                  <Label className="text-xs font-semibold text-foreground">
                    {t("selectType")}
                  </Label>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                    <SelectValue placeholder={t("selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.types.slice(0, 100).map((tp) => (
                      <SelectItem key={tp.id} value={tp.name} className="text-xs">
                        {tp.name} ({tp.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Lift / Hole Size */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] fa-num shrink-0">
                    6
                  </span>
                  <Label className="text-xs font-semibold text-foreground">
                    {t("selectLiftSize")}
                  </Label>
                </div>
                <Select value={selectedLiftSize} onValueChange={setSelectedLiftSize}>
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                    <SelectValue placeholder={t("selectLiftSize")} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.liftSizes.slice(0, 100).map((ls) => (
                      <SelectItem key={ls.id} value={ls.name} className="text-xs">
                        {ls.name} ({ls.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 7. Thickness */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] fa-num shrink-0">
                    7
                  </span>
                  <Label className="text-xs font-semibold text-foreground">
                    {t("selectThickness")}
                  </Label>
                </div>
                <Select value={selectedThickness} onValueChange={setSelectedThickness}>
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                    <SelectValue placeholder={t("selectThickness")} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.thicknesses.map((th) => (
                      <SelectItem key={th.id} value={th.name} className="text-xs">
                        {th.name} ({th.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Dynamic Engineering Parameters Card (P1 - P4) */}
          <Card className="p-5 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <span>{isRtl ? "۲. پارامترهای فنی پویا (P1 الی P4)" : "2. Dynamic Engineering Parameters (P1 - P4)"}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                {isRtl ? "اختیاری بر اساس خانواده محصول" : "Family-specific dynamic attributes"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  P1 (e.g. Subtype / Flow Direction)
                </Label>
                <Input
                  type="text"
                  value={p1Value}
                  onChange={(e) => setP1Value(e.target.value)}
                  placeholder="e.g. Internal Subtype"
                  className="h-9 rounded-xl text-xs bg-background"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  P2 (e.g. Hole Type / Valve Type)
                </Label>
                <Input
                  type="text"
                  value={p2Value}
                  onChange={(e) => setP2Value(e.target.value)}
                  placeholder="e.g. Hole Type"
                  className="h-9 rounded-xl text-xs bg-background"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  P3 (e.g. Hole Diameter mm / Riser Height)
                </Label>
                <Input
                  type="text"
                  value={p3Value}
                  onChange={(e) => setP3Value(e.target.value)}
                  placeholder="e.g. Hole Diameter (mm)"
                  className="h-9 rounded-xl text-xs bg-background"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  P4 (e.g. Deck Thickness mm)
                </Label>
                <Input
                  type="text"
                  value={p4Value}
                  onChange={(e) => setP4Value(e.target.value)}
                  placeholder="e.g. Deck Thickness (mm)"
                  className="h-9 rounded-xl text-xs bg-background"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Live Code Generation, Segment Breakdown & Registration Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          <Card className="p-5 rounded-2xl border-primary/30 bg-primary/5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-primary/15 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                <span>{t("candidateCode")}</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-background text-primary border-primary/30">
                v1.0 Active
              </Badge>
            </div>

            {/* Big Monospace Code Display with Sliding Number Animations */}
            <div className="p-4 rounded-xl bg-background border border-border/60 shadow-2xs flex items-center justify-between gap-3 overflow-hidden">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  ProductCode
                </span>
                <div className="flex items-center gap-0.5 mt-1 overflow-x-auto py-1" dir="ltr">
                  {(generatedResult?.code || "E---------").split("").map((char, idx) => (
                    <div
                      key={idx}
                      className="relative h-9 w-6 sm:w-7 rounded-md bg-muted/30 border border-border/40 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${idx}-${char}`}
                          initial={{ y: 24, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -24, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 28,
                            delay: idx * 0.02,
                          }}
                          className={cn(
                            "font-mono font-black text-base sm:text-lg select-none",
                            char === "-" ? "text-muted-foreground/40" : "text-primary"
                          )}
                        >
                          {char}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                title="Copy Code"
              >
                <Copy className="size-4" />
              </Button>
            </div>

            {/* Collision / Uniqueness Alert */}
            {generatedResult?.isDuplicate && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  {isRtl
                    ? "هشدار: این کد قبلاً در پایگاه داده ثبت شده است. برای جلوگیری از تداخل، بررسی نمایید."
                    : "Warning: This code already exists in the registered database."}
                </span>
              </div>
            )}

            {/* Segment Breakdown Pills */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-foreground">
                {t("codeBreakdown")}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {(generatedResult?.segments || []).map((seg) => (
                  <div
                    key={seg.segmentId}
                    className="flex items-center px-2 py-1 rounded-md bg-background border border-border/50 text-[10px] shadow-2xs"
                    title={`${seg.labelEn}: ${seg.rawValue}`}
                  >
                    <span className="text-muted-foreground me-1.5 font-medium">{isRtl ? seg.labelFa : seg.labelEn}:</span>
                    <span className="font-mono font-bold text-foreground">
                      {seg.formattedValue || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Actions Bar */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
              <Button
                type="button"
                onClick={handleRegister}
                disabled={isSubmitting || !generatedResult?.isValid}
                className="w-full h-10 rounded-xl font-bold text-xs gap-2 cursor-pointer bg-primary text-primary-foreground shadow-xs"
              >
                <CheckCircle2 className="size-4" />
                <span>{t("registerBtn")}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReserve}
                disabled={isSubmitting || !generatedResult?.isValid}
                className="w-full h-9 rounded-xl font-semibold text-xs gap-2 cursor-pointer bg-background"
              >
                <BookmarkCheck className="size-3.5" />
                <span>{t("reserveBtn")}</span>
              </Button>
            </div>
          </Card>

          {/* Technical Drawing & Inspection Document Card */}
          <Card className="p-4 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="size-4 text-emerald-500" />
                <span>{isRtl ? "نقشه و داکیومنت فنی قطعه" : "Technical Drawing & Spec"}</span>
              </span>
              {activeProductPic && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {isRtl ? "نقشه موجود است" : "Drawing Attached"}
                </Badge>
              )}
            </div>

            {activeProductPic ? (
              <div
                onClick={() => setPreviewImage(activeProductPic)}
                className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted/20 aspect-video flex items-center justify-center cursor-pointer transition-all hover:border-primary/50 shadow-2xs"
              >
                {activeProductPic.toLowerCase().endsWith(".pdf") ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors p-4 text-center">
                    <Info className="size-8" />
                    <span className="text-xs font-semibold">{isRtl ? "فایل مستندات فنی (PDF)" : "Technical Document (PDF)"}</span>
                    <span className="text-[10px] underline">{isRtl ? "جهت مشاهده و مطالعه کلیک کنید" : "Click to view document"}</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={activeProductPic}
                      alt="Technical Drawing"
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                      <Maximize2 className="size-5" />
                      <span className="text-xs font-bold">{isRtl ? "بزرگ‌نمایی نقشه" : "Full View"}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 p-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-1.5 bg-muted/10">
                <ImageIcon className="size-7 opacity-40" />
                <span className="text-xs font-medium">
                  {isRtl ? "نقشه‌ای برای ترکیب فیلترهای جاری ثبت نشده است" : "No technical drawing for current selection"}
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  {isRtl ? "با تغییر نوع یا شکل قطعه نقشه‌های مرتبط بارگذاری می‌شوند" : "Selecting specific shapes or types reveals attached drawings"}
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Fullscreen Drawing Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-full p-4 sm:p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/30 pb-3">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <span>{isRtl ? "پیش‌نمایش نقشه فنی مهندسی" : "Technical Engineering Drawing"}</span>
              <span className="text-xs font-mono text-muted-foreground">
                ({selectedCategory} {selectedInternalProduct ? `• ${selectedInternalProduct}` : ""} {selectedProductType ? `• ${selectedProductType}` : ""})
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 rounded-xl overflow-hidden bg-slate-950/5 flex items-center justify-center min-h-[400px] max-h-[75vh]">
            {previewImage?.toLowerCase().endsWith(".pdf") ? (
              <iframe src={previewImage} className="w-full h-[70vh] border-0 rounded-lg" title="Document Preview" />
            ) : (
              <img
                src={previewImage || ""}
                alt="Product Drawing Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
