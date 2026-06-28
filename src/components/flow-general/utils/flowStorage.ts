// src/components/flow-general/utils/flowStorage.ts

import type { FlowNode, FlowEdge, FlowState } from "../types";

/**
 * Storage interface for flow state persistence
 */
export interface FlowStorageAdapter {
  save: (key: string, state: FlowState) => Promise<void> | void;
  load: (key: string) => Promise<FlowState | null> | FlowState | null;
  clear: (key: string) => Promise<void> | void;
  export: (state: FlowState) => string;
  import: (data: string) => FlowState;
}

/**
 * LocalStorage implementation of flow storage
 */
export class LocalStorageAdapter implements FlowStorageAdapter {
  /**
   * Save flow state to localStorage
   */
  save(key: string, state: FlowState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error("Failed to save flow state:", error);
      throw new Error("Failed to save flow state to localStorage");
    }
  }

  /**
   * Load flow state from localStorage
   */
  load(key: string): FlowState | null {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;

      const state = JSON.parse(serialized) as FlowState;
      return state;
    } catch (error) {
      console.error("Failed to load flow state:", error);
      return null;
    }
  }

  /**
   * Clear flow state from localStorage
   */
  clear(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear flow state:", error);
    }
  }

  /**
   * Export flow state to JSON string
   */
  export(state: FlowState): string {
    try {
      return JSON.stringify(state, null, 2);
    } catch (error) {
      console.error("Failed to export flow state:", error);
      throw new Error("Failed to export flow state");
    }
  }

  /**
   * Import flow state from JSON string
   */
  import(data: string): FlowState {
    try {
      const state = JSON.parse(data) as FlowState;

      // Validate state structure
      if (!state.nodes || !Array.isArray(state.nodes)) {
        throw new Error("Invalid state: missing or invalid nodes array");
      }
      if (!state.edges || !Array.isArray(state.edges)) {
        throw new Error("Invalid state: missing or invalid edges array");
      }

      return state;
    } catch (error) {
      console.error("Failed to import flow state:", error);
      throw new Error(
        "Failed to import flow state: " + (error as Error).message,
      );
    }
  }
}

/**
 * Default storage adapter instance
 */
export const defaultStorageAdapter = new LocalStorageAdapter();

/**
 * Auto-save manager for flow editor
 */
export class AutoSaveManager {
  private intervalId: NodeJS.Timeout | null = null;
  private storageAdapter: FlowStorageAdapter;
  private storageKey: string;
  private getState: () => FlowState;

  constructor(
    storageAdapter: FlowStorageAdapter,
    storageKey: string,
    getState: () => FlowState,
  ) {
    this.storageAdapter = storageAdapter;
    this.storageKey = storageKey;
    this.getState = getState;
  }

  /**
   * Start auto-save with specified interval
   */
  start(intervalMs: number): void {
    this.stop(); // Clear any existing interval

    this.intervalId = setInterval(() => {
      try {
        const state = this.getState();
        this.storageAdapter.save(this.storageKey, state);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, intervalMs);
  }

  /**
   * Stop auto-save
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Save immediately
   */
  saveNow(): void {
    try {
      const state = this.getState();
      this.storageAdapter.save(this.storageKey, state);
    } catch (error) {
      console.error("Manual save failed:", error);
      throw error;
    }
  }
}

/**
 * Helper functions for flow storage operations
 */

/**
 * Save flow state using adapter
 */
export const saveFlowState = (
  key: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  adapter: FlowStorageAdapter = defaultStorageAdapter,
): void => {
  const state: FlowState = { nodes, edges };
  adapter.save(key, state);
};

/**
 * Load flow state using adapter
 */
export const loadFlowState = (
  key: string,
  adapter: FlowStorageAdapter = defaultStorageAdapter,
): FlowState | null => {
  return adapter.load(key);
};

/**
 * Clear flow state using adapter
 */
export const clearFlowState = (
  key: string,
  adapter: FlowStorageAdapter = defaultStorageAdapter,
): void => {
  adapter.clear(key);
};

/**
 * Export flow state to downloadable JSON file
 */
export const exportFlowStateToFile = (
  state: FlowState,
  filename: string = "flow-state.json",
  adapter: FlowStorageAdapter = defaultStorageAdapter,
): void => {
  try {
    const json = adapter.export(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export to file:", error);
    throw error;
  }
};

/**
 * Import flow state from file
 */
export const importFlowStateFromFile = (
  file: File,
  adapter: FlowStorageAdapter = defaultStorageAdapter,
): Promise<FlowState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const state = adapter.import(data);
        resolve(state);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};
