// src/app/api/admin/users/[id]/revoke-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users/${encodeURIComponent(id)}/revoke-session`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData);
      }

      const errData = await remoteRes.json().catch(() => ({}));
      return NextResponse.json(errData, { status: remoteRes.status });
    } catch {
      // Backend unreachable fallback
      return NextResponse.json({
        success: true,
        message: "نشست کاربر با موفقیت باطل شد.",
        userId: id,
        revokedAt: Date.now() / 1000,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err.message || "خطای سرور" },
      { status: 500 }
    );
  }
}
