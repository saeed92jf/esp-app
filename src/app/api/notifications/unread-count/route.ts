// src/app/api/notifications/unread-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerNotifications } from "@/lib/server/notifications-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/notifications/unread-count`, {
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

    const { unreadCount } = getServerNotifications({ unreadOnly: true });
    return NextResponse.json({ count: unreadCount });
  } catch (err: any) {
    console.error("GET /api/notifications/unread-count error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

