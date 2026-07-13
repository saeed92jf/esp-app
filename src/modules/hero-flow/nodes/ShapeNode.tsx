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
    <div className="bg-white dark:bg-slate-800 flex w-24 flex-col rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
      <div className="px-2 py-1 font-mono text-[8px] font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg">
        Geometry
      </div>
      <div className="relative flex flex-col gap-1 p-1">
        {[
          { val: "cuboids", label: "Cubes Grid" },
          { val: "pyramids", label: "Pyramids" },
        ].map((s) => {
          const isActive = shape === s.val;
          return (
            <label
              key={s.val}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border p-1 text-[7px] font-semibold transition-colors ${!isActive ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300" : ""}`}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--theme-light)",
                      borderColor: "var(--theme)",
                      color: "var(--theme)",
                    }
                  : {}
              }
            >
              <input
                type="radio"
                checked={isActive}
                onChange={() => handleChange(s.val)}
                className="nodrag hidden"
              />
              <div
                className={`h-1.5 w-1.5 rounded-full border border-solid shrink-0 ${!isActive ? "border-slate-300 dark:border-slate-600" : ""}`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--theme)",
                        borderColor: "var(--theme)",
                      }
                    : {}
                }
              ></div>
              {s.label}
            </label>
          );
        })}
        <Handle
          type="source"
          id="shape"
          position={Position.Right}
          className="h-1.5 w-1.5 bg-black border-black border-none"
        />
      </div>
    </div>
  );
});
