import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { DiagramNodeData } from "../../types/diagram.types";
import { getNodeShapeClasses, getNodeShapeStyle } from "../../utils/nodeShapes";
import { cn } from "@/lib/utils";
interface BaseNodeProps extends NodeProps {
  data: DiagramNodeData;
  selected?: boolean;
}
// Base node component - all shape types render through this component.
// Handles rendering of shape, style, icon, label, description,
// selection ring, locked state, and all four connection handles.
const BaseNode = memo(function BaseNode({ data, selected }: BaseNodeProps) {
  const { label, description, shape, style, locked } = data;
  // Build animation class based on node style setting
  const animationClass: Record<string, string> = {
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    spin: "animate-spin",
    ping: "animate-ping",
    none: "",
  };
  const containerStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    borderColor: selected ? "#6366f1" : style.borderColor,
    borderWidth: style.borderWidth,
    borderRadius:
      shape === "circle" ? "50%" :
      shape === "rounded" ? "1rem" :
      `${style.borderRadius}px`,
    color: style.textColor,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    opacity: style.opacity,
    width: "100%",
    height: "100%",
    ...getNodeShapeStyle(shape),
  };
  // Map shadow setting to Tailwind shadow class
  const shadowClass = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  }[style.shadow] ?? "";
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        "border select-none overflow-hidden",
        "transition-all duration-200",
        getNodeShapeClasses(shape),
        shadowClass,
        animationClass[style.animation] ?? "",
        selected && "ring-2 ring-indigo-500 ring-offset-1",
        locked && "cursor-not-allowed opacity-70"
      )}
      style={containerStyle}
      aria-label={label}
      role="figure"
    >
      {/* Node icon if set */}
      {data.icon && (
        <span className="text-base mb-0.5" aria-hidden="true">
          {data.icon}
        </span>
      )}
      {/* Primary label */}
      <span className="px-2 text-center leading-tight font-medium truncate w-full text-center">
        {label}
      </span>
      {/* Optional description sub-label */}
      {description && (
        <span
          className="text-[10px] opacity-60 px-1 truncate w-full text-center"
          title={description}
        >
          {description}
        </span>
      )}
      {/* Locked badge */}
      {locked && (
        <span className="absolute top-1 right-1 text-[10px] opacity-50">🔒</span>
      )}
      {/* Connection handles - all four sides */}
      <Handle type="target" position={Position.Top}    className="!w-2 !h-2 !bg-indigo-400" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-400" />
      <Handle type="target" position={Position.Left}   className="!w-2 !h-2 !bg-indigo-400" />
      <Handle type="source" position={Position.Right}  className="!w-2 !h-2 !bg-indigo-400" />
    </div>
  );
});
export default BaseNode;
