// src/lib/server/esp-coding-store.ts
import fs from "fs";
import path from "path";
import {
  CodingFormulaProfile,
  CodingFormulaVersion,
  CodingFormulaSegmentConfig,
  ProductCodeReservation,
  RegisteredProduct,
  CodingAuditLog,
  CodingImportBatch,
} from "@/modules/esp-coding/types";
import { UserRole } from "@/types/auth";

const DATA_DIR = "C:\\ESP_DATA\\live\\data";
const FALLBACK_DIR = path.join(process.cwd(), "src", "data", "mock");

function getStoragePath(fileName: string): string {
  try {
    if (fs.existsSync(DATA_DIR)) {
      return path.join(DATA_DIR, fileName);
    }
  } catch {}
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
  }
  return path.join(FALLBACK_DIR, fileName);
}

function readJsonFile<T>(fileName: string, fallback: T): T {
  const filePath = getStoragePath(fileName);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[ESPCodingStore] Error reading ${fileName}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(fileName: string, data: T): void {
  const filePath = getStoragePath(fileName);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    console.error(`[ESPCodingStore] Error writing ${fileName}:`, err);
    throw new Error(`Failed to persist ${fileName}`);
  }
}

// -------------------------------------------------------------
// DEFAULT SEED FORMULAS
// -------------------------------------------------------------

const DEFAULT_PRODUCTION_SEGMENTS: CodingFormulaSegmentConfig[] = [
  {
    segmentId: "seg_esp",
    fieldKey: "ESP_Code",
    labelEn: "ESP Code",
    labelFa: "کد ای‌اس‌پی",
    sourceEntity: "product",
    position: 0,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 1,
  },
  {
    segmentId: "seg_prod",
    fieldKey: "Production_Code",
    labelEn: "Production Category",
    labelFa: "دسته تولید",
    sourceEntity: "product",
    position: 1,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 1,
  },
  {
    segmentId: "seg_int_prod",
    fieldKey: "Internal_Product_Code",
    labelEn: "Internal Product",
    labelFa: "محصول داخلی",
    sourceEntity: "product",
    position: 2,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 2,
  },
  {
    segmentId: "seg_prod_type",
    fieldKey: "Product_Type_Code",
    labelEn: "Product Type",
    labelFa: "نوع محصول",
    sourceEntity: "product",
    position: 3,
    enabled: true,
    required: true,
    minLen: 2,
    maxLen: 2,
    paddingChar: "0",
    paddingDirection: "left",
  },
  {
    segmentId: "seg_shape",
    fieldKey: "Shape_Code",
    labelEn: "Shape",
    labelFa: "شکل هندسی",
    sourceEntity: "product",
    position: 4,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 2,
  },
  {
    segmentId: "seg_type",
    fieldKey: "Type_Code",
    labelEn: "Type",
    labelFa: "نوع ساختار",
    sourceEntity: "product",
    position: 5,
    enabled: true,
    required: true,
    minLen: 2,
    maxLen: 2,
    paddingChar: "0",
    paddingDirection: "left",
  },
  {
    segmentId: "seg_lift",
    fieldKey: "Lift_Size_Code",
    labelEn: "Lift Hole Size",
    labelFa: "اندازه سوراخ / لیفت",
    sourceEntity: "product",
    position: 6,
    enabled: true,
    required: true,
    minLen: 2,
    maxLen: 2,
    paddingChar: "0",
    paddingDirection: "left",
  },
  {
    segmentId: "seg_thk",
    fieldKey: "Thk_Code",
    labelEn: "Thickness",
    labelFa: "ضخامت",
    sourceEntity: "product",
    position: 7,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 2,
  },
];

