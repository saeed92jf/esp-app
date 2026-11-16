// src/app/api/esp-coding/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EspCodingStore } from "@/lib/server/esp-coding-store";

export async function GET(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const profiles = EspCodingStore.getProfiles();
    const versions = EspCodingStore.getVersions();

    return NextResponse.json({
      profiles,
      versions,
    });
  } catch (err: any) {
    console.error("GET /api/esp-coding/profiles error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch formula profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const body = await req.json();
    const { nameEn, nameFa, targetEntity, applicableScope, userRole, userName, userId } = body;

    if (!nameEn || !nameFa) {
      return NextResponse.json(
        { error: "Profile name in English and Persian is required" },
        { status: 400 }
      );
    }

    const profiles = EspCodingStore.getProfiles();
    const newProfileId = `prof_${Date.now()}`;
    const initialVersionId = `ver_${Date.now()}_1_0`;
    const now = new Date().toISOString();

    const newProfile = {
      profileId: newProfileId,
      nameEn,
      nameFa,
      targetEntity: targetEntity || "product",
      applicableScope: applicableScope || "general",
      activeVersionId: null,
      latestVersionId: initialVersionId,
      versionsCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    const initialVersion = {
      versionId: initialVersionId,
      profileId: newProfileId,
      versionNumber: "1.0",
      status: "draft" as const,
      separator: "none" as const,
      targetEntity: targetEntity || "product",
      descriptionEn: `Initial draft for ${nameEn}`,
      descriptionFa: `پیش‌نویس اولیه برای ${nameFa}`,
      segments: [],
      createdBy: userName || userId || "USER",
      createdAt: now,
    };

    profiles.push(newProfile);
    const versions = EspCodingStore.getVersions();
    versions.push(initialVersion);

    EspCodingStore.saveProfiles(profiles);
    EspCodingStore.saveVersions(versions);

    EspCodingStore.logAudit({
      id: `audit_${Date.now()}`,
      action: "formula_created",
      entityType: "formula",
      entityId: initialVersionId,
      userId: userId || "ANONYMOUS",
      userName: userName || "User",
      userRole: userRole || "user",
      timestamp: now,
      detailsEn: `Created formula profile ${nameEn} with initial draft v1.0`,
      detailsFa: `پروفایل فرمول ${nameFa} با نسخه پیش‌نویس ۱.۰ ایجاد شد.`,
    });

    return NextResponse.json({
      profile: newProfile,
      version: initialVersion,
    });
  } catch (err: any) {
    console.error("POST /api/esp-coding/profiles error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create formula profile" },
      { status: 500 }
    );
  }
}
