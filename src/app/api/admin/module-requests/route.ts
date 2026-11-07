// src/app/api/admin/module-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const remoteUrl = `${BACKEND_API_URL}/admin/module-requests`;

    const res = await fetch(remoteUrl, {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json([], { status: 200 });
  } catch (err: any) {
    console.warn("GET /api/admin/module-requests fallback:", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    const remoteUrl = `${BACKEND_API_URL}/admin/module-requests`;

    const res = await fetch(remoteUrl, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }

    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { message: err.detail || "Failed to create module request" },
      { status: res.status }
    );
  } catch (err: any) {
    console.error("POST /api/admin/module-requests error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to create module request" },
      { status: 500 }
    );
  }
}
