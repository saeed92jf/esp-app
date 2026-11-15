// src/components/global-quick-actions/global-quick-actions.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);
  const [footerPushUp, setFooterPushUp] = useState(0);
  const [openIssuesCount, setOpenIssuesCount] = useState<number>(0);
  const [openSupportCount, setOpenSupportCount] = useState<number>(0);
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

      // 2. Fetch general analytics for issues badge
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

      // 3. Fetch support requests for support badge
      bugReportsService
        .getSupportRequests()
        .then((requests) => {
          if (!isMounted) return;
          const openSupport = (requests || []).filter((r) => isUnresolvedStatus(r.status));
          setOpenSupportCount(openSupport.length);
        })
        .catch(() => {
          if (isMounted) setOpenSupportCount(0);
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

  // Dynamic Push-up calculation: detects ScrollToTop and footer collision via zero-lag GPU transform
  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;

        // 1. Track ScrollToTop appearance (scroll > 400px)
        setIsScrollToTopVisible(window.scrollY > 400);

        // 2. Detect footer collision to elevate smoothly without lag
        const footer = document.querySelector("footer");
        if (footer) {
          const rect = footer.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // If the top edge of the footer enters the viewport
          if (rect.top < windowHeight) {
            setFooterPushUp(Math.max(0, Math.round(windowHeight - rect.top)));
          } else {
            setFooterPushUp(0);
          }
        } else {
          setFooterPushUp(0);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
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

  const isSuperAdmin = user?.role === "superadmin";

  // Priority Rule: Technical issues/bugs take strict precedence over support requests!
  const hasBugs = isSuperAdmin && openIssuesCount > 0;
  const hasSupport = isSuperAdmin && openSupportCount > 0;
  const hasAlert = hasBugs || hasSupport;
  const alertType: "issue" | "support" | null = hasBugs
    ? "issue"
    : hasSupport
    ? "support"
    : null;

  let badgeText = "";
  if (alertType === "issue") {
    if (isRtl) {
      badgeText = openIssuesCount > 1
        ? `${formatLocaleNumber(openIssuesCount, true)} ایشو`
        : "۱ ایشو";
    } else {
      badgeText = openIssuesCount > 1 ? `${openIssuesCount} issues` : "1 issue";
    }
  } else if (alertType === "support") {
    if (isRtl) {
      badgeText = openSupportCount > 1
        ? `${formatLocaleNumber(openSupportCount, true)} پشتیبانی`
        : "پشتیبانی";
    } else {
      badgeText = openSupportCount > 1 ? `${openSupportCount} support` : "support";
    }
  }

  // Do not render if excluded route or user not logged in (placed strictly AFTER all hooks)
  if (isExcludedRoute || !user) {
    return null;
  }

  // When ScrollToTop is visible, push Issue Center up by 60px (48px size + 12px gap)
  const baseBottom = isScrollToTopVisible ? "84px" : "24px";

  return (
    <>
      <div
        id="esp-quick-actions-fab"
        ref={containerRef}
        dir="ltr"
        style={{
          bottom: baseBottom,
          transform: footerPushUp > 0 ? `translate3d(0, -${footerPushUp}px, 0)` : undefined,
          willChange: footerPushUp > 0 ? "transform" : "auto",
        }}
        className={cn(
          "fixed z-50 select-none print:hidden flex flex-col",
          isRtl ? "left-6 items-start" : "right-6 items-end",
          "transition-[bottom] duration-200 ease-out"
        )}
      >
        {/* Borderless Popup Menu with Softer Gentle Shadow & Neutral Icons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              dir={isRtl ? "rtl" : "ltr"}
              className={cn(
                isSuperAdmin ? "mb-2" : "mb-1.5",
                isRtl ? "origin-bottom-left" : "origin-bottom-right",
                "w-[244px] sm:w-[264px] rounded-2xl bg-card/95 dark:bg-card/95 backdrop-blur-xl p-1.5 flex flex-col gap-0.5 overflow-hidden",
                "border border-border/40 ring-0",
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
                        "w-full h-auto justify-between px-3 rounded-xl font-normal text-start",
                        isSuperAdmin ? "py-2.5" : "py-2",
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

                      {/* Right: Neutral Pill Badge (Only for text badges, no count number on bug-report) */}
                      <div className="shrink-0 ps-2">
                        {action.badge?.type === "text" ? (
                          <span className="text-[11px] font-medium text-muted-foreground/80">
                            {isRtl ? action.badge.textFa : action.badge.textEn}
                          </span>
                        ) : (
                          <ChevronRight
                            className={cn(
                              "size-4 text-muted-foreground/50 group-hover:text-foreground/80 transition-colors",
                              isRtl && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Bottom Row Link: Issue Center Panel - ONLY for superadmin */}
              {isSuperAdmin && (
                <>
                  <div className="h-px bg-border/40 my-1 mx-2" />
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full text-start flex items-center justify-between px-3 py-2 h-auto rounded-xl font-normal hover:bg-muted/80 text-foreground/80 hover:text-foreground active:scale-[0.99] cursor-pointer"
                  >
                    <Link
                      href="/bug-reports"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-xs sm:text-[13px] font-medium text-foreground/90 group-hover:text-foreground">
                        {isRtl ? "مرکز گزارش‌ها و تیکت‌ها" : "Issue Center"}
                      </span>
                      <Settings className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button (FAB) */}
        {/*
          - Flat solid colors, no gradients, no glowing halos
          - For Superadmin:
            * When issues exist: solid red oval/pill with count and large ESP CORE icon
            * When support exists: solid sky blue oval/pill with count and large ESP CORE icon
            * When all clear: solid green circle with large ESP CORE icon
          - For Normal Users:
            * Solid primary circular button with large ESP CORE icon
          - Bilingual text stays visible when open (no X close icon)
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
            "transition-all duration-200 active:scale-95",
            "focus-visible:ring-2 focus-visible:ring-primary/40",
            "shadow-[0_4px_14px_rgba(0,0,0,0.18)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.24)] hover:brightness-105",
            isSuperAdmin
              ? [
                  "text-white aria-expanded:text-white border-0",
                  hasAlert
                    ? [
                        /* Superadmin Oval/Pill shape: solid flat colors */
                        "h-12 rounded-full min-w-[104px] p-0 overflow-hidden",
                        alertType === "issue"
                          ? "bg-red-600 hover:bg-red-700 aria-expanded:bg-red-600"
                          : "bg-sky-600 hover:bg-sky-700 aria-expanded:bg-sky-600",
                      ]
                    : [
                        /* Superadmin Circular shape: solid flat green */
                        "size-12 rounded-full p-0 bg-green-600 hover:bg-green-700 aria-expanded:bg-green-600",
                      ],
                ]
              : [
                  /* Regular User: Primary theme colored circular button */
                  "size-12 rounded-full p-0 bg-primary hover:bg-primary/90 aria-expanded:bg-primary text-primary-foreground aria-expanded:text-primary-foreground",
                ]
          )}
        >
          {isSuperAdmin && hasAlert ? (
            <div
              dir="ltr"
              className={cn(
                "flex items-center h-full w-full select-none",
                isRtl
                  ? "flex-row ps-2.5 pe-3.5 gap-2"
                  : "flex-row-reverse pe-2.5 ps-3.5 gap-2"
              )}
            >
              {/* Concentric, larger ESP CORE Icon: size-7.5 (30px) */}
              <div className="size-7.5 shrink-0 flex items-center justify-center pointer-events-none">
                <EspCoreIcon fill="white" className="size-7.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] shrink-0" />
              </div>

              {/* Trailing Area: Bilingual badge text stays visible even when open (no X) */}
              <div className="flex-1 flex items-center justify-center min-w-[48px]">
                <span className="text-xs sm:text-[13px] font-bold text-white tracking-tight whitespace-nowrap leading-none drop-shadow-xs">
                  {badgeText}
                </span>
              </div>
            </div>
          ) : isSuperAdmin ? (
            /* Superadmin Circular mode: solid green with large crisp icon */
            <div className="relative flex items-center justify-center size-full">
              <EspCoreIcon
                fill="white"
                className="size-8 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] select-none pointer-events-none transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          ) : (
            /* Regular User: Primary theme mode with large crisp icon */
            <div className="relative flex items-center justify-center size-full">
              <EspCoreIcon
                className="size-8 text-primary-foreground drop-shadow-xs select-none pointer-events-none transition-transform duration-200 group-hover:scale-105"
              />
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
