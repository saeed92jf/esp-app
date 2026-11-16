// src/modules/esp-coding/types/coding-formula.types.ts

export type FormulaLifecycleStatus =
  | "draft"
  | "tested"
  | "pending_approval"
  | "approved"
  | "active"
  | "rejected"
  | "revision_requested"
  | "archived";

export type FormulaTargetEntity = "product" | "material" | "material_form";

export type SeparatorType = "none" | "hyphen" | "underscore" | "dot" | "slash" | "custom";

export type PaddingDirection = "none" | "left" | "right";

export type CaseTransform = "none" | "uppercase" | "lowercase";

export interface CodingFormulaSegmentConfig {
  segmentId: string;
  fieldKey: string;
  labelEn: string;
  labelFa: string;
  sourceEntity: FormulaTargetEntity;
  position: number;
  enabled: boolean;
  required: boolean;
  minLen?: number;
  maxLen?: number;
  paddingChar?: string;
  paddingDirection?: PaddingDirection;
  separatorBefore?: string;
  separatorAfter?: string;
  caseTransform?: CaseTransform;
  prefix?: string;
  suffix?: string;
  missingValueBehavior?: "fail" | "empty" | "placeholder";
  placeholderValue?: string;
}

export interface CodingFormulaVersion {
  versionId: string;
  profileId: string;
  versionNumber: string; // e.g., "1.0", "1.1"
  status: FormulaLifecycleStatus;
  segments: CodingFormulaSegmentConfig[];
  separator: SeparatorType;
  customSeparator?: string;
  targetEntity: FormulaTargetEntity;
  applicableFamilyId?: string; // e.g. "tower_internals" or "all"
  applicableFamilyNameEn?: string;
  applicableFamilyNameFa?: string;
  descriptionEn?: string;
  descriptionFa?: string;
  createdBy: string;
  createdAt: string;
  testedBy?: string;
  testedAt?: string;
  testNotes?: string;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  activatedBy?: string; // STRICTLY SUPERADMIN
  activatedAt?: string; // STRICTLY SUPERADMIN
  activationReason?: string;
}

export interface CodingFormulaProfile {
  profileId: string;
  nameEn: string;
  nameFa: string;
  targetEntity: FormulaTargetEntity;
  applicableScope: string; // "general" | categoryId
  activeVersionId: string | null;
  latestVersionId: string;
  versionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodeGenerationResult {
  code: string;
  segments: Array<{
    segmentId: string;
    fieldKey: string;
    labelEn: string;
    labelFa: string;
    rawValue: string;
    formattedValue: string;
    separator: string;
  }>;
  profileId: string;
  versionId: string;
  versionNumber: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate?: boolean;
}
