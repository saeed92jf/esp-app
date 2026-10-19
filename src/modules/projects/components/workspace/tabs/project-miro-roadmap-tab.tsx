// src/modules/projects/components/workspace/tabs/project-miro-roadmap-tab.tsx
"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Move,
  Layers,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectItem, RoadmapNode } from "../../../types/projects.types";
import { cn } from "@/lib/utils";

interface ProjectMiroRoadmapTabProps {
  project: ProjectItem;
}

export function ProjectMiroRoadmapTab({ project }: ProjectMiroRoadmapTabProps) {
  const t = useTranslations("Projects.roadmap");

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    project.roadmapNodes[3]?.id || project.roadmapNodes[0]?.id || null
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const nodes: RoadmapNode[] =
    project.roadmapNodes && project.roadmapNodes.length > 0
      ? project.roadmapNodes
      : [
          {
            id: "node-1",
            title: "ابلاغ رسمی قرارداد و جلسه کیک‌آف",
            phaseId: "ph-1",
            date: "1403/05/01",
            status: "done",
            x: 80,
            y: 160,
            dependencies: [],
            assigneeName: "علیرضا رضایی",
            progressPercent: 100,
          },
          {
            id: "node-2",
            title: "تایید مدارک P&ID و فریز هیدرولیک",
            phaseId: "ph-1",
            date: "1403/06/01",
            status: "done",
            x: 280,
            y: 110,
            dependencies: ["node-1"],
            assigneeName: "سعید جلیلی",
            progressPercent: 100,
          },
          {
            id: "node-3",
            title: "تامین متریال و ورود ورق SA-516 HIC",
            phaseId: "ph-2",
            date: "1403/07/10",
            status: "done",
            x: 480,
            y: 110,
            dependencies: ["node-2"],
            assigneeName: "مهندس ناصری",
            progressPercent: 100,
          },
          {
            id: "node-4",
            title: "رولینگ پوسته و جوشکاری طولی شاپ",
            phaseId: "ph-3",
            date: "1403/08/20",
            status: "active",
            x: 680,
            y: 160,
            dependencies: ["node-3"],
            assigneeName: "مهندس خسروی",
            progressPercent: 65,
          },
          {
            id: "node-5",
            title: "مونتاژ عدسی و کوره تنش‌زدایی PWHT",
            phaseId: "ph-3",
            date: "1403/09/25",
            status: "upcoming",
            x: 880,
            y: 160,
            dependencies: ["node-4"],
            assigneeName: "مهندس خسروی",
            progressPercent: 0,
          },
          {
            id: "node-6",
            title: "آزمون هیدرواستاتیک ۲۸ بار با بازرس کارفرما",
            phaseId: "ph-4",
            date: "1403/10/15",
            status: "upcoming",
            x: 1080,
            y: 120,
            dependencies: ["node-5"],
            assigneeName: "سارا محمدی",
            progressPercent: 0,
          },
          {
            id: "node-7",
            title: "تحویل موقت سایت، ترخیص و تست نهایی PAC",
            phaseId: "ph-6",
            date: "1403/12/15",
            status: "upcoming",
            x: 1280,
            y: 160,
            dependencies: ["node-6"],
            assigneeName: "علیرضا رضایی",
            progressPercent: 0,
          },
        ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background
    if ((e.target as HTMLElement).closest(".roadmap-node")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(1.8, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeColor = (status: RoadmapNode["status"]) => {
    switch (status) {
      case "done":
        return "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100";
      case "active":
        return "border-primary bg-primary/10 text-primary-foreground shadow-md ring-2 ring-primary/40";
      case "blocked":
        return "border-rose-500 bg-rose-50/80 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100";
      case "upcoming":
      default:
        return "border-border/80 bg-white/90 dark:bg-card/90 text-foreground";
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 fa-num">
      {/* ── Top Bar Controls ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Layers className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {t("title")}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {t("subtitle")}
            </span>
          </div>
        </div>

        {/* Miro Canvas Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 border border-border/50">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleZoom(0.15)}
            className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title={t("zoomIn")}
          >
            <ZoomIn className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleZoom(-0.15)}
            className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title={t("zoomOut")}
          >
            <ZoomOut className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleReset}
            className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title={t("resetZoom")}
          >
            <RotateCcw className="size-3.5" />
          </Button>

          <span className="text-[10px] font-mono px-2 text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* ── Miro Interactive Infinite Canvas Area ── */}
      <div className="relative w-full h-[520px] rounded-2xl border border-border/70 overflow-hidden bg-slate-50 dark:bg-slate-950/80 shadow-inner select-none cursor-grab active:cursor-grabbing">
        {/* Dot Grid Background (Miro style) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(120, 120, 120, 0.22) 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Zoom & Pan Group Container */}
          <div
            className="relative w-[1800px] h-[700px] transition-transform duration-75 origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Connecting Curves between dependent nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker
                  id="miro-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(100, 116, 139, 0.6)" />
                </marker>
              </defs>

              {nodes.map((node) => {
                return node.dependencies.map((depId) => {
                  const source = nodes.find((n) => n.id === depId);
                  if (!source) return null;

                  // Node card center offsets
                  const x1 = source.x + 180;
                  const y1 = source.y + 45;
                  const x2 = node.x;
                  const y2 = node.y + 45;
                  const cx1 = x1 + (x2 - x1) / 2;
                  const cy1 = y1;
                  const cx2 = x1 + (x2 - x1) / 2;
                  const cy2 = y2;

                  return (
                    <path
                      key={`${source.id}-${node.id}`}
                      d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={
                        source.status === "done" && node.status === "done"
                          ? "rgba(16, 185, 129, 0.7)"
                          : source.status === "done" && node.status === "active"
                          ? "rgba(14, 165, 233, 0.8)"
                          : "rgba(148, 163, 184, 0.5)"
                      }
                      strokeWidth="2.5"
                      strokeDasharray={node.status === "upcoming" ? "5 4" : "none"}
                      markerEnd="url(#miro-arrow)"
                    />
                  );
                });
              })}
            </svg>

            {/* Miro Nodes Cards */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  className={cn(
                    "roadmap-node absolute w-[190px] p-3 rounded-2xl border-2 shadow-sm transition-all cursor-pointer flex flex-col gap-2 z-10",
                    getNodeColor(node.status),
                    isSelected ? "ring-4 ring-primary/40 scale-105" : "hover:border-primary/60"
                  )}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                >
                  {/* Node Header: Date & Status */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{node.date}</span>
                    </span>

                    {node.status === "done" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="size-3" />
                        <span>تکمیل</span>
                      </span>
                    ) : node.status === "active" ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground font-bold text-[9px] animate-pulse">
                        جاری
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[9px]">پیش‌رو</span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                    {node.title}
                  </h4>

                  {/* Progress & Assignee */}
                  <div className="flex flex-col gap-1 pt-1 border-t border-border/30 text-[10px]">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>پیشرفت:</span>
                      <span className="font-bold">{node.progressPercent}%</span>
                    </div>

                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          node.status === "done" ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${node.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] pt-0.5">
                      <User className="size-3 text-primary" />
                      <span className="truncate">{node.assigneeName || "مجری"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Miro Inspector Floating Drawer (Selected Node Details) ── */}
        {selectedNode && (
          <div className="absolute top-4 end-4 w-72 p-4 rounded-2xl bg-white/95 dark:bg-card/95 border border-border/70 shadow-xl backdrop-blur-md z-20 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                <span>مشخصات نقطه عطف نقشه راه</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ×
              </button>
            </div>

            <h4 className="text-xs sm:text-[13px] font-bold text-foreground leading-snug">
              {selectedNode.title}
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-muted/20 flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground">تاریخ هدف:</span>
                <span className="font-semibold">{selectedNode.date}</span>
              </div>
              <div className="p-2 rounded-xl bg-muted/20 flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground">پیشرفت:</span>
                <span className="font-bold text-primary">{selectedNode.progressPercent}%</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-muted/20 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">مسئول پیگیری:</span>
              <span className="font-semibold text-foreground">
                {selectedNode.assigneeName}
              </span>
            </div>

            <div className="text-[11px] text-muted-foreground leading-relaxed">
              گره‌های پیش‌نیاز:{" "}
              {selectedNode.dependencies.length > 0
                ? selectedNode.dependencies.join("، ")
                : "نقطه شروع اولیه (بدون وابستگی)"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
