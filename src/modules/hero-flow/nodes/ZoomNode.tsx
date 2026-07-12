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
    <div className="bg-white dark:bg-slate-800 flex w-48 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-all hover:shadow-[0_10px_30px_rgba(79,70,229,0.1)] dark:hover:shadow-[0_10px_30px_rgba(79,70,229,0.2)]">
      <div className="px-4 py-3 font-mono text-xs font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-2xl flex justify-between items-center">
        <span>Scale</span>
        <span className="text-[#4f46e5] dark:text-indigo-400 font-semibold">
          {zoom}%
        </span>
      </div>
      <div className="relative flex p-5">
        <input
          type="range"
          min={0}
          max={100}
          value={zoom || 50}
          onChange={handleChange}
          className="nodrag w-full accent-[#4f46e5] cursor-pointer"
        />
        <Handle
          type="source"
          id="zoom"
          position={Position.Right}
          className="h-3 w-3 bg-[#4f46e5] border-2 border-white dark:border-slate-800"
        />
      </div>
    </div>
  );
});
