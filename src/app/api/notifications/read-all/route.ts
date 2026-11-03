// src/app/api/notifications/read-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { markAllServerNotificationsAsRead } from "@/lib/server/notifications-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(3000),
      });
      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {}

    const count = markAllServerNotificationsAsRead();
    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    console.error("PATCH /api/notifications/read-all error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

