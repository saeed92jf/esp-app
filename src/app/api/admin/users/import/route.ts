// src/app/api/admin/users/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import type { User } from "@/modules/admin/types/admin.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIVE_DATA_PATH = "C:\\ESP_DATA\\live\\data\\admin_users.json";
const BACKEND_DATA_PATH = path.resolve(process.cwd(), "../ESP-Web-Backend/app/data/admin_users.json");

function readDiskUsers(): User[] {
  // 1. Try Live Production Path
  try {
    if (fs.existsSync(LIVE_DATA_PATH)) {
      const raw = fs.readFileSync(LIVE_DATA_PATH, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}

  // 2. Try globalThis
  if (globalThis.__espServerAdminUsers && globalThis.__espServerAdminUsers.length > 0) {
    return [...globalThis.__espServerAdminUsers];
  }

  // 3. Try Backend Data Path
  try {
    if (fs.existsSync(BACKEND_DATA_PATH)) {
      const raw = fs.readFileSync(BACKEND_DATA_PATH, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}

  return [];
}

function persistDiskUsers(users: User[]): void {
  const content = JSON.stringify(users, null, 2);

  // 1. Live Production Path
  try {
    const dir = path.dirname(LIVE_DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LIVE_DATA_PATH, content, "utf-8");
  } catch (err) {
    console.warn("Failed to write to live data path:", err);
  }



  // 3. Backend Data
  try {
    if (fs.existsSync(path.dirname(BACKEND_DATA_PATH))) {
      fs.writeFileSync(BACKEND_DATA_PATH, content, "utf-8");
    }
  } catch {}

  // Update in-memory
  globalThis.__espServerAdminUsers = users;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const importedItems: Partial<User>[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.users)
      ? body.users
      : Array.isArray(body?.data)
      ? body.data
      : [];

    if (!importedItems || importedItems.length === 0) {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "لیست پرسنل جهت ایمپورت خالی است." },
        { status: 422 }
      );
    }

    const authHeader = req.headers.get("authorization");

    // 1. Try remote FastAPI backend first
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/admin/users/import`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ users: importedItems }),
        signal: AbortSignal.timeout(6000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        // Also persist returned data into local cache and disk
        if (remoteData?.data && Array.isArray(remoteData.data)) {
          persistDiskUsers(remoteData.data);
        }
        return NextResponse.json(remoteData, {
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        });
      }
    } catch {
      // Backend offline or unreachable: fall back to local direct databank persistence
    }

    // 2. Direct local file synchronization
    const existingUsers = readDiskUsers();
    let createdCount = 0;
    let updatedCount = 0;

    for (const item of importedItems) {
      if (!item || typeof item !== "object") continue;
      const email = (item.email || "").trim().toLowerCase();
      const uId = (item.id || "").trim();
      const natId = (String(item.nationalId || "")).trim();
      const empId = (String(item.personnelCode || item.employeeId || "")).trim();

      // Find match
      let matchIdx = -1;
      for (let i = 0; i < existingUsers.length; i++) {
        const u = existingUsers[i];
        if (uId && u.id === uId) { matchIdx = i; break; }
        if (email && (u.email || "").trim().toLowerCase() === email) { matchIdx = i; break; }
        if (natId && String(u.nationalId || "").trim() === natId) { matchIdx = i; break; }
        if (empId && String(u.personnelCode || u.employeeId || "").trim() === empId) { matchIdx = i; break; }
      }

      if (matchIdx !== -1) {
        // Merge
        const existing = existingUsers[matchIdx];
        const cleaned: Record<string, any> = {};
        for (const [k, v] of Object.entries(item)) {
          if (v !== undefined && v !== "") cleaned[k] = v;
        }
        existingUsers[matchIdx] = {
          ...existing,
          ...cleaned,
          id: existing.id, // Preserve original ID
          password: cleaned.password || existing.password, // Preserve password
        };
        updatedCount++;
      } else {
        // Create new
        const prefix = email ? email.split("@")[0].replace(/[^\w]/g, "") : Math.random().toString(36).substring(2, 8);
        const newId = uId || `u-${prefix}`;
        const newUser: User = {
          id: newId,
          name: item.fullNameFa || item.name || item.fullName || "کاربر جدید",
          email: email || `${newId}@euroslotpars.com`,
          role: item.role || "staff",
          status: "offline",
          accountStatus: item.accountStatus || "active",
          isProfileCompleted: true,
          adminApproved: true,
          managerApproved: true,
          hrApproved: true,
          joinedAt: item.joinedAt || item.employmentDate || new Date().toISOString().slice(0, 10),
          ...item,
        };
        existingUsers.push(newUser);
        createdCount++;
      }
    }

    persistDiskUsers(existingUsers);

    return NextResponse.json({
      success: true,
      total: existingUsers.length,
      created: createdCount,
      updated: updatedCount,
      data: existingUsers,
      users: existingUsers,
    });
  } catch (err: any) {
    console.error("POST /api/admin/users/import error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "Failed to import personnel" },
      { status: 500 }
    );
  }
}
