// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerNotifications,
  createServerNotification,
} from "@/lib/server/notifications-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = (searchParams.get("type") as any) || undefined;
    const role = searchParams.get("role") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/notifications`);
      if (unreadOnly) remoteUrl.searchParams.set("unreadOnly", "true");
      if (type) remoteUrl.searchParams.set("type", type);
      if (role) remoteUrl.searchParams.set("role", role);
      if (userId) remoteUrl.searchParams.set("userId", userId);
      remoteUrl.searchParams.set("limit", String(limit));
      remoteUrl.searchParams.set("offset", String(offset));

      const remoteRes = await fetch(remoteUrl.toString(), {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData);
      }
    } catch {}

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

    const authHeader = req.headers.get("authorization");
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/notifications`, {
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
        return NextResponse.json({ data: remoteData }, { status: 201 });
      }
    } catch {}

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

