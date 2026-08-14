"use client";

import React, { ReactNode } from "react";
import { NodeToolbar, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  Copy,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { VesselHandles } from "./VesselHandles";
import type { DiagramNodeData } from "@/modules/claude-flow/types";

// ─── SCIENTIFIC UNITS CONSTANTS & FORMATTER ─────────────────────────────────
export type ScientificUnit =
  | "mm"
  | "m"
  | "m²"
  | "m³"
  | "kg"
  | "kg/m³"
  | "kg/m²"
  | "barg"
  | "°C"
  | "mm/yr"
  | "MPa"
  | "%"
  | "in"
  | "qty"
  | string;

export function formatScientificUnit(unit?: string): string {
  if (!unit) return "";
  const clean = unit.trim().toLowerCase();
  switch (clean) {
    case "mm":
    case "millimeter":
      return "mm";
    case "m":
    case "meter":
      return "m";
    case "m2":
    case "sqm":
    case "m²":
      return "m²";
    case "m3":
    case "cbm":
    case "m³":
      return "m³";
    case "kg":
    case "kilogram":
      return "kg";
    case "kg/m3":
    case "kg/m^3":
    case "kg/m³":
      return "kg/m³";
    case "kg/m2":
    case "kg/m²":
      return "kg/m²";
    case "barg":
    case "bar":
    case "bar(g)":
      return "barg";
    case "c":
    case "deg c":
    case "degc":
    case "°c":
      return "°C";
    case "mm/yr":
    case "mm/year":
      return "mm/yr";
    case "mpa":
      return "MPa";
    case "pct":
    case "%":
      return "%";
    case "in":
    case "inch":
    case '"':
      return "in";
    default:
      return unit;
  }
}

// ─── 1. VESSEL NODE CONTAINER ───────────────────────────────────────────────
export interface VesselNodeContainerProps {
  id: string;
  data: DiagramNodeData;
  selected?: boolean;
  className?: string;
  widthClass?: string;
  dir?: "ltr" | "rtl";
  children: ReactNode;
  showHandles?: boolean;
}

export function VesselNodeContainer({
  id,
  data,
  selected = false,
  className,
  widthClass = "w-[440px]",
  dir = "ltr",
  children,
  showHandles = true,
}: VesselNodeContainerProps) {
  return (
    <div
      className={cn(
        "relative select-none font-sans text-xs transition-all duration-300 fa-num",
        widthClass,
        className
      )}
    >
      {/* Handles sit on the outer frame so they are never clipped by overflow-hidden */}
      {showHandles && <VesselHandles id={id} data={data} />}

      {/* Inner card strictly clips all contents (headers, sections, footers) to the rounded corners */}
      <div
        dir={dir}
        className={cn(
          "rounded-xl border bg-gradient-to-br from-card to-card/50 backdrop-blur-xl text-card-foreground shadow-lg transition-all duration-300 overflow-hidden",
          "border-border/50 hover:border-primary/50 group",
          "focus-within:border-form-primary focus-within:ring-2 focus-within:ring-form-primary/30",
          selected
            ? "border-form-primary ring-2 ring-form-primary ring-offset-2 ring-offset-background shadow-xl shadow-sky-800/15"
            : ""
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ─── 2. VESSEL NODE TOOLBAR ─────────────────────────────────────────────────
export interface VesselNodeToolbarProps {
  id: string;
  selected?: boolean;
  toolbarPosition?: Position;
  onDuplicate?: () => void;
  onReset?: () => void;
  onDelete?: () => void;
}

export function VesselNodeToolbar({
  id,
  selected = false,
  toolbarPosition = Position.Top,
  onDuplicate,
  onReset,
  onDelete,
}: VesselNodeToolbarProps) {
  return (
    <NodeToolbar
      isVisible={selected}
      position={toolbarPosition}
      className="flex items-center gap-1 rounded-lg border border-border bg-popover/95 p-1 shadow-md backdrop-blur-sm"
    >
      {onDuplicate && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDuplicate}
          title="Duplicate"
          className="h-6 w-6 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Copy size={13} />
        </Button>
      )}
      {onReset && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onReset}
          title="Reset to default"
          className="h-6 w-6 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <RotateCcw size={13} />
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Delete"
          className="h-6 w-6 text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={13} />
        </Button>
      )}
    </NodeToolbar>
  );
}

// ─── 3. VESSEL NODE HEADER ──────────────────────────────────────────────────
export interface VesselNodeHeaderProps {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function VesselNodeHeader({
  icon,
  title,
  subtitle,
  badge,
  actions,
  isCollapsed,
  onToggleCollapse,
  className,
}: VesselNodeHeaderProps) {
  return (
    <div
      className={cn(
        "vessel-drag-handle flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing border-b border-form-primary-foreground/20 select-none bg-form-primary text-form-primary-foreground transition-colors w-full",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-form-primary-foreground/15 text-form-primary-foreground border border-form-primary-foreground/25">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-form-primary-foreground text-sm tracking-tight truncate">
              {title}
            </h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-[10px] text-form-primary-foreground/80 uppercase tracking-wider truncate font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {actions}
        {onToggleCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="h-6 w-6 rounded-md hover:bg-form-primary-foreground/15 text-form-primary-foreground hover:text-form-primary-foreground"
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── 4. VESSEL SECTION HEADER ───────────────────────────────────────────────
export interface VesselSectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function VesselSectionHeader({
  title,
  subtitle,
  action,
  className,
  isCollapsed,
  onToggleCollapse,
}: VesselSectionHeaderProps) {
  return (
    <div
      onClick={onToggleCollapse ? onToggleCollapse : undefined}
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200 bg-sky-100/70 dark:bg-sky-950/60 py-1 px-2.5 rounded-md border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-between gap-2 select-none",
        onToggleCollapse && "cursor-pointer hover:bg-sky-200/60 dark:hover:bg-sky-900/60 transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-1.5 truncate">
        {onToggleCollapse && (
          <span className="text-sky-700 dark:text-sky-300 transition-transform duration-200">
            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </span>
        )}
        <span className="truncate">{title}</span>
        {subtitle && (
          <span className="text-[9px] font-normal text-sky-700/80 dark:text-sky-400/80 normal-case">
            ({subtitle})
          </span>
        )}
      </div>
      {action && (
        <div
          className="shrink-0"
          onClick={(e) => {
            if (onToggleCollapse) e.stopPropagation();
          }}
        >
          {action}
        </div>
      )}
    </div>
  );
}

// ─── 5. VESSEL SUB-SECTION / CARD HEADER ────────────────────────────────────
export interface VesselSubSectionHeaderProps {
  title: ReactNode;
  badge?: ReactNode;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onDelete?: () => void;
  className?: string;
  children?: ReactNode;
}

export function VesselSubSectionHeader({
  title,
  badge,
  isExpanded = true,
  onToggleExpand,
  onDelete,
  className,
  children,
}: VesselSubSectionHeaderProps) {
  return (
    <div
      className={cn(
        "p-2 bg-sky-50/80 dark:bg-sky-950/40 flex items-center justify-between cursor-pointer hover:bg-sky-100/60 dark:hover:bg-sky-900/40 border-b border-sky-200/60 dark:border-sky-800/40 select-none transition-colors",
        className
      )}
      onClick={onToggleExpand}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="text-[10px] font-bold text-sky-900 dark:text-sky-200 uppercase truncate">
          {title}
        </span>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {children}
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-6 w-6 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={12} />
          </Button>
        )}
        {onToggleExpand && (
          <span className="text-muted-foreground">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 6. VESSEL FIELD LABEL WITH SCIENTIFIC UNIT ─────────────────────────────
export interface VesselFieldLabelProps {
  label: ReactNode;
  unit?: string;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

export function VesselFieldLabel({
  label,
  unit,
  htmlFor,
  className,
  required,
}: VesselFieldLabelProps) {
  const formattedUnit = unit ? formatScientificUnit(unit) : "";
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 select-none",
        className
      )}
    >
      <span className="truncate">{label}</span>
      {required && <span className="text-destructive font-bold">*</span>}
      {formattedUnit && (
        <span className="text-[9px] font-normal text-muted-foreground/80 normal-case tracking-normal">
          ({formattedUnit})
        </span>
      )}
    </Label>
  );
}

// ─── 7. VESSEL INFO BUTTON (OUTSIDE INPUT) ──────────────────────────────────
export interface VesselInfoButtonProps {
  title?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  tooltip?: string;
  className?: string;
}

export function VesselInfoButton({
  title = "Details / Notes",
  value = "",
  onChange,
  placeholder = "Notes...",
  tooltip = "More info",
  className,
}: VesselInfoButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title={tooltip}
          className={cn(
            "h-7 w-7 shrink-0 rounded-md border border-input bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold",
            value ? "text-form-primary border-form-primary/50 bg-form-primary/5" : "",
            className
          )}
        >
          <MoreHorizontal size={13} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2.5 text-xs nodrag" align="end">
        <div className="font-semibold text-foreground text-[11px] mb-1.5 flex items-center gap-1">
          <Info size={12} className="text-form-primary" />
          <span>{title}</span>
        </div>
        <div className="space-y-2">
          <Input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              onChange?.(e.target.value);
            }}
            placeholder={placeholder}
            className="h-7 text-xs bg-white dark:bg-black"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── 8. VESSEL NODE FOOTER & ROWS ───────────────────────────────────────────
export interface VesselNodeFooterProps {
  className?: string;
  children: ReactNode;
}

export function VesselNodeFooter({ className, children }: VesselNodeFooterProps) {
  return (
    <div
      className={cn(
        "bg-sky-100/50 dark:bg-sky-950/40 border-t border-sky-200/80 dark:border-sky-900/60 px-3 py-2.5 flex flex-col gap-1.5 w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface VesselFooterRowProps {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  className?: string;
}

export function VesselFooterRow({
  label,
  value,
  unit,
  className,
}: VesselFooterRowProps) {
  const formattedUnit = unit ? formatScientificUnit(unit) : "";
  return (
    <div className={cn("flex items-center justify-between text-[10px]", className)}>
      <span className="font-semibold text-sky-900/70 dark:text-sky-300/80 uppercase tracking-wider">
        {label}
      </span>
      <span className="font-bold tabular-nums text-foreground flex items-center gap-0.5">
        <span>{value}</span>
        {formattedUnit && (
          <span className="text-[9px] font-normal text-sky-700/80 dark:text-sky-400/80">
            {formattedUnit}
          </span>
        )}
      </span>
    </div>
  );
}

export interface VesselFooterHighlightProps {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  className?: string;
}

export function VesselFooterHighlight({
  label,
  value,
  unit = "kg",
  className,
}: VesselFooterHighlightProps) {
  const formattedUnit = unit ? formatScientificUnit(unit) : "";
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-1.5 border-t border-sky-300/60 dark:border-sky-800/60 mt-0.5",
        className
      )}
    >
      <span className="text-[10px] font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-extrabold tabular-nums text-sky-800 dark:text-sky-300 flex items-center gap-1">
        <span>{value}</span>
        {formattedUnit && (
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            {formattedUnit}
          </span>
        )}
      </span>
    </div>
  );
}
