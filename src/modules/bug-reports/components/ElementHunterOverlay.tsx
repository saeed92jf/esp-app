// src/modules/bug-reports/components/ElementHunterOverlay.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Crosshair, Target, X, Check, Eye } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { InspectedElementData } from "../types";
import {
  extractElementInfo,
  formatElementTagBadge,
  HUNTER_CURSOR_DATA_URI,
} from "../utils/element-hunter";

interface ElementHunterOverlayProps {
  active: boolean;
  onSelectElement: (data: InspectedElementData) => void;
  onCancel: () => void;
}

export function ElementHunterOverlay({
  active,
  onSelectElement,
  onCancel,
}: ElementHunterOverlayProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [hoveredRect, setHoveredRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [hoveredTag, setHoveredTag] = useState<string>("");
  const [hoveredId, setHoveredId] = useState<string>("");
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(false);

  const hoveredElementRef = useRef<Element | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Apply global cursor and pointer styling when hunter mode is active
  useEffect(() => {
    if (!active) {
      setHoveredRect(null);
      hoveredElementRef.current = null;
      setIsLocked(false);
      return;
    }

    const styleEl = document.createElement("style");
    styleEl.id = "esp-hunter-cursor-style";
    styleEl.innerHTML = `
      * {
        cursor: url("${HUNTER_CURSOR_DATA_URI}") 16 16, crosshair !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      styleEl.remove();
    };
  }, [active]);

  // Track mouse movement to locate target element
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!active || isLocked) return;

      setHoveredCoords({ x: e.clientX, y: e.clientY });

      // Look for the element under cursor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el.closest("[data-hunter-ui='true']")) {
        return;
      }

      hoveredElementRef.current = el;
      const rect = el.getBoundingClientRect();
      setHoveredRect({
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });

      setHoveredTag(el.tagName.toLowerCase());
      setHoveredId(el.id || "");
    },
    [active, isLocked]
  );

  // Intercept click on the target element
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!active) return;

      // Check if user clicked the cancel button in the top HUD
      if (
        cancelBtnRef.current &&
        cancelBtnRef.current.contains(e.target as Node)
      ) {
        return; // Allow cancel click through
      }

      // Stop any link navigation, form submissions, or button events!
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const target =
        hoveredElementRef.current ||
        document.elementFromPoint(e.clientX, e.clientY);

      if (!target || target.closest("[data-hunter-ui='true']")) {
        return;
      }

      // Extract comprehensive element inspection data
      const info = extractElementInfo(target, e.clientX, e.clientY);

      // Play quick lock-on visual effect
      setIsLocked(true);
      setTimeout(() => {
        onSelectElement(info);
      }, 160);
    },
    [active, onSelectElement]
  );

  // Handle Escape key to cancel
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick, { capture: true });
    };
  }, [active, handleMouseMove, handleClick, onCancel]);

  if (!active) return null;

  const isTooltipAbove = hoveredRect && hoveredRect.top > 48;

  return (
    <div
      data-hunter-ui="true"
      className="fixed inset-0 z-[999999] pointer-events-none select-none overflow-hidden"
      aria-live="assertive"
    >
      {/* ── Top Floating Hunter HUD Banner ─────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-[9999999]">
        <div
          className={cn(
            "flex items-center gap-3.5 px-4 py-2 rounded-full",
            "bg-slate-950/90 text-white border border-red-500/50 shadow-2xl backdrop-blur-xl",
            "ring-2 ring-red-500/20 animate-in fade-in slide-in-from-top-4 duration-200"
          )}
        >
          {/* Animated Target Reticle */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute size-4 rounded-full bg-red-500/30 animate-ping" />
            <Target className="size-5 text-red-500 shrink-0" />
          </div>

          {/* HUD Status Text */}
          <div className="flex flex-col text-start">
            <span className="text-xs font-bold tracking-wide text-white flex items-center gap-1.5">
              <span>{isRtl ? "نشانه‌گیر هوشمند المان (Bug Hunter)" : "Smart Element Hunter"}</span>
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            </span>
            <span className="text-[10px] text-slate-300">
              {isRtl
                ? "روی هر المان، دکمه یا جدولی که اشکال دارد کلیک کنید"
                : "Click on any element, button, or section to inspect"}
            </span>
          </div>

          {/* Cancel Button */}
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className={cn(
              "ms-2 h-7 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
              "bg-white/10 hover:bg-red-600 text-white active:scale-95 border border-white/15"
            )}
          >
            <X className="size-3.5" />
            <span>{isRtl ? "انصراف (Esc)" : "Cancel (Esc)"}</span>
          </button>
        </div>
      </div>

      {/* ── Real-time Hover Bounding Box Reticle ─────────────────────────────── */}
      {hoveredRect && (
        <div
          style={{
            top: `${hoveredRect.top}px`,
            left: `${hoveredRect.left}px`,
            width: `${hoveredRect.width}px`,
            height: `${hoveredRect.height}px`,
          }}
          className={cn(
            "fixed transition-all duration-75 pointer-events-none",
            isLocked
              ? "border-2 border-emerald-500 bg-emerald-500/20 scale-[0.99] shadow-lg shadow-emerald-500/30"
              : "border-2 border-[#EC2527] bg-[#EC2527]/10 shadow-lg shadow-red-500/20"
          )}
        >
          {/* Reticle Corner Crosshair Marks */}
          <div className="absolute -top-1 -left-1 size-2 border-t-2 border-l-2 border-[#EC2527]" />
          <div className="absolute -top-1 -right-1 size-2 border-t-2 border-r-2 border-[#EC2527]" />
          <div className="absolute -bottom-1 -left-1 size-2 border-b-2 border-l-2 border-[#EC2527]" />
          <div className="absolute -bottom-1 -right-1 size-2 border-b-2 border-r-2 border-[#EC2527]" />

          {/* Center Target Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <Crosshair className="size-5 text-[#EC2527]" />
          </div>

          {/* Floating Element Details Tooltip */}
          <div
            className={cn(
              "absolute z-50 whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium shadow-xl pointer-events-none",
              isLocked
                ? "bg-emerald-950/95 text-emerald-200 border border-emerald-500/60"
                : "bg-slate-950/95 text-white border border-red-500/60",
              isTooltipAbove ? "-top-8 start-0" : "-bottom-8 start-0"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400">
                &lt;{hoveredTag}
                {hoveredId ? `#${hoveredId}` : ""}
                &gt;
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-200">
                {hoveredRect.width} × {hoveredRect.height} px
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 text-[10px]">
                X:{hoveredRect.left} Y:{hoveredRect.top}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

