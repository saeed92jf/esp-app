"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTranslations } from "next-intl";

import { useDiagramStore } from "../store";
import { nodeTypes } from "./nodes/BaseNode";
import { edgeTypes } from "./edges/CustomEdge";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import type { DiagramNodeData, PaletteItem } from "../types";

const BG_VARIANT_MAP: Record<string, BackgroundVariant | null> = {
  dots: BackgroundVariant.Dots,
  lines: BackgroundVariant.Lines,
  cross: BackgroundVariant.Cross,
  none: null,
};

let nodeIdCounter = 0;
const generateNodeId = () => `node-${Date.now()}-${nodeIdCounter++}`;

export function DiagramCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Flow");
  const { screenToFlowPosition, fitView } = useReactFlow();

  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const onNodesChange = useDiagramStore((s) => s.onNodesChange);
  const onEdgesChange = useDiagramStore((s) => s.onEdgesChange);
  const onConnect = useDiagramStore((s) => s.onConnect);
  const addNode = useDiagramStore((s) => s.addNode);
  const setSelectedNode = useDiagramStore((s) => s.setSelectedNode);
  const setSelectedEdge = useDiagramStore((s) => s.setSelectedEdge);
  const deleteSelected = useDiagramStore((s) => s.deleteSelected);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);
  const copy = useDiagramStore((s) => s.copy);
  const paste = useDiagramStore((s) => s.paste);
  const clipboard = useDiagramStore((s) => s.clipboard);
  const settings = useDiagramStore((s) => s.settings);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  //── Drag & drop ───────────────────────────────────────────────────────────

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/diagram-node");
      if (!raw) return;

      const item: PaletteItem = JSON.parse(raw);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // next-intl throws on missing keys in dev; fall back gracefully
      let label: string;
      try {
        label = t(`nodes.${item.labelKey}`);
      } catch {
        label = item.defaultData.label ?? "Node";
      }

      const newNode: Node<DiagramNodeData> = {
        id: generateNodeId(),
        type: item.type,
        position,
        data: { label, ...item.defaultData },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode, t],
  );

  // ── Click handlers ────────────────────────────────────────────────────────

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => setSelectedNode(node.id),
    [setSelectedNode],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => setSelectedEdge(edge.id),
    [setSelectedEdge],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // ── Context menu handlers ─────────────────────────────────────────────────

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setSelectedNode(node.id);
      setContextMenu({ x: event.clientX, y: event.clientY, target: "node" });
    },
    [setSelectedNode],
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setSelectedEdge(edge.id);
      setContextMenu({ x: event.clientX, y: event.clientY, target: "edge" });
    },
    [setSelectedEdge],
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const { clientX, clientY } = event as MouseEvent;
      setContextMenu({ x: clientX, y: clientY, target: "pane" });
    },
    [],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  // ── Select-all — proper useCallback, not inline setState ─────────────────

  const onSelectAll = useCallback(() => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: true })),
    }));
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;

      if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        mod &&
        (event.key.toLowerCase() === "y" ||
          (event.key.toLowerCase() === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      } else if (mod && event.key.toLowerCase() === "c") {
        copy();
      } else if (mod && event.key.toLowerCase() === "v") {
        paste();
      } else if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        // Avoid deleting while typing in inputs
        const tag = (event.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        deleteSelected();
      }
    },
    [undo, redo, copy, paste, duplicateSelected, deleteSelected],
  );

  const bgVariant = BG_VARIANT_MAP[settings.backgroundVariant];

  return (
    // outline-none prevents the browser focus ring from showing on the canvas wrapper
    <div
      ref={wrapperRef}
      className="relative h-full w-full outline-none"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        snapToGrid={settings.snapToGrid}
        snapGrid={settings.snapGrid}
        colorMode={settings.colorMode}
        fitView
        defaultEdgeOptions={{ type: settings.defaultEdgeType }}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        {bgVariant !== null && (
          <Background variant={bgVariant} gap={16} size={1.2} color="#e2e8f0" />
        )}

        {settings.showControls && (
          <Controls position="bottom-right" showInteractive={false} />
        )}

        {settings.showMiniMap && (
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor={(n) =>
              (n.data as DiagramNodeData)?.backgroundColor ?? "#cbd5e1"
            }
            maskColor="rgba(241, 245, 249, 0.6)"
            className="border! border-slate-200! shadow-sm!"
          />
        )}

        <Panel position="top-center">
          {nodes.length === 0 && (
            <p className="pointer-events-none rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs text-slate-400 shadow-sm backdrop-blur">
              {t("palette.dragToAdd")}
            </p>
          )}
        </Panel>
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={closeContextMenu}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
          onFitView={() => fitView({ duration: 300 })}
          onSelectAll={onSelectAll}
          onPaste={paste}
          canPaste={!!clipboard}
        />
      )}
    </div>
  );
}
