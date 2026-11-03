// src/app/api/admin/requests/[id]/resend-credentials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resendServerAdminRequestCredentials } from "@/lib/server/admin-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests/${encodeURIComponent(id)}/resend-credentials`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData);
      }
    } catch {}

    const result = resendServerAdminRequestCredentials(id);
    if (!result) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "اطلاعات ورود مجدداً ارسال گردید.",
      tempPassword: result.tempPassword,
    });
  } catch (err: any) {
    console.error("POST /api/admin/requests/[id]/resend-credentials error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
