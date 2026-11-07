// src/app/api/customers/upload-logo/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), "public", "customers", "logos");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const ext = path.extname(file.name) || ".png";
    const safeName = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    await fs.writeFile(filePath, buffer);

    const logoUrl = `/customers/logos/${safeName}`;
    return NextResponse.json({ url: logoUrl, fileName: safeName }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/customers/upload-logo error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}

