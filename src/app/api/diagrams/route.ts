// src/app/api/diagrams/route.ts
// Recursively lists every .json diagram file under /public/diagrams (in any
// subfolder) so the claude-flow Toolbar can offer them as loadable templates
// in its combobox. Returned paths are relative to public/diagrams and are
// exactly what you append to "/diagrams/" to fetch the file itself, since
// everything under /public is already served statically by Next.js.
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT_DIR = path.join(process.cwd(), "public", "diagrams");

function collectJsonFiles(dir: string, baseDir: string): string[] {
  let results: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectJsonFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      // Relative path with forward slashes regardless of OS (Windows path.sep is "\").
      const relative = path.relative(baseDir, fullPath).split(path.sep).join("/");
      results.push(relative);
    }
  }
  return results;
}

export async function GET() {
  try {
    if (!fs.existsSync(ROOT_DIR)) {
      return NextResponse.json({ files: [] });
    }
    const files = collectJsonFiles(ROOT_DIR, ROOT_DIR).sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Failed to list diagram templates:", error);
    return NextResponse.json({ files: [], error: "Failed to read public/diagrams" }, { status: 500 });
  }
}
