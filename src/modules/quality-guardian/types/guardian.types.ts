// src/modules/quality-guardian/types/guardian.types.ts

export type ViolationCategory =
  | "non_standard_ui"
  | "third_party_ui"
  | "hardcoded_text"
  | "i18n_missing_en"
  | "i18n_missing_fa"
  | "i18n_duplicate_keys"
  | "i18n_unused_keys"
  | "rtl_ltr_inconsistency"
  | "duplicate_component"
  | "inconsistent_design_system"
  | "accessibility"
  | "quality_regression";

export type ViolationSeverity = "critical" | "high" | "medium" | "low";

export type ViolationStatus = "pending" | "resolved" | "ignored" | "remediated";

export interface QualityViolation {
  id: string;
  category: ViolationCategory;
  severity: ViolationSeverity;
  ruleId: string;
  title: string;
  description: string;
  filePath: string;
  line: number;
  column?: number;
  codeSnippet?: string;
  recommendation?: string;
  canAutoRemediate: boolean;
  suggestedFix?: string;
  status: ViolationStatus;
  detectedAt: string;
  resolvedAt?: string;
  ignoredReason?: string;
  ignoredAt?: string;
  ignoredBy?: string;
}

export interface ScanSummary {
  totalFilesScanned: number;
  totalViolations: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: Record<ViolationCategory, number>;
  byStatus: {
    pending: number;
    resolved: number;
    ignored: number;
    remediated: number;
  };
  healthScore: number; // 0 - 100
  scannedAt: string;
  scanDurationMs: number;
  isIncremental: boolean;
}

export interface ScanOptions {
  full?: boolean;
  categories?: ViolationCategory[];
  filePaths?: string[];
  excludeRules?: string[];
}

export interface RemediationResult {
  success: boolean;
  violationId: string;
  filePath: string;
  diff?: string;
  message: string;
  applied: boolean;
}

export interface BatchRemediationResult {
  totalAttempted: number;
  successful: number;
  failed: number;
  results: RemediationResult[];
}

export interface ScanHistoryEntry {
  timestamp: string;
  totalViolations: number;
  healthScore: number;
  resolvedCount: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface GuardianState {
  lastScan: ScanSummary | null;
  violations: QualityViolation[];
  fileHashes: Record<string, string>;
  history: ScanHistoryEntry[];
}

export interface GuardianRuleConfig {
  id: string;
  name: string;
  description: string;
  category: ViolationCategory;
  defaultSeverity: ViolationSeverity;
  enabled: boolean;
  canAutoRemediate: boolean;
}

export interface GuardianConfig {
  version: string;
  targetDirectories: string[];
  extensions: string[];
  ignorePatterns: string[];
  rules: GuardianRuleConfig[];
  designSystemMapping: {
    nativeTagReplacements: Record<string, { component: string; importPath: string }>;
    rtlReplacements: Record<string, string>;
  };
}

