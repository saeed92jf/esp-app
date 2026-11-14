// src/app/api/bug-reports/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { getServerBugReportById } from "@/lib/server/bug-reports-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/bug-reports/${id}`, {
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

    const report = getServerBugReportById(id);
    if (!report) {
      return NextResponse.json({ error: "Bug report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch bug report" },
      { status: 500 }
    );
  }
}

