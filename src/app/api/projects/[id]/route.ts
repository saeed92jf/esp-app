// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import {
  getServerProjectById,
  updateServerProject,
  deleteServerProject,
} from "@/lib/server/projects-tasks-store";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    // Try FastAPI first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/projects/${id}`, {
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
        return NextResponse.json({ error: `Project not found: ${id}` }, { status: 404 });
      }
    } catch {
      // Fallback
    }

    const project = getServerProjectById(id);
    if (!project) {
      return NextResponse.json({ error: `Project not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (err: any) {
    console.error("GET /api/projects/:id error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    // Try FastAPI first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    const updated = updateServerProject(id, body);
    if (!updated) {
      return NextResponse.json({ error: `Project not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/projects/:id error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update project" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Context) {
  return PATCH(req, ctx);
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    // Try FastAPI first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/projects/${id}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        return NextResponse.json({ success: true, deleted_id: id });
      }
    } catch {
      // Fallback
    }

    const success = deleteServerProject(id);
    if (!success) {
      return NextResponse.json({ error: `Project not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/projects/:id error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete project" }, { status: 500 });
  }
}
