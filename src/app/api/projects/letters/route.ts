// src/app/api/projects/letters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { getServerLetters } from "@/lib/server/projects-tasks-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const projectId = searchParams.get("projectId") || searchParams.get("project_id") || undefined;
    const search = searchParams.get("search") || undefined;
    const authHeader = req.headers.get("authorization");

    // Try backend first
    try {
      const remoteUrl = new URL(`${BACKEND_API_URL}/projects/letters`);
      if (status) remoteUrl.searchParams.set("status", status);
      if (projectId) remoteUrl.searchParams.set("project_id", projectId);
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

    const letters = getServerLetters({ status, projectId, search });
    return NextResponse.json(letters);
  } catch (err: any) {
    console.error("GET /api/projects/letters error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch letters" },
      { status: 500 }
    );
  }
}
