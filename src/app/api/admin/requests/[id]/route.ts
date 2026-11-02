// src/app/api/admin/requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminRequestById,
  updateServerAdminRequest,
} from "@/lib/server/admin-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getServerAdminRequestById(id);

    if (!item) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (err: any) {
    console.error("GET /api/admin/requests/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateServerAdminRequest(id, body);
    if (!updated) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error("PUT /api/admin/requests/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

