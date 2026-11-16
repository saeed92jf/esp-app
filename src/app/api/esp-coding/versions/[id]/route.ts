// src/app/api/esp-coding/versions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EspCodingStore } from "@/lib/server/esp-coding-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    EspCodingStore.ensureInitialized();
    const { id } = await params;
    const version = EspCodingStore.getVersionById(id);

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json({ version });
  } catch (err: any) {
    console.error("GET /api/esp-coding/versions/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch version" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    EspCodingStore.ensureInitialized();
    const { id } = await params;
    const body = await req.json();
    const { segments, separator, customSeparator, descriptionEn, descriptionFa, userId, userName, userRole } = body;

    const versions = EspCodingStore.getVersions();
    const idx = versions.findIndex((v) => v.versionId === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const current = versions[idx];
    if (current.status !== "draft" && current.status !== "revision_requested") {
      return NextResponse.json(
        {
          error: `Cannot modify a version in status '${current.status}'. Only 'draft' or 'revision_requested' can be edited. Create a new version instead.`,
        },
        { status: 400 }
      );
    }

    const updated = {
      ...current,
      segments: segments !== undefined ? segments : current.segments,
      separator: separator !== undefined ? separator : current.separator,
      customSeparator: customSeparator !== undefined ? customSeparator : current.customSeparator,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : current.descriptionEn,
      descriptionFa: descriptionFa !== undefined ? descriptionFa : current.descriptionFa,
    };

    versions[idx] = updated;
    EspCodingStore.saveVersions(versions);

    EspCodingStore.logAudit({
      id: `audit_${Date.now()}`,
      action: "formula_updated",
      entityType: "formula",
      entityId: id,
      userId: userId || "SYSTEM",
      userName: userName || "User",
      userRole: userRole || "user",
      timestamp: new Date().toISOString(),
      detailsEn: `Updated formula segments/configuration for version ${updated.versionNumber}`,
      detailsFa: `پیکربندی و بخش‌های نسخه ${updated.versionNumber} فرمول به‌روزرسانی شد.`,
    });

    return NextResponse.json({ success: true, version: updated });
  } catch (err: any) {
    console.error("PUT /api/esp-coding/versions/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update version" },
      { status: 500 }
    );
  }
}
