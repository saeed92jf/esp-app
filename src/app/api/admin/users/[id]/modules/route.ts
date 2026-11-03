// src/app/api/admin/users/[id]/modules/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminUserById,
  updateServerUserModules,
} from "@/lib/server/admin-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import type { UserModuleAccess } from "@/modules/admin/types/admin.types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    const modules: UserModuleAccess[] = Array.isArray(body?.modules) ? body.modules : [];

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users/${encodeURIComponent(id)}/modules`, {
        method: "PUT",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ modules }),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        updateServerUserModules(id, modules);
        return NextResponse.json(remoteData);
      }
    } catch {}

    const updated = updateServerUserModules(id, modules);
    if (!updated) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `کاربر با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "دسترسی ماژول‌های کاربر با موفقیت به‌روزرسانی شد.",
      data: updated,
    });
  } catch (err: any) {
    console.error("PUT /api/admin/users/[id]/modules error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
