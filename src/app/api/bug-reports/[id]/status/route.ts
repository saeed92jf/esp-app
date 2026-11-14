// src/app/api/bug-reports/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { updateServerBugReportStatus } from "@/lib/server/bug-reports-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/bug-reports/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        updateServerBugReportStatus(id, body.status, body.explanation, {
          id: body.userId,
          name: body.userName,
        });
        return NextResponse.json(data);
      }
    } catch {}

    const updated = updateServerBugReportStatus(
      id,
      body.status,
      body.explanation,
      { id: body.userId, name: body.userName }
    );
    if (!updated) {
      return NextResponse.json({ error: "Bug report not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update status" },
      { status: 500 }
    );
  }
}

