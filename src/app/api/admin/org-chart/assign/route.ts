// src/app/api/admin/org-chart/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getServerAdminUsers,
  batchUpdateServerAdminUsers,
} from "@/lib/server/admin-store";
import { resolveOrganizationRole, resolveOrganizationDepartment } from "@/config/organization";
import type { User } from "@/modules/admin/types/admin.types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      department,
      jobTitle,
      role,
      manager,
      directManager,
      managerId,
      autoCascadeSubordinates = true,
    } = body;

    if (!userId || !department || !jobTitle) {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "شناسه کاربر، دپارتمان و سمت شغلی الزامی است." },
        { status: 422 }
      );
    }

    const { data: allUsers } = getServerAdminUsers();
    const targetUser = allUsers.find((u) => u.id === userId);
    if (!targetUser) {
      return NextResponse.json(
        { error_code: "NOT_FOUND", message: `کاربر با شناسه ${userId} یافت نشد.` },
        { status: 404 }
      );
    }

    const roleDef = resolveOrganizationRole(jobTitle, department);
    const isManagerial =
      roleDef.isManagerial ||
      roleDef.level === "management" ||
      roleDef.level === "supervisor" ||
      roleDef.level === "executive" ||
      jobTitle.includes("مدیر") ||
      jobTitle.includes("سرپرست");

    const batchUpdates: Array<{ id: string; updates: Partial<User> }> = [];
    let affectedSubordinatesCount = 0;

    const targetDisplayName = targetUser.name || targetUser.fullNameFa || targetUser.fullName;

    if (isManagerial && autoCascadeSubordinates) {
      // Find all team members in this department (excluding the target manager himself)
      const deptNormalized = department.trim().toLowerCase();
      const departmentMembers = allUsers.filter(
        (u) =>
          u.id !== targetUser.id &&
          (u.department?.trim().toLowerCase() === deptNormalized ||
            u.department?.trim() === department.trim())
      );

      const subordinateIds = departmentMembers.map((m) => m.id);
      affectedSubordinatesCount = subordinateIds.length;

      // 1. Update all department members' direct manager to this new manager
      for (const member of departmentMembers) {
        batchUpdates.push({
          id: member.id,
          updates: {
            manager: targetDisplayName,
            directManager: targetDisplayName,
            managerId: targetUser.id,
          },
        });
      }

      // 2. Update target user
      batchUpdates.push({
        id: targetUser.id,
        updates: {
          department,
          jobTitle,
          role: role || (roleDef.level === "executive" ? "admin" : "manager"),
          manager: manager || targetUser.manager || "مدیر عامل",
          directManager: directManager || manager || targetUser.directManager || "مدیر عامل",
          managerId: managerId || targetUser.managerId,
          subordinates: subordinateIds,
        },
      });
    } else {
      // Specialist/Staff Assignment
      // Find active manager of this department if not provided
      let effectiveManagerName = manager || directManager;
      let effectiveManagerId = managerId;

      if (!effectiveManagerName) {
        const deptNormalized = department.trim().toLowerCase();
        const activeDeptManager = allUsers.find(
          (u) =>
            u.id !== targetUser.id &&
            u.department?.trim().toLowerCase() === deptNormalized &&
            (u.jobTitle?.includes("مدیر") || u.jobTitle?.includes("سرپرست"))
        );
        if (activeDeptManager) {
          effectiveManagerName = activeDeptManager.name || activeDeptManager.fullNameFa || activeDeptManager.fullName;
          effectiveManagerId = activeDeptManager.id;
        } else {
          effectiveManagerName = "مدیر دپارتمان";
        }
      }

      // Update target user
      batchUpdates.push({
        id: targetUser.id,
        updates: {
          department,
          jobTitle,
          role: role || targetUser.role || "user",
          manager: effectiveManagerName,
          directManager: effectiveManagerName,
          managerId: effectiveManagerId,
        },
      });

      // If manager user exists, add target user to their subordinates
      if (effectiveManagerId) {
        const managerUser = allUsers.find((u) => u.id === effectiveManagerId);
        if (managerUser) {
          const currentSubs = new Set(managerUser.subordinates || []);
          currentSubs.add(targetUser.id);
          batchUpdates.push({
            id: managerUser.id,
            updates: {
              subordinates: Array.from(currentSubs),
            },
          });
        }
      }
    }

    const { updatedUsers } = batchUpdateServerAdminUsers(batchUpdates);

    return NextResponse.json({
      success: true,
      message: `سمت «${jobTitle}» با موفقیت برای «${targetDisplayName}» ثبت شد.`,
      isManagerial,
      affectedSubordinatesCount,
      updatedUsers,
    });
  } catch (err: any) {
    console.error("POST /api/admin/org-chart/assign error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "خطا در انتصاب سمت سازمانی" },
      { status: 500 }
    );
  }
}
