// src/app/api/admin/requests/[id]/approve-dispatch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approveServerAdminRequestDispatch } from "@/lib/server/admin-store";
import { BACKEND_API_URL } from "@/lib/server/backend-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");

    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/requests/${encodeURIComponent(id)}/approve-dispatch`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        approveServerAdminRequestDispatch(id, body);
        return NextResponse.json(remoteData, {
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        });
      }
    } catch (remoteErr) {
      console.warn("Backend /approve-dispatch failed or timed out, falling back to local store:", remoteErr);
    }

    const result = approveServerAdminRequestDispatch(id, {
      assignedUserId: body?.assignedUserId || body?.assigned_user_id,
      emailTo: body?.emailTo || body?.email_to,
      emailSubject: body?.emailSubject || body?.email_subject,
      emailBody: body?.emailBody || body?.email_body,
      managerNote: body?.managerNote || body?.manager_note,
      priority: body?.priority,
    });

    if (!result) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `درخواست با شناسه ${id} یافت نشد.` },
        { status: 404 }
      );
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: any) {
    console.error("POST /api/admin/requests/[id]/approve-dispatch error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to dispatch request" },
      { status: 500 }
    );
  }
}
