// src/app/api/notifications/unread-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerNotifications } from "@/lib/server/notifications-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/notifications/unread-count`);
      if (searchParams.get("role")) remoteUrl.searchParams.set("role", searchParams.get("role")!);
      if (searchParams.get("userId")) remoteUrl.searchParams.set("userId", searchParams.get("userId")!);

      const remoteRes = await fetch(remoteUrl.toString(), {
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

