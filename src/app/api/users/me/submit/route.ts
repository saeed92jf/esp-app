// src/app/api/users/me/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerUserProfile } from "@/lib/server/user-profile-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ") && !authHeader.includes("fake-token-")) {
      try {
        await fetch(`${BACKEND_API_URL}/users/me/submit`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(3000),
        });
      } catch {
        // Fallback
      }
    }

    const profile = getServerUserProfile();
    return NextResponse.json({
      success: true,
      message: "پروفایل کاربری با موفقیت ثبت شد و در انتظار تأیید نهایی است.",
      profile,
    });
  } catch (err: any) {
    console.error("POST /api/users/me/submit error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to submit profile" },
      { status: 500 }
    );
  }
}

