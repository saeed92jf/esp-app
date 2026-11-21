// src/app/api/esp-coding/material-hierarchy/route.ts
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

    const options = CodingExcelProvider.getMaterialHierarchyOptions();

    return NextResponse.json({
      available: true,
      options,
    });
  } catch (err: any) {
    console.error("GET /api/esp-coding/material-hierarchy error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load material hierarchy options" },
      { status: 500 }
    );
  }
}
