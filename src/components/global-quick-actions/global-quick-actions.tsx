// src/components/global-quick-actions/global-quick-actions.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EspCoreIcon } from "@/components/brand/esp-core-icon";
import { formatLocaleNumber } from "@/lib/format-number";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import {
  getAuthorizedQuickActions,
  QuickActionDef,
} from "./quick-actions-registry";
import { QuickActionModalHost } from "./quick-action-modal-host";
import { bugReportsService } from "@/modules/bug-reports/services/bug-reports.service";

const EXCLUDED_PREFIXES = [
  "/login",
  "/register",
  "/auth",
  "/account-request",
  "/forgot-password",
  "/reset-password",
];

export function GlobalQuickActions() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const pathname = usePathname();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [bottomOffset, setBottomOffset] = useState(24); // default 24px from bottom
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);
  const [openIssuesCount, setOpenIssuesCount] = useState<number>(0);
  const [userReportsCount, setUserReportsCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Check if current route should hide the FAB
  const isExcludedRoute = React.useMemo(() => {
    if (!pathname) return false;
    return EXCLUDED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  }, [pathname]);

  // Close menu on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Load analytics & user reports count
  useEffect(() => {
    let isMounted = true;

    const isUnresolvedStatus = (status?: string) => {
      const s = (status || "").toLowerCase().trim();
      return s !== "closed" && s !== "resolved" && s !== "rejected";
    };

    const refreshCounts = () => {
      // 1. Fetch user reports if logged in
      if (user?.id) {
        bugReportsService
          .getMyBugReports(user.id)
          .then((reports) => {
            if (!isMounted) return;
            const active = (reports || []).filter((r) => isUnresolvedStatus(r.status));
            setUserReportsCount(active.length);
          })
          .catch(() => {
            if (isMounted) setUserReportsCount(0);
          });
      } else {
        setUserReportsCount(0);
      }

      // 2. Fetch general analytics for badge
      bugReportsService
        .getAnalytics()
        .then((data) => {
          if (!isMounted) return;
          const openCount = (data.new || 0) + (data.inProgress || 0);
          setOpenIssuesCount(openCount);
        })
        .catch(() => {
          if (isMounted) setOpenIssuesCount(0);
        });
    };

    refreshCounts();

    const handleUpdate = () => {
      refreshCounts();
    };

    window.addEventListener("esp:bug-reports-updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("esp:bug-reports-updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [user?.id, pathname]);

  // Dynamic Push-up calculation: detects ScrollToTop and footer collision
  useEffect(() => {
    const handleScroll = () => {
      // 1. Track ScrollToTop appearance (scroll > 400px)
      setIsScrollToTopVisible(window.scrollY > 400);

      // 2. Detect footer collision to elevate both buttons
      const footer = document.querySelector("footer");
      if (!footer) {
        setBottomOffset(24);
        return;
      }

      const rect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // If the top edge of the footer enters the viewport
      if (rect.top < windowHeight) {
        const visibleFooterHeight = windowHeight - rect.top;
        setBottomOffset(Math.max(24, Math.round(visibleFooterHeight + 24)));
      } else {
        setBottomOffset(24);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  // Outside click dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const actions = React.useMemo(() => {
    return getAuthorizedQuickActions(user);
  }, [user]);

  const handleActionSelect = useCallback((actionId: string) => {
    setIsOpen(false);
    setActiveModalId(actionId);
  }, []);

  // Do not render if excluded route or user not logged in
  if (isExcludedRoute || !user) {
    return null;
  }

  // Calculate active issues/messages count
  // Admins see total open issues; users see their own reported issues
  const activeCount =
    user?.role === "admin" || user?.role === "superadmin"
      ? openIssuesCount
      : userReportsCount;

  const hasIssues = activeCount > 0;

  // When ScrollToTop is visible, push Issue Center up by 60px (48px size + 12px gap)
  const currentBottom = isScrollToTopVisible ? bottomOffset + 60 : bottomOffset;

  return (
    <>
      <div
        id="esp-quick-actions-fab"
        ref={containerRef}
        style={{ bottom: `${currentBottom}px` }}
        className={cn(
          "fixed right-6 z-50 select-none print:hidden flex flex-col items-end",
          "transition-[bottom] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        )}
      >
        {/* Borderless Popup Menu with Softer Gentle Shadow & Neutral Icons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "mb-2.5 w-[250px] sm:w-[270px] rounded-2xl bg-card/95 dark:bg-card/95 backdrop-blur-xl p-1.5 flex flex-col gap-0.5 overflow-hidden",
                "border-0 ring-0",
                "shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08),0_4px_16px_-2px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.5)]"
              )}
              role="menu"
              aria-label={isRtl ? "مرکز اشکالات و اقدامات سریع" : "Issue Center"}
            >
              {/* Action Rows with Neutral Icons */}
              <div className="flex flex-col gap-0.5">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const title = isRtl ? action.titleFa : action.titleEn;

                  return (
                    <Button
                      key={action.id}
                      type="button"
                      variant="ghost"
                      role="menuitem"
                      onClick={() => handleActionSelect(action.id)}
                      className={cn(
                        "w-full h-auto justify-between px-3 py-2.5 rounded-xl font-normal text-start",
                        "hover:bg-muted/80 hover:text-foreground active:scale-[0.99]",
                        "focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                      )}
                    >
                      {/* Left: Neutral Icon + Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-xs sm:text-[13px] font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
                          {title}
                        </span>
                      </div>

                      {/* Right: Neutral Pill Badge */}
                      <div className="shrink-0 ps-2">
                        {action.badge?.type === "dot-count" && activeCount > 0 ? (
                          <Badge
                            variant="secondary"
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                          >
                            <span className="size-1.5 rounded-full shrink-0 bg-red-500" />
                            <span>{formatLocaleNumber(activeCount, isRtl)}</span>
                          </Badge>
                        ) : action.badge?.type === "text" ? (
                          <span className="text-[11px] font-medium text-muted-foreground/80">
                            {isRtl ? action.badge.textFa : action.badge.textEn}
                          </span>
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground/80 transition-colors" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Minimal Divider */}
              <div className="h-px bg-border/40 my-1 mx-2" />

              {/* Bottom Row Link: Issue Center */}
              <Link
                href="/bug-reports"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "w-full text-start flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group cursor-pointer outline-none",
                  "hover:bg-muted/80 text-foreground/80 hover:text-foreground active:scale-[0.99]"
                )}
              >
                <span className="text-xs sm:text-[13px] font-medium text-foreground/90 group-hover:text-foreground">
                  {isRtl ? "مرکز گزارش‌ها و تیکت‌ها" : "Issue Center"}
                </span>
                <Settings className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button (FAB) */}
        {/*
          - When no issues: circular (دایره) with raw neutral background (پس زمینه خام)
          - When issues exist: oval/pill shape (بیضی), red background (قرمز), and displays count (تعداد بزنه)
        */}
        <Button
          ref={triggerButtonRef}
          type="button"
          variant="ghost"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={
            isOpen
              ? isRtl
                ? "بستن منو"
                : "Close"
              : isRtl
              ? "مرکز اشکالات و گزارش‌ها"
              : "Issue Center"
          }
          className={cn(
            "group relative flex items-center justify-center cursor-pointer select-none outline-none",
            "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95",
            "focus-visible:ring-2 focus-visible:ring-primary/40",
            hasIssues
              ? [
                  /* Oval/Pill shape, Red background when issues exist */
                  "h-12 rounded-full px-3.5 gap-2.5 min-w-[96px]",
                  "bg-[#9C0002] hover:bg-[#B30002] text-white border-0",
                  "shadow-lg shadow-red-950/25 hover:shadow-xl hover:shadow-red-950/30",
                ]
              : [
                  /* Circular shape, Raw neutral background when clean */
                  "size-12 rounded-full p-0",
                  "bg-background/95 dark:bg-card/95 hover:bg-muted/90 text-foreground",
                  "border border-border/40 hover:border-border/60",
                  "shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-lg",
                  "backdrop-blur-xl",
                ]
          )}
        >
          {hasIssues ? (
            /* Oval / Pill mode with count and red styling */
            <>
              {/* ESP CORE Icon framed in a crisp white circular backing so the red emblem pops and never fades */}
              <div className="size-7 rounded-full bg-white dark:bg-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-black/5">
                <EspCoreIcon className="size-4.5 text-[#9C0002]" />
              </div>

              {/* Issues Count Badge with authentic Shabnam/Inter typography */}
              <span className="text-xs font-semibold whitespace-nowrap leading-none">
                {formatLocaleNumber(activeCount, isRtl)}{" "}
                {isRtl
                  ? activeCount === 1 ? "ایشو" : "ایشو"
                  : activeCount === 1 ? "Issue" : "Issues"}
              </span>

              {/* Indicator / Close toggle */}
              <div
                className={cn(
                  "transition-transform duration-200 flex items-center justify-center shrink-0 opacity-90 group-hover:opacity-100",
                  isOpen ? "rotate-90" : "rotate-0"
                )}
              >
                {isOpen ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
              </div>
            </>
          ) : (
            /* Circular raw neutral mode with centered red SVG icon */
            <div className="relative flex items-center justify-center size-full">
              <EspCoreIcon
                className={cn(
                  "size-6.5 text-[#9C0002] dark:text-[#E30613] transition-transform duration-200 select-none pointer-events-none",
                  isOpen ? "scale-90 opacity-60" : "scale-100 group-hover:scale-105"
                )}
              />
              {isOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-xs rounded-full">
                  <X className="size-5 text-foreground stroke-[2]" />
                </div>
              )}
            </div>
          )}
        </Button>
      </div>

      {/* Modal Host rendering the active dialog */}
      <QuickActionModalHost
        activeActionId={activeModalId}
        onClose={() => setActiveModalId(null)}
        onSubmitted={() => {
          setUserReportsCount((prev) => prev + 1);
        }}
      />
    </>
  );
}
