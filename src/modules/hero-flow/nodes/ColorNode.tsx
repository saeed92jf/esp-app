"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";

type ColorNodeData = {
  color?: string;
  label?: string;
  isRtl?: boolean;
};

export const ColorNode = memo(({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const typedData = data as ColorNodeData;
  const color = typedData.color ?? "var(--color-primary)";
  const label = typedData.label ?? "Color Picker";
  const sourcePosition = typedData.isRtl ? Position.Left : Position.Right;

  // Keep the color state synchronized with the preview node without resetting the flow.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, color: newColor } };
        }

        if (node.id === "out") {
          return { ...node, data: { ...node.data, color: newColor } };
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

      <div className="relative flex rounded-b-lg p-1">
        <div className="flex w-full items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900">
          <input
            type="color"
            value={color}
            onChange={handleChange}
            className="nodrag h-3 w-3 cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none shadow-sm [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
          />
          <p className="font-mono text-[7px] font-medium text-slate-700 dark:text-slate-300">
            {color.toUpperCase()}
          </p>
        </div>

        <Handle
          type="source"
          id="color"
          position={sourcePosition}
          className="h-1.5 w-1.5 border-none border-black bg-black"
        />
      </div>
    </div>
  );
});

ColorNode.displayName = "ColorNode";