const DEFAULT_MATERIAL_SEGMENTS: CodingFormulaSegmentConfig[] = [
  {
    segmentId: "seg_mat_basic",
    fieldKey: "Basic_Material_Code",
    labelEn: "Basic Material",
    labelFa: "متریال پایه",
    sourceEntity: "material",
    position: 0,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 1,
  },
  {
    segmentId: "seg_mat_sub",
    fieldKey: "Sub_Material_Code",
    labelEn: "Sub Material",
    labelFa: "زیرگروه متریال",
    sourceEntity: "material",
    position: 1,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 2,
  },
  {
    segmentId: "seg_mat_group",
    fieldKey: "GROUP_MAT_Code1",
    labelEn: "Material Group",
    labelFa: "گروه متریال",
    sourceEntity: "material",
    position: 2,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 1,
  },
  {
    segmentId: "seg_mat_spec",
    fieldKey: "SPEC_Code",
    labelEn: "Specification",
    labelFa: "مشخصه فنی (SPEC)",
    sourceEntity: "material",
    position: 3,
    enabled: true,
    required: true,
    minLen: 2,
    maxLen: 2,
    paddingChar: "0",
    paddingDirection: "left",
  },
  {
    segmentId: "seg_mat_grade",
    fieldKey: "GRADE_Code",
    labelEn: "Grade",
    labelFa: "گرید متریال",
    sourceEntity: "material",
    position: 4,
    enabled: true,
    required: true,
    minLen: 2,
    maxLen: 2,
    paddingChar: "0",
    paddingDirection: "left",
  },
  {
    segmentId: "seg_mat_class",
    fieldKey: "CLASS_Code",
    labelEn: "Class",
    labelFa: "کلاس کاری",
    sourceEntity: "material",
    position: 5,
    enabled: true,
    required: true,
    minLen: 1,
    maxLen: 2,
  },
];

// -------------------------------------------------------------
// CORE REPOSITORY CLASS
// -------------------------------------------------------------

export class EspCodingStore {
  // Filenames in C:\ESP_DATA\live\data\
  private static PROFILES_FILE = "esp_coding_profiles.json";
  private static VERSIONS_FILE = "esp_coding_versions.json";
  private static RESERVATIONS_FILE = "esp_coding_reservations.json";
  private static PRODUCTS_FILE = "esp_coding_products.json";
  private static AUDIT_FILE = "esp_coding_audit_logs.json";
  private static IMPORTS_FILE = "esp_coding_imports.json";

  /**
   * Initializes store with verified default seed profiles if empty.
   */
  public static ensureInitialized(): void {
    const profiles = this.getProfiles();
    if (profiles.length === 0) {
      console.log("[ESPCodingStore] Initializing default coding profiles...");

      const now = new Date().toISOString();

      const prodProfile: CodingFormulaProfile = {
        profileId: "prof_general_production",
        nameEn: "General Production Product Formula",
        nameFa: "فرمول عمومی کدگذاری محصولات تولیدی",
        targetEntity: "product",
        applicableScope: "general",
        activeVersionId: "ver_prod_1_0",
        latestVersionId: "ver_prod_1_0",
        versionsCount: 1,
        createdAt: now,
        updatedAt: now,
      };

      const prodVersion: CodingFormulaVersion = {
        versionId: "ver_prod_1_0",
        profileId: "prof_general_production",
        versionNumber: "1.0",
        status: "active",
        separator: "none",
        targetEntity: "product",
        applicableFamilyId: "all",
        applicableFamilyNameEn: "All Production Categories",
        applicableFamilyNameFa: "کلیه دسته‌های تولیدی",
        descriptionEn: "Initial authoritative baseline formula from Coding.xlsx Production Tree",
        descriptionFa: "فرمول پایه مرجع استخراج‌شده از درخت تولید Coding.xlsx",
        segments: DEFAULT_PRODUCTION_SEGMENTS,
        createdBy: "SYSTEM",
        createdAt: now,
        approvedBy: "SUPERADMIN_ROOT",
        approvedAt: now,
        activatedBy: "SUPERADMIN_ROOT",
        activatedAt: now,
        activationReason: "Initial baseline setup from enterprise specification",
      };

      const matProfile: CodingFormulaProfile = {
        profileId: "prof_general_material",
        nameEn: "General Material Master Formula",
        nameFa: "فرمول عمومی مستر دیتای متریال",
        targetEntity: "material",
        applicableScope: "general",
        activeVersionId: "ver_mat_1_0",
        latestVersionId: "ver_mat_1_0",
        versionsCount: 1,
        createdAt: now,
        updatedAt: now,
      };

      const matVersion: CodingFormulaVersion = {
        versionId: "ver_mat_1_0",
        profileId: "prof_general_material",
        versionNumber: "1.0",
        status: "active",
        separator: "none",
        targetEntity: "material",
        applicableFamilyId: "all",
        applicableFamilyNameEn: "All Materials",
        applicableFamilyNameFa: "کلیه متریال‌ها",
        descriptionEn: "Baseline 6-segment material specification formula",
        descriptionFa: "فرمول پایه ۶ بخشی مشخصات متریال",
        segments: DEFAULT_MATERIAL_SEGMENTS,
        createdBy: "SYSTEM",
        createdAt: now,
        approvedBy: "SUPERADMIN_ROOT",
        approvedAt: now,
        activatedBy: "SUPERADMIN_ROOT",
        activatedAt: now,
        activationReason: "Initial baseline material setup",
      };

      this.saveProfiles([prodProfile, matProfile]);
      this.saveVersions([prodVersion, matVersion]);

      this.logAudit({
        id: `audit_${Date.now()}`,
        action: "formula_activated",
        entityType: "formula",
        entityId: prodVersion.versionId,
        userId: "SYSTEM",
        userName: "System Superadmin",
        userRole: "superadmin",
        timestamp: now,
        detailsEn: "System baseline formula profiles initialized and activated.",
        detailsFa: "پروفایل‌های پایه سیستم مقداردهی اولیه و فعال شدند.",
      });
    }
  }

