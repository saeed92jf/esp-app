// src/app/api/datasheet-ai/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const remoteUrl = new URL(`${BACKEND_API_URL}/datasheet-ai/documents`);
    if (search) remoteUrl.searchParams.set("search", search);

    const res = await fetch(remoteUrl.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json([], { status: 200 });
  } catch (err: any) {
    console.error("GET /api/datasheet-ai/documents error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const remoteUrl = `${BACKEND_API_URL}/datasheet-ai/documents`;

    const res = await fetch(remoteUrl, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Failed to upload document" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/datasheet-ai/documents error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}

