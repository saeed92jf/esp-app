"use client";
import { memo } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";

export const ZoomNode = memo(({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const zoom = data.zoom as number;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) return { ...n, data: { ...n.data, zoom: newZoom } };
        if (n.id === "out") return { ...n, data: { ...n.data, zoom: newZoom } };
        return n;
      }),
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 flex w-24 flex-col rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
      <div className="px-2 py-1 font-mono text-[8px] font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg flex justify-between items-center">
        <span>Scale</span>
        <span
          className="font-semibold text-[7px]"
          style={{ color: "var(--theme)" }}
        >
          {zoom}%
        </span>
      </div>
      <div className="relative flex p-3">
        <input
          type="range"
          min={0}
          max={100}
          value={zoom || 50}
          onChange={handleChange}
          className="nodrag w-full h-0.75 cursor-pointer"
          style={{ accentColor: "var(--theme)" }}
        />
        <Handle
          type="source"
          id="zoom"
          position={Position.Right}
          className="h-1.5 w-1.5 bg-black border-black border-none"
        />
      </div>
    </div>
  );
});
