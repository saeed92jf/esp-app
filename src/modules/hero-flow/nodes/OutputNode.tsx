"use client";

import { memo, useState } from "react";
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
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div dir={typedData.isRtl ? "rtl" : "ltr"} className="relative w-[220px] h-[220px] sm:w-[240px] sm:h-[240px]">


      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200/20 bg-white/20 backdrop-blur-[2px] shadow-sm dark:border-slate-700/20 dark:bg-slate-800/20">
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200/20 bg-slate-50/20 px-2 py-1 font-sans text-[7px] font-bold text-slate-700 dark:border-slate-700/20 dark:bg-slate-900/20 dark:text-slate-200">
          <span>{typedData.previewLabel ?? "PREVIEW"}</span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500 dark:text-slate-400"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500 dark:text-slate-400"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              )}
            </button>
            <span className="flex h-1 w-1 animate-pulse rounded-full bg-green-500" />
          </div>
        </div>

        <div className="relative w-full flex-1 overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
          <EngineeringObject
            rotation={typedData.rotation}
            shape={typedData.shape}
            zoom={typedData.zoom}
            compact={true}
            isRtl={typedData.isRtl}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      <Handle
        type="target"
        position={targetPosition}
        id="rotation"
        style={{
          top: "35%",
          background: "#000000",
          width: 6,
          height: 6,
          border: "none",
          zIndex: 50,
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
          zIndex: 50,
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
          zIndex: 50,
        }}
      />
    </div>
  );
});

OutputNode.displayName = "OutputNode";
