// src/modules/quality-guardian/services/scanner-engine.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  DEFAULT_GUARDIAN_CONFIG,
} from "../config/guardian.config";
import {
  GuardianConfig,
  QualityViolation,
  ScanOptions,
  ScanSummary,
  ViolationCategory,
} from "../types/guardian.types";
import { GuardianStorageService } from "./guardian-storage.service";

export class ScannerEngine {
  private config: GuardianConfig;
  private rootDir: string;

  constructor(customConfig?: Partial<GuardianConfig>, rootDir?: string) {
    this.config = { ...DEFAULT_GUARDIAN_CONFIG, ...customConfig };
    this.rootDir = rootDir || process.cwd();
  }

  /**
   * Run scanner
   */
  public async scan(options: ScanOptions = {}): Promise<{
    summary: ScanSummary;
    violations: QualityViolation[];
    fileHashes: Record<string, string>;
  }> {
    const startTime = Date.now();
    const isIncremental = !options.full;
    const previousState = GuardianStorageService.loadState();
    const oldFileHashes = previousState.fileHashes || {};
    const oldViolations = previousState.violations || [];

    const discoveredFiles = this.discoverFiles();
    const currentFileHashes: Record<string, string> = {};
    const filesToScan: string[] = [];

    for (const relPath of discoveredFiles) {
      const fullPath = path.join(this.rootDir, relPath);
      try {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash("sha256").update(content).digest("hex");
        currentFileHashes[relPath] = hash;

        if (isIncremental && oldFileHashes[relPath] === hash) {
          // File unchanged
          continue;
        }
        filesToScan.push(relPath);
      } catch (e) {
        console.error(`[ScannerEngine] Error hashing file ${relPath}:`, e);
      }
    }

    // Retain violations from unchanged files if incremental
    let violations: QualityViolation[] = [];
    if (isIncremental && filesToScan.length < discoveredFiles.length) {
      const changedFilesSet = new Set(filesToScan);
      // Keep violations from files that were NOT changed and still exist
      const discoveredSet = new Set(discoveredFiles);
      violations = oldViolations.filter(
        (v) => !changedFilesSet.has(v.filePath) && discoveredSet.has(v.filePath)
      );
    }

    // Scan modified / all target files
    const targetFiles = isIncremental ? filesToScan : discoveredFiles;

    for (const relPath of targetFiles) {
      const fileViolations = this.scanSingleFile(relPath);
      violations.push(...fileViolations);
    }

    // Also run project-wide cross-file checks (i18n parity, etc.)
    const projectViolations = this.scanProjectWideChecks(discoveredFiles);
    // Deduplicate against project-wide violations
    violations = violations.filter(
      (v) =>
        v.category !== "i18n_missing_en" &&
        v.category !== "i18n_missing_fa" &&
        v.category !== "i18n_duplicate_keys"
    );
    violations.push(...projectViolations);

    // Calculate Summary
    const summary = this.computeSummary(
      discoveredFiles.length,
      violations,
      Date.now() - startTime,
      isIncremental
    );

    // Record into persistent store
    GuardianStorageService.recordScan(summary, violations, currentFileHashes);

    return {
      summary,
      violations,
      fileHashes: currentFileHashes,
    };
  }

  /**
   * Recursively discovers all files matching extensions while ignoring excluded folders
   */
  private discoverFiles(): string[] {
    const results: string[] = [];

    const walk = (dirRel: string) => {
      const dirFull = path.join(this.rootDir, dirRel);
      if (!fs.existsSync(dirFull)) return;

      const entries = fs.readdirSync(dirFull, { withFileTypes: true });
      for (const entry of entries) {
        const rel = path.join(dirRel, entry.name).replace(/\\/g, "/");

        // Check ignore patterns
        if (this.isIgnored(rel)) continue;

        if (entry.isDirectory()) {
          walk(rel);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.config.extensions.includes(ext)) {
            results.push(rel);
          }
        }
      }
    };

    for (const targetDir of this.config.targetDirectories) {
      walk(targetDir);
    }

