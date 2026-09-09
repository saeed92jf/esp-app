"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  BackgroundVariant,
  ReactFlowProvider,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as dagre from "dagre";
import { useTranslations, useLocale } from "next-intl";

import { NAVIGATION } from "@/config/navigation";
import { SitemapNode, type SitemapNodeData } from "./sitemap-node";
import { useTheme } from "next-themes";
import { AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, FoldVertical, UnfoldVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const nodeTypes = {
  sitemapNode: SitemapNode,
};

// Node dimensions for the dagre layout calculation
const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

type LayoutDirection = "HORIZONTAL" | "VERTICAL";

const getDoubleSidedLayout = (nodes: Node<SitemapNodeData>[], edges: Edge[], direction: LayoutDirection = "HORIZONTAL") => {
  const dagreLib = (dagre && dagre.graphlib) ? dagre : (dagre as any).default;
  if (!dagreLib || !dagreLib.graphlib) {
    console.warn("Dagre graphlib not found during SSR");
    return { initialNodes: nodes, initialEdges: edges };
  }

  const rootNode = nodes.find((n) => n.id === "root");
  if (!rootNode) return { initialNodes: nodes, initialEdges: edges };

  // Separate groups into left/right or top/bottom halves
  const groupNodes = nodes.filter((n) => n.data.isGroup);
  const mid = Math.ceil(groupNodes.length / 2);
  const firstHalfGroupIds = new Set(groupNodes.slice(0, mid).map((n) => n.id));
  
  const firstHalfNodes = [rootNode];
  const secondHalfNodes = [rootNode];
  
  const firstHalfEdges: Edge[] = [];
  const secondHalfEdges: Edge[] = [];

  nodes.forEach((n) => {
    if (n.id === "root") return;
    if (firstHalfGroupIds.has(n.data.groupId as string) || firstHalfGroupIds.has(n.id)) {
      firstHalfNodes.push(n);
    } else {
      secondHalfNodes.push(n);
    }
  });

  edges.forEach((e) => {
    if (firstHalfNodes.find((n) => n.id === e.source) && firstHalfNodes.find((n) => n.id === e.target)) {
      firstHalfEdges.push(e);
    } else if (secondHalfNodes.find((n) => n.id === e.source) && secondHalfNodes.find((n) => n.id === e.target)) {
      secondHalfEdges.push(e);
    }
  });

  // Calculate layout for a specific subgraph
  const layoutGraph = (graphNodes: Node[], graphEdges: Edge[], dir: string) => {
    if (graphNodes.length <= 1) return; // Only root

    const g = new dagreLib.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: dir, nodesep: 30, ranksep: direction === "HORIZONTAL" ? 180 : 120, align: "UL" });
    
    graphNodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    graphEdges.forEach((e) => g.setEdge(e.source, e.target));
    
    dagreLib.layout(g);
    
    const rPos = g.node("root");
    
    graphNodes.forEach((n) => {
      const p = g.node(n.id);
      
      n.targetPosition = dir === "RL" ? "right" : dir === "LR" ? "left" : dir === "BT" ? "bottom" : "top" as any;
      n.sourcePosition = dir === "RL" ? "left" : dir === "LR" ? "right" : dir === "BT" ? "top" : "bottom" as any;
      
      n.position = {
        x: p.x - rPos.x,
        y: p.y - rPos.y
      };
    });
  };

  // Run layout on both halves
  const dir1 = direction === "HORIZONTAL" ? "RL" : "BT";
  const dir2 = direction === "HORIZONTAL" ? "LR" : "TB";
  
  layoutGraph(firstHalfNodes, firstHalfEdges, dir1);
  layoutGraph(secondHalfNodes, secondHalfEdges, dir2);

  // Fix root node positions (it was duplicated in both runs)
  rootNode.position = { x: 0, y: 0 };
  rootNode.sourcePosition = direction === "HORIZONTAL" ? "right" : "bottom" as any;
  rootNode.targetPosition = direction === "HORIZONTAL" ? "left" : "top" as any;

  // Recombine
  const finalNodes = Array.from(new Set([...firstHalfNodes, ...secondHalfNodes]));
  const finalEdges = [...firstHalfEdges, ...secondHalfEdges];

  return { initialNodes: finalNodes, initialEdges: finalEdges };
};

