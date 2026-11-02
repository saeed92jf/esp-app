// src/app/api/users/me/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerUserProfile,
  updateServerUserPreferences,
} from "@/lib/server/user-profile-store";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ") && !authHeader.includes("fake-token-")) {
      try {
        const remoteRes = await fetch("http://192.168.0.171:8080/api/v1/users/me/preferences", {
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
        // Fallback to server store
      }
    }

    const profile = getServerUserProfile();
    return NextResponse.json({
      primaryColor: profile.personal?.primaryColor || "blue",
      theme: "system",
      quickAccessHrefs: [],
    });
  } catch (err: any) {
    console.error("GET /api/users/me/preferences error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to get preferences" },
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
        await fetch("http://192.168.0.171:8080/api/v1/users/me/preferences", {
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
        // Fallback to server store
      }
    }

    const updated = updateServerUserPreferences(body);
    return NextResponse.json({
      primaryColor: updated.primaryColor || "blue",
      theme: updated.theme || "system",
      quickAccessHrefs: [],
    });
  } catch (err: any) {
    console.error("PATCH /api/users/me/preferences error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}

