// src/components/flow-general/nodes/DynamicNode.tsx
"use client";
import React, { useMemo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { DynamicNodeData } from "../types";

interface NodeStyleData {
  shape?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  label?: string;
  description?: string;
  url?: string;
  width?: number;
  height?: number;
  handles?: Array<{
    id: string;
    type: string;
    position: string;
    label?: string;
  }>;
}

function mapPos(pos: string): Position {
  switch (pos) {
    case "top":
      return Position.Top;
    case "right":
      return Position.Right;
    case "bottom":
      return Position.Bottom;
    default:
      return Position.Left;
  }
}

function buildPath(shape: string, w: number, h: number): string {
  switch (shape) {
    case "circle": {
      const r = Math.min(w, h) / 2 - 1;
      const [cx, cy] = [w / 2, h / 2];
      return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;
    }
    case "ellipse": {
      const [rx, ry, cx, cy] = [w / 2 - 1, h / 2 - 1, w / 2, h / 2];
      return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy}`;
    }
    case "diamond":
      return `M ${w / 2},1 L ${w - 1},${h / 2} L ${w / 2},${h - 1} L 1,${h / 2} Z`;
    case "hexagon": {
      const dx = w * 0.25;
      return `M ${dx},1 L ${w - dx},1 L ${w - 1},${h / 2} L ${w - dx},${h - 1} L ${dx},${h - 1} L 1,${h / 2} Z`;
    }
    case "octagon": {
      const [dx, dy] = [w * 0.3, h * 0.3];
      return `M ${dx},1 L ${w - dx},1 L ${w - 1},${dy} L ${w - 1},${h - dy} L ${w - dx},${h - 1} L ${dx},${h - 1} L 1,${h - dy} L 1,${dy} Z`;
    }
    case "parallelogram": {
      const sk = w * 0.15;
      return `M ${sk},1 L ${w - 1},1 L ${w - sk},${h - 1} L 1,${h - 1} Z`;
    }
    case "rounded-rectangle": {
      const r = Math.min(10, w / 4, h / 4);
      return (
        `M ${r},1 L ${w - r},1 Q ${w - 1},1 ${w - 1},${r} ` +
        `L ${w - 1},${h - r} Q ${w - 1},${h - 1} ${w - r},${h - 1} ` +
        `L ${r},${h - 1} Q 1,${h - 1} 1,${h - r} ` +
        `L 1,${r} Q 1,1 ${r},1 Z`
      );
    }
    default: // rectangle
      return `M 1,1 L ${w - 1},1 L ${w - 1},${h - 1} L 1,${h - 1} Z`;
  }
}

export const DynamicNode: React.FC<NodeProps<Node<DynamicNodeData>>> = ({
  data,
  selected,
}) => {
  const s = (data ?? {}) as NodeStyleData;
  const {
    shape = "rounded-rectangle",
    color = "#f1f5f9",
    borderColor = "#cbd5e1",
    borderWidth = 1,
    textColor = "#334155",
    label = "",
    url,
    width = 160,
    height = 80,
    handles = [],
  } = s;

  const path = useMemo(
    () => buildPath(shape, width, height),
    [shape, width, height],
  );

  return (
    <div style={{ width, height, position: "relative" }}>
      {handles.map((h) =>
        h.type === "target" ? (
          <Handle
            key={h.id}
            id={h.id}
            type="target"
            position={mapPos(h.position)}
            className="w-2.5! h-2.5! border-2! border-white! bg-slate-400!"
          />
        ) : null,
      )}

      {/* SVG shape */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <path
          d={path}
          fill={color}
          stroke={selected ? "#3b82f6" : (borderColor ?? "#94a3b8")}
          strokeWidth={selected ? borderWidth + 1.5 : borderWidth}
          filter={
            selected ? "drop-shadow(0 0 6px rgba(59,130,246,0.4))" : undefined
          }
        />
      </svg>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textColor,
          fontSize: 12,
          fontWeight: 500,
          padding: "6px 8px",
          textAlign: "center",
          wordBreak: "break-word",
          pointerEvents: "none",
          zIndex: 1,
          lineHeight: 1.35,
        }}
      >
        {label}
      </div>

      {/* URL badge — visible when node has a link */}
      {url && (
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 7,
            color: "#fff",
            fontWeight: 700,
            zIndex: 2,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ↗
        </div>
      )}

      {handles.map((h) =>
        h.type === "source" ? (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={mapPos(h.position)}
            className="w-2.5! h-2.5! border-2! border-white! bg-blue-400!"
          />
        ) : null,
      )}
    </div>
  );
};
