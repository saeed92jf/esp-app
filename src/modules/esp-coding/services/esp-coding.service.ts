// src/modules/esp-coding/services/esp-coding.service.ts
import {
  CodingFormulaProfile,
  CodingFormulaVersion,
  CodeGenerationResult,
  RegisteredProduct,
  ProductCodeReservation,
  MaterialMasterRecord,
  MaterialFormRecord,
  CodingAuditLog,
} from "../types";

export class EspCodingClientService {
  private static BASE_URL = "/api/esp-coding";

  public static async getProfilesAndVersions(): Promise<{
    profiles: CodingFormulaProfile[];
    versions: CodingFormulaVersion[];
  }> {
    const res = await fetch(`${this.BASE_URL}/profiles`);
    if (!res.ok) throw new Error("Failed to load formula profiles");
    return res.json();
  }

  public static async createProfile(payload: {
    nameEn: string;
    nameFa: string;
    targetEntity: "product" | "material";
    applicableScope: string;
    userRole?: string;
    userName?: string;
    userId?: string;
  }): Promise<{ profile: CodingFormulaProfile; version: CodingFormulaVersion }> {
    const res = await fetch(`${this.BASE_URL}/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create profile");
    }
    return res.json();
  }

  public static async getVersion(versionId: string): Promise<{ version: CodingFormulaVersion }> {
    const res = await fetch(`${this.BASE_URL}/versions/${versionId}`);
    if (!res.ok) throw new Error("Failed to load formula version");
    return res.json();
  }

  public static async updateVersion(
    versionId: string,
    payload: {
      segments: any[];
      separator?: string;
      customSeparator?: string;
      descriptionEn?: string;
      descriptionFa?: string;
      userId?: string;
      userName?: string;
      userRole?: string;
    }
  ): Promise<{ success: boolean; version: CodingFormulaVersion }> {
    const res = await fetch(`${this.BASE_URL}/versions/${versionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update formula version");
    }
    return res.json();
  }

  public static async generateCode(payload: {
    profileId?: string;
    versionId?: string;
    attributes: Record<string, string>;
  }): Promise<CodeGenerationResult> {
    const res = await fetch(`${this.BASE_URL}/generate-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to generate code");
    return res.json();
  }

  public static async getHierarchyOptions(): Promise<{
    available: boolean;
    options?: any;
    error?: string;
  }> {
    const res = await fetch(`${this.BASE_URL}/hierarchy`);
    if (!res.ok) throw new Error("Failed to fetch hierarchy options");
    return res.json();
  }

  public static async getMaterialHierarchyOptions(): Promise<{
    available: boolean;
    options?: { combinations: any[] };
    error?: string;
  }> {
    const res = await fetch(`${this.BASE_URL}/material-hierarchy`);
    if (!res.ok) throw new Error("Failed to fetch material hierarchy options");
    return res.json();
  }

  public static async getFormHierarchyOptions(): Promise<{
    available: boolean;
    forms?: MaterialFormRecord[];
    materials?: any[];
    error?: string;
  }> {
    const res = await fetch(`${this.BASE_URL}/form-hierarchy`);
    if (!res.ok) throw new Error("Failed to fetch form hierarchy options");
    return res.json();
  }

  public static async getProducts(params?: {
    source?: "registered" | "catalog" | "both";
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    registered: RegisteredProduct[];
    reservations: ProductCodeReservation[];
    catalog: { items: any[]; total: number; offset: number; limit: number };
  }> {
    const url = new URL(`${window.location.origin}${this.BASE_URL}/products`);
    if (params?.source) url.searchParams.set("source", params.source);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.offset) url.searchParams.set("offset", String(params.offset));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  }

  public static async registerProduct(payload: any): Promise<{ success: boolean; product?: any; reservation?: any }> {
    const res = await fetch(`${this.BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to register product");
    }
    return res.json();
  }

  public static async getMaterials(params?: {
    search?: string;
    spec?: string;
    grade?: string;
    form?: string;
    groupMat?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: MaterialMasterRecord[]; total: number; offset: number; limit: number }> {
    const url = new URL(`${window.location.origin}${this.BASE_URL}/materials`);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.spec) url.searchParams.set("spec", params.spec);
    if (params?.grade) url.searchParams.set("grade", params.grade);
    if (params?.form) url.searchParams.set("form", params.form);
    if (params?.groupMat) url.searchParams.set("groupMat", params.groupMat);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.offset) url.searchParams.set("offset", String(params.offset));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch materials");
    return res.json();
  }

  public static async getMaterialDetails(matId: string): Promise<{ material: MaterialMasterRecord }> {
    const res = await fetch(`${this.BASE_URL}/materials/${matId}`);
    if (!res.ok) throw new Error("Failed to fetch material details");
    return res.json();
  }

  public static async getMaterialForms(params?: { search?: string }): Promise<{ forms: MaterialFormRecord[] }> {
    const url = new URL(`${window.location.origin}${this.BASE_URL}/material-forms`);
    if (params?.search) url.searchParams.set("search", params.search);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch material forms");
    return res.json();
  }

  public static async getAuditLogs(): Promise<{ logs: CodingAuditLog[] }> {
    const res = await fetch(`${this.BASE_URL}/audit-logs`);
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  }

  public static async processApprovalAction(payload: {
    versionId: string;
    action: string;
    reason?: string;
    userRole?: string;
    userId?: string;
    userName?: string;
  }): Promise<{ success: boolean; version: CodingFormulaVersion }> {
    const res = await fetch(`${this.BASE_URL}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to process approval action");
    }
    return res.json();
  }
}
