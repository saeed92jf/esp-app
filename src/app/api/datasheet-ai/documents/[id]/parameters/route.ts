// src/app/api/datasheet-ai/documents/[id]/parameters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/documents/${id}/parameters`;

    const res = await fetch(remoteUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Parameters not found" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error fetching parameters" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/documents/${id}/parameters`;

    const res = await fetch(remoteUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const errText = await res.text();
    return NextResponse.json({ error: errText || "Failed to update parameter" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error updating parameter" }, { status: 500 });
  }
}

