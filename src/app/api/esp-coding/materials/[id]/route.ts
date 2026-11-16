// src/app/api/esp-coding/materials/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CodingExcelProvider } from "@/lib/server/coding-excel-provider";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = CodingExcelProvider.getMaterialById(id);

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    return NextResponse.json({ material });
  } catch (err: any) {
    console.error("GET /api/esp-coding/materials/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch material details" },
      { status: 500 }
    );
  }
}
