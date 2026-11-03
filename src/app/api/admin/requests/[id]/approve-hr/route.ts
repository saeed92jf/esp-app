// src/app/api/admin/requests/[id]/approve-hr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approveServerAdminRequestHr } from "@/lib/server/admin-store";
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
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests/${encodeURIComponent(id)}/approve-hr`, {
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
        approveServerAdminRequestHr(id, body?.notes || "");
        return NextResponse.json(remoteData);
      }
    } catch {}

    const reqItem = approveServerAdminRequestHr(id, body?.notes || "");
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
