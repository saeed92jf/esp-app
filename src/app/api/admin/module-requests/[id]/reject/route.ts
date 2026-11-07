// src/app/api/admin/module-requests/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    const remoteUrl = `${BACKEND_API_URL}/admin/module-requests/${id}/reject`;

    const res = await fetch(remoteUrl, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { message: err.detail || "Failed to reject module request" },
      { status: res.status }
    );
  } catch (err: any) {
    console.error("POST /api/admin/module-requests/[id]/reject error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to reject module request" },
      { status: 500 }
    );
  }
}

