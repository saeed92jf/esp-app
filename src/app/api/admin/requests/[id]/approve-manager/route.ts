// src/app/api/admin/requests/[id]/approve-manager/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approveServerAdminRequestManager } from "@/lib/server/admin-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = approveServerAdminRequestManager(id, {
      tempPassword: body?.tempPassword,
      role: body?.role,
      modulesAccess: body?.modulesAccess,
    });

    if (!result) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "حساب کاربری با موفقیت تأیید قطعی و فعال شد.",
      request: result.request,
      tempPassword: result.tempPassword,
      user: result.user,
    });
  } catch (err: any) {
    console.error("POST /api/admin/requests/[id]/approve-manager error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

