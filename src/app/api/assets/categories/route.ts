// src/app/api/assets/categories/route.ts
import { NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET() {
  try {
    const remoteUrl = `${BACKEND_API_URL}/assets/categories`;
    const remoteRes = await fetch(remoteUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Failed to fetch asset categories" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to connect to asset categories" },
      { status: 500 }
    );
  }
}
