"use client";
import { memo } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";

export const ColorNode = memo(({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const color = data.color as string;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) return { ...n, data: { ...n.data, color: newColor } };
        if (n.id === "out") return { ...n, data: { ...n.data, color: newColor } };
        return n;
      })
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 flex w-48 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-all hover:shadow-[0_10px_30px_rgba(79,70,229,0.1)] dark:hover:shadow-[0_10px_30px_rgba(79,70,229,0.2)]">
      <div className="px-4 py-3 font-mono text-xs font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-2xl">Color Picker</div>
      <div className="relative flex rounded-b-2xl p-4">
        <div className="flex w-full items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <input
            type="color"
            value={color || "#ff0071"}
            onChange={handleChange}
            className="nodrag h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shadow-sm"
          />
          <p className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{(color || "#ff0071").toUpperCase()}</p>
        </div>
        <Handle type="source" id="color" position={Position.Right} className="h-3 w-3 bg-[#4f46e5] border-2 border-white dark:border-slate-800" />
      </div>
    </div>
  );
});