// src/app/api/admin/quality-guardian/remediate/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  GuardianStorageService,
  RemediationEngine,
} from "@/modules/quality-guardian";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { violationId, violationIds, dryRun = false } = body;

    const state = GuardianStorageService.loadState();
    const remediation = new RemediationEngine();

    if (violationId) {
      const target = state.violations.find((v) => v.id === violationId);
      if (!target) {
        return NextResponse.json(
          { error: "Violation not found" },
          { status: 404 }
        );
      }

      const result = dryRun
        ? remediation.previewFix(target)
        : remediation.applyFix(target);

      return NextResponse.json({ success: result.success, result });
    }

    if (Array.isArray(violationIds) && violationIds.length > 0) {
      const targets = state.violations.filter((v) =>
        violationIds.includes(v.id)
      );
      const batchResult = remediation.applyBatch(targets);
      return NextResponse.json({ success: true, batchResult });
    }

    return NextResponse.json(
      { error: "No violationId or violationIds provided" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[QualityGuardian API] POST /remediate error:", error);
    return NextResponse.json(
      { error: error?.message || "Remediation execution failed" },
      { status: 500 }
    );
  }
}

