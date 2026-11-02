// src/app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { markServerNotificationAsRead } from "@/lib/server/notifications-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = markServerNotificationAsRead(id);

    if (!ok) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `اعلان با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("PATCH /api/notifications/[id]/read error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

