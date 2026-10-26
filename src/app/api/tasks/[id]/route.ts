// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
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
    const task = getServerTaskById(id);
    if (!task) {
      return NextResponse.json(
        { error: `Task not found: ${id}` },
        { status: 404 }
      );
    }
    return NextResponse.json(task);
  } catch (err: any) {
    console.error("GET /api/tasks/:id error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateServerTask(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: `Task not found: ${id}` },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/tasks/:id error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const success = deleteServerTask(id);
    if (!success) {
      return NextResponse.json(
        { error: `Task not found: ${id}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/tasks/:id error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete task" },
      { status: 500 }
    );
  }
}
