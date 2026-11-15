// src/app/api/admin/quality-guardian/scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  GuardianStorageService,
  ScannerEngine,
} from "@/modules/quality-guardian";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status") || "pending";
    const search = searchParams.get("search")?.toLowerCase().trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const state = GuardianStorageService.loadState();

    let filtered = state.violations;

    if (status && status !== "all") {
      filtered = filtered.filter((v) => v.status === status);
    }
    if (category && category !== "all") {
      filtered = filtered.filter((v) => v.category === category);
    }
    if (severity && severity !== "all") {
      filtered = filtered.filter((v) => v.severity === severity);
    }
    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(search) ||
          v.description.toLowerCase().includes(search) ||
          v.filePath.toLowerCase().includes(search) ||
          (v.codeSnippet && v.codeSnippet.toLowerCase().includes(search))
      );
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      summary: state.lastScan,
      violations: paginated,
      total,
      page,
      limit,
      history: state.history || [],
    });
  } catch (error: any) {
    console.error("[QualityGuardian API] GET /scan error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load scan data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const full = Boolean(body.full);
    const filePaths = Array.isArray(body.filePaths) ? body.filePaths : undefined;

    const engine = new ScannerEngine();
    const result = await engine.scan({ full, filePaths });

    return NextResponse.json({
      success: true,
      summary: result.summary,
      totalViolations: result.violations.length,
    });
  } catch (error: any) {
    console.error("[QualityGuardian API] POST /scan error:", error);
    return NextResponse.json(
      { error: error?.message || "Scan execution failed" },
      { status: 500 }
    );
  }
}

