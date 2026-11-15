// src/app/api/users/me/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const DEFAULT_PREFERENCES = {
  primaryColor: "blue",
  theme: "system",
  quickAccessHrefs: [
    "/ESP-Flow",
    "/tasks",
    "/projects",
    "/customers",
    "/dictionary",
    "/did-you-know",
  ],
  favoriteApps: [
    "/ESP-Flow",
    "/tasks",
    "/projects",
    "/customers",
    "/dictionary",
    "/did-you-know",
  ],
};

function resolveAuthHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ") && authHeader.length > 10) {
    headers["Authorization"] = authHeader;
  } else {
    const cookieToken =
      req.cookies.get("esp-auth-token")?.value ||
      req.cookies.get("auth-token")?.value;
    if (cookieToken && cookieToken.trim().length > 0) {
      headers["Authorization"] = `Bearer ${cookieToken.trim()}`;
    }
  }

  const userId = req.headers.get("x-user-id") || req.cookies.get("esp-user-id")?.value;
  if (userId) {
    headers["x-user-id"] = userId;
  }

  return headers;
}

export async function GET(req: NextRequest) {
  try {
    const headers = resolveAuthHeaders(req);
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/preferences`, {
        headers,
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, { headers: NO_CACHE_HEADERS });
      }
    } catch {
      // Backend temporarily unreachable
    }

    return NextResponse.json(DEFAULT_PREFERENCES, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(DEFAULT_PREFERENCES, { headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const headers = resolveAuthHeaders(req);
    headers["Content-Type"] = "application/json";

    const body = await req.json();

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/preferences`, {
        method: "PATCH",
        headers,
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
      {
        ...DEFAULT_PREFERENCES,
        ...body,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(DEFAULT_PREFERENCES, { headers: NO_CACHE_HEADERS });
  }
}
