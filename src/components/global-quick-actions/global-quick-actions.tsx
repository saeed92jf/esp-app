// src/components/global-quick-actions/global-quick-actions.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, ArrowUpRight, ChevronRight, Settings } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
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
  const [openIssuesCount, setOpenIssuesCount] = useState<number>(1);

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

  // Load analytics count for badge
  useEffect(() => {
    let isMounted = true;
    bugReportsService
      .getAnalytics()
      .then((data) => {
        if (!isMounted) return;
        const count = (data.new || 0) + (data.inProgress || 0);
        setOpenIssuesCount(count > 0 ? count : data.total || 1);
      })
      .catch(() => {
        // Fallback default
        if (isMounted) setOpenIssuesCount(1);
      });
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Dynamic Push-up calculation: detects footer and pushes FAB cleanly above it
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (!footer) {
        setBottomOffset(24);
        return;
      }

      const rect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // If the top edge of the footer enters or is visible in the viewport
      if (rect.top < windowHeight) {
        const overlap = windowHeight - rect.top;
        // Float cleanly 16px above the top border of the footer, never dipping below default 24px
        setBottomOffset(Math.max(24, Math.round(overlap + 16)));
      } else {
        setBottomOffset(24);
      }
    };

    handleScroll();
    // Use capture: true so scroll events from any nested scroll containers are also captured
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

  const ChevronIcon = isRtl ? ChevronRight : ChevronRight;

  return (
    <>
      <div
        id="esp-quick-actions-fab"
        ref={containerRef}
        style={{ bottom: `${bottomOffset}px` }}
        className={cn(
          "fixed end-6 z-40 select-none print:hidden flex flex-col items-end",
          "transition-[bottom] duration-150 ease-out",
          "pe-[env(safe-area-inset-right)]"
        )}
      >
        {/* Minimal Expandable Menu Popover matching user reference */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "mb-2.5 w-[250px] sm:w-[270px] rounded-2xl bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-1.5 flex flex-col gap-0.5 overflow-hidden ring-1 ring-black/5"
              )}
              role="menu"
              aria-label={isRtl ? "اقدامات سریع" : "Quick Actions"}
            >
              {/* Minimal Action Rows */}
              <div className="flex flex-col gap-0.5">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const title = isRtl ? action.titleFa : action.titleEn;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleActionSelect(action.id)}
                      className={cn(
                        "w-full text-start flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer outline-none",
                        "hover:bg-muted/80 hover:text-foreground active:scale-[0.99]",
                        "focus-visible:ring-2 focus-visible:ring-primary/40"
                      )}
                    >
                      {/* Left: Raw Icon (Larger, No Background Box) + Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className="size-[21px] shrink-0 transition-transform duration-150 group-hover:scale-110"
                          style={{ color: action.accentColor || "#9C0002" }}
                        />
                        <span className="text-xs sm:text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {title}
                        </span>
                      </div>

                      {/* Right: Pill Badge matching user reference photo */}
                      <div className="shrink-0 ps-2">
                        {action.badge?.type === "dot-count" ? (
                          /* Pill badge with red indicator dot & count (exact reference from photo) */
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-foreground shadow-2xs">
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: action.badge.dotColor || "#ef4444" }}
                            />
                            <span>{openIssuesCount}</span>
                          </span>
                        ) : action.badge?.type === "text" ? (
                          <span className="text-xs font-medium text-muted-foreground">
                            {isRtl ? action.badge.textFa : action.badge.textEn}
                          </span>
                        ) : (
                          <ChevronIcon className="size-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Minimal Divider */}
              <div className="h-px bg-border/50 my-1 mx-2" />

              {/* Bottom Row Link: Issue Center / Preferences (exact reference from photo) */}
              <Link
                href="/bug-reports"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "w-full text-start flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group cursor-pointer outline-none",
                  "hover:bg-muted/80 text-foreground/80 hover:text-foreground active:scale-[0.99]"
                )}
              >
                <span className="text-xs sm:text-[13px] font-medium text-foreground/90 group-hover:text-foreground">
                  {isRtl ? "مرکز گزارش‌ها و تیکت‌ها" : "Preferences"}
                </span>
                <Settings className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button (FAB) matching reference style */}
        <button
          ref={triggerButtonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={
            isOpen
              ? isRtl
                ? "بستن منو"
                : "Close"
              : isRtl
              ? "اقدامات سریع"
              : "Quick Actions"
          }
          className={cn(
            "group relative flex items-center justify-center cursor-pointer select-none outline-none transition-all duration-200",
            "bg-[#9C0002] hover:bg-[#EC2527] text-white shadow-lg hover:shadow-xl active:scale-95",
            "ring-2 ring-white/20 dark:ring-black/20 focus-visible:ring-4 focus-visible:ring-primary/40",
            // Desktop: pill style button matching reference; Mobile: compact circle
            "h-10 rounded-full px-3 gap-2 max-md:size-11 max-md:p-0"
          )}
        >
          {/* Inner Monogram / Circle (matching the (N) circular badge in photo) */}
          <div className="size-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold text-white shrink-0">
            E
          </div>

          {/* Desktop Text Label (matching "1 Issue" in photo) */}
          <span className="hidden md:inline-block text-xs font-bold tracking-wide whitespace-nowrap">
            {openIssuesCount > 0
              ? `${openIssuesCount} ${isRtl ? "اشکال و اقدام" : openIssuesCount === 1 ? "Issue" : "Issues"}`
              : isRtl
              ? "اقدامات سریع"
              : "Quick Actions"}
          </span>

          {/* Animated Plus / Close Icon (matching 'x' in photo when open) */}
          <div
            className={cn(
              "transition-transform duration-200 flex items-center justify-center shrink-0",
              isOpen ? "rotate-90" : "rotate-0"
            )}
          >
            {isOpen ? <X className="size-4" /> : <Plus className="size-4" />}
          </div>
        </button>
      </div>

      {/* Modal Host rendering the active form */}
      <QuickActionModalHost
        activeActionId={activeModalId}
        onClose={() => setActiveModalId(null)}
      />
    </>
  );
}
