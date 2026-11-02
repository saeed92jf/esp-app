// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminUsers,
  createServerAdminUser,
} from "@/lib/server/admin-store";
import type { UserRole } from "@/types/auth";

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

    // Optional proxy to remote backend if Bearer token is provided and remote succeeds
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const remoteUrl = new URL("http://192.168.0.171:8080/api/v1/admin/users");
        if (search) remoteUrl.searchParams.set("search", search);
        if (role) remoteUrl.searchParams.set("role", role);
        if (status) remoteUrl.searchParams.set("status", status);
        if (page) remoteUrl.searchParams.set("page", String(page));
        if (limit) remoteUrl.searchParams.set("limit", String(limit));

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

    const result = getServerAdminUsers({
      search,
      role: role as any,
      status,
      department,
      company,
      page,
      limit,
    });

    return NextResponse.json(result);
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

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "ایمیل سازمانی الزامی است." },
        { status: 422 }
      );
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

