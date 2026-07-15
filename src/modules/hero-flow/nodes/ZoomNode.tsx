"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";

type ZoomNodeData = {
  zoom?: number;
  label?: string;
  isRtl?: boolean;
};

export const ZoomNode = memo(({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const typedData = data as ZoomNodeData;
  const zoom = typedData.zoom ?? 50;
  const label = typedData.label ?? "Scale";
  const sourcePosition = typedData.isRtl ? Position.Left : Position.Right;

  // Keep the zoom value synchronized with the preview node without triggering a full rerender cycle.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(event.target.value);

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, zoom: newZoom } };
        }

        if (node.id === "out") {
          return { ...node, data: { ...node.data, zoom: newZoom } };
        }

        return node;
      }),
    );
  };

  return (
    <div className="flex w-24 flex-col rounded-lg border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between rounded-t-lg border-b border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <span>{label}</span>
        <span
          className="text-[7px] font-semibold"
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
          value={zoom}
          onChange={handleChange}
          className="nodrag h-0.75 w-full cursor-pointer"
          style={{ accentColor: "var(--theme)" }}
        />

        <Handle
          type="source"
          id="zoom"
          position={sourcePosition}
          className="h-1.5 w-1.5 border-none border-black bg-black"
        />
      </div>
    </div>
  );
});

ZoomNode.displayName = "ZoomNode";
