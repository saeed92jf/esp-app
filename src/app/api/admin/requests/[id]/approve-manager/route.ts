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
        if (remoteData?.user) {
          const users = globalThis.__espServerAdminUsers || [];
          const idx = users.findIndex(
            (u) => u.id === remoteData.user.id || u.email.toLowerCase() === remoteData.user.email?.toLowerCase()
          );
          if (idx !== -1) {
            users[idx] = { ...users[idx], ...remoteData.user };
          } else {
            users.unshift(remoteData.user);
          }
          globalThis.__espServerAdminUsers = users;
        }
        approveServerAdminRequestManager(id, body);
        return NextResponse.json(remoteData, {
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        });
      }
    } catch {}

    const result = approveServerAdminRequestManager(id, {
      tempPassword: body?.tempPassword,
      role: body?.role,
      modulesAccess: body?.modulesAccess,
      requestData: body?.requestData,
      userId: body?.userId,
      email: body?.email,
    });

    if (!result) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "حساب کاربری با موفقیت تأیید قطعی و فعال شد.",
        request: result.request,
        tempPassword: result.tempPassword,
        user: result.user,
      },
      {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (err: any) {
    console.error("POST /api/admin/requests/[id]/approve-manager error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
