"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ColorNode } from "./nodes/ColorNode";
import { ShapeNode } from "./nodes/ShapeNode";
import { ZoomNode } from "./nodes/ZoomNode";
import { OutputNode } from "./nodes/OutputNode";
import { FLOW_THEME } from "./types";

const nodeTypes = {
  colorNode: ColorNode,
  shapeNode: ShapeNode,
  zoomNode: ZoomNode,
  outputNode: OutputNode,
};

// Initial nodes and edges (保持之前定义的逻辑)
const initialNodes: Node[] = [
  {
    id: "anchor",
    position: { x: -200, y: 0 },
    data: {},
    style: { width: 1, height: 1, opacity: 0, pointerEvents: "none" },
  },
  {
    id: "c",
    type: "colorNode",
    position: { x: 40, y: 30 },
    data: { color: "#ff0071" },
  },
  {
    id: "s",
    type: "shapeNode",
    position: { x: 20, y: 100 },
    data: { shape: "cuboids" },
  },
  {
    id: "z",
    type: "zoomNode",
    position: { x: 35, y: 200 },
    data: { zoom: 50 },
  },
  {
    id: "out",
    type: "outputNode",
    position: { x: 210, y: 40 },
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
    style: { stroke: FLOW_THEME.color, strokeWidth: 1 },
  },
  {
    id: "e-shape",
    source: "s",
    sourceHandle: "shape",
    target: "out",
    targetHandle: "shape",
    animated: true,
    style: { stroke: FLOW_THEME.color, strokeWidth: 1 },
  },
  {
    id: "e-zoom",
    source: "z",
    sourceHandle: "zoom",
    target: "out",
    targetHandle: "zoom",
    animated: true,
    style: { stroke: FLOW_THEME.color, strokeWidth: 1 },
  },
];

/**
 * Internal component to access useReactFlow hooks
 */
function FlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to center the view with a small debounce
  const handleResize = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 200);
  }, [fitView]);

  useEffect(() => {
    // Add event listener for window resize
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleResize]);

  const onConnect = useCallback(
    (p: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...p,
            animated: true,
            style: { stroke: FLOW_THEME.color, strokeWidth: 1.5 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      panOnScroll={false}
      preventScrolling={false}
      // Enable auto pan when dragging near edges
      autoPanOnNodeDrag={true}
      className="bg-transparent"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.5}
        className="opacity-40 dark:opacity-20"
      />
    </ReactFlow>
  );
}

/**
 * Main HeroFlow Component
 * Wrapped in ReactFlowProvider to enable fitView and other hooks
 */
export function HeroFlow() {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-transparent"
      style={
        {
          "--theme": FLOW_THEME.color,
          "--theme-light": FLOW_THEME.light,
        } as React.CSSProperties
      }
    >
      {/* 
        Layer 1: Text Overlay (Purely Visual)
        Uses logical positioning (inset-inline-start) for RTL/LTR compatibility
      */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex max-w-xs flex-col items-start gap-4 rounded-3xl bg-white/5 p-5 backdrop-blur-md md:max-w-sm dark:bg-black/10">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
              ESP-Flow <span className="text-(--theme)">V26</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground md:text-base">
              The next generation of visual engineering for oil and gas
              infrastructure.
            </p>
            <div className="pointer-events-auto mt-2">
              <a
                href="/ESP-Flow"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-(--theme) px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-500 hover:brightness-110 hover:shadow-[0_0_20px_var(--theme)]"
              >
                <span className="absolute left-0 top-0 h-full w-full translate-x-[150%] bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[-150%]"></span>
                Try it now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Layer 2: React Flow Canvas
      */}
      <div
        className="absolute inset-0 z-10 h-full w-full"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
        }}
      >
        <ReactFlowProvider>
          <FlowInner />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
