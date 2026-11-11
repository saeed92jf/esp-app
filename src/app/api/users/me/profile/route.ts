// src/app/api/users/me/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerUserProfile,
  updateServerUserProfile,
} from "@/lib/server/user-profile-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

function extractUserFromAuthHeader(authHeader: string | null): { userId?: string; email?: string } | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7).trim();
  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      const payloadStr = Buffer.from(parts[1], "base64url").toString("utf8");
      const payload = JSON.parse(payloadStr);
      return {
        userId: payload.sub || payload.id,
        email: payload.email,
      };
    }
  } catch {}
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = extractUserFromAuthHeader(authHeader);
    const userIdent = user?.userId || user?.email;

    if (!authHeader || !userIdent) {
      return NextResponse.json(
        { error_code: "UNAUTHORIZED", message: "Authentication required to access profile." },
        { status: 401 }
      );
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/profile`, {
        headers: {
          Authorization: authHeader,
          "X-User-Id": userIdent,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(3000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData.profile ? remoteData : { success: true, profile: remoteData });
      }
    } catch {
      // Fallback to server persistent store for this specific user
    }

    const profile = getServerUserProfile(userIdent);
    if (!profile) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: any) {
    console.error("GET /api/users/me/profile error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    const user = extractUserFromAuthHeader(authHeader);
    const userIdent = user?.userId || user?.email;

    if (!authHeader) {
      return NextResponse.json(
        { error_code: "UNAUTHORIZED", message: "Authentication required to update profile." },
        { status: 401 }
      );
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/profile`, {
        method: "PATCH",
        headers: {
          Authorization: authHeader,
          ...(userIdent ? { "X-User-Id": userIdent } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        if (userIdent) {
          updateServerUserProfile(body, userIdent);
        }
        return NextResponse.json(remoteData);
      }
    } catch {
      // Fallback persists in server store below
    }

    const updated = updateServerUserProfile(body, userIdent);
    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (err: any) {
    console.error("PATCH /api/users/me/profile error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
