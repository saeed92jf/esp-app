// src/app/api/notifications/read-all/route.ts
import { NextResponse } from "next/server";
import { markAllServerNotificationsAsRead } from "@/lib/server/notifications-store";

export async function PATCH() {
  try {
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

