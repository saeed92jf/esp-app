// src/modules/quality-guardian/services/remediation-engine.ts
import fs from "fs";
import path from "path";
import {
  BatchRemediationResult,
  QualityViolation,
  RemediationResult,
} from "../types/guardian.types";
import { GuardianStorageService } from "./guardian-storage.service";

export class RemediationEngine {
  private rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir = rootDir || process.cwd();
  }

  /**
   * Preview a fix without saving (returns unified diff)
   */
  public previewFix(violation: QualityViolation): RemediationResult {
    return this.applyFixToViolation(violation, true);
  }

  /**
   * Apply fix to a single violation
   */
  public applyFix(violation: QualityViolation): RemediationResult {
    return this.applyFixToViolation(violation, false);
  }

  /**
   * Apply fixes to multiple violations in batch
   */
  public applyBatch(violations: QualityViolation[]): BatchRemediationResult {
    const results: RemediationResult[] = [];
    let successful = 0;
    let failed = 0;
    const remediatedIds: string[] = [];

    for (const v of violations) {
      if (!v.canAutoRemediate) {
        results.push({
          success: false,
          violationId: v.id,
          filePath: v.filePath,
          message: "Violation cannot be automatically remediated",
          applied: false,
        });
        failed++;
        continue;
      }

      const res = this.applyFixToViolation(v, false, true);
      if (res.success) {
        successful++;
        remediatedIds.push(v.id);
      } else {
        failed++;
      }
      results.push(res);
    }

    if (remediatedIds.length > 0) {
      GuardianStorageService.updateBatchViolationStatus(remediatedIds, "remediated");
    }

    return {
      totalAttempted: violations.length,
      successful,
      failed,
      results,
    };
  }

  private applyFixToViolation(
    violation: QualityViolation,
    dryRun: boolean,
    skipStorageUpdate = false
  ): RemediationResult {
    if (!violation.canAutoRemediate) {
      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: "Rule requires manual developer intervention",
        applied: false,
      };
    }

    try {
      if (violation.category === "rtl_ltr_inconsistency") {
        return this.remediateRtlLtr(violation, dryRun, skipStorageUpdate);
      } else if (
        violation.category === "i18n_missing_en" ||
        violation.category === "i18n_missing_fa"
      ) {
        return this.remediateI18nParity(violation, dryRun, skipStorageUpdate);
      }

      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: `No automatic handler for category: ${violation.category}`,
        applied: false,
      };
    } catch (e: any) {
      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: `Remediation failed: ${e?.message || e}`,
        applied: false,
      };
    }
  }

  /**
   * Remediates physical RTL/LTR classes by replacing them with logical counterparts
   */
  private remediateRtlLtr(
    violation: QualityViolation,
    dryRun: boolean,
    skipStorageUpdate = false
  ): RemediationResult {
    const fullPath = path.join(this.rootDir, violation.filePath);
    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: "File not found",
        applied: false,
      };
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n");
    const lineIndex = violation.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: "Line index out of bounds",
        applied: false,
      };
    }

    const originalLine = lines[lineIndex];
    let modifiedLine = originalLine;

    // Apply known replacements
    const replacements: Array<[RegExp, string]> = [
      [/\bmr-([0-9a-zA-Z_.\[\]]+)\b/g, "me-$1"],
      [/\bml-([0-9a-zA-Z_.\[\]]+)\b/g, "ms-$1"],
      [/\bpr-([0-9a-zA-Z_.\[\]]+)\b/g, "pe-$1"],
      [/\bpl-([0-9a-zA-Z_.\[\]]+)\b/g, "ps-$1"],
      [/\btext-left\b/g, "text-start"],
      [/\btext-right\b/g, "text-end"],
      [/\bborder-l-([0-9a-zA-Z_.\[\]]+)\b/g, "border-s-$1"],
      [/\bborder-r-([0-9a-zA-Z_.\[\]]+)\b/g, "border-e-$1"],
      [/\bborder-l\b/g, "border-s"],
      [/\bborder-r\b/g, "border-e"],
      [/\brounded-l-([0-9a-zA-Z_.\[\]]+)\b/g, "rounded-s-$1"],
      [/\brounded-r-([0-9a-zA-Z_.\[\]]+)\b/g, "rounded-e-$1"],
      [/\brounded-l\b/g, "rounded-s"],
      [/\brounded-r\b/g, "rounded-e"],
      [/\bleft-([0-9a-zA-Z_.\[\]]+)\b/g, "start-$1"],
      [/\bright-([0-9a-zA-Z_.\[\]]+)\b/g, "end-$1"],
    ];

    for (const [regex, replacement] of replacements) {
      modifiedLine = modifiedLine.replace(regex, replacement);
    }

    if (modifiedLine === originalLine) {
      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: "Pattern match not found on target line",
        applied: false,
      };
    }

    const diff = `--- a/${violation.filePath}:${violation.line}\n+++ b/${violation.filePath}:${violation.line}\n- ${originalLine.trim()}\n+ ${modifiedLine.trim()}`;

    if (!dryRun) {
      lines[lineIndex] = modifiedLine;
      fs.writeFileSync(fullPath, lines.join("\n"), "utf-8");
      if (!skipStorageUpdate) {
        GuardianStorageService.updateViolationStatus(violation.id, "remediated");
      }
    }

    return {
      success: true,
      violationId: violation.id,
      filePath: violation.filePath,
      diff,
      message: dryRun
        ? "Fix preview generated successfully"
        : "Converted physical class to logical direction",
      applied: !dryRun,
    };
  }

  /**
   * Remediates missing translations by inserting placeholder or synced value
   */
  private remediateI18nParity(
    violation: QualityViolation,
    dryRun: boolean,
    skipStorageUpdate = false
  ): RemediationResult {
    // Extract key from title: Missing English translation for key: "Common.appName.lead"
    const match = /for key:\s*"([^"]+)"/.exec(violation.title);
    if (!match) {
      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: "Could not parse translation key from violation",
        applied: false,
      };
    }

    const keyPath = match[1];
    const isEn = violation.category === "i18n_missing_en";
    const targetFilePath = isEn ? "messages/en.json" : "messages/fa.json";
    const sourceFilePath = isEn ? "messages/fa.json" : "messages/en.json";

    const targetFull = path.join(this.rootDir, targetFilePath);
    const sourceFull = path.join(this.rootDir, sourceFilePath);

    if (!fs.existsSync(targetFull) || !fs.existsSync(sourceFull)) {
      return {
        success: false,
        violationId: violation.id,
        filePath: violation.filePath,
        message: "Translation files missing",
        applied: false,
      };
    }

    const targetJson = JSON.parse(fs.readFileSync(targetFull, "utf-8"));
    const sourceJson = JSON.parse(fs.readFileSync(sourceFull, "utf-8"));

    // Find source value
    const sourceVal = this.getNestedValue(sourceJson, keyPath);
    const insertVal = isEn ? `[EN] ${sourceVal || keyPath}` : sourceVal || keyPath;

    // Build diff representation
    const diff = `+ Added "${keyPath}": "${insertVal}" in ${targetFilePath}`;

    if (!dryRun) {
      this.setNestedValue(targetJson, keyPath, insertVal);
      fs.writeFileSync(targetFull, JSON.stringify(targetJson, null, 2) + "\n", "utf-8");
      if (!skipStorageUpdate) {
        GuardianStorageService.updateViolationStatus(violation.id, "remediated");
      }
    }

    return {
      success: true,
      violationId: violation.id,
      filePath: targetFilePath,
      diff,
      message: dryRun
        ? "Translation insert preview generated"
        : `Added missing key "${keyPath}" to ${targetFilePath}`,
      applied: !dryRun,
    };
  }

  private getNestedValue(obj: any, keyPath: string): any {
    const parts = keyPath.split(".");
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  private setNestedValue(obj: any, keyPath: string, value: any): void {
    const parts = keyPath.split(".");
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }
}
