// src/data/equipmentDiagramBuilder.ts
import { MarkerType } from "@xyflow/react";
import type { DiagramNode, DiagramEdge } from "@/types/nodes";
import { equipmentData } from "./equipmentDiagramData";
import type { HubDef, CategoryDef, StandardDef } from "./equipmentDiagramData";
import { edgeSettings } from "./equipmentDiagramEdgeSettings";
import { hubPositions, nodePositions } from "./equipmentDiagramPositions";

// Color mapping for standard types
const COLORS = {
  API: "#3b82f6",
  ASME: "#10b981",
  ASTM: "#f59e0b",
  NACE: "#ef4444",
  NBIC: "#8b5cf6",
  FFS: "#ec4899",
  "MSS-SP": "#06b6d4",
  TEMA: "#84cc16",
  "AHRI/ASME": "#f97316",
  PPTA: "#14b8a6",
  PFI: "#a855f7",
  CCPS: "#eab308",
  OSHA: "#22c55e",
  AWS: "#6366f1",
  SAE: "#f43f5e",
  SSPC: "#0ea5e9",
  BS: "#d946ef",
  OTHER: "#6b7280",
};

// Default edge styles
const HUB_EDGE = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "#94a3b8", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
};

const CHILD_EDGE = {
  type: "smoothstep",
  animated: false,
  style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#cbd5e1" },
};

// Helper function to create a node
function node(
  id: string,
  type: string,
  data: any,
  position: { x: number; y: number },
  parentId?: string,
): DiagramNode {
  return {
    id,
    type,
    data,
    position,
    ...(parentId && { parentId }),
  };
}

// Helper function to create an edge
function edge(
  id: string,
  source: string,
  target: string,
  options: any = {},
): DiagramEdge {
  return {
    id,
    source,
    target,
    ...options,
  };
}

export function buildDiagram(): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  equipmentData.forEach((hubDef: HubDef) => {
    const hubId = hubDef.id;

    // Create Hub Node
    nodes.push(
      node(
        hubId,
        "hub",
        {
          label: hubDef.label,
          description: hubDef.description,
        },
        hubPositions[hubId] || { x: 0, y: 0 },
      ),
    );

    // Create Category Nodes and Edges
    hubDef.categories.forEach((cat: CategoryDef) => {
      const catId = cat.id;

      // Category Node
      nodes.push(
        node(
          catId,
          "category",
          {
            label: cat.label,
            categoryLabel: cat.categoryLabel,
          },
          nodePositions[catId] || { x: 0, y: 0 },
          hubId,
        ),
      );

      // Hub → Category Edge
      const hubToCatEdgeId = `${hubId}-${catId}`;
      edges.push(
        edge(hubToCatEdgeId, hubId, catId, {
          ...HUB_EDGE,
          ...(edgeSettings[hubToCatEdgeId] || {}), // Merge custom settings
          type: "buttonedge", // Use ButtonEdge component
          data: {
            pathOptions: edgeSettings[hubToCatEdgeId]?.pathOptions,
          },
        }),
      );

      // Create Standard Nodes and Edges
      cat.standards.forEach((std: StandardDef) => {
        const stdId = std.id;

        // Standard Node
        nodes.push(
          node(
            stdId,
            "standard",
            {
              label: `${std.stdType}\n${std.stdNumber}`, // Build label from stdType and stdNumber
              standardType: std.stdType,
              standardNumber: std.stdNumber,
              fullName: std.fullName,
              url: std.url,
              color: COLORS[std.stdType as keyof typeof COLORS] || COLORS.OTHER,
            },
            nodePositions[stdId] || { x: 0, y: 0 },
            catId,
          ),
        );

        // Category → Standard Edge
        const catToStdEdgeId = `${catId}-${stdId}`;
        edges.push(
          edge(catToStdEdgeId, catId, stdId, {
            ...CHILD_EDGE,
            ...(edgeSettings[catToStdEdgeId] || {}), // Merge custom settings
            type: "buttonedge", // Use ButtonEdge component
            data: {
              pathOptions: edgeSettings[catToStdEdgeId]?.pathOptions,
            },
          }),
        );
      });
    });
  });

  return { nodes, edges };
}

export const { nodes: initialNodes, edges: initialEdges } = buildDiagram();
