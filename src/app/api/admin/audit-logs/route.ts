// src/app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import fs from "fs";

function getFallbackAuditLogs(searchParams: URLSearchParams) {
  const category = searchParams.get("category");
  const severity = searchParams.get("severity");
  const search = searchParams.get("search");
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
  const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;

  const persistentFile = "C:\\ESP_DATA\\live\\data\\audit_logs.json";
  let items: any[] = [];
  try {
    if (fs.existsSync(persistentFile)) {
      items = JSON.parse(fs.readFileSync(persistentFile, "utf-8"));
    }
  } catch {}

  if (category && category !== "all") {
    items = items.filter((x) => x.category === category);
  }
  if (severity && severity !== "all") {
    items = items.filter((x) => x.severity === severity);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (x) =>
        x.title?.toLowerCase().includes(q) ||
        x.description?.toLowerCase().includes(q) ||
        x.actorName?.toLowerCase().includes(q) ||
        x.action?.toLowerCase().includes(q)
    );
  }

  const total = items.length;
  const logs = items.slice(offset, offset + limit);
  return { logs, total, limit, offset };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization");

  try {
    const remoteUrl = new URL(`${BACKEND_API_URL}/admin/audit-logs`);
    searchParams.forEach((value, key) => {
      remoteUrl.searchParams.set(key, value);
    });

    const res = await fetch(remoteUrl.toString(), {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn("GET /api/admin/audit-logs backend proxy failed, falling back to storage:", err?.message || err);
  }

  const fallback = getFallbackAuditLogs(searchParams);
  return NextResponse.json(fallback);
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  try {
    const remoteUrl = new URL(`${BACKEND_API_URL}/admin/audit-logs`);
    const res = await fetch(remoteUrl.toString(), {
      method: "DELETE",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn("DELETE /api/admin/audit-logs proxy failed:", err?.message || err);
  }

  // Fallback clear
  try {
    const persistentFile = "C:\\ESP_DATA\\live\\data\\audit_logs.json";
    if (fs.existsSync(persistentFile)) {
      fs.writeFileSync(persistentFile, JSON.stringify([], null, 2), "utf-8");
    }
  } catch {}

  return NextResponse.json({
    success: true,
    deletedCount: 0,
    message: "تمامی لاگ‌های سیستم با موفقیت پاکسازی شدند.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    const remoteUrl = new URL(`${BACKEND_API_URL}/admin/audit-logs`);

    const res = await fetch(remoteUrl.toString(), {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }

    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { message: err.detail || "Failed to create audit log" },
      { status: res.status }
    );
  } catch (err: any) {
    console.error("POST /api/admin/audit-logs error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to create audit log" },
      { status: 500 }
    );
  }
}
