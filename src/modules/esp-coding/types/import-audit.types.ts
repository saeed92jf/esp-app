// src/modules/esp-coding/types/import-audit.types.ts

export type AuditActionType =
  | "formula_created"
  | "formula_updated"
  | "formula_tested"
  | "formula_submitted"
  | "formula_approved"
  | "formula_activated"
  | "formula_deactivated"
  | "formula_rolled_back"
  | "formula_archived"
  | "product_reserved"
  | "product_registered"
  | "product_updated"
  | "material_created"
  | "material_updated"
  | "excel_import_started"
  | "excel_import_completed"
  | "excel_import_failed"
  | "excel_import_rolled_back";

export interface CodingAuditLog {
  id: string;
  action: AuditActionType;
  entityType: "formula" | "product" | "material" | "import" | "classification";
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  detailsEn: string;
  detailsFa: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
}

export interface CodingImportValidationError {
  rowNumber: number;
  sheetName: string;
  field: string;
  value: string;
  errorType: "missing_required" | "invalid_foreign_key" | "duplicate" | "format_mismatch";
  messageEn: string;
  messageFa: string;
}

export interface CodingImportBatch {
  batchId: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  status: "pending" | "validating" | "validated" | "importing" | "completed" | "failed" | "rolled_back";
  sheetSummaries: Record<string, { totalRows: number; validRows: number; errorRows: number }>;
  errors: CodingImportValidationError[];
  startedAt: string;
  completedAt?: string;
  importedBy: string;
}
