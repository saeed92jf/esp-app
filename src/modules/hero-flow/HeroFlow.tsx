"use client";
import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ColorNode } from "./nodes/ColorNode";
import { ShapeNode } from "./nodes/ShapeNode";
import { ZoomNode } from "./nodes/ZoomNode";
import { OutputNode } from "./nodes/OutputNode";

const nodeTypes = {
  colorNode: ColorNode,
  shapeNode: ShapeNode,
  zoomNode: ZoomNode,
  outputNode: OutputNode,
};

const PRIMARY_COLOR = "#4f46e5";

const initialNodes: Node[] = [
  {
    id: "c",
    type: "colorNode",
    position: { x: -280, y: 150 },
    data: { color: "#ff0071" },
  },
  {
    id: "s",
    type: "shapeNode",
    position: { x: -280, y: 280 },
    data: { shape: "cuboids" },
  },
  {
    id: "z",
    type: "zoomNode",
    position: { x: -280, y: 410 },
    data: { zoom: 50 },
  },
  {
    id: "out",
    type: "outputNode",
    position: { x: 50, y: 120 },
    data: { color: "#ff0071", shape: "cuboids", zoom: 50 },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-color",
    source: "c",
    sourceHandle: "color",
    target: "out",
    targetHandle: "color",
    animated: true,
    style: { stroke: PRIMARY_COLOR, strokeWidth: 3 },
  },
  {
    id: "e-shape",
    source: "s",
    sourceHandle: "shape",
    target: "out",
    targetHandle: "shape",
    animated: true,
    style: { stroke: PRIMARY_COLOR, strokeWidth: 3 },
  },
  {
    id: "e-zoom",
    source: "z",
    sourceHandle: "zoom",
    target: "out",
    targetHandle: "zoom",
    animated: true,
    style: { stroke: PRIMARY_COLOR, strokeWidth: 3 },
  },
];

export function HeroFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (p: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...p,
            animated: true,
            style: { stroke: PRIMARY_COLOR, strokeWidth: 3 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <div
      // پس‌زمینه در اینجا کاملا ترانسپرنت شده است
      className="h-[750px] w-full relative bg-transparent overflow-hidden"
      style={{
        maskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
      }}
    >
      {/* سایز متن و دکمه به شکل مینیمال و کوچکتر تغییر یافت */}
      <div className="absolute top-8 left-8 z-10 flex flex-col items-start gap-3 pointer-events-none">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight drop-shadow-md">
          ESP-Flow <span className="text-[#4f46e5]">v031</span>
        </h1>
        <button className="pointer-events-auto bg-[#4f46e5] text-white px-4 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-[#4338ca] transition-all flex items-center gap-1.5">
          Try it now
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={2}
          className="opacity-50 dark:opacity-30"
        />
        <Controls
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg rounded-xl overflow-hidden [&>button]:border-slate-200 dark:[&>button]:border-slate-700 [&>button]:hover:bg-slate-100 dark:[&>button]:hover:bg-slate-700 [&>button]:text-[#4f46e5] dark:[&>button]:text-indigo-400 [&>button]:fill-current"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
