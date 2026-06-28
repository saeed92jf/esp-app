// src/components/flow-general/nodes/DynamicNode.tsx
import React, { useMemo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { DynamicNodeData } from "../types";

/**
 * Local type for style fields stored inside the node's data object.
 * DynamicNodeData extends Record<string, unknown>, so these fields are valid
 * at runtime — this interface just tells TypeScript what shapes to expect.
 */
interface NodeStyleData {
  shape?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  label?: string;
  width?: number;
  height?: number;
  handles?: Array<{
    id: string;
    type: string;
    position: string;
    label?: string;
  }>;
}

/**
 * Dynamic Node Component
 * Renders any node shape based on DynamicNodeData configuration.
 *
 * NOTE: `width` and `height` were removed from NodeProps in @xyflow/react v12.
 * They are now read from the node's `data` object instead.
 */
export const DynamicNode: React.FC<NodeProps<Node<DynamicNodeData>>> = ({
  data,
  selected,
}) => {
  // Cast data to NodeStyleData so TypeScript knows the shape of the style fields.
  // This is safe: DynamicNodeData extends Record<string, unknown>, so any key is
  // valid at runtime. The cast only affects compile-time type checking.
  const styleData = (data ?? {}) as NodeStyleData;

  const {
    shape = "rectangle",
    color = "#f1f5f9",
    borderColor = "#cbd5e1",
    borderWidth = 1,
    textColor = "#334155",
    label = "Node",
    width = 160,
    height = 80,
    handles = [],
  } = styleData;

  // Build SVG path for various shapes
  const shapePath = useMemo(() => {
    switch (shape) {
      case "circle":
        return `M ${width / 2},0 A ${width / 2},${width / 2} 0 1,1 ${width / 2},${height} A ${width / 2},${height / 2} 0 1,1 ${width / 2},0 Z`;
      case "hexagon": {
        const w = width / 2;
        const h = height / 2;
        const inset = width * 0.25;
        return `M ${inset},0 L ${w + inset},0 L ${width},${h} L ${w + inset},${height} L ${inset},${height} L 0,${h} Z`;
      }
      case "diamond": {
        const w = width / 2;
        const h = height / 2;
        return `M ${w},0 L ${width},${h} L ${w},${height} L 0,${h} Z`;
      }
      case "ellipse":
        return `M 0,${height / 2} A ${width / 2},${height / 2} 0 1,1 ${width},${height / 2} A ${width / 2},${height / 2} 0 1,1 0,${height / 2} Z`;
      default:
        return "M 0,0 L 0,0 L 0,0 L 0,0 Z";
    }
  }, [shape, width, height]);

  return (
    <>
      {/* Target Handles */}
      {handles.map(
        (h) =>
          h.type === "target" && (
            <Handle
              key={h.id}
              id={h.id}
              type="target"
              position={
                h.position === "top"
                  ? Position.Top
                  : h.position === "right"
                    ? Position.Right
                    : h.position === "bottom"
                      ? Position.Bottom
                      : Position.Left
              }
              style={{ background: "#5B8DEF" }}
            />
          ),
      )}

      {/* Main Node Body */}
      <div
        style={{
          width,
          height,
          backgroundColor: color,
          borderColor,
          borderWidth,
          borderRadius: shape === "rounded-rectangle" ? 8 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderStyle: "solid",
          boxShadow: selected ? "0 0 0 2px #3b82f6" : "none",
        }}
      >
        <span style={{ color: textColor }}>{label}</span>
      </div>

      {/* Source Handles */}
      {handles.map(
        (h) =>
          h.type === "source" && (
            <Handle
              key={h.id}
              id={h.id}
              type="source"
              position={
                h.position === "top"
                  ? Position.Top
                  : h.position === "right"
                    ? Position.Right
                    : h.position === "bottom"
                      ? Position.Bottom
                      : Position.Left
              }
              style={{ background: "#5B8DEF" }}
            />
          ),
      )}
    </>
  );
};
