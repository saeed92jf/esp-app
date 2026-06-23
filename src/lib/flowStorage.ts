// flowStorage.ts - LocalStorage persistence layer for flow diagram state
import type { Node, Edge } from "@xyflow/react";

const STORAGE_KEY = "equipment-flow-state";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  version: string;
  timestamp: number;
}

/**
 * Save complete flow state to localStorage
 */
export function saveFlowState(nodes: Node[], edges: Edge[]): void {
  try {
    const state: FlowState = {
      nodes,
      edges,
      version: "1.0",
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save flow state:", error);
  }
}

/**
 * Load flow state from localStorage
 * Returns null if no saved state exists or parsing fails
 */
export function loadFlowState(): FlowState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored) as FlowState;

    // Validate basic structure
    if (
      !state.nodes ||
      !state.edges ||
      !Array.isArray(state.nodes) ||
      !Array.isArray(state.edges)
    ) {
      console.warn("Invalid flow state structure");
      return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to load flow state:", error);
    return null;
  }
}

/**
 * Clear saved flow state from localStorage
 */
export function clearFlowState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export flow state as downloadable JSON file
 */
export function exportFlowState(
  nodes: Node[],
  edges: Edge[],
  filename = "equipment-diagram.json",
): void {
  const state: FlowState = {
    nodes,
    edges,
    version: "1.0",
    timestamp: Date.now(),
  };

  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import flow state from uploaded JSON file
 */
export function importFlowState(file: File): Promise<FlowState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const state = JSON.parse(content) as FlowState;

        // Validate structure
        if (
          !state.nodes ||
          !state.edges ||
          !Array.isArray(state.nodes) ||
          !Array.isArray(state.edges)
        ) {
          throw new Error("Invalid flow state structure");
        }

        resolve(state);
      } catch (error) {
        reject(new Error("Failed to parse imported file"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Setup auto-save functionality
 * Returns cleanup function to stop auto-save
 */
export function setupAutoSave(
  getState: () => { nodes: Node[]; edges: Edge[] },
  interval = AUTO_SAVE_INTERVAL,
): () => void {
  const intervalId = setInterval(() => {
    const { nodes, edges } = getState();
    saveFlowState(nodes, edges);
  }, interval);

  return () => clearInterval(intervalId);
}
