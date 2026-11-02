// src/app/api/users/me/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerUserProfile,
  updateServerUserProfile,
} from "@/lib/server/user-profile-store";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ") && !authHeader.includes("fake-token-")) {
      try {
        const remoteRes = await fetch("http://192.168.0.171:8080/api/v1/users/me/profile", {
          headers: {
            Authorization: authHeader,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(3000),
        });

        if (remoteRes.ok) {
          const remoteData = await remoteRes.json();
          return NextResponse.json(remoteData);
        }
      } catch {
        // Fallback to server persistent store
      }
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

    if (authHeader && authHeader.startsWith("Bearer ") && !authHeader.includes("fake-token-")) {
      try {
        await fetch("http://192.168.0.171:8080/api/v1/users/me/profile", {
          method: "PATCH",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000),
        });
      } catch {
        // Fallback persists in server store below
      }
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

