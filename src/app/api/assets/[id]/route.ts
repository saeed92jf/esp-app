// src/app/api/assets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const remoteUrl = `${BACKEND_API_URL}/assets/${id}`;

    const remoteRes = await fetch(remoteUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Asset not found" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const remoteUrl = `${BACKEND_API_URL}/assets/${id}`;

    const remoteRes = await fetch(remoteUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to update asset" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to connect to assets service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const remoteUrl = `${BACKEND_API_URL}/assets/${id}`;

    const remoteRes = await fetch(remoteUrl, {
      method: "DELETE",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to connect to assets service" },
      { status: 500 }
    );
  }
}
