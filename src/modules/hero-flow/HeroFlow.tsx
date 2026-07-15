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
    c: isRtl ? { x: -200, y: 30 } : { x: 40, y: 30 },
    s: isRtl ? { x: -210, y: 100 } : { x: 20, y: 100 },
    z: isRtl ? { x: -250, y: 200 } : { x: 35, y: 200 },
    out: isRtl ? { x: -500, y: 40 } : { x: 210, y: 40 },
  };

  return [
    {
      id: "anchor",
      position: { x: -200, y: 0 },
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
      fitViewOptions={{ padding: 0.2 }}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      panOnScroll={false}
      preventScrolling={false}
      autoPanOnNodeDrag
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
          <div className="flex max-w-xs flex-col items-start gap-4 rounded-3xl bg-white/5 p-5 backdrop-blur-md md:max-w-sm dark:bg-black/10">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {t("title")}{" "}
              <span className="text-(--theme)">{t("version")}</span>
            </h1>

            <p className="text-sm font-medium text-muted-foreground md:text-base">
              {t("description")}
            </p>

            <div className="pointer-events-auto mt-2">
              <a
                href="/ESP-Flow"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-(--theme) px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-500 hover:brightness-110 hover:shadow-[0_0_20px_var(--theme)]"
              >
                <span className="absolute left-0 top-0 h-full w-full translate-x-[150%] bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[-150%]"></span>
                {t("tryNow")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-300 ${
                    isRtl
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
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
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10">
        <ReactFlowProvider>
          <FlowInner isRtl={isRtl} initialColor={initialColor} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
