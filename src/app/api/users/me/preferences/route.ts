// src/app/api/users/me/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error_code: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/preferences`, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, { headers: NO_CACHE_HEADERS });
      }
    } catch {
      // Backend temporarily unreachable
    }

    return NextResponse.json({
      primaryColor: "blue",
      theme: "system",
      quickAccessHrefs: [],
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to get preferences" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error_code: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await req.json();

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/preferences`, {
        method: "PATCH",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
      }
    } catch {
      // Backend error
    }

    return NextResponse.json({
      primaryColor: body.primaryColor || "blue",
      theme: body.theme || "system",
      quickAccessHrefs: [],
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to update preferences" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
