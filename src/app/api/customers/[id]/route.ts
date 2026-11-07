// src/app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const remoteRes = await fetch(`${BACKEND_API_URL}/customers/${id}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }
    const err = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.detail || "Customer not found" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const remoteRes = await fetch(`${BACKEND_API_URL}/customers/${id}`, {
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
    const err = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.detail || "Failed to update customer" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const remoteRes = await fetch(`${BACKEND_API_URL}/customers/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }
    const err = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.detail || "Failed to delete customer" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

