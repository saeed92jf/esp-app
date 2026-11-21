"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Binary,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  RotateCcw,
  BookmarkCheck,
  Info,
  ImageIcon,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { CodeGenerationResult, ProductTreeCombination } from "../types";

function naturalCompare(a: string, b: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function normalizePicUrl(val: any): string {
  if (!val || typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/coding-docs/")) return trimmed;
  const m = trimmed.match(/Document[\/\\](.+)$/i);
  if (m) {
    return "/coding-docs/" + m[1].replace(/\\/g, "/");
  }
  return trimmed;
}

export function ProductCodingView() {
  const t = useTranslations("espCoding.products");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [combinations, setCombinations] = useState<ProductTreeCombination[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected State for all 7 levels
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedInternalProduct, setSelectedInternalProduct] = useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [selectedShape, setSelectedShape] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLiftSize, setSelectedLiftSize] = useState<string>("");
  const [selectedThickness, setSelectedThickness] = useState<string>("");

  // Preview Modal for Document / Drawing
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<CodeGenerationResult | null>(null);

  // Load combinations on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await EspCodingClientService.getHierarchyOptions();
        if (res.available && res.options) {
          if (Array.isArray(res.options.combinations)) {
            setCombinations(res.options.combinations);
            if (res.options.combinations.length > 0) {
              setSelectedCategory(res.options.combinations[0].cat);
            }
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

  // Filter combinations based on active selections, ignoring a specified field
  const getMatchingRecords = (
    ignoreField?: "cat" | "ip" | "pt" | "shape" | "type" | "lift" | "thk"
  ) => {
    return combinations.filter((r) => {
      if (ignoreField !== "cat" && selectedCategory && r.cat !== selectedCategory) return false;
      if (ignoreField !== "ip" && selectedInternalProduct && r.ip !== selectedInternalProduct) return false;
      if (ignoreField !== "pt" && selectedProductType && r.pt !== selectedProductType) return false;
      if (ignoreField !== "shape" && selectedShape && r.shape !== selectedShape) return false;
      if (ignoreField !== "type" && selectedType && r.type !== selectedType) return false;
      if (ignoreField !== "lift" && selectedLiftSize && r.lift !== selectedLiftSize) return false;
      if (ignoreField !== "thk" && selectedThickness && r.thk !== selectedThickness) return false;
      return true;
    });
  };

  // Derive available options strictly cascading from top to bottom
  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (r.cat && !map.has(r.cat)) map.set(r.cat, r.catCode);
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations]);

  const internalProductOptions = useMemo(() => {
    if (!selectedCategory) return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (r.cat === selectedCategory && r.ip && !map.has(r.ip)) {
        map.set(r.ip, r.ipCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations, selectedCategory]);

  const productTypeOptions = useMemo(() => {
    if (!selectedCategory || !selectedInternalProduct) return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.cat === selectedCategory &&
        r.ip === selectedInternalProduct &&
        r.pt &&
        !map.has(r.pt)
      ) {
        map.set(r.pt, r.ptCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations, selectedCategory, selectedInternalProduct]);

  const shapeOptions = useMemo(() => {
    if (!selectedCategory || !selectedInternalProduct || !selectedProductType) return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.cat === selectedCategory &&
        r.ip === selectedInternalProduct &&
        r.pt === selectedProductType &&
        r.shape &&
        !map.has(r.shape)
      ) {
        map.set(r.shape, r.shapeCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations, selectedCategory, selectedInternalProduct, selectedProductType]);

  const typeOptions = useMemo(() => {
    if (!selectedCategory || !selectedInternalProduct || !selectedProductType || !selectedShape) return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.cat === selectedCategory &&
        r.ip === selectedInternalProduct &&
        r.pt === selectedProductType &&
        r.shape === selectedShape &&
        r.type &&
        !map.has(r.type)
      ) {
        map.set(r.type, r.typeCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations, selectedCategory, selectedInternalProduct, selectedProductType, selectedShape]);

  const liftSizeOptions = useMemo(() => {
    if (
      !selectedCategory ||
      !selectedInternalProduct ||
      !selectedProductType ||
      !selectedShape ||
      !selectedType
    )
      return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.cat === selectedCategory &&
        r.ip === selectedInternalProduct &&
        r.pt === selectedProductType &&
        r.shape === selectedShape &&
        r.type === selectedType &&
        r.lift &&
        !map.has(r.lift)
      ) {
        map.set(r.lift, r.liftCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [
    combinations,
    selectedCategory,
    selectedInternalProduct,
    selectedProductType,
    selectedShape,
    selectedType,
  ]);

  const thicknessOptions = useMemo(() => {
    if (
      !selectedCategory ||
      !selectedInternalProduct ||
      !selectedProductType ||
      !selectedShape ||
      !selectedType ||
      !selectedLiftSize
    )
      return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.cat === selectedCategory &&
        r.ip === selectedInternalProduct &&
        r.pt === selectedProductType &&
        r.shape === selectedShape &&
        r.type === selectedType &&
        r.lift === selectedLiftSize &&
        r.thk &&
        !map.has(r.thk)
      ) {
        map.set(r.thk, r.thkCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [
    combinations,
    selectedCategory,
    selectedInternalProduct,
    selectedProductType,
    selectedShape,
    selectedType,
    selectedLiftSize,
  ]);

  // Dynamic titles for comboboxes 4-7 based on P1-P4 of matching records
  const dynamicTitles = useMemo(() => {
    const clean = (val?: string) => {
      if (!val) return "";
      const s = val.trim();
      return s && s !== "--" ? s : "";
    };

    // Find candidate record based on current selections (most specific to least specific)
    const matching = combinations.filter((r) => {
      if (selectedCategory && r.cat !== selectedCategory) return false;
      if (selectedInternalProduct && r.ip !== selectedInternalProduct) return false;
      if (selectedProductType && r.pt !== selectedProductType) return false;
      if (selectedShape && r.shape !== selectedShape) return false;
      if (selectedType && r.type !== selectedType) return false;
      if (selectedLiftSize && r.lift !== selectedLiftSize) return false;
      if (selectedThickness && r.thk !== selectedThickness) return false;
      return true;
    });

    const candidate =
      matching.find((r) => r.p1 || r.p2 || r.p3 || r.p4) ||
      combinations.find(
        (r) =>
          (!selectedCategory || r.cat === selectedCategory) &&
          (!selectedInternalProduct || r.ip === selectedInternalProduct) &&
          (!selectedProductType || r.pt === selectedProductType) &&
          (r.p1 || r.p2 || r.p3 || r.p4)
      ) ||
      combinations.find(
        (r) =>
          (!selectedCategory || r.cat === selectedCategory) &&
          (!selectedInternalProduct || r.ip === selectedInternalProduct) &&
          (r.p1 || r.p2 || r.p3 || r.p4)
      ) ||
      combinations.find((r) => (!selectedCategory || r.cat === selectedCategory) && (r.p1 || r.p2 || r.p3 || r.p4)) ||
      combinations[0];

    return {
      p1: clean(candidate?.p1),
      p2: clean(candidate?.p2),
      p3: clean(candidate?.p3),
      p4: clean(candidate?.p4),
    };
  }, [
    combinations,
    selectedCategory,
    selectedInternalProduct,
    selectedProductType,
    selectedShape,
    selectedType,
    selectedLiftSize,
    selectedThickness,
  ]);

  // Set any field and strictly reset all downstream selections
  const setFieldAndValidate = (
    field: "cat" | "ip" | "pt" | "shape" | "type" | "lift" | "thk",
    value: string
  ) => {
    if (field === "cat") {
      setSelectedCategory(value);
      setSelectedInternalProduct("");
      setSelectedProductType("");
      setSelectedShape("");
      setSelectedType("");
      setSelectedLiftSize("");
      setSelectedThickness("");
    } else if (field === "ip") {
      setSelectedInternalProduct(value);
      setSelectedProductType("");
      setSelectedShape("");
      setSelectedType("");
      setSelectedLiftSize("");
      setSelectedThickness("");
    } else if (field === "pt") {
      setSelectedProductType(value);
      setSelectedShape("");
      setSelectedType("");
      setSelectedLiftSize("");
      setSelectedThickness("");
    } else if (field === "shape") {
      setSelectedShape(value);
      setSelectedType("");
      setSelectedLiftSize("");
      setSelectedThickness("");
    } else if (field === "type") {
      setSelectedType(value);
      setSelectedLiftSize("");
      setSelectedThickness("");
    } else if (field === "lift") {
      setSelectedLiftSize(value);
      setSelectedThickness("");
    } else if (field === "thk") {
      setSelectedThickness(value);
    }
  };

  // Active matching drawing / image from production tree
  const activeProductPic = useMemo(() => {
    const matching = getMatchingRecords();
    const found = matching.find((r) => r.pic && r.pic.trim());
    if (found?.pic) {
      return normalizePicUrl(found.pic);
    }
    return "";
  }, [
    combinations,
    selectedCategory,
    selectedInternalProduct,
    selectedProductType,
    selectedShape,
    selectedType,
    selectedLiftSize,
    selectedThickness,
  ]);

  // Active codes for the current selection
  const activeCodes = useMemo(() => {
    const matching = getMatchingRecords();
    const first = matching[0];

    const catObj = categoryOptions.find((c) => c.name === selectedCategory);
    const ipObj = internalProductOptions.find((ip) => ip.name === selectedInternalProduct);
    const ptObj = productTypeOptions.find((pt) => pt.name === selectedProductType);
    const shapeObj = shapeOptions.find((s) => s.name === selectedShape);
    const typeObj = typeOptions.find((t) => t.name === selectedType);
    const liftObj = liftSizeOptions.find((l) => l.name === selectedLiftSize);
    const thkObj = thicknessOptions.find((th) => th.name === selectedThickness);

    return {
      catCode: catObj?.code || first?.catCode || "",
      ipCode: ipObj?.code || first?.ipCode || "",
      ptCode: ptObj?.code || first?.ptCode || "",
      shapeCode: shapeObj?.code || first?.shapeCode || "",
      typeCode: typeObj?.code || first?.typeCode || "",
      liftCode: liftObj?.code || first?.liftCode || "",
      thkCode: thkObj?.code || first?.thkCode || "",
    };
  }, [
    selectedCategory,
    selectedInternalProduct,
    selectedProductType,
    selectedShape,
    selectedType,
    selectedLiftSize,
    selectedThickness,
    categoryOptions,
    internalProductOptions,
    productTypeOptions,
    shapeOptions,
    typeOptions,
    liftSizeOptions,
    thicknessOptions,
  ]);

  // Recalculate code whenever selections change
  useEffect(() => {
    const attributes: Record<string, string> = {
      ESP_Code: "E",
      Production_Code: selectedCategory ? activeCodes.catCode : "",
      Internal_Product_Code: selectedInternalProduct ? activeCodes.ipCode : "",
      Product_Type_Code: selectedProductType ? activeCodes.ptCode : "",
      Shape_Code: selectedShape ? activeCodes.shapeCode : "",
      Type_Code: selectedType ? activeCodes.typeCode : "",
      Lift_Size_Code: selectedLiftSize ? activeCodes.liftCode : "",
      Thk_Code: selectedThickness ? activeCodes.thkCode : "",
    };

    EspCodingClientService.generateCode({ attributes })
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
    activeCodes,
  ]);

  const handleCopyCode = () => {
    if (generatedResult?.code) {
      navigator.clipboard.writeText(generatedResult.code);
      toast.success(isRtl ? "کد در حافظه کپی شد" : "Code copied to clipboard");
    }
  };

  const handleReset = () => {
    const firstCat = combinations[0]?.cat || "";
    setSelectedCategory(firstCat);
    setSelectedInternalProduct("");
    setSelectedProductType("");
    setSelectedShape("");
    setSelectedType("");
    setSelectedLiftSize("");
    setSelectedThickness("");
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
          ESP_Code: "E",
          Production_Code: activeCodes.catCode,
          Internal_Product_Code: activeCodes.ipCode,
          Product_Type_Code: activeCodes.ptCode,
          Shape_Code: activeCodes.shapeCode,
          Type_Code: activeCodes.typeCode,
          Lift_Size_Code: activeCodes.liftCode,
          Thk_Code: activeCodes.thkCode,
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
          ESP_Code: "E",
          Production_Code: activeCodes.catCode,
          Internal_Product_Code: activeCodes.ipCode,
          Product_Type_Code: activeCodes.ptCode,
          Shape_Code: activeCodes.shapeCode,
          Type_Code: activeCodes.typeCode,
          Lift_Size_Code: activeCodes.liftCode,
          Thk_Code: activeCodes.thkCode,
        },
      });
      toast.success(t("registeredSuccess"));
    } catch (err: any) {
      toast.error(err.message || "Failed to register product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchingCount = getMatchingRecords().length;

  const comboConfig = [
    {
      id: "cat" as const,
      num: 1,
      labelFa: "رده تولید (Category)",
      labelEn: "Production Category",
      value: selectedCategory,
      options: categoryOptions,
      placeholderFa: "انتخاب رده تولید...",
      placeholderEn: "Select Category...",
      disabled: false,
    },
    {
      id: "ip" as const,
      num: 2,
      labelFa: "محصول داخلی (Internal Product)",
      labelEn: "Internal Product",
      value: selectedInternalProduct,
      options: internalProductOptions,
      placeholderFa: selectedCategory ? "انتخاب محصول داخلی..." : "ابتدا رده تولید را انتخاب کنید...",
      placeholderEn: selectedCategory ? "Select Internal Product..." : "Select Category first...",
      disabled: !selectedCategory || internalProductOptions.length === 0,
    },
    {
      id: "pt" as const,
      num: 3,
      labelFa: "نوع محصول (Product Type)",
      labelEn: "Product Type",
      value: selectedProductType,
      options: productTypeOptions,
      placeholderFa: selectedInternalProduct ? "انتخاب نوع محصول..." : "ابتدا محصول داخلی را انتخاب کنید...",
      placeholderEn: selectedInternalProduct ? "Select Product Type..." : "Select Internal Product first...",
      disabled: !selectedInternalProduct || productTypeOptions.length === 0,
    },
    {
      id: "shape" as const,
      num: 4,
      labelFa: dynamicTitles.p1 || "شکل هندسی (Shape)",
      labelEn: dynamicTitles.p1 || "Shape",
      value: selectedShape,
      options: shapeOptions,
      placeholderFa: selectedProductType
        ? dynamicTitles.p1 ? `انتخاب ${dynamicTitles.p1}...` : "انتخاب شکل هندسی..."
        : "ابتدا نوع محصول را انتخاب کنید...",
      placeholderEn: selectedProductType
        ? dynamicTitles.p1 ? `Select ${dynamicTitles.p1}...` : "Select Shape..."
        : "Select Product Type first...",
      disabled: !selectedProductType || shapeOptions.length === 0,
    },
    {
      id: "type" as const,
      num: 5,
      labelFa: dynamicTitles.p2 || "تیپ ساختار (Type)",
      labelEn: dynamicTitles.p2 || "Type",
      value: selectedType,
      options: typeOptions,
      placeholderFa: selectedShape
        ? dynamicTitles.p2 ? `انتخاب ${dynamicTitles.p2}...` : "انتخاب تیپ..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedShape
        ? dynamicTitles.p2 ? `Select ${dynamicTitles.p2}...` : "Select Type..."
        : "Select previous step first...",
      disabled: !selectedShape || typeOptions.length === 0,
    },
    {
      id: "lift" as const,
      num: 6,
      labelFa: dynamicTitles.p3 || "سایز سوراخکاری / لیفت (Lift)",
      labelEn: dynamicTitles.p3 || "Lift / Hole Size",
      value: selectedLiftSize,
      options: liftSizeOptions,
      placeholderFa: selectedType
        ? dynamicTitles.p3 ? `انتخاب ${dynamicTitles.p3}...` : "انتخاب سایز/لیفت..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedType
        ? dynamicTitles.p3 ? `Select ${dynamicTitles.p3}...` : "Select Lift / Hole Size..."
        : "Select previous step first...",
      disabled: !selectedType || liftSizeOptions.length === 0,
    },
    {
      id: "thk" as const,
      num: 7,
      labelFa: dynamicTitles.p4 || "ضخامت متریال (Thickness)",
      labelEn: dynamicTitles.p4 || "Thickness (mm)",
      value: selectedThickness,
      options: thicknessOptions,
      placeholderFa: selectedLiftSize
        ? dynamicTitles.p4 ? `انتخاب ${dynamicTitles.p4}...` : "انتخاب ضخامت..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedLiftSize
        ? dynamicTitles.p4 ? `Select ${dynamicTitles.p4}...` : "Select Thickness..."
        : "Select previous step first...",
      disabled: !selectedLiftSize || thicknessOptions.length === 0,
    },
  ];

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
              ? "انتخاب مشخصات، فیلتر به هم وابسته کومبوباکس‌ها و صدور آنی کد محصول"
              : "Interdependent cascading specification filters & real-time product code generation"}
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
        {/* Left Form: All 7 Comboboxes stacked under each other with titles beside them (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-5 sm:p-6 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4.5 text-primary" />
                <span>{isRtl ? "سلسله‌مراتب و مشخصات محصول" : "Product Specifications"}</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {matchingCount} {isRtl ? "رکورد معتبر" : "Valid records"}
              </Badge>
            </div>

            {/* 7 Comboboxes stacked vertically with titles on the side */}
            <div className="flex flex-col divide-y divide-border/25">
              {comboConfig.map((item) => {
                const label = isRtl ? item.labelFa : item.labelEn;
                const placeholder = isRtl ? item.placeholderFa : item.placeholderEn;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    {/* Title beside the combobox */}
                    <div className="flex items-center gap-2.5 sm:w-48 md:w-56 lg:w-64 shrink-0">
                      <span className="size-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs fa-num shrink-0">
                        {item.num}
                      </span>
                      <Label className="text-xs sm:text-[13px] font-semibold text-foreground truncate cursor-pointer select-none">
                        {label}
                      </Label>
                    </div>

                    {/* Combobox */}
                    <div className="flex-1 min-w-0 flex items-center">
                      <Select
                        value={item.value}
                        onValueChange={(val) => setFieldAndValidate(item.id, val)}
                        disabled={item.disabled}
                      >
                        <SelectTrigger className="h-10 rounded-xl text-xs sm:text-[13px] bg-background w-full">
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {item.options.map((opt) => (
                            <SelectItem key={opt.name} value={opt.name} className="text-xs sm:text-[13px]">
                              <div className="flex items-center justify-between w-full gap-3">
                                <span className="truncate">{opt.name}</span>
                                <span className="font-mono text-[11px] text-muted-foreground shrink-0 ms-2">
                                  ({opt.code})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
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

            {/* Monospace Code Display with Sliding Character Animations */}
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
                  {isRtl ? "با انتخاب مشخصات قطعه نقشه‌های مرتبط بارگذاری می‌شوند" : "Selecting specific shapes or types reveals attached drawings"}
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
