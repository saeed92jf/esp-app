"use client";
import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { EngineeringObject } from "../render/EngineeringObject";
import type { HeroFlowData } from "../types";

export const OutputNode = memo(({ data }: NodeProps) => {
  const typedData = data as HeroFlowData;
  return (
    <div className="bg-white dark:bg-slate-800 flex h-[480px] w-[400px] flex-col rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] dark:hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
      <div className="bg-slate-50 dark:bg-slate-900 px-5 py-4 font-mono text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
        <span>PREVIEW_RENDER</span>
        <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
      </div>
      <div className="relative w-full flex-1">
        <Handle
          type="target"
          position={Position.Left}
          id="color"
          style={{
            top: "25%",
            background: "#4f46e5",
            width: 14,
            height: 14,
            border: "2px solid white",
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="shape"
          style={{
            top: "50%",
            background: "#4f46e5",
            width: 14,
            height: 14,
            border: "2px solid white",
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="zoom"
          style={{
            top: "75%",
            background: "#4f46e5",
            width: 14,
            height: 14,
            border: "2px solid white",
          }}
        />

        {/* کانویس درون این بخش رندر می‌شود */}
        <EngineeringObject
          color={typedData.color}
          shape={typedData.shape}
          zoom={typedData.zoom}
        />
      </div>
    </div>
  );
});
