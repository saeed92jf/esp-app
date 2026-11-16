// src/app/api/esp-coding/audit-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EspCodingStore } from "@/lib/server/esp-coding-store";

export async function GET(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const logs = EspCodingStore.getAuditLogs();
    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("GET /api/esp-coding/audit-logs error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
