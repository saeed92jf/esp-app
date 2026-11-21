// src/modules/esp-coding/types/product-coding.types.ts

export type ProductReservationStatus = "draft" | "reserved" | "registered";

export interface ProductionTreeSourceRecord {
  id: string; // Original ID
  espType: string;
  espCode: string;
  defaultProductionCategoryId?: string;
  productionCategory: string;
  productionCategoryAbb: string;
  productionCategoryId: string;
  productionCode: string;
  otherTblId?: string;
  defaultInternalProductId?: string;
  internalProduct: string;
  internalProductId: string;
  internalProductCode: string;
  productType: string;
  productTypeCode: string;
  defaultProductTypeId?: string;
  productTypeId: string;
  userControlName?: string;
  shape: string;
  shapeCode: string;
  shapeId: string;
  type: string;
  typeCode: string;
  typeId: string;
  liftHoleSize: string;
  liftSizeCode: string;
  liftSizeId: string;
  liftHoleSizeDescription?: string;
  thk: string;
  thkCode: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  parameter?: string;
  pic?: string;
  geometryForm?: boolean;
  arrangementForm?: boolean;
  technicalForm?: boolean;
  weightEstimationForm?: boolean;
  connectionForm?: boolean;
  mtoForm?: boolean;
  mechanicalForm?: boolean;
  hydraulic?: boolean;
}

export interface ProductTreeCombination {
  cat: string;
  catCode: string;
  ip: string;
  ipCode: string;
  pt: string;
  ptCode: string;
  shape: string;
  shapeCode: string;
  type: string;
  typeCode: string;
  lift: string;
  liftCode: string;
  thk: string;
  thkCode: string;
  pic?: string;
}

export interface DynamicAttributeDefinition {
  key: string; // e.g. "P1", "P2", "P3", "P4", "Parameter"
  labelEn: string;
  labelFa: string;
  dataType: "text" | "number" | "select" | "boolean";
  unit?: string;
  required: boolean;
  availableOptions?: string[];
  applicableProductTypes?: string[];
}

export interface ProductCodeReservation {
  reservationId: string;
  productCode: string;
  status: ProductReservationStatus;
  profileId: string;
  formulaVersionId: string;
  formulaVersionNumber: string;
  reservedBy: string;
  reservedAt: string;
  expiresAt: string;
  attributes: Record<string, string>;
  productDescriptionEn: string;
  productDescriptionFa: string;
  primaryMaterialId?: string;
}

export interface RegisteredProduct {
  productId: string;
  productCode: string;
  nameEn: string;
  nameFa: string;
  productionCategory: string;
  internalProduct: string;
  productType: string;
  shape: string;
  type: string;
  liftHoleSize: string;
  thk: string;
  attributes: Record<string, string>;
  primaryMaterialId?: string;
  materialIds?: string[];
  formulaProfileId: string;
  formulaVersionId: string;
  formulaVersionNumber: string;
  registeredBy: string;
  registeredAt: string;
  status: "active" | "archived" | "superseded";
  notes?: string;
}
