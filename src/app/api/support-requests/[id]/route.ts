// src/app/api/support-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import {
  updateServerSupportRequestStatus,
  deleteServerSupportRequest,
} from "@/lib/server/bug-reports-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/support-requests/${id}`, {
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
        updateServerSupportRequestStatus(id, body.status);
        return NextResponse.json(data);
      }
    } catch {}

    const updated = updateServerSupportRequestStatus(id, body.status);
    if (!updated) {
      return NextResponse.json(
        { error: "Support request not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update support request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    try {
      await fetch(`${BACKEND_API_URL}/support-requests/${id}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        signal: AbortSignal.timeout(4000),
      });
    } catch {}

    const success = deleteServerSupportRequest(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete support request" },
      { status: 500 }
    );
  }
}

