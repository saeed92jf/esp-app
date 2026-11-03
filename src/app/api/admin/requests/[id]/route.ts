// src/app/api/admin/requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminRequestById,
  updateServerAdminRequest,
  deleteServerAdminRequest,
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
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests/${encodeURIComponent(id)}`, {
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

    const item = getServerAdminRequestById(id);

    if (!item) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (err: any) {
    console.error("GET /api/admin/requests/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests/${encodeURIComponent(id)}`, {
        method: "PUT",
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
        updateServerAdminRequest(id, body);
        return NextResponse.json(remoteData);
      }
    } catch {}

    const updated = updateServerAdminRequest(id, body);
    if (!updated) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error("PUT /api/admin/requests/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        deleteServerAdminRequest(id);
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData);
      }
    } catch {
      // Fallback transparently to server store
    }

    const deleted = deleteServerAdminRequest(id);
    if (!deleted) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "درخواست با موفقیت از صف حذف شد." });
  } catch (err: any) {
    console.error("DELETE /api/admin/requests/[id] error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

