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

import { RotateNode } from "./nodes/RotateNode";
import { ShapeNode } from "./nodes/ShapeNode";
import { ZoomNode } from "./nodes/ZoomNode";
import { OutputNode } from "./nodes/OutputNode";
import { FLOW_THEME, type ShapeType } from "./types";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const nodeTypes = {
  rotateNode: RotateNode,
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
  rotation?: number;
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
    c: isRtl ? { x: 0, y: 30 } : { x: 40, y: 30 },
    s: isRtl ? { x: -30, y: 100 } : { x: 20, y: 100 },
    z: isRtl ? { x: 15, y: 200 } : { x: 35, y: 200 },
    out: isRtl ? { x: -350, y: 40 } : { x: 210, y: 40 },
  };

  return [
    {
      id: "r",
      type: "rotateNode",
      position: positions.c,
      sourcePosition: sourceHandlePosition,
      data: { rotation: 33, label: t("rotation"), isRtl },
    },
    {
      id: "s",
      type: "shapeNode",
      position: positions.s,
      sourcePosition: sourceHandlePosition,
      data: {
        shape: "lapJoint",
        label: t("flangeType"),
        options: [
          { value: "lapJoint", label: t("lapJoint") },
          { value: "weldNeck", label: t("weldNeck") },
        ],
        isRtl,
      },
    },
    {
      id: "z",
      type: "zoomNode",
      position: positions.z,
      sourcePosition: sourceHandlePosition,
      data: { zoom: 80, label: t("scale"), isRtl },
    },
    {
      id: "out",
      type: "outputNode",
      position: positions.out,
      targetPosition: targetHandlePosition,
      data: {
        rotation: 0,
        shape: "lapJoint",
        zoom: 100,
        previewLabel: t("preview"),
        isRtl,
      },
    },
  ];
}

const buildInitialEdges = (): Edge[] => [
  {
      id: "e-rotate",
      source: "r",
      target: "out",
      sourceHandle: "rotation",
      targetHandle: "rotation",
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
  const { fitView, getViewport, setViewport } = useReactFlow();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setNodes(buildNodes(t, isRtl, initialColor));
    setEdges(buildInitialEdges());
  }, [t, isRtl, initialColor, setNodes, setEdges]);

  const handleResize = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // 1. Center the nodes first without animation (with maxZoom to prevent them from becoming too large)
      fitView({ 
        duration: 0, 
        padding: window.innerWidth >= 1024 ? 0.05 : 0.1,
        maxZoom: window.innerWidth >= 1024 ? 1.3 : 1.2
      });
      
      // 2. Read new viewport and shift to keep it in the empty half of the screen
      setTimeout(() => {
        if (window.innerWidth >= 1024) {
          const { x, y, zoom } = getViewport();
          const shiftX = window.innerWidth * 0.22; // shift ~22vw horizontally
          // Tie vertical shift to width so it scales down on narrower screens, preventing nodes from flying off top
          const shiftY = window.innerWidth * 0.12; 
          setViewport(
            { x: isRtl ? x - shiftX : x + shiftX, y: y - shiftY, zoom },
            { duration: isReady ? 800 : 0 }
          );
        } else if (window.innerWidth >= 640) {
          // On tablets, grid is 2 columns, cards take less vertical space.
          const { x, y, zoom } = getViewport();
          const shiftY = window.innerHeight * 0.12; 
          setViewport(
            { x, y: y - shiftY, zoom },
            { duration: isReady ? 800 : 0 }
          );
        } else {
          // On mobile screens, grid is 1 column (very tall). Shift nodes UP more so they don't get visually covered.
          const { x, y, zoom } = getViewport();
          const shiftY = window.innerHeight * 0.28; 
          setViewport(
            { x, y: y - shiftY, zoom },
            { duration: isReady ? 800 : 0 }
          );
        }
        if (!isReady) setIsReady(true);
      }, 50);
    }, 150);
  }, [fitView, getViewport, setViewport, isRtl, isReady]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // Trigger on mount
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
      fitViewOptions={{ padding: 0.1 }}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      panOnScroll={false}
      preventScrolling={false}
      autoPanOnNodeDrag
      className={`bg-transparent [&_.react-flow__attribution]:hidden transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"}`}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.5}
        className="opacity-70 dark:opacity-50"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
        }}
      />
    </ReactFlow>
  );
}

