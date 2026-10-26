// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerProjectById,
  updateServerProject,
  deleteServerProject,
} from "@/lib/server/projects-tasks-store";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const project = getServerProjectById(id);
    if (!project) {
      return NextResponse.json(
        { error: `Project not found: ${id}` },
        { status: 404 }
      );
    }
    return NextResponse.json(project);
  } catch (err: any) {
    console.error("GET /api/projects/:id error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateServerProject(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: `Project not found: ${id}` },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/projects/:id error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const success = deleteServerProject(id);
    if (!success) {
      return NextResponse.json(
        { error: `Project not found: ${id}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/projects/:id error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
