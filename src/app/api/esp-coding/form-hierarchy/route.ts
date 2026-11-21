// src/app/api/esp-coding/form-hierarchy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CodingExcelProvider } from "@/lib/server/coding-excel-provider";

export async function GET(req: NextRequest) {
  try {
    const isAvailable = CodingExcelProvider.isWorkbookAvailable();
    if (!isAvailable) {
      return NextResponse.json({
        available: false,
        error: "Coding.xlsx workbook not found on server.",
      });
    }

    const data = CodingExcelProvider.getFormHierarchyOptions();

    return NextResponse.json({
      available: true,
      forms: data.forms,
      materials: data.materials,
    });
  } catch (err: any) {
    console.error("GET /api/esp-coding/form-hierarchy error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load form hierarchy options" },
      { status: 500 }
    );
  }
}
