// src/app/api/bug-reports/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { addServerBugReportComment } from "@/lib/server/bug-reports-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!body.comment || !body.comment.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/bug-reports/${id}/comments`, {
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
        addServerBugReportComment(id, body);
        return NextResponse.json(data);
      }
    } catch {}

    const comment = addServerBugReportComment(id, body);
    if (!comment) {
      return NextResponse.json({ error: "Bug report not found" }, { status: 404 });
    }
    return NextResponse.json(comment);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to add comment" },
      { status: 500 }
    );
  }
}

