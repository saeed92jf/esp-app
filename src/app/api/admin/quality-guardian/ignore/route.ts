// src/app/api/admin/quality-guardian/ignore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GuardianStorageService } from "@/modules/quality-guardian";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { violationId, reason, ignoredBy } = body;

    if (!violationId) {
      return NextResponse.json(
        { error: "violationId is required" },
        { status: 400 }
      );
    }

    const updated = GuardianStorageService.updateViolationStatus(
      violationId,
      "ignored",
      {
        ignoredReason: reason || "Manual ignore by admin",
        ignoredBy: ignoredBy || "Admin",
      }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Violation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, violation: updated });
  } catch (error: any) {
    console.error("[QualityGuardian API] POST /ignore error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to ignore violation" },
      { status: 500 }
    );
  }
}

