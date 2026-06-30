"use client";

import React from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import type { DiagramNodeData } from "../../types";
import { cn } from "@/lib/utils";

interface BaseNodeShellProps {
  selected?: boolean;
  data: DiagramNodeData;
  children: React.ReactNode;
  shapeClassName?: string;
  showHandles?: boolean;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  style?: React.CSSProperties;
}

// Maps semantic font-weight names to numeric CSS values
const FONT_WEIGHT_MAP: Record<string, number> = {
  normal: 400,
  semibold: 600,
  bold: 700,
};

// All dynamic node styling is applied via inline style to avoid Tailwind specificity conflicts.
// border-style especially must be inline since Tailwind v4 preflight defaults to "solid".
export function getNodeStyle(data: DiagramNodeData): React.CSSProperties {
  return {
    backgroundColor: data.backgroundColor ?? "#ffffff",
    borderColor: data.borderColor ?? "#cbd5e1",
    color: data.textColor ?? "#0f172a",
    fontSize: data.fontSize ?? 13,
    fontWeight: FONT_WEIGHT_MAP[data.fontWeight ?? "normal"],
    borderWidth: data.borderWidth ?? 1.5,
    borderStyle: data.borderStyle ?? "solid",
    borderRadius: data.borderRadius ?? 8,
  };
}

// Shared class string for all four ReactFlow connection handles.
// In Tailwind v4, important modifier moves to suffix: `h-2.5!` instead of `!h-2.5`.
const HANDLE_CLS = "size-2.5! border-2! border-white! bg-slate-400!";

// NodeResizer overrides — lineClassName targets the resize border line,
// handleClassName targets the corner/edge drag handles.
const RESIZER_LINE_CLS = "border-indigo-500!";
const RESIZER_HANDLE_CLS =
  "size-2.5! rounded-sm! border! border-indigo-500! bg-white!";

export function BaseNodeShell({
  selected,
  data,
  children,
  shapeClassName = "",
  showHandles = true,
  resizable = false,
  minWidth = 120,
  minHeight = 44,
  style,
}: BaseNodeShellProps) {
  const nodeStyle = getNodeStyle(data);

  return (
    <div
      className={cn(
        // layout — min-h-11 = 44px, min-w-30 = 120px (Tailwind v4 scale)
        "group relative flex min-h-11 min-w-30 items-center justify-center px-4 py-2.5 text-center",
        // base shadow + smooth transition on state changes
        "shadow-xs transition-shadow",
        // selection ring — ring-indigo-500 replaces the old --tw-ring-color CSS var (v3 internals)
        selected
          ? "shadow-md ring-2 ring-indigo-500 ring-offset-2"
          : "hover:shadow-md",
        shapeClassName,
      )}
      // All dynamic values (color, border-style, radius…) go through inline style
      // to guarantee specificity over any Tailwind utility.
      style={{ ...nodeStyle, ...style }}
    >
      {/* Resize handles — only mounted when resizable=true, visible only when selected */}
      {resizable && (
        <NodeResizer
          isVisible={selected}
          minWidth={minWidth}
          minHeight={minHeight}
          lineClassName={RESIZER_LINE_CLS}
          handleClassName={RESIZER_HANDLE_CLS}
        />
      )}

      {/* Four directional connection handles (target top/left, source bottom/right) */}
      {showHandles && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className={HANDLE_CLS}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className={HANDLE_CLS}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className={HANDLE_CLS}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className={HANDLE_CLS}
          />
        </>
      )}

      {/* Node label — pointer-events-none prevents drag interference */}
      <span className="pointer-events-none w-full truncate">{children}</span>
    </div>
  );
}

export type DiagramNodeProps = NodeProps & { data: DiagramNodeData };
