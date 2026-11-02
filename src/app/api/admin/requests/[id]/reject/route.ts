// src/app/api/admin/requests/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rejectServerAdminRequest } from "@/lib/server/admin-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "عدم احراز شرایط مورد نیاز";

    const reqItem = rejectServerAdminRequest(id, reason);
    if (!reqItem) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "درخواست عضویت با موفقیت رد گردید.",
      data: reqItem,
    });
  } catch (err: any) {
    console.error("POST /api/admin/requests/[id]/reject error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

