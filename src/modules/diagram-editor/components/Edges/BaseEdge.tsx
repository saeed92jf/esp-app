import React, { memo } from "react";
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge as FlowBaseEdge,
  type EdgeProps,} from "@xyflow/react";
import type { DiagramEdgeData } from "../../types/diagram.types";
interface DiagramEdgeProps extends EdgeProps {
  data?: DiagramEdgeData;
}
// Custom edge component supporting dashed/dotted lines, custom colors,
// stroke width, animated flow, and an inline editable label.
const BaseEdge = memo(function BaseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  label,
}: DiagramEdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });
  // Build stroke-dasharray based on line style
  const strokeDasharray =
    data?.lineStyle === "dashed" ? "8 4" :
    data?.lineStyle === "dotted" ? "2 4" :
    undefined;
  const strokeColor = selected ? "#6366f1" : (data?.strokeColor ?? "#6366f1");
  const strokeWidth = data?.strokeWidth ?? 2;
  // Determine marker ids based on arrow settings
  const markerStart =
    data?.arrowStart && data.arrowStart !== "none"
      ? `url(#${data.arrowStart})`
      : undefined;
  const markerEnd =
    data?.arrowEnd && data.arrowEnd !== "none"
      ? `url(#${data.arrowEnd})`
      : undefined;
  return (
    <>
      <FlowBaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          animation: data?.animated
            ? "dashdraw 0.5s linear infinite"
            : undefined,
        }}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      {/* Render edge label in the middle of the path */}
      {(data?.label || label) && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="absolute bg-white dark:bg-zinc-800 text-xs px-2 py-0.5 rounded
                       border border-zinc-200 dark:border-zinc-700 shadow-sm
                       text-zinc-700 dark:text-zinc-300 select-none"
          >
            {data?.label ?? String(label ?? "")}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
export default BaseEdge;
