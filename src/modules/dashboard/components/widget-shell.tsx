// src/modules/dashboard/components/widget-shell.tsx
"use client";

import * as React from "react";
import { GripVertical, Eye, EyeOff, PanelRightClose, Sidebar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── WidgetShellProps ─────────────────────────────────────────────────────────

interface WidgetShellProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  onToggleVisible: (id: string) => void;
  onPinToRail?: (id: string) => void;
  children: React.ReactNode;
}

// ─── WidgetShell ──────────────────────────────────────────────────────────────

export const WidgetShell = React.forwardRef<HTMLDivElement, WidgetShellProps>(
  ({ id, onToggleVisible, onPinToRail, children, className, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <TooltipProvider>
        <div
          ref={ref}
          style={style}
          className={cn(
            "relative group h-full flex flex-col bg-transparent overflow-hidden rounded-2xl rounded-br-none",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {/* ── Controls overlay ── */}
          <div
            className={cn(
              "absolute top-2.5 end-2.5 z-30 flex items-center gap-1.5 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Pin to Side Rail */}
            {onPinToRail && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onPinToRail(id)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/40 transition-colors shadow-xs cursor-pointer"
                    aria-label="Pin to Slide Rail"
                  >
                    <Sidebar className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  پین در منوی اسلایدی
                </TooltipContent>
              </Tooltip>
            )}

            {/* Hide button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onToggleVisible(id)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors shadow-xs cursor-pointer"
                  aria-label="Hide Widget"
                >
                  <EyeOff className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                مخفی کردن از این تب
              </TooltipContent>
            </Tooltip>

            {/* Drag handle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="widget-drag-handle h-7 w-7 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-grab active:cursor-grabbing shadow-xs"
                >
                  <GripVertical className="size-4 pointer-events-none" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                جابجایی و تغییر مکان
              </TooltipContent>
            </Tooltip>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 h-full w-full min-h-0 @container relative overflow-hidden rounded-2xl rounded-br-none">
            {children}
          </div>

          {/* ── Bottom-Right Corner Resize Indicator (Without Fillet / Sharp with Arrow) ── */}
          <div
            className="absolute bottom-0 right-0 z-30 pointer-events-none size-6 flex items-end justify-end p-1 text-muted-foreground/50 group-hover:text-primary transition-colors select-none"
            aria-hidden="true"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </div>
        </div>
      </TooltipProvider>
    );
  }
);
WidgetShell.displayName = "WidgetShell";

// ─── HiddenWidgetBadge ────────────────────────────────────────────────────────

interface HiddenWidgetBadgeProps {
  label: string;
  icon: React.ReactNode;
  onShow: () => void;
}

export function HiddenWidgetBadge({ label, icon, onShow }: HiddenWidgetBadgeProps) {
  return (
    <button
      type="button"
      onClick={onShow}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/75 dark:bg-card/70 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-white/95 dark:hover:bg-card/95 hover:border-primary/40 shadow-2xs transition-colors duration-150 text-xs font-medium group cursor-pointer"
    >
      <span className="text-primary/70 group-hover:text-primary transition-colors">{icon}</span>
      <span>{label}</span>
      <Eye className="size-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
    </button>
  );
}
