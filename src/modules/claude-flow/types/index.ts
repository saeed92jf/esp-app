import type { Node, Edge, Viewport } from '@xyflow/react';

export type DiagramNodeType =
  | 'defaultNode'
  | 'inputNode'
  | 'outputNode'
  | 'circleNode'
  | 'diamondNode'
  | 'cylinderNode'
  | 'parallelogramNode'
  | 'hexagonNode'
  | 'textNode'
  | 'noteNode';

export type DiagramEdgeType = 'default' | 'straight' | 'step' | 'smoothstep';

export interface DiagramNodeData extends Record<string, unknown> {
  label: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'semibold' | 'bold';
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  description?: string;
}

export interface DiagramEdgeData extends Record<string, unknown> {
  label?: string;
  animated?: boolean;
  color?: string;
  strokeWidth?: number;
  edgeStyle?: DiagramEdgeType;
}

export interface SavedDiagram {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodes: Node<DiagramNodeData>[];
  edges: Edge<DiagramEdgeData>[];
  viewport: Viewport;
}

export interface HistoryEntry {
  nodes: Node<DiagramNodeData>[];
  edges: Edge<DiagramEdgeData>[];
}

export interface EditorSettings {
  snapToGrid: boolean;
  snapGrid: [number, number];
  showMiniMap: boolean;
  showControls: boolean;
  backgroundVariant: 'dots' | 'lines' | 'cross' | 'none';
  colorMode: 'light' | 'dark';
  defaultEdgeType: DiagramEdgeType;
  autoSave: boolean;
}

export type Language = 'en' | 'fa';

export interface PaletteItem {
  type: DiagramNodeType;
  labelKey: string;
  icon: string;
  defaultData: Partial<DiagramNodeData>;
  category: 'basic' | 'flowchart' | 'shapes';
}
