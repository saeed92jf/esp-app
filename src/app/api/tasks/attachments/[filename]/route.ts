// src/app/api/tasks/attachments/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

interface Context {
  params: Promise<{ filename: string }>;
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { filename } = await params;
    const remoteRes = await fetch(
      `${BACKEND_API_URL}/tasks/attachments/${encodeURIComponent(filename)}`,
      {
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!remoteRes.ok) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: remoteRes.status }
      );
    }

    const contentType = remoteRes.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = remoteRes.headers.get("content-disposition");
    const buffer = await remoteRes.arrayBuffer();

    const isInline =
      contentType.startsWith("image/") ||
      contentType === "application/pdf" ||
      contentType.startsWith("text/");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    };
    if (isInline) {
      headers["Content-Disposition"] = "inline";
    } else if (contentDisposition) {
      headers["Content-Disposition"] = contentDisposition;
    }

    return new NextResponse(buffer, { headers });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load attachment" },
      { status: 500 }
    );
  }
}

export async function HEAD(req: NextRequest, { params }: Context) {
  return GET(req, { params });
}
