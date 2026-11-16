// src/app/api/esp-coding/approvals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EspCodingStore } from "@/lib/server/esp-coding-store";
import { CodingFormulaVersion } from "@/modules/esp-coding/types";

export async function GET(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let versions = EspCodingStore.getVersions();
    if (status) {
      versions = versions.filter((v) => v.status === status);
    }

    const profiles = EspCodingStore.getProfiles();

    return NextResponse.json({
      versions,
      profiles,
    });
  } catch (err: any) {
    console.error("GET /api/esp-coding/approvals error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch approval versions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const body = await req.json();
    const {
      versionId,
      action, // "submit" | "approve" | "activate" | "reject" | "return_revision" | "deactivate" | "rollback" | "archive"
      reason,
      userRole,
      userId,
      userName,
    } = body;

    if (!versionId || !action) {
      return NextResponse.json(
        { error: "versionId and action are required" },
        { status: 400 }
      );
    }

    const versions = EspCodingStore.getVersions();
    const versionIndex = versions.findIndex((v) => v.versionId === versionId);
    if (versionIndex === -1) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const version = { ...versions[versionIndex] };
    const now = new Date().toISOString();
    const profiles = EspCodingStore.getProfiles();
    const profileIndex = profiles.findIndex((p) => p.profileId === version.profileId);

    // ========================================================
    // STRICT SUPERADMIN AUTHORIZATION GATE FOR PRIVILEGED ACTIONS
    // ========================================================
    const superAdminActions = ["approve", "activate", "deactivate", "rollback", "archive"];
    if (superAdminActions.includes(action)) {
      if (userRole !== "superadmin") {
        return NextResponse.json(
          {
            error:
              "UNAUTHORIZED: Only users with the SUPERADMIN role can approve, activate, rollback, or archive formulas.",
          },
          { status: 403 }
        );
      }
    }

    switch (action) {
      case "submit":
        if (version.status !== "draft" && version.status !== "tested") {
          return NextResponse.json(
            { error: `Cannot submit formula with status ${version.status}` },
            { status: 400 }
          );
        }
        version.status = "pending_approval";
        version.submittedBy = userName || userId || "User";
        version.submittedAt = now;
        break;

      case "approve":
        if (version.status !== "pending_approval") {
          return NextResponse.json(
            { error: "Only versions in 'pending_approval' can be approved." },
            { status: 400 }
          );
        }
        version.status = "approved";
        version.approvedBy = userName || userId || "Super Admin";
        version.approvedAt = now;
        break;

      case "activate":
        // Rule: Can activate if approved, or superadmin can direct-activate
        if (version.status !== "approved" && version.status !== "pending_approval") {
          return NextResponse.json(
            { error: "Formula must be approved before activation." },
            { status: 400 }
          );
        }

        // Archive or supersede any currently active version for this profile
        versions.forEach((v) => {
          if (v.profileId === version.profileId && v.status === "active") {
            v.status = "archived";
          }
        });

        version.status = "active";
        version.activatedBy = userName || userId || "Super Admin";
        version.activatedAt = now;
        version.activationReason = reason || "Explicit Super Admin activation";

        // Update profile pointer
        if (profileIndex !== -1) {
          profiles[profileIndex].activeVersionId = version.versionId;
          profiles[profileIndex].updatedAt = now;
        }
        break;

      case "reject":
        version.status = "rejected";
        version.rejectionReason = reason || "Rejected by reviewer";
        version.reviewedBy = userName || userId || "Reviewer";
        version.reviewedAt = now;
        break;

      case "return_revision":
        version.status = "revision_requested";
        version.rejectionReason = reason || "Returned for revision";
        version.reviewedBy = userName || userId || "Reviewer";
        version.reviewedAt = now;
        break;

      case "deactivate":
        if (version.status === "active") {
          version.status = "archived";
          if (profileIndex !== -1 && profiles[profileIndex].activeVersionId === version.versionId) {
            profiles[profileIndex].activeVersionId = null;
          }
        }
        break;

      case "rollback": {
        // Rollback to this version: activate this version
        versions.forEach((v) => {
          if (v.profileId === version.profileId && v.status === "active") {
            v.status = "archived";
          }
        });
        version.status = "active";
        version.activatedBy = userName || userId || "Super Admin";
        version.activatedAt = now;
        version.activationReason = `Rollback to version ${version.versionNumber}: ${reason || "No reason specified"}`;

        if (profileIndex !== -1) {
          profiles[profileIndex].activeVersionId = version.versionId;
          profiles[profileIndex].updatedAt = now;
        }
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    versions[versionIndex] = version;
    EspCodingStore.saveVersions(versions);
    if (profileIndex !== -1) {
      EspCodingStore.saveProfiles(profiles);
    }

    EspCodingStore.logAudit({
      id: `audit_${Date.now()}`,
      action: `formula_${action}` as any,
      entityType: "formula",
      entityId: version.versionId,
      userId: userId || "SYSTEM",
      userName: userName || "Super Admin",
      userRole: userRole || "superadmin",
      timestamp: now,
      detailsEn: `Formula version ${version.versionNumber} action: ${action}`,
      detailsFa: `عملیات ${action} بر روی نسخه ${version.versionNumber} فرمول اعمال شد.`,
      reason,
    });

    return NextResponse.json({
      success: true,
      version,
      profiles,
    });
  } catch (err: any) {
    console.error("POST /api/esp-coding/approvals error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process formula approval action" },
      { status: 500 }
    );
  }
}
