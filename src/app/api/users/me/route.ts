// src/app/api/users/me/route.ts
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

    // Zero-Trust Security: Reject unauthenticated requests immediately.
    // Never leak superadmin or any user profile across the network without a valid token.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error_code: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me`, {
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

      if (remoteRes.status === 401 || remoteRes.status === 403) {
        return NextResponse.json(
          { error_code: "UNAUTHORIZED", message: "Invalid or expired token" },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }
    } catch {
      // Backend temporarily unreachable
    }

    // If backend is unreachable or token cannot be verified, reject securely
    return NextResponse.json(
      { error_code: "UNAUTHORIZED", message: "Authentication service unavailable" },
      { status: 401, headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("GET /api/users/me error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to get user" },
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
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me`, {
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

    return NextResponse.json(
      { error_code: "SERVICE_UNAVAILABLE", message: "Failed to update profile" },
      { status: 503, headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("PATCH /api/users/me error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to update user" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
