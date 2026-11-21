"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Copy,
  RotateCcw,
  Info,
  ImageIcon,
  Maximize2,
  Search,
  SlidersHorizontal,
  Check,
  Database,
  Sparkles,
  Flame,
  ShieldCheck,
  Atom,
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
import { MaterialCodingCombination } from "../types/material-coding.types";

function naturalCompare(a: string, b: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function MaterialCodingView() {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [combinations, setCombinations] = useState<MaterialCodingCombination[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected State for all 6 levels
  const [selectedBasicMaterial, setSelectedBasicMaterial] = useState<string>("");
  const [selectedSubMaterial, setSelectedSubMaterial] = useState<string>("");
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>("");
  const [selectedSpecification, setSelectedSpecification] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Preview Modal for Form / Drawing / Microstructure
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Coding Mode: Forward (Specs -> Code) vs Reverse (Code -> Specs)
  const [codingMode, setCodingMode] = useState<"forward" | "reverse">("forward");
  const [reverseCodeInput, setReverseCodeInput] = useState<string>("");
  const [reverseMatchStatus, setReverseMatchStatus] = useState<"idle" | "matched" | "not_found">("idle");
  const [matchedCombination, setMatchedCombination] = useState<MaterialCodingCombination | null>(null);

  // Load all material combinations from the server on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await EspCodingClientService.getMaterialHierarchyOptions();
        if (res.available && res.options?.combinations) {
          const rawCombinations = res.options.combinations;
          setCombinations(rawCombinations);

          // Default selection matching the authoritative example (SA-516 Gr.55)
          const defaultRecord = rawCombinations.find(
            (r) => r.spec === "SA-516" && r.grade === "55"
          ) || rawCombinations[0];

          if (defaultRecord) {
            setSelectedBasicMaterial(defaultRecord.bm);
            setSelectedSubMaterial(defaultRecord.sm);
            setSelectedMaterialCategory(defaultRecord.gm);
            setSelectedSpecification(defaultRecord.spec);
            setSelectedGrade(defaultRecord.grade);
            setSelectedClass(defaultRecord.classVal);
          }
        }
      } catch (err) {
        console.error("Failed to load material hierarchy options:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Map of indexed combinations by exact Material Code for reverse instant lookup
  const combinationsWithCodes = useMemo(() => {
    const map = new Map<string, MaterialCodingCombination>();
    combinations.forEach((r) => {
      if (r.materialCode && !map.has(r.materialCode)) {
        map.set(r.materialCode, r);
      }
    });
    return map;
  }, [combinations]);

  // Cascading options derived strictly from top to bottom
  const basicMaterialOptions = useMemo(() => {
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (r.bm && !map.has(r.bm)) map.set(r.bm, r.bmCode);
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations]);

  const subMaterialOptions = useMemo(() => {
    if (!selectedBasicMaterial) return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (r.bm === selectedBasicMaterial && r.sm && !map.has(r.sm)) {
        map.set(r.sm, r.smCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations, selectedBasicMaterial]);

  const materialCategoryOptions = useMemo(() => {
    if (!selectedBasicMaterial || !selectedSubMaterial) return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.bm === selectedBasicMaterial &&
        r.sm === selectedSubMaterial &&
        r.gm &&
        !map.has(r.gm)
      ) {
        map.set(r.gm, r.gmCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations, selectedBasicMaterial, selectedSubMaterial]);

  const specificationOptions = useMemo(() => {
    if (!selectedBasicMaterial || !selectedSubMaterial || !selectedMaterialCategory) return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.bm === selectedBasicMaterial &&
        r.sm === selectedSubMaterial &&
        r.gm === selectedMaterialCategory &&
        r.spec &&
        !map.has(r.spec)
      ) {
        map.set(r.spec, r.specCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [combinations, selectedBasicMaterial, selectedSubMaterial, selectedMaterialCategory]);

  const gradeOptions = useMemo(() => {
    if (
      !selectedBasicMaterial ||
      !selectedSubMaterial ||
      !selectedMaterialCategory ||
      !selectedSpecification
    )
      return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.bm === selectedBasicMaterial &&
        r.sm === selectedSubMaterial &&
        r.gm === selectedMaterialCategory &&
        r.spec === selectedSpecification &&
        r.grade &&
        !map.has(r.grade)
      ) {
        map.set(r.grade, r.gradeCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [
    combinations,
    selectedBasicMaterial,
    selectedSubMaterial,
    selectedMaterialCategory,
    selectedSpecification,
  ]);

  const classOptions = useMemo(() => {
    if (
      !selectedBasicMaterial ||
      !selectedSubMaterial ||
      !selectedMaterialCategory ||
      !selectedSpecification ||
      !selectedGrade
    )
      return [];
    const map = new Map<string, string>();
    combinations.forEach((r) => {
      if (
        r.bm === selectedBasicMaterial &&
        r.sm === selectedSubMaterial &&
        r.gm === selectedMaterialCategory &&
        r.spec === selectedSpecification &&
        r.grade === selectedGrade &&
        r.classVal !== undefined &&
        !map.has(r.classVal)
      ) {
        map.set(r.classVal, r.classCode);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.name, b.name));
  }, [
    combinations,
    selectedBasicMaterial,
    selectedSubMaterial,
    selectedMaterialCategory,
    selectedSpecification,
    selectedGrade,
  ]);

  // Find exact currently selected combination
  const currentRecord = useMemo(() => {
    if (
      !selectedBasicMaterial ||
      !selectedSubMaterial ||
      !selectedMaterialCategory ||
      !selectedSpecification ||
      !selectedGrade ||
      !selectedClass
    ) {
      return null;
    }
    return (
      combinations.find(
        (r) =>
          r.bm === selectedBasicMaterial &&
          r.sm === selectedSubMaterial &&
          r.gm === selectedMaterialCategory &&
          r.spec === selectedSpecification &&
          r.grade === selectedGrade &&
          r.classVal === selectedClass
      ) || null
    );
  }, [
    combinations,
    selectedBasicMaterial,
    selectedSubMaterial,
    selectedMaterialCategory,
    selectedSpecification,
    selectedGrade,
    selectedClass,
  ]);

  // Selected item codes
  const selectedBasicMaterialCode = useMemo(() => {
    return basicMaterialOptions.find((o) => o.name === selectedBasicMaterial)?.code || "";
  }, [basicMaterialOptions, selectedBasicMaterial]);

  const selectedSubMaterialCode = useMemo(() => {
    return subMaterialOptions.find((o) => o.name === selectedSubMaterial)?.code || "";
  }, [subMaterialOptions, selectedSubMaterial]);

  const selectedMaterialCategoryCode = useMemo(() => {
    return materialCategoryOptions.find((o) => o.name === selectedMaterialCategory)?.code || "";
  }, [materialCategoryOptions, selectedMaterialCategory]);

  const selectedSpecificationCode = useMemo(() => {
    return (
      specificationOptions.find((o) => o.name === selectedSpecification)?.code?.padStart(2, "0") ||
      ""
    );
  }, [specificationOptions, selectedSpecification]);

  const selectedGradeCode = useMemo(() => {
    return (
      gradeOptions.find((o) => o.name === selectedGrade)?.code?.padStart(2, "0") || ""
    );
  }, [gradeOptions, selectedGrade]);

  const selectedClassCode = useMemo(() => {
    return classOptions.find((o) => o.name === selectedClass)?.code || "";
  }, [classOptions, selectedClass]);

  // Real-time Material Code generation:
  // Starts with 'M' followed by:
  // Basic_Material_Code + Sub_Material_Code + GROUP_MAT_Code1 + SPEC_Code(2d) + GRADE_Code(2d) + CLASS_Code
  const generatedMaterialCode = useMemo(() => {
    const isComplete =
      selectedBasicMaterialCode &&
      selectedSubMaterialCode &&
      selectedMaterialCategoryCode &&
      selectedSpecificationCode &&
      selectedGradeCode &&
      selectedClassCode;

    if (!isComplete) {
      return `M${selectedBasicMaterialCode || "-"}${selectedSubMaterialCode || "-"}${selectedMaterialCategoryCode || "-"}${selectedSpecificationCode || "--"}${selectedGradeCode || "--"}${selectedClassCode || "-"}`;
    }

    return `M${selectedBasicMaterialCode}${selectedSubMaterialCode}${selectedMaterialCategoryCode}${selectedSpecificationCode}${selectedGradeCode}${selectedClassCode}`;
  }, [
    selectedBasicMaterialCode,
    selectedSubMaterialCode,
    selectedMaterialCategoryCode,
    selectedSpecificationCode,
    selectedGradeCode,
    selectedClassCode,
  ]);

  // Cascading Selection Handlers with auto-reset and auto-first-selection
  const handleSelectBasicMaterial = (val: string) => {
    setSelectedBasicMaterial(val);
    const subOpts = combinations
      .filter((r) => r.bm === val && r.sm)
      .map((r) => r.sm);
    const firstSub = Array.from(new Set(subOpts))[0] || "";
    setSelectedSubMaterial(firstSub);

    if (firstSub) {
      const catOpts = combinations
        .filter((r) => r.bm === val && r.sm === firstSub && r.gm)
        .map((r) => r.gm);
      const firstCat = Array.from(new Set(catOpts))[0] || "";
      setSelectedMaterialCategory(firstCat);

      if (firstCat) {
        const specOpts = combinations
          .filter((r) => r.bm === val && r.sm === firstSub && r.gm === firstCat && r.spec)
          .map((r) => r.spec);
        const firstSpec = Array.from(new Set(specOpts))[0] || "";
        setSelectedSpecification(firstSpec);

        if (firstSpec) {
          const grOpts = combinations
            .filter(
              (r) =>
                r.bm === val &&
                r.sm === firstSub &&
                r.gm === firstCat &&
                r.spec === firstSpec &&
                r.grade
            )
            .map((r) => r.grade);
          const firstGr = Array.from(new Set(grOpts))[0] || "";
          setSelectedGrade(firstGr);

          if (firstGr) {
            const clOpts = combinations
              .filter(
                (r) =>
                  r.bm === val &&
                  r.sm === firstSub &&
                  r.gm === firstCat &&
                  r.spec === firstSpec &&
                  r.grade === firstGr &&
                  r.classVal !== undefined
              )
              .map((r) => r.classVal);
            const firstCl = Array.from(new Set(clOpts))[0] || "";
            setSelectedClass(firstCl);
          } else {
            setSelectedClass("");
          }
        } else {
          setSelectedGrade("");
          setSelectedClass("");
        }
      } else {
        setSelectedSpecification("");
        setSelectedGrade("");
        setSelectedClass("");
      }
    } else {
      setSelectedMaterialCategory("");
      setSelectedSpecification("");
      setSelectedGrade("");
      setSelectedClass("");
    }
  };

  const handleSelectSubMaterial = (val: string) => {
    setSelectedSubMaterial(val);
    const catOpts = combinations
      .filter((r) => r.bm === selectedBasicMaterial && r.sm === val && r.gm)
      .map((r) => r.gm);
    const firstCat = Array.from(new Set(catOpts))[0] || "";
    setSelectedMaterialCategory(firstCat);

    if (firstCat) {
      const specOpts = combinations
        .filter(
          (r) =>
            r.bm === selectedBasicMaterial &&
            r.sm === val &&
            r.gm === firstCat &&
            r.spec
        )
        .map((r) => r.spec);
      const firstSpec = Array.from(new Set(specOpts))[0] || "";
      setSelectedSpecification(firstSpec);

      if (firstSpec) {
        const grOpts = combinations
          .filter(
            (r) =>
              r.bm === selectedBasicMaterial &&
              r.sm === val &&
              r.gm === firstCat &&
              r.spec === firstSpec &&
              r.grade
          )
          .map((r) => r.grade);
        const firstGr = Array.from(new Set(grOpts))[0] || "";
        setSelectedGrade(firstGr);

        if (firstGr) {
          const clOpts = combinations
            .filter(
              (r) =>
                r.bm === selectedBasicMaterial &&
                r.sm === val &&
                r.gm === firstCat &&
                r.spec === firstSpec &&
                r.grade === firstGr &&
                r.classVal !== undefined
            )
            .map((r) => r.classVal);
          const firstCl = Array.from(new Set(clOpts))[0] || "";
          setSelectedClass(firstCl);
        } else {
          setSelectedClass("");
        }
      } else {
        setSelectedGrade("");
        setSelectedClass("");
      }
    } else {
      setSelectedSpecification("");
      setSelectedGrade("");
      setSelectedClass("");
    }
  };

  const handleSelectMaterialCategory = (val: string) => {
    setSelectedMaterialCategory(val);
    const specOpts = combinations
      .filter(
        (r) =>
          r.bm === selectedBasicMaterial &&
          r.sm === selectedSubMaterial &&
          r.gm === val &&
          r.spec
      )
      .map((r) => r.spec);
    const firstSpec = Array.from(new Set(specOpts))[0] || "";
    setSelectedSpecification(firstSpec);

    if (firstSpec) {
      const grOpts = combinations
        .filter(
          (r) =>
            r.bm === selectedBasicMaterial &&
            r.sm === selectedSubMaterial &&
            r.gm === val &&
            r.spec === firstSpec &&
            r.grade
        )
        .map((r) => r.grade);
      const firstGr = Array.from(new Set(grOpts))[0] || "";
      setSelectedGrade(firstGr);

      if (firstGr) {
        const clOpts = combinations
          .filter(
            (r) =>
              r.bm === selectedBasicMaterial &&
              r.sm === selectedSubMaterial &&
              r.gm === val &&
              r.spec === firstSpec &&
              r.grade === firstGr &&
              r.classVal !== undefined
          )
          .map((r) => r.classVal);
        const firstCl = Array.from(new Set(clOpts))[0] || "";
        setSelectedClass(firstCl);
      } else {
        setSelectedClass("");
      }
    } else {
      setSelectedGrade("");
      setSelectedClass("");
    }
  };

  const handleSelectSpecification = (val: string) => {
    setSelectedSpecification(val);
    const grOpts = combinations
      .filter(
        (r) =>
          r.bm === selectedBasicMaterial &&
          r.sm === selectedSubMaterial &&
          r.gm === selectedMaterialCategory &&
          r.spec === val &&
          r.grade
      )
      .map((r) => r.grade);
    const firstGr = Array.from(new Set(grOpts))[0] || "";
    setSelectedGrade(firstGr);

    if (firstGr) {
      const clOpts = combinations
        .filter(
          (r) =>
            r.bm === selectedBasicMaterial &&
            r.sm === selectedSubMaterial &&
            r.gm === selectedMaterialCategory &&
            r.spec === val &&
            r.grade === firstGr &&
            r.classVal !== undefined
        )
        .map((r) => r.classVal);
      const firstCl = Array.from(new Set(clOpts))[0] || "";
      setSelectedClass(firstCl);
    } else {
      setSelectedClass("");
    }
  };

  const handleSelectGrade = (val: string) => {
    setSelectedGrade(val);
    const clOpts = combinations
      .filter(
        (r) =>
          r.bm === selectedBasicMaterial &&
          r.sm === selectedSubMaterial &&
          r.gm === selectedMaterialCategory &&
          r.spec === selectedSpecification &&
          r.grade === val &&
          r.classVal !== undefined
      )
      .map((r) => r.classVal);
    const firstCl = Array.from(new Set(clOpts))[0] || "";
    setSelectedClass(firstCl);
  };

  const handleSelectClass = (val: string) => {
    setSelectedClass(val);
  };

  // Reset to default
  const handleReset = () => {
    if (combinations.length > 0) {
      const defaultRecord =
        combinations.find((r) => r.spec === "SA-516" && r.grade === "55") || combinations[0];
      setSelectedBasicMaterial(defaultRecord.bm);
      setSelectedSubMaterial(defaultRecord.sm);
      setSelectedMaterialCategory(defaultRecord.gm);
      setSelectedSpecification(defaultRecord.spec);
      setSelectedGrade(defaultRecord.grade);
      setSelectedClass(defaultRecord.classVal);
    }
    setReverseCodeInput("");
    setReverseMatchStatus("idle");
    setMatchedCombination(null);
    toast.info(isRtl ? "تنظیمات به حالت پیش‌فرض بازگشت" : "Reset to default specifications");
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    if (!code || code.includes("-")) {
      toast.warning(isRtl ? "کد هنوز کامل نشده است" : "Code is not complete yet");
      return;
    }
    navigator.clipboard.writeText(code);
    toast.success(isRtl ? "کد متریال کپی شد" : "Material code copied to clipboard", {
      description: code,
    });
  };

  // Reverse Lookup Handler
  const handleReverseLookup = (inputCode: string) => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      setReverseMatchStatus("idle");
      setMatchedCombination(null);
      return;
    }

    const match = combinationsWithCodes.get(cleanCode);
    if (match) {
      setReverseMatchStatus("matched");
      setMatchedCombination(match);

      // Also sync active dropdown state
      setSelectedBasicMaterial(match.bm);
      setSelectedSubMaterial(match.sm);
      setSelectedMaterialCategory(match.gm);
      setSelectedSpecification(match.spec);
      setSelectedGrade(match.grade);
      setSelectedClass(match.classVal);

      toast.success(isRtl ? "متریال با موفقیت شناسایی شد" : "Material successfully identified!", {
        description: `${match.gm} ${match.spec} Grade ${match.grade}`,
      });
    } else {
      setReverseMatchStatus("not_found");
      setMatchedCombination(null);
      toast.error(isRtl ? "کد در پایگاه داده متریال یافت نشد" : "Material code not found in database", {
        description: cleanCode,
      });
    }
  };

  // Active record to display in technical overview
  const activeDisplayRecord = matchedCombination || currentRecord;

  // Total matching valid records in current filtered cascade
  const matchingCount = useMemo(() => {
    return combinations.filter((r) => {
      if (selectedBasicMaterial && r.bm !== selectedBasicMaterial) return false;
      if (selectedSubMaterial && r.sm !== selectedSubMaterial) return false;
      if (selectedMaterialCategory && r.gm !== selectedMaterialCategory) return false;
      if (selectedSpecification && r.spec !== selectedSpecification) return false;
      if (selectedGrade && r.grade !== selectedGrade) return false;
      if (selectedClass && r.classVal !== selectedClass) return false;
      return true;
    }).length;
  }, [
    combinations,
    selectedBasicMaterial,
    selectedSubMaterial,
    selectedMaterialCategory,
    selectedSpecification,
    selectedGrade,
    selectedClass,
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Top Title & Mode Selector Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20"
            >
              <Sparkles className="size-3.5 me-1.5" />
              <span>{isRtl ? "مستر دیتا و کدگذاری مواد اولیه" : "Master Data & Raw Material Coding"}</span>
            </Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Database className="size-5 text-primary" />
            <span>{isRtl ? "کدینگ هوشمند متریال (Raw Material Coding)" : "Smart Raw Material Coding"}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {codingMode === "forward"
              ? isRtl
                ? "انتخاب مرحله‌ای مشخصات متریال، فیلترینگ خودکار گزینه‌ها و صدور کد رسمی متریال"
                : "Cascading material specification selection, auto-filtering & official code issuance"
              : isRtl
                ? "حالت معکوس: وارد کردن کد متریال جهت استخراج مشخصات مکانیکی، استاندارد و آنالیز فنی"
                : "Reverse mode: Enter material code to decode specifications & mechanical properties"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher Pills */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/50 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setCodingMode("forward")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 select-none",
                codingMode === "forward"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>{isRtl ? "کدگذاری با مشخصات" : "Forward (Specs)"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCodingMode("reverse");
                if (generatedMaterialCode && !generatedMaterialCode.includes("-")) {
                  handleReverseLookup(generatedMaterialCode);
                }
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 select-none",
                codingMode === "reverse"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="size-3.5" />
              <span>{isRtl ? "رمزگشایی با کد (حالت معکوس)" : "Reverse Lookup"}</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl gap-1.5 text-xs cursor-pointer h-8"
          >
            <RotateCcw className="size-3.5" />
            <span>{isRtl ? "تنظیم مجدد" : "Reset"}</span>
          </Button>
        </div>
      </div>

      {/* Two Column Layout: Coding Controls & Live Material Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Code Preview on top + Material Dropdowns */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-5 sm:p-6 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4.5 text-primary" />
                <span>{isRtl ? "مشخصات فنی و متالورژیکی متریال" : "Material Specifications"}</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {matchingCount} {isRtl ? "رکورد منطبق" : "Matching items"}
              </Badge>
            </div>

            {/* Reverse Mode: Interactive Code Input and Instant Decoder */}
            {codingMode === "reverse" ? (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Search className="size-4 text-primary" />
                    <span>{isRtl ? "ورود کد متریال جهت رمزگشایی" : "Enter Material Code to Decode"}</span>
                  </span>
                  {reverseMatchStatus === "matched" && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold gap-1"
                    >
                      <Check className="size-3" />
                      <span>{isRtl ? "متریال شناسایی شد" : "Material Identified"}</span>
                    </Badge>
                  )}
                  {reverseMatchStatus === "not_found" && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold"
                    >
                      {isRtl ? "کد در پایگاه داده یافت نشد" : "Code Not Found"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="e.g. M11101020"
                      value={reverseCodeInput}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setReverseCodeInput(val);
                        if (val.length >= 7) {
                          handleReverseLookup(val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleReverseLookup(reverseCodeInput);
                        }
                      }}
                      className="h-10 font-mono font-bold text-sm tracking-wider uppercase bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleReverseLookup(reverseCodeInput)}
                    className="h-10 px-4 rounded-xl font-bold cursor-pointer"
                  >
                    <span>{isRtl ? "رمزگشایی" : "Decode"}</span>
                  </Button>
                </div>

                {/* Quick Sample Code Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-muted-foreground">
                  <span className="text-[10px] font-medium">{isRtl ? "نمونه‌های سریع:" : "Quick samples:"}</span>
                  {[
                    { code: "M11101020", label: "SA-516 Gr.55" },
                    { code: "M11101010", label: "SA-516 Gr.70" },
                    { code: "M11102010", label: "SA-333 Gr.6" },
                    { code: "M11103011", label: "SA-350 LF2" },
                    { code: "M11105010", label: "SA-320 L7" },
                  ].map((s) => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => {
                        setReverseCodeInput(s.code);
                        handleReverseLookup(s.code);
                      }}
                      className="px-2 py-0.5 rounded-md bg-muted/80 hover:bg-primary/10 hover:text-primary transition-colors font-mono text-[10px] border border-border/40 cursor-pointer"
                    >
                      {s.code} ({s.label})
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Forward Mode: Monospace Material Code Preview at Top of Combos */
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>{isRtl ? "پیش‌نمایش کد رسمی متریال" : "Material Code Preview"}</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-background/80">
                    Prefix: M (Material)
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-3 bg-background/90 px-4 py-3 rounded-xl border border-border/60 shadow-inner">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-primary select-all">
                    {generatedMaterialCode}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCode(generatedMaterialCode)}
                    className="h-8 gap-1.5 text-xs rounded-lg cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                    <span>{isRtl ? "کپی کد" : "Copy"}</span>
                  </Button>
                </div>

                {/* Segment breakdown preview pills */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-muted/70 text-foreground font-bold">M</span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/70" title="Basic Material">
                    {selectedBasicMaterialCode || "-"}: {selectedBasicMaterial || "Basic"}
                  </span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/70" title="Sub Material">
                    {selectedSubMaterialCode || "-"}: {selectedSubMaterial || "Sub"}
                  </span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/70" title="Material Category">
                    {selectedMaterialCategoryCode || "-"}: {selectedMaterialCategory || "Cat"}
                  </span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/70" title="Specification">
                    {selectedSpecificationCode || "--"}: {selectedSpecification || "Spec"}
                  </span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/70" title="Grade">
                    {selectedGradeCode || "--"}: {selectedGrade || "Grade"}
                  </span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/70" title="Class">
                    {selectedClassCode || "-"}: {selectedClass || "Class"}
                  </span>
                </div>
              </div>
            )}

            {/* Reverse Mode: Specifications Read-Only View (NO comboboxes!) */}
            {codingMode === "reverse" && matchedCombination && (
              <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-card border border-border/60 shadow-2xs">
                <span className="text-xs font-bold text-foreground border-b border-border/30 pb-2">
                  {isRtl ? "مشخصات فنی استخراج‌شده از کد متریال" : "Decoded Material Specifications"}
                </span>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {[
                    {
                      labelFa: "متریال پایه (Basic Material)",
                      labelEn: "Basic Material",
                      value: matchedCombination.bm,
                      code: matchedCombination.bmCode,
                    },
                    {
                      labelFa: "زیرگروه متریال (Sub-Material)",
                      labelEn: "Sub-Material",
                      value: matchedCombination.sm,
                      code: matchedCombination.smCode,
                    },
                    {
                      labelFa: "رده متریال (Material Category)",
                      labelEn: "Material Category",
                      value: matchedCombination.gm,
                      code: matchedCombination.gmCode,
                    },
                    {
                      labelFa: "مشخصه فنی (Specification - SPEC)",
                      labelEn: "Specification",
                      value: matchedCombination.spec,
                      code: matchedCombination.specCode,
                    },
                    {
                      labelFa: "گرید متریال (Grade)",
                      labelEn: "Grade",
                      value: matchedCombination.grade,
                      code: matchedCombination.gradeCode,
                    },
                    {
                      labelFa: "کلاس کاری و یادداشت (Note / Class)",
                      labelEn: "Note (Class)",
                      value: matchedCombination.classVal || "--",
                      code: matchedCombination.classCode,
                    },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border/30 text-xs"
                    >
                      <span className="font-semibold text-muted-foreground">
                        {isRtl ? row.labelFa : row.labelEn}:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{row.value}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                          {row.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forward Mode: Interactive Cascading Select Fields */}
            {codingMode === "forward" && (
              <div className="flex flex-col gap-4">
                {/* 1. Basic Material */}
                <div className="flex items-center gap-3">
                  <Label className="min-w-[130px] max-w-[150px] shrink-0 text-xs font-semibold text-foreground">
                    {isRtl ? "متریال پایه:" : "Basic Material:"}
                  </Label>
                  <div className="flex-1 min-w-0">
                    <Select value={selectedBasicMaterial} onValueChange={handleSelectBasicMaterial}>
                      <SelectTrigger className="w-full text-xs h-9 bg-background">
                        <SelectValue placeholder={isRtl ? "انتخاب متریال پایه..." : "Select Basic Material..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {basicMaterialOptions.map((opt) => (
                          <SelectItem key={opt.name} value={opt.name} className="text-xs">
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-14 sm:w-16 h-9 shrink-0 flex items-center justify-center font-mono font-bold text-xs rounded-lg border bg-muted/40 text-foreground shadow-2xs">
                    {selectedBasicMaterialCode || "-"}
                  </div>
                </div>

                {/* 2. Sub-Material */}
                <div className="flex items-center gap-3">
                  <Label className="min-w-[130px] max-w-[150px] shrink-0 text-xs font-semibold text-foreground">
                    {isRtl ? "زیرگروه متریال:" : "Sub-Material:"}
                  </Label>
                  <div className="flex-1 min-w-0">
                    <Select
                      value={selectedSubMaterial}
                      onValueChange={handleSelectSubMaterial}
                      disabled={!selectedBasicMaterial || subMaterialOptions.length === 0}
                    >
                      <SelectTrigger className="w-full text-xs h-9 bg-background">
                        <SelectValue
                          placeholder={
                            selectedBasicMaterial
                              ? isRtl
                                ? "انتخاب زیرگروه..."
                                : "Select Sub-Material..."
                              : isRtl
                                ? "ابتدا مرحله قبل را انتخاب کنید..."
                                : "Select previous step first..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subMaterialOptions.map((opt) => (
                          <SelectItem key={opt.name} value={opt.name} className="text-xs">
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-14 sm:w-16 h-9 shrink-0 flex items-center justify-center font-mono font-bold text-xs rounded-lg border bg-muted/40 text-foreground shadow-2xs">
                    {selectedSubMaterialCode || "-"}
                  </div>
                </div>

                {/* 3. Material Specification Framed Box (matching user image groupbox) */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/70 bg-muted/20 relative mt-2">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-1">
                    <Atom className="size-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {isRtl ? "مشخصات متریال (Material Specification)" : "Material Specification"}
                    </span>
                  </div>

                  {/* 3.1 Material Category */}
                  <div className="flex items-center gap-3">
                    <Label className="min-w-[120px] max-w-[140px] shrink-0 text-xs font-medium text-foreground">
                      {isRtl ? "رده متریال:" : "Material Category:"}
                    </Label>
                    <div className="flex-1 min-w-0">
                      <Select
                        value={selectedMaterialCategory}
                        onValueChange={handleSelectMaterialCategory}
                        disabled={!selectedSubMaterial || materialCategoryOptions.length === 0}
                      >
                        <SelectTrigger className="w-full text-xs h-9 bg-background">
                          <SelectValue
                            placeholder={
                              selectedSubMaterial
                                ? isRtl
                                  ? "انتخاب رده متریال..."
                                  : "Select Material Category..."
                                : isRtl
                                  ? "ابتدا مرحله قبل را انتخاب کنید..."
                                  : "Select previous step first..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {materialCategoryOptions.map((opt) => (
                            <SelectItem key={opt.name} value={opt.name} className="text-xs">
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-14 sm:w-16 h-9 shrink-0 flex items-center justify-center font-mono font-bold text-xs rounded-lg border bg-muted/40 text-foreground shadow-2xs">
                      {selectedMaterialCategoryCode || "-"}
                    </div>
                  </div>

                  {/* 3.2 Specification */}
                  <div className="flex items-center gap-3">
                    <Label className="min-w-[120px] max-w-[140px] shrink-0 text-xs font-medium text-foreground">
                      {isRtl ? "مشخصه فنی (SPEC):" : "Specification:"}
                    </Label>
                    <div className="flex-1 min-w-0">
                      <Select
                        value={selectedSpecification}
                        onValueChange={handleSelectSpecification}
                        disabled={!selectedMaterialCategory || specificationOptions.length === 0}
                      >
                        <SelectTrigger className="w-full text-xs h-9 bg-background">
                          <SelectValue
                            placeholder={
                              selectedMaterialCategory
                                ? isRtl
                                  ? "انتخاب استاندارد/مشخصه..."
                                  : "Select Specification..."
                                : isRtl
                                  ? "ابتدا مرحله قبل را انتخاب کنید..."
                                  : "Select previous step first..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {specificationOptions.map((opt) => (
                            <SelectItem key={opt.name} value={opt.name} className="text-xs">
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-14 sm:w-16 h-9 shrink-0 flex items-center justify-center font-mono font-bold text-xs rounded-lg border bg-muted/40 text-foreground shadow-2xs">
                      {selectedSpecificationCode || "--"}
                    </div>
                  </div>

                  {/* 3.3 Grade */}
                  <div className="flex items-center gap-3">
                    <Label className="min-w-[120px] max-w-[140px] shrink-0 text-xs font-medium text-foreground">
                      {isRtl ? "گرید متریال:" : "Grade:"}
                    </Label>
                    <div className="flex-1 min-w-0">
                      <Select
                        value={selectedGrade}
                        onValueChange={handleSelectGrade}
                        disabled={!selectedSpecification || gradeOptions.length === 0}
                      >
                        <SelectTrigger className="w-full text-xs h-9 bg-background">
                          <SelectValue
                            placeholder={
                              selectedSpecification
                                ? isRtl
                                  ? "انتخاب گرید..."
                                  : "Select Grade..."
                                : isRtl
                                  ? "ابتدا مرحله قبل را انتخاب کنید..."
                                  : "Select previous step first..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((opt) => (
                            <SelectItem key={opt.name} value={opt.name} className="text-xs">
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-14 sm:w-16 h-9 shrink-0 flex items-center justify-center font-mono font-bold text-xs rounded-lg border bg-muted/40 text-foreground shadow-2xs">
                      {selectedGradeCode || "--"}
                    </div>
                  </div>

                  {/* 3.4 Note (Class) */}
                  <div className="flex items-center gap-3">
                    <Label className="min-w-[120px] max-w-[140px] shrink-0 text-xs font-medium text-foreground">
                      {isRtl ? "کلاس کاری / یادداشت:" : "Note (Class):"}
                    </Label>
                    <div className="flex-1 min-w-0">
                      <Select
                        value={selectedClass}
                        onValueChange={handleSelectClass}
                        disabled={!selectedGrade || classOptions.length === 0}
                      >
                        <SelectTrigger className="w-full text-xs h-9 bg-background">
                          <SelectValue
                            placeholder={
                              selectedGrade
                                ? isRtl
                                  ? "انتخاب کلاس کاری..."
                                  : "Select Note (Class)..."
                                : isRtl
                                  ? "ابتدا مرحله قبل را انتخاب کنید..."
                                  : "Select previous step first..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {classOptions.map((opt) => (
                            <SelectItem key={opt.name} value={opt.name} className="text-xs">
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-14 sm:w-16 h-9 shrink-0 flex items-center justify-center font-mono font-bold text-xs rounded-lg border bg-muted/40 text-foreground shadow-2xs">
                      {selectedClassCode || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Raw Material Identity & Technical Specs Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="p-5 sm:p-6 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4.5 text-primary" />
                <span>{isRtl ? "شناسنامه و مشخصات فنی متریال" : "Raw Material Profile"}</span>
              </span>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
                Raw Material
              </Badge>
            </div>

            {/* Visual Box with ESP Brand & Material Preview */}
            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-muted/40 border border-border/50 flex flex-col items-center justify-center p-4">
              {activeDisplayRecord?.pic ? (
                <>
                  <img
                    src={activeDisplayRecord.pic}
                    alt={activeDisplayRecord.spec || "Material preview"}
                    className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setPreviewImage(activeDisplayRecord.pic || null)}
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(activeDisplayRecord.pic || null)}
                    className="absolute bottom-2 end-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    title={isRtl ? "مشاهده بزرگ‌تر تصویر" : "Enlarge Preview"}
                  >
                    <Maximize2 className="size-3.5" />
                  </button>
                </>
              ) : (
                /* Default ESP Raw Material Graphic matching legacy window brand */
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="relative size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/30 shadow-xs">
                    <Atom className="size-8 text-primary animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black text-foreground">
                      {activeDisplayRecord?.spec || "SA-516"} {activeDisplayRecord?.grade || "55"}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {activeDisplayRecord?.gm || "Carbon Steel"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Datasheet Details */}
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <span className="font-bold text-foreground text-xs flex items-center gap-1.5 pb-1 border-b border-border/30">
                <Info className="size-3.5 text-primary" />
                <span>{isRtl ? "ویژگی‌های مکانیکی و مهندسی" : "Engineering & Mechanical Specs"}</span>
              </span>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "استاندارد مرجع" : "Standard Group"}</span>
                  <span className="font-bold text-foreground">
                    {activeDisplayRecord?.standardGroup || "ASME / ASTM"}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "شناسه UNS" : "UNS Designation"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {activeDisplayRecord?.uns || "K02700"}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "استحکام کششی (Tensile)" : "Tensile Strength"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {activeDisplayRecord?.tensileMpa ? `${activeDisplayRecord.tensileMpa} MPa` : "--"}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "استحکام تسلیم (Yield)" : "Yield Strength"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {activeDisplayRecord?.yieldMpa ? `${activeDisplayRecord.yieldMpa} MPa` : "--"}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "چگالی (Density)" : "Density"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {activeDisplayRecord?.density ? `${activeDisplayRecord.density} kg/m³` : "7850 kg/m³"}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "محدوده دمایی" : "Temp Range"}</span>
                  <span className="font-bold font-mono text-foreground">
                    {activeDisplayRecord?.minTemp || "-46"}°C / {activeDisplayRecord?.maxTemp || "427"}°C
                  </span>
                </div>
              </div>

              {activeDisplayRecord?.nominalComposition && (
                <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-primary/5 border border-primary/20 mt-1">
                  <span className="text-[10px] text-muted-foreground">{isRtl ? "ترکیب نامی (Nominal Composition)" : "Nominal Composition"}</span>
                  <span className="font-bold text-foreground font-mono text-[11px]">
                    {activeDisplayRecord.nominalComposition}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Enlarged Image Dialog Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-6 bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <span>
                {activeDisplayRecord?.spec} {activeDisplayRecord?.grade} - {isRtl ? "تصویر فنی متریال" : "Technical Preview"}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[65vh] flex items-center justify-center p-4 bg-muted/20 rounded-xl overflow-hidden">
            {previewImage && (
              <img
                src={previewImage}
                alt="Enlarged technical view"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
