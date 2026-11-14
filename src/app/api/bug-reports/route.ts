// src/app/api/bug-reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import {
  getServerBugReports,
  createServerBugReport,
} from "@/lib/server/bug-reports-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const category = searchParams.get("category") || undefined;
    const moduleId = searchParams.get("moduleId") || undefined;
    const reporterId = searchParams.get("reporterId") || undefined;
    const assigneeId = searchParams.get("assigneeId") || undefined;
    const search = searchParams.get("search") || undefined;
    const authHeader = req.headers.get("authorization");

    // Try FastAPI backend first
    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/bug-reports`);
      if (status) remoteUrl.searchParams.set("status", status);
      if (severity) remoteUrl.searchParams.set("severity", severity);
      if (priority) remoteUrl.searchParams.set("priority", priority);
      if (category) remoteUrl.searchParams.set("category", category);
      if (moduleId) remoteUrl.searchParams.set("moduleId", moduleId);
      if (reporterId) remoteUrl.searchParams.set("reporterId", reporterId);
      if (assigneeId) remoteUrl.searchParams.set("assigneeId", assigneeId);
      if (search) remoteUrl.searchParams.set("search", search);

      const remoteRes = await fetch(remoteUrl.toString(), {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(3000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {}

    // Fallback: Local server store
    const reports = getServerBugReports({
      status,
      severity,
      priority,
      category,
      moduleId,
      reporterId,
      assigneeId,
      search,
    });
    return NextResponse.json(reports);
  } catch (err: any) {
    console.error("GET /api/bug-reports error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch bug reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Bug report title is required" },
        { status: 400 }
      );
    }
    if (!body.description || !body.description.trim()) {
      return NextResponse.json(
        { error: "Bug report description is required" },
        { status: 400 }
      );
    }

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/bug-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const created = await remoteRes.json();
        // Also sync local store
        createServerBugReport(body);
        return NextResponse.json(created, { status: 201 });
      }
    } catch {}

    // Fallback: Local server store
    const created = createServerBugReport(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/bug-reports error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create bug report" },
      { status: 500 }
    );
  }
}

