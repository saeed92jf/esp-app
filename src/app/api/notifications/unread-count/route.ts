// src/app/api/notifications/unread-count/route.ts
import { NextResponse } from "next/server";
import { getServerNotifications } from "@/lib/server/notifications-store";

export async function GET() {
  try {
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

