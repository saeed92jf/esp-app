// src/app/api/bug-reports/my/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { getServerBugReports } from "@/lib/server/bug-reports-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const authHeader = req.headers.get("authorization");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/bug-reports/my?userId=${userId}`, {
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

    const my = getServerBugReports({ reporterId: userId });
    return NextResponse.json(my);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load my reports" },
      { status: 500 }
    );
  }
}

