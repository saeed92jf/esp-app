// src/app/api/users/heartbeat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json().catch(() => ({}));

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/heartbeat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend temporarily unreachable
    }

    return NextResponse.json({
      status: "ok",
      presence: {
        userId: body.userId || "u-saeed",
        isOnline: true,
        status: "online",
        lastSeenAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "ok", isOnline: true });
  }
}
