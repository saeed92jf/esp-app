// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerProjects,
  createServerProject,
} from "@/lib/server/projects-tasks-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organization = searchParams.get("organization") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const projects = getServerProjects({ organization, status, search });
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

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Project title is required" },
        { status: 400 }
      );
    }
    if (!body.clientName || !body.clientName.trim()) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }
    if (!body.quotationNumber || !body.quotationNumber.trim()) {
      return NextResponse.json(
        { error: "Quotation number is required" },
        { status: 400 }
      );
    }

    const created = createServerProject(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
