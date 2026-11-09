// src/app/api/datasheet-ai/documents/[id]/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/documents/${id}/extract`;

    const res = await fetch(remoteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const errText = await res.text();
    return NextResponse.json({ error: errText || "Failed to trigger extraction" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal extraction error" }, { status: 500 });
  }
}

