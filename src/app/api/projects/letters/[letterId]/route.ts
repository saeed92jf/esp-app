// src/app/api/projects/letters/[letterId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { deleteServerLetter } from "@/lib/server/projects-tasks-store";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ letterId: string }> }
) {
  try {
    const { letterId } = await context.params;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/projects/letters/${letterId}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        return NextResponse.json({ success: true, deleted_id: letterId });
      }
    } catch {
      // Fallback
    }

    const deleted = deleteServerLetter(letterId);
    if (!deleted) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted_id: letterId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete letter" },
      { status: 500 }
    );
  }
}

