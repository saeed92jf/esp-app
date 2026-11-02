// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminUserById,
  updateServerAdminUser,
  deleteServerAdminUser,
} from "@/lib/server/admin-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getServerAdminUserById(id);

    if (!user) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `کاربر با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (err: any) {
    console.error("GET /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateServerAdminUser(id, body);
    if (!updated) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `کاربر با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = deleteServerAdminUser(id);

    if (!ok) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `کاربر با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "کاربر با موفقیت حذف گردید." });
  } catch (err: any) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

