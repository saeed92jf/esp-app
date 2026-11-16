// src/lib/server/coding-excel-provider.ts
import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import { ProductionTreeSourceRecord, MaterialMasterRecord, MaterialFormRecord } from "@/modules/esp-coding/types";

/**
 * RULE: The authoritative Coding.xlsx is bundled inside the project at:
 *   src/lib/server/data/Coding.xlsx
 * This prevents dependency on a local Desktop path that breaks on other machines.
 * To update the data, replace the file at that path.
 */
const EXCEL_PATH = path.join(process.cwd(), "src", "lib", "server", "data", "Coding.xlsx");

interface CachedData {
  productionTree: ProductionTreeSourceRecord[];
  materials: MaterialMasterRecord[];
  materialForms: MaterialFormRecord[];
  loadedAt: number;
}

let memoryCache: CachedData | null = null;

export class CodingExcelProvider {
  public static getFilePath(): string {
    return EXCEL_PATH;
  }

  public static isWorkbookAvailable(): boolean {
    return fs.existsSync(EXCEL_PATH);
  }

  public static loadWorkbook(): CachedData {
    if (memoryCache && Date.now() - memoryCache.loadedAt < 3600000) {
      return memoryCache;
    }

    if (!fs.existsSync(EXCEL_PATH)) {
      console.warn(`[CodingExcelProvider] Workbook not found at ${EXCEL_PATH}`);
      return {
        productionTree: [],
        materials: [],
        materialForms: [],
        loadedAt: Date.now(),
      };
    }

    console.log(`[CodingExcelProvider] Loading workbook from ${EXCEL_PATH}...`);
    const wb = xlsx.readFile(EXCEL_PATH, { raw: false });

    // 1. Production Tree
    const prodSheet = wb.Sheets["TBL_M_Production_Tree_Coding"];
    const prodRaw = prodSheet
      ? xlsx.utils.sheet_to_json<any>(prodSheet, { defval: "", raw: false })
      : [];
    const productionTree: ProductionTreeSourceRecord[] = prodRaw.map((r) => ({
      id: String(r.ID || ""),
      espType: String(r.ESP_Type || ""),
      espCode: String(r.ESP_Code || ""),
      defaultProductionCategoryId: String(r.Default_Production_Category_ID || ""),
      productionCategory: String(r.Production_Category || ""),
      productionCategoryAbb: String(r.Production_Category_Abb || ""),
      productionCategoryId: String(r.Production_Category_ID || ""),
      productionCode: String(r.Production_Code || ""),
      otherTblId: String(r.OtherTBL_ID || ""),
      defaultInternalProductId: String(r.Default_Internal_Product_ID || ""),
      internalProduct: String(r.Internal_Product || ""),
      internalProductId: String(r.Internal_Product_ID || ""),
      internalProductCode: String(r.Internal_Product_Code || ""),
      productType: String(r.Product_Type || ""),
      productTypeCode: String(r.Product_Type_Code || ""),
      defaultProductTypeId: String(r.Default_Product_Type_ID || ""),
      productTypeId: String(r.Product_Type_ID || ""),
      userControlName: String(r.UserControlName || ""),
      shape: String(r.Shape || ""),
      shapeCode: String(r.Shape_Code || ""),
      shapeId: String(r.Shape_ID || ""),
      type: String(r.Type || ""),
      typeCode: String(r.Type_Code || ""),
      typeId: String(r.Type_ID || ""),
      liftHoleSize: String(r.Lift_Hole_Size || ""),
      liftSizeCode: String(r.Lift_Size_Code || ""),
      liftSizeId: String(r.Lift_Size_ID || ""),
      liftHoleSizeDescription: String(r.Lift_Hole_Size_Description || ""),
      thk: String(r.Thk || ""),
      thkCode: String(r.Thk_Code || ""),
      p1: String(r.P1 || ""),
      p2: String(r.P2 || ""),
      p3: String(r.P3 || ""),
      p4: String(r.P4 || ""),
      parameter: String(r.Parameter || ""),
      pic: String(r.Pic || ""),
      geometryForm: String(r.GeometryForm) === "-1",
      arrangementForm: String(r.ArrangmentForm) === "-1",
      technicalForm: String(r.TechnicalForm) === "-1",
      weightEstimationForm: String(r.WeightEstimationForm) === "-1",
      connectionForm: String(r.ConnectionForm) === "-1",
      mtoForm: String(r.MTOForm) === "-1",
      mechanicalForm: String(r.MechanicalForm) === "-1",
      hydraulic: String(r.Hydraulic) === "-1",
    }));

    // 2. Material Master (165 columns!)
    const matSheet = wb.Sheets["TBL_Material_New"];
    const matRaw = matSheet
      ? xlsx.utils.sheet_to_json<any>(matSheet, { defval: "", raw: false })
      : [];
    const materials: MaterialMasterRecord[] = matRaw.map((r) => {
      const rawProperties: Record<string, string> = {};
      Object.keys(r).forEach((k) => {
        rawProperties[k] = String(r[k] || "");
      });

      return {
        matId: String(r.MAT_ID || ""),
        basicMaterial: String(r.Basic_Material || ""),
        basicMaterialId: String(r.Basic_Material_ID || ""),
        basicMaterialCode: String(r.Basic_Material_Code || ""),
        standardGroup: String(r.Stanard_Group || ""),
        standardGroupId: String(r.Stanard_Group_ID || ""),
        subMaterial: String(r.Sub_Material || ""),
        subMaterialId: String(r.Sub_Material_ID || ""),
        subMaterialCode: String(r.Sub_Material_Code || ""),
        groupMatId: String(r.GROUP_MAT_ID || ""),
        groupMat: String(r.GROUP_MAT || ""),
        groupMatId1: String(r.GROUP_MAT_ID1 || ""),
        groupMat1: String(r.GROUP_MAT1 || ""),
        groupMatCode1: String(r.GROUP_MAT_Code1 || ""),
        schMat: String(r.Sch_Mat || ""),
        schMatId: String(r.Sch_Mat_ID || ""),
        specId: String(r.SPEC_ID || ""),
        spec: String(r.SPEC || ""),
        specCode: String(r.SPEC_Code || ""),
        grade: String(r.GRADE || ""),
        gradeId: String(r.GRADE_ID || ""),
        gradeCode: String(r.GRADE_Code || ""),
        classVal: String(r.CLASS || ""),
        classId: String(r.CLASS_ID || ""),
        classCode: String(r.CLASS_Code || ""),
        uns: String(r.UNS || ""),
        form: String(r.FORM || ""),
        formId: String(r.FORM_ID || ""),
        density: String(r.Density || ""),
        poissonsRatio: String(r.Poissons_Ratio || ""),
        elongation50: String(r.Elongation_50 || ""),
        elongation200: String(r.Elongation_200 || ""),
        tensileMpa: String(r.TENSILE_Mpa || ""),
        yieldMpa: String(r.YIELD_MPA || ""),
        sAllowTensile: String(r.S_ALLOW_TENSILE || ""),
        sAllowYield: String(r.S_ALLOW_YIELD || ""),
        elasticModulus: String(r.Elastic_Modulus || ""),
        pren: String(r.PREN || ""),
        carbonEquivalent: String(r.Carbon_Equivalent || ""),
        meltingPoint: String(r.Melting_Point || ""),
        minTemp: String(r.Min_Temp || ""),
        maxTemp: String(r.Max_Temp || ""),
        pwht: String(r.PWHT || ""),
        iso15608: String(r.ISO_15608 || ""),
        pNoRef: String(r.P_No_Ref || ""),
        aNo: String(r.A_No || ""),
        nominalComposition: String(r.Nominal_Composition || ""),
        smaw: String(r.SMAW || ""),
        gtaw: String(r.GTAW || ""),
        gmaw: String(r.GMAW || ""),
        saw: String(r.SAW || ""),
        fcaw: String(r.FCAW || ""),
        hardnessMin: String(r.Hardness_Min || ""),
        hardnessMax: String(r.Hardness_Max || ""),
        dinName: String(r.DIN_Name || ""),
        dinNumber: String(r.DIN_Number || ""),
        dinEnNumber: String(r.DIN_EN_Number || ""),
        refMaterial: String(r.Ref_Material || ""),
        refHeatTreatment: String(r.Ref_Heat_Treatment || ""),
        rawProperties,
      };
    });

    // 3. Material Forms
    const formSheet = wb.Sheets["TBL_Material_Coding_New"];
    const formRaw = formSheet
      ? xlsx.utils.sheet_to_json<any>(formSheet, { defval: "", raw: false })
      : [];
    const materialForms: MaterialFormRecord[] = formRaw.map((r) => ({
      id: String(r.ID || ""),
      generalFormId: String(r.General_Form_ID || ""),
      generalForm: String(r.General_Form || ""),
      categoryFormId: String(r.Category_Form_ID || ""),
      categoryForm: String(r.Category_Form || ""),
      subFormId: String(r.Sub_Form_ID || ""),
      subForm: String(r.Sub_Form || ""),
      defaultDetailForms: String(r.DefaultDetailForms || ""),
      titleDetailsForm: String(r.TitileDetailsForm || ""),
      materialFormName: String(r.Material_Form_Name || ""),
      subFormIdOtherTbl: String(r.Sub_Form_ID_OtherTbl || ""),
      subAdditional: String(r.Sub_Additional || ""),
      refPic: String(r.Ref_Pic || ""),
      materialForm: String(r.Material_Form || ""),
      materialNonMetal: String(r.MaterialNonMetal || ""),
      reference: String(r.Reference || ""),
      referenceName: String(r.Reference_Name || ""),
      referenceDescription: String(r.Reference_Description || ""),
      unitRelation: String(r.UnitRelation || ""),
      mtoDoc: String(r.MtoDoc || ""),
      mtoFormat: String(r.MtoFormat || ""),
      mtoFormatDescription: String(r.MtoFormatDescription || ""),
    }));

    memoryCache = {
      productionTree,
      materials,
      materialForms,
      loadedAt: Date.now(),
    };

    console.log(
      `[CodingExcelProvider] Loaded: ${productionTree.length} products, ${materials.length} materials, ${materialForms.length} material forms.`
    );

    return memoryCache;
  }

