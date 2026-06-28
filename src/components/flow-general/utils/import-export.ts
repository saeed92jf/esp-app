// src/components/flow-general/utils/import-export.ts
/**
 * Utilities for importing and exporting diagram definitions as JSON.
 * Handles validation and registry synchronization.
 */

import type { DiagramDefinition } from "../types";
import {
  clearRegistry,
  registerNodeTypes,
  registerConnectionTypes,
  validateNodeReferences,
  validateConnectionReferences,
} from "./registry";

/**
 * Current schema version for diagram definitions.
 */
export const CURRENT_SCHEMA_VERSION = "1.0.0";

/**
 * Result of an import operation.
 */
export interface ImportResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  definition?: DiagramDefinition;
}

/**
 * Export the current diagram to a JSON string.
 */
export function exportDiagram(definition: DiagramDefinition): string {
  const exportData: DiagramDefinition = {
    ...definition,
    version: CURRENT_SCHEMA_VERSION,
    metadata: {
      ...definition.metadata,
      updatedAt: new Date().toISOString(),
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export the current diagram and trigger a download.
 */
export function downloadDiagram(
  definition: DiagramDefinition,
  filename: string = "flow-diagram.json",
): void {
  const jsonString = exportDiagram(definition);
  const blob = new Blob([jsonString], { type: "application/json" });
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
 * Validate a diagram definition structure.
 */
function validateDiagramStructure(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required top-level fields
  if (!data.version) errors.push("Missing required field: version");
  if (!Array.isArray(data.customNodeTypes))
    errors.push("Missing or invalid field: customNodeTypes (must be array)");
  if (!Array.isArray(data.customConnectionTypes))
    errors.push(
      "Missing or invalid field: customConnectionTypes (must be array)",
    );
  if (!Array.isArray(data.nodes))
    errors.push("Missing or invalid field: nodes (must be array)");
  if (!Array.isArray(data.edges))
    errors.push("Missing or invalid field: edges (must be array)");

  // Validate node types structure
  if (Array.isArray(data.customNodeTypes)) {
    data.customNodeTypes.forEach((nt: any, idx: number) => {
      if (!nt.id) errors.push(`Node type at index ${idx} missing id`);
      if (!nt.label) errors.push(`Node type at index ${idx} missing label`);
      if (!nt.shape) errors.push(`Node type at index ${idx} missing shape`);
      if (!nt.color) errors.push(`Node type at index ${idx} missing color`);
      if (!Array.isArray(nt.handles))
        errors.push(`Node type at index ${idx} missing handles array`);
    });
  }

  // Validate connection types structure
  if (Array.isArray(data.customConnectionTypes)) {
    data.customConnectionTypes.forEach((ct: any, idx: number) => {
      if (!ct.id) errors.push(`Connection type at index ${idx} missing id`);
      if (!ct.label)
        errors.push(`Connection type at index ${idx} missing label`);
      if (!ct.pathStyle)
        errors.push(`Connection type at index ${idx} missing pathStyle`);
      if (!ct.color)
        errors.push(`Connection type at index ${idx} missing color`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Import a diagram from a JSON string.
 * Validates structure and registers types in the registry.
 */
export function importDiagram(
  jsonString: string,
  clearExisting: boolean = true,
): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Parse JSON
    const data = JSON.parse(jsonString);

    // Validate structure
    const validation = validateDiagramStructure(data);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Version check
    if (data.version !== CURRENT_SCHEMA_VERSION) {
      warnings.push(
        `Schema version mismatch: expected ${CURRENT_SCHEMA_VERSION}, got ${data.version}`,
      );
    }

    // Clear existing registry if requested
    if (clearExisting) {
      clearRegistry();
    }

    // Register node types
    try {
      registerNodeTypes(data.customNodeTypes);
    } catch (error) {
      errors.push(
        `Failed to register node types: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Register connection types
    try {
      registerConnectionTypes(data.customConnectionTypes);
    } catch (error) {
      errors.push(
        `Failed to register connection types: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Validate node references
    const nodeTypeIds = data.nodes.map((n: any) => n.data?.nodeTypeId);
    const nodeValidation = validateNodeReferences(nodeTypeIds);
    if (!nodeValidation.valid) {
      errors.push(
        `Invalid node type references: ${nodeValidation.missing.join(", ")}`,
      );
    }

    // Validate connection references
    const connectionTypeIds = data.edges.map(
      (e: any) => e.data?.connectionTypeId,
    );
    const connectionValidation =
      validateConnectionReferences(connectionTypeIds);
    if (!connectionValidation.valid) {
      errors.push(
        `Invalid connection type references: ${connectionValidation.missing.join(", ")}`,
      );
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }

    return {
      success: true,
      definition: data as DiagramDefinition,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Import a diagram from a File object (e.g., from file input).
 */
export async function importDiagramFromFile(
  file: File,
  clearExisting: boolean = true,
): Promise<ImportResult> {
  try {
    const text = await file.text();
    return importDiagram(text, clearExisting);
  } catch (error) {
    return {
      success: false,
      errors: [
        `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}
