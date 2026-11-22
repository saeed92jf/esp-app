"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shapes,
  Atom,
  Copy,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Maximize2,
  Filter,
  Check,
  Scale,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Link2,
  Unlink,
  Zap,
  FileText,
  Info,
  ExternalLink,
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
import { MaterialFormRecord, MaterialCodingCombination } from "../types";

function naturalCompare(a: string, b: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export const PITCH_TYPE_OPTIONS = [
  { name: "Triangular Pitch", nameFa: "گام مثلثی", code: "1" },
  { name: "Square Pitch", nameFa: "گام مربعی", code: "2" },
  { name: "Staggered Pitch", nameFa: "گام متناوب", code: "3" },
  { name: "Diamond Pitch", nameFa: "گام لوزی", code: "4" },
];

export const HOLE_SIZE_OPTIONS = [
  { name: "0.5", code: "01" },
  { name: "0.8", code: "02" },
  { name: "1.0", code: "03" },
  { name: "1.2", code: "04" },
  { name: "1.5", code: "05" },
  { name: "2.0", code: "06" },
  { name: "2.5", code: "07" },
  { name: "3.0", code: "08" },
  { name: "4.0", code: "09" },
  { name: "5.0", code: "10" },
  { name: "6.0", code: "11" },
  { name: "8.0", code: "12" },
  { name: "10", code: "13" },
  { name: "12", code: "14" },
  { name: "15", code: "15" },
  { name: "20", code: "16" },
];

export const PITCH_SIZE_OPTIONS = [
  { name: "1", code: "01" },
  { name: "1.5", code: "02" },
  { name: "2", code: "03" },
  { name: "2.5", code: "04" },
  { name: "3", code: "05" },
  { name: "3.5", code: "06" },
  { name: "4", code: "07" },
  { name: "5", code: "08" },
  { name: "6", code: "09" },
  { name: "8", code: "10" },
  { name: "10", code: "11" },
  { name: "12", code: "12" },
  { name: "15", code: "13" },
  { name: "16", code: "14" },
  { name: "20", code: "15" },
  { name: "25", code: "16" },
];

interface FormAndMaterialCodingViewProps {
  initialFocus?: "form" | "material" | "both";
}

export function FormAndMaterialCodingView({
  initialFocus = "both",
}: FormAndMaterialCodingViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Server Data
  const [forms, setForms] = useState<MaterialFormRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialCodingCombination[]>([]);
  const [loading, setLoading] = useState(true);

  // Mode: Forward (Combos) vs Reverse (Code lookup)
  const [codingMode, setCodingMode] = useState<"forward" | "reverse">("forward");
  const [reverseFormCodeInput, setReverseFormCodeInput] = useState<string>("");
  const [reverseMatCodeInput, setReverseMatCodeInput] = useState<string>("");

  // Filter Toggle
  const [filterMaterialByForm, setFilterMaterialByForm] = useState<boolean>(true);

  // Preview Image Modal
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    src: string;
    title: string;
    subtitle?: string;
  }>({ isOpen: false, src: "", title: "" });

  // ==========================================
  // PANEL A: FORM SELECTIONS
  // ==========================================
  const [selectedGeneralForm, setSelectedGeneralForm] = useState<string>("Flat Form");
  const [selectedCategoryForm, setSelectedCategoryForm] = useState<string>("General");
  const [selectedSubForm, setSelectedSubForm] = useState<string>("Plate");

  // Dynamic Dimensions (Covering all 39 cases)
  const [thkValue, setThkValue] = useState<string>("10.0");
  const [widthValue, setWidthValue] = useState<string>("1500");
  const [lengthValue, setLengthValue] = useState<string>("6000");
  const [isLengthMode, setIsLengthMode] = useState<boolean>(true);

  // Specialized Dimension values for other forms
  const [specDim1, setSpecDim1] = useState<string>("1/2\""); // NPS or Type or Standard
  const [specDim2, setSpecDim2] = useState<string>("Welding Neck (Sch. STD)"); // Schedule or Size
  const [specDim3, setSpecDim3] = useState<string>("150# (R.F.)"); // Class or Length

  // Perforated Sheet Dimensions
  const [pitchTypeValue, setPitchTypeValue] = useState<string>("Triangular Pitch");
  const [holeSizeValue, setHoleSizeValue] = useState<string>("0.5");
  const [pitchSizeValue, setPitchSizeValue] = useState<string>("1");

  // ==========================================
  // PANEL B: MATERIAL SELECTIONS
  // ==========================================
  const [selectedBasicMaterial, setSelectedBasicMaterial] = useState<string>("Metal-Group");
  const [selectedSubMaterial, setSelectedSubMaterial] = useState<string>("Ferritic");
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>("Carbon Steel");
  const [selectedSpecification, setSelectedSpecification] = useState<string>("SA-516");
  const [selectedGrade, setSelectedGrade] = useState<string>("70");
  const [selectedClass, setSelectedClass] = useState<string>("--");

  // Physical Quantity & Weight
  const [quantityValue, setQuantityValue] = useState<string>("1");
  const [selectedUnit, setSelectedUnit] = useState<string>("Kg");

  // UI States matching desktop software
  const [isMetal, setIsMetal] = useState<boolean>(true);
  const [showDetailedMaterial, setShowDetailedMaterial] = useState<boolean>(false);
  const [moreModal, setMoreModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    content: React.ReactNode | null;
  }>({
    isOpen: false,
    title: "",
    subtitle: "",
    content: null,
  });

  // ==========================================
  // 1. INITIAL LOAD
  // ==========================================
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await EspCodingClientService.getFormHierarchyOptions();
        if (res.available && res.forms && res.materials) {
          setForms(res.forms);
          setMaterials(res.materials);

          const plateForm =
            res.forms.find(
              (f) =>
                f.generalForm === "Flat Form" &&
                f.categoryForm === "General" &&
                f.subForm === "Plate"
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

          const defaultMat =
            res.materials.find((m) => m.spec === "SA-516" && m.grade === "70") ||
            res.materials[0];

          if (defaultMat) {
            setSelectedBasicMaterial(defaultMat.bm);
            setSelectedSubMaterial(defaultMat.sm);
            setSelectedMaterialCategory(defaultMat.gm);
            setSelectedSpecification(defaultMat.spec);
            setSelectedGrade(defaultMat.grade);
            setSelectedClass(defaultMat.classVal || "--");
          }
        }
      } catch (err) {
        console.error("Failed to load hierarchy options:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ==========================================
  // FORM SELECTIONS DERIVATIONS
  // ==========================================
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
      if (
        r.generalForm === selectedGeneralForm &&
        r.categoryForm &&
        !map.has(r.categoryForm)
      ) {
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

  const generalFormCode = useMemo(() => {
    return (
      generalFormOptions.find((g) => g.name === selectedGeneralForm)?.code ||
      currentFormRecord?.generalFormId ||
      "1"
    );
  }, [generalFormOptions, selectedGeneralForm, currentFormRecord]);

  const categoryFormCode = useMemo(() => {
    return (
      categoryFormOptions.find((c) => c.name === selectedCategoryForm)?.code ||
      currentFormRecord?.categoryFormId ||
      "1"
    );
  }, [categoryFormOptions, selectedCategoryForm, currentFormRecord]);

  const subFormCode = useMemo(() => {
    return (
      subFormOptions.find((s) => s.name === selectedSubForm)?.code ||
      currentFormRecord?.subFormId ||
      "1"
    );
  }, [subFormOptions, selectedSubForm, currentFormRecord]);

  const currentPicture = useMemo(() => {
    if (selectedCategoryForm === "Perforated Sheet") {
      if (selectedSubForm === "Slot Hole") return "/coding-docs/Production Form/PerfSlot.png";
      if (selectedSubForm === "Square Hole") return "/coding-docs/Production Form/PerfSquare.png";
      if (selectedSubForm === "Rectangular Hole") return "/coding-docs/Production Form/PerfRec.png";
      if (selectedSubForm === "Hexagonal Hole") return "/coding-docs/Production Form/PerfHex.png";
      return "/coding-docs/Production Form/PerfRound.png";
    }
    if (currentFormRecord?.refPic) return currentFormRecord.refPic;
    return "/coding-docs/Production Form/Plate2.png";
  }, [currentFormRecord, selectedCategoryForm, selectedSubForm]);

  const formReference = useMemo(() => {
    if (selectedCategoryForm === "Perforated Sheet") return "SA-20";
    if (!currentFormRecord) return "SA-20";
    const ref = currentFormRecord.referenceName || currentFormRecord.reference || "";
    if (ref && ref !== "--" && ref !== "undefined") {
      return ref.split(",")[0]?.trim() || "SA-20";
    }
    if (selectedGeneralForm === "Forge Form") return "ASME B16.5";
    if (selectedGeneralForm === "Cylinder Form") return "ASME B36.10";
    if (selectedGeneralForm === "Fitting Form") return "ASME B16.9";
    if (selectedGeneralForm === "Connection Form") return "DIN 933 / ASME B18.2.1";
    return "SA-20";
  }, [currentFormRecord, selectedGeneralForm, selectedCategoryForm]);

  // Derived codes for Perforated Sheet
  const pitchTypeCode = useMemo(() => {
    return PITCH_TYPE_OPTIONS.find((p) => p.name === pitchTypeValue)?.code || "1";
  }, [pitchTypeValue]);

  const holeSizeCode = useMemo(() => {
    return (
      HOLE_SIZE_OPTIONS.find((h) => h.name === holeSizeValue)?.code ||
      HOLE_SIZE_OPTIONS.find((h) => parseFloat(h.name) === parseFloat(holeSizeValue))?.code ||
      "01"
    );
  }, [holeSizeValue]);

  const pitchSizeCode = useMemo(() => {
    return (
      PITCH_SIZE_OPTIONS.find((p) => p.name === pitchSizeValue)?.code ||
      PITCH_SIZE_OPTIONS.find((p) => parseFloat(p.name) === parseFloat(pitchSizeValue))?.code ||
      "01"
    );
  }, [pitchSizeValue]);

  // Dynamic titles and labels for Form dimensions
  const dynamicFormDimLabels = useMemo(() => {
    const gf = selectedGeneralForm;
    const cf = selectedCategoryForm;

    if (gf === "Flat Form") {
      if (cf === "Perforated Sheet") {
        return {
          dim1: isRtl ? "نوع گام" : "Pitch Type",
          dim2: isRtl ? "قطر سوراخ (mm)" : "Hole Size (mm)",
          dim3: isRtl ? "فاصله گام (mm)" : "Pitch Size (mm)",
          isFlat: true,
          isPerforated: true,
        };
      }

      return {
        dim1: isRtl ? "ضخامت ورق (mm)" : "Thickness (mm)",
        dim2: isRtl ? "عرض ورق (mm)" : "Width (mm)",
        dim3: isLengthMode
          ? isRtl
            ? "طول شاخه (mm)"
            : "Length (mm)"
          : isRtl
          ? "کویل"
          : "Coil",
        isFlat: true,
        isPerforated: false,
      };
    }
    if (gf === "Forge Form" && cf === "Standard Flange") {
      return {
        dim1: isRtl ? "سایز اسمی (اینچ NPS)" : "Nominal Size (NPS inch)",
        dim2: isRtl ? "نوع اتصال و رده (Type/Sch)" : "Connection Type & Sch",
        dim3: isRtl ? "کلاس فشاری و پیشانی (Class/Face)" : "Pressure Class & Face",
        isFlat: false,
        isPerforated: false,
      };
    }
    if (gf === "Cylinder Form" && cf === "Pipe") {
      return {
        dim1: isRtl ? "سایز اسمی لوله (NPS)" : "Pipe Nominal Size (NPS)",
        dim2: isRtl ? "رده ضخامت (Schedule)" : "Wall Schedule",
        dim3: isRtl ? "طول شاخه لوله (mm)" : "Pipe Length (mm)",
        isFlat: false,
        isPerforated: false,
      };
    }
    if (gf === "Fitting Form") {
      return {
        dim1: isRtl ? "سایز نامی اتصال" : "Nominal Size",
        dim2: isRtl ? "رده ضخامت (Schedule)" : "Wall Schedule",
        dim3: isRtl ? "زاویه یا ابعاد فرعی" : "Angle / Dimension",
        isFlat: false,
        isPerforated: false,
      };
    }
    if (gf === "Connection Form") {
      return {
        dim1: isRtl ? "استاندارد پیچ و مهره" : "Fastener Standard",
        dim2: isRtl ? "سایز رزوه (Metric / Inch)" : "Thread Size",
        dim3: isRtl ? "طول کارگیر پیچ (mm)" : "Bolt Length (mm)",
        isFlat: false,
        isPerforated: false,
      };
    }

    return {
      dim1: isRtl ? "مشخصه اول ابعادی" : "Dimension 1",
      dim2: isRtl ? "مشخصه دوم ابعادی" : "Dimension 2",
      dim3: isRtl ? "مشخصه سوم ابعادی" : "Dimension 3",
      isFlat: false,
      isPerforated: false,
    };
  }, [selectedGeneralForm, selectedCategoryForm, isLengthMode, isRtl]);

  // Code generation for Form dimensions
  const formDimensionCode = useMemo(() => {
    const gf = selectedGeneralForm;
    const cf = selectedCategoryForm;

    if (gf === "Flat Form") {
      if (cf === "Perforated Sheet") {
        return `${pitchTypeCode}${holeSizeCode}${pitchSizeCode}`;
      }

      const t = parseFloat(thkValue) || 10.0;
      const tCode = String(Math.round(t * 10)).padStart(3, "0");
      const w = parseInt(widthValue, 10) || 1500;
      const wCode = String(w).padStart(4, "0");
      if (!isLengthMode) {
        return `${tCode}${wCode}C`;
      }
      const l = parseInt(lengthValue, 10) || 6000;
      const lCode = String(l).padStart(5, "0");
      return `${tCode}${wCode}${lCode}`;
    }

    if (gf === "Forge Form" && cf === "Standard Flange") {
      const npsMap: Record<string, string> = {
        "1/2\"": "04",
        "3/4\"": "05",
        "1\"": "06",
        "1.5\"": "08",
        "2\"": "10",
        "3\"": "12",
        "4\"": "14",
        "6\"": "16",
        "8\"": "18",
        "10\"": "20",
        "12\"": "22",
      };
      const nCode = npsMap[specDim1] || "04";
      const tCode = specDim2.includes("Welding Neck") ? "16" : "01";
      const cCode = specDim3.includes("300") ? "13" : specDim3.includes("600") ? "14" : "12";
      return `${nCode}${tCode}${cCode}`;
    }

    if (gf === "Cylinder Form" && cf === "Pipe") {
      return "150506000";
    }

    if (gf === "Fitting Form") {
      return "040590";
    }

    if (gf === "Connection Form") {
      return "0101080";
    }

    return "100150006000";
  }, [
    selectedGeneralForm,
    selectedCategoryForm,
    pitchTypeCode,
    holeSizeCode,
    pitchSizeCode,
    thkValue,
    widthValue,
    lengthValue,
    isLengthMode,
    specDim1,
    specDim2,
    specDim3,
  ]);

  const generatedFormCode = useMemo(() => {
    return `R${generalFormCode}${categoryFormCode}${subFormCode}-${formDimensionCode}`;
  }, [generalFormCode, categoryFormCode, subFormCode, formDimensionCode]);

  // ==========================================
  // 2. FORM-AWARE MATERIAL FILTERING
  // ==========================================
  const allowableFormTokens = useMemo(() => {
    const raw = currentFormRecord?.materialForm || "";
    if (!raw) return [];
    return raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }, [currentFormRecord]);

  const allowableMaterials = useMemo(() => {
    if (!filterMaterialByForm || allowableFormTokens.length === 0) {
      return materials;
    }

    const filtered = materials.filter((m) => {
      const mForm = (m.form || "").trim().toLowerCase();
      if (!mForm || mForm === "--") return true;

      return allowableFormTokens.some(
        (tok) => mForm.includes(tok) || tok.includes(mForm)
      );
    });

    return filtered.length > 0 ? filtered : materials;
  }, [materials, filterMaterialByForm, allowableFormTokens]);

  // Cascading Combos for Material
  const basicMaterialOptions = useMemo(() => {
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (m.bm) set.add(m.bm);
    });
    return Array.from(set).sort(naturalCompare);
  }, [allowableMaterials]);

  const subMaterialOptions = useMemo(() => {
    if (!selectedBasicMaterial) return [];
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (m.bm === selectedBasicMaterial && m.sm) set.add(m.sm);
    });
    return Array.from(set).sort(naturalCompare);
  }, [allowableMaterials, selectedBasicMaterial]);

  const categoryOptions = useMemo(() => {
    if (!selectedBasicMaterial || !selectedSubMaterial) return [];
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (
        m.bm === selectedBasicMaterial &&
        m.sm === selectedSubMaterial &&
        m.gm
      ) {
        set.add(m.gm);
      }
    });
    return Array.from(set).sort(naturalCompare);
  }, [allowableMaterials, selectedBasicMaterial, selectedSubMaterial]);

  const specOptions = useMemo(() => {
    if (!selectedBasicMaterial || !selectedSubMaterial || !selectedMaterialCategory)
      return [];
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (
        m.bm === selectedBasicMaterial &&
        m.sm === selectedSubMaterial &&
        m.gm === selectedMaterialCategory &&
        m.spec
      ) {
        set.add(m.spec);
      }
    });
    return Array.from(set).sort(naturalCompare);
  }, [allowableMaterials, selectedBasicMaterial, selectedSubMaterial, selectedMaterialCategory]);

  const gradeOptions = useMemo(() => {
    if (
      !selectedBasicMaterial ||
      !selectedSubMaterial ||
      !selectedMaterialCategory ||
      !selectedSpecification
    )
      return [];
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (
        m.bm === selectedBasicMaterial &&
        m.sm === selectedSubMaterial &&
        m.gm === selectedMaterialCategory &&
        m.spec === selectedSpecification &&
        m.grade
      ) {
        set.add(m.grade);
      }
    });
    return Array.from(set).sort(naturalCompare);
  }, [
    allowableMaterials,
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
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (
        m.bm === selectedBasicMaterial &&
        m.sm === selectedSubMaterial &&
        m.gm === selectedMaterialCategory &&
        m.spec === selectedSpecification &&
        m.grade === selectedGrade
      ) {
        set.add(m.classVal || "--");
      }
    });
    return Array.from(set).sort(naturalCompare);
  }, [
    allowableMaterials,
    selectedBasicMaterial,
    selectedSubMaterial,
    selectedMaterialCategory,
    selectedSpecification,
    selectedGrade,
  ]);

  const activeMaterial = useMemo(() => {
    return (
      allowableMaterials.find(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === selectedSubMaterial &&
          m.gm === selectedMaterialCategory &&
          m.spec === selectedSpecification &&
          m.grade === selectedGrade &&
          (m.classVal || "--") === selectedClass
      ) ||
      allowableMaterials.find(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === selectedSubMaterial &&
          m.gm === selectedMaterialCategory &&
          m.spec === selectedSpecification &&
          m.grade === selectedGrade
      ) ||
      allowableMaterials.find(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === selectedSubMaterial &&
          m.gm === selectedMaterialCategory &&
          m.spec === selectedSpecification
      ) ||
      allowableMaterials[0] ||
      null
    );
  }, [
    allowableMaterials,
    selectedBasicMaterial,
    selectedSubMaterial,
    selectedMaterialCategory,
    selectedSpecification,
    selectedGrade,
    selectedClass,
  ]);

  const generatedMaterialCode = useMemo(() => {
    if (!activeMaterial) return "M11-01010";
    const bm = activeMaterial.bmCode || "1";
    const sm = activeMaterial.smCode || "1";
    const gm = activeMaterial.gmCode || "1";
    const sp = (activeMaterial.specCode || "01").padStart(2, "0");
    const gr = (activeMaterial.gradeCode || "01").padStart(2, "0");
    const cl = activeMaterial.classCode || "0";
    return `M${bm}${sm}-${gm}${sp}${gr}${cl}`;
  }, [activeMaterial]);

  const compositeCode = useMemo(() => {
    return `${generatedFormCode} / ${generatedMaterialCode}`;
  }, [generatedFormCode, generatedMaterialCode]);

  // Large Technical Image for Material
  const materialPicture = useMemo(() => {
    if (activeMaterial?.pic) return activeMaterial.pic;
    const spec = (selectedSpecification || "").toUpperCase();
    const cat = (selectedMaterialCategory || "").toUpperCase();
    if (
      cat.includes("CARBON") ||
      spec.includes("516") ||
      spec.includes("285") ||
      spec.includes("36")
    ) {
      return "/coding-docs/Production Form/Plate.png";
    }
    if (
      cat.includes("STAINLESS") ||
      spec.includes("240") ||
      spec.includes("304") ||
      spec.includes("316")
    ) {
      return "/coding-docs/Production Form/Sheet.png";
    }
    if (
      spec.includes("106") ||
      spec.includes("333") ||
      spec.includes("312") ||
      cat.includes("PIPE")
    ) {
      return "/coding-docs/Production Form/Transfer Pipe.png";
    }
    if (
      spec.includes("105") ||
      spec.includes("350") ||
      spec.includes("182") ||
      cat.includes("FORGE")
    ) {
      return "/coding-docs/Production Form/BossForge.png";
    }
    return "/coding-docs/Production Form/Plate.png";
  }, [activeMaterial, selectedSpecification, selectedMaterialCategory]);

  // Auto-Sync Material when Form changes
  useEffect(() => {
    if (!filterMaterialByForm || allowableMaterials.length === 0) return;

    const isValid = allowableMaterials.some(
      (m) =>
        m.bm === selectedBasicMaterial &&
        m.sm === selectedSubMaterial &&
        m.gm === selectedMaterialCategory &&
        m.spec === selectedSpecification &&
        m.grade === selectedGrade
    );

    if (!isValid) {
      const target = allowableMaterials[0];
      if (target) {
        setSelectedBasicMaterial(target.bm);
        setSelectedSubMaterial(target.sm);
        setSelectedMaterialCategory(target.gm);
        setSelectedSpecification(target.spec);
        setSelectedGrade(target.grade);
        setSelectedClass(target.classVal || "--");
      }
    }
  }, [allowableMaterials, filterMaterialByForm]);

  // ==========================================
  // PHYSICAL WEIGHT CALCULATION
  // ==========================================
  const weightPerUnit = useMemo(() => {
    const density = parseFloat(activeMaterial?.density || "7850") || 7850;
    const gf = selectedGeneralForm;
    const cf = selectedCategoryForm;

    if (gf === "Flat Form") {
      const t = parseFloat(thkValue) || 10.0;
      const w = parseFloat(widthValue) || 1500;
      const l = parseFloat(lengthValue) || 6000;
      const weightKg = (t * w * l * density) / 1000000000;
      return weightKg > 0 ? parseFloat(weightKg.toFixed(2)) : 706.5;
    }

    if (gf === "Cylinder Form" && cf === "Pipe") return 32.64;
    if (gf === "Forge Form") {
      if (cf === "Standard Flange") return 0.51;
      if (cf === "Self Reinforce Flange") return 6.86;
      if (cf === "Body Flange") return 46.95;
      return 5.2;
    }
    if (gf === "Connection Form") return 0.12;
    return 10.0;
  }, [selectedGeneralForm, selectedCategoryForm, thkValue, widthValue, lengthValue, activeMaterial]);

  const totalWeight = useMemo(() => {
    const val = parseFloat(quantityValue) || 1;
    if (selectedUnit === "Kg") return val;
    return parseFloat((val * weightPerUnit).toFixed(2));
  }, [quantityValue, selectedUnit, weightPerUnit]);

  // Document PDF Opener and More Modal Handlers
  const handleOpenPdf = (refName: string) => {
    if (!refName || refName === "--") {
      toast.info(isRtl ? "مستند پی‌دی‌اف برای این فرم تعریف نشده است" : "No PDF document defined for this form");
      return;
    }
    const clean = refName.split(",")[0]?.trim() || refName.trim();
    let pdfUrl = `/coding-docs/ASME Sec II/${clean} 2023.pdf`;
    if (clean.includes("SA-20")) {
      pdfUrl = "/coding-docs/ASME Sec II/SA-20 2023.pdf";
    } else if (clean.includes("ASME Sec. II")) {
      pdfUrl = "/coding-docs/ASME Sec II/SA-20 2023.pdf";
    }
    window.open(pdfUrl, "_blank");
  };

  const handleOpenMore = (section: "form" | "material") => {
    if (section === "form") {
      setMoreModal({
        isOpen: true,
        title: isRtl ? `اطلاعات تکمیلی فرم: ${selectedSubForm}` : `Technical Form Specifications: ${selectedSubForm}`,
        subtitle: `${formReference} | Code: ${generatedFormCode}`,
        content: (
          <div className="flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
              <div>
                <span className="text-muted-foreground">{isRtl ? "فرم عمومی:" : "General Form:"} </span>
                <span className="font-bold">{selectedGeneralForm} ({generalFormCode})</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isRtl ? "دسته‌بندی فرم:" : "Category Form:"} </span>
                <span className="font-bold">{selectedCategoryForm} ({categoryFormCode})</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isRtl ? "زیرفرم قطعه:" : "Sub-Form:"} </span>
                <span className="font-bold">{selectedSubForm} ({subFormCode})</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isRtl ? "کد کامل فرم:" : "Full Form Code:"} </span>
                <span className="font-mono font-bold text-emerald-600">{generatedFormCode}</span>
              </div>
            </div>
            {selectedCategoryForm === "Perforated Sheet" ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1.5">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {isRtl ? "مشخصات ورق مشبک (Perforated Sheet):" : "Perforated Sheet Engineering Details:"}
                </span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRtl ? `نوع گام: ${pitchTypeValue} (کد ${pitchTypeCode})` : `Pitch Type: ${pitchTypeValue} (Code ${pitchTypeCode})`}</li>
                  <li>{isRtl ? `قطر سوراخ: ${holeSizeValue} mm (کد ${holeSizeCode})` : `Hole Size: ${holeSizeValue} mm (Code ${holeSizeCode})`}</li>
                  <li>{isRtl ? `فاصله گام: ${pitchSizeValue} mm (کد ${pitchSizeCode})` : `Pitch Size: ${pitchSizeValue} mm (Code ${pitchSizeCode})`}</li>
                  <li>{isRtl ? "استاندارد مرجع ورق‌های مشبک: DIN 24041 / ISO 7806" : "Standard Reference: DIN 24041 / ISO 7806"}</li>
                </ul>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-1.5">
                <span className="font-bold text-primary">
                  {isRtl ? "مشخصات ابعادی ورق / مقطع:" : "Dimensional Geometry Specifications:"}
                </span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRtl ? `ضخامت: ${thkValue} mm` : `Thickness: ${thkValue} mm`}</li>
                  <li>{isRtl ? `عرض: ${widthValue} mm` : `Width: ${widthValue} mm`}</li>
                  <li>{isLengthMode ? (isRtl ? `طول شاخه: ${lengthValue} mm` : `Length: ${lengthValue} mm`) : (isRtl ? "حالت کویل (کد C)" : "Coil Mode (Code C)")}</li>
                  <li>{isRtl ? "تلرانس ابعادی طبق استاندارد ASME SA-20 / ASTM A6" : "Dimensional Tolerances per ASME SA-20 / ASTM A6"}</li>
                </ul>
              </div>
            )}
          </div>
        ),
      });
    } else {
      setMoreModal({
        isOpen: true,
        title: isRtl ? `اطلاعات متالورژیکی متریال: ${selectedSpecification} ${selectedGrade}` : `Material Metallurgy: ${selectedSpecification} ${selectedGrade}`,
        subtitle: `${selectedMaterialCategory} | UNS: ${activeMaterial?.uns || "K02700"} | Code: ${generatedMaterialCode}`,
        content: (
          <div className="flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
              <div>
                <span className="text-muted-foreground">{isRtl ? "استاندارد مرجع:" : "Specification:"} </span>
                <span className="font-bold">{selectedSpecification}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isRtl ? "گرید / درجه:" : "Grade:"} </span>
                <span className="font-bold">{selectedGrade}</span>
              </div>
              <div>
                <span className="text-muted-foreground">UNS Number: </span>
                <span className="font-mono font-bold text-emerald-600">{activeMaterial?.uns || "K02700"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isRtl ? "کد متریال:" : "Material Code:"} </span>
                <span className="font-mono font-bold text-cyan-600">{generatedMaterialCode}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-card border border-border/50">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "چگالی" : "Density"}</span>
                <span className="font-bold font-mono text-sm">{activeMaterial?.density || "7850"}</span>
                <span className="text-[10px] text-muted-foreground block">kg/m³</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border/50">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "استحکام کششی" : "Tensile"}</span>
                <span className="font-bold font-mono text-sm">{activeMaterial?.tensileMpa || "485"}</span>
                <span className="text-[10px] text-muted-foreground block">MPa</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border/50">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "استحکام تسلیم" : "Yield"}</span>
                <span className="font-bold font-mono text-sm">{activeMaterial?.yieldMpa || "260"}</span>
                <span className="text-[10px] text-muted-foreground block">MPa</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border/50">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "دمای کاری" : "Temp"}</span>
                <span className="font-bold font-mono text-sm">{activeMaterial?.minTemp || "-48"}~{activeMaterial?.maxTemp || "538"}</span>
                <span className="text-[10px] text-muted-foreground block">°C</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/50 text-[11px] text-muted-foreground">
              {isRtl
                ? "مرجع متالورژیکی: ASME Section II, Part A (Ferrous Material Specifications) / Part D (Properties)"
                : "Metallurgical Reference: ASME Section II, Part A (Ferrous Material Specifications) / Part D (Properties)"}
            </div>
          </div>
        ),
      });
    }
  };

  // ==========================================
  // CASCADING HANDLERS
  // ==========================================
  const handleGeneralFormChange = (newGf: string) => {
    setSelectedGeneralForm(newGf);
    const availableCats = forms
      .filter((f) => f.generalForm === newGf)
      .map((f) => f.categoryForm)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstCat = availableCats[0] || "";
    setSelectedCategoryForm(firstCat);

    const availableSubs = forms
      .filter((f) => f.generalForm === newGf && f.categoryForm === firstCat)
      .map((f) => f.subForm)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstSub = availableSubs[0] || "";
    setSelectedSubForm(firstSub);

    const target = forms.find(
      (f) => f.generalForm === newGf && f.categoryForm === firstCat && f.subForm === firstSub
    );
    if (target?.defaultDetailForms) {
      const parts = target.defaultDetailForms.split(",").map((s) => s.trim());
      if (parts[0]) setThkValue(parts[0].includes(".") ? parts[0] : `${parts[0]}.0`);
      if (parts[1]) setWidthValue(parts[1]);
      if (parts[2]) setLengthValue(parts[2]);
    }
  };

  const handleCategoryFormChange = (newCf: string) => {
    setSelectedCategoryForm(newCf);
    const availableSubs = forms
      .filter((f) => f.generalForm === selectedGeneralForm && f.categoryForm === newCf)
      .map((f) => f.subForm)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstSub = availableSubs[0] || "";
    setSelectedSubForm(firstSub);

    if (newCf === "Perforated Sheet") {
      setPitchTypeValue("Triangular Pitch");
      setHoleSizeValue("0.5");
      setPitchSizeValue("1");
    }
  };

  const handleBasicMaterialChange = (newBm: string) => {
    setSelectedBasicMaterial(newBm);
    const validSubs = allowableMaterials
      .filter((m) => m.bm === newBm && m.sm)
      .map((m) => m.sm)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstSm = validSubs[0] || "";
    setSelectedSubMaterial(firstSm);

    const validGms = allowableMaterials
      .filter((m) => m.bm === newBm && m.sm === firstSm && m.gm)
      .map((m) => m.gm)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstGm = validGms[0] || "";
    setSelectedMaterialCategory(firstGm);

    const validSpecs = allowableMaterials
      .filter((m) => m.bm === newBm && m.sm === firstSm && m.gm === firstGm && m.spec)
      .map((m) => m.spec)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstSpec = validSpecs[0] || "";
    setSelectedSpecification(firstSpec);

    const validGrades = allowableMaterials
      .filter(
        (m) =>
          m.bm === newBm &&
          m.sm === firstSm &&
          m.gm === firstGm &&
          m.spec === firstSpec &&
          m.grade
      )
      .map((m) => m.grade)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstGrade = validGrades[0] || "";
    setSelectedGrade(firstGrade);

    setSelectedClass("--");
  };

  const handleSubMaterialChange = (newSm: string) => {
    setSelectedSubMaterial(newSm);
    const validGms = allowableMaterials
      .filter((m) => m.bm === selectedBasicMaterial && m.sm === newSm && m.gm)
      .map((m) => m.gm)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstGm = validGms[0] || "";
    setSelectedMaterialCategory(firstGm);

    const validSpecs = allowableMaterials
      .filter(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === newSm &&
          m.gm === firstGm &&
          m.spec
      )
      .map((m) => m.spec)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstSpec = validSpecs[0] || "";
    setSelectedSpecification(firstSpec);

    const validGrades = allowableMaterials
      .filter(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === newSm &&
          m.gm === firstGm &&
          m.spec === firstSpec &&
          m.grade
      )
      .map((m) => m.grade)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstGrade = validGrades[0] || "";
    setSelectedGrade(firstGrade);

    setSelectedClass("--");
  };

  const handleCategoryChange = (newGm: string) => {
    setSelectedMaterialCategory(newGm);
    const validSpecs = allowableMaterials
      .filter(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === selectedSubMaterial &&
          m.gm === newGm &&
          m.spec
      )
      .map((m) => m.spec)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstSpec = validSpecs[0] || "";
    setSelectedSpecification(firstSpec);

    const validGrades = allowableMaterials
      .filter(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === selectedSubMaterial &&
          m.gm === newGm &&
          m.spec === firstSpec &&
          m.grade
      )
      .map((m) => m.grade)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstGrade = validGrades[0] || "";
    setSelectedGrade(firstGrade);

    setSelectedClass("--");
  };

  const handleSpecChange = (newSpec: string) => {
    setSelectedSpecification(newSpec);
    const validGrades = allowableMaterials
      .filter(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === selectedSubMaterial &&
          m.gm === selectedMaterialCategory &&
          m.spec === newSpec &&
          m.grade
      )
      .map((m) => m.grade)
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstGrade = validGrades[0] || "";
    setSelectedGrade(firstGrade);

    setSelectedClass("--");
  };

  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
    const validClasses = allowableMaterials
      .filter(
        (m) =>
          m.bm === selectedBasicMaterial &&
          m.sm === selectedSubMaterial &&
          m.gm === selectedMaterialCategory &&
          m.spec === selectedSpecification &&
          m.grade === newGrade
      )
      .map((m) => m.classVal || "--")
      .filter((v, i, a) => a.indexOf(v) === i);
    const firstClass = validClasses[0] || "--";
    setSelectedClass(firstClass);
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} ${isRtl ? "کپی شد" : "copied"}`);
  };

  const handleReset = () => {
    setSelectedGeneralForm("Flat Form");
    setSelectedCategoryForm("General");
    setSelectedSubForm("Plate");
    setThkValue("10.0");
    setWidthValue("1500");
    setLengthValue("6000");
    setIsLengthMode(true);
    setPitchTypeValue("Triangular Pitch");
    setHoleSizeValue("0.5");
    setPitchSizeValue("1");

    setSelectedBasicMaterial("Metal-Group");
    setSelectedSubMaterial("Ferritic");
    setSelectedMaterialCategory("Carbon Steel");
    setSelectedSpecification("SA-516");
    setSelectedGrade("70");
    setSelectedClass("--");
    toast.info(isRtl ? "تنظیمات به حالت پیش‌فرض بازگشت" : "Reset to defaults");
  };

  // Reverse Lookup Handler
  const handleReverseFormLookup = (code: string) => {
    const clean = code.trim().toUpperCase().replace(/[^R0-9A-Z\-]/g, "");
    setReverseFormCodeInput(clean);

    const m = clean.match(/^R?(\d)(\d)(\d)-?([0-9A-Z]+)$/);
    if (m) {
      const [, gfId, cfId, sfId, dimPart] = m;
      const matched = forms.find(
        (f) =>
          f.generalFormId === gfId &&
          f.categoryFormId === cfId &&
          f.subFormId === sfId
      );
      if (matched) {
        setSelectedGeneralForm(matched.generalForm);
        setSelectedCategoryForm(matched.categoryForm);
        setSelectedSubForm(matched.subForm);

        if (matched.generalForm === "Flat Form") {
          if (matched.categoryForm === "Perforated Sheet") {
            if (dimPart && dimPart.length >= 5) {
              const pCode = dimPart[0];
              const hCode = dimPart.slice(1, 3);
              const psCode = dimPart.slice(3, 5);
              const foundP = PITCH_TYPE_OPTIONS.find((p) => p.code === pCode);
              if (foundP) setPitchTypeValue(foundP.name);
              const foundH = HOLE_SIZE_OPTIONS.find((h) => h.code === hCode);
              if (foundH) setHoleSizeValue(foundH.name);
              const foundPs = PITCH_SIZE_OPTIONS.find((ps) => ps.code === psCode);
              if (foundPs) setPitchSizeValue(foundPs.name);
            }
          } else {
            if (dimPart.endsWith("C")) {
              setIsLengthMode(false);
              const tRaw = dimPart.slice(0, 3);
              const wRaw = dimPart.slice(3, 7);
              if (tRaw) setThkValue((parseInt(tRaw, 10) / 10).toFixed(1));
              if (wRaw) setWidthValue(String(parseInt(wRaw, 10)));
            } else if (dimPart.length >= 12) {
              setIsLengthMode(true);
              const tRaw = dimPart.slice(0, 3);
              const wRaw = dimPart.slice(3, 7);
              const lRaw = dimPart.slice(7, 12);
              if (tRaw) setThkValue((parseInt(tRaw, 10) / 10).toFixed(1));
              if (wRaw) setWidthValue(String(parseInt(wRaw, 10)));
              if (lRaw) setLengthValue(String(parseInt(lRaw, 10)));
            }
          }
        }
      }
    }
  };

  const handleReverseMaterialLookup = (code: string) => {
    const clean = code.trim().toUpperCase().replace(/[^M0-9\-]/g, "");
    setReverseMatCodeInput(clean);

    const cleanNoHyphen = clean.replace(/-/g, "");
    const match = materials.find((m) => {
      const mClean = m.materialCode.replace(/-/g, "").toUpperCase();
      return mClean === cleanNoHyphen;
    });

    if (match) {
      setSelectedBasicMaterial(match.bm);
      setSelectedSubMaterial(match.sm);
      setSelectedMaterialCategory(match.gm);
      setSelectedSpecification(match.spec);
      setSelectedGrade(match.grade);
      setSelectedClass(match.classVal || "--");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground animate-pulse">
          {isRtl ? "در حال بارگذاری فرم و متریال..." : "Loading Form & Material..."}
        </span>
      </div>
    );
  }

  const isPerforated = dynamicFormDimLabels.isPerforated;

  // Configurations for the 6 rows of Form Coding
  const formRowConfig = [
    {
      id: "gf",
      num: 1,
      labelFa: "فرم عمومی",
      labelEn: "General Form",
      isCombo: true,
      value: selectedGeneralForm,
      onChange: handleGeneralFormChange,
      options: generalFormOptions.map((g) => ({ name: g.name, value: g.name, code: g.code })),
      currentCode: generalFormCode,
    },
    {
      id: "cf",
      num: 2,
      labelFa: "دسته‌بندی فرم",
      labelEn: "Category Form",
      isCombo: true,
      value: selectedCategoryForm,
      onChange: handleCategoryFormChange,
      options: categoryFormOptions.map((c) => ({ name: c.name, value: c.name, code: c.code })),
      currentCode: categoryFormCode,
    },
    {
      id: "sf",
      num: 3,
      labelFa: "زیرفرم قطعه",
      labelEn: "Sub-Form",
      isCombo: true,
      value: selectedSubForm,
      onChange: setSelectedSubForm,
      options: subFormOptions.map((s) => ({ name: s.name, value: s.name, code: s.code })),
      currentCode: subFormCode,
    },
    {
      id: "dim1",
      num: 4,
      labelFa: dynamicFormDimLabels.dim1,
      labelEn: dynamicFormDimLabels.dim1,
      isCombo: isPerforated || (!dynamicFormDimLabels.isFlat && selectedGeneralForm === "Forge Form"),
      value: isPerforated ? pitchTypeValue : dynamicFormDimLabels.isFlat ? thkValue : specDim1,
      onChange: (val: string) => {
        if (isPerforated) setPitchTypeValue(val);
        else if (dynamicFormDimLabels.isFlat) setThkValue(val);
        else setSpecDim1(val);
      },
      options: isPerforated
        ? PITCH_TYPE_OPTIONS.map((p) => ({
            name: isRtl ? `${p.name} (${p.nameFa})` : p.name,
            value: p.name,
            code: p.code,
          }))
        : ["1/2\"", "3/4\"", "1\"", "1.5\"", "2\"", "3\"", "4\"", "6\"", "8\"", "10\"", "12\""].map((s) => ({
            name: s,
            value: s,
            code: s,
          })),
      isNumberInput: dynamicFormDimLabels.isFlat && !isPerforated,
      currentCode: isPerforated
        ? pitchTypeCode
        : dynamicFormDimLabels.isFlat
        ? String(Math.round((parseFloat(thkValue) || 10.0) * 10)).padStart(3, "0")
        : (specDim1 === "1/2\"" ? "04" : "06"),
    },
    {
      id: "dim2",
      num: 5,
      labelFa: dynamicFormDimLabels.dim2,
      labelEn: dynamicFormDimLabels.dim2,
      isCombo: isPerforated || (!dynamicFormDimLabels.isFlat && selectedGeneralForm === "Forge Form"),
      value: isPerforated ? holeSizeValue : dynamicFormDimLabels.isFlat ? widthValue : specDim2,
      onChange: (val: string) => {
        if (isPerforated) setHoleSizeValue(val);
        else if (dynamicFormDimLabels.isFlat) setWidthValue(val);
        else setSpecDim2(val);
      },
      options: isPerforated
        ? HOLE_SIZE_OPTIONS.map((h) => ({
            name: h.name,
            value: h.name,
            code: h.code,
          }))
        : [
            "Welding Neck (Sch. STD)",
            "Blind",
            "Slip-On",
            "Socket Weld",
            "Lap Joint",
          ].map((t) => ({ name: t, value: t, code: t })),
      isNumberInput: dynamicFormDimLabels.isFlat && !isPerforated,
      currentCode: isPerforated
        ? holeSizeCode
        : dynamicFormDimLabels.isFlat
        ? String(parseInt(widthValue, 10) || 1500).padStart(4, "0")
        : (specDim2.includes("Welding Neck") ? "16" : "01"),
    },
    {
      id: "dim3",
      num: 6,
      labelFa: dynamicFormDimLabels.dim3,
      labelEn: dynamicFormDimLabels.dim3,
      isCombo: isPerforated || (!dynamicFormDimLabels.isFlat && selectedGeneralForm === "Forge Form"),
      value: isPerforated
        ? pitchSizeValue
        : dynamicFormDimLabels.isFlat
        ? isLengthMode
          ? lengthValue
          : (isRtl ? "کویل" : "Coil")
        : specDim3,
      disabled: dynamicFormDimLabels.isFlat && !isPerforated && !isLengthMode,
      onChange: (val: string) => {
        if (isPerforated) setPitchSizeValue(val);
        else if (dynamicFormDimLabels.isFlat) {
          if (isLengthMode) setLengthValue(val);
        } else setSpecDim3(val);
      },
      options: isPerforated
        ? PITCH_SIZE_OPTIONS.map((p) => ({
            name: p.name,
            value: p.name,
            code: p.code,
          }))
        : ["150# (R.F.)", "300# (R.F.)", "600# (R.F.)", "150# (R.T.J.)"].map((c) => ({
            name: c,
            value: c,
            code: c,
          })),
      isNumberInput: dynamicFormDimLabels.isFlat && !isPerforated && isLengthMode,
      currentCode: isPerforated
        ? pitchSizeCode
        : dynamicFormDimLabels.isFlat
        ? isLengthMode
          ? String(parseInt(lengthValue, 10) || 6000).padStart(5, "0")
          : "C"
        : (specDim3.includes("300") ? "13" : "12"),
      extraToggle: dynamicFormDimLabels.isFlat && !isPerforated ? (
        <button
          type="button"
          onClick={() => setIsLengthMode(!isLengthMode)}
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 cursor-pointer transition-colors",
            !isLengthMode
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs"
              : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          )}
          title={isRtl ? "تغییر حالت بین شاخه و کویل" : "Toggle Length/Coil"}
        >
          {isLengthMode ? (isRtl ? "شاخه" : "Len.") : (isRtl ? "کویل" : "Coil")}
        </button>
      ) : null,
    },
  ];

  // Configurations for the 6 rows of Material Coding
  const materialRowConfig = [
    {
      id: "bm",
      num: 1,
      labelFa: "ماده اصلی",
      labelEn: "Basic Material",
      value: selectedBasicMaterial,
      onChange: handleBasicMaterialChange,
      options: basicMaterialOptions.map((o) => ({ name: o, value: o, code: activeMaterial?.bmCode || "1" })),
      currentCode: activeMaterial?.bmCode || "1",
    },
    {
      id: "sm",
      num: 2,
      labelFa: "زیرمجموعه متریال",
      labelEn: "Sub-Material",
      value: selectedSubMaterial,
      onChange: handleSubMaterialChange,
      options: subMaterialOptions.map((o) => ({ name: o, value: o, code: activeMaterial?.smCode || "1" })),
      currentCode: activeMaterial?.smCode || "1",
    },
    {
      id: "gm",
      num: 3,
      labelFa: "دسته‌بندی متریال",
      labelEn: "Material Category",
      value: selectedMaterialCategory,
      onChange: handleCategoryChange,
      options: categoryOptions.map((o) => ({ name: o, value: o, code: activeMaterial?.gmCode || "1" })),
      currentCode: activeMaterial?.gmCode || "1",
    },
    {
      id: "spec",
      num: 4,
      labelFa: "استاندارد مرجع",
      labelEn: "Specification",
      value: selectedSpecification,
      onChange: handleSpecChange,
      options: specOptions.map((o) => ({ name: o, value: o, code: (activeMaterial?.specCode || "01").padStart(2, "0") })),
      currentCode: (activeMaterial?.specCode || "01").padStart(2, "0"),
    },
    {
      id: "grade",
      num: 5,
      labelFa: "گرید متریال",
      labelEn: "Material Grade",
      value: selectedGrade,
      onChange: handleGradeChange,
      options: gradeOptions.map((o) => ({ name: o, value: o, code: (activeMaterial?.gradeCode || "01").padStart(2, "0") })),
      currentCode: (activeMaterial?.gradeCode || "01").padStart(2, "0"),
    },
    {
      id: "class",
      num: 6,
      labelFa: "کلاس / یادداشت",
      labelEn: "Class / Note",
      value: selectedClass,
      onChange: setSelectedClass,
      options: classOptions.map((o) => ({ name: o, value: o, code: activeMaterial?.classCode || "0" })),
      currentCode: activeMaterial?.classCode || "0",
    },
  ];

  const renderFormRow = (item: any) => {
    const label = isRtl ? item.labelFa : item.labelEn;
    return (
      <div
        key={item.id}
        className="flex flex-col gap-1.5 p-2 rounded-xl bg-muted/20 border border-border/50 shadow-2xs hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center justify-between gap-1">
          <Label className="text-xs font-semibold text-foreground truncate cursor-pointer select-none">
            {label}
          </Label>
          {item.extraToggle}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            {item.isCombo ? (
              <Select value={item.value} onValueChange={item.onChange}>
                <SelectTrigger className="h-8.5 rounded-lg text-xs bg-background w-full">
                  <SelectValue placeholder={isRtl ? "انتخاب کنید..." : "Select..."} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {item.options.map((opt: any) => {
                    const optVal = opt.value || opt.name;
                    return (
                      <SelectItem key={optVal} value={optVal} className="text-xs">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="truncate">{opt.name}</span>
                          {opt.code && (
                            <span className="font-mono text-[10px] text-muted-foreground shrink-0 ms-1.5">
                              ({opt.code})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={item.isNumberInput ? "number" : "text"}
                step="0.1"
                value={item.value}
                disabled={item.disabled}
                onChange={(e) => item.onChange(e.target.value)}
                className="h-8.5 rounded-lg text-xs font-mono bg-background w-full disabled:opacity-75 disabled:cursor-not-allowed"
              />
            )}
          </div>

          {/* Distinct Code Box identical to screenshot */}
          <div
            className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-muted/40 border border-border/60 min-w-[58px] justify-between shadow-2xs"
            title={`${isRtl ? "کد" : "Code"}: ${item.currentCode}`}
          >
            <span className="text-[10px] font-semibold text-muted-foreground uppercase select-none">
              {isRtl ? "کد" : "Code"}
            </span>
            <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.2 rounded bg-background shadow-2xs border border-border/40 text-center min-w-[22px]">
              {item.currentCode}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 py-2 animate-in fade-in duration-150">
      {/* ── 0. BRAND WINDOW HEADER BANNER (مطابق هویت نرم‌افزار داخلی ESP) ── */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-[#7D1331] via-[#9E1B46] to-[#600E25] text-white p-3 sm:p-4 shadow-sm flex items-center justify-between gap-4 overflow-hidden relative border border-rose-900/40">
        <div className="flex items-center gap-3.5 z-10">
          <div className="size-10 sm:size-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
            <span className="font-black text-rose-200 text-lg sm:text-xl font-mono tracking-tighter">ESP</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base tracking-wider uppercase font-sans">
              ESP IN-HOUSE SOFTWARE
            </span>
            <span className="text-[10px] sm:text-xs text-white/80 font-medium tracking-widest uppercase">
              WE BELIEVE IN FUTURE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 z-10">
          <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/25 text-[10px] font-mono px-2 py-0.5">
            v2.6 Enterprise
          </Badge>
        </div>
      </div>

      {/* ── 1. TOP TITLE & ACTION CONTROLS ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Shapes className="size-5 text-primary" />
            <span>
              {isRtl
                ? "کدگذاری یکپارچه فرم و متریال (Form & Material)"
                : "Integrated Form & Material Coding"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {codingMode === "forward"
              ? isRtl
                ? "فرم و ابعاد هندسی قطعه به طور مستقیم متریال‌های مجاز و مشخصات فنی را فیلتر و هماهنگ می‌کند."
                : "Component geometry dynamically filters and synchronizes compatible engineering material grades."
              : isRtl
                ? "حالت معکوس: ورود کد فرم یا کد متریال و رمزگشایی بلادرنگ مشخصات استاندارد و فیزیکی"
                : "Reverse mode: Enter Form or Material Code to instantly decode specifications."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Status Badge */}
          <button
            type="button"
            onClick={() => setFilterMaterialByForm(!filterMaterialByForm)}
            className={cn(
              "px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors select-none",
              filterMaterialByForm
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold"
                : "bg-muted/60 border-border/50 text-muted-foreground hover:text-foreground"
            )}
            title={isRtl ? "تغییر وضعیت فیلتر متریال بر اساس فرم" : "Toggle Form-Aware Filtering"}
          >
            <Filter className="size-3.5" />
            <span>
              {filterMaterialByForm
                ? isRtl
                  ? `پیوند فعال: فیلتر متریال بر پایه فرم (${allowableMaterials.length} متریال مجاز)`
                  : `Form Filter Active (${allowableMaterials.length})`
                : isRtl
                ? "پیوند غیرفعال (نمایش کلیه متریال‌ها)"
                : "All Materials (Unfiltered)"}
            </span>
          </button>

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
              <span>{isRtl ? "کدگذاری با مشخصات" : "Forward"}</span>
            </button>
            <button
              type="button"
              onClick={() => setCodingMode("reverse")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 select-none",
                codingMode === "reverse"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="size-3.5" />
              <span>{isRtl ? "رمزگشایی با کد (معکوس)" : "Reverse Lookup"}</span>
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

      {/* ── 2. CONNECTED WORKFLOW BANNER (پیوند اتصال مستقیم فرم به متریال) ── */}
      <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between gap-3 flex-wrap shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="size-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-black text-xs">
            ۱
          </span>
          <span className="text-xs font-bold text-foreground">
            {isRtl ? "هندسه و ابعاد فرم (Form & Geometry)" : "Component Form & Geometry"}
          </span>
        </div>

        {/* Dynamic Interlocking Link Indicator */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-background border border-border/60 shadow-2xs">
          <div className="flex items-center gap-1">
            <span className="relative flex h-2.5 w-2.5">
              {filterMaterialByForm && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  filterMaterialByForm ? "bg-emerald-500" : "bg-muted-foreground"
                )}
              />
            </span>
          </div>

          <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
            <Link2 className="size-3.5 text-emerald-500" />
            <span>
              {filterMaterialByForm
                ? isRtl
                  ? `پیوند مستقیم فعال: هندسه «${selectedSubForm}» متریال‌های مجاز را فیلتر می‌کند (${allowableMaterials.length} متریال سازگار)`
                  : `Form-to-Material Link Active: "${selectedSubForm}" filters ${allowableMaterials.length} materials`
                : isRtl
                ? "پیوند غیرفعال (متریال‌ها بدون فیلتر نمایش داده می‌شوند)"
                : "Link Bypassed (All Materials Accessible)"}
            </span>
          </span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFilterMaterialByForm(!filterMaterialByForm)}
            className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
          >
            {filterMaterialByForm ? (isRtl ? "قطع پیوند" : "Disconnect") : (isRtl ? "برقراری پیوند" : "Connect")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
            ۲
          </span>
          <span className="text-xs font-bold text-foreground">
            {isRtl ? "جنس و مشخصات متریال (Material & Specs)" : "Material Specifications"}
          </span>
        </div>
      </div>

      {/* ── 2. CARD 1: RAW MATERIAL FORM (فرم ماده اولیه مطابق دقیق اسکرین‌شات) ── */}
      <Card className="p-4 sm:p-5 rounded-2xl border-border/60 bg-card shadow-xs flex flex-col gap-4 relative overflow-hidden group">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Shapes className="size-4.5 text-primary" />
            <span>{isRtl ? "فرم ماده اولیه (Raw Material Form)" : "Raw Material Form"}</span>
          </span>
          <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5">
            {isRtl ? "مرجع استاندارد:" : "Ref:"} {formReference}
          </Badge>
        </div>

        {/* Live Form Code Preview (Character tiles) */}
        {codingMode === "reverse" ? (
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-2">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Search className="size-3.5 text-primary" />
              <span>{isRtl ? "ورود کد فرم جهت رمزگشایی:" : "Enter Form Code to Decode:"}</span>
            </Label>
            <Input
              type="text"
              value={reverseFormCodeInput}
              onChange={(e) => handleReverseFormLookup(e.target.value)}
              placeholder={isRtl ? "کد فرم مانند R131-10101 یا R111-100150006000..." : "R131-10101 or R111-100150006000..."}
              className="h-10 rounded-xl text-xs font-mono tracking-wider uppercase bg-background"
              dir="ltr"
            />
          </div>
        ) : (
          <div className="p-3 sm:p-3.5 rounded-xl bg-background border border-border/60 shadow-2xs flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {isRtl ? "پیش‌نمایش کد فرم (Form Code)" : "Form Code Preview"}
              </span>
              <div className="flex items-center gap-0.5 mt-1 overflow-x-auto py-1" dir="ltr">
                {generatedFormCode.split("").map((char, idx) => (
                  <div
                    key={idx}
                    className="relative h-8 w-5 sm:w-6 rounded-md bg-muted/30 border border-border/40 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={`${idx}-${char}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 28,
                          delay: idx * 0.015,
                        }}
                        className={cn(
                          "font-mono font-black text-xs sm:text-sm select-none",
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
              onClick={() => handleCopy(generatedFormCode, isRtl ? "کد فرم" : "Form Code")}
              className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              title={isRtl ? "کپی کد فرم" : "Copy Form Code"}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        )}

        {/* 3-Column Layout: Column 1 (3 items), Column 2 (3 items), Column 3 (Image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
          {/* Column 1: General Form, Category Form, Sub-Form */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            {formRowConfig.slice(0, 3).map((item) => renderFormRow(item))}
          </div>

          {/* Column 2: Dimensions (Pitch Type, Hole Size, Pitch Size OR Thickness, Width, Length/Coil) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            {formRowConfig.slice(3, 6).map((item) => renderFormRow(item))}
          </div>

          {/* Column 3: 3D Form Image Showcase */}
          <div className="lg:col-span-4 flex flex-col items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60 hover:border-primary/50 transition-all duration-300">
            <div className="w-full flex items-center justify-between text-[11px] font-semibold text-muted-foreground pb-2 border-b border-border/30">
              <span className="flex items-center gap-1.5 text-foreground font-bold">
                <Shapes className="size-3.5 text-primary" />
                <span>{isRtl ? "نقشه سه‌بعدی و شکل قطعه" : "Form & Geometry Model"}</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-5">
                {formReference}
              </Badge>
            </div>

            {/* Large Image Box */}
            <div
              className="relative group/img w-full h-44 sm:h-48 rounded-lg overflow-hidden flex items-center justify-center p-2 cursor-pointer bg-background/60 my-2"
              onClick={() =>
                setPreviewModal({
                  isOpen: true,
                  src: currentPicture,
                  title: isRtl ? `نقشه سه‌بعدی فرم: ${selectedSubForm}` : `3D Form Model: ${selectedSubForm}`,
                  subtitle: `${formReference} | Code: ${generatedFormCode}`,
                })
              }
              title={isRtl ? "کلیک جهت مشاهده با وضوح بالا" : "Click to view high-res"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPicture}
                alt={selectedSubForm}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/img:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-200">
                <Maximize2 className="size-5 text-white drop-shadow" />
                <span className="text-[11px] font-semibold text-white drop-shadow">
                  {isRtl ? "بزرگنمایی نقشه فنی" : "View High-Res"}
                </span>
              </div>
            </div>

            <div className="w-full text-center text-[11px] font-medium text-muted-foreground truncate pt-1 border-t border-border/30">
              <span className="text-foreground font-bold">{selectedSubForm}</span>
              <span className="mx-1 text-muted-foreground/60">•</span>
              <span>{selectedGeneralForm}</span>
            </div>
          </div>
        </div>

        {/* Footer of Card 1: Form Reference, Form Code, PDF, More */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-1 border-t border-border/40 flex-wrap">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold">
            <span className="text-muted-foreground">{isRtl ? "مرجع فرم:" : "Form Reference :"}</span>
            <span className="font-mono font-bold text-foreground">{formReference}</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold">
            <span className="text-muted-foreground">{isRtl ? "کد فرم:" : "Form Code :"}</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base tracking-wide bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
              {generatedFormCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenPdf(formReference)}
              className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="size-3.5 text-rose-500" />
              <span>PDF</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenMore("form")}
              className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
            >
              <Info className="size-3.5 text-primary" />
              <span>{isRtl ? "بیشتر" : "More"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 3. CARD 2: MATERIAL SELECTION (انتخاب متریال مطابق دقیق اسکرین‌شات) ── */}
      <Card className="p-4 sm:p-5 rounded-2xl border-border/60 bg-card shadow-xs flex flex-col gap-4 relative overflow-hidden group">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Atom className="size-4.5 text-emerald-500" />
            <span>{isRtl ? "انتخاب متریال (Material Selection)" : "Material Selection"}</span>
          </span>
          <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-2 py-0.5">
            UNS: {activeMaterial?.uns || "K02700"}
          </Badge>
        </div>

        {/* Live Material Code Preview (Character tiles) */}
        {codingMode === "reverse" ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-2">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Search className="size-3.5 text-emerald-500" />
              <span>{isRtl ? "ورود کد متریال جهت رمزگشایی:" : "Enter Material Code to Decode:"}</span>
            </Label>
            <Input
              type="text"
              value={reverseMatCodeInput}
              onChange={(e) => handleReverseMaterialLookup(e.target.value)}
              placeholder={isRtl ? "کد متریال مانند M11-01010..." : "M11-01010 or M1112000..."}
              className="h-10 rounded-xl text-xs font-mono tracking-wider uppercase bg-background"
              dir="ltr"
            />
          </div>
        ) : (
          <div className="p-3 sm:p-3.5 rounded-xl bg-background border border-border/60 shadow-2xs flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {isRtl ? "پیش‌نمایش کد متریال (Material Code)" : "Material Code Preview"}
              </span>
              <div className="flex items-center gap-0.5 mt-1 overflow-x-auto py-1" dir="ltr">
                {generatedMaterialCode.split("").map((char, idx) => (
                  <div
                    key={idx}
                    className="relative h-8 w-5 sm:w-6 rounded-md bg-muted/30 border border-border/40 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={`${idx}-${char}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 28,
                          delay: idx * 0.015,
                        }}
                        className={cn(
                          "font-mono font-black text-xs sm:text-sm select-none",
                          char === "-" ? "text-muted-foreground/40" : "text-emerald-600 dark:text-emerald-400"
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
              onClick={() => handleCopy(generatedMaterialCode, isRtl ? "کد متریال" : "Material Code")}
              className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              title={isRtl ? "کپی کد متریال" : "Copy Material Code"}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        )}

        {/* Main Material Selection Row matching screenshot */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40">
          {/* Metal Toggle Pill (Crimson #9E1B46 matching screenshot) */}
          <button
            type="button"
            onClick={() => setIsMetal(!isMetal)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0",
              isMetal
                ? "bg-[#9E1B46] text-white hover:bg-[#85163a]"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className={cn("size-2 rounded-full", isMetal ? "bg-white" : "bg-muted-foreground")} />
            <span>{isRtl ? "فلزی (Metal)" : "Metal"}</span>
          </button>

          {/* Material Dropdown */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Label className="text-xs font-semibold text-muted-foreground shrink-0 select-none">
              {isRtl ? "متریال:" : "Material :"}
            </Label>
            <Select
              value={`${selectedSpecification}||${selectedGrade}`}
              onValueChange={(val) => {
                const [spec, gr] = val.split("||");
                if (spec) setSelectedSpecification(spec);
                if (gr) setSelectedGrade(gr);
              }}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs bg-background w-full">
                <SelectValue placeholder={isRtl ? "انتخاب متریال..." : "Select Material..."} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {allowableMaterials.map((m, idx) => {
                  const val = `${m.spec}||${m.grade}`;
                  return (
                    <SelectItem key={`${val}-${m.gm || ""}-${idx}`} value={val} className="text-xs">
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="font-semibold">{m.spec} {m.grade}</span>
                        <span className="text-[11px] text-muted-foreground">({m.gm || m.sm})</span>
                        {m.uns && <span className="font-mono text-[10px] text-emerald-600 ms-auto">UNS {m.uns}</span>}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Detailed 6-level toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedMaterial(!showDetailedMaterial)}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground shrink-0 cursor-pointer h-9 px-3 rounded-xl"
          >
            <SlidersHorizontal className="size-3.5 me-1.5" />
            <span>{showDetailedMaterial ? (isRtl ? "بستن جزئیات" : "Hide Details") : (isRtl ? "تفکیک ۶ لایه‌ای" : "6-Level Tree")}</span>
          </Button>
        </div>

        {/* Expandable 6-level cascading combos if open */}
        {showDetailedMaterial && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 rounded-xl bg-card border border-border/40 animate-in fade-in duration-150">
            {materialRowConfig.map((item) => renderFormRow(item))}
          </div>
        )}

        {/* Footer of Card 2: Material Reference, Material Coding, PDF, More */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-1 border-t border-border/40 flex-wrap">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold">
            <span className="text-muted-foreground">{isRtl ? "مرجع متریال:" : "Material Reference :"}</span>
            <span className="font-mono font-bold text-foreground">
              ASME Sec. II Part A. ({selectedSpecification})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold">
            <span className="text-muted-foreground">{isRtl ? "کد متریال:" : "Material Coding :"}</span>
            <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm sm:text-base tracking-wide bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
              {generatedMaterialCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenPdf(selectedSpecification)}
              className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="size-3.5 text-rose-500" />
              <span>PDF</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenMore("material")}
              className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
            >
              <Info className="size-3.5 text-primary" />
              <span>{isRtl ? "بیشتر" : "More"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 4. CARD 3: QUANTITY SELECTION (انتخاب مقادیر و اوزان مطابق دقیق اسکرین‌شات) ── */}
      <Card className="p-4 sm:p-5 rounded-2xl border-border/60 bg-card shadow-xs flex flex-col gap-4">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
          <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Scale className="size-4.5 text-primary" />
            <span>{isRtl ? "انتخاب مقادیر و اوزان (Quantity Selection)" : "Quantity Selection"}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Left: Value & Unit */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                {isRtl ? "مقدار (Value):" : "Value"}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                className="h-9 rounded-xl text-xs font-mono bg-background"
              />
            </div>

            <div className="w-36 flex flex-col gap-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                {isRtl ? "واحد (Unit):" : "Unit"}
              </Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "Kg", label: "Kg" },
                    { value: "Ton", label: "Ton" },
                    { value: "pcs", label: "pcs" },
                    { value: "Sheet", label: "Sheet" },
                    { value: "Coil", label: "Coil" },
                    { value: "m", label: "m" },
                    { value: "m²", label: "m²" },
                  ].map((u) => (
                    <SelectItem key={u.value} value={u.value} className="text-xs">
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: Weight Per Unit (Kg) & Total Weight (Kg) */}
          <div className="flex items-center gap-3 md:border-s md:border-border/40 md:ps-4">
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                {isRtl ? "وزن واحد (Weight Per Unit (Kg)):" : "Weight Per Unit (Kg)"}
              </Label>
              <div className="h-9 px-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-foreground">
                  {weightPerUnit.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">Kg</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-xs font-semibold text-primary">
                {isRtl ? "وزن کل (Total Weight (Kg)):" : "Total Weight (Kg)"}
              </Label>
              <div className="h-9 px-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <span className="font-mono text-sm font-extrabold text-primary">
                  {totalWeight.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-primary">Kg</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 5. BOTTOM COMPOSITE CODE CARD ── */}
      <Card className="p-4 sm:p-5 rounded-2xl border-border/60 bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {isRtl ? "کد کامل و یکپارچه ماده اولیه (Composite Code)" : "Composite Raw Material Code"}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm sm:text-base font-extrabold text-foreground bg-muted/60 px-3 py-1.5 rounded-xl border border-border/60">
                {compositeCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer shadow-2xs"
                onClick={() => handleCopy(compositeCode, isRtl ? "کد کامل ماده اولیه" : "Composite Code")}
              >
                <Copy className="size-3.5" />
                <span>{isRtl ? "کپی کد کامل" : "Copy"}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 6. MORE TECHNICAL DETAILS MODAL ── */}
      <Dialog
        open={moreModal.isOpen}
        onOpenChange={(open) => setMoreModal((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Info className="size-4.5 text-primary" />
              <span>{moreModal.title}</span>
            </DialogTitle>
            {moreModal.subtitle && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {moreModal.subtitle}
              </p>
            )}
          </DialogHeader>
          <div className="mt-2">
            {moreModal.content}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 7. HIGH-RESOLUTION IMAGE ZOOM MODAL ── */}
      <Dialog
        open={previewModal.isOpen}
        onOpenChange={(open) => setPreviewModal((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Shapes className="size-4.5 text-primary" />
              <span>{previewModal.title}</span>
            </DialogTitle>
            {previewModal.subtitle && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {previewModal.subtitle}
              </p>
            )}
          </DialogHeader>
          <div className="w-full aspect-16/10 bg-muted/20 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-border shadow-inner">
            {previewModal.src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewModal.src}
                alt={previewModal.title}
                className="max-w-full max-h-full object-contain drop-shadow"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
