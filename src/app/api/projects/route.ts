// src/app/api/projects/route.ts
// Proxy to FastAPI backend for projects management with fallback
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import {
  getServerProjects,
  createServerProject,
} from "@/lib/server/projects-tasks-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const client = searchParams.get("client") || undefined;
    const search = searchParams.get("search") || undefined;
    const authHeader = req.headers.get("authorization");

    // Try FastAPI backend first
    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/projects`);
      if (status) remoteUrl.searchParams.set("status", status);
      if (category) remoteUrl.searchParams.set("category", category);
      if (client) remoteUrl.searchParams.set("client", client);
      if (search) remoteUrl.searchParams.set("search", search);

      const remoteRes = await fetch(remoteUrl.toString(), {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    // Fallback: in-memory store
    const projects = getServerProjects({ status, search });
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    const projectName = body.name || body.title;
    if (!projectName || !projectName.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data, { status: 201 });
      }
      const errData = await remoteRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.detail || "Failed to create project" },
        { status: remoteRes.status }
      );
    } catch {
      // Fallback
    }

    // Fallback: in-memory store
    const created = createServerProject({
      ...body,
      title: projectName,
      clientName: body.client || body.clientName || "کارفرما",
      quotationNumber: body.espNumber || body.quotationNumber || `ESP-${Date.now()}`,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
