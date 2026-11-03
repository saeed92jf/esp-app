// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminUserById,
  updateServerAdminUser,
  deleteServerAdminUser,
} from "@/lib/server/admin-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users/${encodeURIComponent(id)}`, {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData);
      }
    } catch {}

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
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        updateServerAdminUser(id, body);
        return NextResponse.json(remoteData);
      }
    } catch {}

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
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        deleteServerAdminUser(id);
        return NextResponse.json(remoteData);
      }
    } catch {}

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
