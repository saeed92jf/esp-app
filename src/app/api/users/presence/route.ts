// src/app/api/users/presence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/presence`, {
        headers: {
          Accept: "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
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
      onlineUserIds: [],
      count: 0,
      presenceMap: {},
    });
  } catch (err: any) {
    return NextResponse.json({
      onlineUserIds: [],
      count: 0,
      presenceMap: {},
    });
  }
}
