"use client";
import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { EngineeringObject } from "../render/EngineeringObject";
import type { HeroFlowData } from "../types";

export const OutputNode = memo(({ data }: NodeProps) => {
  const typedData = data as HeroFlowData;
  return (
    <div className="relative h-50 w-50">
      <Handle
        type="target"
        position={Position.Left}
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
        position={Position.Left}
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
        position={Position.Left}
        id="zoom"
        style={{
          top: "65%",
          background: "#000000",
          width: 6,
          height: 6,
          border: "none",
        }}
      />

      <div className="h-full w-full flex flex-col rounded-lg shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900 px-2 py-1 font-mono text-[7px] font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10 shrink-0">
          <span>PREVIEW</span>
          <span className="flex h-1 w-1 rounded-full bg-green-500 animate-pulse"></span>
        </div>

        {/* اضافه شدن overflow-hidden برای ایزوله کردن دقیق کانویس در این بخش */}
        <div className="relative w-full flex-1 bg-slate-50/30 dark:bg-slate-900/30 overflow-hidden">
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
