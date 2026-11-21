"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Atom,
  ShieldCheck,
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

          // Default selection matching authoritative example (SA-516 Gr.55)
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
    setReverseCodeInput(cleanCode);

    if (!cleanCode) {
      setReverseMatchStatus("idle");
      setMatchedCombination(null);
      return;
    }

    const match = combinationsWithCodes.get(cleanCode);
    if (match) {
      setReverseMatchStatus("matched");
      setMatchedCombination(match);

      // Sync active state
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
      if (cleanCode.length >= 7) {
        toast.error(isRtl ? "کد در پایگاه داده متریال یافت نشد" : "Material code not found in database", {
          description: cleanCode,
        });
      }
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

  // Dynamic combobox definitions with numerical step indices
  const comboConfig = [
    {
      id: "bm" as const,
      num: 1,
      labelFa: "متریال پایه (Basic Material)",
      labelEn: "Basic Material",
      value: selectedBasicMaterial,
      options: basicMaterialOptions,
      placeholderFa: "انتخاب متریال پایه...",
      placeholderEn: "Select Basic Material...",
      disabled: basicMaterialOptions.length === 0,
      code: selectedBasicMaterialCode,
      onChange: handleSelectBasicMaterial,
    },
    {
      id: "sm" as const,
      num: 2,
      labelFa: "زیرگروه متریال (Sub-Material)",
      labelEn: "Sub-Material",
      value: selectedSubMaterial,
      options: subMaterialOptions,
      placeholderFa: selectedBasicMaterial
        ? "انتخاب زیرگروه متریال..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedBasicMaterial
        ? "Select Sub-Material..."
        : "Select previous step first...",
      disabled: !selectedBasicMaterial || subMaterialOptions.length === 0,
      code: selectedSubMaterialCode,
      onChange: handleSelectSubMaterial,
    },
    {
      id: "gm" as const,
      num: 3,
      labelFa: "رده متریال (Material Category)",
      labelEn: "Material Category",
      value: selectedMaterialCategory,
      options: materialCategoryOptions,
      placeholderFa: selectedSubMaterial
        ? "انتخاب رده متریال..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedSubMaterial
        ? "Select Material Category..."
        : "Select previous step first...",
      disabled: !selectedSubMaterial || materialCategoryOptions.length === 0,
      code: selectedMaterialCategoryCode,
      onChange: handleSelectMaterialCategory,
      isFramedHeader: true,
    },
    {
      id: "spec" as const,
      num: 4,
      labelFa: "مشخصه فنی (Specification - SPEC)",
      labelEn: "Specification",
      value: selectedSpecification,
      options: specificationOptions,
      placeholderFa: selectedMaterialCategory
        ? "انتخاب استاندارد / مشخصه فنی..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedMaterialCategory
        ? "Select Specification..."
        : "Select previous step first...",
      disabled: !selectedMaterialCategory || specificationOptions.length === 0,
      code: selectedSpecificationCode,
      onChange: handleSelectSpecification,
    },
    {
      id: "grade" as const,
      num: 5,
      labelFa: "گرید متریال (Grade)",
      labelEn: "Grade",
      value: selectedGrade,
      options: gradeOptions,
      placeholderFa: selectedSpecification
        ? "انتخاب گرید..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedSpecification
        ? "Select Grade..."
        : "Select previous step first...",
      disabled: !selectedSpecification || gradeOptions.length === 0,
      code: selectedGradeCode,
      onChange: handleSelectGrade,
    },
    {
      id: "class" as const,
      num: 6,
      labelFa: "کلاس کاری و یادداشت (Note / Class)",
      labelEn: "Note (Class)",
      value: selectedClass,
      options: classOptions,
      placeholderFa: selectedGrade
        ? "انتخاب کلاس کاری..."
        : "ابتدا مرحله قبل را انتخاب کنید...",
      placeholderEn: selectedGrade
        ? "Select Note (Class)..."
        : "Select previous step first...",
      disabled: !selectedGrade || classOptions.length === 0,
      code: selectedClassCode,
      onChange: handleSelectClass,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Top Title & Mode Selector Bar (Exactly matching ProductCodingView style) */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Atom className="size-5 text-primary" />
            <span>{isRtl ? "کدگذاری و ثبت مشخصات متریال" : "Material Coding & Specifications"}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {codingMode === "forward"
              ? isRtl
                ? "انتخاب مشخصات، فیلتر به هم وابسته کومبوباکس‌ها و صدور آنی کد متریال"
                : "Interdependent cascading specification filters & real-time material code generation"
              : isRtl
                ? "حالت معکوس: وارد کردن کد متریال و استخراج آنی مشخصات متالورژیکی و مکانیکی"
                : "Reverse mode: Enter material code to instantly decode specifications & mechanical properties"}
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
              <span>{isRtl ? "تولید با مشخصات" : "Forward (Specs)"}</span>
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
        {/* Left Form: Code Preview on top + Comboboxes stacked under each other (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-5 sm:p-6 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4.5 text-primary" />
                <span>{isRtl ? "سلسله‌مراتب و مشخصات متریال" : "Material Specifications"}</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {matchingCount} {isRtl ? "رکورد معتبر" : "Valid records"}
              </Badge>
            </div>

            {/* Reverse Mode: Interactive Code Input and Instant Decoder */}
            {codingMode === "reverse" ? (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Search className="size-4 text-primary" />
                    <span>{isRtl ? "ورود کد متریال جهت استخراج مشخصات" : "Enter Material Code to Decode"}</span>
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
                      value={reverseCodeInput}
                      onChange={(e) => handleReverseLookup(e.target.value)}
                      placeholder={isRtl ? "کد متریال را وارد یا الصاق کنید (مثال: M11101020)..." : "Enter or paste material code (e.g. M11101020)..."}
                      className="h-11 rounded-xl text-sm font-mono tracking-wider uppercase ps-3 pe-8 bg-background border-primary/30"
                      dir="ltr"
                    />
                    {reverseCodeInput && (
                      <button
                        type="button"
                        onClick={() => handleReverseLookup("")}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleReverseLookup(reverseCodeInput)}
                    className="h-11 rounded-xl px-4 text-xs font-bold gap-1.5 cursor-pointer bg-primary text-primary-foreground"
                  >
                    <Search className="size-3.5" />
                    <span>{isRtl ? "استخراج" : "Decode"}</span>
                  </Button>
                </div>

                {/* Quick Test Samples */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span className="text-muted-foreground text-[10px]">{isRtl ? "نمونه‌های سریع:" : "Quick samples:"}</span>
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
                      onClick={() => handleReverseLookup(s.code)}
                      className="px-2 py-0.5 rounded-md bg-background border border-border/60 hover:border-primary/50 text-[10px] font-mono text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {s.code} ({s.label})
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Forward Mode: Live Animated Material Code Preview (Identical to ProductCodingView) */
              <div className="p-3.5 sm:p-4 rounded-xl bg-background border border-border/60 shadow-2xs flex items-center justify-between gap-3 overflow-hidden">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    MaterialCode
                  </span>
                  <div className="flex items-center gap-0.5 mt-1 overflow-x-auto py-1" dir="ltr">
                    {(generatedMaterialCode || "M--------").split("").map((char, idx) => (
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
                  onClick={() => handleCopyCode(generatedMaterialCode)}
                  className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  title="Copy Code"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            )}

            {codingMode === "forward" ? (
              /* Forward Mode: Comboboxes stacked vertically with numbered steps and code badges */
              <div className="flex flex-col divide-y divide-border/25">
                {comboConfig.map((item) => {
                  const label = isRtl ? item.labelFa : item.labelEn;
                  const placeholder = isRtl ? item.placeholderFa : item.placeholderEn;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 first:pt-0 last:pb-0",
                        item.isFramedHeader && "relative"
                      )}
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

                      {/* Combobox + Code Box */}
                      <div className="flex-1 min-w-0 flex items-center gap-2.5">
                        <Select
                          value={item.value}
                          onValueChange={(val) => item.onChange(val)}
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

                        {/* Individual Code Box next to combobox */}
                        <div className="w-12 sm:w-14 h-10 shrink-0 flex items-center justify-center font-mono font-bold text-xs rounded-xl border border-border/60 bg-muted/30 text-foreground shadow-2xs">
                          {item.code || "-"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Reverse Mode: Decoded Specifications View (NO comboboxes) */
              <div className="flex flex-col gap-3">
                {matchedCombination || selectedBasicMaterial ? (
                  <div className="flex flex-col divide-y divide-border/25 rounded-xl border border-border/50 bg-background/50 overflow-hidden shadow-2xs">
                    {[
                      {
                        num: 1,
                        label: isRtl ? "متریال پایه (Basic Material)" : "Basic Material",
                        val: matchedCombination?.bm || selectedBasicMaterial,
                        code: matchedCombination?.bmCode || selectedBasicMaterialCode,
                      },
                      {
                        num: 2,
                        label: isRtl ? "زیرگروه متریال (Sub-Material)" : "Sub-Material",
                        val: matchedCombination?.sm || selectedSubMaterial,
                        code: matchedCombination?.smCode || selectedSubMaterialCode,
                      },
                      {
                        num: 3,
                        label: isRtl ? "رده متریال (Material Category)" : "Material Category",
                        val: matchedCombination?.gm || selectedMaterialCategory,
                        code: matchedCombination?.gmCode || selectedMaterialCategoryCode,
                      },
                      {
                        num: 4,
                        label: isRtl ? "مشخصه فنی (Specification - SPEC)" : "Specification (SPEC)",
                        val: matchedCombination?.spec || selectedSpecification,
                        code: matchedCombination?.specCode || selectedSpecificationCode,
                      },
                      {
                        num: 5,
                        label: isRtl ? "گرید متریال (Grade)" : "Grade",
                        val: matchedCombination?.grade || selectedGrade,
                        code: matchedCombination?.gradeCode || selectedGradeCode,
                      },
                      {
                        num: 6,
                        label: isRtl ? "کلاس کاری و یادداشت (Note / Class)" : "Note (Class)",
                        val: (matchedCombination?.classVal !== undefined ? matchedCombination.classVal : selectedClass) || "--",
                        code: matchedCombination?.classCode || selectedClassCode,
                      },
                    ].map((row) => (
                      <div
                        key={row.num}
                        className="flex items-center justify-between gap-4 p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="size-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs fa-num shrink-0">
                            {row.num}
                          </span>
                          <span className="text-xs sm:text-[13px] font-semibold text-muted-foreground">
                            {row.label}:
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-[13px] font-bold text-foreground">
                            {row.val || "—"}
                          </span>
                          {row.code && (
                            <Badge variant="outline" className="font-mono text-[11px] bg-muted/40">
                              {row.code}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border border-dashed border-border/60 flex flex-col items-center justify-center text-center gap-2 bg-muted/5">
                    <Search className="size-8 text-muted-foreground/40" />
                    <span className="text-xs font-semibold text-foreground">
                      {isRtl ? "در انتظار ورود کد متریال" : "Waiting for Material Code"}
                    </span>
                    <p className="text-[11px] text-muted-foreground max-w-sm">
                      {isRtl
                        ? "کد متریال را در کادر بالا وارد نمایید تا مشخصات فنی و متالورژیکی به صورت خودکار استخراج شود."
                        : "Enter or paste material code above to automatically decode technical and mechanical specifications."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel: Raw Material Identity & Technical Specs Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          <Card className="p-4 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>{isRtl ? "شناسنامه و مشخصات فنی متریال" : "Raw Material Profile"}</span>
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
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
                /* Default ESP Raw Material Graphic */
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
