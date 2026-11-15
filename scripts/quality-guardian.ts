// scripts/quality-guardian.ts
import fs from "fs";
import path from "path";
import { ScannerEngine } from "../src/modules/quality-guardian/services/scanner-engine";
import { RemediationEngine } from "../src/modules/quality-guardian/services/remediation-engine";
import { GuardianStorageService } from "../src/modules/quality-guardian/services/guardian-storage.service";

const LOG_FILE_PATH = "C:\\ESP_DATA\\live\\data\\quality_guardian_overnight.log";
const FALLBACK_LOG_PATH = path.join(process.cwd(), "logs", "quality_guardian_overnight.log");

function getLogPath(): string {
  try {
    const primaryDir = path.dirname(LOG_FILE_PATH);
    if (fs.existsSync(primaryDir)) {
      return LOG_FILE_PATH;
    }
  } catch {}
  const fallbackDir = path.dirname(FALLBACK_LOG_PATH);
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  return FALLBACK_LOG_PATH;
}

function writeLog(line: string) {
  const target = getLogPath();
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${line}\n`;
  try {
    fs.appendFileSync(target, formatted, "utf-8");
  } catch (e) {
    console.error("[QualityGuardian] Failed to write log:", e);
  }
}

async function runSingleCycle(
  scanner: ScannerEngine,
  isFull: boolean,
  isFix: boolean,
  cycleIndex?: number
): Promise<{ healthScore: number; totalViolations: number }> {
  const cycleLabel = cycleIndex !== undefined ? ` (Cycle #${cycleIndex})` : "";
  const header = `🛡️  ESP CORE — Code Quality Guardian Inspection${cycleLabel} [${new Date().toLocaleTimeString()}]`;

  console.log("\n" + "=".repeat(60));
  console.log(header);
  console.log("=".repeat(60) + "\n");
  writeLog(`=== Cycle Start${cycleLabel} ===`);

  console.log(`[1/3] Running ${isFull ? "full project" : "incremental"} source inspection...`);
  const { summary, violations } = await scanner.scan({ full: isFull });

  console.log(`\nScan completed in ${summary.scanDurationMs}ms`);
  console.log(`Total files scanned: ${summary.totalFilesScanned}`);
  console.log(`Total violations: ${summary.totalViolations}`);
  console.log(`Health Score: ${summary.healthScore}/100\n`);

  writeLog(
    `Scan: Duration=${summary.scanDurationMs}ms | Files=${summary.totalFilesScanned} | Violations=${summary.totalViolations} | HealthScore=${summary.healthScore}/100`
  );

  console.log("Violations by Severity:");
  console.log(`  - 🔴 Critical: ${summary.bySeverity.critical}`);
  console.log(`  - 🟠 High:     ${summary.bySeverity.high}`);
  console.log(`  - 🟡 Medium:   ${summary.bySeverity.medium}`);
  console.log(`  - 🔵 Low:      ${summary.bySeverity.low}\n`);

  console.log("Violations by Category:");
  for (const [cat, count] of Object.entries(summary.byCategory)) {
    if (count > 0) {
      console.log(`  - ${cat.padEnd(26)} : ${count}`);
    }
  }

  let finalScore = summary.healthScore;
  let finalViolationsCount = summary.totalViolations;

  // Auto-remediation if requested
  if (isFix) {
    console.log("\n[2/3] Applying safe automated remediations...");
    const remediation = new RemediationEngine();
    const fixable = violations.filter((v) => v.canAutoRemediate && v.status === "pending");
    console.log(`Found ${fixable.length} auto-remediable violations.`);

    if (fixable.length > 0) {
      const batchResult = remediation.applyBatch(fixable);
      console.log(`Remediation complete: ${batchResult.successful} fixed, ${batchResult.failed} failed.`);
      writeLog(`Remediation: ${batchResult.successful} fixed, ${batchResult.failed} failed.`);

      // Rescan after fixes
      console.log("[3/3] Re-verifying quality metrics after remediation...");
      const finalScan = await scanner.scan({ full: false });
      finalScore = finalScan.summary.healthScore;
      finalViolationsCount = finalScan.summary.totalViolations;
      console.log(`New Health Score: ${finalScore}/100 (Violations: ${finalViolationsCount})`);
    } else {
      console.log("[2/3] No auto-remediable violations pending.");
    }
  }

  writeLog(`=== Cycle Complete | HealthScore=${finalScore}/100 ===\n`);
  return { healthScore: finalScore, totalViolations: finalViolationsCount };
}

async function main() {
  const args = process.argv.slice(2);
  const isFull = args.includes("--full");
  const isFix = args.includes("--fix");
  const isStrict = args.includes("--strict");
  const isOvernight = args.includes("--overnight") || args.includes("--daemon");

  const intervalArg = args.find((a) => a.startsWith("--interval="));
  const intervalMinutes = intervalArg ? parseInt(intervalArg.split("=")[1], 10) : 30;

  const scanner = new ScannerEngine();

  if (!isOvernight) {
    const { healthScore, totalViolations } = await runSingleCycle(scanner, isFull, isFix);

    if (isStrict) {
      const state = GuardianStorageService.loadState();
      const criticalPending = state.violations.filter(
        (v) => v.severity === "critical" && v.status === "pending"
      ).length;
      const highPending = state.violations.filter(
        (v) => v.severity === "high" && v.status === "pending"
      ).length;

      if (criticalPending > 0 || highPending > 0) {
        console.error(
          `❌ Strict mode check failed: ${criticalPending} critical and ${highPending} high violations remaining.`
        );
        process.exit(1);
      }
    }
    return;
  }

  // --- Overnight / Daemon Continuous Mode ---
  console.log("\n" + "=".repeat(65));
  console.log("🌙 ESP CORE — Code Quality Guardian Overnight Daemon Active");
  console.log(`⏱️  Schedule Interval: Every ${intervalMinutes} minutes`);
  console.log(`📝 Log file: ${getLogPath()}`);
  console.log(`⚡ Auto-Remediation: ${isFix ? "ENABLED" : "DISABLED"}`);
  console.log("=".repeat(65) + "\n");

  writeLog(`>>> Code Quality Guardian Overnight Daemon Started (Interval: ${intervalMinutes}m, AutoFix: ${isFix}) <<<`);

  let cycle = 1;
  await runSingleCycle(scanner, true, isFix, cycle);

  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(async () => {
    cycle++;
    const fullScanCycle = cycle % 4 === 0; // Full scan every 4 cycles (e.g. every 2 hours)
    try {
      await runSingleCycle(scanner, fullScanCycle, isFix, cycle);
    } catch (err: any) {
      console.error(`[QualityGuardian Daemon] Error in cycle #${cycle}:`, err);
      writeLog(`[ERROR] Cycle #${cycle} encountered exception: ${err?.message || err}`);
    }
  }, intervalMs);

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\n[QualityGuardian Daemon] Received SIGINT. Shutting down cleanly...");
    writeLog(">>> Code Quality Guardian Overnight Daemon Stopped by SIGINT <<<");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n[QualityGuardian Daemon] Received SIGTERM. Shutting down cleanly...");
    writeLog(">>> Code Quality Guardian Overnight Daemon Stopped by SIGTERM <<<");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error running Code Quality Guardian:", err);
  writeLog(`[FATAL ERROR] ${err?.message || err}`);
  process.exit(1);
});

