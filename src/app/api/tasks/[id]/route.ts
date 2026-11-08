// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import {
  getServerTaskById,
  updateServerTask,
  deleteServerTask,
} from "@/lib/server/projects-tasks-store";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const authHeader = _req.headers.get("authorization");

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/${id}`, {
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
      if (remoteRes.status === 404) {
        return NextResponse.json({ error: `Task not found: ${id}` }, { status: 404 });
      }
    } catch {
      // Fallback
    }

    const task = getServerTaskById(id);
    if (!task) {
      return NextResponse.json({ error: `Task not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (err: any) {
    console.error("GET /api/tasks/:id error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    const updated = updateServerTask(id, body);
    if (!updated) {
      return NextResponse.json({ error: `Task not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update task" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    const updated = updateServerTask(id, body);
    if (!updated) {
      return NextResponse.json({ error: `Task not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const authHeader = _req.headers.get("authorization");

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        signal: AbortSignal.timeout(4000),
      });
      if (remoteRes.ok) {
        return NextResponse.json({ success: true });
      }
    } catch {
      // Fallback
    }

    const success = deleteServerTask(id);
    if (!success) {
      return NextResponse.json({ error: `Task not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete task" }, { status: 500 });
  }
}
