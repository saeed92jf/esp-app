// src/components/flow-general/utils/registry.ts
/**
 * Dynamic registry for managing custom node types and connection types.
 * This allows runtime registration and retrieval of user-defined types.
 */

import type {
  CustomNodeType,
  CustomConnectionType,
  RegistryState,
} from "../types";

/**
 * Global registry state.
 * In a production app, this should be managed by a state management solution.
 */
let registryState: RegistryState = {
  nodeTypes: new Map(),
  connectionTypes: new Map(),
};

// ==================== Node Type Registry ====================

/**
 * Register a custom node type.
 * Throws if a type with the same ID already exists.
 */
export function registerNodeType(nodeType: CustomNodeType): void {
  if (registryState.nodeTypes.has(nodeType.id)) {
    throw new Error(`Node type with id "${nodeType.id}" already exists`);
  }
  registryState.nodeTypes.set(nodeType.id, nodeType);
}

/**
 * Register multiple node types at once.
 */
export function registerNodeTypes(nodeTypes: CustomNodeType[]): void {
  nodeTypes.forEach(registerNodeType);
}

/**
 * Update an existing node type.
 * Throws if the type doesn't exist.
 */
export function updateNodeType(nodeType: CustomNodeType): void {
  if (!registryState.nodeTypes.has(nodeType.id)) {
    throw new Error(`Node type with id "${nodeType.id}" does not exist`);
  }
  registryState.nodeTypes.set(nodeType.id, nodeType);
}

/**
 * Unregister a node type by ID.
 */
export function unregisterNodeType(nodeTypeId: string): boolean {
  return registryState.nodeTypes.delete(nodeTypeId);
}

/**
 * Get a node type by ID.
 * Returns undefined if not found.
 */
export function getNodeType(nodeTypeId: string): CustomNodeType | undefined {
  return registryState.nodeTypes.get(nodeTypeId);
}

/**
 * Get all registered node types.
 */
export function getAllNodeTypes(): CustomNodeType[] {
  return Array.from(registryState.nodeTypes.values());
}

/**
 * Check if a node type exists.
 */
export function hasNodeType(nodeTypeId: string): boolean {
  return registryState.nodeTypes.has(nodeTypeId);
}

// ==================== Connection Type Registry ====================

/**
 * Register a custom connection type.
 * Throws if a type with the same ID already exists.
 */
export function registerConnectionType(
  connectionType: CustomConnectionType,
): void {
  if (registryState.connectionTypes.has(connectionType.id)) {
    throw new Error(
      `Connection type with id "${connectionType.id}" already exists`,
    );
  }
  registryState.connectionTypes.set(connectionType.id, connectionType);
}

/**
 * Register multiple connection types at once.
 */
export function registerConnectionTypes(
  connectionTypes: CustomConnectionType[],
): void {
  connectionTypes.forEach(registerConnectionType);
}

/**
 * Update an existing connection type.
 * Throws if the type doesn't exist.
 */
export function updateConnectionType(
  connectionType: CustomConnectionType,
): void {
  if (!registryState.connectionTypes.has(connectionType.id)) {
    throw new Error(
      `Connection type with id "${connectionType.id}" does not exist`,
    );
  }
  registryState.connectionTypes.set(connectionType.id, connectionType);
}

/**
 * Unregister a connection type by ID.
 */
export function unregisterConnectionType(connectionTypeId: string): boolean {
  return registryState.connectionTypes.delete(connectionTypeId);
}

/**
 * Get a connection type by ID.
 * Returns undefined if not found.
 */
export function getConnectionType(
  connectionTypeId: string,
): CustomConnectionType | undefined {
  return registryState.connectionTypes.get(connectionTypeId);
}

/**
 * Get all registered connection types.
 */
export function getAllConnectionTypes(): CustomConnectionType[] {
  return Array.from(registryState.connectionTypes.values());
}

/**
 * Check if a connection type exists.
 */
export function hasConnectionType(connectionTypeId: string): boolean {
  return registryState.connectionTypes.has(connectionTypeId);
}

// ==================== Registry Management ====================

/**
 * Clear all registered types (useful for testing or reset).
 */
export function clearRegistry(): void {
  registryState.nodeTypes.clear();
  registryState.connectionTypes.clear();
}

/**
 * Get the current registry state (for debugging or serialization).
 */
export function getRegistryState(): RegistryState {
  return {
    nodeTypes: new Map(registryState.nodeTypes),
    connectionTypes: new Map(registryState.connectionTypes),
  };
}

/**
 * Restore registry state from a previous snapshot.
 */
export function restoreRegistryState(state: RegistryState): void {
  registryState = {
    nodeTypes: new Map(state.nodeTypes),
    connectionTypes: new Map(state.connectionTypes),
  };
}

/**
 * Validate that all node instances reference valid node types.
 */
export function validateNodeReferences(nodeTypeIds: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing = nodeTypeIds.filter((id) => !hasNodeType(id));
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate that all edge instances reference valid connection types.
 */
export function validateConnectionReferences(connectionTypeIds: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing = connectionTypeIds.filter((id) => !hasConnectionType(id));
  return {
    valid: missing.length === 0,
    missing,
  };
}
