"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ReactFlowProvider,
  useReactFlow,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLocale, useTranslations } from "next-intl";

import { ColorNode } from "./nodes/ColorNode";
import { ShapeNode } from "./nodes/ShapeNode";
import { ZoomNode } from "./nodes/ZoomNode";
import { OutputNode } from "./nodes/OutputNode";
import { FLOW_THEME, type ShapeType } from "./types";
import { Button } from "@/components/ui/button";

const nodeTypes = {
  colorNode: ColorNode,
  shapeNode: ShapeNode,
  zoomNode: ZoomNode,
  outputNode: OutputNode,
};

type HeroFlowNodeData = {
  label?: string;
  previewLabel?: string;
  color?: string;
  shape?: ShapeType;
  zoom?: number;
  options?: Array<{ value: ShapeType; label: string }>;
  isRtl?: boolean;
};

const FALLBACK_PRIMARY = "#ff0071";

function rgbToHex(color: string) {
  const parts = color.match(/\d+/g);
  if (!parts || parts.length < 3) return FALLBACK_PRIMARY;

  const [r, g, b] = parts.slice(0, 3).map(Number);
  const toHex = (value: number) => value.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function resolveThemeColor(cssValue: string) {
  if (typeof window === "undefined") return FALLBACK_PRIMARY;

  const probe = document.createElement("div");
  probe.style.color = cssValue;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";

  document.body.appendChild(probe);
  const computedColor = window.getComputedStyle(probe).color;
  document.body.removeChild(probe);

  return rgbToHex(computedColor);
}

function buildNodes(
  t: ReturnType<typeof useTranslations>,
  isRtl: boolean,
  initialColor: string,
): Node<HeroFlowNodeData>[] {
  const sourceHandlePosition = isRtl ? Position.Left : Position.Right;
  const targetHandlePosition = isRtl ? Position.Right : Position.Left;

  const positions = {
    c: isRtl ? { x: -55, y: 30 } : { x: 40, y: 30 },
    s: isRtl ? { x: -70, y: 100 } : { x: 20, y: 100 },
    z: isRtl ? { x: -60, y: 200 } : { x: 35, y: 200 },
    out: isRtl ? { x: -350, y: 40 } : { x: 210, y: 40 },
  };

  return [
  {
  id: "anchor",
  position: { x: isRtl ? 300 : -200, y: 0 }, 
  data: { isRtl },
  style: { width: 1, height: 1, opacity: 0, pointerEvents: "none" },
},
    {
      id: "c",
      type: "colorNode",
      position: positions.c,
      sourcePosition: sourceHandlePosition,
      data: { color: initialColor, label: t("colorPicker"), isRtl },
    },
    {
      id: "s",
      type: "shapeNode",
      position: positions.s,
      sourcePosition: sourceHandlePosition,
      data: {
        shape: "cuboids",
        label: t("geometry"),
        options: [
          { value: "cuboids", label: t("cubesGrid") },
          { value: "pyramids", label: t("pyramids") },
        ],
        isRtl,
      },
    },
    {
      id: "z",
      type: "zoomNode",
      position: positions.z,
      sourcePosition: sourceHandlePosition,
      data: { zoom: 50, label: t("scale"), isRtl },
    },
    {
      id: "out",
      type: "outputNode",
      position: positions.out,
      targetPosition: targetHandlePosition,
      data: {
        color: initialColor,
        shape: "cuboids",
        zoom: 50,
        previewLabel: t("preview"),
        isRtl,
      },
    },
  ];
}

const buildInitialEdges = (): Edge[] => [
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

function FlowInner({
  isRtl,
  initialColor,
}: {
  isRtl: boolean;
  initialColor: string;
}) {
  const t = useTranslations("Hero-Flow");
  const initialNodes = useMemo(
    () => buildNodes(t, isRtl, initialColor),
    [t, isRtl, initialColor],
  );
  const initialEdges = useMemo(() => buildInitialEdges(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNodes(buildNodes(t, isRtl, initialColor));
    setEdges(buildInitialEdges());
  }, [t, isRtl, initialColor, setNodes, setEdges]);

  const handleResize = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 200);
  }, [fitView]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleResize]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: FLOW_THEME.color, strokeWidth: 1.5 },
          },
          currentEdges,
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
      fitViewOptions={{ padding: 0.6 }}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      panOnScroll={false}
      preventScrolling={false}
      autoPanOnNodeDrag
      className="bg-transparent [&_.react-flow__attribution]:hidden"
      proOptions={{ hideAttribution: true }}
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

export function HeroFlow() {
  const t = useTranslations("Hero-Flow");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [initialColor, setInitialColor] = useState(FALLBACK_PRIMARY);

  useEffect(() => {
    setInitialColor(resolveThemeColor(FLOW_THEME.color));
  }, []);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="relative h-full w-full overflow-hidden bg-transparent"
      style={
        {
          "--theme": FLOW_THEME.color,
          "--theme-light": FLOW_THEME.light,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex max-w-xs flex-col items-start gap-4 rounded-3xl bg-transparent p-5 backdrop-blur-xs md:max-w-md">
            <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] leading-tight font-extrabold tracking-tight text-foreground">
              {t("title")}{" "}
              <span className="text-(--theme)">{t("version")}</span>
            </h1>

            <p className="text-[clamp(0.875rem,2.5vw,1.125rem)] font-medium text-muted-foreground text-left isrtl:text-right">
              {t("description")}
            </p>

            <ul className="mt-2 flex flex-col gap-3 text-[clamp(0.8rem,2vw,0.95rem)] font-medium text-muted-foreground">
              {[
                  t("feature01"),
                 t("feature02"),
                  t("feature03")
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--theme)/10 text-(--theme)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-left isrtl:text-right">{feature}</span>
                </li>
              ))}
            </ul>
<div className="pointer-events-auto mt-4">
              <Button
                asChild
                size="lg" 
                className="rounded-full text-white shadow-md transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: "var(--theme)" }} 
              >
                <a href="/ESP-Flow" className="flex items-center gap-2 px-4">
                  {t("tryNow")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isRtl
                        ? "rotate-180 group-hover/button:-translate-x-1"
                        : "group-hover/button:translate-x-1"
                    }`}
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
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-10">
        <ReactFlowProvider>
          <FlowInner isRtl={isRtl} initialColor={initialColor} />
        </ReactFlowProvider>
      </div>

      <div className="absolute inset-x-0 top-0 z-15 h-[15%] min-h-25 bg-linear-to-b from-background to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-15 h-[15%] min-h-25 bg-linear-to-t from-background to-transparent" />

    </div>
  );
}