// src/app/api/assets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category_id = searchParams.get("category_id") || undefined;
    const location_id = searchParams.get("location_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const criticality = searchParams.get("criticality") || undefined;

    const remoteUrl = new URL(`${BACKEND_API_URL}/assets`);
    if (search) remoteUrl.searchParams.set("search", search);
    if (category_id) remoteUrl.searchParams.set("category_id", category_id);
    if (location_id) remoteUrl.searchParams.set("location_id", location_id);
    if (status) remoteUrl.searchParams.set("status", status);
    if (criticality) remoteUrl.searchParams.set("criticality", criticality);

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
      { error: errData.detail || "Failed to fetch assets from backend" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("GET /api/assets error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to connect to assets service" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const remoteUrl = new URL(`${BACKEND_API_URL}/assets`);

    const remoteRes = await fetch(remoteUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data, { status: 201 });
    }

    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to create asset" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("POST /api/assets error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to connect to assets service" },
      { status: 500 }
    );
  }
}
