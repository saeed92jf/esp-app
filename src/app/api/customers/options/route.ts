// src/app/api/customers/options/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") || "400";

    const remoteUrl = new URL(`${BACKEND_API_URL}/customers/options`);
    if (search) remoteUrl.searchParams.set("search", search);
    remoteUrl.searchParams.set("limit", limit);

    const remoteRes = await fetch(remoteUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to fetch customer options" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("GET /api/customers/options error:", err);
    return NextResponse.json([], { status: 200 }); // Graceful fallback empty list
  }
}

