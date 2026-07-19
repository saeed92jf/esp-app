import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges, addEdge, type NodeChange, type EdgeChange, type Connection } from "@xyflow/react";
import type { WeightSummary } from "../schemas/base.schema";

// Store definition
export interface VesselWeightState {
  nodes: any[]; // Typing will be improved as we add node types
  edges: any[];
  
  weightSummary: WeightSummary | null;
  selectedNodeId: string | null;
  activeRightPanelTab: 'summary' | 'mto';

  // Actions
  setActiveRightPanelTab: (tab: 'summary' | 'mto') => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: <T>(id: string, partialData: Partial<T>) => void;
  deleteNode: (id: string) => void;
  clearCanvas: () => void;
  recomputeAll: () => void;
}

export const useVesselWeightStore = create<VesselWeightState>((set, get) => ({
  nodes: [],
  edges: [],
  weightSummary: null,
  selectedNodeId: null,
  activeRightPanelTab: 'summary',

  setActiveRightPanelTab: (tab) => set({ activeRightPanelTab: tab }),

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
    if (changes.some(c => c.type === 'remove')) {
      get().recomputeAll();
    }
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
    get().recomputeAll();
  },

  onConnect: (connection) => {
    set((state) => {
      // Data propagation logic
      const sourceNode = state.nodes.find(n => n.id === connection.source);
      const targetNode = state.nodes.find(n => n.id === connection.target);
      
      let updatedNodes = state.nodes;
      
      if (sourceNode?.type === 'vesselRootNode' && targetNode) {
        const rootData = sourceNode.data?.vessel as any;
        const defaultDia = rootData?.defaultDiameter_mm;
        const defaultLen = rootData?.defaultLength_mm;
        const defaultRawPlateL = rootData?.defaultRawPlateLength_mm;
        const defaultRawPlateW = rootData?.defaultRawPlateWidth_mm;
        
        if (defaultDia || defaultLen || defaultRawPlateL || defaultRawPlateW) {
          updatedNodes = state.nodes.map(n => {
            if (n.id === targetNode.id) {
              if (n.type === 'shellNode' && n.data?.courses) {
                const updatedCourses = n.data.courses.map((c: any) => ({
                  ...c,
                  insideDiameter_mm: defaultDia || c.insideDiameter_mm,
                  length_mm: defaultLen || c.length_mm,
                  rawPlateLength_mm: defaultRawPlateL || c.rawPlateLength_mm,
                  rawPlateWidth_mm: defaultRawPlateW || c.rawPlateWidth_mm,
                }));
                return { ...n, data: { ...n.data, courses: updatedCourses } };
              }
              if (n.type === 'headNode' && n.data?.heads) {
                const updatedHeads = n.data.heads.map((h: any) => ({
                  ...h,
                  insideDiameter_mm: defaultDia || h.insideDiameter_mm,
                  rawPlateLength_mm: defaultRawPlateL || h.rawPlateLength_mm,
                  rawPlateWidth_mm: defaultRawPlateW || h.rawPlateWidth_mm,
                }));
                return { ...n, data: { ...n.data, heads: updatedHeads } };
              }
            }
            return n;
          });
        }
      }

      return {
        edges: addEdge(connection, state.edges),
        nodes: updatedNodes
      };
    });
    get().recomputeAll();
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, partialData) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...partialData } } : n
      ),
    }));
    get().recomputeAll();
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
    get().recomputeAll();
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], weightSummary: null, selectedNodeId: null });
  },

  recomputeAll: () => {
    const { nodes } = get();
    
    let totalFabricated = 0;
    let totalInternals = 0;
    let totalRaw = 0;
    
    // Simplistic sum for now until full MTO breakdown is connected
    nodes.forEach(node => {
      if (node.data?.excludeFromWeight) return;
      
      const d = node.data as any;
      if (d.calculatedWeight) totalFabricated += d.calculatedWeight;
      if (d.totalFabricatedWeight) totalFabricated += d.totalFabricatedWeight; // Nozzle
      if (d.rawWeight) totalRaw += d.rawWeight;
      
      if (node.type === 'internalsNode' || node.type === 'mistEliminatorNode') {
        if (d.calculatedWeight) totalInternals += d.calculatedWeight;
        if (d.totalFabricatedWeight) totalInternals += d.totalFabricatedWeight;
      }
    });

    const rootNode = nodes.find(n => n.type === 'vesselRootNode');
    const rootData = rootNode?.data?.vessel as any;
    
    const internalVol = nodes.reduce((sum, n) => sum + (n.data?.internalVolume || 0), 0);
    const opDensity = rootData?.processFluidDensity_kg_m3 || 1000;
    const testDensity = rootData?.testFluidDensity_kg_m3 || 1000;

    const opFluidWeight = internalVol * opDensity;
    const testFluidWeight = internalVol * testDensity;

    set({
      weightSummary: {
        fabricatedWeight: totalFabricated,
        erectionWeight: totalFabricated + totalInternals,
        shippingWeight: totalFabricated + totalInternals, // assuming shipped with internals for now
        operatingWeight: totalFabricated + totalInternals + opFluidWeight,
        hydrotestWeight: totalFabricated + totalInternals + testFluidWeight,
        rawWeight: totalRaw > 0 ? totalRaw : totalFabricated * 1.15,
      }
    });
  },
}));
