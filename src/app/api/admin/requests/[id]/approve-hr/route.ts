// src/app/api/admin/requests/[id]/approve-hr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approveServerAdminRequestHr } from "@/lib/server/admin-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const notes = body?.notes || "";

    const reqItem = approveServerAdminRequestHr(id, notes);
    if (!reqItem) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تأیید مدارک پرسنلی با موفقیت ثبت شد.",
      data: reqItem,
    });
  } catch (err: any) {
    console.error("POST /api/admin/requests/[id]/approve-hr error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

