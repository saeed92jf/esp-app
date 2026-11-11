"use client";

import React from "react";
import { useLocale } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin";
import { AdminAuditLogsView } from "../AdminAuditLogsView";

export function AdminAuditLogsSection() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { currentUser, isSuperAdmin } = useAdmin();

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-[420px] p-6">
        <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center border border-border/40 shadow-xs">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-lg font-bold mb-2">
            {isRtl ? "عدم دسترسی به لاگ‌های سیستم" : "Access Restricted"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isRtl
              ? "مشاهده لاگ‌های امنیتی و رویدادهای سیستم منحصراً در اختیار مدیر ارشد (Super Admin) می‌باشد."
              : "Viewing system security logs and events is strictly restricted to Super Admin."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1">
      <AdminAuditLogsView currentUser={currentUser} />
    </div>
  );
}
