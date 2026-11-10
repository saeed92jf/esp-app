// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminUsers,
  createServerAdminUser,
} from "@/lib/server/admin-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import type { UserRole } from "@/types/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const role = (searchParams.get("role") as UserRole) || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const department = searchParams.get("department") || undefined;
    const company = searchParams.get("company") || undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

    const authHeader = req.headers.get("authorization");
    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/admin/users`);
      if (search) remoteUrl.searchParams.set("search", search);
      if (role) remoteUrl.searchParams.set("role", role);
      if (status) remoteUrl.searchParams.set("status", status);
      if (department) remoteUrl.searchParams.set("department", department);
      if (company) remoteUrl.searchParams.set("company", company);
      if (page) remoteUrl.searchParams.set("page", String(page));
      if (limit) remoteUrl.searchParams.set("limit", String(limit));

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
    } catch {
      // Fallback transparently to server store
    }

    const result = getServerAdminUsers({
      search,
      role: role as any,
      status,
      department,
      company,
      page,
      limit,
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: any) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to fetch users" },
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
        { error_code: "VALIDATION_ERROR", message: "ایمیل سازمانی الزامی است." },
        { status: 422 }
      );
    }

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users`, {
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
    } catch {
      // Fallback
    }

    const created = createServerAdminUser(body);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
