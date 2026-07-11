"use client";

import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useInternalNode,
  type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useDiagramStore } from "../../store";
import type { DiagramEdgeData } from "../../types";
import { resolveEdgeColor } from "../../utils/colors";
import { getFloatingEdgeParams } from "../../utils/floatingEdge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  markerStart,
}: EdgeProps & { data?: DiagramEdgeData }) {
  const deleteSelected = useDiagramStore((s) => s.deleteSelected);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const edgeStyle = data?.edgeStyle ?? "smoothstep";

  // Floating edges recompute their own attach points off the live node
  // rectangles instead of the fixed handle passed in by React Flow — see
  // https://reactflow.dev/examples/edges/floating-edges
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  // ── Path calculation based on edge style ──────────────────────────────
  let path: string;
  let labelX: number;
  let labelY: number;

  if (edgeStyle === "floating" && sourceNode && targetNode) {
    const params = getFloatingEdgeParams(sourceNode, targetNode);
    [path, labelX, labelY] = getBezierPath({
      sourceX: params.sx,
      sourceY: params.sy,
      sourcePosition: params.sourcePos,
      targetX: params.tx,
      targetY: params.ty,
      targetPosition: params.targetPos,
    });
  } else if (edgeStyle === "floating-straight" && sourceNode && targetNode) {
    // Same live-recomputed attach points as "floating", but a straight line
    // between them instead of a bezier curve.
    const params = getFloatingEdgeParams(sourceNode, targetNode);
    [path, labelX, labelY] = getStraightPath({
      sourceX: params.sx,
      sourceY: params.sy,
      targetX: params.tx,
      targetY: params.ty,
    });
  } else if (edgeStyle === "straight") {
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

  // Resolves the fixed light/dark color-token palette, falling back to any
  // legacy raw hex the edge already carries (see utils/colors.ts). NOTE: the
  // stroke color is used AS-IS regardless of selection — selection used to
  // override it with a fixed indigo, which meant changing an edge's color
  // while it was selected produced no visible change. Selection is now shown
  // with a separate halo (below) so the real color is always what's on screen.
  const strokeColor = resolveEdgeColor(data, colorMode);
  const strokeWidth = data?.strokeWidth ?? 2;
  const arrowEnd = data?.arrowEnd ?? true;
  const arrowStart = data?.arrowStart ?? false;
  const selectedAccent = colorMode === "dark" ? "#818cf8" : "#6366f1";

  const haloEndMarkerId = `${id}-halo-end`;
  const haloStartMarkerId = `${id}-halo-start`;

  return (
    <>
      {/* Selection halo — a soft, wider duplicate of the path (+ duplicated,
          oversized arrowheads) drawn BEHIND the real edge. This makes the
          selected state obvious — including on the arrowheads themselves —
          without ever touching the edge's actual stroke/marker color, so a
          color change is visible immediately even while the edge stays selected. */}
      {selected && (
        <>
          <defs>
            {arrowEnd && (
              <marker
                id={haloEndMarkerId}
                markerWidth={26}
                markerHeight={26}
                refX={8}
                refY={5}
                orient="auto-start-reverse"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill={selectedAccent} fillOpacity={0.45} />
              </marker>
            )}
            {arrowStart && (
              <marker
                id={haloStartMarkerId}
                markerWidth={26}
                markerHeight={26}
                refX={2}
                refY={5}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M10,0 L0,5 L10,10 z" fill={selectedAccent} fillOpacity={0.45} />
              </marker>
            )}
          </defs>
          <path
            d={path}
            fill="none"
            stroke={selectedAccent}
            strokeOpacity={0.35}
            strokeWidth={strokeWidth + 6}
            strokeLinecap="round"
            markerEnd={arrowEnd ? `url(#${haloEndMarkerId})` : undefined}
            markerStart={arrowStart ? `url(#${haloStartMarkerId})` : undefined}
          />
        </>
      )}

      {/* The real edge path — color/width always reflect the actual data, selected or not */}
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          stroke: strokeColor,
          strokeWidth,
        }}
      />

      {/* Animated flow indicator — a small dot travelling along the path,
          shown only when data.animated is on (see reactflow "animating edges"). */}
      {data?.animated && (
        <circle r={Math.max(3, strokeWidth + 1.5)} fill={strokeColor}>
          <animateMotion dur="2.4s" repeatCount="indefinite" path={path} />
        </circle>
      )}

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

// ── Edge type registry — all styles map to the same CustomEdge component ──
// The actual path shape is determined by data.edgeStyle inside the component.
export const edgeTypes = {
  default: CustomEdge,
  straight: CustomEdge,
  step: CustomEdge,
  smoothstep: CustomEdge,
  floating: CustomEdge,
  "floating-straight": CustomEdge,
};
