// src/app/api/projects/letters/[letterId]/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { sendServerLetter } from "@/lib/server/projects-tasks-store";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ letterId: string }> }
) {
  try {
    const { letterId } = await context.params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/projects/letters/${letterId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    const sent = sendServerLetter(letterId, body);
    if (!sent) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }
    return NextResponse.json(sent);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to mark letter sent" },
      { status: 500 }
    );
  }
}
