// src/app/api/admin/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminRequests,
  createServerAdminRequest,
} from "@/lib/server/admin-store";
import type { RequestStatus } from "@/modules/admin/types/admin.types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as RequestStatus) || undefined;
    const search = searchParams.get("search") || undefined;

    // Optional proxy to remote backend if Bearer token is provided
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const remoteUrl = new URL("http://192.168.0.171:8080/api/v1/admin/requests");
        if (status) remoteUrl.searchParams.set("status", status);

        const remoteRes = await fetch(remoteUrl.toString(), {
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
        // Fallback transparently to server persistent store
      }
    }

    const result = getServerAdminRequests({ status, search });
    return NextResponse.json(result);
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

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "ایمیل متقاضی الزامی است." },
        { status: 422 }
      );
    }

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

