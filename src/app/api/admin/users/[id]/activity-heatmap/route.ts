// src/app/api/admin/users/[id]/activity-heatmap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users/${id}/activity-heatmap`, {
      headers: {
        Accept: "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      signal: AbortSignal.timeout(4000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Failed to fetch activity heatmap" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch activity heatmap" },
      { status: 500 }
    );
  }
}
