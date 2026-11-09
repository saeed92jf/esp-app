// src/app/api/projects/letters/[letterId]/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { reviewServerLetter } from "@/lib/server/projects-tasks-store";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ letterId: string }> }
) {
  try {
    const { letterId } = await context.params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/projects/letters/${letterId}/review`, {
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

    const reviewed = reviewServerLetter(letterId, body);
    if (!reviewed) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }
    return NextResponse.json(reviewed);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to review letter" },
      { status: 500 }
    );
  }
}
