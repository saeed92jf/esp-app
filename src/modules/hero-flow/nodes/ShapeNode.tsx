"use client";
import { memo } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";

export const ShapeNode = memo(({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const shape = data.shape as string;

  const handleChange = (newShape: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) return { ...n, data: { ...n.data, shape: newShape } };
        if (n.id === "out")
          return { ...n, data: { ...n.data, shape: newShape } };
        return n;
      }),
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 flex w-48 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-all hover:shadow-[0_10px_30px_rgba(79,70,229,0.1)] dark:hover:shadow-[0_10px_30px_rgba(79,70,229,0.2)]">
      <div className="px-4 py-3 font-mono text-xs font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-2xl">
        Geometry
      </div>
      <div className="relative flex flex-col gap-2 p-4">
        {[
          { val: "cuboids", label: "Cubes Grid" },
          { val: "pyramids", label: "Pyramids" },
        ].map((s) => (
          <label
            key={s.val}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 text-xs font-semibold transition-all ${shape === s.val ? "bg-[#4f46e5]/10 border-[#4f46e5]/30 text-[#4f46e5] dark:text-indigo-400" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            <input
              type="radio"
              checked={shape === s.val}
              onChange={() => handleChange(s.val)}
              className="nodrag hidden"
            />
            <div
              className={`h-3 w-3 rounded-full border-2 ${shape === s.val ? "border-[#4f46e5] bg-[#4f46e5]" : "border-slate-300 dark:border-slate-600"}`}
            ></div>
            {s.label}
          </label>
        ))}
        <Handle
          type="source"
          id="shape"
          position={Position.Right}
          className="h-3 w-3 bg-[#4f46e5] border-2 border-white dark:border-slate-800"
        />
      </div>
    </div>
  );
});
