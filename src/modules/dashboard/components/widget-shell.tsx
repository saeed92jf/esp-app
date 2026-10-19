// src/modules/dashboard/components/widget-shell.tsx
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { GripVertical, Eye, EyeOff } from "lucide-react";
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
  ({ id, onToggleVisible, onPinToRail: _onPinToRail, children, className, style, ...props }, ref) => {
    const t = useTranslations("Dashboard.widget");
    const locale = useLocale();
    const isFa = locale === "fa";

    return (
      <TooltipProvider>
        <div
          ref={ref}
          style={style}
          className={cn(
            "relative group h-full flex flex-col bg-transparent overflow-hidden rounded-2xl",
            className
          )}
          {...props}
        >
          {/* ── Controls overlay (Swaps between left in FA and right in EN) ── */}
          <div
            className={cn(
              "absolute top-2.5 z-30 flex items-center gap-1.5 opacity-100 select-none",
              isFa ? "left-2.5" : "right-2.5"
            )}
          >
            {/* Hide button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onToggleVisible(id)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors shadow-2xs cursor-pointer"
                  aria-label="Hide Widget"
                >
                  <EyeOff className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("hide")}
              </TooltipContent>
            </Tooltip>

            {/* Drag handle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="widget-drag-handle h-7 w-7 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-grab active:cursor-grabbing shadow-2xs"
                >
                  <GripVertical className="size-4 pointer-events-none" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("drag")}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* ── Content (Uniform fillet on all corners) ── */}
          <div className="flex-1 h-full w-full min-h-0 @container relative overflow-hidden rounded-2xl">
            {children}
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
