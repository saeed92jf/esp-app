// scripts/quality-guardian.ts
import { ScannerEngine } from "../src/modules/quality-guardian/services/scanner-engine";
import { RemediationEngine } from "../src/modules/quality-guardian/services/remediation-engine";
import { GuardianStorageService } from "../src/modules/quality-guardian/services/guardian-storage.service";

async function main() {
  const args = process.argv.slice(2);
  const isFull = args.includes("--full");
  const isFix = args.includes("--fix");
  const isStrict = args.includes("--strict");

  console.log("\n=======================================================");
  console.log("🛡️  ESP CORE — Code Quality Guardian Automated Engine");
  console.log("=======================================================\n");

  const scanner = new ScannerEngine();

  console.log(`[1/3] Running ${isFull ? "full project" : "incremental"} source inspection...`);
  const { summary, violations } = await scanner.scan({ full: isFull });

  console.log(`\nScan completed in ${summary.scanDurationMs}ms`);
  console.log(`Total files scanned: ${summary.totalFilesScanned}`);
  console.log(`Total violations: ${summary.totalViolations}`);
  console.log(`Health Score: ${summary.healthScore}/100\n`);

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

  // If auto-remediation requested
  if (isFix) {
    console.log("\n[2/3] Applying safe automated remediations...");
    const remediation = new RemediationEngine();
    const fixable = violations.filter((v) => v.canAutoRemediate && v.status === "pending");
    console.log(`Found ${fixable.length} auto-remediable violations.`);

    if (fixable.length > 0) {
      const batchResult = remediation.applyBatch(fixable);
      console.log(`Remediation complete: ${batchResult.successful} fixed, ${batchResult.failed} failed.`);
      
      // Rescan after fixes
      console.log("[3/3] Re-verifying quality metrics after remediation...");
      const finalScan = await scanner.scan({ full: false });
      console.log(`New Health Score: ${finalScan.summary.healthScore}/100 (Violations: ${finalScan.summary.totalViolations})`);
    }
  } else {
    console.log("\n[Tip] Run with --fix to automatically apply safe remediations (RTL classes & i18n parity).");
  }

  console.log("\n=======================================================");
  console.log("🛡️  Code Quality Guardian finished successfully.");
  console.log("=======================================================\n");

  if (isStrict) {
    const criticalPending = violations.filter((v) => v.severity === "critical" && v.status === "pending").length;
    const highPending = violations.filter((v) => v.severity === "high" && v.status === "pending").length;
    if (criticalPending > 0 || highPending > 0) {
      console.error(`❌ Strict mode check failed: ${criticalPending} critical and ${highPending} high violations remaining.`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error running Code Quality Guardian:", err);
  process.exit(1);
});

