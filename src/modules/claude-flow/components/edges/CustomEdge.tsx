"use client";

import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useDiagramStore } from "../../store";
import type { DiagramEdgeData } from "../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps & { data?: DiagramEdgeData }) {
  const deleteSelected = useDiagramStore((s) => s.deleteSelected);
  const edgeStyle = data?.edgeStyle ?? "smoothstep";

  //── Path calculation based on edge style ──────────────────────────────────
  let path: string;
  let labelX: number;
  let labelY: number;

  if (edgeStyle === "straight") {
    [path, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else if (edgeStyle === "step" || edgeStyle === "smoothstep") {
    [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      // step = hard corners, smoothstep = 8px border-radius
      borderRadius: edgeStyle === "step" ? 0 : 8,
    });
  } else {
    // default fallback: bezier curve
    [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  const strokeColor = data?.color ?? "#94a3b8";
  const strokeWidth = data?.strokeWidth ?? 2;

  return (
    <>
      {/* SVG edge path — stroke color and width driven by selection state */}
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? "#6366f1" : strokeColor,
          strokeWidth: selected ? strokeWidth + 0.5 : strokeWidth,
        }}
      />

      {/* HTML overlay rendered via portal into the ReactFlow pane */}
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="nodrag nopan pointer-events-auto absolute"
        >
          {/* Edge label badge — only rendered when data.label is set */}
          {data?.label && (
            <Badge
              variant="outline"
              className="px-1.5 py-0.5 text-[11px] font-medium shadow-xs"
            >
              {data.label}
            </Badge>
          )}

          {/* Delete button — visible only when edge is selected */}
          {selected && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteSelected();
              }}
              // -end-3 is RTL-aware logical equivalent of -right-3 / -left-3
              className={cn(
                "absolute -top-3 -inset-e-3 size-5 rounded-full shadow-xs",
                "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
              )}
              aria-label="Delete edge"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// ── Edge type registry — all styles map to the same CustomEdge component ─────
// The actual path shape is determined by data.edgeStyle inside the component.
export const edgeTypes = {
  default: CustomEdge,
  straight: CustomEdge,
  step: CustomEdge,
  smoothstep: CustomEdge,
};
