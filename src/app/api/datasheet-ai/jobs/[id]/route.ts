// src/app/api/datasheet-ai/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/jobs/${id}`;

    const res = await fetch(remoteUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Job not found" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error checking job" }, { status: 500 });
  }
}

