// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerNotifications,
  createServerNotification,
} from "@/lib/server/notifications-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = (searchParams.get("type") as any) || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;

    const result = getServerNotifications({ unreadOnly, type, limit, offset });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "عنوان و متن اعلان الزامی است." },
        { status: 422 }
      );
    }

    const created = createServerNotification(body);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/notifications error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

