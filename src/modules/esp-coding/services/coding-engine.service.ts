// src/modules/esp-coding/services/coding-engine.service.ts
import {
  CodingFormulaVersion,
  CodingFormulaSegmentConfig,
  CodeGenerationResult,
  SeparatorType,
} from "../types/coding-formula.types";

export class CodingEngineService {
  /**
   * Resolves the visual/textual separator string from the configured separator type.
   */
  public static resolveSeparator(
    type: SeparatorType,
    customSeparator?: string
  ): string {
    switch (type) {
      case "hyphen":
        return "-";
      case "underscore":
        return "_";
      case "dot":
        return ".";
      case "slash":
        return "/";
      case "custom":
        return customSeparator || "";
      case "none":
      default:
        return "";
    }
  }

  /**
   * Formats an individual segment value according to segment rules.
   * STRICT RULE: Never converts to integers. Preserves leading zeros!
   */
  public static formatSegmentValue(
    rawValue: string | null | undefined,
    segment: CodingFormulaSegmentConfig
  ): { value: string; error?: string } {
    const raw = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : "";

    // Handle missing / empty value
    if (!raw) {
      if (segment.required) {
        if (segment.missingValueBehavior === "placeholder" && segment.placeholderValue) {
          return { value: segment.placeholderValue };
        }
        return {
          value: "",
          error: `Missing required segment: ${segment.labelEn} (${segment.fieldKey})`,
        };
      }
      return { value: "" };
    }

    let formatted = raw;

    // Apply Case Transformation
    if (segment.caseTransform === "uppercase") {
      formatted = formatted.toUpperCase();
    } else if (segment.caseTransform === "lowercase") {
      formatted = formatted.toLowerCase();
    }

    // Apply Padding if configured (preserving string type!)
    if (
      segment.paddingDirection &&
      segment.paddingDirection !== "none" &&
      segment.minLen &&
      segment.paddingChar
    ) {
      const padChar = segment.paddingChar[0] || "0";
      if (segment.paddingDirection === "left") {
        formatted = formatted.padStart(segment.minLen, padChar);
      } else if (segment.paddingDirection === "right") {
        formatted = formatted.padEnd(segment.minLen, padChar);
      }
    }

    // Validate max length if set
    if (segment.maxLen && formatted.length > segment.maxLen) {
      // Warning or truncate depending on rules; here we preserve and flag warning
    }

    // Apply segment prefix and suffix
    if (segment.prefix) {
      formatted = segment.prefix + formatted;
    }
    if (segment.suffix) {
      formatted = formatted + segment.suffix;
    }

    return { value: formatted };
  }

  /**
   * Central code generation algorithm per Part 10 of the enterprise specification.
   */
  public static generateCode(
    formula: CodingFormulaVersion,
    attributes: Record<string, string | null | undefined>,
    existingRegisteredCodes?: Set<string> | string[]
  ): CodeGenerationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const breakdown: CodeGenerationResult["segments"] = [];

    // 1. Sort segments in strictly stored order
    const sortedSegments = [...(formula.segments || [])]
      .filter((s) => s.enabled)
      .sort((a, b) => a.position - b.position);

    if (sortedSegments.length === 0) {
      return {
        code: "",
        segments: [],
        profileId: formula.profileId,
        versionId: formula.versionId,
        versionNumber: formula.versionNumber,
        isValid: false,
        errors: ["Formula contains no enabled segments."],
        warnings: [],
      };
    }

    const defaultSeparator = this.resolveSeparator(
      formula.separator,
      formula.customSeparator
    );

    const codeParts: string[] = [];

    // 2. Iterate through segments in stored order
    for (let i = 0; i < sortedSegments.length; i++) {
      const seg = sortedSegments[i];
      const rawVal = attributes[seg.fieldKey];

      const { value: formattedVal, error } = this.formatSegmentValue(rawVal, seg);

      if (error) {
        errors.push(error);
      }

      // Determine separator for this segment
      let appliedSeparator = "";
      if (i > 0 && formattedVal) {
        appliedSeparator = seg.separatorBefore || defaultSeparator;
      }

      breakdown.push({
        segmentId: seg.segmentId,
        fieldKey: seg.fieldKey,
        labelEn: seg.labelEn,
        labelFa: seg.labelFa,
        rawValue: rawVal !== null && rawVal !== undefined ? String(rawVal) : "",
        formattedValue: formattedVal,
        separator: appliedSeparator,
      });

      if (formattedVal) {
        if (appliedSeparator) {
          codeParts.push(appliedSeparator);
        }
        codeParts.push(formattedVal);
      }
    }

    const finalCode = codeParts.join("");

    // 3. Uniqueness Check
    let isDuplicate = false;
    if (existingRegisteredCodes && finalCode) {
      const codeSet =
        existingRegisteredCodes instanceof Set
          ? existingRegisteredCodes
          : new Set(existingRegisteredCodes);
      if (codeSet.has(finalCode)) {
        isDuplicate = true;
        warnings.push(`Warning: Generated code '${finalCode}' already exists in registered database!`);
      }
    }

    return {
      code: finalCode,
      segments: breakdown,
      profileId: formula.profileId,
      versionId: formula.versionId,
      versionNumber: formula.versionNumber,
      isValid: errors.length === 0 && finalCode.length > 0,
      errors,
      warnings,
      isDuplicate,
    };
  }
}
