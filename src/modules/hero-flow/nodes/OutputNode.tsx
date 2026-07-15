"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { EngineeringObject } from "../render/EngineeringObject";
import type { HeroFlowData } from "../types";

type OutputNodeData = HeroFlowData & {
  previewLabel?: string;
  isRtl?: boolean;
};

export const OutputNode = memo(({ data }: NodeProps) => {
  const typedData = data as OutputNodeData;
  const targetPosition = typedData.isRtl ? Position.Right : Position.Left;

  return (
    <div className="relative h-50 w-50">
      <Handle
        type="target"
        position={targetPosition}
        id="color"
        style={{
          top: "35%",
          background: "#000000",
          width: 6,
          height: 6,
          border: "none",
        }}
      />

      <Handle
        type="target"
        position={targetPosition}
        id="shape"
        style={{
          top: "50%",
          background: "#000000",
          width: 6,
          height: 6,
          border: "none",
        }}
      />

      <Handle
        type="target"
        position={targetPosition}
        id="zoom"
        style={{
          top: "65%",
          background: "#000000",
          width: 6,
          height: 6,
          border: "none",
        }}
      />

      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[7px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>{typedData.previewLabel ?? "PREVIEW"}</span>
          <span className="flex h-1 w-1 animate-pulse rounded-full bg-green-500" />
        </div>

        <div className="relative w-full flex-1 overflow-hidden bg-slate-50/30 dark:bg-slate-900/30">
          <EngineeringObject
            color={typedData.color}
            shape={typedData.shape}
            zoom={typedData.zoom}
          />
        </div>
      </div>
    </div>
  );
});

OutputNode.displayName = "OutputNode";