export function HeroFlow() {
  const t = useTranslations("Hero-Flow");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "fa";
  const isMobile = useIsMobile();
  const [initialColor, setInitialColor] = useState(FALLBACK_PRIMARY);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showMobileAlert, setShowMobileAlert] = useState(false);

  useEffect(() => {
    setInitialColor(resolveThemeColor(FLOW_THEME.color));
  }, []);

  const modules = [
    {
      title: t("module1Title"),
      desc: t("module1Desc"),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    },
    {
      title: t("module2Title"),
      desc: t("module2Desc"),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
    },
    {
      title: t("module3Title"),
      desc: t("module3Desc"),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>
    },
    {
      title: t("module4Title"),
      desc: t("module4Desc"),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
    }
  ];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fa-num relative flex flex-col min-h-[100dvh] w-full overflow-x-hidden bg-background select-none"
      style={
        {
          "--theme": FLOW_THEME.color,
          "--theme-light": FLOW_THEME.light,
        } as React.CSSProperties
      }
    >
      {/* Wavy Faint Aura Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-70"
        style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)" }}
      >
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: "color-mix(in srgb, var(--theme) 10%, transparent)" }} />
        <div className="absolute top-[45%] right-[10%] w-[45%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: "color-mix(in srgb, var(--theme) 12%, transparent)" }} />
        <div className="absolute bottom-[5%] left-[20%] w-[50%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: "color-mix(in srgb, var(--theme) 10%, transparent)" }} />
      </div>

      <div className="w-full max-w-[100vw] overflow-x-hidden flex flex-col min-h-screen relative z-10 pointer-events-none">
        
        {/* REACT FLOW CANVAS: Normal flow on mobile (top), Absolute full-screen on desktop */}
        {!isMobile && (
          <div 
            className="w-full h-[50vh] min-h-[350px] relative lg:absolute lg:inset-0 lg:h-full lg:min-h-full z-0 pointer-events-auto overflow-hidden hidden md:block"
          >
            <ReactFlowProvider>
              <FlowInner isRtl={isRtl} initialColor={initialColor} />
            </ReactFlowProvider>
          </div>
        )}

        <div className="flex-1 container mx-auto px-6 md:px-12 flex flex-col justify-center py-12 gap-8 lg:gap-12 relative z-10">
          <div className="w-full h-auto pointer-events-none -mt-12 lg:-mt-28">
            <div className="relative flex flex-col items-center lg:items-start justify-center gap-6 w-full md:w-[80%] lg:w-[45%] xl:w-[50%] max-w-2xl pointer-events-auto p-4 sm:p-6 lg:p-8 z-20">
              <div 
                className="absolute inset-[-10%] z-[-1] backdrop-blur-sm"
                style={{
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
                  maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)"
                }}
              />
              <h1 className="flex flex-wrap justify-center lg:justify-start items-center gap-x-3 text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight text-foreground leading-[1.1]">
                <span>{t("title")}</span>
                <span className="text-(--theme)">{t("version")}</span>
              </h1>

              <p className="text-sm md:text-[15px] font-medium text-foreground/80 leading-relaxed text-center lg:text-start line-clamp-3">
                {t("description")}
              </p>

              <div className="mt-2 flex flex-wrap justify-center lg:justify-start items-center gap-4">
                <Button
                  asChild
                  className="group relative overflow-hidden rounded-full h-16 px-8 py-2 text-foreground text-base font-bold border-transparent !transition-colors !translate-y-0 !scale-100"
                  style={{ backgroundColor: "color-mix(in srgb, var(--theme) 15%, transparent)" }}
                >
                  <Link 
                    href="/ESP-Flow" 
                    target="_blank"
                    className="flex items-center justify-center w-full h-full outline-none"
                    onClick={(e) => {
                      if (isMobile) {
                        e.preventDefault();
                        setShowMobileAlert(true);
                        return;
                      }
                      e.preventDefault();
                      if (isNavigating) return;
                      setIsNavigating(true);
                      setTimeout(() => {
                        window.open("/ESP-Flow", "_blank");
                        setIsNavigating(false);
                      }, 250);
                    }}
                  >
                    <span 
                      className={`absolute start-0 top-0 bottom-0 z-0 !transition-[width] overflow-hidden ${
                        isNavigating 
                          ? "!w-full !duration-200 !ease-out" 
                          : "!w-0 group-hover:!w-full group-hover:!duration-[3000ms] group-hover:!ease-linear !duration-300 !ease-out"
                      }`} 
                      style={{ backgroundColor: "var(--theme)", boxShadow: "inset 0 0 10px rgba(255,255,255,0.2)" }}
                    >
                      <span className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                    </span>
                    
                    <span className="relative z-10 tracking-wide text-foreground">
                      {t("tryNow")}
                    </span>

                    <span 
                      className={`absolute inset-0 z-20 flex items-center justify-center tracking-wide text-white !transition-[clip-path] pointer-events-none ${
                        isNavigating 
                          ? "![clip-path:inset(0_0_0_0)] !duration-200 !ease-out" 
                          : (isRtl ? "![clip-path:inset(0_0_0_100%)]" : "![clip-path:inset(0_100%_0_0)]") + " group-hover:![clip-path:inset(0_0_0_0)] group-hover:!duration-[3000ms] group-hover:!ease-linear !duration-300 !ease-out"
                      }`}
                    >
                      {t("tryNow")}
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="pointer-events-none w-full z-30 pb-4 lg:pb-0 mt-4 lg:mt-16 xl:mt-24">
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full pointer-events-none">
            <div 
              className="absolute inset-[-10%] z-[-1] backdrop-blur-sm pointer-events-none"
              style={{
                WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
                maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)"
              }}
            />
            {modules.map((mod, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-1 p-2 sm:p-5 pointer-events-none h-full">
                <div className="text-(--theme) mb-1 sm:mb-2 opacity-80 mix-blend-multiply dark:mix-blend-screen shrink-0 scale-75 sm:scale-100">
                  {mod.icon}
                </div>
                <div className="text-sm sm:text-lg font-bold text-(--theme) leading-tight">{mod.title}</div>
                <div className="hidden sm:block text-[13px] font-medium text-foreground/70 leading-[1.6] line-clamp-3 min-h-[60px] mt-1">
                  {mod.desc}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      <Dialog open={showMobileAlert} onOpenChange={setShowMobileAlert}>
        <DialogContent className={isRtl ? "fa-num font-vazir" : ""} dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-2">
              {t('desktopOnly')}
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              {isRtl 
                ? "اجرای محیط ESP-Flow نیازمند نمایشگر بزرگتر است و این بخش تنها در نسخه دسکتاپ قابل دسترس می‌باشد. لطفا برای تجربه کامل، از کامپیوتر یا لپ‌تاپ استفاده کنید." 
                : "The ESP-Flow environment requires a larger display and is only available on the desktop version. Please use a computer or laptop for the full experience."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-center">
            <Button onClick={() => setShowMobileAlert(false)} className="w-full sm:w-auto min-w-[120px]">
              {t('understood')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}