function FlowInner() {
  const tNav = useTranslations("Menu");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { resolvedTheme } = useTheme();
  
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>("HORIZONTAL");

  const { initialNodes, initialEdges }: { initialNodes: Node<SitemapNodeData>[], initialEdges: Edge[] } = useMemo(() => {
    const rawNodes: Node<SitemapNodeData>[] = [];
    const rawEdges: Edge[] = [];

    // 1. Create Root Node
    const rootId = "root";
    rawNodes.push({
      id: rootId,
      type: "sitemapNode",
      position: { x: 0, y: 0 },
      data: {
        label: tCommon("appName.lead"),
        isRoot: true,
      },
    });

    // 2. Iterate through Navigation
    const mid = Math.ceil(NAVIGATION.length / 2);
    const firstHalfGroupIds = new Set(NAVIGATION.slice(0, mid).map(g => g.id));

    NAVIGATION.forEach((group) => {
      const groupId = `group-${group.id}`;
      const isCollapsed = collapsedGroups.has(groupId);
      const isFirstHalf = firstHalfGroupIds.has(group.id);
      
      let rootSourceHandle = "right";
      if (layoutDirection === "HORIZONTAL") {
        rootSourceHandle = isFirstHalf ? "left" : "right";
      } else {
        rootSourceHandle = isFirstHalf ? "top" : "bottom";
      }

      // Group Node
      rawNodes.push({
        id: groupId,
        type: "sitemapNode",
        position: { x: 0, y: 0 },
        data: {
          label: tNav(`sections.${group.labelKey}`),
          color: group.color,
          isGroup: true,
          groupId: group.id,
          isCollapsed: isCollapsed,
        },
      });

      // Edge from Root to Group
      rawEdges.push({
        id: `e-${rootId}-${groupId}`,
        source: rootId,
        target: groupId,
        sourceHandle: rootSourceHandle,
        type: "smoothstep",
        animated: true,
        style: { stroke: "hsl(var(--primary))", strokeWidth: 1.5, opacity: 0.8 },
      });

      // Child Items (only if not collapsed)
      if (!isCollapsed) {
        group.items.forEach((item, idx) => {
          const itemId = `item-${group.id}-${idx}`;
          
          rawNodes.push({
            id: itemId,
            type: "sitemapNode",
            position: { x: 0, y: 0 },
            data: {
              label: tNav.has(`items.${item.labelKey}`) ? tNav(`items.${item.labelKey}`) : item.labelKey,
              href: item.href,
              color: item.color || group.color,
              groupId: group.id,
              itemIdx: idx,
            },
          });

          rawEdges.push({
            id: `e-${groupId}-${itemId}`,
            source: groupId,
            target: itemId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "hsl(var(--primary))", strokeWidth: 1.5, opacity: 0.8 },
          });
        });
      }
    });

    return getDoubleSidedLayout(rawNodes, rawEdges, layoutDirection);
  }, [tNav, tCommon, collapsedGroups, layoutDirection]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<SitemapNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state and animate when dependencies change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    const timer = setTimeout(() => {
      fitView({ duration: 800, padding: 0.1 });
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<SitemapNodeData>) => {
    if (node.data.isGroup) {
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    }
  }, []);

  const handleExpandAll = () => setCollapsedGroups(new Set());
  const handleCollapseAll = () => {
    const allGroupIds = NAVIGATION.map(g => `group-${g.id}`);
    setCollapsedGroups(new Set(allGroupIds));
  };

  if (!mounted) {
    return null;
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      minZoom={0.1}
      maxZoom={2}
      colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
      className={`bg-transparent [&_.react-flow__attribution]:hidden transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"}`}
      proOptions={{ hideAttribution: true }}
    >
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={24} 
        size={2} 
        color="hsl(var(--muted-foreground))" 
      />
      
      <Controls className="!bg-card !border-border !shadow-sm !text-foreground" />
      
      <Panel position={isRtl ? "top-left" : "top-right"} className="flex flex-col gap-2 p-2 bg-card/50 backdrop-blur border border-border/50 rounded-xl shadow-sm mr-4 mt-4">
        <div className="flex gap-2">
          <Button 
            variant={layoutDirection === "HORIZONTAL" ? "default" : "outline"}
            size="icon"
            onClick={() => setLayoutDirection("HORIZONTAL")}
            title="Horizontal Layout"
            className="w-10 h-10"
          >
            <AlignHorizontalJustifyCenter className="w-5 h-5" />
          </Button>
          <Button 
            variant={layoutDirection === "VERTICAL" ? "default" : "outline"}
            size="icon"
            onClick={() => setLayoutDirection("VERTICAL")}
            title="Vertical Layout"
            className="w-10 h-10"
          >
            <AlignVerticalJustifyCenter className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleExpandAll}
            title="Expand All"
            className="w-10 h-10"
          >
            <UnfoldVertical className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleCollapseAll}
            title="Collapse All"
            className="w-10 h-10"
          >
            <FoldVertical className="w-5 h-5" />
          </Button>
        </div>
      </Panel>
    </ReactFlow>
  );
}

export function SitemapClient() {
  return (
    <div 
      className="w-full h-full relative z-0 pointer-events-auto overflow-hidden"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)"
      }}
    >
      <ReactFlowProvider>
        <FlowInner />
      </ReactFlowProvider>
    </div>
  );
}
