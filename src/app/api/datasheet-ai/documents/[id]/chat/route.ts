// src/app/api/datasheet-ai/documents/[id]/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/documents/${id}/chat`;

    const res = await fetch(remoteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const errText = await res.text();
    return NextResponse.json(
      { error: errText || "Failed to process question" },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error during chat" },
      { status: 500 }
    );
  }
}

