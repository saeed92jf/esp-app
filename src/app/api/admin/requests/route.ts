// src/app/api/admin/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminRequests,
  createServerAdminRequest,
} from "@/lib/server/admin-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import type { RequestStatus } from "@/modules/admin/types/admin.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as RequestStatus) || undefined;
    const search = searchParams.get("search") || undefined;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/admin/requests`);
      if (status) remoteUrl.searchParams.set("status", status);
      if (search) remoteUrl.searchParams.set("search", search);

      const remoteRes = await fetch(remoteUrl.toString(), {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, {
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        });
      }
    } catch {}

    const result = getServerAdminRequests({ status, search });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: any) {
    console.error("GET /api/admin/requests error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "ایمیل متقاضی الزامی است." },
        { status: 422 }
      );
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, { status: 201 });
      }
    } catch {}

    const created = createServerAdminRequest(body);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/requests error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to create request" },
      { status: 500 }
    );
  }
}
