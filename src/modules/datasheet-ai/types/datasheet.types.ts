// src/modules/datasheet-ai/types/datasheet.types.ts

export type DocumentProcessingStatus = "uploaded" | "queued" | "ocr_processing" | "extracting" | "completed" | "failed";

export type ParameterVerificationStatus = "verified" | "unverified" | "modified" | "flagged";

export type ParameterCategory = "design" | "operating" | "mechanical" | "materials" | "electrical" | "dimensions" | "general";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TechnicalParameter {
  id: string;
  key: string;
  labelFa: string;
  labelEn: string;
  value: string;
  unit?: string;
  category: ParameterCategory;
  sourcePage: number;
  confidence: number; // 0 to 1
  status: ParameterVerificationStatus;
  boundingBox?: BoundingBox;
  notes?: string;
  rawValue?: string;
}

export interface ExtractionSummaryData {
  equipmentName?: string;
  tagNumber?: string;
  equipmentType?: string;
  manufacturer?: string;
  modelNumber?: string;
  designCode?: string;
  totalExtracted: number;
  totalMissing: number;
  totalAmbiguous: number;
  completionRate: number;
  overallConfidence: number;
}

export interface DatasheetDocument {
  id: string;
  name: string;
  originalName: string;
  sizeBytes: number;
  sizeFormatted: string;
  mimeType: string;
  pageCount: number;
  uploadedAt: string;
  status: DocumentProcessingStatus;
  progressPercent: number;
  errorMessage?: string;
  url?: string;
  summary?: ExtractionSummaryData;
  parametersCount?: number;
}

export interface AIChatCitation {
  page: number;
  snippet: string;
  parameterKey?: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations?: AIChatCitation[];
  isStreaming?: boolean;
}

export interface ExtractionJob {
  jobId: string;
  documentId: string;
  status: DocumentProcessingStatus;
  progressPercent: number;
  currentStep?: string;
  errorMessage?: string;
}

