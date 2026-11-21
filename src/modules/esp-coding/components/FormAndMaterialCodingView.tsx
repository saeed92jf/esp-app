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
  Atom,
  FileText,
  ExternalLink,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Columns2,
  Eye,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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

interface FormAndMaterialCodingViewProps {
  initialFocus?: "form" | "material" | "both";
}

export function FormAndMaterialCodingView({
  initialFocus = "both",
}: FormAndMaterialCodingViewProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Server data
  const [forms, setForms] = useState<MaterialFormRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialCodingCombination[]>([]);
  const [loading, setLoading] = useState(true);

  // View Layout Mode: "both" (side-by-side), "form" (focused on form), "material" (focused on material)
  const [viewMode, setViewMode] = useState<"both" | "form" | "material">(initialFocus);

  // Filter materials based on Form
  const [filterMaterialByForm, setFilterMaterialByForm] = useState<boolean>(true);

  // Forward vs Reverse Mode
  const [codingMode, setCodingMode] = useState<"forward" | "reverse">("forward");
  const [reverseFormCodeInput, setReverseFormCodeInput] = useState<string>("");
  const [reverseMatCodeInput, setReverseMatCodeInput] = useState<string>("");

  // ==========================================
  // PANEL 1: FORM CODING STATE
  // ==========================================
  const [selectedGeneralForm, setSelectedGeneralForm] = useState<string>("Flat Form");
  const [selectedCategoryForm, setSelectedCategoryForm] = useState<string>("General");
  const [selectedSubForm, setSelectedSubForm] = useState<string>("Plate");

  // Dynamic Dimensions (Covering all 39 cases)
  // 1. Flat & Sheet (Plate, Bar, Sheet, Strip)
  const [thkValue, setThkValue] = useState<string>("10.0");
  const [widthValue, setWidthValue] = useState<string>("1500");
  const [lengthValue, setLengthValue] = useState<string>("6000");
  const [isLengthMode, setIsLengthMode] = useState<boolean>(true); // true = Len., false = Coil

  // 2. Perforated Sheet
  const [perfPitchType, setPerfPitchType] = useState<string>("Triangular Pitch");
  const [perfHoleSize, setPerfHoleSize] = useState<string>("0.5");
  const [perfPitchSize, setPerfPitchSize] = useState<string>("1.5");

  // 3. Standard Flange (ASME B16.5)
  const [flangeNps, setFlangeNps] = useState<string>("1/2\"");
  const [flangeType, setFlangeType] = useState<string>("Welding Neck (Sch. STD)");
  const [flangeClass, setFlangeClass] = useState<string>("150# (R.F.)");

  // 4. LWN / Self Reinforce Flange
  const [lwnSize, setLwnSize] = useState<string>("2\"");
  const [lwnClass, setLwnClass] = useState<string>("150# (R.F.)");
  const [lwnHeight, setLwnHeight] = useState<string>("800");

  // 5. Self Reinforce Neck / Weldolet
  const [neckNps, setNeckNps] = useState<string>("Sch. STD");
  const [neckHubThk, setNeckHubThk] = useState<string>("50");
  const [neckHeight, setNeckHeight] = useState<string>("200");
  const [weldoletType, setWeldoletType] = useState<string>("Weldolet");
  const [weldoletSize, setWeldoletSize] = useState<string>("1/2\"");
  const [weldoletClass, setWeldoletClass] = useState<string>("3000#");

  // 6. Body Flange / Ring
  const [ringOd, setRingOd] = useState<string>("1220");
  const [ringId, setRingId] = useState<string>("1050");
  const [ringThk, setRingThk] = useState<string>("20");

  // 7. Special Connection (Grayloc, Durolok)
  const [graylocSize, setGraylocSize] = useState<string>("1\"");
  const [graylocClass, setGraylocClass] = useState<string>("600#");
  const [graylocGraySize, setGraylocGraySize] = useState<string>("1-GR-5");
  const [durolokNps, setDurolokNps] = useState<string>("1/2\"");
  const [durolokSch, setDurolokSch] = useState<string>("5");
  const [durolokLength, setDurolokLength] = useState<string>("100");

  // 8. Forged Fitting (Coupling, Boss)
  const [forgedType, setForgedType] = useState<string>("Socket Welded");
  const [forgedSize, setForgedSize] = useState<string>("1/2\"");
  const [forgedClass, setForgedClass] = useState<string>("3000#");

  // 9. Pipe (Seamless, Welded)
  const [pipeNps, setPipeNps] = useState<string>("2\"");
  const [pipeSch, setPipeSch] = useState<string>("STD");
  const [pipeLength, setPipeLength] = useState<string>("6000");

  // 10. Tube & U-Tube
  const [tubeNps, setTubeNps] = useState<string>("3/4\" (19.05 mm)");
  const [tubeThk, setTubeThk] = useState<string>("14 BWG (2.11 mm)");
  const [tubeLength, setTubeLength] = useState<string>("6000");
  const [uTubeRadius, setUTubeRadius] = useState<string>("150");

  // 11. Fittings (Elbow, Tee, Reducer, Cap)
  const [fittingSize, setFittingSize] = useState<string>("2\"");
  const [fittingSch, setFittingSch] = useState<string>("STD");
  const [fittingAngle, setFittingAngle] = useState<string>("90°");
  const [teeBranchSize, setTeeBranchSize] = useState<string>("2\"");
  const [reducerSmallEnd, setReducerSmallEnd] = useState<string>("1.5\"");
  const [capHeight, setCapHeight] = useState<string>("38");

  // 12. Fasteners (Bolt, Nut, Screw, Washer)
  const [boltStandard, setBoltStandard] = useState<string>("DIN 933");
  const [boltSize, setBoltSize] = useState<string>("M16");
  const [boltLength, setBoltLength] = useState<string>("80");
  const [nutStandard, setNutStandard] = useState<string>("Light (DIN 934)");
  const [nutSize, setNutSize] = useState<string>("M16");
  const [washerStandard, setWasherStandard] = useState<string>("DIN 127");
  const [washerSize, setWasherSize] = useState<string>("12-11.57");

  // 13. Gasket & Packing
  const [gasketSize, setGasketSize] = useState<string>("2\"");
  const [gasketClass, setGasketClass] = useState<string>("150#");
  const [gasketRingType, setGasketRingType] = useState<string>("Oval");
  const [packingType, setPackingType] = useState<string>("Braided Fiber");
  const [packingWidth, setPackingWidth] = useState<string>("12.7");
  const [packingLength, setPackingLength] = useState<string>("1000");

  // 14. Casting ('Y' Strainer Body)
  const [strainerNps, setStrainerNps] = useState<string>("2\"");
  const [strainerClass, setStrainerClass] = useState<string>("400#");
  const [strainerEnd, setStrainerEnd] = useState<string>("Equal - ASME B 16.5");

  // 15. Profile Shapes (Stahl, AISC)
  const [profileStandard, setProfileStandard] = useState<string>("DIN 1025");
  const [profileType, setProfileType] = useState<string>("HEA");
  const [profileSize, setProfileSize] = useState<string>("HEA 200");
  const [profileLength, setProfileLength] = useState<string>("6000");
  const [aiscType, setAiscType] = useState<string>("W-Shape");
  const [aiscSize, setAiscSize] = useState<string>("W44X335");

  // 16. Extrusion & Wire
  const [wwShape, setWwShape] = useState<string>("Wedge Wire");
  const [wwType, setWwType] = useState<string>("SOE coil");
  const [wireShape, setWireShape] = useState<string>("Flat Wire");
  const [wireDiameter, setWireDiameter] = useState<string>("2.0");

  // 17. Miscellaneous (Woven Wire, Spray Nozzle)
  const [mesh1, setMesh1] = useState<string>("0.875");
  const [mesh2, setMesh2] = useState<string>("0.875");
  const [wireDia, setWireDia] = useState<string>("3.2");
  const [nozzleSize, setNozzleSize] = useState<string>("1/2\"");
  const [nozzleShape, setNozzleShape] = useState<string>("Full Cone");
  const [nozzleAngle, setNozzleAngle] = useState<string>("150°");

  // Preview Modals
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docModalTitle, setDocModalTitle] = useState("");
  const [docModalContent, setDocModalContent] = useState("");

  // ==========================================
  // PANEL 2: MATERIAL CODING STATE
  // ==========================================
  const [selectedBasicMaterial, setSelectedBasicMaterial] = useState<string>("Metal-Group");
  const [selectedSubMaterial, setSelectedSubMaterial] = useState<string>("Ferritic");
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>("Carbon Steel");
  const [selectedSpecification, setSelectedSpecification] = useState<string>("SA-516");
  const [selectedGrade, setSelectedGrade] = useState<string>("70");
  const [selectedClass, setSelectedClass] = useState<string>("--");

  // Panel 3: Quantity & Physical Weight
  const [quantityValue, setQuantityValue] = useState<string>("1");
  const [selectedUnit, setSelectedUnit] = useState<string>("Kg");

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

          // Find default Flat Form -> General -> Plate
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

          // Default Material: SA-516 70
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
  // FORM SELECTION DERIVATIONS
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

  // Picture for current Form
  const currentPicture = useMemo(() => {
    if (currentFormRecord?.refPic) return currentFormRecord.refPic;
    return "/coding-docs/Production Form/Plate2.png";
  }, [currentFormRecord]);

  // Reference Standard for current Form
  const formReference = useMemo(() => {
    if (!currentFormRecord) return "SA-20";
    const ref = currentFormRecord.referenceName || currentFormRecord.reference || "";
    if (ref && ref !== "--" && ref !== "undefined") {
      const parts = ref.split(",");
      return parts[0]?.trim() || "SA-20";
    }
    // Fallback standards based on General Form
    if (selectedGeneralForm === "Forge Form") return "ASME B16.5";
    if (selectedGeneralForm === "Cylinder Form") return "ASME B36.10";
    if (selectedGeneralForm === "Fitting Form") return "ASME B16.9";
    if (selectedGeneralForm === "Connection Form") return "DIN 933 / ASME B18.2.1";
    return "SA-20";
  }, [currentFormRecord, selectedGeneralForm]);

  // ==========================================
  // DYNAMIC DIMENSION & CODE COMPUTATION
  // ==========================================
  const formDimensionCodes = useMemo(() => {
    const gf = selectedGeneralForm;
    const cf = selectedCategoryForm;
    const sf = selectedSubForm;

    // 1. Flat Form (Plate, Bar, Sheet, Strip)
    if (gf === "Flat Form" && (cf === "General" || cf === "Pressure Part")) {
      const t = parseFloat(thkValue) || 0;
      const tCode = String(Math.round(t * 10)).padStart(3, "0");
      const w = parseInt(widthValue, 10) || 0;
      const wCode = String(w).padStart(4, "0");
      const l = parseInt(lengthValue, 10) || 0;
      const lCode = String(l).padStart(5, "0");
      return {
        codes: [tCode, wCode, lCode],
        suffix: `${tCode}${wCode}${lCode}`,
      };
    }

    // 2. Perforated Sheet
    if (gf === "Flat Form" && cf === "Perforated Sheet") {
      const pCode = "01";
      const hCode = "01";
      const sCode = "01";
      return {
        codes: [pCode, hCode, sCode],
        suffix: `${pCode}${hCode}${sCode}`,
      };
    }

    // 3. Forge Form: Standard Flange
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
      const npsCode = npsMap[flangeNps] || "04";
      const typeCode = flangeType.includes("Welding Neck") ? "16" : "01";
      const classCode = flangeClass.includes("150") ? "12" : flangeClass.includes("300") ? "13" : "14";
      return {
        codes: [npsCode, typeCode, classCode],
        suffix: `${npsCode}${typeCode}${classCode}`,
      };
    }

    // 4. Forge Form: Self Reinforce Flange / LWN
    if (gf === "Forge Form" && cf === "Self Reinforce Flange") {
      const sizeCode = "06";
      const classCode = "12";
      const heightCode = "800";
      return {
        codes: [sizeCode, classCode, heightCode],
        suffix: `${sizeCode}${classCode}${heightCode}`,
      };
    }

    // 5. Forge Form: Self Reinforce Neck / Weldolet
    if (gf === "Forge Form" && cf === "Self Reinforce Neck") {
      if (sf === "Weldolet") {
        return {
          codes: ["01", "04", "1"],
          suffix: "01041",
        };
      }
      return {
        codes: ["1505", "050", "200"],
        suffix: "1505050200",
      };
    }

    // 6. Forge Form: Body Flange / Ring
    if (gf === "Forge Form" && cf === "Body Flange") {
      const od = ringOd.padStart(4, "0");
      const id = ringId.padStart(4, "0");
      const thk = ringThk.padStart(3, "0");
      return {
        codes: [od, id, thk],
        suffix: `${od}${id}${thk}`,
      };
    }

    // 7. Special Connection (Grayloc, Durolok)
    if (gf === "Forge Form" && cf === "Special Connection") {
      if (sf === "Durolok") {
        return {
          codes: ["06", "05", "0100"],
          suffix: "06050100",
        };
      }
      return {
        codes: ["01", "06", "1GR5"],
        suffix: "01061GR5",
      };
    }

    // 8. Forged Fitting (Coupling, Boss)
    if (gf === "Forge Form" && (cf === "Forged Fitting" || cf.includes("Special Forged"))) {
      return {
        codes: ["01", "01", "2"],
        suffix: "01012",
      };
    }

    // 9. Cylinder Form: Pipe
    if (gf === "Cylinder Form" && cf === "Pipe") {
      const npsCode = "15";
      const schCode = "05";
      const lCode = String(parseInt(pipeLength, 10) || 6000).padStart(5, "0");
      return {
        codes: [npsCode, schCode, lCode],
        suffix: `${npsCode}${schCode}${lCode}`,
      };
    }

    // 10. Cylinder Form: Tube & U-Tube
    if (gf === "Cylinder Form" && (cf === "Tube" || cf === "U-Tube")) {
      const sizeCode = "05";
      const thkCode = "03";
      const lCode = "06000";
      return {
        codes: [sizeCode, thkCode, lCode],
        suffix: `${sizeCode}${thkCode}${lCode}`,
      };
    }

    // 11. Fitting Form
    if (gf === "Fitting Form") {
      if (cf === "Equal Elbow") {
        return { codes: ["04", "05", "90"], suffix: "040590" };
      }
      if (cf === "Reducer Elbow") {
        return { codes: ["12", "09", "01"], suffix: "120901" };
      }
      if (cf === "Return") {
        return { codes: ["06", "01", "3"], suffix: "06013" };
      }
      if (cf === "Cap") {
        return { codes: ["04", "05", "38"], suffix: "040538" };
      }
      return { codes: ["04", "05", "01"], suffix: "040501" };
    }

    // 12. Connection Form (Bolt, Nut, Washer, Gasket, Rope)
    if (gf === "Connection Form") {
      if (cf.includes("Nut")) {
        return { codes: ["01", "01"], suffix: "0101" };
      }
      if (cf.includes("Washer")) {
        return { codes: ["01"], suffix: "01" };
      }
      if (cf === "Gasket") {
        return { codes: ["04", "01", "01"], suffix: "040101" };
      }
      if (cf === "Rope Packing") {
        return { codes: ["01", "01"], suffix: sf === "Round" ? "02" : "01" };
      }
      // Bolt / Screws
      const sCode = "01";
      const szCode = "01";
      const lenCode = String(parseInt(boltLength, 10) || 80).padStart(3, "0");
      return {
        codes: [sCode, szCode, lenCode],
        suffix: `${sCode}${szCode}${lenCode}`,
      };
    }

    // 13. Casting
    if (gf === "Casting") {
      return { codes: ["04", "03", "1"], suffix: "04031" };
    }

    // 14. Extrusion
    if (gf === "Extrusion") {
      if (cf === "Wire") {
        return { codes: ["10", "00", "C"], suffix: "1000C" };
      }
      return { codes: ["10", "1", "c"], suffix: "101c" };
    }

    // 15. Profile Form (Stahl, AISC)
    if (gf === "Profile Form") {
      return { codes: ["01", "001", "06000"], suffix: "0100106000" };
    }

    // 16. Miscellaneous
    if (gf === "Miscellaneous") {
      if (cf === "Spray Nozzle") {
        return { codes: ["11", "01"], suffix: "1101" };
      }
      return { codes: ["01", "01", "01"], suffix: "010101" };
    }

    // Default Fallback
    return { codes: ["100", "1500", "06000"], suffix: "100150006000" };
  }, [
    selectedGeneralForm,
    selectedCategoryForm,
    selectedSubForm,
    thkValue,
    widthValue,
    lengthValue,
    flangeNps,
    flangeType,
    flangeClass,
    ringOd,
    ringId,
    ringThk,
    pipeLength,
    boltLength,
  ]);

  // Master Form Code
  const generatedFormCode = useMemo(() => {
    return `R${generalFormCode}${categoryFormCode}${subFormCode}-${formDimensionCodes.suffix}`;
  }, [generalFormCode, categoryFormCode, subFormCode, formDimensionCodes]);

  // ==========================================
  // 2. FORM-AWARE MATERIAL FILTERING
  // ==========================================
  // Extract allowable tokens from currentFormRecord.materialForm
  const allowableFormTokens = useMemo(() => {
    const raw = currentFormRecord?.materialForm || "";
    if (!raw) return [];
    return raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }, [currentFormRecord]);

  // Filter materials based on allowable tokens
  const allowableMaterials = useMemo(() => {
    if (!filterMaterialByForm || allowableFormTokens.length === 0) {
      return materials;
    }

    const filtered = materials.filter((m) => {
      const mForm = (m.form || "").trim().toLowerCase();
      if (!mForm || mForm === "--") return true; // keep general materials

      return allowableFormTokens.some(
        (tok) => mForm.includes(tok) || tok.includes(mForm)
      );
    });

    return filtered.length > 0 ? filtered : materials;
  }, [materials, filterMaterialByForm, allowableFormTokens]);

  // Cascading Combos for Material Coding
  // 1. Basic Materials
  const basicMaterialOptions = useMemo(() => {
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (m.bm) set.add(m.bm);
    });
    return Array.from(set).sort(naturalCompare);
  }, [allowableMaterials]);

  // 2. Sub Materials
  const subMaterialOptions = useMemo(() => {
    if (!selectedBasicMaterial) return [];
    const set = new Set<string>();
    allowableMaterials.forEach((m) => {
      if (m.bm === selectedBasicMaterial && m.sm) set.add(m.sm);
    });
    return Array.from(set).sort(naturalCompare);
  }, [allowableMaterials, selectedBasicMaterial]);

  // 3. Material Categories
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

  // 4. Specifications
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

  // 5. Grades
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

  // 6. Classes / Notes
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

  // Active Material Record
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

  // Material Code format: M11-01010
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

  // Composite Master Code: Form Code + Material Code
  const compositeCode = useMemo(() => {
    return `${generatedFormCode} / ${generatedMaterialCode}`;
  }, [generatedFormCode, generatedMaterialCode]);

  // ==========================================
  // AUTO-SYNC MATERIAL WHEN FORM CHANGES
  // ==========================================
  useEffect(() => {
    if (!filterMaterialByForm || allowableMaterials.length === 0) return;

    // Check if current selection is still in allowable materials
    const isValid = allowableMaterials.some(
      (m) =>
        m.bm === selectedBasicMaterial &&
        m.sm === selectedSubMaterial &&
        m.gm === selectedMaterialCategory &&
        m.spec === selectedSpecification &&
        m.grade === selectedGrade
    );

    if (!isValid) {
      // Pick best matching default from allowable materials
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

    // 1. Flat Plate / Bar / Sheet
    if (gf === "Flat Form") {
      const t = parseFloat(thkValue) || 10.0;
      const w = parseFloat(widthValue) || 1500;
      const l = parseFloat(lengthValue) || 6000;
      const weightKg = (t * w * l * density) / 1000000000;
      return weightKg > 0 ? parseFloat(weightKg.toFixed(2)) : 706.5;
    }

    // 2. Pipe
    if (gf === "Cylinder Form" && cf === "Pipe") {
      // Nominal 2" STD pipe ~ 5.44 kg/m * 6m = 32.64 kg
      return 32.64;
    }

    // 3. Flange
    if (gf === "Forge Form") {
      if (cf === "Standard Flange") return 0.51;
      if (cf === "Self Reinforce Flange") return 6.86;
      if (cf === "Body Flange") return 46.95;
      return 5.2;
    }

    // 4. Fasteners / Bolt
    if (gf === "Connection Form") {
      return 0.12;
    }

    // Default weight
    return 10.0;
  }, [
    selectedGeneralForm,
    selectedCategoryForm,
    thkValue,
    widthValue,
    lengthValue,
    activeMaterial,
  ]);

  const totalWeight = useMemo(() => {
    const val = parseFloat(quantityValue) || 1;
    if (selectedUnit === "Kg") return val;
    return parseFloat((val * weightPerUnit).toFixed(2));
  }, [quantityValue, selectedUnit, weightPerUnit]);

  // ==========================================
  // HANDLERS FOR CASCADING RESETS
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

    const target = forms.find(
      (f) => f.generalForm === selectedGeneralForm && f.categoryForm === newCf && f.subForm === firstSub
    );
    if (target?.defaultDetailForms) {
      const parts = target.defaultDetailForms.split(",").map((s) => s.trim());
      if (parts[0]) setThkValue(parts[0].includes(".") ? parts[0] : `${parts[0]}.0`);
      if (parts[1]) setWidthValue(parts[1]);
      if (parts[2]) setLengthValue(parts[2]);
    }
  };

  const handleSubFormChange = (newSf: string) => {
    setSelectedSubForm(newSf);

    const target = forms.find(
      (f) =>
        f.generalForm === selectedGeneralForm &&
        f.categoryForm === selectedCategoryForm &&
        f.subForm === newSf
    );
    if (target?.defaultDetailForms) {
      const parts = target.defaultDetailForms.split(",").map((s) => s.trim());
      if (parts[0]) setThkValue(parts[0].includes(".") ? parts[0] : `${parts[0]}.0`);
      if (parts[1]) setWidthValue(parts[1]);
      if (parts[2]) setLengthValue(parts[2]);
    }
  };

  // Material cascading handlers
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

  // Copy code helper
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} ${isRtl ? "کپی شد" : "copied"}`);
  };

  // Reset to default
  const handleResetAll = () => {
    setSelectedGeneralForm("Flat Form");
    setSelectedCategoryForm("General");
    setSelectedSubForm("Plate");
    setThkValue("10.0");
    setWidthValue("1500");
    setLengthValue("6000");

    setSelectedBasicMaterial("Metal-Group");
    setSelectedSubMaterial("Ferritic");
    setSelectedMaterialCategory("Carbon Steel");
    setSelectedSpecification("SA-516");
    setSelectedGrade("70");
    setSelectedClass("--");
    toast.info(isRtl ? "تمام تنظیمات بازنشانی شد" : "Reset to defaults");
  };

  // Reverse Lookup Handler
  const handleReverseFormLookup = (code: string) => {
    const clean = code.trim().toUpperCase().replace(/[^R0-9\-]/g, "");
    setReverseFormCodeInput(clean);

    const m = clean.match(/^R?(\d)(\d)(\d)-?([0-9A-Z]+)$/);
    if (m) {
      const [, gfId, cfId, sfId] = m;
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
        toast.success(
          isRtl
            ? `فرم کشف شد: ${matched.generalForm} / ${matched.subForm}`
            : `Form matched: ${matched.subForm}`
        );
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
      toast.success(
        isRtl
          ? `متریال کشف شد: ${match.spec} Gr. ${match.grade}`
          : `Material matched: ${match.spec} Gr. ${match.grade}`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground animate-pulse">
          {isRtl
            ? "در حال بارگذاری پایگاه جامع فرم و متریال..."
            : "Loading comprehensive Form & Material database..."}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 p-3 md:p-6 pb-20 animate-in fade-in duration-150">
      {/* ── 1. TOP HEADER & COMPOSITE CODE BAR ── */}
      <div className="w-full flex flex-col gap-4">
        {/* Top Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono px-2 py-0.5">
                ESP Coding
              </Badge>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                {isRtl
                  ? "کدگذاری یکپارچه فرم و متریال مواد اولیه (ESP Form & Material Coding)"
                  : "Integrated Form & Material Coding (ESP Form & Material)"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRtl
                ? "اجرای هماهنگ و کنار هم فرم و متریال؛ انتخاب هندسه قطعه متریال‌های مجاز را فیلتر می‌کند."
                : "Side-by-side execution: selecting component geometry automatically filters valid materials."}
            </p>
          </div>

          {/* Mode Switcher & Layout Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* View Mode Toggle: Both vs Form vs Material */}
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
              <Button
                variant={viewMode === "both" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => setViewMode("both")}
              >
                <Columns2 className="size-3.5" />
                <span>{isRtl ? "نمای دوقلو (کنار هم)" : "Dual View"}</span>
              </Button>
              <Button
                variant={viewMode === "form" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => setViewMode("form")}
              >
                <Shapes className="size-3.5" />
                <span>{isRtl ? "فرم" : "Form"}</span>
              </Button>
              <Button
                variant={viewMode === "material" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => setViewMode("material")}
              >
                <Atom className="size-3.5" />
                <span>{isRtl ? "متریال" : "Material"}</span>
              </Button>
            </div>

            {/* Forward vs Reverse */}
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
              <Button
                variant={codingMode === "forward" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setCodingMode("forward")}
              >
                {isRtl ? "کدگذاری مستقیم" : "Forward"}
              </Button>
              <Button
                variant={codingMode === "reverse" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setCodingMode("reverse")}
              >
                {isRtl ? "حالت معکوس" : "Reverse"}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleResetAll}
            >
              <RotateCcw className="size-3.5" />
              <span>{isRtl ? "بازنشانی" : "Reset"}</span>
            </Button>
          </div>
        </div>

        {/* ── 2. REVERSE LOOKUP CARD (When Active) ── */}
        {codingMode === "reverse" && (
          <Card className="p-4 bg-muted/30 border-primary/30 flex flex-col sm:flex-row gap-4 items-center animate-in fade-in duration-150">
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Search className="size-3.5 text-primary" />
                {isRtl ? "جستجوی معکوس کد فرم (Form Code Lookup):" : "Reverse Form Code:"}
              </Label>
              <Input
                placeholder="R111-100150006000 or R211-041612"
                value={reverseFormCodeInput}
                onChange={(e) => handleReverseFormLookup(e.target.value)}
                className="font-mono text-sm bg-background uppercase"
              />
            </div>
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Search className="size-3.5 text-emerald-500" />
                {isRtl ? "جستجوی معکوس کد متریال (Material Code Lookup):" : "Reverse Material Code:"}
              </Label>
              <Input
                placeholder="M11-01010 or M1112000"
                value={reverseMatCodeInput}
                onChange={(e) => handleReverseMaterialLookup(e.target.value)}
                className="font-mono text-sm bg-background uppercase"
              />
            </div>
          </Card>
        )}

        {/* ── 3. LIVE COMPOSITE CODE PREVIEW BAR ── */}
        <div className="w-full bg-linear-to-r from-card via-card/95 to-card rounded-xl p-4 border border-border shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Form Code Badge */}
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Shapes className="size-3 text-primary" />
                {isRtl ? "کد فرم قطعه (Form Code):" : "Form Code:"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-base md:text-lg font-bold text-primary tracking-wider bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  {generatedFormCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleCopy(generatedFormCode, "Form Code")}
                  title={isRtl ? "کپی کد فرم" : "Copy Form Code"}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="hidden sm:block text-muted-foreground font-mono text-xl">
              +
            </div>

            {/* Material Code Badge */}
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Atom className="size-3 text-emerald-500" />
                {isRtl ? "کد متریال (Material Code):" : "Material Code:"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {generatedMaterialCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleCopy(generatedMaterialCode, "Material Code")}
                  title={isRtl ? "کپی کد متریال" : "Copy Material Code"}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Combined Code Box */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {isRtl ? "کد کامل ماده خام (Composite Raw Material Code)" : "Master Raw Material Code"}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm md:text-base font-extrabold text-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
                  {compositeCode}
                </span>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground"
                  onClick={() => handleCopy(compositeCode, "Composite Code")}
                >
                  <Copy className="size-3.5" />
                  <span>{isRtl ? "کپی کامل" : "Copy All"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MAIN SIDE-BY-SIDE DUAL ENGINE ── */}
      <div
        className={cn(
          "w-full grid gap-6",
          viewMode === "both"
            ? "grid-cols-1 xl:grid-cols-2"
            : "grid-cols-1"
        )}
      >
        {/* ============================================================ */}
        {/* ── PANEL A: ESP FORM CODING (هندسه و فرم قطعه) ── */}
        {/* ============================================================ */}
        {(viewMode === "both" || viewMode === "form") && (
          <Card className="p-4 md:p-5 flex flex-col gap-5 border-border shadow-xs bg-card">
            {/* Panel A Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Shapes className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-bold text-foreground">
                    {isRtl ? "کدگذاری فرم و هندسه قطعه" : "Form & Geometry Coding"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {isRtl
                      ? "تعیین فرم اصلی، دسته‌بندی، زیرفرم و ابعاد فیزیکی"
                      : "Define General Form, Category, Sub-Form & Physical Dimensions"}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] font-mono">
                Ref: {formReference}
              </Badge>
            </div>

            {/* Level 1, 2, 3 Hierarchy Combos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. General Form */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "فرم عمومی:" : "General Form:"}</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 rounded">
                    Code: {generalFormCode}
                  </span>
                </Label>
                <Select
                  value={selectedGeneralForm}
                  onValueChange={handleGeneralFormChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="General Form" />
                  </SelectTrigger>
                  <SelectContent>
                    {generalFormOptions.map((g) => (
                      <SelectItem key={g.name} value={g.name} className="text-xs">
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Category Form */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "دسته‌بندی فرم:" : "Category Form:"}</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 rounded">
                    Code: {categoryFormCode}
                  </span>
                </Label>
                <Select
                  value={selectedCategoryForm}
                  onValueChange={handleCategoryFormChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Category Form" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryFormOptions.map((c) => (
                      <SelectItem key={c.name} value={c.name} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Sub-Form */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "زیرفرم قطعه:" : "Sub-Form:"}</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 rounded">
                    Code: {subFormCode}
                  </span>
                </Label>
                <Select
                  value={selectedSubForm}
                  onValueChange={handleSubFormChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Sub-Form" />
                  </SelectTrigger>
                  <SelectContent>
                    {subFormOptions.map((s) => (
                      <SelectItem key={s.name} value={s.name} className="text-xs">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic Dimension Inputs & 3D Illustration Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-muted/20 p-3.5 rounded-xl border border-border/60">
              {/* Inputs Column (8 cols) */}
              <div className="md:col-span-8 flex flex-col gap-3.5 justify-center">
                {/* ── CASE 1: Flat Form (Plate, Bar, Sheet, Strip) ── */}
                {selectedGeneralForm === "Flat Form" &&
                  (selectedCategoryForm === "General" ||
                    selectedCategoryForm === "Pressure Part") && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Thickness */}
                        <div className="flex flex-col gap-1">
                          <Label className="text-[11px] font-medium text-foreground flex items-center justify-between">
                            <span>
                              {selectedSubForm === "Sheet" || selectedSubForm === "Strip"
                                ? "Thickness < 4.76 (mm)"
                                : "Thickness ≥ 4.76 (mm)"}
                            </span>
                            <span className="font-mono text-[10px] text-primary">
                              Code: {formDimensionCodes.codes[0]}
                            </span>
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={thkValue}
                            onChange={(e) => setThkValue(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>

                        {/* Width */}
                        <div className="flex flex-col gap-1">
                          <Label className="text-[11px] font-medium text-foreground flex items-center justify-between">
                            <span>
                              {selectedSubForm === "Flat Bar"
                                ? "Width ≤ 250 (mm)"
                                : selectedSubForm === "Strip"
                                ? "Width < 610 (mm)"
                                : "Width > 250 (mm)"}
                            </span>
                            <span className="font-mono text-[10px] text-primary">
                              Code: {formDimensionCodes.codes[1]}
                            </span>
                          </Label>
                          <Input
                            type="number"
                            value={widthValue}
                            onChange={(e) => setWidthValue(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Length / Coil */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="text-[11px] font-medium text-foreground">
                              {isLengthMode ? "Length (mm)" : "Coil (mm)"}
                            </Label>
                            <Button
                              type="button"
                              variant={isLengthMode ? "default" : "outline"}
                              size="sm"
                              className="h-5 px-2 text-[10px] rounded-full"
                              onClick={() => setIsLengthMode(!isLengthMode)}
                            >
                              {isLengthMode ? "Len." : "Coil"}
                            </Button>
                          </div>
                          <span className="font-mono text-[10px] text-primary">
                            Code: {formDimensionCodes.codes[2]}
                          </span>
                        </div>
                        <Input
                          type="number"
                          value={lengthValue}
                          onChange={(e) => setLengthValue(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                {/* ── CASE 2: Forge Form - Standard Flange ── */}
                {selectedGeneralForm === "Forge Form" &&
                  selectedCategoryForm === "Standard Flange" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>NPS (inch)</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[0]}
                          </span>
                        </Label>
                        <Select value={flangeNps} onValueChange={setFlangeNps}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["1/2\"", "3/4\"", "1\"", "1.5\"", "2\"", "3\"", "4\"", "6\"", "8\"", "10\"", "12\""].map(
                              (s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Type (Schedule)</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[1]}
                          </span>
                        </Label>
                        <Select value={flangeType} onValueChange={setFlangeType}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Welding Neck (Sch. STD)",
                              "Blind",
                              "Slip-On",
                              "Socket Weld",
                              "Lap Joint",
                            ].map((t) => (
                              <SelectItem key={t} value={t} className="text-xs">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Class (Face)</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[2]}
                          </span>
                        </Label>
                        <Select value={flangeClass} onValueChange={setFlangeClass}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["150# (R.F.)", "300# (R.F.)", "600# (R.F.)", "150# (R.T.J.)"].map(
                              (c) => (
                                <SelectItem key={c} value={c} className="text-xs">
                                  {c}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                {/* ── CASE 3: Cylinder Form - Pipe ── */}
                {selectedGeneralForm === "Cylinder Form" &&
                  selectedCategoryForm === "Pipe" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Nominal Size</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[0]}
                          </span>
                        </Label>
                        <Select value={pipeNps} onValueChange={setPipeNps}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["1/2\"", "3/4\"", "1\"", "2\"", "3\"", "4\"", "6\"", "8\"", "10\""].map(
                              (s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Schedule</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[1]}
                          </span>
                        </Label>
                        <Select value={pipeSch} onValueChange={setPipeSch}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["STD", "XS", "XXS", "Sch. 10", "Sch. 40", "Sch. 80"].map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Length (mm)</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[2]}
                          </span>
                        </Label>
                        <Input
                          type="number"
                          value={pipeLength}
                          onChange={(e) => setPipeLength(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                {/* ── CASE 4: Connection Form - Bolt / Fasteners ── */}
                {selectedGeneralForm === "Connection Form" &&
                  !selectedCategoryForm.includes("Nut") &&
                  !selectedCategoryForm.includes("Washer") &&
                  selectedCategoryForm !== "Gasket" &&
                  selectedCategoryForm !== "Rope Packing" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Standard</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[0]}
                          </span>
                        </Label>
                        <Select value={boltStandard} onValueChange={setBoltStandard}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["DIN 933", "ASME B18.2.1", "EN 15048", "DIN 912"].map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Size (Metric/Inch)</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[1]}
                          </span>
                        </Label>
                        <Select value={boltSize} onValueChange={setBoltSize}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["M12", "M16", "M20", "M24", "M30", "1/2\"", "5/8\"", "3/4\""].map(
                              (s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Length (mm)</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[2]}
                          </span>
                        </Label>
                        <Input
                          type="number"
                          value={boltLength}
                          onChange={(e) => setBoltLength(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                {/* ── CASE 5: General Dimensions Fallback ── */}
                {selectedGeneralForm !== "Flat Form" &&
                  !(
                    selectedGeneralForm === "Forge Form" &&
                    selectedCategoryForm === "Standard Flange"
                  ) &&
                  !(
                    selectedGeneralForm === "Cylinder Form" &&
                    selectedCategoryForm === "Pipe"
                  ) &&
                  !(
                    selectedGeneralForm === "Connection Form" &&
                    !selectedCategoryForm.includes("Nut") &&
                    !selectedCategoryForm.includes("Washer") &&
                    selectedCategoryForm !== "Gasket" &&
                    selectedCategoryForm !== "Rope Packing"
                  ) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Dim 1 / Size</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[0] || "01"}
                          </span>
                        </Label>
                        <Input
                          value={thkValue}
                          onChange={(e) => setThkValue(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Dim 2 / Type</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[1] || "01"}
                          </span>
                        </Label>
                        <Input
                          value={widthValue}
                          onChange={(e) => setWidthValue(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-medium text-foreground flex justify-between">
                          <span>Dim 3 / Length</span>
                          <span className="font-mono text-[10px] text-primary">
                            {formDimensionCodes.codes[2] || "01"}
                          </span>
                        </Label>
                        <Input
                          value={lengthValue}
                          onChange={(e) => setLengthValue(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
              </div>

              {/* Technical Drawing & Part Image Column (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-s border-border/60 pt-3 md:pt-0 md:ps-3">
                <div
                  className="relative group w-full max-w-[150px] aspect-4/3 rounded-lg overflow-hidden bg-background border border-border/80 flex items-center justify-center cursor-pointer shadow-2xs hover:border-primary transition-all"
                  onClick={() => setPreviewImage(currentPicture)}
                  title={isRtl ? "کلیک برای بزرگنمایی نقشه" : "Click to enlarge"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentPicture}
                    alt={selectedSubForm}
                    className="w-full h-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="size-4 text-white drop-shadow" />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground mt-1.5 text-center truncate max-w-full">
                  {selectedSubForm}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* ============================================================ */}
        {/* ── PANEL B: ESP MATERIAL CODING (جنس و مشخصات متریال) ── */}
        {/* ============================================================ */}
        {(viewMode === "both" || viewMode === "material") && (
          <Card className="p-4 md:p-5 flex flex-col gap-5 border-border shadow-xs bg-card">
            {/* Panel B Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Atom className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-bold text-foreground">
                    {isRtl
                      ? "کدگذاری و مشخصات مهندسی متریال"
                      : "Material Coding & Engineering Specs"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {isRtl
                      ? "استاندارد، گرید، ترکیب شیمیایی، استحکام و خواص مکانیکی"
                      : "Standard, Grade, Chemical Composition & Mechanical Properties"}
                  </p>
                </div>
              </div>

              {/* Form Filter Indicator Badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={filterMaterialByForm ? "default" : "secondary"}
                  className={cn(
                    "text-[10px] px-2 py-0.5 cursor-pointer select-none transition-colors",
                    filterMaterialByForm
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                  onClick={() => setFilterMaterialByForm(!filterMaterialByForm)}
                  title={
                    isRtl
                      ? "کلیک برای فعال یا غیرفعال کردن فیلتر متریال بر اساس فرم"
                      : "Toggle material filtering by form"
                  }
                >
                  <Filter className="size-2.5 me-1" />
                  <span>
                    {filterMaterialByForm
                      ? isRtl
                        ? `فیلتر فرم فعال (${allowableMaterials.length})`
                        : `Filtered (${allowableMaterials.length})`
                      : isRtl
                      ? "تمام متریال‌ها"
                      : "All Materials"}
                  </span>
                </Badge>
              </div>
            </div>

            {/* 6 Levels of Material Combos (Grid 2 cols or 3 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Level 1: Basic Material */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "ماده اصلی:" : "Basic Material:"}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-muted px-1.5 rounded">
                    Code: {activeMaterial?.bmCode || "1"}
                  </span>
                </Label>
                <Select
                  value={selectedBasicMaterial}
                  onValueChange={handleBasicMaterialChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Basic Material" />
                  </SelectTrigger>
                  <SelectContent>
                    {basicMaterialOptions.map((bm) => (
                      <SelectItem key={bm} value={bm} className="text-xs">
                        {bm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level 2: Sub-Material */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "زیرمجموعه:" : "Sub-Material:"}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-muted px-1.5 rounded">
                    Code: {activeMaterial?.smCode || "1"}
                  </span>
                </Label>
                <Select
                  value={selectedSubMaterial}
                  onValueChange={handleSubMaterialChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Sub-Material" />
                  </SelectTrigger>
                  <SelectContent>
                    {subMaterialOptions.map((sm) => (
                      <SelectItem key={sm} value={sm} className="text-xs">
                        {sm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level 3: Material Category */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "دسته‌بندی متریال:" : "Category:"}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-muted px-1.5 rounded">
                    Code: {activeMaterial?.gmCode || "1"}
                  </span>
                </Label>
                <Select
                  value={selectedMaterialCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((gm) => (
                      <SelectItem key={gm} value={gm} className="text-xs">
                        {gm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level 4: Specification */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "نام استاندارد (Spec):" : "Specification:"}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-muted px-1.5 rounded">
                    Code: {(activeMaterial?.specCode || "01").padStart(2, "0")}
                  </span>
                </Label>
                <Select
                  value={selectedSpecification}
                  onValueChange={handleSpecChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Specification" />
                  </SelectTrigger>
                  <SelectContent>
                    {specOptions.map((sp) => (
                      <SelectItem key={sp} value={sp} className="text-xs font-mono font-medium">
                        {sp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level 5: Grade */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "گرید (Grade):" : "Grade:"}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-muted px-1.5 rounded">
                    Code: {(activeMaterial?.gradeCode || "01").padStart(2, "0")}
                  </span>
                </Label>
                <Select
                  value={selectedGrade}
                  onValueChange={handleGradeChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((gr) => (
                      <SelectItem key={gr} value={gr} className="text-xs font-mono font-medium">
                        {gr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level 6: Class / Note */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{isRtl ? "کلاس / نوت:" : "Class / Note:"}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-muted px-1.5 rounded">
                    Code: {activeMaterial?.classCode || "0"}
                  </span>
                </Label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cl) => (
                      <SelectItem key={cl} value={cl} className="text-xs">
                        {cl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Material Engineering Specs Card */}
            {activeMaterial && (
              <div className="w-full bg-muted/20 p-3.5 rounded-xl border border-border/60 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    {isRtl ? "مشخصات فنی و خواص مکانیکی متریال:" : "Mechanical & Technical Properties:"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    UNS: {activeMaterial.uns || "K02700"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-background/80 p-2 rounded-lg border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground">چگالی (Density)</span>
                    <span className="font-mono font-bold text-foreground">
                      {activeMaterial.density || "7850"} kg/m³
                    </span>
                  </div>

                  <div className="bg-background/80 p-2 rounded-lg border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground">استحکام کششی (Tensile)</span>
                    <span className="font-mono font-bold text-foreground">
                      {activeMaterial.tensileMpa || "485"} MPa
                    </span>
                  </div>

                  <div className="bg-background/80 p-2 rounded-lg border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground">تنش تسلیم (Yield)</span>
                    <span className="font-mono font-bold text-foreground">
                      {activeMaterial.yieldMpa || "260"} MPa
                    </span>
                  </div>

                  <div className="bg-background/80 p-2 rounded-lg border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground">دمای کاری (Temp)</span>
                    <span className="font-mono font-bold text-foreground">
                      {activeMaterial.minTemp || "-48"} to {activeMaterial.maxTemp || "538"} °C
                    </span>
                  </div>
                </div>

                {activeMaterial.nominalComposition && (
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-1">
                    <span>ترکیب شیمیایی:</span>
                    <span className="font-mono font-medium text-foreground">
                      {activeMaterial.nominalComposition}
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ── 5. BOTTOM CARD: QUANTITY & PHYSICAL WEIGHT ESTIMATION ── */}
      <Card className="p-4 md:p-5 border-border shadow-xs bg-card flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {isRtl
                ? "تخمین وزن فیزیکی و برآورد مقدار (Weight & Quantity Estimation)"
                : "Physical Weight & Quantity Estimation"}
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {isRtl
              ? "محاسبه کاملاً پویا بر اساس هندسه فرم انتخابی و چگالی متریال"
              : "Dynamic computation from form geometry and material density"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Quantity Value */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {isRtl ? "مقدار مورد نیاز (Quantity):" : "Quantity Value:"}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Unit Selector */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {isRtl ? "واحد سنجش (Unit):" : "Unit:"}
            </Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Kg", "pcs", "Sheet", "m", "m²"].map((u) => (
                  <SelectItem key={u} value={u} className="text-xs">
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight Per Unit */}
          <div className="flex flex-col gap-1 bg-muted/30 p-2.5 rounded-lg border border-border/50">
            <span className="text-[10px] text-muted-foreground font-medium">
              {isRtl ? "وزن هر واحد فیزیکی:" : "Weight Per Unit:"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-base font-bold text-foreground">
                {weightPerUnit.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground">Kg</span>
            </div>
          </div>

          {/* Total Weight */}
          <div className="flex flex-col gap-1 bg-primary/10 p-2.5 rounded-lg border border-primary/20">
            <span className="text-[10px] text-primary font-medium">
              {isRtl ? "وزن کل محاسبه‌شده (Total Weight):" : "Total Weight:"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-primary">
                {totalWeight.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-primary">Kg</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 6. IMAGE ZOOM MODAL ── */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <span>{selectedSubForm} — نقشه و مدل فنی</span>
            </DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-16/10 bg-background rounded-lg overflow-hidden flex items-center justify-center p-4 border border-border">
            {previewImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage}
                alt={selectedSubForm}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
