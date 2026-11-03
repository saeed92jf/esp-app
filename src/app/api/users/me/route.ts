// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerUserProfile,
  updateServerUser,
} from "@/lib/server/user-profile-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ") && !authHeader.includes("fake-token-")) {
      try {
        const remoteRes = await fetch(`${BACKEND_API_URL}/users/me`, {
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
    const p = profile.personal || {};
    const o = profile.organizational || {};

    const fullName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : "Saeed Jalili";
    const fullNameFa = p.firstNameFa && p.lastNameFa ? `${p.firstNameFa} ${p.lastNameFa}` : "سعید جلیلی";

    return NextResponse.json({
      id: profile.userId || "u-saeed",
      email: p.email || "saeed@euroslotpars.com",
      name: fullNameFa || fullName,
      fullName: fullName,
      fullNameFa: fullNameFa,
      role: (profile as any).role || "admin",
      status: "active",
      accountStatus: "active",
      isProfileCompleted: true,
      department: o.department || "فناوری اطلاعات",
      jobTitle: o.role || "مدیر فنی",
      primaryColor: p.primaryColor || "blue",
      avatarColor: p.avatarColor || "#0284c7",
      avatar: p.avatar || null,
      avatarMode: p.avatarMode || "initials",
      hrApproved: true,
      managerApproved: true,
    });
  } catch (err: any) {
    console.error("GET /api/users/me error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to get user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    try {
      await fetch(`${BACKEND_API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Keep persisting locally
    }

    updateServerUser({
      fullName: body.fullName,
      fullNameFa: body.fullNameFa,
      primaryColor: body.primaryColor,
      avatarColor: body.avatarColor,
      avatar: body.avatar,
      avatarMode: body.avatarMode,
    });

    const profile = getServerUserProfile();
    return NextResponse.json({
      id: profile.userId || "u-saeed",
      ...body,
    });
  } catch (err: any) {
    console.error("PATCH /api/users/me error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
