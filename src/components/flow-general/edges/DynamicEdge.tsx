// src/components/flow-general/edges/DynamicEdge.tsx
/**
 * Dynamic edge component that renders based on registered connection type definition.
 * Supports different path styles, colors, and animations.
 */

import React from "react";
import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  getStraightPath,
  getBezierPath,
  EdgeLabelRenderer,
  type Edge,
} from "@xyflow/react";
import type { DynamicEdgeData } from "../types";
import { getConnectionType } from "../utils/registry";

// Parameters shared by all path functions
interface PathParams {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition?: import("@xyflow/react").Position;
  targetPosition?: import("@xyflow/react").Position;
}

/**
 * Unified path resolver that returns [path, labelX, labelY].
 * Handles the different signatures of each path utility function.
 * Note: Some path functions return 5 elements, we only use the first 3.
 */
const resolvePath = (
  pathStyle: string,
  params: PathParams,
): [string, number, number] => {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } =
    params;

  switch (pathStyle) {
    case "smoothstep":
    case "step": {
      // getSmoothStepPath returns [path, labelX, labelY, offsetX, offsetY]
      const [path, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
      return [path, labelX, labelY];
    }
    case "straight": {
      const [path, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
      return [path, labelX, labelY];
    }
    case "bezier":
    default: {
      // getBezierPath returns [path, labelX, labelY, offsetX, offsetY]
      const [path, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
      return [path, labelX, labelY];
    }
  }
};

// Use the full Edge generic so React Flow resolves data correctly
type DynamicEdgeProps = EdgeProps<Edge<DynamicEdgeData>>;

export const DynamicEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: DynamicEdgeProps) => {
  const connectionTypeId =
    data && "connectionTypeId" in data ? (data.connectionTypeId as string) : "";

  const connectionType = getConnectionType(connectionTypeId);

  // Invalid connection type fallback
  if (!connectionType) {
    const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });

    return (
      <BaseEdge
        id={id}
        path={path}
        style={{ stroke: "#f00", strokeWidth: 2 }}
      />
    );
  }

  const {
    color,
    pathStyle,
    strokeWidth = 2,
    animation,
    showArrow = true,
    strokeDasharray,
    allowLabel,
  } = connectionType;

  const [edgePath, labelX, labelY] = resolvePath(pathStyle, {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  // Build style object
  const edgeStyle: React.CSSProperties = {
    stroke: color,
    strokeWidth,
    strokeDasharray,
  };

  // Add animation if enabled
  if (animation?.enabled) {
    const duration = animation.duration ?? 2;
    const direction = animation.direction === "reverse" ? "reverse" : "normal";

    edgeStyle.animation = `dashdraw ${duration}s linear infinite`;
    edgeStyle.animationDirection = direction;

    if (!strokeDasharray) {
      edgeStyle.strokeDasharray = `${strokeWidth * 5} ${strokeWidth * 5}`;
    }
  }

  const edgeLabel =
    data && "label" in data ? (data.label as string | undefined) : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={showArrow ? markerEnd : undefined}
        style={edgeStyle}
      />

      {allowLabel && edgeLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan bg-white px-2 py-1 rounded shadow-sm text-xs border border-gray-200"
          >
            {edgeLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
