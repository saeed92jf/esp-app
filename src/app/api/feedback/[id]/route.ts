// src/app/api/feedback/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { deleteServerFeedback } from "@/lib/server/bug-reports-store";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    try {
      await fetch(`${BACKEND_API_URL}/feedback/${id}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        signal: AbortSignal.timeout(4000),
      });
    } catch {}

    const success = deleteServerFeedback(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete feedback" },
      { status: 500 }
    );
  }
}

