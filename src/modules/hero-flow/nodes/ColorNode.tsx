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
        if (n.id === "out")
          return { ...n, data: { ...n.data, color: newColor } };
        return n;
      }),
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 flex w-24 flex-col rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
      <div className="px-2 py-1 font-mono text-[8px] font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg">
        Color Picker
      </div>
      <div className="relative flex rounded-b-lg p-1">
        <div className="flex w-full items-center gap-1 bg-slate-50 dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-700">
          <input
            type="color"
            value={color || "#ff0071"}
            onChange={handleChange}
            className="nodrag h-3 w-3 cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shadow-sm"
          />
          <p className="font-mono text-[7px] font-medium text-slate-700 dark:text-slate-300">
            {(color || "#ff0071").toUpperCase()}
          </p>
        </div>
        <Handle
          type="source"
          id="color"
          position={Position.Right}
          className="h-1.5 w-1.5 bg-black border-black border-none"
        />
      </div>
    </div>
  );
});
