// src/app/api/admin/quality-guardian/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GuardianStorageService } from "@/modules/quality-guardian";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { violationId } = body;

    if (!violationId) {
      return NextResponse.json(
        { error: "violationId is required" },
        { status: 400 }
      );
    }

    const updated = GuardianStorageService.updateViolationStatus(
      violationId,
      "resolved"
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Violation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, violation: updated });
  } catch (error: any) {
    console.error("[QualityGuardian API] POST /resolve error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to resolve violation" },
      { status: 500 }
    );
  }
}

