// src/components/flow-general/components/ConnectionTypeManager.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ConnectionType, ConnectionTypeConfig } from "../types";

/**
 * Context interface for managing connection types
 */
interface ConnectionTypeContextValue {
  // Registry of all connection type configurations
  connectionTypes: Map<string, ConnectionTypeConfig>;

  // Register a new connection type or update existing one
  registerConnectionType: (config: ConnectionTypeConfig) => void;

  // Unregister a connection type by its id
  unregisterConnectionType: (id: string) => void;

  // Get configuration for a specific connection type
  getConnectionType: (id: string) => ConnectionTypeConfig | undefined;

  // Get all registered connection types
  getAllConnectionTypes: () => ConnectionTypeConfig[];

  // Validate if a connection between two types is allowed
  validateConnection: (sourceType: string, targetType: string) => boolean;
}

/**
 * Context for connection type management
 */
const ConnectionTypeContext = createContext<ConnectionTypeContextValue | null>(
  null,
);

/**
 * Hook to access connection type context
 */
export const useConnectionTypes = () => {
  const context = useContext(ConnectionTypeContext);
  if (!context) {
    throw new Error(
      "useConnectionTypes must be used within ConnectionTypeProvider",
    );
  }
  return context;
};

/**
 * Props for ConnectionTypeProvider
 */
interface ConnectionTypeProviderProps {
  children: React.ReactNode;
  initialTypes?: ConnectionTypeConfig[];
}

/**
 * Provider component that manages connection type registry
 * Handles validation of connections between different node types
 */
export const ConnectionTypeProvider: React.FC<ConnectionTypeProviderProps> = ({
  children,
  initialTypes = [],
}) => {
  // Initialize connection types map from initial types
  const [connectionTypes, setConnectionTypes] = useState<
    Map<string, ConnectionTypeConfig>
  >(() => new Map(initialTypes.map((type) => [type.id, type])));

  /**
   * Register or update a connection type configuration
   */
  const registerConnectionType = useCallback((config: ConnectionTypeConfig) => {
    setConnectionTypes((prev) => {
      const next = new Map(prev);
      next.set(config.id, config);
      return next;
    });
  }, []);

  /**
   * Remove a connection type from registry
   */
  const unregisterConnectionType = useCallback((id: string) => {
    setConnectionTypes((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * Retrieve a specific connection type configuration
   */
  const getConnectionType = useCallback(
    (id: string): ConnectionTypeConfig | undefined => {
      return connectionTypes.get(id);
    },
    [connectionTypes],
  );

  /**
   * Get array of all registered connection types
   */
  const getAllConnectionTypes = useCallback((): ConnectionTypeConfig[] => {
    return Array.from(connectionTypes.values());
  }, [connectionTypes]);

  /**
   * Validate if a connection is allowed between source and target types
   * Checks the allowedConnections rules defined in source type config
   */
  const validateConnection = useCallback(
    (sourceType: string, targetType: string): boolean => {
      const sourceConfig = connectionTypes.get(sourceType);

      // If source type not found, deny connection
      if (!sourceConfig) return false;

      // If no rules defined, allow all connections
      if (!sourceConfig.allowedConnections) return true;

      // Check if target type is in allowed list
      return sourceConfig.allowedConnections.includes(targetType);
    },
    [connectionTypes],
  );

  const value: ConnectionTypeContextValue = {
    connectionTypes,
    registerConnectionType,
    unregisterConnectionType,
    getConnectionType,
    getAllConnectionTypes,
    validateConnection,
  };

  return (
    <ConnectionTypeContext.Provider value={value}>
      {children}
    </ConnectionTypeContext.Provider>
  );
};

/**
 * HOC to wrap a component with connection type provider
 */
export const withConnectionTypes = <P extends object>(
  Component: React.ComponentType<P>,
  initialTypes?: ConnectionTypeConfig[],
) => {
  return (props: P) => (
    <ConnectionTypeProvider initialTypes={initialTypes}>
      <Component {...props} />
    </ConnectionTypeProvider>
  );
};
