
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "diagrams", "manifest");

    if (!fs.existsSync(dir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Failed to list preset diagrams:", error);
    return NextResponse.json({ files: [], error: "Failed to read diagrams folder" }, { status: 500 });
  }
}
