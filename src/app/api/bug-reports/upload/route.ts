// src/app/api/bug-reports/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "bug_attachments");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const authHeader = req.headers.get("authorization");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Try FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/bug-reports/upload`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: formData,
        signal: AbortSignal.timeout(15000),
      });

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch {}

    // Fallback: Local Next.js storage in public/uploads/bug_attachments
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const safeName = `${fileId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json(
      {
        id: fileId,
        fileName: file.name,
        fileUrl: `/uploads/bug_attachments/${safeName}`,
        fileSize: buffer.length,
        contentType: file.type || "application/octet-stream",
        uploadedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/bug-reports/upload error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload attachment" },
      { status: 500 }
    );
  }
}

