// src/app/api/admin/requests/[id]/approve-manager/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approveServerAdminRequestManager } from "@/lib/server/admin-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests/${encodeURIComponent(id)}/approve-manager`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        approveServerAdminRequestManager(id, body);
        return NextResponse.json(remoteData);
      }
    } catch {}

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
