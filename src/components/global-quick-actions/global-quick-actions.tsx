// src/components/global-quick-actions/global-quick-actions.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import {
  getAuthorizedQuickActions,
  QuickActionDef,
} from "./quick-actions-registry";
import { QuickActionModalHost } from "./quick-action-modal-host";

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

  return (
    <>
      <div
        id="esp-quick-actions-fab"
        ref={containerRef}
        className={cn(
          "fixed bottom-6 end-6 z-40 select-none print:hidden flex flex-col items-end",
          "pb-[env(safe-area-inset-bottom)] pe-[env(safe-area-inset-right)]"
        )}
      >
        {/* Expandable Menu Overlay / Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "mb-3 w-[290px] sm:w-[320px] rounded-2xl bg-card/95 dark:bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-2 flex flex-col gap-1.5 overflow-hidden ring-1 ring-black/5"
              )}
              role="menu"
              aria-label={isRtl ? "منوی اقدامات سریع" : "Quick Actions Menu"}
            >
              {/* Menu Header */}
              <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>{isRtl ? "اقدامات سریع سازمانی" : "Quick Actions"}</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ESP CORE
                </span>
              </div>

              {/* Action Items */}
              <div className="flex flex-col gap-1 py-1">
                {actions.map((action, idx) => {
                  const Icon = action.icon;
                  const title = isRtl ? action.titleFa : action.titleEn;
                  const desc = isRtl ? action.descriptionFa : action.descriptionEn;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleActionSelect(action.id)}
                      className={cn(
                        "w-full text-start flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 group cursor-pointer outline-none",
                        "hover:bg-accent/80 hover:text-accent-foreground active:scale-[0.99]",
                        "focus-visible:ring-2 focus-visible:ring-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 shadow-xs"
                        )}
                        style={{
                          backgroundColor: `${action.accentColor || "#9C0002"}15`,
                          color: action.accentColor || "#9C0002",
                        }}
                      >
                        <Icon className="size-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {title}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground line-clamp-1 leading-normal mt-0.5">
                          {desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button (FAB) */}
        <button
          ref={triggerButtonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={
            isOpen
              ? isRtl
                ? "بستن اقدامات سریع"
                : "Close quick actions"
              : isRtl
              ? "اقدامات سریع"
              : "Quick actions"
          }
          className={cn(
            "group relative flex items-center justify-center cursor-pointer select-none outline-none transition-all duration-200",
            "bg-[#9C0002] hover:bg-[#EC2527] text-white shadow-lg hover:shadow-xl active:scale-95",
            "ring-2 ring-white/20 dark:ring-black/20 focus-visible:ring-4 focus-visible:ring-primary/40",
            // Desktop: pill style button with text; Mobile: compact circular button
            "h-12 rounded-full px-4 gap-2.5 md:h-[46px] md:px-4.5 max-md:size-12 max-md:p-0"
          )}
        >
          {/* Animated Plus / Close Icon */}
          <div
            className={cn(
              "transition-transform duration-200 flex items-center justify-center shrink-0",
              isOpen ? "rotate-90" : "rotate-0 group-hover:rotate-90"
            )}
          >
            {isOpen ? <X className="size-5" /> : <Plus className="size-5" />}
          </div>

          {/* Desktop Text Label */}
          <span className="hidden md:inline-block text-xs font-bold tracking-wide whitespace-nowrap">
            {isOpen
              ? isRtl
                ? "بستن منو"
                : "Close"
              : isRtl
              ? "اقدامات سریع"
              : "Quick Actions"}
          </span>
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

