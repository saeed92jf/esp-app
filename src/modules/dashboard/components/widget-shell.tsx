// src/modules/dashboard/components/widget-shell.tsx
"use client";

import * as React from "react";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── WidgetShellProps ─────────────────────────────────────────────────────────

interface WidgetShellProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  onToggleVisible: (id: string) => void;
  children: React.ReactNode;
}

// ─── WidgetShell ──────────────────────────────────────────────────────────────

export const WidgetShell = React.forwardRef<HTMLDivElement, WidgetShellProps>(
  ({ id, onToggleVisible, children, className, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div
        ref={ref}
        style={style}
        className={cn("relative group h-full flex flex-col bg-transparent overflow-hidden", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* ── Controls overlay ── */}
        <div
          className={cn(
            "absolute top-2 end-2 z-20 flex items-center gap-1 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Hide button */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking hide
            onClick={() => onToggleVisible(id)}
            title="مخفی کردن ویجت"
            className="h-6 w-6 flex items-center justify-center rounded-md bg-card/80 backdrop-blur-sm border border-border/60 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-200 shadow-sm"
          >
            <EyeOff className="size-3" />
          </button>

          {/* Drag handle */}
          <div
            title="جابجایی"
            className="widget-drag-handle h-6 w-6 flex items-center justify-center rounded-md bg-card/80 backdrop-blur-sm border border-border/60 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 cursor-grab active:cursor-grabbing shadow-sm"
          >
            <GripVertical className="size-3.5 pointer-events-none" />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 h-full w-full min-h-0 @container relative">
          {children}
        </div>
      </div>
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/40 transition-all duration-200 text-xs font-medium group"
    >
      <span className="text-primary/70 group-hover:text-primary transition-colors">{icon}</span>
      {label}
      <Eye className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
