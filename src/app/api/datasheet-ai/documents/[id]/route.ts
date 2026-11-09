// src/app/api/datasheet-ai/documents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/documents/${id}`;

    const res = await fetch(remoteUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Document not found" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error fetching document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/documents/${id}`;

    const res = await fetch(remoteUrl, {
      method: "DELETE",
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error deleting document" }, { status: 500 });
  }
}

