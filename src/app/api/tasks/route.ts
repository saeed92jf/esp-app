// src/app/api/tasks/route.ts
// Proxy to FastAPI backend for tasks management
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import {
  getServerTasks,
  createServerTask,
} from "@/lib/server/projects-tasks-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assigneeId = searchParams.get("assignee_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const search = searchParams.get("search") || undefined;
    const company = searchParams.get("company") || undefined;
    const authHeader = req.headers.get("authorization");

    // Try FastAPI backend first
    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/tasks`);
      if (assigneeId) remoteUrl.searchParams.set("assignee_id", assigneeId);
      if (status) remoteUrl.searchParams.set("status", status);
      if (priority) remoteUrl.searchParams.set("priority", priority);
      if (search) remoteUrl.searchParams.set("search", search);
      if (company) remoteUrl.searchParams.set("company", company);

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
      // Fallback to in-memory store
    }

    // Fallback: in-memory store
    const tasks = getServerTasks({
      status,
    });
    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch tasks" },
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
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/tasks`, {
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
        { error: errData.detail || "Failed to create task" },
        { status: remoteRes.status }
      );
    } catch {
      // Fallback
    }

    // Fallback: in-memory store
    const created = createServerTask(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
