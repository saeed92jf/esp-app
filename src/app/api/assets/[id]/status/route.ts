// src/app/api/assets/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const remoteUrl = `${BACKEND_API_URL}/assets/${id}/status`;

    const remoteRes = await fetch(remoteUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to update asset status" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to connect to assets service" },
      { status: 500 }
    );
  }
}
