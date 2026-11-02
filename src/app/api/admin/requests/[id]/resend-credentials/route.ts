// src/app/api/admin/requests/[id]/resend-credentials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resendServerAdminRequestCredentials } from "@/lib/server/admin-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = resendServerAdminRequestCredentials(id);

    if (!res) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "اطلاعات ورود و رمز موقت با موفقیت مجدداً ارسال گردید.",
      tempPassword: res.tempPassword,
    });
  } catch (err: any) {
    console.error("POST /api/admin/requests/[id]/resend-credentials error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

