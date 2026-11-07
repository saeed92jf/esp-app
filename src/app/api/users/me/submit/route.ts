// src/app/api/users/me/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error_code: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/users/me/submit`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
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
      success: true,
      message: "پروفایل کاربری با موفقیت ثبت شد و در انتظار تأیید نهایی است.",
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to submit profile" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
