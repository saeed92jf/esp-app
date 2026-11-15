// src/modules/quality-guardian/services/guardian-storage.service.ts
import fs from "fs";
import path from "path";
import {
  GuardianState,
  QualityViolation,
  ScanSummary,
  ViolationStatus,
} from "../types/guardian.types";

const PRIMARY_DATA_PATH = "C:\\ESP_DATA\\live\\data\\quality_guardian_state.json";
const FALLBACK_DATA_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "mock",
  "quality_guardian_state.json"
);

export class GuardianStorageService {
  private static getFilePath(): string {
    const primaryDir = path.dirname(PRIMARY_DATA_PATH);
    if (fs.existsSync(primaryDir)) {
      return PRIMARY_DATA_PATH;
    }
    const fallbackDir = path.dirname(FALLBACK_DATA_PATH);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return FALLBACK_DATA_PATH;
  }

  public static loadState(): GuardianState {
    const targetFile = this.getFilePath();
    try {
      if (fs.existsSync(targetFile)) {
        const raw = fs.readFileSync(targetFile, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("[GuardianStorage] Failed to read state:", e);
    }

    return {
      lastScan: null,
      violations: [],
      fileHashes: {},
      history: [],
    };
  }

  public static saveState(state: GuardianState): void {
    const targetFile = this.getFilePath();
    try {
      const dir = path.dirname(targetFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(targetFile, JSON.stringify(state, null, 2), "utf-8");
    } catch (e) {
      console.error("[GuardianStorage] Failed to save state:", e);
    }
  }

  public static updateViolationStatus(
    violationId: string,
    status: ViolationStatus,
    metadata?: {
      ignoredReason?: string;
      ignoredBy?: string;
    }
  ): QualityViolation | null {
    const state = this.loadState();
    const violation = state.violations.find((v) => v.id === violationId);
    if (!violation) return null;

    violation.status = status;
    if (status === "ignored") {
      violation.ignoredReason = metadata?.ignoredReason || "Manually ignored";
      violation.ignoredBy = metadata?.ignoredBy || "Admin";
      violation.ignoredAt = new Date().toISOString();
    } else if (status === "resolved" || status === "remediated") {
      violation.resolvedAt = new Date().toISOString();
    }

    // Update summary counts
    if (state.lastScan) {
      state.lastScan.byStatus = {
        pending: state.violations.filter((v) => v.status === "pending").length,
        resolved: state.violations.filter((v) => v.status === "resolved").length,
        ignored: state.violations.filter((v) => v.status === "ignored").length,
        remediated: state.violations.filter((v) => v.status === "remediated").length,
      };
    }

    this.saveState(state);
    return violation;
  }

  public static updateBatchViolationStatus(
    violationIds: string[],
    status: ViolationStatus
  ): void {
    if (violationIds.length === 0) return;
    const state = this.loadState();
    const idSet = new Set(violationIds);
    const now = new Date().toISOString();

    for (const v of state.violations) {
      if (idSet.has(v.id)) {
        v.status = status;
        if (status === "resolved" || status === "remediated") {
          v.resolvedAt = now;
        }
      }
    }

    if (state.lastScan) {
      state.lastScan.byStatus = {
        pending: state.violations.filter((v) => v.status === "pending").length,
        resolved: state.violations.filter((v) => v.status === "resolved").length,
        ignored: state.violations.filter((v) => v.status === "ignored").length,
        remediated: state.violations.filter((v) => v.status === "remediated").length,
      };
    }

    this.saveState(state);
  }

  public static recordScan(summary: ScanSummary, violations: QualityViolation[], fileHashes: Record<string, string>): void {
    const state = this.loadState();
    
    // Preserve ignored or resolved status of existing violations
    const existingStatusMap = new Map<string, { status: ViolationStatus; reason?: string }>();
    state.violations.forEach((v) => {
      if (v.status !== "pending") {
        existingStatusMap.set(v.id, { status: v.status, reason: v.ignoredReason });
      }
    });

    const mergedViolations = violations.map((v) => {
      const existing = existingStatusMap.get(v.id);
      if (existing) {
        return {
          ...v,
          status: existing.status,
          ignoredReason: existing.reason,
        };
      }
      return v;
    });

    state.lastScan = summary;
    state.violations = mergedViolations;
    state.fileHashes = fileHashes;

    // Add to history (keep up to 50 runs)
    state.history = state.history || [];
    state.history.unshift({
      timestamp: summary.scannedAt,
      totalViolations: summary.totalViolations,
      healthScore: summary.healthScore,
      resolvedCount: summary.byStatus.resolved + summary.byStatus.remediated,
      bySeverity: summary.bySeverity,
    });
    if (state.history.length > 50) {
      state.history = state.history.slice(0, 50);
    }

    this.saveState(state);
  }
}
