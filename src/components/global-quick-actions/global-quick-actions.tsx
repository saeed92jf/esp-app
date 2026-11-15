// src/components/global-quick-actions/global-quick-actions.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, Settings } from "lucide-react";
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

  const isSuperAdmin = user?.role === "superadmin";

  // Calculate active issues/messages count ONLY for superadmin
  const activeCount = isSuperAdmin ? openIssuesCount : 0;
  const hasIssues = isSuperAdmin && activeCount > 0;

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

                      {/* Right: Neutral Pill Badge (Only for text badges, no count number on bug-report) */}
                      <div className="shrink-0 ps-2">
                        {action.badge?.type === "text" ? (
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
          - For Superadmin:
            * When no issues: circular with epic radial green gradient from center
            * When issues exist: oval/pill shape with radial red gradient from center and active count
          - For Normal Users:
            * Clean neutral circular button, no red/green gradients, no issue counters
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
          style={
            isSuperAdmin
              ? {
                  background: hasIssues
                    ? "radial-gradient(ellipse at center, #EF4444 0%, #DC2626 28%, #B91C1C 58%, #8A0002 85%, #550001 100%)"
                    : "radial-gradient(circle at center, #4EFA8A 0%, #22EA6B 25%, #15CA53 55%, #10A343 85%, #0A732E 100%)",
                }
              : undefined
          }
          className={cn(
            "group relative flex items-center justify-center cursor-pointer select-none outline-none",
            "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95",
            "focus-visible:ring-2 focus-visible:ring-primary/40",
            isSuperAdmin
              ? [
                  "text-white border-0 ring-1 ring-white/25 ring-inset",
                  hasIssues
                    ? [
                        /* Superadmin Oval/Pill shape with radial red gradient */
                        "h-12 rounded-full px-4 gap-2.5 min-w-[92px]",
                        "shadow-[0_8px_24px_-4px_rgba(220,38,38,0.55),0_3px_10px_-2px_rgba(153,0,2,0.4)]",
                        "hover:shadow-[0_12px_30px_-4px_rgba(220,38,38,0.7),0_4px_14px_-2px_rgba(153,0,2,0.5)]",
                        "hover:brightness-105",
                      ]
                    : [
                        /* Superadmin Circular shape with attractive luminous phosphor lime green */
                        "size-12 rounded-full p-0",
                        "shadow-[0_8px_24px_-2px_rgba(34,197,94,0.65),0_0_22px_rgba(78,250,138,0.45)]",
                        "hover:shadow-[0_12px_32px_-2px_rgba(34,197,94,0.8),0_0_30px_rgba(78,250,138,0.6)]",
                        "hover:brightness-110",
                      ],
                ]
              : [
                  /* Regular User: Primary theme colored circular button */
                  "size-12 rounded-full p-0",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "border-0 ring-1 ring-white/20 ring-inset",
                  "shadow-[0_8px_24px_-4px_rgba(2,132,199,0.45),0_2px_8px_rgba(0,0,0,0.12)]",
                  "hover:brightness-105 active:scale-95",
                ]
          )}
        >
          {isSuperAdmin && hasIssues ? (
            /* Superadmin Oval / Pill mode: ESP CORE icon and filled pill badge centered side-by-side */
            isOpen ? (
              <div className="flex items-center justify-center size-full">
                <X className="size-5.5 text-white stroke-[2.5]" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 px-0.5">
                <EspCoreIcon className="size-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] shrink-0" />
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-white text-[#B91C1C] font-bold text-xs font-mono shadow-xs shrink-0 leading-none">
                  {formatLocaleNumber(activeCount, isRtl)}
                </span>
              </div>
            )
          ) : isSuperAdmin ? (
            /* Superadmin Circular mode with epic radial green gradient from center and large crisp icon */
            <div className="relative flex items-center justify-center size-full">
              <EspCoreIcon
                className={cn(
                  "size-7.5 sm:size-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] transition-transform duration-200 select-none pointer-events-none",
                  isOpen ? "scale-90 opacity-60" : "scale-100 group-hover:scale-110"
                )}
              />
              {isOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-xs rounded-full">
                  <X className="size-5.5 text-white stroke-[2.5]" />
                </div>
              )}
            </div>
          ) : (
            /* Regular User: Primary theme mode with prominent crisp icon */
            <div className="relative flex items-center justify-center size-full">
              <EspCoreIcon
                className={cn(
                  "size-7.5 text-primary-foreground drop-shadow-xs transition-transform duration-200 select-none pointer-events-none",
                  isOpen ? "scale-90 opacity-60" : "scale-100 group-hover:scale-110"
                )}
              />
              {isOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs rounded-full">
                  <X className="size-5 text-primary-foreground stroke-[2.5]" />
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
