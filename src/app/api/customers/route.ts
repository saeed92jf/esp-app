// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const city = searchParams.get("city") || undefined;
    const has_logo = searchParams.get("has_logo") || undefined;
    const limit = searchParams.get("limit") || "60";
    const offset = searchParams.get("offset") || "0";

    const remoteUrl = new URL(`${BACKEND_API_URL}/customers`);
    if (search) remoteUrl.searchParams.set("search", search);
    if (industry) remoteUrl.searchParams.set("industry", industry);
    if (city) remoteUrl.searchParams.set("city", city);
    if (has_logo) remoteUrl.searchParams.set("has_logo", has_logo);
    remoteUrl.searchParams.set("limit", limit);
    remoteUrl.searchParams.set("offset", offset);

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
      { error: errData.detail || "Failed to fetch customers from backend" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("GET /api/customers error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to connect to customers service" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const remoteRes = await fetch(`${BACKEND_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data, { status: 201 });
    }

    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to create customer" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("POST /api/customers error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}

