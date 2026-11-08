// src/app/api/tasks/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const authHeader = req.headers.get("authorization");

    const remoteRes = await fetch(`${BACKEND_API_URL}/tasks/upload`, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
      signal: AbortSignal.timeout(120000), // 2 minutes for large files
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data, { status: 201 });
    }

    const errData = await remoteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.detail || "Failed to upload file" },
      { status: remoteRes.status }
    );
  } catch (err: any) {
    console.error("POST /api/tasks/upload error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload task attachment" },
      { status: 500 }
    );
  }
}
