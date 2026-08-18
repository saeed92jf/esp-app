"use client";

import React, { useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals, useNodeId } from "@xyflow/react";
import type { DiagramNodeData } from "../../../types";
import { FLOW_HANDLE_SOURCE, FLOW_HANDLE_TARGET } from "../../../utils/handles";

interface VesselHandlesProps {
  id?: string;
  data: DiagramNodeData;
}

export function VesselHandles({ id, data }: VesselHandlesProps) {
  const updateNodeInternals = useUpdateNodeInternals();
  const contextNodeId = useNodeId();
  const nodeId = id || contextNodeId;

  const config = data.vesselHandlesConfig || {
    sourceCount: 1,
    targetCount: 1,
    positionMode: "left-right" as const,
  };

  const { sourceCount, targetCount, positionMode } = config;

  useEffect(() => {
    if (nodeId) {
      updateNodeInternals(nodeId);
      const rAF = requestAnimationFrame(() => {
        updateNodeInternals(nodeId);
      });
      return () => cancelAnimationFrame(rAF);
    }
  }, [nodeId, sourceCount, targetCount, positionMode, updateNodeInternals]);

  const getTargetPosition = () => {
    switch (positionMode) {
      case "top-bottom": return Position.Top;
      case "bottom-top": return Position.Bottom;
      case "left-right": return Position.Left;
      case "right-left": return Position.Right;
    }
  };

  const getSourcePosition = () => {
    switch (positionMode) {
      case "top-bottom": return Position.Bottom;
      case "bottom-top": return Position.Top;
      case "left-right": return Position.Right;
      case "right-left": return Position.Left;
    }
  };

  const targetPosition = getTargetPosition();
  const sourcePosition = getSourcePosition();

  const renderHandles = (type: "source" | "target", count: number, pos: Position) => {
    const handleClass = type === "source" ? FLOW_HANDLE_SOURCE : FLOW_HANDLE_TARGET;

    return Array.from({ length: count }).map((_, i) => {
      // Calculate evenly spaced percentage
      const percent = `${((i + 1) * 100) / (count + 1)}%`;
      
      const style: React.CSSProperties = {};
      if (pos === Position.Top || pos === Position.Bottom) {
        style.left = percent;
      } else {
        style.top = percent;
      }

      return (
        <Handle
          key={`${type}-${i}`}
          type={type}
          position={pos}
          id={`${type}-${i}`}
          className={handleClass}
          style={style}
        />
      );
    });
  };

  return (
    <>
      {renderHandles("target", targetCount, targetPosition)}
      {renderHandles("source", sourceCount, sourcePosition)}
    </>
  );
}
