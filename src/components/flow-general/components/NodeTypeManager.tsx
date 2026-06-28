// src/components/flow-general/components/NodeTypeManager.tsx
"use client";

import React, { createContext, useContext, useMemo } from "react";
// Using the new naming but keeping it compatible
import type { CustomNodeType as NodeTypeConfig } from "../types";

/**
 * Interface for the Node Type Context
 */
interface NodeTypeContextType {
  nodeTypes: NodeTypeConfig[];
  /**
   * Finds node type by ID or Type string
   */
  getNodeType: (typeOrId: string) => NodeTypeConfig | undefined;
}

const NodeTypeContext = createContext<NodeTypeContextType | undefined>(
  undefined,
);

export const NodeTypeProvider: React.FC<{
  initialTypes: NodeTypeConfig[];
  children: React.ReactNode;
}> = ({ initialTypes, children }) => {
  const value = useMemo(
    () => ({
      nodeTypes: initialTypes,
      getNodeType: (id: string) =>
        initialTypes.find((t) => t.id === id || t.type === id),
    }),
    [initialTypes],
  );

  return (
    <NodeTypeContext.Provider value={value}>
      {children}
    </NodeTypeContext.Provider>
  );
};

export const useNodeTypes = (): NodeTypeContextType => {
  const context = useContext(NodeTypeContext);
  if (!context) {
    throw new Error("useNodeTypes must be used within a NodeTypeProvider");
  }
  return context;
};
