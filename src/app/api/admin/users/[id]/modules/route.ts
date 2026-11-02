// src/app/api/admin/users/[id]/modules/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminUserById,
  updateServerUserModules,
} from "@/lib/server/admin-store";
import type { UserModuleAccess } from "@/modules/admin/types/admin.types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const modules: UserModuleAccess[] = Array.isArray(body?.modules) ? body.modules : [];

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

