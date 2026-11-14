// src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import {
  getServerFeedback,
  createServerFeedback,
} from "@/lib/server/bug-reports-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/feedback`);
      if (userId) remoteUrl.searchParams.set("userId", userId);
      const remoteRes = await fetch(remoteUrl.toString(), {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(3000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {}

    const list = getServerFeedback(userId);
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!body.message || !body.message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/feedback`, {
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
        createServerFeedback(body);
        return NextResponse.json(data, { status: 201 });
      }
    } catch {}

    const created = createServerFeedback(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

