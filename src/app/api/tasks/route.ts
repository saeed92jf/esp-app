// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerTasks,
  createServerTask,
} from "@/lib/server/projects-tasks-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const company = searchParams.get("company") || undefined;
    const status = searchParams.get("status") || undefined;
    const scope = searchParams.get("scope") || undefined;
    const search = searchParams.get("search") || undefined;

    const tasks = getServerTasks({
      projectId,
      company,
      status,
      scope,
      search,
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

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

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
