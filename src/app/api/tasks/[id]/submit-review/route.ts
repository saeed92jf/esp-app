// src/app/api/tasks/[id]/submit-review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/${id}/submit-review`, {
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
    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to submit task for review" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("POST /api/tasks/:id/submit-review error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to submit task for review" },
      { status: 500 }
    );
  }
}