    return results;
  }

  private isIgnored(relPath: string): boolean {
    const normalized = relPath.replace(/\\/g, "/");
    for (const pattern of this.config.ignorePatterns) {
      if (
        normalized === pattern ||
        normalized.startsWith(pattern + "/") ||
        normalized.includes("/" + pattern + "/") ||
        (pattern.startsWith("*.") && normalized.endsWith(pattern.slice(1)))
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Inspect a single file for code quality issues
   */
  private scanSingleFile(relPath: string): QualityViolation[] {
    const fullPath = path.join(this.rootDir, relPath);
    const violations: QualityViolation[] = [];

    let content = "";
    try {
      content = fs.readFileSync(fullPath, "utf-8");
    } catch {
      return violations;
    }

    const lines = content.split("\n");
    const ext = path.extname(relPath);
    const isJsx = ext === ".tsx" || ext === ".jsx";

    // Skip checking design system primitives themselves for native tags
    const isDesignSystemPrimitive =
      relPath.startsWith("src/components/ui/") ||
      relPath.startsWith("src/components/brand/");

    // Line by line scanning
    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];

      // 1. Native HTML Controls in JSX
      if (isJsx && !isDesignSystemPrimitive) {
        this.checkNativeHtmlControls(line, lineNum, relPath, violations);
      }

      // 2. Physical RTL/LTR Tailwind classes
      if (isJsx || ext === ".css") {
        this.checkRtlLtrClasses(line, lineNum, relPath, violations);
      }

      // 3. Hardcoded user-facing Persian text in JSX
      if (isJsx && !relPath.includes("mock") && !relPath.includes("data/")) {
        this.checkHardcodedPersian(line, lineNum, relPath, violations);
      }

      // 4. Accessibility checks (img without alt, button without aria-label)
      if (isJsx) {
        this.checkAccessibility(line, lineNum, relPath, violations);
      }

      // 5. Inconsistent styling / hardcoded arbitrary hex colors
      if (isJsx) {
        this.checkDesignSystemStyling(line, lineNum, relPath, violations);
      }
    }

    return violations;
  }

  /**
   * Check for native HTML controls like <button>, <input>, <select>, <textarea>
   */
  private checkNativeHtmlControls(
    line: string,
    lineNum: number,
    relPath: string,
    violations: QualityViolation[]
  ): void {
    // Avoid comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      return;
    }

    const controls = ["button", "input", "select", "textarea"];
    for (const tag of controls) {
      const regex = new RegExp(`<(?:${tag})(\\s|>|/)`, "g");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(line)) !== null) {
        // Exclude svg tags or types
        if (line.includes(`type ${tag}`) || line.includes(`interface `)) continue;
        // Exclude if followed by - (e.g. <button-something>)
        const nextChar = line[match.index + tag.length + 1];
        if (nextChar === "-") continue;

        const replacement =
          this.config.designSystemMapping.nativeTagReplacements[tag];
        const id = this.createId("RULE-UI-01", relPath, lineNum, match.index);

        const ruleDef = this.config.rules.find((r) => r.id === "RULE-UI-01");
        const severity = ruleDef?.defaultSeverity || "low";

        violations.push({
          id,
          category: "non_standard_ui",
          severity,
          ruleId: "RULE-UI-01",
          title: `Native <${tag}> tag violates Design System`,
          description: `Direct usage of native HTML <${tag}> tag. ESP CORE requires canonical UI components from @/components/ui/${tag}.`,
          filePath: relPath,
          line: lineNum,
          column: match.index + 1,
          codeSnippet: line.trim(),
          recommendation: replacement
            ? `Replace <${tag}> with <${replacement.component}> imported from "${replacement.importPath}".`
            : `Replace with design system component.`,
          canAutoRemediate: false,
          suggestedFix: replacement
            ? `import { ${replacement.component} } from "${replacement.importPath}";`
            : undefined,
          status: "pending",
          detectedAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Check for physical RTL/LTR utility classes
   */
  private checkRtlLtrClasses(
    line: string,
    lineNum: number,
    relPath: string,
    violations: QualityViolation[]
  ): void {
    // Look inside className or strings
    if (!line.includes("className") && !line.includes("cn(") && !line.includes("classNames(")) {
      return;
    }

    const physicalPatterns: Array<{
      pattern: RegExp;
      suggest: (match: string) => string;
      desc: string;
    }> = [
      {
        pattern: /\b(mr|ml)-([0-9a-zA-Z_.\[\]]+)\b/g,
        suggest: (m) => m.replace(/^mr-/, "me-").replace(/^ml-/, "ms-"),
        desc: "Horizontal margin (mr-/ml-) should use logical direction (me-/ms-)",
      },
      {
        pattern: /\b(pr|pl)-([0-9a-zA-Z_.\[\]]+)\b/g,
        suggest: (m) => m.replace(/^pr-/, "pe-").replace(/^pl-/, "ps-"),
        desc: "Horizontal padding (pr-/pl-) should use logical direction (pe-/ps-)",
      },
      {
        pattern: /\btext-(left|right)\b/g,
        suggest: (m) => (m === "text-left" ? "text-start" : "text-end"),
        desc: "Text alignment (text-left/text-right) should use logical (text-start/text-end)",
      },
      {
        pattern: /\b(border-[lr])(-[0-9a-zA-Z_.\[\]]+)?\b/g,
        suggest: (m) => m.replace("border-l", "border-s").replace("border-r", "border-e"),
        desc: "Directional border (border-l/border-r) should use logical (border-s/border-e)",
      },
      {
        pattern: /\b(rounded-[lr])(-[0-9a-zA-Z_.\[\]]+)?\b/g,
        suggest: (m) => m.replace("rounded-l", "rounded-s").replace("rounded-r", "rounded-e"),
        desc: "Directional rounded corner should use logical (rounded-s/rounded-e)",
      },
      {
        pattern: /\b(left|right)-([0-9a-zA-Z_.\[\]]+)\b/g,
        suggest: (m) => m.replace(/^left-/, "start-").replace(/^right-/, "end-"),
        desc: "Absolute positioning (left-/right-) should use logical (start-/end-)",
      },
    ];

    for (const { pattern, suggest, desc } of physicalPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        const matchedClass = match[0];
        const suggestedFix = suggest(matchedClass);
        const id = this.createId("RULE-RTL-01", relPath, lineNum, match.index);

        violations.push({
          id,
          category: "rtl_ltr_inconsistency",
          severity: "medium",
          ruleId: "RULE-RTL-01",
          title: `Physical class "${matchedClass}" causes RTL/LTR inconsistency`,
          description: desc,
          filePath: relPath,
          line: lineNum,
          column: match.index + 1,
          codeSnippet: line.trim(),
          recommendation: `Replace "${matchedClass}" with logical class "${suggestedFix}".`,
          canAutoRemediate: true,
          suggestedFix,
          status: "pending",
          detectedAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Check for hardcoded Persian text directly in JSX
   */
  private checkHardcodedPersian(
    line: string,
    lineNum: number,
    relPath: string,
    violations: QualityViolation[]
  ): void {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      return;
    }

    // Match Persian characters inside JSX text nodes or common string props
    // e.g. >متن فارسی< or placeholder="متن فارسی" or title="متن فارسی"
    const persianRegex = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]{2,}/g;
    let match: RegExpExecArray | null;
    while ((match = persianRegex.exec(line)) !== null) {
      // Ignore if it's inside console.log or standard error log
      if (line.includes("console.log") || line.includes("console.error")) continue;

      const id = this.createId("RULE-I18N-01", relPath, lineNum, match.index);
      const ruleDef = this.config.rules.find((r) => r.id === "RULE-I18N-01");
      const severity = ruleDef?.defaultSeverity || "low";

      violations.push({
        id,
        category: "hardcoded_text",
        severity,
        ruleId: "RULE-I18N-01",
        title: `Hardcoded Persian text in component`,
        description: `Persian text "${match[0]}" should be moved to messages/fa.json and accessed via useTranslations().`,
        filePath: relPath,
        line: lineNum,
        column: match.index + 1,
        codeSnippet: line.trim(),
        recommendation: `Add key to messages/fa.json and messages/en.json and replace with {t('key')}.`,
        canAutoRemediate: false,
        status: "pending",
        detectedAt: new Date().toISOString(),
      });
      break; // One per line is sufficient to avoid noisy reports
    }
  }

  /**
   * Check accessibility violations (e.g. <img> missing alt)
   */
  private checkAccessibility(
    line: string,
    lineNum: number,
    relPath: string,
    violations: QualityViolation[]
  ): void {
    const ruleDef = this.config.rules.find((r) => r.id === "RULE-A11Y-02");
    const severity = ruleDef?.defaultSeverity || "low";

    // <img> or <Image without alt
    if (line.includes("<img ") || line.includes("<Image ")) {
      if (!line.includes("alt=") && !line.includes("aria-hidden")) {
        const id = this.createId("RULE-A11Y-02", relPath, lineNum, 1);
        violations.push({
          id,
          category: "accessibility",
          severity,
          ruleId: "RULE-A11Y-02",
          title: `Image missing alt attribute`,
          description: `Image elements must have an "alt" prop for screen readers or "aria-hidden='true'" if decorative.`,
          filePath: relPath,
          line: lineNum,
          codeSnippet: line.trim(),
          recommendation: `Add alt="descriptive text" or aria-hidden="true" to image.`,
          canAutoRemediate: false,
          status: "pending",
          detectedAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Check styling violations (hardcoded arbitrary hex colors)
   */
  private checkDesignSystemStyling(
    line: string,
    lineNum: number,
    relPath: string,
    violations: QualityViolation[]
  ): void {
    if (!line.includes("className") && !line.includes("cn(")) return;

    // Detect arbitrary hex colors like bg-[#fff] or text-[#123456]
    const hexRegex = /\b(bg|text|border|fill|stroke)-\[#(?:[0-9a-fA-F]{3}){1,2}\]/g;
    let match: RegExpExecArray | null;
    while ((match = hexRegex.exec(line)) !== null) {
      // Exclude brand icon colors if explicitly needed
      if (relPath.includes("brand/") || relPath.includes("chart")) continue;

      const id = this.createId("RULE-DS-01", relPath, lineNum, match.index);
      violations.push({
        id,
        category: "inconsistent_design_system",
        severity: "medium",
        ruleId: "RULE-DS-01",
        title: `Arbitrary hex color "${match[0]}" used instead of design tokens`,
        description: `Direct hex styling breaks theme switching and violates ESP CORE design tokens.`,
        filePath: relPath,
        line: lineNum,
        column: match.index + 1,
        codeSnippet: line.trim(),
        recommendation: `Replace with semantic Tailwind utility classes (e.g. text-muted-foreground, bg-accent, border-border).`,
        canAutoRemediate: false,
        status: "pending",
        detectedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Project-wide cross-file checks:
   * 1. i18n parity between messages/fa.json and messages/en.json
   * 2. Duplicate keys
   */
  private scanProjectWideChecks(discoveredFiles: string[]): QualityViolation[] {
    const violations: QualityViolation[] = [];
    const faPath = path.join(this.rootDir, "messages", "fa.json");
    const enPath = path.join(this.rootDir, "messages", "en.json");

    if (!fs.existsSync(faPath) || !fs.existsSync(enPath)) {
      return violations;
    }

    try {
      const faRaw = fs.readFileSync(faPath, "utf-8");
      const enRaw = fs.readFileSync(enPath, "utf-8");

      const faObj = JSON.parse(faRaw);
      const enObj = JSON.parse(enRaw);

      const faKeys = this.flattenKeys(faObj);
      const enKeys = this.flattenKeys(enObj);

      const faKeySet = new Set(Object.keys(faKeys));
      const enKeySet = new Set(Object.keys(enKeys));

      // Missing in English
      for (const key of Object.keys(faKeys)) {
        if (!enKeySet.has(key)) {
          const id = this.createId("RULE-I18N-03", "messages/en.json", 1, key.length);
          violations.push({
            id,
            category: "i18n_missing_en",
            severity: "critical",
            ruleId: "RULE-I18N-03",
            title: `Missing English translation for key: "${key}"`,
            description: `Translation key "${key}" exists in messages/fa.json with value "${faKeys[key]}" but is missing in messages/en.json.`,
            filePath: "messages/en.json",
            line: 1,
            codeSnippet: `"${key}": "${faKeys[key]}"`,
            recommendation: `Add key "${key}" to messages/en.json.`,
            canAutoRemediate: true,
            suggestedFix: `"${key}": "[EN] ${faKeys[key]}"`,
            status: "pending",
            detectedAt: new Date().toISOString(),
          });
        }
      }

      // Missing in Persian
      for (const key of Object.keys(enKeys)) {
        if (!faKeySet.has(key)) {
          const id = this.createId("RULE-I18N-04", "messages/fa.json", 1, key.length);
          violations.push({
            id,
            category: "i18n_missing_fa",
            severity: "critical",
            ruleId: "RULE-I18N-04",
            title: `Missing Persian translation for key: "${key}"`,
            description: `Translation key "${key}" exists in messages/en.json with value "${enKeys[key]}" but is missing in messages/fa.json.`,
            filePath: "messages/fa.json",
            line: 1,
            codeSnippet: `"${key}": "${enKeys[key]}"`,
            recommendation: `Add key "${key}" to messages/fa.json.`,
            canAutoRemediate: true,
            suggestedFix: `"${key}": "${enKeys[key]}"`,
            status: "pending",
            detectedAt: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error("[ScannerEngine] Error parsing translation JSONs:", e);
    }

    return violations;
  }

  private flattenKeys(obj: any, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, this.flattenKeys(obj[key], fullKey));
      } else {
        result[fullKey] = String(obj[key]);
      }
    }
    return result;
  }

  private computeSummary(
    totalFiles: number,
    violations: QualityViolation[],
    durationMs: number,
    isIncremental: boolean
  ): ScanSummary {
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byCategory: Record<ViolationCategory, number> = {
      non_standard_ui: 0,
      third_party_ui: 0,
      hardcoded_text: 0,
      i18n_missing_en: 0,
      i18n_missing_fa: 0,
      i18n_duplicate_keys: 0,
      i18n_unused_keys: 0,
      rtl_ltr_inconsistency: 0,
      duplicate_component: 0,
      inconsistent_design_system: 0,
      accessibility: 0,
      quality_regression: 0,
    };
    const byStatus = { pending: 0, resolved: 0, ignored: 0, remediated: 0 };

    for (const v of violations) {
      bySeverity[v.severity]++;
      byCategory[v.category] = (byCategory[v.category] || 0) + 1;
      byStatus[v.status]++;
    }

    // Health Score calculation (0 - 100)
    // Normalized quality index: when critical and high issues are 0, Health Score achieves 100%
    const pendingViolations = violations.filter((v) => v.status === "pending");
    let healthScore = 100;

    const criticalPending = pendingViolations.filter((v) => v.severity === "critical").length;
    const highPending = pendingViolations.filter((v) => v.severity === "high").length;

    if (criticalPending > 0 || highPending > 0) {
      let penalties = criticalPending * 20 + highPending * 5;
      const averagePenaltyPerFile = totalFiles > 0 ? penalties / totalFiles : 0;
      healthScore = Math.max(
        0,
        Math.min(99, Math.round(100 / (1 + averagePenaltyPerFile * 0.12)))
      );
    } else {
      healthScore = 100;
    }

    return {
      totalFilesScanned: totalFiles,
      totalViolations: violations.length,
      bySeverity,
      byCategory,
      byStatus,
      healthScore,
      scannedAt: new Date().toISOString(),
      scanDurationMs: durationMs,
      isIncremental,
    };
  }

  private createId(ruleId: string, filePath: string, line: number, col: number = 0): string {
    return crypto
      .createHash("md5")
      .update(`${ruleId}:${filePath}:${line}:${col}`)
      .digest("hex")
      .slice(0, 12);
  }
}
