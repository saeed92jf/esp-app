// src/app/api/datasheet-ai/documents/[id]/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const remoteUrl = new URL(`${BACKEND_API_URL}/datasheet-ai/documents/${id}/export`);
    remoteUrl.searchParams.set("format", format);

    const res = await fetch(remoteUrl.toString(), {
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      if (format === "csv") {
        const csvContent = await res.text();
        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename=datasheet_${id}_specs.csv`,
          },
        });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Export failed" }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Export error" }, { status: 500 });
  }
}

