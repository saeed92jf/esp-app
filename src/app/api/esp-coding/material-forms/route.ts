// src/app/api/esp-coding/material-forms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CodingExcelProvider } from "@/lib/server/coding-excel-provider";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const forms = CodingExcelProvider.getMaterialForms({ search });
    return NextResponse.json({ forms });
  } catch (err: any) {
    console.error("GET /api/esp-coding/material-forms error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch material forms" },
      { status: 500 }
    );
  }
}
