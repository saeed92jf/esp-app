"use client";

import React, { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Lock,
  ShieldAlert,
  KeyRound,
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { api } from "@/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProtectedModuleDef {
  id: string;
  href: string;
  nameFa: string;
  nameEn: string;
  adminOnly?: boolean;
}

const PROTECTED_MODULES: ProtectedModuleDef[] = [
  {
    id: "admin",
    href: "/admin",
    nameFa: "پنل مدیریت سیستم",
    nameEn: "Admin Panel",
    adminOnly: true,
  },
  {
    id: "community",
    href: "/community",
    nameFa: "تالار گفتگوی تخصصی",
    nameEn: "Community",
  },
  {
    id: "projects",
    href: "/projects",
    nameFa: "مدیریت پروژه‌ها",
    nameEn: "Projects",
  },
  {
    id: "tasks",
    href: "/tasks",
    nameFa: "مدیریت وظایف",
    nameEn: "Tasks",
  },
  {
    id: "ESP-Flow",
    href: "/ESP-Flow",
    nameFa: "سامانه محاسباتی ESP-Flow",
    nameEn: "ESP-Flow System",
  },
  {
    id: "datasheet-ai",
    href: "/datasheet-ai",
    nameFa: "سامانه استخراج هوشمند دیتاشیت (Datasheet AI)",
    nameEn: "Datasheet AI",
  },
  {
    id: "dashboard",
    href: "/dashboard",
    nameFa: "داشبورد سازمانی",
    nameEn: "Dashboard",
  },
];

export function ModuleAccessGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user, loading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestedModules, setRequestedModules] = useState<Record<string, boolean>>({});

  // Match current route to a protected module
  const matchedModule = useMemo(() => {
    if (!pathname || pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/login") || pathname.startsWith("/profile")) {
      return null;
    }
    return (
      PROTECTED_MODULES.find(
        (m) => pathname === m.href || pathname.startsWith(`${m.href}/`)
      ) || null
    );
  }, [pathname]);

  // Determine if the current user has access
  const hasAccess = useMemo(() => {
    if (!matchedModule) return true;
    if (!user) return true; // Handled by auth-gate / login redirect

    const role = (user.role || "").toLowerCase();
    const isSaeed = Boolean(
      user.id === "u-saeed" ||
      user.id === "usr_9801" ||
      (user.email && (user.email.toLowerCase().includes("jalili") || user.email.toLowerCase() === "s.jalili@euroslotpars.com" || user.email.toLowerCase() === "saeed@euroslotpars.com") && !user.email.toLowerCase().includes("saeedkhani"))
    );
    const isSuperAdmin = role === "superadmin" || isSaeed;
    const isSystemAdmin = role === "admin" || isSuperAdmin;
    const isOfficeAdmin = role === "office_admin";

    // 1. Super Admin ALWAYS has full, unconditional, absolute access to everything
    if (isSuperAdmin) return true;

    // 2. System Admin has full access to all system modules (everything except defining/changing roles)
    if (isSystemAdmin) return true;

    // 3. Office Admin is permitted to access the Admin Panel (/admin) for user management & approvals
    if (matchedModule.id === "admin" || matchedModule.href === "/admin") {
      if (isOfficeAdmin) return true;
      return false;
    }

    // For other admin-only routes, non-admins are never permitted
    if (matchedModule.adminOnly && !isSystemAdmin) {
      return false;
    }

    // Check user's assigned modulesAccess array
    const userModules = user.modulesAccess || [];
    const directAccess = userModules.some(
      (m) =>
        (m.moduleId === matchedModule.id ||
          m.moduleId === matchedModule.href ||
          (matchedModule.id === "datasheet-ai" && m.moduleId === "engineering") ||
          (matchedModule.id === "tasks" && m.moduleId === "projects") ||
          (matchedModule.id === "tasks" && m.moduleId === "projectManagement") ||
          (matchedModule.id === "projects" && m.moduleId === "projectManagement")) &&
        m.hasAccess
    );

    return directAccess;
  }, [matchedModule, user]);

  const handleClose = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    }
  };

  const handleRequestAccess = async () => {
    if (!matchedModule || !user) return;
    try {
      setIsSubmitting(true);
      await api.admin.requestModuleAccess({
        userId: user.id,
        userName: user.fullNameFa || user.name || user.fullName || "کاربر سامانه",
        userEmail: user.email || "",
        moduleId: matchedModule.id,
        moduleName: `${matchedModule.nameFa} (${matchedModule.nameEn})`,
      });

      setRequestedModules((prev) => ({ ...prev, [matchedModule.id]: true }));
      toast.success(
        isRtl
          ? `درخواست دسترسی شما برای «${matchedModule.nameFa}» با موفقیت برای مدیر سیستم ارسال گردید.`
          : `Access request for "${matchedModule.nameEn}" submitted to administrator.`
      );
    } catch (err: any) {
      console.error("Failed to request module access:", err);
      toast.error(err?.message || (isRtl ? "خطا در ثبت درخواست دسترسی" : "Failed to submit request"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !matchedModule || hasAccess) {
    return null;
  }

  const isAlreadyRequested = Boolean(requestedModules[matchedModule.id]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className="w-full max-w-md bg-background border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Icon (Top Corner) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 end-4 size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
          title={isRtl ? "بستن و بازگشت" : "Close and go back"}
        >
          <X className="size-4.5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="size-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
          <Lock className="size-8" />
        </div>

        {/* Module Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 border border-border/60 text-xs font-semibold text-foreground mb-3">
          <Layers className="size-3.5 text-primary" />
          <span>
            {matchedModule.nameFa} · {matchedModule.nameEn}
          </span>
        </div>

        {/* Bilingual Header */}
        <h3 className="text-lg font-bold text-foreground">
          {isRtl ? "عدم دسترسی به این بخش" : "Access Denied"}
        </h3>
        <p className="text-xs font-semibold text-muted-foreground/90 mt-0.5" dir="ltr">
          {isRtl ? "Access Denied / Unauthorized" : "عدم دسترسی به این بخش"}
        </p>

        {/* Bilingual Body Explanation */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/40 text-xs leading-relaxed space-y-2">
          <p className="text-foreground/90 font-medium">
            شما به این بخش دسترسی ندارید. برای مشاهده یا استفاده از این ماژول، می‌توانید درخواست دسترسی خود را برای مدیر سیستم ارسال نمایید.
          </p>
          <p className="text-muted-foreground text-[11px]" dir="ltr">
            You do not have access to this section. You can submit an access request to the system administrator to obtain permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-10 rounded-xl text-xs font-semibold border-border/70 hover:bg-muted text-foreground cursor-pointer"
          >
            {isRtl ? "بستن" : "Close"}
          </Button>

          <Button
            type="button"
            onClick={handleRequestAccess}
            disabled={isSubmitting || isAlreadyRequested}
            className={cn(
              "flex-1 h-10 rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-sm transition-all",
              isAlreadyRequested
                ? "bg-emerald-600 hover:bg-emerald-600 text-white cursor-default"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{isRtl ? "در حال ارسال..." : "Submitting..."}</span>
              </>
            ) : isAlreadyRequested ? (
              <>
                <CheckCircle2 className="size-4 text-white" />
                <span>{isRtl ? "درخواست ارسال شد" : "Request Sent"}</span>
              </>
            ) : (
              <>
                <KeyRound className="size-4" />
                <span>{isRtl ? "درخواست دسترسی" : "Request Access"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

