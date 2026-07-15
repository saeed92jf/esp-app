"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { ShapeType } from "../types";

type ShapeOption = {
  value: ShapeType;
  label: string;
};

type ShapeNodeData = {
  shape?: ShapeType;
  label?: string;
  options?: ShapeOption[];
  isRtl?: boolean;
};

export const ShapeNode = memo(({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const typedData = data as ShapeNodeData;
  const shape = typedData.shape ?? "cuboids";
  const label = typedData.label ?? "Geometry";
  const options = typedData.options ?? [];
  const sourcePosition = typedData.isRtl ? Position.Left : Position.Right;

  // Keep the selected shape synchronized with the preview node without rebuilding the canvas.
  const handleChange = (newShape: ShapeType) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, shape: newShape } };
        }

        if (node.id === "out") {
          return { ...node, data: { ...node.data, shape: newShape } };
        }

        return node;
      }),
    );
  };

  return (
    <div className="flex w-24 flex-col rounded-lg border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="rounded-t-lg border-b border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {label}
      </div>

      <div className="relative flex flex-col gap-1 p-1">
        {options.map((option) => {
          const isActive = shape === option.value;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border p-1 text-[7px] font-semibold transition-colors ${
                isActive
                  ? ""
                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
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
                onChange={() => handleChange(option.value)}
                className="nodrag hidden"
              />

              <div
                className={`h-1.5 w-1.5 shrink-0 rounded-full border border-solid ${
                  isActive ? "" : "border-slate-300 dark:border-slate-600"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--theme)",
                        borderColor: "var(--theme)",
                      }
                    : {}
                }
              />
              {option.label}
            </label>
          );
        })}

        <Handle
          type="source"
          id="shape"
          position={sourcePosition}
          className="h-1.5 w-1.5 border-none border-black bg-black"
        />
      </div>
    </div>
  );
});

ShapeNode.displayName = "ShapeNode";
