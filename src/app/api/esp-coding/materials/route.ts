// src/app/api/esp-coding/materials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CodingExcelProvider } from "@/lib/server/coding-excel-provider";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const spec = searchParams.get("spec") || undefined;
    const grade = searchParams.get("grade") || undefined;
    const form = searchParams.get("form") || undefined;
    const groupMat = searchParams.get("groupMat") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = CodingExcelProvider.getMaterials({
      search,
      spec,
      grade,
      form,
      groupMat,
      limit,
      offset,
    });

    return NextResponse.json({
      items: result.items,
      total: result.total,
      offset,
      limit,
    });
  } catch (err: any) {
    console.error("GET /api/esp-coding/materials error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
