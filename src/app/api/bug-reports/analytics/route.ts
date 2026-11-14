// src/app/api/bug-reports/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { getServerBugReportsAnalytics } from "@/lib/server/bug-reports-store";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/bug-reports/analytics`, {
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

    const analytics = getServerBugReportsAnalytics();
    return NextResponse.json(analytics);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}