  // --- QUERY METHODS ---

  public static getProductionTree(filter?: {
    search?: string;
    productionCategory?: string;
    internalProduct?: string;
    productType?: string;
    limit?: number;
    offset?: number;
  }): { items: ProductionTreeSourceRecord[]; total: number } {
    const data = this.loadWorkbook().productionTree;
    let filtered = data;

    if (filter?.productionCategory) {
      filtered = filtered.filter((r) => r.productionCategory === filter.productionCategory);
    }
    if (filter?.internalProduct) {
      filtered = filtered.filter((r) => r.internalProduct === filter.internalProduct);
    }
    if (filter?.productType) {
      filtered = filtered.filter((r) => r.productType === filter.productType);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.productionCategory.toLowerCase().includes(q) ||
          r.internalProduct.toLowerCase().includes(q) ||
          r.productType.toLowerCase().includes(q) ||
          r.shape.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const offset = filter?.offset || 0;
    const limit = filter?.limit || 50;
    const items = filtered.slice(offset, offset + limit);

    return { items, total };
  }

  public static getHierarchyOptions(): {
    categories: Array<{ id: string; name: string; code: string }>;
    internalProducts: Array<{ id: string; name: string; code: string; categoryId: string }>;
    productTypes: Array<{ id: string; name: string; code: string; internalProductId: string }>;
    shapes: Array<{ id: string; name: string; code: string }>;
    types: Array<{ id: string; name: string; code: string }>;
    liftSizes: Array<{ id: string; name: string; code: string }>;
    thicknesses: Array<{ id: string; name: string; code: string }>;
  } {
    const data = this.loadWorkbook().productionTree;

    const catMap = new Map<string, { id: string; name: string; code: string }>();
    const intProdMap = new Map<string, { id: string; name: string; code: string; categoryId: string }>();
    const typeMap = new Map<string, { id: string; name: string; code: string; internalProductId: string }>();
    const shapeMap = new Map<string, { id: string; name: string; code: string }>();
    const subTypeMap = new Map<string, { id: string; name: string; code: string }>();
    const liftMap = new Map<string, { id: string; name: string; code: string }>();
    const thkMap = new Map<string, { id: string; name: string; code: string }>();

    data.forEach((r) => {
      if (r.productionCategory && !catMap.has(r.productionCategory)) {
        catMap.set(r.productionCategory, {
          id: r.productionCategoryId,
          name: r.productionCategory,
          code: r.productionCode,
        });
      }
      if (r.internalProduct && !intProdMap.has(r.internalProduct)) {
        intProdMap.set(r.internalProduct, {
          id: r.internalProductId,
          name: r.internalProduct,
          code: r.internalProductCode,
          categoryId: r.productionCategoryId,
        });
      }
      if (r.productType && !typeMap.has(r.productType)) {
        typeMap.set(r.productType, {
          id: r.productTypeId,
          name: r.productType,
          code: r.productTypeCode,
          internalProductId: r.internalProductId,
        });
      }
      if (r.shape && !shapeMap.has(r.shape)) {
        shapeMap.set(r.shape, {
          id: r.shapeId,
          name: r.shape,
          code: r.shapeCode,
        });
      }
      if (r.type && !subTypeMap.has(r.type)) {
        subTypeMap.set(r.type, {
          id: r.typeId,
          name: r.type,
          code: r.typeCode,
        });
      }
      if (r.liftHoleSize && !liftMap.has(r.liftHoleSize)) {
        liftMap.set(r.liftHoleSize, {
          id: r.liftSizeId,
          name: r.liftHoleSize,
          code: r.liftSizeCode,
        });
      }
      if (r.thk && !thkMap.has(r.thk)) {
        thkMap.set(r.thk, {
          id: r.thkCode,
          name: r.thk,
          code: r.thkCode,
        });
      }
    });

    return {
      categories: Array.from(catMap.values()),
      internalProducts: Array.from(intProdMap.values()),
      productTypes: Array.from(typeMap.values()),
      shapes: Array.from(shapeMap.values()),
      types: Array.from(subTypeMap.values()),
      liftSizes: Array.from(liftMap.values()),
      thicknesses: Array.from(thkMap.values()),
    };
  }

  public static getMaterials(filter?: {
    search?: string;
    spec?: string;
    grade?: string;
    form?: string;
    limit?: number;
    offset?: number;
  }): { items: MaterialMasterRecord[]; total: number } {
    const data = this.loadWorkbook().materials;
    let filtered = data;

    if (filter?.spec) {
      filtered = filtered.filter((r) => r.spec === filter.spec);
    }
    if (filter?.grade) {
      filtered = filtered.filter((r) => r.grade === filter.grade);
    }
    if (filter?.form) {
      filtered = filtered.filter((r) => r.form === filter.form);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.spec.toLowerCase().includes(q) ||
          r.grade.toLowerCase().includes(q) ||
          r.uns.toLowerCase().includes(q) ||
          r.groupMat.toLowerCase().includes(q) ||
          r.form.toLowerCase().includes(q) ||
          r.dinName?.toLowerCase().includes(q) ||
          r.nominalComposition?.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const offset = filter?.offset || 0;
    const limit = filter?.limit || 50;
    const items = filtered.slice(offset, offset + limit);

    return { items, total };
  }

  public static getMaterialById(matId: string): MaterialMasterRecord | undefined {
    return this.loadWorkbook().materials.find((m) => m.matId === matId);
  }

  public static getMaterialForms(): MaterialFormRecord[] {
    return this.loadWorkbook().materialForms;
  }
}
