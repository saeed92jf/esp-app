// src/app/api/esp-coding/generate-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EspCodingStore } from "@/lib/server/esp-coding-store";
import { CodingEngineService } from "@/modules/esp-coding/services/coding-engine.service";

export async function POST(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const body = await req.json();
    const { profileId, versionId, attributes } = body;

    let formulaVersion;
    if (versionId) {
      formulaVersion = EspCodingStore.getVersionById(versionId);
    } else if (profileId) {
      formulaVersion = EspCodingStore.getActiveVersionForProfile(profileId);
    } else {
      // Default fallback to active general production formula
      const profiles = EspCodingStore.getProfiles();
      const defaultProd = profiles.find((p) => p.profileId === "prof_general_production");
      if (defaultProd && defaultProd.activeVersionId) {
        formulaVersion = EspCodingStore.getVersionById(defaultProd.activeVersionId);
      }
    }

    if (!formulaVersion) {
      return NextResponse.json(
        { error: "Applicable formula version not found or not active." },
        { status: 404 }
      );
    }

    // Load registered product codes for uniqueness check
    const existingProducts = EspCodingStore.getRegisteredProducts();
    const existingCodes = existingProducts.map((p) => p.productCode);

    const result = CodingEngineService.generateCode(
      formulaVersion,
      attributes || {},
      existingCodes
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/esp-coding/generate-code error:", err);
    return NextResponse.json(
      { error: err?.message || "Code generation failed" },
      { status: 500 }
    );
  }
}
