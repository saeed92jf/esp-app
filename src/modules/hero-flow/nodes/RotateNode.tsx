"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { Slider } from "@/components/ui/slider";

type RotateNodeData = {
  rotation?: number;
  label?: string;
  isRtl?: boolean;
};

export const RotateNode = memo(({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const typedData = data as RotateNodeData;
  const rotation = typedData.rotation ?? 0;
  const label = typedData.label ?? "Rotation";
  const sourcePosition = typedData.isRtl ? Position.Left : Position.Right;

  const handleChange = (newValues: number[]) => {
    const newRotation = newValues[0];

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, rotation: newRotation } };
        }

        if (node.id === "out") {
          return { ...node, data: { ...node.data, rotation: newRotation } };
        }

        return node;
      }),
    );
  };

  return (
    <div dir={typedData.isRtl ? "rtl" : "ltr"} className="flex w-24 flex-col rounded-lg border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between rounded-t-lg border-b border-slate-200 bg-slate-50 px-2 py-1 font-sans text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <span>{label}</span>
        <span
          className="text-[7px] font-semibold"
          style={{ color: "var(--theme)" }}
        >
          {rotation}°
        </span>
      </div>

      <div className="relative flex p-3">
        <Slider
          min={0}
          max={360}
          value={[rotation]}
          onValueChange={handleChange}
          className="nodrag w-full cursor-pointer"
        />

        <Handle
          type="source"
          id="rotation"
          position={sourcePosition}
          className="pointer-events-none h-1.5 w-1.5 border-none border-black bg-black"
        />
      </div>
    </div>
  );
});

RotateNode.displayName = "RotateNode";
