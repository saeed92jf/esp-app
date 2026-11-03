// src/app/api/users/me/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerUserProfile,
  updateServerUserProfile,
} from "@/lib/server/user-profile-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/profile`, {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(3000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData.profile ? remoteData : { success: true, profile: remoteData });
      }
    } catch {
      // Fallback to server persistent store
    }

    const profile = getServerUserProfile();
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

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/profile`, {
        method: "PATCH",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        updateServerUserProfile(body);
        return NextResponse.json(remoteData);
      }
    } catch {
      // Fallback persists in server store below
    }

    const updated = updateServerUserProfile(body);
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