  // --- Profiles ---
  public static getProfiles(): CodingFormulaProfile[] {
    return readJsonFile<CodingFormulaProfile[]>(this.PROFILES_FILE, []);
  }

  public static saveProfiles(profiles: CodingFormulaProfile[]): void {
    writeJsonFile(this.PROFILES_FILE, profiles);
  }

  // --- Versions ---
  public static getVersions(): CodingFormulaVersion[] {
    return readJsonFile<CodingFormulaVersion[]>(this.VERSIONS_FILE, []);
  }

  public static saveVersions(versions: CodingFormulaVersion[]): void {
    writeJsonFile(this.VERSIONS_FILE, versions);
  }

  public static getVersionById(versionId: string): CodingFormulaVersion | undefined {
    return this.getVersions().find((v) => v.versionId === versionId);
  }

  public static getActiveVersionForProfile(profileId: string): CodingFormulaVersion | undefined {
    const profile = this.getProfiles().find((p) => p.profileId === profileId);
    if (!profile || !profile.activeVersionId) return undefined;
    return this.getVersionById(profile.activeVersionId);
  }

  // --- Registered Products ---
  public static getRegisteredProducts(): RegisteredProduct[] {
    return readJsonFile<RegisteredProduct[]>(this.PRODUCTS_FILE, []);
  }

  public static saveRegisteredProducts(products: RegisteredProduct[]): void {
    writeJsonFile(this.PRODUCTS_FILE, products);
  }

  // --- Reservations ---
  public static getReservations(): ProductCodeReservation[] {
    return readJsonFile<ProductCodeReservation[]>(this.RESERVATIONS_FILE, []);
  }

  public static saveReservations(reservations: ProductCodeReservation[]): void {
    writeJsonFile(this.RESERVATIONS_FILE, reservations);
  }

  // --- Audit Logs ---
  public static getAuditLogs(): CodingAuditLog[] {
    return readJsonFile<CodingAuditLog[]>(this.AUDIT_FILE, []);
  }

  public static logAudit(log: CodingAuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log); // prepend latest
    writeJsonFile(this.AUDIT_FILE, logs.slice(0, 5000));
  }

  // --- Imports ---
  public static getImportBatches(): CodingImportBatch[] {
    return readJsonFile<CodingImportBatch[]>(this.IMPORTS_FILE, []);
  }

  public static saveImportBatches(batches: CodingImportBatch[]): void {
    writeJsonFile(this.IMPORTS_FILE, batches);
  }

  // --- SUPERADMIN AUTHORIZATION GUARD ---
  /**
   * Part 12.4 Mandatory Server-side Authorization Check.
   * Throws an explicit error if the role is not 'superadmin'.
   */
  public static assertSuperAdmin(role?: string | null): void {
    if (role !== "superadmin") {
      throw new Error(
        "FORBIDDEN: Only SUPER ADMIN is authorized to perform formula approval, activation, rollback, or archive."
      );
    }
  }
}
