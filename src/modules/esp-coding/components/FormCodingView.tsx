"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Shapes,
  FileText,
  ExternalLink,
  Scale,
  Sparkles,
  ArrowRight,
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
  DialogFooter,
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
import { MaterialFormRecord, MaterialCodingCombination } from "../types";

function naturalCompare(a: string, b: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function FormCodingView() {
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Raw data from server
  const [forms, setForms] = useState<MaterialFormRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialCodingCombination[]>([]);
  const [loading, setLoading] = useState(true);

  // Panel 1: Raw Material Form selections
  const [selectedGeneralForm, setSelectedGeneralForm] = useState<string>("Flat Form");
  const [selectedCategoryForm, setSelectedCategoryForm] = useState<string>("General");
  const [selectedSubForm, setSelectedSubForm] = useState<string>("Plate");

  // Dynamic Dimension Inputs
  const [thkValue, setThkValue] = useState<string>("10.0");
  const [widthValue, setWidthValue] = useState<string>("1500");
  const [lengthValue, setLengthValue] = useState<string>("6000");
  const [isLengthMode, setIsLengthMode] = useState<boolean>(true); // true = Len., false = Coil

  // Panel 2: Material Selection
  const [isMetal, setIsMetal] = useState<boolean>(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");

  // Material Spec Modal State
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [modalBasicMaterial, setModalBasicMaterial] = useState<string>("");
  const [modalSubMaterial, setModalSubMaterial] = useState<string>("");
  const [modalCategory, setModalCategory] = useState<string>("");
  const [modalSpec, setModalSpec] = useState<string>("");
  const [modalGrade, setModalGrade] = useState<string>("");
  const [modalNoteClass, setModalNoteClass] = useState<string>("");

  // Panel 3: Quantity Selection
  const [quantityValue, setQuantityValue] = useState<string>("706.50");
  const [selectedUnit, setSelectedUnit] = useState<string>("Kg");

  // Mode: Forward (Comboboxes) vs Reverse (Code lookup)
  const [codingMode, setCodingMode] = useState<"forward" | "reverse">("forward");
  const [reverseCodeInput, setReverseCodeInput] = useState<string>("");
  const [reverseMatchStatus, setReverseMatchStatus] = useState<"idle" | "matched" | "not_found">("idle");
  const [matchedFormRecord, setMatchedFormRecord] = useState<MaterialFormRecord | null>(null);
  const [reverseDecodedDims, setReverseDecodedDims] = useState<{
    thk: string;
    width: string;
    length: string;
    thkCode: string;
    widthCode: string;
    lengthCode: string;
  } | null>(null);

  // Preview Modal for Image & PDF
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docModalTitle, setDocModalTitle] = useState("");
  const [docModalContent, setDocModalContent] = useState("");

  // Load forms and materials on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await EspCodingClientService.getFormHierarchyOptions();
        if (res.available && res.forms && res.materials) {
          setForms(res.forms);
          setMaterials(res.materials);

          // Find default Flat Form -> General -> Plate
          const plateForm = res.forms.find(
            (f) => f.generalForm === "Flat Form" && f.categoryForm === "General" && f.subForm === "Plate"
          ) || res.forms[0];

          if (plateForm) {
            setSelectedGeneralForm(plateForm.generalForm);
            setSelectedCategoryForm(plateForm.categoryForm);
            setSelectedSubForm(plateForm.subForm);

            if (plateForm.defaultDetailForms) {
              const parts = plateForm.defaultDetailForms.split(",").map((s) => s.trim());
              if (parts[0]) setThkValue(parts[0].includes(".") ? parts[0] : `${parts[0]}.0`);
              if (parts[1]) setWidthValue(parts[1]);
              if (parts[2]) setLengthValue(parts[2]);
            }
          }

          // Default Material: SA-516 70 or SA-516 55
          const defaultMat = res.materials.find(
            (m) => m.spec === "SA-516" && m.grade === "70"
          ) || res.materials.find(
            (m) => m.spec === "SA-516" && m.grade === "55"
          ) || res.materials[0];

          if (defaultMat) {
            setSelectedMaterialId(defaultMat.matId);
            setModalBasicMaterial(defaultMat.bm);
            setModalSubMaterial(defaultMat.sm);
            setModalCategory(defaultMat.gm);
            setModalSpec(defaultMat.spec);
            setModalGrade(defaultMat.grade);
            setModalNoteClass(defaultMat.classVal || "");
          }
        }
      } catch (err) {
        console.error("Failed to load form hierarchy options:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 1. Cascading Options for General Form, Category Form, and Sub-Form
  const generalFormOptions = useMemo(() => {
    const map = new Map<string, string>();
    forms.forEach((r) => {
      if (r.generalForm && !map.has(r.generalForm)) {
        map.set(r.generalForm, r.generalFormId);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.code, b.code));
  }, [forms]);

  const categoryFormOptions = useMemo(() => {
    if (!selectedGeneralForm) return [];
    const map = new Map<string, string>();
    forms.forEach((r) => {
      if (r.generalForm === selectedGeneralForm && r.categoryForm && !map.has(r.categoryForm)) {
        map.set(r.categoryForm, r.categoryFormId);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.code, b.code));
  }, [forms, selectedGeneralForm]);

  const subFormOptions = useMemo(() => {
    if (!selectedGeneralForm || !selectedCategoryForm) return [];
    const map = new Map<string, string>();
    forms.forEach((r) => {
      if (
        r.generalForm === selectedGeneralForm &&
        r.categoryForm === selectedCategoryForm &&
        r.subForm &&
        !map.has(r.subForm)
      ) {
        map.set(r.subForm, r.subFormId);
      }
    });
    return Array.from(map.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => naturalCompare(a.code, b.code));
  }, [forms, selectedGeneralForm, selectedCategoryForm]);

  // Current active MaterialFormRecord
  const currentFormRecord = useMemo(() => {
    if (!selectedGeneralForm || !selectedCategoryForm || !selectedSubForm) return null;
    return (
      forms.find(
        (f) =>
          f.generalForm === selectedGeneralForm &&
          f.categoryForm === selectedCategoryForm &&
          f.subForm === selectedSubForm
      ) || null
    );
  }, [forms, selectedGeneralForm, selectedCategoryForm, selectedSubForm]);

  // Codes for the current selection
  const generalFormCode = useMemo(() => {
    return generalFormOptions.find((g) => g.name === selectedGeneralForm)?.code || currentFormRecord?.generalFormId || "1";
  }, [generalFormOptions, selectedGeneralForm, currentFormRecord]);

  const categoryFormCode = useMemo(() => {
    return categoryFormOptions.find((c) => c.name === selectedCategoryForm)?.code || currentFormRecord?.categoryFormId || "1";
  }, [categoryFormOptions, selectedCategoryForm, currentFormRecord]);

  const subFormCode = useMemo(() => {
    return subFormOptions.find((s) => s.name === selectedSubForm)?.code || currentFormRecord?.subFormId || "1";
  }, [subFormOptions, selectedSubForm, currentFormRecord]);

  // Dynamic titles extracted from TitileDetailsForm
  const dynamicTitles = useMemo(() => {
    const raw = currentFormRecord?.titleDetailsForm || "";
    if (raw && raw !== "undefined") {
      const parts = raw.split(",").map((p) => p.trim());
      return {
        dim1: parts[0] || "Thickness ≥ 4.76 (mm)",
        dim2: parts[1] || "Width > 250 (mm)",
        dim3: "Length/Coil (mm)",
      };
    }
    // Fallback if not configured in excel
    return {
      dim1: "Thickness (mm)",
      dim2: "Width (mm)",
      dim3: "Length/Coil (mm)",
    };
  }, [currentFormRecord]);

  // Handler: When General Form changes, cascade downwards
  const handleGeneralFormChange = (newGf: string) => {
    setSelectedGeneralForm(newGf);

    // Find available categories for new General Form
    const availableCats = forms
      .filter((f) => f.generalForm === newGf)
      .map((f) => f.categoryForm)
      .filter((v, i, a) => a.indexOf(v) === i);

    const firstCat = availableCats[0] || "";
    setSelectedCategoryForm(firstCat);

    // Find available subforms for that category
    const availableSubs = forms
      .filter((f) => f.generalForm === newGf && f.categoryForm === firstCat)
      .map((f) => f.subForm)
      .filter((v, i, a) => a.indexOf(v) === i);

    const firstSub = availableSubs[0] || "";
    setSelectedSubForm(firstSub);

    // Update dimensions from new record
    const targetRecord = forms.find(
      (f) => f.generalForm === newGf && f.categoryForm === firstCat && f.subForm === firstSub
    );

    if (targetRecord?.defaultDetailForms) {
      const parts = targetRecord.defaultDetailForms.split(",").map((s) => s.trim());
      if (parts[0]) setThkValue(parts[0].includes(".") ? parts[0] : `${parts[0]}.0`);
      if (parts[1]) setWidthValue(parts[1]);
      if (parts[2]) setLengthValue(parts[2]);
    }
  };

  // Handler: When Category Form changes, cascade downwards
  const handleCategoryFormChange = (newCf: string) => {
    setSelectedCategoryForm(newCf);

    const availableSubs = forms
      .filter((f) => f.generalForm === selectedGeneralForm && f.categoryForm === newCf)
      .map((f) => f.subForm)
      .filter((v, i, a) => a.indexOf(v) === i);

    const firstSub = availableSubs[0] || "";
    setSelectedSubForm(firstSub);

    const targetRecord = forms.find(
      (f) => f.generalForm === selectedGeneralForm && f.categoryForm === newCf && f.subForm === firstSub
    );

    if (targetRecord?.defaultDetailForms) {
      const parts = targetRecord.defaultDetailForms.split(",").map((s) => s.trim());
      if (parts[0]) setThkValue(parts[0].includes(".") ? parts[0] : `${parts[0]}.0`);
      if (parts[1]) setWidthValue(parts[1]);
      if (parts[2]) setLengthValue(parts[2]);
    }
  };

  // Handler: When Sub-Form changes, update dynamic titles and default values
  const handleSubFormChange = (newSf: string) => {
    setSelectedSubForm(newSf);

    const targetRecord = forms.find(
      (f) => f.generalForm === selectedGeneralForm && f.categoryForm === selectedCategoryForm && f.subForm === newSf
    );

    if (targetRecord?.defaultDetailForms) {
      const parts = targetRecord.defaultDetailForms.split(",").map((s) => s.trim());
      if (parts[0]) setThkValue(parts[0].includes(".") ? parts[0] : `${parts[0]}.0`);
      if (parts[1]) setWidthValue(parts[1]);
      if (parts[2]) setLengthValue(parts[2]);
    }
  };

  // Dimension Codes:
  // Thk: (thk * 10) padded to 3 digits (e.g. 10.0 -> 100, 2.0 -> 020)
  const thkCode = useMemo(() => {
    const val = parseFloat(thkValue) || 0;
    const multiplied = Math.round(val * 10);
    return String(multiplied).padStart(3, "0");
  }, [thkValue]);

  // Width: padded to 4 digits (e.g. 1500 -> 1500, 200 -> 0200)
  const widthCode = useMemo(() => {
    const val = parseInt(widthValue, 10) || 0;
    return String(val).padStart(4, "0");
  }, [widthValue]);

  // Length: padded to 5 digits (e.g. 6000 -> 06000)
  const lengthCode = useMemo(() => {
    const val = parseInt(lengthValue, 10) || 0;
    return String(val).padStart(5, "0");
  }, [lengthValue]);

  // Form Code: R + gfId + cfId + sfId + '-' + thkCode + widthCode + lengthCode
  const generatedFormCode = useMemo(() => {
    return `R${generalFormCode}${categoryFormCode}${subFormCode}-${thkCode}${widthCode}${lengthCode}`;
  }, [generalFormCode, categoryFormCode, subFormCode, thkCode, widthCode, lengthCode]);

  // Current selected material record
  const currentMaterial = useMemo(() => {
    return materials.find((m) => m.matId === selectedMaterialId) || materials[0] || null;
  }, [materials, selectedMaterialId]);

  // Filtered materials by metal toggle
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const isMet = m.bm !== "Non-Metal";
      return isMetal ? isMet : !isMet;
    });
  }, [materials, isMetal]);

  // Form Reference text
  const formReference = useMemo(() => {
    if (!currentFormRecord) return "SA-20";
    const ref = currentFormRecord.referenceName || currentFormRecord.reference || "";
    if (ref && ref !== "--" && ref !== "undefined") {
      // Pick first reference or short reference
      const parts = ref.split(",");
      return parts[0]?.trim() || "SA-20";
    }
    return "SA-20";
  }, [currentFormRecord]);

  // Material Reference text
  const materialReference = useMemo(() => {
    if (!currentMaterial) return "ASME Sec. II Part A.";
    if (currentMaterial.refMaterial && currentMaterial.refMaterial !== "--") {
      if (currentMaterial.refMaterial.includes("Part A")) return "ASME Sec. II Part A.";
      if (currentMaterial.refMaterial.includes("Part B")) return "ASME Sec. II Part B.";
      return "ASME Sec. II Part A.";
    }
    if (currentMaterial.standardGroup) {
      return currentMaterial.standardGroup.includes("ASME")
        ? "ASME Sec. II Part A."
        : currentMaterial.standardGroup;
    }
    return "ASME Sec. II Part A.";
  }, [currentMaterial]);

  // Material Code format: M11-01010 or M11101010
  const formattedMaterialCode = useMemo(() => {
    if (!currentMaterial) return "M11-01010";
    const bm = currentMaterial.bmCode || "1";
    const sm = currentMaterial.smCode || "1";
    const gm = currentMaterial.gmCode || "1";
    const sp = (currentMaterial.specCode || "01").padStart(2, "0");
    const gr = (currentMaterial.gradeCode || "01").padStart(2, "0");
    const cl = currentMaterial.classCode || "0";
    return `M${bm}${sm}-${gm}${sp}${gr}${cl}`;
  }, [currentMaterial]);

  // Technical Picture
  const currentPicture = useMemo(() => {
    if (currentFormRecord?.refPic) return currentFormRecord.refPic;
    return "/coding-docs/Production Form/Plate2.png";
  }, [currentFormRecord]);

  // Physical Weight Calculation:
  // Weight (kg) = (Thickness (mm) * Width (mm) * Length (mm) * Density (kg/m3)) / 1,000,000,000
  const weightPerUnit = useMemo(() => {
    const t = parseFloat(thkValue) || 0;
    const w = parseFloat(widthValue) || 0;
    const l = parseFloat(lengthValue) || 0;
    const density = parseFloat(currentMaterial?.density || "7850") || 7850;

    const weightKg = (t * w * l * density) / 1000000000;
    return weightKg > 0 ? parseFloat(weightKg.toFixed(2)) : 706.50;
  }, [thkValue, widthValue, lengthValue, currentMaterial]);

  // Total Weight calculation based on Selected Unit & Value
  const totalWeight = useMemo(() => {
    const val = parseFloat(quantityValue) || 0;
    if (val <= 0) return 0;

    if (selectedUnit === "Kg") {
      return val;
    }
    if (selectedUnit === "Sheet" || selectedUnit === "Pcs") {
      return parseFloat((val * weightPerUnit).toFixed(2));
    }
    if (selectedUnit === "m") {
      const t = parseFloat(thkValue) || 0;
      const w = parseFloat(widthValue) || 0;
      const density = parseFloat(currentMaterial?.density || "7850") || 7850;
      const weightPerMeter = (t * w * 1000 * density) / 1000000000;
      return parseFloat((val * weightPerMeter).toFixed(2));
    }
    if (selectedUnit === "m²") {
      const t = parseFloat(thkValue) || 0;
      const density = parseFloat(currentMaterial?.density || "7850") || 7850;
      const weightPerSqMeter = (t * 1000 * 1000 * density) / 1000000000;
      return parseFloat((val * weightPerSqMeter).toFixed(2));
    }
    return val;
  }, [quantityValue, selectedUnit, weightPerUnit, thkValue, widthValue, currentMaterial]);

  // Synchronize default quantity with unit weight when unit changes to Kg
  useEffect(() => {
    if (selectedUnit === "Kg" && weightPerUnit > 0) {
      setQuantityValue(weightPerUnit.toFixed(2));
    }
  }, [weightPerUnit, selectedUnit]);

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success(isRtl ? "کد فرم با موفقیت کپی شد" : "Form code copied to clipboard");
  };

  // Reverse Lookup Handler
  const handleReverseLookup = (raw: string) => {
    const clean = raw.trim().toUpperCase().replace(/[^R0-9\-]/g, "");
    setReverseCodeInput(clean);

    if (!clean) {
      setReverseMatchStatus("idle");
      setMatchedFormRecord(null);
      setReverseDecodedDims(null);
      return;
    }

    // Pattern: R + 3 digits + - + 12 digits
    const m = clean.match(/^R?(\d)(\d)(\d)-?(\d{3})(\d{4})(\d{5})$/);
    if (m) {
      const [, gfId, cfId, sfId, tCode, wCode, lCode] = m;
      const matched = forms.find(
        (f) => f.generalFormId === gfId && f.categoryFormId === cfId && f.subFormId === sfId
      );

      if (matched) {
        setMatchedFormRecord(matched);
        const thkDecoded = (parseInt(tCode, 10) / 10).toFixed(1);
        const widthDecoded = parseInt(wCode, 10).toString();
        const lengthDecoded = parseInt(lCode, 10).toString();

        setReverseDecodedDims({
          thk: thkDecoded,
          width: widthDecoded,
          length: lengthDecoded,
          thkCode: tCode,
          widthCode: wCode,
          lengthCode: lCode,
        });

        // Update states for consistency
        setSelectedGeneralForm(matched.generalForm);
        setSelectedCategoryForm(matched.categoryForm);
        setSelectedSubForm(matched.subForm);
        setThkValue(thkDecoded);
        setWidthValue(widthDecoded);
        setLengthValue(lengthDecoded);

        setReverseMatchStatus("matched");
        toast.success(
          isRtl
            ? `فرم شناسایی شد: ${matched.generalForm} • ${matched.subForm}`
            : `Form identified: ${matched.generalForm} • ${matched.subForm}`
        );
        return;
      }
    }

    // Progressive prefix matching
    const prefixMatch = clean.match(/^R?(\d)(\d)?(\d)?/);
    if (prefixMatch) {
      const gfId = prefixMatch[1];
      const cfId = prefixMatch[2];
      const sfId = prefixMatch[3];

      const found = forms.find((f) => {
        if (gfId && f.generalFormId !== gfId) return false;
        if (cfId && f.categoryFormId !== cfId) return false;
        if (sfId && f.subFormId !== sfId) return false;
        return true;
      });

      if (found) {
        setMatchedFormRecord(found);
        setSelectedGeneralForm(found.generalForm);
        if (cfId) setSelectedCategoryForm(found.categoryForm);
        if (sfId) setSelectedSubForm(found.subForm);
        setReverseMatchStatus("matched");
        return;
      }
    }

    setMatchedFormRecord(null);
    setReverseDecodedDims(null);
    setReverseMatchStatus("not_found");
  };

  // Reset Handler
  const handleReset = () => {
    const plateForm = forms.find(
      (f) => f.generalForm === "Flat Form" && f.categoryForm === "General" && f.subForm === "Plate"
    ) || forms[0];

    if (plateForm) {
      setSelectedGeneralForm(plateForm.generalForm);
      setSelectedCategoryForm(plateForm.categoryForm);
      setSelectedSubForm(plateForm.subForm);
      setThkValue("10.0");
      setWidthValue("1500");
      setLengthValue("6000");
    }

    setIsMetal(true);
    setQuantityValue("706.50");
    setSelectedUnit("Kg");
    setReverseCodeInput("");
    setReverseMatchStatus("idle");
    setMatchedFormRecord(null);
    setReverseDecodedDims(null);
    toast.info(isRtl ? "تنظیمات به حالت اولیه بازگشت" : "Reset to default specifications");
  };

  // Open Document Modal
  const handleOpenDoc = (title: string, content: string) => {
    setDocModalTitle(title);
    setDocModalContent(content);
    setDocModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* ── Top Title & Mode Selector Bar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Shapes className="size-5 text-primary" />
            <span>{isRtl ? "کدینگ فرم متریال (Form Coding)" : "Form Coding"}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {codingMode === "forward"
              ? isRtl
                ? "انتخاب فرم، رده، ساب‌فرم، ابعاد وابسته، متریال، و محاسبه بلادرنگ وزن فیزیکی و صدور کد فرم"
                : "Dynamic dependent form specifications, dimensions, material assignment & real-time physical weight estimation"
              : isRtl
                ? "حالت معکوس: ورود کد فرم (مانند R111-100150006000) و استخراج بلادرنگ هندسه، متریال و وزن قطعه"
                : "Reverse lookup: Enter form code (e.g., R111-100150006000) to instantly decode geometry, specs & weight"}
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
                if (generatedFormCode) {
                  handleReverseLookup(generatedFormCode);
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

      {/* ── Reverse Mode Decoder Search Bar (when active) ── */}
      {codingMode === "reverse" && (
        <Card className="p-4 sm:p-5 rounded-2xl border-primary/30 bg-primary/5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <Search className="size-4.5 text-primary" />
              <span>{isRtl ? "ورود کد فرم جهت رمزگشایی" : "Enter Form Code to Decode"}</span>
            </span>
            {reverseMatchStatus === "matched" && (
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold gap-1">
                <Check className="size-3" />
                <span>{isRtl ? "فرم شناسایی شد" : "Form Identified"}</span>
              </Badge>
            )}
            {reverseMatchStatus === "not_found" && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold">
                {isRtl ? "کد در پایگاه داده یافت نشد" : "Code Not Found"}
              </Badge>
            )}
          </div>

          <div className="relative w-full">
            <Input
              type="text"
              value={reverseCodeInput}
              onChange={(e) => handleReverseLookup(e.target.value)}
              placeholder={isRtl ? "مثال: R111-100150006000" : "e.g. R111-100150006000"}
              className="font-mono text-sm sm:text-base tracking-wider uppercase h-11 pe-24 bg-background border-border/80 focus-visible:ring-primary/40 rounded-xl"
              dir="ltr"
            />
            <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleCopyCode(reverseCodeInput)}
                disabled={!reverseCodeInput}
                className="h-8 px-2.5 text-xs rounded-lg"
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Main Frame Content: Exactly Matching Screenshot Structure ── */}

      {/* ── Panel 1: Raw Material Form ── */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shapes className="size-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
              {isRtl ? "فرم متریال خام (Raw Material Form)" : "Raw Material Form"}
            </h2>
          </div>
          <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
            TBL_Material_Coding_New
          </Badge>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-6">
          {/* Main 2-Column Grid: Form & Dimensions on Left (8 cols) + Drawing on Right (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Cascades & Dimensions */}
            <div className="lg:col-span-8 flex flex-col gap-4 justify-between">
              {/* Row 1: General Form + Code & Thickness + Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* General Form */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80">
                      {isRtl ? "فرم عمومی (General Form)" : "General Form"}
                    </Label>
                    {codingMode === "forward" ? (
                      <Select value={selectedGeneralForm} onValueChange={handleGeneralFormChange}>
                        <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                          <SelectValue placeholder="Select General Form..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {generalFormOptions.map((g) => (
                            <SelectItem key={g.name} value={g.name} className="text-xs font-medium">
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-9 px-3 rounded-xl bg-muted/30 border border-border/50 text-xs font-bold flex items-center">
                        {selectedGeneralForm || "—"}
                      </div>
                    )}
                  </div>
                  <div className="w-16 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 text-center">
                      Code
                    </Label>
                    <div className="h-9 px-2 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                      {generalFormCode}
                    </div>
                  </div>
                </div>

                {/* Dimension 1: Thickness */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 truncate">
                      {dynamicTitles.dim1}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={thkValue}
                      disabled={codingMode === "reverse"}
                      onChange={(e) => setThkValue(e.target.value)}
                      className="h-9 rounded-xl text-xs font-mono bg-background"
                      dir="ltr"
                    />
                  </div>
                  <div className="w-16 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 text-center">
                      Code
                    </Label>
                    <div className="h-9 px-2 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                      {thkCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Category Form + Code & Width + Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Form */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80">
                      {isRtl ? "رده فرم (Category Form)" : "Category Form"}
                    </Label>
                    {codingMode === "forward" ? (
                      <Select value={selectedCategoryForm} onValueChange={handleCategoryFormChange}>
                        <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                          <SelectValue placeholder="Select Category Form..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {categoryFormOptions.map((c) => (
                            <SelectItem key={c.name} value={c.name} className="text-xs font-medium">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-9 px-3 rounded-xl bg-muted/30 border border-border/50 text-xs font-bold flex items-center">
                        {selectedCategoryForm || "—"}
                      </div>
                    )}
                  </div>
                  <div className="w-16 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 text-center">
                      Code
                    </Label>
                    <div className="h-9 px-2 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                      {categoryFormCode}
                    </div>
                  </div>
                </div>

                {/* Dimension 2: Width */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 truncate">
                      {dynamicTitles.dim2}
                    </Label>
                    <Input
                      type="number"
                      step="1"
                      value={widthValue}
                      disabled={codingMode === "reverse"}
                      onChange={(e) => setWidthValue(e.target.value)}
                      className="h-9 rounded-xl text-xs font-mono bg-background"
                      dir="ltr"
                    />
                  </div>
                  <div className="w-16 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 text-center">
                      Code
                    </Label>
                    <div className="h-9 px-2 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                      {widthCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Sub-Form + Code & Length/Coil + Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sub-Form */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80">
                      {isRtl ? "ساب‌فرم (Sub-Form)" : "Sub-Form"}
                    </Label>
                    {codingMode === "forward" ? (
                      <Select value={selectedSubForm} onValueChange={handleSubFormChange}>
                        <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                          <SelectValue placeholder="Select Sub-Form..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {subFormOptions.map((s) => (
                            <SelectItem key={s.name} value={s.name} className="text-xs font-medium">
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-9 px-3 rounded-xl bg-muted/30 border border-border/50 text-xs font-bold flex items-center">
                        {selectedSubForm || "—"}
                      </div>
                    )}
                  </div>
                  <div className="w-16 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 text-center">
                      Code
                    </Label>
                    <div className="h-9 px-2 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                      {subFormCode}
                    </div>
                  </div>
                </div>

                {/* Dimension 3: Length / Coil with Toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground/80">
                        {dynamicTitles.dim3}
                      </Label>
                      {/* Len vs Coil Pill Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsLengthMode(!isLengthMode)}
                        disabled={codingMode === "reverse"}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer select-none",
                          isLengthMode
                            ? "bg-rose-500 text-white shadow-2xs hover:bg-rose-600"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {isLengthMode ? "Len." : "Coil"}
                      </button>
                    </div>
                    <Input
                      type="number"
                      step="1"
                      value={lengthValue}
                      disabled={codingMode === "reverse"}
                      onChange={(e) => setLengthValue(e.target.value)}
                      className="h-9 rounded-xl text-xs font-mono bg-background"
                      dir="ltr"
                    />
                  </div>
                  <div className="w-16 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-foreground/80 text-center">
                      Code
                    </Label>
                    <div className="h-9 px-2 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                      {lengthCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Drawing / Photo Card */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <div
                onClick={() => setPreviewImage(currentPicture)}
                className="group relative flex-1 min-h-[160px] rounded-xl border border-border/60 bg-muted/10 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all p-2 shadow-2xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPicture}
                  alt={selectedSubForm || "Technical Form"}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium backdrop-blur-2xs">
                  <Maximize2 className="size-4" />
                  <span>{isRtl ? "بزرگ‌نمایی نقشه" : "Enlarge Drawing"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 1 Footer: Form Reference, Form Code, Action Buttons */}
          <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
            {/* Form Reference */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground/70">
                {isRtl ? "مرجع فرم (Form Reference):" : "Form Reference :"}
              </span>
              <span className="font-mono font-bold text-foreground">
                {formReference}
              </span>
            </div>

            {/* Animated Form Code */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground/70">
                {isRtl ? "کد فرم:" : "Form Code :"}
              </span>
              <div
                onClick={() => handleCopyCode(generatedFormCode)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm sm:text-base cursor-pointer hover:bg-emerald-500/20 transition-all"
                title={isRtl ? "کلیک جهت کپی کد" : "Click to copy code"}
              >
                <div className="flex items-center">
                  {generatedFormCode.split("").map((ch, idx) => (
                    <motion.span
                      key={`${idx}-${ch}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
                <Copy className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenDoc(
                  `Form Reference Specification - ${formReference}`,
                  `Official Standard: ${formReference}\nGeneral Form: ${selectedGeneralForm} (ID: ${generalFormCode})\nCategory: ${selectedCategoryForm} (ID: ${categoryFormCode})\nSub-Form: ${selectedSubForm} (ID: ${subFormCode})\nStandard Dimensions: Thk ${thkValue}mm, Width ${widthValue}mm, Length ${lengthValue}mm.\nCalculated Form Code: ${generatedFormCode}`
                )}
                className="h-8 px-3 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <FileText className="size-3.5 text-rose-500" />
                <span>PDF</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewImage(currentPicture)}
                className="h-8 px-3 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <ExternalLink className="size-3.5 text-primary" />
                <span>More</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Panel 2: Material Selection ── */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
              {isRtl ? "انتخاب متریال (Material Selection)" : "Material Selection"}
            </h2>
          </div>
          <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
            TBL_Material_New
          </Badge>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Top Row: Metal / Non-Metal Toggle + Material Combobox + PDF / More */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Metal / Non-Metal Toggle */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsMetal(!isMetal)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5",
                  isMetal
                    ? "bg-rose-500 text-white shadow-2xs hover:bg-rose-600"
                    : "bg-muted text-foreground/80 hover:bg-muted/80"
                )}
              >
                <span className="size-2 rounded-full bg-white animate-pulse" />
                <span>{isMetal ? "Metal" : "Non-Metal"}</span>
              </button>
            </div>

            {/* Material Dropdown */}
            <div className="flex-1 flex flex-col gap-1">
              <Select value={selectedMaterialId} onValueChange={(val) => setSelectedMaterialId(val)}>
                <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                  <SelectValue placeholder="Select Material (e.g. SA-516 70)..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {filteredMaterials.slice(0, 150).map((m) => (
                    <SelectItem key={m.matId} value={m.matId} className="text-xs font-medium">
                      {m.spec} {m.grade} {m.gm ? `(${m.gm})` : ""} - Density: {m.density || "7850"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenDoc(
                  `Material Specification Sheet - ${currentMaterial?.spec || "SA-516"} ${currentMaterial?.grade || "70"}`,
                  `Specification: ${currentMaterial?.spec || "SA-516"}\nGrade: ${currentMaterial?.grade || "70"}\nGroup: ${currentMaterial?.gm || "Carbon Steel"}\nStandard: ${currentMaterial?.standardGroup || "ASME/ASTM"}\nReference Document: ${currentMaterial?.refMaterial || "ASME Sec. II Part A."}\nDensity: ${currentMaterial?.density || "7850"} kg/m³\nTensile: ${currentMaterial?.tensileMpa || "485"} MPa | Yield: ${currentMaterial?.yieldMpa || "260"} MPa\nMaterial Code: ${formattedMaterialCode}`
                )}
                className="h-9 px-3 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <FileText className="size-3.5 text-rose-500" />
                <span>PDF</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentMaterial) {
                    setModalBasicMaterial(currentMaterial.bm);
                    setModalSubMaterial(currentMaterial.sm);
                    setModalCategory(currentMaterial.gm);
                    setModalSpec(currentMaterial.spec);
                    setModalGrade(currentMaterial.grade);
                    setModalNoteClass(currentMaterial.classVal || "");
                  }
                  setSpecModalOpen(true);
                }}
                className="h-9 px-3 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <ExternalLink className="size-3.5 text-primary" />
                <span>More</span>
              </Button>
            </div>
          </div>

          {/* Bottom Row: Material Reference, Material Coding, Action Buttons */}
          <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
            {/* Material Reference */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground/70">
                {isRtl ? "مرجع متریال (Material Reference):" : "Material Reference:"}
              </span>
              <span className="font-mono font-bold text-foreground">
                {materialReference}
              </span>
            </div>

            {/* Material Coding */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground/70">
                {isRtl ? "کد متریال:" : "Material Coding :"}
              </span>
              <div
                onClick={() => handleCopyCode(formattedMaterialCode)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-sm cursor-pointer hover:bg-cyan-500/20 transition-all"
                title={isRtl ? "کلیک جهت کپی کد" : "Click to copy code"}
              >
                <span>{formattedMaterialCode}</span>
                <Copy className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenDoc(
                  `Material Standard - ${materialReference}`,
                  `Official Standard: ${materialReference}\nSpecification: ${currentMaterial?.spec || "SA-516"}\nGrade: ${currentMaterial?.grade || "70"}\nMaterial Coding: ${formattedMaterialCode}`
                )}
                className="h-8 px-3 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <FileText className="size-3.5 text-rose-500" />
                <span>PDF</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSpecModalOpen(true)}
                className="h-8 px-3 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <ExternalLink className="size-3.5 text-primary" />
                <span>More</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Panel 3: Quantity Selection & Weight Physics Calculation ── */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
              {isRtl ? "محاسبه وزن و مقدار (Quantity Selection)" : "Quantity Selection"}
            </h2>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 text-muted-foreground">
            Density: {currentMaterial?.density || "7850"} kg/m³
          </Badge>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Top Row: Value & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            {/* Value */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {isRtl ? "مقدار (Value)" : "Value"}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                className="h-9 rounded-xl text-xs font-mono bg-background"
                dir="ltr"
              />
            </div>

            {/* Unit */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {isRtl ? "واحد (Unit)" : "Unit"}
              </Label>
              <Select value={selectedUnit} onValueChange={(val) => setSelectedUnit(val)}>
                <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                  <SelectValue placeholder="Unit..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kg" className="text-xs font-medium">Kg</SelectItem>
                  <SelectItem value="Sheet" className="text-xs font-medium">Sheet</SelectItem>
                  <SelectItem value="m" className="text-xs font-medium">m (Meter)</SelectItem>
                  <SelectItem value="m²" className="text-xs font-medium">m² (Square Meter)</SelectItem>
                  <SelectItem value="Pcs" className="text-xs font-medium">Pcs (Count)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bottom Row: Weight Per Unit & Total Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2 border-t border-border/30">
            {/* Weight Per Unit (Kg) */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {isRtl ? "وزن واحد فیزیکی (Weight Per Unit - Kg)" : "Weight Per Unit (Kg)"}
              </Label>
              <div className="h-9 px-3 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center text-foreground">
                {weightPerUnit.toFixed(2)}
              </div>
            </div>

            {/* Total Weight (Kg) */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">
                {isRtl ? "وزن کل فیزیکی (Total Weight - Kg)" : "Total Weight (Kg)"}
              </Label>
              <div className="h-9 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold flex items-center text-emerald-600 dark:text-emerald-400">
                {totalWeight.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Material Specification Dialog (Image 2 - ESP_Coding_Raw_Material_Type) ── */}
      <Dialog open={specModalOpen} onOpenChange={setSpecModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-border bg-card p-0 overflow-hidden">
          {/* Title Bar */}
          <div className="px-5 py-3.5 bg-muted/30 border-b border-border/40 flex items-center justify-between">
            <DialogTitle className="text-xs sm:text-sm font-bold text-foreground">
              ESP_Coding_Raw_Material_Type
            </DialogTitle>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-5">
            {/* Top: Basic Material & Sub-Material */}
            <div className="flex flex-col gap-3">
              {/* Basic Material */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs font-semibold text-foreground/80 shrink-0">
                  Basic Material:
                </span>
                <div className="flex-1">
                  <Input
                    value={modalBasicMaterial}
                    readOnly
                    className="h-8 rounded-lg text-xs bg-muted/20"
                  />
                </div>
                <div className="w-14 h-8 px-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                  {currentMaterial?.bmCode || "1"}
                </div>
              </div>

              {/* Sub-Material */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs font-semibold text-foreground/80 shrink-0">
                  Sub-Material:
                </span>
                <div className="flex-1">
                  <Input
                    value={modalSubMaterial}
                    readOnly
                    className="h-8 rounded-lg text-xs bg-muted/20"
                  />
                </div>
                <div className="w-14 h-8 px-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                  {currentMaterial?.smCode || "1"}
                </div>
              </div>
            </div>

            {/* Material Specification Box */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/10 flex flex-col gap-3">
              <span className="text-xs font-bold text-foreground/90 border-b border-border/40 pb-2">
                Material Specification
              </span>

              {/* Material Category */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-foreground/80 shrink-0">
                  Material Category:
                </span>
                <div className="flex-1">
                  <Input
                    value={modalCategory}
                    readOnly
                    className="h-8 rounded-lg text-xs bg-muted/20"
                  />
                </div>
                <div className="w-14 h-8 px-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                  {currentMaterial?.gmCode || "1"}
                </div>
              </div>

              {/* Specification */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-foreground/80 shrink-0">
                  Specification:
                </span>
                <div className="flex-1">
                  <Input
                    value={modalSpec}
                    readOnly
                    className="h-8 rounded-lg text-xs bg-muted/20"
                  />
                </div>
                <div className="w-14 h-8 px-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                  {currentMaterial?.specCode || "01"}
                </div>
              </div>

              {/* Grade */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-foreground/80 shrink-0">
                  Grade:
                </span>
                <div className="flex-1">
                  <Input
                    value={modalGrade}
                    readOnly
                    className="h-8 rounded-lg text-xs bg-muted/20"
                  />
                </div>
                <div className="w-14 h-8 px-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                  {currentMaterial?.gradeCode || "01"}
                </div>
              </div>

              {/* Note (Class) */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-foreground/80 shrink-0">
                  Note (Class):
                </span>
                <div className="flex-1">
                  <Input
                    value={modalNoteClass || "--"}
                    readOnly
                    className="h-8 rounded-lg text-xs bg-muted/20"
                  />
                </div>
                <div className="w-14 h-8 px-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono font-bold flex items-center justify-center text-primary">
                  {currentMaterial?.classCode || "0"}
                </div>
              </div>
            </div>

            {/* Bottom Row: Material Code + OK & Close */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground/80">
                  Material Code:
                </span>
                <div className="px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 font-mono font-bold text-xs">
                  {formattedMaterialCode}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setSpecModalOpen(false)}
                className="h-8 px-4 text-xs rounded-xl"
              >
                OK & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Technical Drawing Fullscreen Zoom Modal ── */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl rounded-2xl p-4 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <span>
                {selectedGeneralForm} • {selectedSubForm}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[60vh] max-h-[500px] flex items-center justify-center bg-muted/20 rounded-xl overflow-hidden p-4">
            {previewImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage}
                alt="Enlarged Form Drawing"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Document / Specification Sheet Modal ── */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-5 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="size-4 text-rose-500" />
              <span>{docModalTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 font-mono text-xs whitespace-pre-wrap leading-relaxed text-foreground/90">
            {docModalContent}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDocModalOpen(false)}
              className="text-xs rounded-xl"
            >
              {isRtl ? "بستن" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
