// src/app/api/tasks/[id]/progress/route.ts
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

    const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/${id}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data, { status: 201 });
    }
    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to add progress" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("POST /api/tasks/:id/progress error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to add progress update" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const progressId = searchParams.get("progressId");

    if (!progressId) {
      return NextResponse.json(
        { error: "progressId is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/${id}/progress/${progressId}`, {
      method: "DELETE",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      signal: AbortSignal.timeout(60000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data, { status: 200 });
    }
    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to delete progress message" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("DELETE /api/tasks/:id/progress error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete progress message" },
      { status: 500 }
    );
  }
}
